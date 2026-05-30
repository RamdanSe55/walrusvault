import { Router } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db, filesTable, activityLogsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import { registerFileOnChain, grantAccessOnChain, revokeAccessOnChain, transferFileOnChain } from "../lib/tatum-onchain";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const IMAGE_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  bmp: "image/bmp",
};

const WALRUS_NETWORK = process.env["WALRUS_NETWORK"] ?? "testnet";
const WALRUS_PUBLISHER =
  WALRUS_NETWORK === "mainnet"
    ? "https://publisher.walrus.space"
    : "https://publisher.walrus-testnet.walrus.space";
const WALRUS_AGGREGATOR =
  WALRUS_NETWORK === "mainnet"
    ? "https://aggregator.walrus.space"
    : "https://aggregator.walrus-testnet.walrus.space";
const WALRUS_EPOCHS = parseInt(process.env["WALRUS_EPOCHS"] ?? "5", 10);

const AUTH_MESSAGE = "WalrusVault access request";

async function verifySignature(signature: string, claimedAddress: string): Promise<boolean> {
  if (!signature || !claimedAddress) return false;
  try {
    const messageBytes = new TextEncoder().encode(AUTH_MESSAGE);
    const publicKey = await verifyPersonalMessageSignature(messageBytes, signature);
    return publicKey.toSuiAddress() === claimedAddress;
  } catch {
    return false;
  }
}

function makeKey(walletAddress: string): Buffer {
  return crypto.createHash("sha256").update(walletAddress).digest();
}

