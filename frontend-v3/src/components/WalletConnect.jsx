import { useState } from 'react'
import { motion } from 'framer-motion'

function WalletConnect({ onConnect, onDisconnect, isConnected, address }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConnectWallet = async () => {
    setLoading(true)
    setError('')

    try {
      // Check if Sui Wallet extension is installed
      if (!window.suiWallet) {
        setError('SUI Wallet extension not found. Please install it.')
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
          setError('Please switch to SUI Testnet in your wallet')
          setLoading(false)
          return
        }

        onConnect(account.address)
      } else {
        setError('No accounts found in wallet')
      }
    } catch (err) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = () => {
    onDisconnect()
  }

  if (isConnected) {
    return (
      <motion.div
        className="wallet-connected"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="wallet-address-display">
          <span className="address-label">Connected:</span>
          <span className="address-value">
            {address.substring(0, 10)}...{address.substring(-8)}
          </span>
        </div>
        <button
          className="disconnect-wallet-btn"
          onClick={handleDisconnect}
        >
          Disconnect
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="wallet-connect-container"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
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
            <span className="wallet-icon">🔗</span>
            Connect SUI Wallet
          </>
        )}
      </motion.button>

      {error && (
        <motion.div
          className="wallet-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚠️ {error}
        </motion.div>
      )}

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
  )
}

export default WalletConnect
