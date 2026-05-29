import { useEffect } from "react";
import { useLocation } from "wouter";
import { ConnectButton } from "@mysten/dapp-kit";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/contexts/theme-context";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isConnecting } = useAuth();
  const [, setLocation] = useLocation();
  const { s, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(hsl(168 100% 50% / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(168 100% 50% / 0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Top-right toggles */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="flex items-center bg-card/80 backdrop-blur-sm rounded-lg p-0.5 border border-border shadow-sm">
          <button
            onClick={() => setLang("id")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              lang === "id"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            ID
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              lang === "en"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            EN
          </button>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-all shadow-sm"
          title={theme === "dark" ? s.layout.lightMode : s.layout.darkMode}
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center gap-10 px-4 max-w-md w-full"
      >
        {/* Logo & Brand */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <path
                  d="M28 8L44 18V38L28 48L12 38V18L28 8Z"
                  stroke="hsl(168 100% 50%)"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M28 16L38 22V34L28 40L18 34V22L28 16Z"
                  fill="hsl(168 100% 50% / 0.2)"
                  stroke="hsl(168 100% 50%)"
                  strokeWidth="1.5"
                />
                <circle cx="28" cy="28" r="5" fill="hsl(168 100% 50%)" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h1 className="font-mono text-4xl font-bold text-primary neon-text tracking-tight">
              WalrusVault
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              {s.login.subtitle}
            </p>
          </div>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "🔐 AES-256",
            "🦭 Walrus Protocol",
            "⛓️ SUI Blockchain",
            "🔒 Zero-knowledge",
          ].map((feat) => (
            <span
              key={feat}
              className="px-3 py-1 rounded-full text-xs font-mono bg-secondary border border-border text-muted-foreground"
            >
              {feat}
            </span>
          ))}
        </div>

        {/* Connect card */}
        <div className="w-full bg-card border border-border rounded-2xl p-8 shadow-lg">
          <h2 className="text-lg font-semibold text-foreground mb-2 text-center">
            {s.login.connectTitle}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {s.login.connectDesc}
          </p>

          {isConnecting ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">{s.login.verifying}</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <ConnectButton
                connectText={s.login.connectBtn}
                className="!bg-primary !text-primary-foreground !font-semibold !rounded-xl !px-8 !py-3 hover:!opacity-90 transition-opacity"
              />
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { icon: "🔗", title: s.login.step1title, desc: s.login.step1desc },
            { icon: "✍️", title: s.login.step2title, desc: s.login.step2desc },
            { icon: "🗄️", title: s.login.step3title, desc: s.login.step3desc },
          ].map((step) => (
            <div
              key={step.title}
              className="bg-secondary/50 border border-border rounded-xl p-3 text-center"
            >
              <div className="text-xl mb-1">{step.icon}</div>
              <div className="text-xs font-semibold text-foreground">{step.title}</div>
              <div className="text-xs text-muted-foreground">{step.desc}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {s.login.footer1}
          <br />
          {s.login.footer2}
        </p>
      </motion.div>
    </div>
  );
}
