import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/language-context";
import { useUploadFile, getListFilesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface UploadState {
  status: "idle" | "reading" | "uploading" | "success" | "error";
  progress: number;
  message: string;
  fileName?: string;
  blobId?: string;
  source?: string;
  walrusBlobId?: string | null;
  size?: number;
}

export default function UploadPage() {
  const { isAuthenticated, walletAddress, getSignature } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { s } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [state, setState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    message: "",
  });

  const { mutateAsync: uploadFile } = useUploadFile();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
  }, [isAuthenticated]);

  const processFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_SIZE_BYTES) {
        toast.error(s.upload.tooBig(MAX_SIZE_MB));
        return;
      }

      setState({ status: "reading", progress: 10, message: s.upload.reading });

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target!.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setState({ status: "uploading", progress: 40, message: s.upload.encrypting });

        const sig = getSignature();
        const result = await uploadFile({
          data: {
            fileName: file.name,
            fileData: base64,
            walletAddress: walletAddress!,
            signature: sig,
          },
        });

        setState({
          status: "success",
          progress: 100,
          message: result.message ?? "",
          fileName: result.fileName,
          blobId: result.blobId,
          source: result.source,
          walrusBlobId: result.walrusBlobId,
          size: result.size,
        });

        queryClient.invalidateQueries({ queryKey: getListFilesQueryKey(walletAddress!) });
        toast.success(s.upload.uploadedSuccess(result.fileName ?? file.name), {
          description:
            result.source === "walrus" ? s.upload.savedWalrus : s.upload.savedLocal,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : s.upload.uploadFailed;
        setState({ status: "error", progress: 0, message });
        toast.error(s.upload.uploadFailed, { description: message });
      }
    },
    [walletAddress, getSignature, uploadFile, queryClient, s]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const reset = () => {
    setState({ status: "idle", progress: 0, message: "" });
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-mono text-2xl font-bold text-foreground">{s.upload.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{s.upload.subtitle}</p>
        </motion.div>

        {/* How encryption works */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { step: "1", icon: "📁", title: s.upload.step1title, desc: s.upload.step1desc(MAX_SIZE_MB) },
            { step: "2", icon: "🔐", title: s.upload.step2title, desc: s.upload.step2desc },
            { step: "3", icon: "🦭", title: s.upload.step3title, desc: s.upload.step3desc },
          ].map((step) => (
            <div
              key={step.step}
              className="bg-card border border-border rounded-xl p-3 text-center relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-xs font-mono font-bold">{step.step}</span>
              </div>
              <div className="text-2xl mb-1">{step.icon}</div>
              <p className="text-xs font-semibold text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Drop zone / states */}
        <AnimatePresence mode="wait">
          {state.status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={dropRef}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`bg-card border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-card/80"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragging ? "bg-primary/20" : "bg-primary/10"
                }`}
              >
                <Upload size={28} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  {isDragging ? s.upload.dropRelease : s.upload.dropPrompt}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {s.upload.dropSupported(MAX_SIZE_MB)}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </motion.div>
          )}

          {(state.status === "reading" || state.status === "uploading") && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center w-full">
                <p className="font-semibold text-foreground mb-3">{state.message}</p>
                <Progress value={state.progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{state.progress}%</p>
              </div>
            </motion.div>
          )}

          {state.status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-emerald-500/20 rounded-2xl p-8 flex flex-col items-center gap-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-lg">{s.upload.successTitle}</p>
                <p className="text-sm text-muted-foreground mt-1">{state.message}</p>
              </div>

              <div className="w-full bg-secondary/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.upload.fileLbl}</span>
                  <span className="font-mono text-foreground truncate max-w-[60%]">
                    {state.fileName}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.upload.sizeLbl}</span>
                  <span className="font-mono text-foreground">
                    {state.size ? `${(state.size / 1024).toFixed(1)} KB` : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.upload.storageLbl}</span>
                  <span className="flex items-center gap-1.5 font-mono text-foreground">
                    {state.source === "walrus" ? (
                      <>🦭 {s.upload.walrusNet}</>
                    ) : (
                      <>💾 {s.upload.localLbl}</>
                    )}
                  </span>
                </div>
                {state.walrusBlobId && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.upload.blobId}</span>
                    <span
                      className="font-mono text-primary truncate max-w-[60%]"
                      title={state.walrusBlobId}
                    >
                      {state.walrusBlobId.slice(0, 20)}...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={reset}>
                  {s.upload.uploadAgain}
                </Button>
                <Button className="flex-1" onClick={() => setLocation("/dashboard")}>
                  {s.upload.viewVault}
                </Button>
              </div>
            </motion.div>
          )}

          {state.status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card border border-destructive/20 rounded-2xl p-10 flex flex-col items-center gap-5"
            >
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <XCircle size={32} className="text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">{s.upload.errorTitle}</p>
                <p className="text-sm text-destructive mt-1">{state.message}</p>
              </div>
              <Button onClick={reset} variant="outline">
                {s.upload.tryAgain}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security notice */}
        <div className="mt-6 bg-secondary/30 border border-border rounded-xl p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground text-sm">{s.upload.encTitle}</p>
          <p>{s.upload.encLine1}</p>
          <p>{s.upload.encLine2}</p>
          <p>{s.upload.encLine3}</p>
          <p>{s.upload.encLine4}</p>
        </div>
      </div>
    </AppLayout>
  );
}
