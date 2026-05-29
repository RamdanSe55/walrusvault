import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  useCurrentAccount,
  useSignPersonalMessage,
  useDisconnectWallet,
} from "@mysten/dapp-kit";

const AUTH_MESSAGE = "WalrusVault access request";

interface AuthContextType {
  walletAddress: string | null;
  isAuthenticated: boolean;
  isConnecting: boolean;
  disconnectWallet: () => void;
  getSignature: () => string;
  connectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutate: disconnect } = useDisconnectWallet();

  const [signature, setSignature] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const walletAddress = account?.address ?? null;

  useEffect(() => {
    if (!account) {
      setSignature(null);
      return;
    }

    const cacheKey = `walrusvault_sig_${account.address}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setSignature(cached);
      return;
    }

    setIsConnecting(true);
    signPersonalMessage({ message: new TextEncoder().encode(AUTH_MESSAGE) })
      .then(({ signature: sig }) => {
        setSignature(sig);
        localStorage.setItem(cacheKey, sig);
      })
      .catch((err) => {
        console.error("Gagal menandatangani pesan auth:", err);
        disconnect();
      })
      .finally(() => setIsConnecting(false));
  }, [account?.address]);

  const disconnectWallet = () => {
    if (account) {
      localStorage.removeItem(`walrusvault_sig_${account.address}`);
    }
    setSignature(null);
    disconnect();
  };

  const getSignature = () => signature ?? "";
  const connectWallet = () => {};

  return (
    <AuthContext.Provider
      value={{
        walletAddress,
        isAuthenticated: !!walletAddress && !!signature,
        isConnecting,
        disconnectWallet,
        getSignature,
        connectWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
