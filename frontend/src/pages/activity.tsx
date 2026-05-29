import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/language-context";
import { useGetActivityLogs, getGetActivityLogsQueryKey } from "@workspace/api-client-react";
import { useActivityBadge } from "@/hooks/use-activity-badge";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

const ACTION_COLORS: Record<string, string> = {
  upload: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  download: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delete: "bg-red-500/10 text-red-400 border-red-500/20",
  import: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

const SOURCE_ICONS: Record<string, string> = {
  walrus: "🦭",
  local: "💾",
  gdrive: "📂",
};

function formatSize(bytes: number | null): string {
  if (!bytes) return "-";
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

export default function ActivityPage() {
  const { isAuthenticated, walletAddress } = useAuth();
  const [, setLocation] = useLocation();
  const { s, lang } = useLanguage();
  const { markSeen } = useActivityBadge(walletAddress ?? undefined);

  const ACTION_LABELS: Record<string, string> = {
    upload: s.activity.upload,
    download: s.activity.download,
    delete: s.activity.delete,
    import: s.activity.import,
  };

  const { data, isLoading } = useGetActivityLogs(walletAddress ?? "", {
    query: { enabled: !!walletAddress, queryKey: getGetActivityLogsQueryKey(walletAddress ?? "") },
  });

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated]);

  useEffect(() => {
    markSeen();
  }, []);

  const logs = data?.logs ?? [];
  const locale = lang === "id" ? "id-ID" : "en-US";

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-mono text-2xl font-bold text-foreground">{s.activity.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{s.activity.subtitle}</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-muted-foreground">{s.activity.emptyTitle}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.activity.emptyDesc}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
              >
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border flex-shrink-0 ${
                    ACTION_COLORS[log.action] ?? "bg-secondary text-foreground border-border"
                  }`}
                >
                  {ACTION_LABELS[log.action] ?? log.action}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{log.fileName}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {log.blobId.slice(0, 16)}...
                  </p>
                </div>

                <span className="text-sm flex-shrink-0" title={log.source ?? "local"}>
                  {SOURCE_ICONS[log.source ?? "local"] ?? "💾"}
                </span>

                <span className="text-xs text-muted-foreground flex-shrink-0 w-20 text-right font-mono">
                  {formatSize(log.size)}
                </span>

                <span className="text-xs text-muted-foreground flex-shrink-0 w-32 text-right">
                  {formatDate(log.createdAt, locale)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
