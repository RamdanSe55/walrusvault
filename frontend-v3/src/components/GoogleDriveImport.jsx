import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

function GoogleDriveImport({ walletAddress, onImportSuccess }) {
  const [googleConnected, setGoogleConnected] = useState(false)
  const [files, setFiles] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [signingFile, setSigningFile] = useState(null)

  // Sign with wallet to generate encryption key
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

  const handleConnectGoogle = async () => {
    setError('')
    
    try {
      // Initialize Google API
      if (!window.gapi) {
        setError('Google API not loaded. Please refresh the page.')
        return
      }

      // Load Google Drive API
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: 'YOUR_GOOGLE_API_KEY',
            clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/drive.readonly',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
          })

          const authInstance = window.gapi.auth2.getAuthInstance()
          await authInstance.signIn()

          // Fetch files from Google Drive
          const response = await window.gapi.client.drive.files.list({
            pageSize: 50,
            fields: 'files(id, name, mimeType, size, modifiedTime)',
            q: "trashed=false and mimeType!='application/vnd.google-apps.folder'"
          })

          setFiles(response.result.files || [])
          setGoogleConnected(true)
        } catch (err) {
          setError('Failed to connect to Google Drive: ' + err.message)
        }
      })
    } catch (err) {
      setError('Google API initialization failed')
    }
  }

  const handleFileSelect = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId))
    } else {
      setSelectedFiles([...selectedFiles, fileId])
    }
  }

  const handleImportFiles = async () => {
    if (!selectedFiles.length) {
      setError('Please select at least one file to import')
      return
    }

    setImporting(true)
    setError('')
    setSuccess('')
    setProgress(0)

    try {
      const filesToImport = files.filter(f => selectedFiles.includes(f.id))

      for (let i = 0; i < filesToImport.length; i++) {
        const file = filesToImport[i]
        setSigningFile(file.name)

        // Sign with wallet for each file
        const signatureKey = await signWithWallet(file.name)
        setSigningFile(null)

        // Download file from Google Drive
        const fileContent = await window.gapi.client.drive.files.get({
          fileId: file.id,
          alt: 'media'
        })

        // Create FormData for upload
        const formData = new FormData()
        formData.append('file', new Blob([fileContent.body]), file.name)
        formData.append('walletAddress', walletAddress)
        formData.append('signatureKey', signatureKey)
        formData.append('source', 'google-drive')

        // Upload to Walrus via backend
        await axios.post(
          'http://localhost:3001/api/upload',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )

        // Update progress
        setProgress(Math.round(((i + 1) / filesToImport.length) * 100))

        onImportSuccess({
          fileName: file.name,
          size: file.size,
          source: 'google-drive',
          importedAt: new Date().toISOString()
        })
      }

      setSuccess(`✅ Successfully imported ${filesToImport.length} file(s) to Walrus!`)
      setSelectedFiles([])
      setProgress(0)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Import failed')
    } finally {
      setImporting(false)
      setSigningFile(null)
    }
  }

  const handleDisconnect = () => {
    const authInstance = window.gapi.auth2.getAuthInstance()
    authInstance.signOut()
    setGoogleConnected(false)
    setFiles([])
    setSelectedFiles([])
  }

  return (
    <motion.div
      className="google-drive-import-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="import-card">
        <h2>📥 Import from Google Drive</h2>
        <p className="import-subtitle">
          Transfer your files from Google Drive to Walrus storage with encryption
        </p>

        {!googleConnected ? (
          <motion.div
            className="connect-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="connect-info">
              <p className="info-text">
                🔵 Connect your Google Drive account to import files
              </p>
              <p className="info-subtext">
                Your files will be encrypted and stored on Walrus Protocol
              </p>
            </div>

            <motion.button
              className="connect-google-btn"
              onClick={handleConnectGoogle}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              🔵 Connect Google Drive
            </motion.button>

            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="import-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="google-connected-badge">
              <span className="badge-icon">✅</span>
              <span className="badge-text">Connected to Google Drive</span>
              <button
                className="disconnect-google-btn"
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            </div>

            <div className="files-section">
              <h3>Select Files to Import ({selectedFiles.length} selected)</h3>
              
              {files.length === 0 ? (
                <p className="no-files">No files found in your Google Drive</p>
              ) : (
                <div className="files-list">
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      className={`file-item ${selectedFiles.includes(file.id) ? 'selected' : ''}`}
                      whileHover={{ x: 5 }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleFileSelect(file.id)}
                        className="file-checkbox"
                      />
                      <span className="file-icon">📄</span>
                      <div className="file-info">
                        <p className="file-name">{file.name}</p>
                        <p className="file-meta">
                          {(file.size / 1024).toFixed(2)} KB • Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {selectedFiles.length > 0 && (
              <motion.div
                className="import-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="wallet-key-info">
                  <span>🔑</span>
                  <p>Your wallet will sign each file for encryption — no password needed</p>
                </div>

                {signingFile && (
                  <motion.div
                    className="signing-status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="spinner"></span>
                    Signing {signingFile} with wallet...
                  </motion.div>
                )}

                {importing && progress > 0 && (
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
                    <p className="progress-text">{progress}% imported</p>
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

                <motion.button
                  className="import-btn"
                  onClick={handleImportFiles}
                  disabled={importing}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {importing ? (
                    <>
                      <span className="spinner"></span>
                      Importing...
                    </>
                  ) : (
                    <>
                      🚀 Import {selectedFiles.length} file(s) to Walrus
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default GoogleDriveImport
