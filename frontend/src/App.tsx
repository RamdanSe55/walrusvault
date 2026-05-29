import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./contexts/theme-context";
import { LanguageProvider } from "./contexts/language-context";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import UploadPage from "./pages/upload";
import DownloadPage from "./pages/download";
import ActivityPage from "./pages/activity";
import ImportDrivePage from "./pages/import-drive";
import NotFound from "./pages/not-found";

const NETWORK_URL = "https://fullnode.mainnet.sui.io";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const networkConfig = {
  mainnet: { url: NETWORK_URL, network: "mainnet" as const },
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
            <WalletProvider autoConnect>
              <AuthProvider>
                <Switch>
                  <Route path="/" component={LoginPage} />
                  <Route path="/dashboard" component={DashboardPage} />
                  <Route path="/upload" component={UploadPage} />
                  <Route path="/download" component={DownloadPage} />
                  <Route path="/activity" component={ActivityPage} />
                  <Route path="/import" component={ImportDrivePage} />
                  <Route component={NotFound} />
                </Switch>
              </AuthProvider>
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
