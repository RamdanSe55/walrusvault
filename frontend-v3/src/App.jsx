import { useState, useEffect } from 'react'
import WalletLoginPage from './pages/WalletLoginPage'
import DashboardPage from './pages/DashboardPage'

// Mock backend using localStorage
const mockBackend = {
  async upload(fileName, fileData, walletAddress, signature) {
    const blobId = 'blob_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const fileRecord = {
      blobId,
      fileName,
      fileData, // Store encrypted data
      walletAddress,
      signature,
      size: Math.round(fileData.length * 0.75), // Approximate original size
      uploadedAt: new Date().toISOString()
    }
    
    // Get existing files
    const existingFiles = JSON.parse(localStorage.getItem('walrusvault_files') || '{}')
    if (!existingFiles[walletAddress]) {
      existingFiles[walletAddress] = []
    }
    existingFiles[walletAddress].push(fileRecord)
    localStorage.setItem('walrusvault_files', JSON.stringify(existingFiles))
    
    return { success: true, blobId, fileName, size: fileRecord.size }
  },

  async listFiles(walletAddress) {
    const allFiles = JSON.parse(localStorage.getItem('walrusvault_files') || '{}')
    const userFiles = allFiles[walletAddress] || []
    return {
      success: true,
      files: userFiles.map(f => ({
        blobId: f.blobId,
        fileName: f.fileName,
        size: f.size,
        uploadedAt: f.uploadedAt
      })),
      count: userFiles.length
    }
  },

  async download(blobId, walletAddress, signature) {
    const allFiles = JSON.parse(localStorage.getItem('walrusvault_files') || '{}')
    const userFiles = allFiles[walletAddress] || []
    const file = userFiles.find(f => f.blobId === blobId)
    
    if (!file) {
      return { success: false, error: 'File not found' }
    }
    
    return {
      success: true,
      fileName: file.fileName,
      fileData: file.fileData,
      size: file.size
    }
  },

  async deleteFile(blobId, walletAddress, signature) {
    const allFiles = JSON.parse(localStorage.getItem('walrusvault_files') || '{}')
    if (!allFiles[walletAddress]) {
      return { success: false, error: 'File not found' }
    }
    
    allFiles[walletAddress] = allFiles[walletAddress].filter(f => f.blobId !== blobId)
    localStorage.setItem('walrusvault_files', JSON.stringify(allFiles))
    
    return { success: true, message: 'File deleted successfully' }
  }
}

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
          mockBackend={mockBackend}
        />
      )}
    </div>
  )
}

// Export mockBackend for use in components
export { mockBackend }
