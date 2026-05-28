import { useState, useEffect } from 'react'
import WalletLoginPage from './pages/WalletLoginPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user was previously authenticated
    const savedWallet = localStorage.getItem('walletAddress')
    if (savedWallet) {
      setWalletAddress(savedWallet)
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = (address) => {
    setWalletAddress(address)
    setIsAuthenticated(true)
    localStorage.setItem('walletAddress', address)
  }

  const handleLogout = () => {
    setWalletAddress(null)
    setIsAuthenticated(false)
    localStorage.removeItem('walletAddress')
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <WalletLoginPage onLogin={handleLogin} />
      ) : (
        <DashboardPage 
          walletAddress={walletAddress} 
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
