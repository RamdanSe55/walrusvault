import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useActivityBadge } from "@/hooks/use-activity-badge";
import { useLanguage } from "@/contexts/language-context";
import { useTheme } from "@/contexts/theme-context";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Upload,
  Download,
  Activity,
  Import,
  LogOut,
  Menu,
  Shield,
  Sun,
  Moon,
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { walletAddress, disconnectWallet } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { newCount } = useActivityBadge(walletAddress ?? undefined);
  const { s, lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const navItems: NavItem[] = [
    { path: "/dashboard", label: s.layout.navDashboard, icon: LayoutDashboard },
    { path: "/upload", label: s.layout.navUpload, icon: Upload },
    { path: "/download", label: s.layout.navDownload, icon: Download },
    {
      path: "/activity",
      label: s.layout.navActivity,
      icon: Activity,
      badge: newCount > 0 ? newCount : undefined,
    },
    { path: "/import", label: s.layout.navImport, icon: Import },
  ];

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "";

  const handleNav = (path: string) => {
    setLocation(path);
    setMobileOpen(false);
  };

  const ToggleControls = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-center gap-2 ${compact ? "" : "w-full"}`}>
      {/* Language toggle */}
      <div className="flex items-center bg-secondary rounded-lg p-0.5 border border-border">
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

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
        title={theme === "dark" ? s.layout.lightMode : s.layout.darkMode}
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Shield size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-mono font-bold text-primary text-sm neon-text">WalrusVault</p>
            <p className="text-xs text-muted-foreground">{s.layout.brand}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon size={16} className={isActive ? "text-primary" : ""} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-mono">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Wallet info, toggles & logout */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Language + Theme toggles */}
        <ToggleControls />

        {/* Wallet */}
        <div className="bg-secondary/50 rounded-xl p-3">
          <p className="text-xs text-muted-foreground mb-1">{s.layout.walletConnected}</p>
          <p className="font-mono text-xs text-primary">{shortAddress}</p>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
          onClick={disconnectWallet}
        >
          <LogOut size={14} />
          {s.layout.logout}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-card border-r border-border md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu size={20} className="text-foreground" />
          </button>
          <p className="font-mono font-bold text-primary text-sm">WalrusVault</p>
          {/* Mobile: compact toggles */}
          <ToggleControls compact />
        </div>

        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
