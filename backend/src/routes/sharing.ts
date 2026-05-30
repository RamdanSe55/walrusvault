import { Router } from "express";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import {
  grantAccessOnChain,
  revokeAccessOnChain,
  transferFileOnChain,
} from "../lib/tatum-onchain";

const router = Router();

const AUTH_MESSAGE = "WalrusVault access request";

async function verifySignature(
  signature: string,
  claimedAddress: string
): Promise<boolean> {
  if (!signature || !claimedAddress) return false;
  try {
    const messageBytes = new TextEncoder().encode(AUTH_MESSAGE);
    const publicKey = await verifyPersonalMessageSignature(
      messageBytes,
      signature
    );
    return publicKey.toSuiAddress() === claimedAddress;
  } catch {
    return false;
  }
}

/**
 * POST /api/sharing/grant
 * Grant access to another wallet
 */
router.post("/grant", async (req, res) => {
  try {
    const { fileObjectId, granteeAddress, accessLevel, expiresAt, walletAddress, signature } =
      req.body as {
        fileObjectId: string;
        granteeAddress: string;
        accessLevel: number; // 0=read, 1=write, 2=admin
        expiresAt: number; // 0 = never expires
        walletAddress: string;
        signature: string;
      };

    if (
      !fileObjectId ||
      !granteeAddress ||
      accessLevel === undefined ||
      !walletAddress ||
      !signature
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const valid = await verifySignature(signature, walletAddress);
    if (!valid) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    if (accessLevel < 0 || accessLevel > 2) {
      res.status(400).json({ error: "Invalid access level (0-2)" });
      return;
    }

    const result = await grantAccessOnChain(
      fileObjectId,
      granteeAddress,
      accessLevel,
      expiresAt || 0,
      walletAddress
    );

    if (!result.success) {
      res.status(500).json({ error: result.error || "Failed to grant access" });
      return;
    }

    res.json({
      success: true,
      transactionHash: result.transactionHash,
      accessGrantId: result.accessGrantId,
      message: "Access granted successfully",
    });
  } catch (error) {
    console.error("Grant access error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/sharing/revoke
 * Revoke access from wallet
 */
router.post("/revoke", async (req, res) => {
  try {
    const { fileObjectId, granteeAddress, walletAddress, signature } = req.body as {
      fileObjectId: string;
      granteeAddress: string;
      walletAddress: string;
      signature: string;
    };

    if (!fileObjectId || !granteeAddress || !walletAddress || !signature) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const valid = await verifySignature(signature, walletAddress);
    if (!valid) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const result = await revokeAccessOnChain(
      fileObjectId,
      granteeAddress,
      walletAddress
    );

    if (!result.success) {
      res.status(500).json({ error: result.error || "Failed to revoke access" });
      return;
    }

    res.json({
      success: true,
      transactionHash: result.transactionHash,
      message: "Access revoked successfully",
    });
  } catch (error) {
    console.error("Revoke access error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/sharing/transfer
 * Transfer file ownership
 */
router.post("/transfer", async (req, res) => {
  try {
    const { fileObjectId, recipientAddress, walletAddress, signature } = req.body as {
      fileObjectId: string;
      recipientAddress: string;
      walletAddress: string;
      signature: string;
    };

    if (!fileObjectId || !recipientAddress || !walletAddress || !signature) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const valid = await verifySignature(signature, walletAddress);
    if (!valid) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const result = await transferFileOnChain(
      fileObjectId,
      recipientAddress,
      walletAddress
    );

    if (!result.success) {
      res
        .status(500)
        .json({ error: result.error || "Failed to transfer file" });
      return;
    }

    res.json({
      success: true,
      transactionHash: result.transactionHash,
      message: "File transferred successfully",
    });
  } catch (error) {
    console.error("Transfer file error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
