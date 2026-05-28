const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

// Utility: Decrypt file using wallet signature
function decryptFile(encryptedPath, walletSignature) {
  return new Promise((resolve, reject) => {
    try {
      const encrypted = fs.readFileSync(encryptedPath);
      // Use wallet signature as decryption key (matches encryption)
      const key = crypto.createHash('sha256').update(walletSignature).digest();
      
      // Simple decryption (matches encryption)
      const decrypted = Buffer.alloc(encrypted.length);
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ key[i % key.length];
      }
      
      resolve(decrypted);
    } catch (err) {
      reject(err);
    }
  });
}

// GET /api/files/list - List uploaded files
router.get('/list', (req, res) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(uploadDir)
      .filter(f => !f.endsWith('.encrypted'))
      .map(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          uploadedAt: stats.birthtime,
          encrypted: fs.existsSync(filePath + '.encrypted')
        };
      });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/files/download - Download and decrypt file
router.post('/download', async (req, res) => {
  try {
    const { fileName, signature } = req.body;

    if (!fileName || !signature) {
      return res.status(400).json({ 
        error: 'Missing required fields: fileName, signature' 
      });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const encryptedPath = path.join(uploadDir, fileName + '.encrypted');

    if (!fs.existsSync(encryptedPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Decrypt file using wallet signature
    const decrypted = await decryptFile(encryptedPath, signature);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(decrypted);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      error: 'File download failed',
      details: error.message 
    });
  }
});

// POST /api/files/verify - Verify file integrity
router.post('/verify', (req, res) => {
  try {
    const { fileName, expectedHash } = req.body;

    if (!fileName || !expectedHash) {
      return res.status(400).json({ 
        error: 'Missing required fields: fileName, expectedHash' 
      });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Calculate file hash
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => {
      const fileHash = hash.digest('hex');
      const isValid = fileHash === expectedHash;
      
      res.json({
        fileName,
        isValid,
        fileHash,
        expectedHash,
        message: isValid ? 'File integrity verified' : 'File integrity check failed'
      });
    });
    stream.on('error', (err) => {
      res.status(500).json({ error: err.message });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/files/:fileName - Delete file
router.delete('/:fileName', (req, res) => {
  try {
    const { fileName } = req.params;
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, fileName);
    const encryptedPath = filePath + '.encrypted';

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (fs.existsSync(encryptedPath)) {
      fs.unlinkSync(encryptedPath);
    }

    res.json({ 
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
