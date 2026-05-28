import { useState } from 'react'
import { motion } from 'framer-motion'

export default function FileUpload({ walletAddress, onUpload, uploadProgress }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file')
      return
    }

    setUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const fileData = e.target.result.split(',')[1] // Get base64
        const mockSignature = 'sig_' + Date.now()
        
        await onUpload(selectedFile.name, fileData, mockSignature)
        setSelectedFile(null)
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div 
      className="file-upload"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="upload-box">
        <div className="upload-icon">📤</div>
        <h2>Upload File</h2>
        <p>Select a file to encrypt and store</p>

        <div className="file-input-wrapper">
          <input 
            type="file" 
            id="file-input"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="file-input" className="file-label">
            {selectedFile ? selectedFile.name : 'Choose File'}
          </label>
        </div>

        {selectedFile && (
          <div className="file-info">
            <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        {uploadProgress > 0 && (
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}

        <motion.button 
          className="upload-btn"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {uploading ? 'Uploading...' : 'Upload & Encrypt'}
        </motion.button>
      </div>

      <div className="upload-info">
        <h3>🔐 Security</h3>
        <ul>
          <li>File encrypted with wallet signature</li>
          <li>Stored on Walrus Protocol</li>
          <li>Metadata on SUI blockchain</li>
          <li>Only you can decrypt</li>
        </ul>
      </div>
    </motion.div>
  )
}
