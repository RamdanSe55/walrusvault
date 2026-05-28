import { useState } from 'react'
import { motion } from 'framer-motion'

export default function FileList({ files, loading, walletAddress, onDelete }) {
  const [downloading, setDownloading] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const handleDownload = async (file) => {
    setDownloading(file.blobId)
    try {
      const mockSignature = 'sig_' + Date.now()
      
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blobId: file.blobId,
          walletAddress,
          signature: mockSignature
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Create download link
        const link = document.createElement('a')
        link.href = `data:application/octet-stream;base64,${data.fileData}`
        link.download = data.fileName
        link.click()
      } else {
        alert('Download failed: ' + data.error)
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Download failed')
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = async (file) => {
    if (!confirm(`Delete ${file.fileName}?`)) return

    setDeleting(file.blobId)
    try {
      const mockSignature = 'sig_' + Date.now()
      await onDelete(file.blobId, mockSignature)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="file-list-loading">
        <div className="spinner"></div>
        <p>Loading files...</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <motion.div 
        className="file-list-empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="empty-icon">📂</div>
        <h3>No files yet</h3>
        <p>Upload your first file to get started</p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="file-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="file-list-header">
        <h2>My Files ({files.length})</h2>
      </div>

      <div className="files-grid">
        {files.map((file, index) => (
          <motion.div 
            key={file.blobId}
            className="file-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="file-icon">📄</div>
            <div className="file-details">
              <h3 className="file-name">{file.fileName}</h3>
              <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
              <p className="file-date">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="file-actions">
              <motion.button
                className="action-btn download"
                onClick={() => handleDownload(file)}
                disabled={downloading === file.blobId}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {downloading === file.blobId ? '⏳' : '⬇️'}
              </motion.button>

              <motion.button
                className="action-btn delete"
                onClick={() => handleDelete(file)}
                disabled={deleting === file.blobId}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {deleting === file.blobId ? '⏳' : '🗑️'}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
