import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import FileUpload from '../components/FileUpload'
import GoogleDriveImport from '../components/GoogleDriveImport'
import FileList from '../components/FileList'

function DashboardPage({ walletAddress, onDisconnect }) {
  const [files, setFiles] = useState([])
  const [activeTab, setActiveTab] = useState('upload')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load files from localStorage or API
    const savedFiles = localStorage.getItem('walrusvault_files')
    if (savedFiles) {
      try {
        setFiles(JSON.parse(savedFiles))
      } catch (e) {
        console.error('Failed to load files:', e)
      }
    }
  }, [])

  const handleFileUpload = (fileData) => {
    const updatedFiles = [fileData, ...files]
    setFiles(updatedFiles)
    localStorage.setItem('walrusvault_files', JSON.stringify(updatedFiles))
  }

  const handleDisconnect = () => {
    localStorage.removeItem('sui_wallet_address')
    localStorage.removeItem('walrusvault_files')
    onDisconnect()
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <motion.header
        className="dashboard-header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🔐</span>
            <h1>WalrusVault</h1>
          </div>
        </div>

        <div className="header-center">
          <nav className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              📤 Upload
            </button>
            <button
              className={`nav-tab ${activeTab === 'import' ? 'active' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              📥 Import
            </button>
            <button
              className={`nav-tab ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => setActiveTab('files')}
            >
              📁 My Files
            </button>
            <button
              className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
          </nav>
        </div>

        <div className="header-right">
          <div className="wallet-badge">
            <span className="wallet-status">✅</span>
            <div className="wallet-info-header">
              <p className="wallet-label">Connected Wallet</p>
              <p className="wallet-address">{walletAddress.substring(0, 10)}...{walletAddress.substring(-8)}</p>
            </div>
          </div>
          <button className="disconnect-btn" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Wallet Info Card */}
        <motion.div
          className="wallet-info-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="wallet-status-info">
            <span className="status-indicator">🔗</span>
            <div className="wallet-details">
              <p className="wallet-label">Connected to SUI Testnet</p>
              <p className="wallet-address-full">{walletAddress}</p>
            </div>
          </div>
          <div className="wallet-actions">
            <a href="https://faucet.testnet.sui.io" target="_blank" rel="noopener noreferrer" className="faucet-link">
              💰 Get Testnet SUI
            </a>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          className="tab-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          key={activeTab}
        >
          {activeTab === 'upload' && (
            <FileUpload
              walletAddress={walletAddress}
              onUploadSuccess={handleFileUpload}
            />
          )}

          {activeTab === 'import' && (
            <GoogleDriveImport
              walletAddress={walletAddress}
              onImportSuccess={handleFileUpload}
            />
          )}

          {activeTab === 'files' && (
            <FileList files={files} walletAddress={walletAddress} />
          )}

          {activeTab === 'settings' && (
            <div className="settings-panel">
              <h2>Settings</h2>
              <div className="settings-group">
                <label>Wallet Address</label>
                <p className="settings-value">{walletAddress}</p>
              </div>
              <div className="settings-group">
                <label>Network</label>
                <p className="settings-value">SUI Testnet</p>
              </div>
              <div className="settings-group">
                <label>Storage Provider</label>
                <p className="settings-value">Walrus Protocol</p>
              </div>
              <div className="settings-group">
                <label>API Provider</label>
                <p className="settings-value">Tatum</p>
              </div>
              <div className="settings-group">
                <label>Total Files Stored</label>
                <p className="settings-value">{files.length} file(s)</p>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>WalrusVault © 2026 | Decentralized File Storage on SUI + Walrus | Powered by Tatum API</p>
      </footer>
    </div>
  )
}

export default DashboardPage
