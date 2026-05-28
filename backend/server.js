import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' })); // Allow up to 15MB JSON payload (10MB file + base64 overhead)

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Mock Walrus storage (for development)
const mockWalrusStorage = new Map();

// Mock SUI registry (for development)
const mockSuiRegistry = new Map();

// Helper: Verify wallet signature
function verifySignature(message, signature, publicKey) {
  // In production, use @mysten/sui.js to verify
  // For now, mock verification
  return signature && publicKey && signature.length > 10;
}

// Helper: Encrypt file with wallet signature
function encryptFile(buffer, signature) {
  const key = crypto.createHash('sha256').update(signature).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

// Helper: Decrypt file with wallet signature
function decryptFile(encryptedBuffer, signature) {
  const key = crypto.createHash('sha256').update(signature).digest();
  const iv = encryptedBuffer.slice(0, 16);
  const encrypted = encryptedBuffer.slice(16);
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload file
app.post('/api/upload', async (req, res) => {
  try {
    const { fileName, fileData, walletAddress, signature } = req.body;

    if (!fileName || !fileData || !walletAddress || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Decode base64 file data
    const fileBuffer = Buffer.from(fileData, 'base64');

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (fileBuffer.length > maxSize) {
      return res.status(413).json({ 
        error: `File too large. Max size: 10MB. Your file: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB` 
      });
    }

    // Verify signature
    if (!verifySignature(fileName, signature, walletAddress)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Encrypt file with wallet signature
    const encryptedBuffer = encryptFile(fileBuffer, signature);

    // Generate blob ID
    const blobId = crypto.randomBytes(32).toString('hex');

    // Save encrypted file locally
    const encryptedPath = path.join(uploadsDir, `${blobId}.enc`);
    fs.writeFileSync(encryptedPath, encryptedBuffer);

    // Store in mock Walrus
    mockWalrusStorage.set(blobId, {
      fileName,
      size: fileBuffer.length,
      encryptedSize: encryptedBuffer.length,
      uploadedAt: new Date().toISOString()
    });

    // Register in mock SUI
    if (!mockSuiRegistry.has(walletAddress)) {
      mockSuiRegistry.set(walletAddress, []);
    }
    mockSuiRegistry.get(walletAddress).push({
      blobId,
      fileName,
      size: fileBuffer.length,
      uploadedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      blobId,
      fileName,
      size: fileBuffer.length,
      message: 'File uploaded and encrypted successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List files for wallet
app.get('/api/files/:walletAddress', (req, res) => {
  try {
    const { walletAddress } = req.params;

    const files = mockSuiRegistry.get(walletAddress) || [];

    res.json({
      success: true,
      files,
      count: files.length
    });

  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download file
app.post('/api/download', async (req, res) => {
  try {
    const { blobId, walletAddress, signature } = req.body;

    if (!blobId || !walletAddress || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if file exists in registry
    const userFiles = mockSuiRegistry.get(walletAddress) || [];
    const fileInfo = userFiles.find(f => f.blobId === blobId);

    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    // Verify signature
    if (!verifySignature(blobId, signature, walletAddress)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Read encrypted file
    const encryptedPath = path.join(uploadsDir, `${blobId}.enc`);
    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ error: 'File not found in storage' });
    }

    const encryptedBuffer = fs.readFileSync(encryptedPath);

    // Decrypt file
    const decryptedBuffer = decryptFile(encryptedBuffer, signature);

    // Return as base64
    res.json({
      success: true,
      fileName: fileInfo.fileName,
      fileData: decryptedBuffer.toString('base64'),
      size: fileInfo.size
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete file
app.delete('/api/files/:blobId', async (req, res) => {
  try {
    const { blobId } = req.params;
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({ error: 'Missing wallet address or signature' });
    }

    // Verify ownership
    const userFiles = mockSuiRegistry.get(walletAddress) || [];
    const fileIndex = userFiles.findIndex(f => f.blobId === blobId);

    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found or access denied' });
    }

    // Verify signature
    if (!verifySignature(blobId, signature, walletAddress)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Remove from registry
    userFiles.splice(fileIndex, 1);
    mockSuiRegistry.set(walletAddress, userFiles);

    // Delete encrypted file
    const encryptedPath = path.join(uploadsDir, `${blobId}.enc`);
    if (fs.existsSync(encryptedPath)) {
      fs.unlinkSync(encryptedPath);
    }

    // Remove from mock Walrus
    mockWalrusStorage.delete(blobId);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WalrusVault Backend running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🔐 Wallet signature encryption: ENABLED`);
});
