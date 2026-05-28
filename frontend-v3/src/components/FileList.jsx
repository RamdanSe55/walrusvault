import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

function FileList({ walletAddress }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)
  const [error, setError] = useState('')

  // Auto-load files owned by this wallet
  useEffect(() => {
    if (walletAddress) {
      loadFiles()
    }
  }, [walletAddress])

  const loadFiles = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.get(
        `http://localhost:3001/api/files?walletAddress=${walletAddress}`
      )
      if (response.data.success) {
        setFiles(response.data.files || [])
      }
    } catch (err) {
      setError('Failed to load files: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Sign with wallet to decrypt file
  const signWithWallet = async (fileName) => {
    try {
      if (!window.suiWallet) throw new Error('SUI Wallet not found')
      const msgBytes = new TextEncoder().encode(
        `WalrusVault:encrypt:${fileName}:${walletAddress}`
      )
      const { signature } = await window.suiWallet.signMessage({
        message: msgBytes
      })
      return signature
    } catch (err) {
      throw new Error('Wallet signing failed: ' + err.message)
    }
  }

  const handleDownload = async (file) => {
    setDownloading(file.blobId)
    setError('')

    try {
      // Sign with wallet to get decryption key
      const signatureKey = await signWithWallet(file.fileName)

      const response = await axios.post(
        `http://localhost:3001/api/files/download/${file.blobId}`,
        { walletAddress, signatureKey },
        { responseType: 'blob' }
      )

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.fileName || `file_${Date.now()}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Download failed')
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = async (file) => {
    if (!confirm(`Delete ${file.fileName}?`)) return
    try {
      await axios.delete(
        `http://localhost:3001/api/files/${file.blobId}`,
        { data: { walletAddress } }
      )
      setFiles(files.filter(f => f.blobId !== file.blobId))
    } catch (err) {
      setError('Delete failed: ' + err.message)
    }
  }

  if (loading) {
    return (
      <motion.div
        className="file-list-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading your files from SUI blockchain...</p>
        </div>
      </motion.div>
    )
  }

  if (files.length === 0) {
    return (
      <motion.div
        className="file-list-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>No files yet</h3>
          <p>Upload your first file to get started</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="file-list-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="file-list-header">
        <h2>📁 My Files</h2>
        <div className="file-list-meta">
          <span className="file-count">{files.length} file(s)</span>
          <button className="refresh-btn" onClick={loadFiles}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          className="message error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ⚠️ {error}
        </motion.div>
      )}

      <div className="files-grid">
        {files.map((file, index) => (
          <motion.div
            key={file.blobId || index}
            className="file-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
          >
            <div className="file-card-icon">
              {file.mimeType?.includes('image') ? '🖼️' :
               file.mimeType?.includes('pdf') ? '📕' :
               file.mimeType?.includes('video') ? '🎬' :
               file.mimeType?.includes('audio') ? '🎵' : '📄'}
            </div>

            <div className="file-card-details">
              <h3 className="file-title">{file.fileName || 'Untitled'}</h3>
              <p className="file-size-info">
                {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size'}
              </p>
              <p className="file-date">
                {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : ''}
              </p>
              {file.source === 'google-drive' && (
                <span className="source-badge">🔵 Google Drive</span>
              )}
            </div>

            <div className="file-card-actions">
              <motion.button
                className="action-btn download-btn"
                onClick={() => handleDownload(file)}
                disabled={downloading === file.blobId}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {downloading === file.blobId ? (
                  <><span className="spinner"></span> Signing...</>
                ) : (
                  '⬇️ Download'
                )}
              </motion.button>

              <motion.button
                className="action-btn delete-btn"
                onClick={() => handleDelete(file)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🗑️
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default FileList
