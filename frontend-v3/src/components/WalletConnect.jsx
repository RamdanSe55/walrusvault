import { useState } from 'react'
import { motion } from 'framer-motion'

export default function WalletConnect({ onConnect, isLoading }) {
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      // Mock wallet connection (in production, use @suiet/wallet-kit)
      // For now, generate a mock wallet address
      const mockAddress = '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
      
      const mockSignature = 'mock_signature_' + Date.now()
      
      await onConnect(mockAddress, mockSignature)
    } catch (error) {
      console.error('Wallet connection error:', error)
      alert('Failed to connect wallet')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <motion.div 
      className="wallet-connect"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button 
        className="connect-btn"
        onClick={handleConnect}
        disabled={connecting || isLoading}
      >
        {connecting || isLoading ? (
          <>
            <span className="spinner"></span>
            Connecting...
          </>
        ) : (
          <>
            <span className="wallet-icon">👛</span>
            Connect SUI Wallet
          </>
        )}
      </button>
      
      <p className="wallet-hint">
        Connect your SUI wallet to access your encrypted files
      </p>
    </motion.div>
  )
}
