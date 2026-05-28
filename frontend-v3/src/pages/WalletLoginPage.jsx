import { useState } from 'react'
import { motion } from 'framer-motion'
import WalletConnect from '../components/WalletConnect'

export default function WalletLoginPage({ onLogin }) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleWalletConnect = async (address, signature) => {
    setIsConnecting(true)
    try {
      // Simulate wallet verification
      await new Promise(resolve => setTimeout(resolve, 1000))
      onLogin(address)
    } catch (error) {
      console.error('Login error:', error)
      alert('Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <motion.div 
      className="login-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="login-container">
        <motion.div 
          className="login-header"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1>🐋 WalrusVault</h1>
          <p>Decentralized File Storage with SUI Wallet</p>
        </motion.div>

        <motion.div 
          className="login-content"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="features">
            <div className="feature">
              <span className="icon">🔐</span>
              <h3>Wallet-Only Auth</h3>
              <p>No passwords needed</p>
            </div>
            <div className="feature">
              <span className="icon">🔒</span>
              <h3>End-to-End Encrypted</h3>
              <p>Your files, your keys</p>
            </div>
            <div className="feature">
              <span className="icon">⛓️</span>
              <h3>On-Chain Registry</h3>
              <p>Decentralized metadata</p>
            </div>
          </div>

          <WalletConnect 
            onConnect={handleWalletConnect}
            isLoading={isConnecting}
          />
        </motion.div>

        <motion.div 
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>🏆 Tatum x Walrus Hackathon 2026</p>
        </motion.div>
      </div>
    </motion.div>
  )
}
