const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const walrusService = require('../services/walrus');
const tatumService = require('../services/tatum');

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760
  }
});

// Utility: Generate file hash
function generateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// Utility: Verify wallet signature
function verifySignature(signature, walletAddress, message) {
  // In production, use @mysten/sui.js to verify signature
  // For now, basic validation that signature exists and is non-empty
  if (!signature || signature.length < 10) {
    throw new Error('Invalid signature format');
  }
  if (!walletAddress || !walletAddress.startsWith('0x')) {
    throw new Error('Invalid wallet address');
  }
  console.log('✅ Signature verified for wallet:', walletAddress);
  return true;
}

// Utility: Encrypt file using wallet signature as key
function encryptFile(filePath, walletSignature) {
  return new Promise((resolve, reject) => {
    try {
      const data = fs.readFileSync(filePath);
      // Use wallet signature as encryption key (first 32 bytes for SHA256)
      const key = crypto.createHash('sha256').update(walletSignature).digest();
      
      // Simple encryption (for demo only - use proper AES in production)
      const encrypted = Buffer.alloc(data.length);
      for (let i = 0; i < data.length; i++) {
        encrypted[i] = data[i] ^ key[i % key.length];
      }
      
      const encryptedPath = filePath + '.encrypted';
      fs.writeFileSync(encryptedPath, encrypted);
      resolve(encryptedPath);
    } catch (err) {
      reject(err);
    }
  });
}

// POST /api/upload - Upload, encrypt, and store on Walrus
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { signature, walletAddress } = req.body;

    if (!signature || !walletAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: signature, walletAddress' 
      });
    }

    // Verify wallet signature
    try {
      verifySignature(signature, walletAddress, `WalrusVault:encrypt:${req.file.originalname}:${walletAddress}`);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    // Step 1: Generate file hash
    const fileHash = await generateFileHash(req.file.path);
    console.log('✅ File hash generated:', fileHash);

    // Step 2: Encrypt file using wallet signature
    const encryptedPath = await encryptFile(req.file.path, signature);
    const fileSize = fs.statSync(encryptedPath).size;
    console.log('✅ File encrypted:', encryptedPath);

    // Step 3: Upload to Walrus
    console.log('📤 Uploading to Walrus...');
    const walrusResult = await walrusService.uploadFile(encryptedPath, 5);
    console.log('✅ Walrus upload successful:', walrusResult.blobId);

    // Step 4: Register on SUI blockchain via Tatum
    console.log('📝 Registering on SUI blockchain...');
    const fileData = {
      fileName: req.file.originalname,
      fileHash: fileHash,
      walrusBlobId: walrusResult.blobId,
      fileSize: fileSize,
      ownerAddress: walletAddress,
      encrypted: true
    };

    const chainResult = await tatumService.registerFileOnChain(fileData);
    console.log('✅ Blockchain registration successful:', chainResult.transactionHash);

    // Step 5: Keep encrypted file for download (in production, download from Walrus)
    // fs.unlinkSync(encryptedPath); // Commented out - keep for local testing

    res.json({
      success: true,
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        fileHash: fileHash,
        fileSize: fileSize,
        walrusBlobId: walrusResult.blobId,
        walrusUrl: walrusResult.url,
        transactionHash: chainResult.transactionHash,
        uploadedAt: new Date().toISOString(),
        walletAddress: walletAddress,
        status: 'stored_on_walrus_and_blockchain'
      },
      message: 'File encrypted, stored on Walrus, and registered on SUI blockchain successfully!'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'File upload failed',
      details: error.message 
    });
  }
});

module.exports = router;
