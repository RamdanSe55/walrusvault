#!/usr/bin/env node

/**
 * WalrusVault MCP Server
 * Provides AI-accessible tools for file storage operations
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const walrusService = require('./services/walrus');
const tatumService = require('./services/tatum');
const fs = require('fs');
const crypto = require('crypto');

// Initialize MCP Server
const server = new Server(
  {
    name: 'walrusvault-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

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

// Utility: Encrypt file
function encryptFile(filePath, password) {
  return new Promise((resolve, reject) => {
    try {
      const data = fs.readFileSync(filePath);
      const key = crypto.createHash('sha256').update(password).digest();
      
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

// Utility: Decrypt file
function decryptFile(encryptedData, password) {
  const key = crypto.createHash('sha256').update(password).digest();
  const decrypted = Buffer.alloc(encryptedData.length);
  
  for (let i = 0; i < encryptedData.length; i++) {
    decrypted[i] = encryptedData[i] ^ key[i % key.length];
  }
  
  return decrypted;
}

// Tool: Upload File
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'uploadFile') {
    try {
      const { filePath, password, walletAddress } = args;

      // Validate inputs
      if (!filePath || !password || !walletAddress) {
        throw new Error('Missing required parameters');
      }

      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }

      // Generate hash
      const fileHash = await generateFileHash(filePath);

      // Encrypt file
      const encryptedPath = await encryptFile(filePath, password);
      const fileSize = fs.statSync(encryptedPath).size;

      // Upload to Walrus
      const walrusResult = await walrusService.uploadFile(encryptedPath, 5);

      // Register on blockchain
      const fileData = {
        fileName: filePath.split('/').pop(),
        fileHash,
        walrusBlobId: walrusResult.blobId,
        fileSize,
        ownerAddress: walletAddress,
        encrypted: true
      };

      const chainResult = await tatumService.registerFileOnChain(fileData);

      // Cleanup
      fs.unlinkSync(encryptedPath);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              fileHash,
              blobId: walrusResult.blobId,
              transactionHash: chainResult.transactionHash,
              message: 'File uploaded successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }

  if (name === 'downloadFile') {
    try {
      const { blobId, password } = args;

      if (!blobId || !password) {
        throw new Error('Missing required parameters');
      }

      // Download from Walrus
      const encryptedData = await walrusService.downloadFile(blobId);

      // Decrypt
      const decryptedData = decryptFile(encryptedData, password);

      // Save to temp file
      const tempPath = `/tmp/downloaded_${Date.now()}.bin`;
      fs.writeFileSync(tempPath, decryptedData);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              filePath: tempPath,
              size: decryptedData.length,
              message: 'File downloaded and decrypted successfully'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }

  if (name === 'getFileMetadata') {
    try {
      const { fileHash } = args;

      if (!fileHash) {
        throw new Error('Missing fileHash parameter');
      }

      const metadata = await tatumService.getFileMetadata(fileHash);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(metadata, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }

  if (name === 'verifyFileIntegrity') {
    try {
      const { blobId, expectedHash } = args;

      if (!blobId || !expectedHash) {
        throw new Error('Missing required parameters');
      }

      // Download file
      const fileData = await walrusService.downloadFile(blobId);

      // Calculate hash
      const actualHash = crypto.createHash('sha256').update(fileData).digest('hex');

      const isValid = actualHash === expectedHash;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              isValid,
              expectedHash,
              actualHash,
              message: isValid ? 'File integrity verified' : 'File integrity check failed'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error.message
            }, null, 2)
          }
        ],
        isError: true
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// List available tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'uploadFile',
        description: 'Upload encrypted file to Walrus and register on SUI blockchain',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: { type: 'string', description: 'Path to file' },
            password: { type: 'string', description: 'Encryption password' },
            walletAddress: { type: 'string', description: 'SUI wallet address' }
          },
          required: ['filePath', 'password', 'walletAddress']
        }
      },
      {
        name: 'downloadFile',
        description: 'Download and decrypt file from Walrus',
        inputSchema: {
          type: 'object',
          properties: {
            blobId: { type: 'string', description: 'Walrus blob ID' },
            password: { type: 'string', description: 'Decryption password' }
          },
          required: ['blobId', 'password']
        }
      },
      {
        name: 'getFileMetadata',
        description: 'Get file metadata from SUI blockchain',
        inputSchema: {
          type: 'object',
          properties: {
            fileHash: { type: 'string', description: 'File SHA-256 hash' }
          },
          required: ['fileHash']
        }
      },
      {
        name: 'verifyFileIntegrity',
        description: 'Verify file integrity using blockchain hash',
        inputSchema: {
          type: 'object',
          properties: {
            blobId: { type: 'string', description: 'Walrus blob ID' },
            expectedHash: { type: 'string', description: 'Expected SHA-256 hash' }
          },
          required: ['blobId', 'expectedHash']
        }
      }
    ]
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('WalrusVault MCP Server running on stdio');
}

main().catch(console.error);
