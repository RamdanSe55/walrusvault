# WalrusVault - On-Chain Integration Deployment Guide

## Overview

This guide covers deploying the SUI Move smart contract for file metadata registry and integrating it with WalrusVault backend.

---

## Prerequisites

- SUI CLI installed (`sui --version`)
- Node.js 18+ installed
- Tatum API key (from dashboard.tatum.io)
- SUI testnet wallet with some SUI for gas fees

---

## Step 1: Compile Move Contract

```bash
cd backend/contracts
sui move build
```

**Expected output:**
```
Compiling file_registry...
BUILDING file_registry
Dependency resolution graph in 0.XX(s)
Type checking...
Compilation successful!
```

---

## Step 2: Deploy Contract to SUI Testnet

```bash
cd backend/contracts

# Publish contract
sui client publish --gas-budget 100000000

# Output will show:
# - Package ID
# - Module name: file_registry::registry
# - Transaction hash
```

**Save the Package ID** — you'll need it for .env

---

## Step 3: Update Environment Variables

Create `.env` in `backend/` directory:

```bash
# Tatum
TATUM_API_KEY=t-66d664aaa620a5001c9ee388-9459a9dd66ad42e2874171fe
TATUM_RPC_URL=https://joe-dc3c9b4f.gateway.tatum.io/

# SUI Network
SUI_NETWORK=testnet

# Walrus
WALRUS_NETWORK=testnet
WALRUS_EPOCHS=5

# File Registry (from deployment)
FILE_REGISTRY_PACKAGE_ID=0x1234567890abcdef...
FILE_REGISTRY_MODULE=registry

# Database
DATABASE_URL=file:./walrusvault.db

# Server
PORT=3001
NODE_ENV=production
```

---

## Step 4: Install Dependencies

```bash
cd backend
npm install
```

---

## Step 5: Build Backend

```bash
npm run build
```

---

## Step 6: Start Backend

```bash
npm run start
```

**Expected output:**
```
✅ Tatum SDK initialized for SUI Testnet (https://joe-dc3c9b4f.gateway.tatum.io/)
Server running on port 3001
```

---

## API Endpoints

### File Upload (with on-chain registration)

```bash
POST /api/upload
Content-Type: application/json

{
  "fileName": "document.pdf",
  "fileData": "base64_encoded_file_data",
  "walletAddress": "0x...",
  "signature": "signature_from_wallet"
}
```

**Response:**
```json
{
  "success": true,
  "blobId": "blob_id",
  "fileName": "document.pdf",
  "size": 1024,
  "sha256Hash": "hash",
  "walrusBlobId": "walrus_blob_id",
  "onChain": {
    "transactionHash": "0x...",
    "fileObjectId": "0x..."
  }
}
```

### Grant Access

```bash
POST /api/sharing/grant
Content-Type: application/json

{
  "fileObjectId": "0x...",
  "granteeAddress": "0x...",
  "accessLevel": 0,
  "expiresAt": 0,
  "walletAddress": "0x...",
  "signature": "signature"
}
```

**Access Levels:**
- 0 = Read only
- 1 = Write
- 2 = Admin

### Revoke Access

```bash
POST /api/sharing/revoke
Content-Type: application/json

{
  "fileObjectId": "0x...",
  "granteeAddress": "0x...",
  "walletAddress": "0x...",
  "signature": "signature"
}
```

### Transfer Ownership

```bash
POST /api/sharing/transfer
Content-Type: application/json

{
  "fileObjectId": "0x...",
  "recipientAddress": "0x...",
  "walletAddress": "0x...",
  "signature": "signature"
}
```

---

## Troubleshooting

### Issue: "Package not found"
**Solution:** Verify FILE_REGISTRY_PACKAGE_ID in .env matches deployed package

### Issue: "Tatum SDK initialization failed"
**Solution:** Check TATUM_API_KEY and TATUM_RPC_URL in .env

### Issue: "Insufficient gas"
**Solution:** Request more SUI from testnet faucet: https://faucet.testnet.sui.io/

### Issue: "Transaction failed"
**Solution:** Check wallet has sufficient balance and signature is valid

---

## Testing

```bash
# Test file upload with on-chain registration
curl -X POST http://localhost:3001/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.txt",
    "fileData": "dGVzdCBkYXRh",
    "walletAddress": "0x...",
    "signature": "0x..."
  }'

# Test grant access
curl -X POST http://localhost:3001/api/sharing/grant \
  -H "Content-Type: application/json" \
  -d '{
    "fileObjectId": "0x...",
    "granteeAddress": "0x...",
    "accessLevel": 0,
    "expiresAt": 0,
    "walletAddress": "0x...",
    "signature": "0x..."
  }'
```

---

## Production Deployment

For production:

1. Deploy to mainnet (change SUI_NETWORK=mainnet)
2. Use production Tatum API key
3. Set NODE_ENV=production
4. Use Cloudflare Tunnel or similar for HTTPS
5. Enable rate limiting
6. Add monitoring & logging

---

## References

- SUI Docs: https://docs.sui.io
- Tatum Docs: https://docs.tatum.io
- Walrus Docs: https://docs.walrus.site
- Move Language: https://move-language.github.io
