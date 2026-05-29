import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/language-context";
import {
  useListFiles,
  useDownloadFile,
  useDeleteFile,
  useGetStorageStats,
  getListFilesQueryKey,
  getGetStorageStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  File,
  HardDrive,
  Layers,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

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
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const { isAuthenticated, walletAddress, getSignature } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { s, lang } = useLanguage();

  const SOURCE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
    walrus: { label: "Walrus", icon: "🦭", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    local: { label: lang === "id" ? "Lokal" : "Local", icon: "💾", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    gdrive: { label: "Google Drive", icon: "📂", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  };

  const [deleteTarget, setDeleteTarget] = useState<{
    blobId: string;
    fileName: string;
  } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: filesData, isLoading: filesLoading } = useListFiles(walletAddress ?? "", {
    query: { enabled: !!walletAddress, queryKey: getListFilesQueryKey(walletAddress ?? "") },
  });

  const { data: statsData } = useGetStorageStats(walletAddress ?? "", {
    query: { enabled: !!walletAddress, queryKey: getGetStorageStatsQueryKey(walletAddress ?? "") },
  });

  const { mutateAsync: downloadFile } = useDownloadFile();
  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteFile();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated]);

  const handleDownload = async (blobId: string, fileName: string) => {
    setDownloadingId(blobId);
    try {
      const sig = getSignature();
      const result = await downloadFile({
        data: { blobId, walletAddress: walletAddress!, signature: sig },
      });

      const link = document.createElement("a");
      link.href = result.fileData!;
      link.download = fileName;
      link.click();

      toast.success(
        result.verified
          ? s.dashboard.verifiedToast(fileName)
          : s.dashboard.unverifiedToast(fileName),
        { duration: 4000 }
      );
    } catch (err) {
      toast.error(s.dashboard.downloadFailed, { description: (err as Error).message });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const sig = getSignature();
      await deleteFile({
        walletAddress: walletAddress!,
        blobId: deleteTarget.blobId,
        data: { signature: sig },
      });
      queryClient.invalidateQueries({ queryKey: getListFilesQueryKey(walletAddress!) });
      toast.success(s.dashboard.deletedSuccess(deleteTarget.fileName));
    } catch (err) {
      toast.error(s.dashboard.deleteFailed, { description: (err as Error).message });
    } finally {
      setDeleteTarget(null);
    }
  };

  const files = filesData?.files ?? [];
  const stats = statsData;
  const locale = lang === "id" ? "id-ID" : "en-US";

  return (
    <AppLayout>
      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        {[
          {
            label: s.dashboard.totalFiles,
            value: stats ? String(stats.totalFiles) : "—",
            icon: Layers,
            color: "text-primary",
          },
          {
            label: s.dashboard.totalSize,
            value: stats ? formatSize(stats.totalSize) : "—",
            icon: HardDrive,
            color: "text-accent",
          },
          {
            label: s.dashboard.onWalrus,
            value: stats ? `${stats.walrusFiles} ${lang === "id" ? "file" : "files"}` : "—",
            icon: () => <span className="text-base">🦭</span>,
            color: "text-emerald-400",
          },
          {
            label: s.dashboard.local,
            value: stats ? `${stats.localFiles} ${lang === "id" ? "file" : "files"}` : "—",
            icon: () => <span className="text-base">💾</span>,
            color: "text-blue-400",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
            >
              <div className={`flex-shrink-0 ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-mono text-sm font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* File list header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono font-bold text-foreground">
          {s.dashboard.fileVault}{" "}
          {files.length > 0 && (
            <span className="text-muted-foreground font-normal">({files.length})</span>
          )}
        </h2>
        <Button size="sm" onClick={() => setLocation("/upload")} className="gap-2">
          <Upload size={14} />
          {s.dashboard.uploadFile}
        </Button>
      </div>

      {/* File grid */}
      {filesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-2xl"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <HardDrive size={28} className="text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">{s.dashboard.emptyTitle}</h3>
          <p className="text-sm text-muted-foreground mb-6">{s.dashboard.emptyDesc}</p>
          <Button onClick={() => setLocation("/upload")} className="gap-2">
            <Upload size={14} />
            {s.dashboard.uploadFile}
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {files.map((file, idx) => {
              const Icon = getFileIcon(file.fileName);
              const srcCfg = SOURCE_CONFIG[file.source] ?? SOURCE_CONFIG["local"]!;
              const isDownloading = downloadingId === file.blobId;

              return (
                <motion.div
                  key={file.blobId}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate" title={file.fileName}>
                        {file.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatSize(file.size)} · {formatDate(file.uploadedAt, locale)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-mono border ${srcCfg.color}`}>
                      {srcCfg.icon} {srcCfg.label}
                    </span>
                    {file.walrusBlobId && (
                      <a
                        href={`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${file.walrusBlobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={10} />
                        {s.dashboard.viewWalrus}
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-1.5 text-xs"
                      disabled={isDownloading}
                      onClick={() => handleDownload(file.blobId, file.fileName)}
                    >
                      {isDownloading ? (
                        <div className="w-3.5 h-3.5 border border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download size={12} />
                      )}
                      {isDownloading ? s.dashboard.downloading : s.dashboard.download}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:border-destructive/50"
                      onClick={() =>
                        setDeleteTarget({ blobId: file.blobId, fileName: file.fileName })
                      }
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{s.dashboard.deleteTitle}</DialogTitle>
            <DialogDescription>
              {deleteTarget && s.dashboard.deleteDesc(deleteTarget.fileName)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {s.dashboard.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? s.dashboard.deleting : s.dashboard.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
