import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import FileUpload from '../components/FileUpload'
import FileList from '../components/FileList'
import GoogleDriveImport from '../components/GoogleDriveImport'

export default function DashboardPage({ walletAddress, onLogout, mockBackend }) {
  const [activeTab, setActiveTab] = useState('files')
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    loadFiles()
  }, [walletAddress])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const data = await mockBackend.listFiles(walletAddress)
      if (data.success) {
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Failed to load files:', error)
      alert('Failed to load files: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (fileName, fileData, signature) => {
    try {
      setUploadProgress(30)
      const data = await mockBackend.upload(fileName, fileData, walletAddress, signature)
      
      setUploadProgress(70)
      if (data.success) {
        setUploadProgress(100)
        await loadFiles()
        setTimeout(() => setUploadProgress(0), 1000)
        alert('File uploaded successfully!')
      } else {
        alert('Upload failed: ' + data.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed: ' + error.message)
      setUploadProgress(0)
    }
  }

  const handleFileDelete = async (blobId, signature) => {
    try {
      const data = await mockBackend.deleteFile(blobId, walletAddress, signature)
      if (data.success) {
        await loadFiles()
        alert('File deleted successfully!')
      } else {
        alert('Delete failed: ' + data.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete failed: ' + error.message)
    }
  }

  return (
    <motion.div 
      className="dashboard-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🐋 WalrusVault</h1>
          <p className="wallet-info">Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          📁 My Files
        </button>
        <button 
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          ⬆️ Upload
        </button>
        <button 
          className={`tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          🔗 Import
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'files' && (
          <FileList 
            files={files}
            loading={loading}
            walletAddress={walletAddress}
            onDelete={handleFileDelete}
          />
        )}

        {activeTab === 'upload' && (
          <FileUpload 
            walletAddress={walletAddress}
            onUpload={handleFileUpload}
            uploadProgress={uploadProgress}
          />
        )}

        {activeTab === 'import' && (
          <GoogleDriveImport 
            walletAddress={walletAddress}
            onImport={handleFileUpload}
          />
        )}
      </div>
    </motion.div>
  )
}
