import { useState, useEffect } from 'react'
import WalletLoginPage from './pages/WalletLoginPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  const [walletAddress, setWalletAddress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if wallet is already connected (from localStorage)
    const savedWallet = localStorage.getItem('sui_wallet_address')
    if (savedWallet) {
      setWalletAddress(savedWallet)
    }
    setLoading(false)
  }, [])

  const handleWalletConnect = (address) => {
    setWalletAddress(address)
    localStorage.setItem('sui_wallet_address', address)
  }

  const handleWalletDisconnect = () => {
    setWalletAddress(null)
    localStorage.removeItem('sui_wallet_address')
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    )
  }

  return (
    <div className="app">
      {!walletAddress ? (
        <WalletLoginPage onConnect={handleWalletConnect} />
      ) : (
        <DashboardPage walletAddress={walletAddress} onDisconnect={handleWalletDisconnect} />
      )}
    </div>
  )
}

export default App
