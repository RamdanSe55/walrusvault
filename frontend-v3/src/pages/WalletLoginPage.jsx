import { useState } from 'react'
import { motion } from 'framer-motion'

function WalletLoginPage({ onConnect }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnectWallet = async () => {
    setLoading(true)
    setError('')

    try {
      // Check if Sui Wallet extension is installed
      if (!window.suiWallet) {
        setError('SUI Wallet extension not found. Please install it from https://chrome.google.com/webstore')
        setLoading(false)
        return
      }

      // Request wallet connection
      const accounts = await window.suiWallet.getAccounts()
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0]
        
        // Verify it's testnet
        const network = await window.suiWallet.getNetwork()
        
        if (network.name !== 'testnet') {
          setError('Please switch to SUI Testnet in your wallet settings')
          setLoading(false)
          return
        }

        // Successfully connected
        onConnect(account.address)
      } else {
        setError('No accounts found in wallet. Please create an account first.')
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wallet-login-page">
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="login-logo"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <div className="logo-icon">🔐</div>
          <h1>WalrusVault</h1>
          <p>Decentralized File Storage on SUI + Walrus</p>
        </motion.div>

        <motion.div
          className="login-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2>Connect Your Wallet</h2>
          <p className="login-subtitle">Connect your SUI Testnet wallet to continue</p>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          <motion.button
            className="connect-wallet-btn"
            onClick={handleConnectWallet}
            disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Connecting...
              </>
            ) : (
              <>
                🔗 Connect SUI Wallet
              </>
            )}
          </motion.button>

          <div className="wallet-info">
            <p className="info-title">Supported Wallets:</p>
            <ul className="wallet-list">
              <li>🔐 Sui Wallet</li>
              <li>🦊 Ethos Wallet</li>
              <li>💼 Ledger (via Sui Wallet)</li>
            </ul>
            <p className="network-info">
              Network: <strong>SUI Testnet</strong>
            </p>
            <p className="faucet-info">
              Need testnet SUI? Get it from the <a href="https://faucet.testnet.sui.io" target="_blank" rel="noopener noreferrer">SUI Faucet</a>
            </p>
          </div>
        </motion.div>

        <motion.div
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Powered by SUI Blockchain + Walrus Storage + Tatum API</p>
          <p className="footer-links">
            <a href="https://github.com/walrusvault" target="_blank" rel="noopener noreferrer">GitHub</a>
            <span>•</span>
            <a href="https://docs.walrusvault.io" target="_blank" rel="noopener noreferrer">Docs</a>
            <span>•</span>
            <a href="https://discord.gg/walrusvault" target="_blank" rel="noopener noreferrer">Discord</a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default WalletLoginPage
