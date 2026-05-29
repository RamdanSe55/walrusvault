import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/language-context";
import { useImportFromDrive, getListFilesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Search, Import, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  iconLink?: string;
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const DRIVE_SCOPES = "https://www.googleapis.com/auth/drive.readonly";

function formatSize(bytes?: string): string {
  if (!bytes) return "—";
  const n = parseInt(bytes, 10);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

const GOOGLE_MIME_LABELS: Record<string, string> = {
  "application/vnd.google-apps.document": "Google Doc",
  "application/vnd.google-apps.spreadsheet": "Google Sheet",
  "application/vnd.google-apps.presentation": "Google Slides",
  "application/vnd.google-apps.drawing": "Google Drawing",
  "application/vnd.google-apps.folder": "Folder",
};

function isImportable(mimeType: string): boolean {
  return (
    !mimeType.startsWith("application/vnd.google-apps.") ||
    mimeType === "application/vnd.google-apps.document" ||
    mimeType === "application/vnd.google-apps.spreadsheet" ||
    mimeType === "application/vnd.google-apps.presentation" ||
    mimeType === "application/vnd.google-apps.drawing"
  );
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) { resolve(); return; }
    const existing = document.getElementById("google-gsi-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function ImportDrivePage() {
  const { isAuthenticated, walletAddress, getSignature } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { s, lang } = useLanguage();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [search, setSearch] = useState("");
  const [importingId, setImportingId] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<Record<string, "success" | "error">>({});
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [hasClientId] = useState(!!GOOGLE_API_KEY);

  const { mutateAsync: importFromDrive } = useImportFromDrive();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated]);

  const fetchDriveFiles = useCallback(async (token: string) => {
    setIsLoadingFiles(true);
    try {
      const params = new URLSearchParams({
        orderBy: "modifiedTime desc",
        pageSize: "50",
        fields: "files(id,name,mimeType,size,modifiedTime,iconLink)",
        q: "trashed=false",
      });
      const resp = await fetch(
        `https://www.googleapis.com/drive/v3/files?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resp.ok) throw new Error(`${resp.status}`);
      const data = (await resp.json()) as { files: DriveFile[] };
      setDriveFiles(data.files ?? []);
    } catch (err) {
      toast.error(s.importDrive.fetchError, { description: (err as Error).message });
    } finally {
      setIsLoadingFiles(false);
    }
  }, [s]);

  const connectGoogle = useCallback(async () => {
    setGoogleError(null);
    if (!GOOGLE_API_KEY) {
      setGoogleError(
        "VITE_GOOGLE_CLIENT_ID belum dikonfigurasi. Tambahkan env var ini untuk menggunakan integrasi Google Drive."
      );
      return;
    }
    try {
      await loadGoogleScript();
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_API_KEY,
        scope: DRIVE_SCOPES,
        callback: async (response) => {
          if (response.error) { setGoogleError(response.error); return; }
          if (response.access_token) {
            setAccessToken(response.access_token);
            await fetchDriveFiles(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      setGoogleError(s.importDrive.loadGoogleError + (err as Error).message);
    }
  }, [fetchDriveFiles, s]);

  const handleImport = useCallback(
    async (file: DriveFile) => {
      if (!accessToken) return;
      setImportingId(file.id);
      try {
        const sig = getSignature();
        const result = await importFromDrive({
          data: {
            fileId: file.id,
            fileName: file.name,
            mimeType: file.mimeType,
            accessToken,
            walletAddress: walletAddress!,
            signature: sig,
          },
        });
        setImportResults((prev) => ({ ...prev, [file.id]: "success" }));
        queryClient.invalidateQueries({ queryKey: getListFilesQueryKey(walletAddress!) });
        toast.success(s.importDrive.importSuccess(result.fileName ?? file.name), {
          description: s.importDrive.importSuccessDesc(result.source ?? "local"),
        });
      } catch (err) {
        setImportResults((prev) => ({ ...prev, [file.id]: "error" }));
        toast.error(s.importDrive.importFailed(file.name), {
          description: (err as Error).message,
        });
      } finally {
        setImportingId(null);
      }
    },
    [accessToken, walletAddress, getSignature, importFromDrive, queryClient, s]
  );

  const filteredFiles = driveFiles.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const locale = lang === "id" ? "id-ID" : "en-US";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-mono text-2xl font-bold text-foreground">{s.importDrive.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{s.importDrive.subtitle}</p>
        </motion.div>

        {/* How it works */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { step: "1", icon: "🔗", title: s.importDrive.step1 },
            { step: "2", icon: "📋", title: s.importDrive.step2 },
            { step: "3", icon: "🔐", title: s.importDrive.step3 },
            { step: "4", icon: "🦭", title: s.importDrive.step4 },
          ].map((step) => (
            <div
              key={step.step}
              className="bg-card border border-border rounded-xl p-3 text-center"
            >
              <div className="text-xl mb-1">{step.icon}</div>
              <div className="text-xs font-semibold text-foreground">{step.title}</div>
            </div>
          ))}
        </div>

        {!accessToken ? (
          <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-4xl">📂</span>
            </div>
            <div className="text-center">
              <h2 className="font-bold text-lg text-foreground mb-2">
                {s.importDrive.connectTitle}
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                {s.importDrive.connectDesc}
              </p>
            </div>

            {googleError && (
              <div className="w-full bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex gap-3 text-sm text-destructive">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">{s.importDrive.configRequired}</p>
                  <p>{googleError}</p>
                  {!hasClientId && (
                    <p className="mt-2 text-xs opacity-80">
                      {lang === "id" ? "Buat OAuth 2.0 Client ID di" : "Create an OAuth 2.0 Client ID at"}{" "}
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline inline-flex items-center gap-1"
                      >
                        Google Cloud Console <ExternalLink size={10} />
                      </a>{" "}
                      {lang === "id"
                        ? "dan tambahkan VITE_GOOGLE_CLIENT_ID ke environment variables."
                        : "and add VITE_GOOGLE_CLIENT_ID to environment variables."}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button onClick={connectGoogle} className="gap-2 px-8">
              <span>🔗</span>
              {s.importDrive.connectBtn}
            </Button>

            <p className="text-xs text-muted-foreground text-center">{s.importDrive.readOnly}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={s.importDrive.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchDriveFiles(accessToken)}
                disabled={isLoadingFiles}
              >
                {isLoadingFiles ? s.importDrive.loading : s.importDrive.refresh}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground"
                onClick={() => { setAccessToken(null); setDriveFiles([]); }}
              >
                {s.importDrive.disconnect}
              </Button>
            </div>

            {isLoadingFiles ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <p className="text-muted-foreground">
                  {search ? s.importDrive.noMatch : s.importDrive.emptyDrive}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground px-1">
                  {s.importDrive.filesFound(filteredFiles.length)}
                </p>
                {filteredFiles.map((file) => {
                  const status = importResults[file.id];
                  const isImporting = importingId === file.id;
                  const canImport = isImportable(file.mimeType);
                  const typeLabel = GOOGLE_MIME_LABELS[file.mimeType];

                  return (
                    <motion.div
                      key={file.id}
                      layout
                      className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-4 hover:border-primary/30 transition-colors"
                    >
                      {file.iconLink ? (
                        <img src={file.iconLink} alt="" className="w-6 h-6 flex-shrink-0" />
                      ) : (
                        <span className="text-lg flex-shrink-0">📄</span>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {typeLabel ?? file.mimeType.split("/").pop()} · {formatSize(file.size)}
                          {file.modifiedTime && (
                            <>
                              {" "}·{" "}
                              {new Date(file.modifiedTime).toLocaleDateString(locale, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </>
                          )}
                        </p>
                      </div>

                      {status === "success" ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 size={14} />
                          {s.importDrive.imported}
                        </span>
                      ) : status === "error" ? (
                        <span className="flex items-center gap-1.5 text-destructive text-xs font-medium">
                          <XCircle size={14} />
                          {s.importDrive.failed}
                        </span>
                      ) : !canImport ? (
                        <span className="text-xs text-muted-foreground">
                          {s.importDrive.notSupported}
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs flex-shrink-0"
                          disabled={!!importingId}
                          onClick={() => handleImport(file)}
                        >
                          {isImporting ? (
                            <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Import size={12} />
                          )}
                          {isImporting ? s.importDrive.importing : s.importDrive.import}
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
