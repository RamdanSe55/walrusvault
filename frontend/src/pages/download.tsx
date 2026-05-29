import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/language-context";
import { useListFiles, useDownloadFile, getListFilesQueryKey } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  Search,
  File,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  CheckCircle2,
  XCircle,
  HardDrive,
  ExternalLink,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return Image;
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return Film;
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext)) return Music;
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return Archive;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return FileText;
  return File;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface DownloadState {
  blobId: string;
  status: "downloading" | "success" | "error";
  message?: string;
  verified?: boolean;
}

export default function DownloadPage() {
  const { isAuthenticated, walletAddress, getSignature } = useAuth();
  const [, setLocation] = useLocation();
  const { s, lang } = useLanguage();

  const [search, setSearch] = useState("");
  const [downloadStates, setDownloadStates] = useState<Record<string, DownloadState>>({});

  const SOURCE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    walrus: { label: "Walrus", icon: "🦭", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    local: { label: lang === "id" ? "Lokal" : "Local", icon: "💾", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    gdrive: { label: "Google Drive", icon: "📂", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  };

  const { data: filesData, isLoading } = useListFiles(walletAddress ?? "", {
    query: { enabled: !!walletAddress, queryKey: ["listFiles", walletAddress ?? ""] },
  });

  const { mutateAsync: downloadFile } = useDownloadFile();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated]);

  const handleDownload = async (blobId: string, fileName: string) => {
    setDownloadStates((prev) => ({ ...prev, [blobId]: { blobId, status: "downloading" } }));
    try {
      const sig = getSignature();
      const result = await downloadFile({
        data: { blobId, walletAddress: walletAddress!, signature: sig },
      });

      const link = document.createElement("a");
      link.href = result.fileData!;
      link.download = result.fileName ?? fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadStates((prev) => ({
        ...prev,
        [blobId]: { blobId, status: "success", verified: result.verified, message: result.sha256Hash },
      }));

      toast.success(
        result.verified
          ? s.download.verifiedToast(result.fileName ?? fileName)
          : s.download.unverifiedToast(result.fileName ?? fileName)
      );

      setTimeout(() => {
        setDownloadStates((prev) => {
          const next = { ...prev };
          delete next[blobId];
          return next;
        });
      }, 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : s.download.failedToast;
      setDownloadStates((prev) => ({ ...prev, [blobId]: { blobId, status: "error", message } }));
      toast.error(s.download.failedToast, { description: message });
      setTimeout(() => {
        setDownloadStates((prev) => {
          const next = { ...prev };
          delete next[blobId];
          return next;
        });
      }, 5000);
    }
  };

  const files = (filesData?.files ?? []).filter((f) =>
    f.fileName.toLowerCase().includes(search.toLowerCase())
  );

  const locale = lang === "id" ? "id-ID" : "en-US";

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-mono text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Download size={16} className="text-primary" />
            </div>
            {s.download.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{s.download.subtitle}</p>
        </motion.div>

        {/* Security notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5 bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3"
        >
          <Shield size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="text-primary font-semibold">{s.download.secureDecrypt}</span>{" "}
            — {s.download.secureDesc}
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={s.download.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* File list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <HardDrive size={28} className="text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">
              {search ? s.download.emptySearch : s.download.emptyVault}
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              {search ? s.download.emptySearchHint : s.download.emptyVaultHint}
            </p>
            {!search && (
              <Button onClick={() => setLocation("/upload")} className="gap-2">
                {s.download.uploadFile}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1">
              {s.download.fileCount(files.length)}
            </p>

            <AnimatePresence mode="popLayout">
              {files.map((file, idx) => {
                const Icon = getFileIcon(file.fileName);
                const srcCfg = SOURCE_CONFIG[file.source] ?? SOURCE_CONFIG["local"]!;
                const dlState = downloadStates[file.blobId];
                const isDownloading = dlState?.status === "downloading";

                return (
                  <motion.div
                    key={file.blobId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`bg-card border rounded-xl p-4 transition-colors ${
                      dlState?.status === "success"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : dlState?.status === "error"
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className="text-sm font-semibold text-foreground truncate"
                            title={file.fileName}
                          >
                            {file.fileName}
                          </p>
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-mono border flex-shrink-0 ${srcCfg.color}`}
                          >
                            {srcCfg.icon} {srcCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatSize(file.size)}</span>
                          <span>·</span>
                          <span>{formatDate(file.uploadedAt, locale)}</span>
                          {file.walrusBlobId && (
                            <>
                              <span>·</span>
                              <a
                                href={`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${file.walrusBlobId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors inline-flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={10} />
                                {s.download.viewWalrus}
                              </a>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                          ID: {file.blobId.slice(0, 24)}...
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {dlState?.status === "success" ? (
                          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 size={16} />
                            <span>
                              {dlState.verified ? s.download.verified : s.download.downloaded}
                            </span>
                          </div>
                        ) : dlState?.status === "error" ? (
                          <div className="flex items-center gap-2 text-destructive text-xs font-medium">
                            <XCircle size={16} />
                            <span>{s.download.failed}</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="gap-2"
                            disabled={isDownloading}
                            onClick={() => handleDownload(file.blobId, file.fileName)}
                          >
                            {isDownloading ? (
                              <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Download size={14} />
                            )}
                            {isDownloading ? s.download.decrypting : s.download.download}
                          </Button>
                        )}
                      </div>
                    </div>

                    {isDownloading && (
                      <div className="mt-3">
                        <Progress value={undefined} className="h-1.5 animate-pulse" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {s.download.downloadingFrom(srcCfg.label)}
                        </p>
                      </div>
                    )}

                    {dlState?.status === "success" && (
                      <div className="mt-3 bg-emerald-500/10 rounded-lg p-2 flex items-center gap-2">
                        <Shield size={12} className="text-emerald-400" />
                        <p className="text-xs text-emerald-400 font-mono truncate">
                          SHA-256: {dlState.message?.slice(0, 32)}...
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
