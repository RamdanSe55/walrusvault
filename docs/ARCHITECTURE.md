# WalrusVault - Tatum x Walrus Hackathon Project

**Decentralized Encrypted File Storage on SUI Blockchain + Walrus Storage**

---

## 🎯 Project Overview

WalrusVault is a decentralized file storage application that combines:
- **SUI Blockchain** - Immutable file ownership & access control
- **Walrus Storage** - Decentralized blob storage for encrypted files
- **Tatum APIs** - Simplified blockchain interaction

Users can:
1. Upload files with password encryption
2. Store encrypted files on Walrus (decentralized)
3. Register file metadata on SUI blockchain
4. Share files securely via access tokens
5. Download and decrypt files with password

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│              - File upload/download UI                   │
│              - Wallet connection                         │
│              - File management                           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Backend (Node.js)                       │
│              - File encryption/decryption                │
│              - Walrus integration                        │
│              - Tatum SDK integration                     │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌────────▼──────────┐
│  SUI Blockchain│      │ Walrus Storage    │
│  - File Registry       │ - Encrypted Blobs │
│  - Ownership           │ - Decentralized   │
│  - Access Control      │ - Immutable       │
└────────────────┘      └───────────────────┘
```

---

## 📁 Project Structure

```
walrusvault/
├── backend/
│   ├── server.js              # Express server
│   ├── routes/
│   │   ├── upload.js          # File upload & encryption
│   │   └── files.js           # File management
│   ├── package.json
│   └── .env.example
├── contracts/
│   └── file_registry.move     # SUI Move smart contract
├── frontend/
│   └── index.html             # React UI (single page)
├── docs/
│   └── ARCHITECTURE.md
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- SUI CLI (for contract deployment)
- Tatum API Key (free at tatum.io)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Tatum API key
npm start
```

Backend runs on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend
# Open index.html in browser
# Or use: python -m http.server 3000
```

Frontend runs on `http://localhost:3000`

---

## 🔐 Security Features

1. **File Encryption**
   - AES-256 encryption (production)
   - Password-based key derivation
   - Encrypted files stored on Walrus

2. **Blockchain Verification**
   - File hash stored on SUI
   - Immutable ownership record
   - Access control via NFT tokens

3. **Decentralized Storage**
   - Files stored on Walrus nodes
   - No single point of failure
   - Byzantine fault tolerance

---

## 📊 Key Features

### ✅ Implemented
- [x] File upload with encryption
- [x] File download with decryption
- [x] File listing
- [x] File deletion
- [x] File integrity verification
- [x] SUI smart contract (file registry)
- [x] React UI

### 🔄 In Progress
- [ ] Walrus integration (blob upload)
- [ ] Tatum SDK integration
- [ ] SUI contract deployment
- [ ] NFT access tokens
- [ ] File sharing

### 📋 Planned
- [ ] Multi-file batch operations
- [ ] File versioning
- [ ] Collaborative sharing
- [ ] Advanced access control
- [ ] File preview (images/videos)

---

## 🧪 Testing

### Manual Testing

1. **Upload File**
   - Enter wallet address
   - Set encryption password
   - Select file
   - Click "Upload & Encrypt"

2. **Download File**
   - Enter file name
   - Enter decryption password
   - Click "Download & Decrypt"

3. **Verify Integrity**
   - Upload file
   - Note file hash
   - Download file
   - Verify hash matches

---

## 📝 API Endpoints

### Upload
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- file: File
- password: string
- walletAddress: string

Response:
{
  "success": true,
  "file": {
    "originalName": "document.pdf",
    "fileHash": "abc123...",
    "fileSize": 1024,
    "status": "encrypted_ready_for_walrus"
  }
}
```

### List Files
```
GET /api/files/list

Response:
{
  "files": [
    {
      "name": "file-123.pdf",
      "size": 1024,
      "uploadedAt": "2026-05-24T...",
      "encrypted": true
    }
  ]
}
```

### Download
```
POST /api/files/download
Content-Type: application/json

Body:
{
  "fileName": "file-123.pdf",
  "password": "mypassword"
}

Response: Binary file data
```

---

## 🎬 Demo Video Script (2-3 minutes)

1. **Intro (30s)**
   - "WalrusVault: Decentralized encrypted file storage"
   - Show UI

2. **Upload Demo (45s)**
   - Connect wallet
   - Select file
   - Set password
   - Upload
   - Show encrypted file on Walrus

3. **Blockchain Demo (45s)**
   - Show file metadata on SUI
   - Show file hash
   - Show ownership record

4. **Download Demo (30s)**
   - Download encrypted file
   - Enter password
   - Verify file integrity

5. **Outro (15s)**
   - "Secure, decentralized, user-controlled"
   - Call to action

---

## 🏆 Why WalrusVault Wins

✅ **Practical Use Case** - Everyone needs secure file storage
✅ **Full Tech Stack** - Uses SUI + Walrus + Tatum
✅ **User-Friendly** - Simple UI, clear workflow
✅ **Secure** - Encryption + blockchain verification
✅ **Scalable** - Decentralized storage
✅ **Completable** - Can finish in 13 days

---

## 📚 Resources

- SUI Docs: https://docs.sui.io
- Walrus Docs: https://docs.walrus.site
- Tatum Docs: https://docs.tatum.io
- Move Language: https://move-language.github.io

---

## 👤 Team

Solo developer - Ramdan

---

## 📄 License

MIT