function encryptBuffer(buffer: Buffer, walletAddress: string): Buffer {
  const key = makeKey(walletAddress);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

function decryptBuffer(encryptedBuffer: Buffer, walletAddress: string): Buffer {
  const key = makeKey(walletAddress);
  const iv = encryptedBuffer.subarray(0, 16);
  const encrypted = encryptedBuffer.subarray(16);
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

function sha256Hex(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function uploadToWalrus(encryptedBuffer: Buffer): Promise<string | null> {
  try {
    const response = await fetch(
      `${WALRUS_PUBLISHER}/v1/blobs?epochs=${WALRUS_EPOCHS}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: encryptedBuffer,
        signal: AbortSignal.timeout(30_000),
      }
    );

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as {
      newlyCreated?: { blobObject?: { blobId?: string } };
      alreadyCertified?: { blobId?: string };
    };

    return (
      json.newlyCreated?.blobObject?.blobId ??
      json.alreadyCertified?.blobId ??
      null
    );
  } catch {
    return null;
  }
}

async function downloadFromWalrus(walrusBlobId: string): Promise<Buffer | null> {
  try {
    const response = await fetch(
      `${WALRUS_AGGREGATOR}/v1/blobs/${walrusBlobId}`,
      {
        signal: AbortSignal.timeout(30_000),
      }
    );
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

function saveLocally(blobId: string, encryptedBuffer: Buffer): void {
  const encryptedPath = path.join(uploadsDir, `${blobId}.enc`);
  fs.writeFileSync(encryptedPath, encryptedBuffer);
}

function loadLocally(blobId: string): Buffer | null {
  const encryptedPath = path.join(uploadsDir, `${blobId}.enc`);
  if (!fs.existsSync(encryptedPath)) return null;
  return fs.readFileSync(encryptedPath);
}

async function getEncryptedBuffer(
  blobId: string,
  walrusBlobId: string | null | undefined
): Promise<Buffer | null> {
  if (walrusBlobId) {
    const walrusData = await downloadFromWalrus(walrusBlobId);
    if (walrusData) return walrusData;
  }
  return loadLocally(blobId);
}

// ── Upload ────────────────────────────────────────────────────────────────────

router.post("/upload", async (req, res) => {
  try {
    const { fileName, fileData, walletAddress, signature } = req.body as {
      fileName: string;
      fileData: string;
      walletAddress: string;
      signature: string;
    };

    if (!fileName || !fileData || !walletAddress || !signature) {
      res.status(400).json({ error: "Field wajib tidak lengkap" });
      return;
    }

    const valid = await verifySignature(signature, walletAddress);
    if (!valid) {
      res.status(401).json({ error: "Signature tidak valid" });
      return;
    }

    const rawBase64 = fileData.includes(",") ? fileData.split(",")[1] : fileData;
    const fileBuffer = Buffer.from(rawBase64!, "base64");
    const maxSize = 10 * 1024 * 1024;
    if (fileBuffer.length > maxSize) {
      res.status(413).json({
        error: `File terlalu besar. Maks: 10MB. Ukuran: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB`,
      });
      return;
    }

    const sha256Hash = sha256Hex(fileBuffer);
    const encryptedBuffer = encryptBuffer(fileBuffer, walletAddress);
    const blobId = crypto.randomBytes(32).toString("hex");

    const walrusBlobId = await uploadToWalrus(encryptedBuffer);
    const source = walrusBlobId ? "walrus" : "local";

    saveLocally(blobId, encryptedBuffer);

    await db.insert(filesTable).values({
      blobId,
      walletAddress,
      fileName,
      size: fileBuffer.length,
      sha256Hash,
      source,
      walrusBlobId: walrusBlobId ?? null,
    });

    // Register file metadata on-chain
    const onChainResult = await registerFileOnChain(
      sha256Hash,
      walrusBlobId || blobId,
      fileName,
      fileBuffer.length,
      walletAddress
    );

    await db.insert(activityLogsTable).values({
      walletAddress,
      action: "upload",
      fileName,
      blobId,
      size: fileBuffer.length,
      source,
    });

    res.json({
      success: true,
      blobId,
      fileName,
      size: fileBuffer.length,
      sha256Hash,
      message: walrusBlobId
        ? `File berhasil diunggah ke Walrus (${WALRUS_NETWORK})`
        : "File berhasil diunggah ke vault lokal",
      walrusBlobId: walrusBlobId ?? null,
      source,
      onChain: onChainResult.success ? {
        transactionHash: onChainResult.transactionHash,
        fileObjectId: onChainResult.fileObjectId,
      } : null,
    });
  } catch (error) {
    req.log.error({ error }, "Upload error");
    res.status(500).json({ error: (error as Error).message });
  }
});

// ── List files ────────────────────────────────────────────────────────────────

router.get("/files/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params as { walletAddress: string };

    const files = await db
      .select()
      .from(filesTable)
      .where(eq(filesTable.walletAddress, walletAddress));

    const mapped = files.map((f) => ({
      blobId: f.blobId,
      fileName: f.fileName,
      size: f.size,
      sha256Hash: f.sha256Hash ?? null,
      uploadedAt: f.uploadedAt.toISOString(),
      source: f.source ?? "local",
      walrusBlobId: f.walrusBlobId ?? null,
    }));

    res.json({ success: true, files: mapped, count: mapped.length });
  } catch (error) {
    req.log.error({ error }, "List files error");
    res.status(500).json({ error: (error as Error).message });
  }
});

// ── Download ──────────────────────────────────────────────────────────────────

router.post("/download", async (req, res) => {
  try {
    const { blobId, walletAddress, signature } = req.body as {
      blobId: string;
      walletAddress: string;
      signature: string;
    };

    if (!blobId || !walletAddress || !signature) {
      res.status(400).json({ error: "Field wajib tidak lengkap" });
      return;
    }

    const valid = await verifySignature(signature, walletAddress);
    if (!valid) {
      res.status(401).json({ error: "Signature tidak valid" });
      return;
    }

    const [fileRecord] = await db
      .select()
      .from(filesTable)
      .where(and(eq(filesTable.blobId, blobId), eq(filesTable.walletAddress, walletAddress)));

    if (!fileRecord) {
      res.status(404).json({ error: "File tidak ditemukan atau akses ditolak" });
      return;
    }

    const encryptedBuffer = await getEncryptedBuffer(blobId, fileRecord.walrusBlobId);
    if (!encryptedBuffer) {
      res.status(404).json({ error: "File tidak ditemukan di storage" });
      return;
    }

    const decryptedBuffer = decryptBuffer(encryptedBuffer, walletAddress);
    const computedHash = sha256Hex(decryptedBuffer);
    const verified = fileRecord.sha256Hash ? computedHash === fileRecord.sha256Hash : false;

    res.json({
      success: true,
      fileName: fileRecord.fileName,
      fileData: `data:application/octet-stream;base64,${decryptedBuffer.toString("base64")}`,
      size: fileRecord.size,
      sha256Hash: computedHash,
      verified,
      source: fileRecord.source ?? "local",
      walrusBlobId: fileRecord.walrusBlobId ?? null,
    });
  } catch (error) {
    req.log.error({ error }, "Download error");
    res.status(500).json({ error: (error as Error).message });
  }
});

// ── Preview (raw image) ───────────────────────────────────────────────────────

router.get("/preview/:walletAddress/:blobId", async (req, res) => {
  try {
    const { walletAddress, blobId } = req.params as {
      walletAddress: string;
      blobId: string;
    };

    const [fileRecord] = await db
      .select()
      .from(filesTable)
      .where(and(eq(filesTable.blobId, blobId), eq(filesTable.walletAddress, walletAddress)));

    if (!fileRecord) {
      res.status(404).send("Not found");
      return;
    }

    const ext = fileRecord.fileName.split(".").pop()?.toLowerCase() ?? "";
    const mime = IMAGE_MIME[ext];
    if (!mime) {
      res.status(415).send("Not an image");
      return;
    }

    const encryptedBuffer = await getEncryptedBuffer(blobId, fileRecord.walrusBlobId);
    if (!encryptedBuffer) {
      res.status(404).send("File not found");
      return;
    }

    const decryptedBuffer = decryptBuffer(encryptedBuffer, walletAddress);
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "private, max-age=3600");
    res.send(decryptedBuffer);
  } catch (error) {
    req.log.error({ error }, "Preview error");
    res.status(500).send("Internal error");
  }
});

// ── Delete ────────────────────────────────────────────────────────────────────

router.delete("/files/:walletAddress/:blobId", async (req, res) => {
  try {
    const { walletAddress, blobId } = req.params as {
      walletAddress: string;
      blobId: string;
    };
    const { signature } = req.body as { signature: string };

    if (!signature) {
      res.status(400).json({ error: "Signature wajib diisi" });
      return;
    }

    const valid = await verifySignature(signature, walletAddress);
    if (!valid) {
      res.status(401).json({ error: "Signature tidak valid" });
      return;
    }

    const [fileRecord] = await db
      .select()
      .from(filesTable)
      .where(and(eq(filesTable.blobId, blobId), eq(filesTable.walletAddress, walletAddress)));

    if (!fileRecord) {
      res.status(404).json({ error: "File tidak ditemukan atau akses ditolak" });
      return;
    }

    await db.insert(activityLogsTable).values({
      walletAddress,
      action: "delete",
      fileName: fileRecord.fileName,
      blobId: fileRecord.blobId,
      size: fileRecord.size,
      source: fileRecord.source ?? "local",
    });

    await db
      .delete(filesTable)
      .where(and(eq(filesTable.blobId, blobId), eq(filesTable.walletAddress, walletAddress)));

    const localPath = path.join(uploadsDir, `${blobId}.enc`);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    res.json({ success: true, message: "File berhasil dihapus" });
  } catch (error) {
    req.log.error({ error }, "Delete error");
    res.status(500).json({ error: (error as Error).message });
  }
});

// ── Stats ─────────────────────────────────────────────────────────────────────

router.get("/stats/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params as { walletAddress: string };

    const files = await db
      .select()
      .from(filesTable)
      .where(eq(filesTable.walletAddress, walletAddress));

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const dates = files.map((f) => f.uploadedAt.toISOString()).sort();
    const walrusFiles = files.filter((f) => f.source === "walrus").length;
    const localFiles = files.length - walrusFiles;

    res.json({
      success: true,
      totalFiles: files.length,
      totalSize,
      totalSizeMb: parseFloat((totalSize / 1024 / 1024).toFixed(2)),
      oldestUpload: dates[0] ?? null,
      newestUpload: dates[dates.length - 1] ?? null,
      walrusFiles,
      localFiles,
    });
  } catch (error) {
    req.log.error({ error }, "Stats error");
    res.status(500).json({ error: (error as Error).message });
  }
});

// ── Activity Logs ─────────────────────────────────────────────────────────────

router.get("/logs/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params as { walletAddress: string };
    const limit = Math.min(parseInt(String(req.query["limit"] ?? "50"), 10) || 50, 200);

    const logs = await db
      .select()
      .from(activityLogsTable)
      .where(eq(activityLogsTable.walletAddress, walletAddress))
      .orderBy(desc(activityLogsTable.createdAt))
      .limit(limit);

    const mapped = logs.map((l) => ({
      id: l.id,
      action: l.action,
      fileName: l.fileName,
      blobId: l.blobId,
      size: l.size ?? null,
      createdAt: l.createdAt.toISOString(),
      source: l.source ?? "local",
    }));

    res.json({ success: true, logs: mapped, count: mapped.length });
  } catch (error) {
    req.log.error({ error }, "Activity logs error");
    res.status(500).json({ error: (error as Error).message });
  }
});

// ── Google Drive Import ───────────────────────────────────────────────────────

router.post("/drive/import", async (req, res) => {
  try {
    const { fileId, fileName, mimeType, accessToken, walletAddress, signature } = req.body as {
      fileId: string;
      fileName: string;
      mimeType: string;
      accessToken: string;
      walletAddress: string;
      signature: string;
    };

    if (!fileId || !fileName || !mimeType || !accessToken || !walletAddress || !signature) {
      res.status(400).json({ error: "Field wajib tidak lengkap" });
      return;
    }

    const valid = await verifySignature(signature, walletAddress);
    if (!valid) {
      res.status(401).json({ error: "Signature tidak valid" });
      return;
    }

    const exportMimeMap: Record<string, { mime: string; ext: string }> = {
      "application/vnd.google-apps.document": { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ext: ".docx" },
      "application/vnd.google-apps.spreadsheet": { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: ".xlsx" },
      "application/vnd.google-apps.presentation": { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", ext: ".pptx" },
      "application/vnd.google-apps.drawing": { mime: "image/png", ext: ".png" },
    };

    let downloadUrl: string;
    let finalFileName = fileName;
    const exportInfo = exportMimeMap[mimeType];

    if (exportInfo) {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportInfo.mime)}`;
      if (!finalFileName.endsWith(exportInfo.ext)) {
        finalFileName = finalFileName + exportInfo.ext;
      }
    } else {
      downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    }

    const driveResponse = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(60_000),
    });

    if (!driveResponse.ok) {
      const errText = await driveResponse.text().catch(() => "unknown");
      req.log.error({ status: driveResponse.status, errText }, "Drive download failed");
      res.status(401).json({ error: `Gagal mengunduh dari Google Drive: ${driveResponse.status}` });
      return;
    }

    const arrayBuffer = await driveResponse.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const maxSize = 10 * 1024 * 1024;
    if (fileBuffer.length > maxSize) {
      res.status(413).json({
        error: `File terlalu besar. Maks: 10MB. Ukuran: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB`,
      });
      return;
    }

    const sha256Hash = sha256Hex(fileBuffer);
    const encryptedBuffer = encryptBuffer(fileBuffer, walletAddress);
    const blobId = crypto.randomBytes(32).toString("hex");

    const walrusBlobId = await uploadToWalrus(encryptedBuffer);
    const source = walrusBlobId ? "walrus" : "local";

    saveLocally(blobId, encryptedBuffer);

    await db.insert(filesTable).values({
      blobId,
      walletAddress,
      fileName: finalFileName,
      size: fileBuffer.length,
      sha256Hash,
      source,
      walrusBlobId: walrusBlobId ?? null,
    });

    await db.insert(activityLogsTable).values({
      walletAddress,
      action: "import",
      fileName: finalFileName,
      blobId,
      size: fileBuffer.length,
      source,
    });

    res.json({
      success: true,
      blobId,
      fileName: finalFileName,
      size: fileBuffer.length,
      sha256Hash,
      message: walrusBlobId
        ? `File berhasil diimpor dari Google Drive ke Walrus (${WALRUS_NETWORK})`
        : "File berhasil diimpor dari Google Drive ke vault lokal",
      walrusBlobId: walrusBlobId ?? null,
      source,
    });
  } catch (error) {
    req.log.error({ error }, "Drive import error");
    res.status(500).json({ error: (error as Error).message });
  }
});

// ── Walrus status ─────────────────────────────────────────────────────────────

router.get("/walrus/status", async (_req, res) => {
  try {
    const response = await fetch(`${WALRUS_AGGREGATOR}/v1/info`, {
      signal: AbortSignal.timeout(8_000),
    });
    const ok = response.ok;
    res.json({
      available: ok,
      network: WALRUS_NETWORK,
      publisher: WALRUS_PUBLISHER,
      aggregator: WALRUS_AGGREGATOR,
    });
  } catch {
    res.json({
      available: false,
      network: WALRUS_NETWORK,
      publisher: WALRUS_PUBLISHER,
      aggregator: WALRUS_AGGREGATOR,
    });
  }
});

export default router;
