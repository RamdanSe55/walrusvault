import { TatumSDK, Network, Sui } from "@tatum/sdk";

// Tatum RPC configuration
const TATUM_API_KEY = process.env["TATUM_API_KEY"] || "";
const TATUM_RPC_URL = process.env["TATUM_RPC_URL"] || "https://joe-dc3c9b4f.gateway.tatum.io/";

let tatumClient: Sui | null = null;

/**
 * Initialize Tatum SDK for SUI blockchain
 * Uses Tatum testnet gateway: https://sui-testnet.gateway.tatum.io
 */
export async function initTatumClient(): Promise<Sui> {
  if (tatumClient) {
    return tatumClient;
  }

  try {
    const tatum = await TatumSDK.init<Sui>({
      network: Network.SUI_TESTNET,
      apiKey: {
        v4: TATUM_API_KEY,
      },
      rpcUrl: TATUM_RPC_URL,
    });

    tatumClient = tatum;
    console.log(`✅ Tatum SDK initialized for SUI Testnet (${TATUM_RPC_URL})`);
    return tatum;
  } catch (error) {
    console.error("❌ Failed to initialize Tatum SDK:", error);
    throw new Error("Tatum SDK initialization failed");
  }
}

/**
 * Get wallet balance via Tatum RPC
 */
export async function getWalletBalance(walletAddress: string): Promise<string> {
  const tatum = await initTatumClient();
  
  try {
    const balance = await tatum.rpc.getBalance({
      owner: walletAddress,
    });
    
    return balance.totalBalance || "0";
  } catch (error) {
    console.error("❌ Failed to get wallet balance:", error);
    return "0";
  }
}

/**
 * Get transaction history via Tatum RPC
 */
export async function getTransactionHistory(
  walletAddress: string,
  limit: number = 10
): Promise<any[]> {
  const tatum = await initTatumClient();
  
  try {
    const txs = await tatum.rpc.queryTransactionBlocks({
      filter: {
        FromAddress: walletAddress,
      },
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
      },
      limit,
    });
    
    return txs.data || [];
  } catch (error) {
    console.error("❌ Failed to get transaction history:", error);
    return [];
  }
}

/**
 * Verify wallet owns specific objects via Tatum RPC
 */
export async function verifyWalletOwnership(
  walletAddress: string,
  objectId: string
): Promise<boolean> {
  const tatum = await initTatumClient();
  
  try {
    const object = await tatum.rpc.getObject({
      id: objectId,
      options: {
        showOwner: true,
      },
    });
    
    const owner = object.data?.owner;
    if (typeof owner === "object" && "AddressOwner" in owner) {
      return owner.AddressOwner === walletAddress;
    }
    
    return false;
  } catch (error) {
    console.error("❌ Failed to verify wallet ownership:", error);
    return false;
  }
}

/**
 * Get wallet activity stats via Tatum RPC
 */
export async function getWalletStats(walletAddress: string): Promise<{
  balance: string;
  txCount: number;
  lastActivity: string | null;
}> {
  const tatum = await initTatumClient();
  
  try {
    const [balance, txs] = await Promise.all([
      getWalletBalance(walletAddress),
      getTransactionHistory(walletAddress, 1),
    ]);
    
    const lastActivity = txs.length > 0 
      ? new Date(txs[0].timestampMs).toISOString()
      : null;
    
    return {
      balance,
      txCount: txs.length,
      lastActivity,
    };
  } catch (error) {
    console.error("❌ Failed to get wallet stats:", error);
    return {
      balance: "0",
      txCount: 0,
      lastActivity: null,
    };
  }
}

/**
 * Cleanup Tatum client on shutdown
 */
export async function destroyTatumClient(): Promise<void> {
  if (tatumClient) {
    try {
      await tatumClient.destroy();
      tatumClient = null;
      console.log("✅ Tatum SDK destroyed");
    } catch (error) {
      console.error("❌ Failed to destroy Tatum SDK:", error);
    }
  }
}
