import { useState } from 'react'
import { motion } from 'framer-motion'

export default function GoogleDriveImport({ walletAddress, onImport }) {
  const [importing, setImporting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  const handleGoogleDriveAuth = async () => {
    alert('Google Drive integration coming soon!\n\nThis feature will allow you to:\n- Browse your Google Drive files\n- Select files to import\n- Encrypt and store on Walrus\n\nFor now, use the Upload tab.')
  }

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      alert('No files selected')
      return
    }

    setImporting(true)
    try {
      for (const file of selectedFiles) {
        const mockSignature = 'sig_' + Date.now()
        await onImport(file.name, file.data, mockSignature)
      }
      setSelectedFiles([])
      alert('Import complete!')
    } catch (error) {
      console.error('Import error:', error)
      alert('Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <motion.div 
      className="google-drive-import"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="import-box">
        <div className="import-icon">🔗</div>
        <h2>Import from Google Drive</h2>
        <p>Bridge your Web2 files to Web3 storage</p>

        <motion.button 
          className="google-drive-btn"
          onClick={handleGoogleDriveAuth}
          disabled={importing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="google-icon">📁</span>
          Connect Google Drive
        </motion.button>

        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h3>Selected Files ({selectedFiles.length})</h3>
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
            <button 
              className="import-btn"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? 'Importing...' : 'Import to WalrusVault'}
            </button>
          </div>
        )}
      </div>

      <div className="import-info">
        <h3>🌉 Web2 to Web3 Bridge</h3>
        <ul>
          <li>Browse your Google Drive files</li>
          <li>Select files to import</li>
          <li>Files encrypted with wallet signature</li>
          <li>Stored on decentralized Walrus</li>
          <li>Original files remain in Google Drive</li>
        </ul>
      </div>
    </motion.div>
  )
}
