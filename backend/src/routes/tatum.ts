import { Router } from "express";
import { getWalletBalance, getWalletStats, getTransactionHistory } from "../lib/tatum";

const router = Router();

/**
 * GET /api/tatum/balance/:walletAddress
 * Get wallet balance via Tatum RPC
 */
router.get("/balance/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }
    
    const balance = await getWalletBalance(walletAddress);
    
    return res.json({
      success: true,
      walletAddress,
      balance,
    });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch wallet balance",
    });
  }
});

/**
 * GET /api/tatum/stats/:walletAddress
 * Get wallet activity stats via Tatum RPC
 */
router.get("/stats/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }
    
    const stats = await getWalletStats(walletAddress);
    
    return res.json({
      success: true,
      walletAddress,
      stats,
    });
  } catch (error) {
    console.error("Error fetching wallet stats:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch wallet stats",
    });
  }
});

/**
 * GET /api/tatum/transactions/:walletAddress
 * Get transaction history via Tatum RPC
 */
router.get("/transactions/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }
    
    const transactions = await getTransactionHistory(walletAddress, limit);
    
    return res.json({
      success: true,
      walletAddress,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch transactions",
    });
  }
});

export default router;
