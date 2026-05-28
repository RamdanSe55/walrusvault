import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

function FileUpload({ walletAddress, onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // Sign message with wallet to use as encryption key
  const signWithWallet = async (message) => {
    try {
      if (!window.suiWallet) throw new Error('SUI Wallet not found')
      const msgBytes = new TextEncoder().encode(message)
      const { signature } = await window.suiWallet.signMessage({
        message: msgBytes
      })
      return signature
    } catch (err) {
      throw new Error('Wallet signing failed: ' + err.message)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError('')
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')
    setProgress(0)

    try {
      // Step 1: Sign with wallet to generate encryption key
      const signatureKey = await signWithWallet(
        `WalrusVault:encrypt:${file.name}:${walletAddress}`
      )

      // Step 2: Upload file with wallet signature as encryption key
      const formData = new FormData()
      formData.append('file', file)
      formData.append('walletAddress', walletAddress)
      formData.append('signature', signatureKey)

      const response = await axios.post(
        'http://localhost:3001/api/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setProgress(percentCompleted)
          }
        }
      )

      if (response.data.success) {
        setSuccess(`✅ File uploaded to Walrus!`)
        onUploadSuccess(response.data.file)
        setFile(null)
        setProgress(0)
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(response.data.error || 'Upload failed')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div
      className="file-upload-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="upload-card">
        <h2>📤 Upload File</h2>
        <p className="upload-subtitle">
          Your wallet signs the encryption — no password needed
        </p>

        <div className="wallet-key-info">
          <span>🔑</span>
          <p>Encryption key derived from your wallet signature</p>
        </div>

        <form onSubmit={handleUpload}>
          {/* Drag and Drop Area */}
          <motion.div
            className={`drag-drop-area ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            whileHover={{ scale: 1.01 }}
          >
            {file ? (
              <div className="file-preview">
                <motion.div
                  className="file-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  📄
                </motion.div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  className="change-file-btn"
                  onClick={() => setFile(null)}
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="drag-drop-content">
                <motion.div
                  className="upload-icon"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⬆️
                </motion.div>
                <p className="drag-text">Drag and drop your file here</p>
                <p className="or-text">or</p>
                <label className="file-input-label">
                  Browse Files
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </motion.div>

          {/* Progress Bar */}
          {uploading && progress > 0 && (
            <motion.div
              className="progress-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="progress-text">{progress}% uploaded</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="message error-message"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              className="message success-message"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {success}
            </motion.div>
          )}

          {/* Upload Button */}
          <motion.button
            type="submit"
            className="upload-btn"
            disabled={!file || uploading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                {progress < 50 ? 'Signing with wallet...' : 'Uploading to Walrus...'}
              </>
            ) : (
              <>
                🚀 Upload & Encrypt with Wallet
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}

export default FileUpload
