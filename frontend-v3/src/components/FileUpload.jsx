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

    // Check file size (max 10MB for mobile compatibility)
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      alert(`File too large. Max size: 10MB. Your file: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`)
      return
    }

    console.log('[FileUpload] Starting upload:', selectedFile.name, 'Size:', selectedFile.size)
    setUploading(true)
    
    const reader = new FileReader()
    
    reader.onerror = (error) => {
      console.error('[FileUpload] FileReader error:', error)
      alert('Failed to read file. Please try again.')
      setUploading(false)
    }
    
    reader.onload = async (e) => {
      try {
        console.log('[FileUpload] File read complete')
        const result = e.target.result
        if (!result || typeof result !== 'string') {
          throw new Error('Invalid file data')
        }
        
        const fileData = result.split(',')[1]
        if (!fileData) {
          throw new Error('Failed to encode file to base64')
        }
        
        console.log('[FileUpload] Base64 encoded, length:', fileData.length)
        const mockSignature = 'sig_' + Date.now()
        
        console.log('[FileUpload] Calling onUpload...')
        await onUpload(selectedFile.name, fileData, mockSignature)
        
        console.log('[FileUpload] Upload complete!')
        setSelectedFile(null)
        setUploading(false)
      } catch (error) {
        console.error('[FileUpload] Upload error:', error)
        alert('Upload failed: ' + (error.message || 'Unknown error'))
        setUploading(false)
      }
    }
    
    reader.readAsDataURL(selectedFile)
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
