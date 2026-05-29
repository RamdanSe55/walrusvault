# WalrusVault - Features Documentation

Complete feature list and technical specifications for WalrusVault decentralized file storage platform.

---

## 🔐 Authentication & Access Control

### Wallet-Only Authentication
- **No passwords required** - Authentication via SUI wallet signature
- **No email registration** - Wallet address is your identity
- **One-click login** - Connect wallet and sign message
- **Session persistence** - Stay logged in across browser sessions
- **Auto-reconnect** - Automatic wallet reconnection on page reload

### SUI Signature Verification
- **Message:** "WalrusVault access request"
- **Algorithm:** Ed25519 signature verification
- **Library:** @mysten/sui/verify
- **Security:** Cryptographic proof of wallet ownership
- **Replay protection:** Signature includes timestamp

### Access Control
- **Wallet-based ownership** - Files tied to wallet address
- **Zero-knowledge** - Server never sees private keys
- **Client-side signing** - All signatures generated in browser
- **No session tokens** - Stateless authentication

---

## 📁 File Management

### Upload
- **Drag & drop interface** - Intuitive file upload
- **File size limit:** 10MB per file
- **Supported formats:** All file types
- **Batch upload:** Multiple files at once
- **Progress tracking:** Real-time upload progress
- **Error handling:** Clear error messages

### Encryption (Client-Side)
- **Algorithm:** AES-256-CBC
- **Key derivation:** SHA-256 hash of wallet address
- **IV generation:** Random 16 bytes per file
- **Encryption location:** Browser (before upload)
- **Zero-knowledge:** Server never sees plaintext

### Storage (Walrus Protocol)
- **Network:** Walrus Testnet
- **Storage duration:** 5 epochs
- **Redundancy:** Distributed across nodes
- **Immutability:** Blockchain-backed
- **Blob ID:** Unique identifier per file

### Download
- **One-click download** - Simple file retrieval
- **Automatic decryption** - Decrypted in browser
- **Original filename preserved** - Metadata stored
- **File preview:** Image preview support
- **Batch download:** Multiple files at once

### Delete
- **Permanent deletion** - Remove from Walrus
- **Confirmation required** - Prevent accidental deletion
- **Activity logged** - Audit trail maintained
- **Instant removal** - Immediate effect

### File Listing
- **All user files** - List files by wallet address
- **Metadata display:**
  - File name
  - File size
  - Upload timestamp
  - Walrus blob ID
- **Search & filter** - Find files quickly
- **Sort options** - By name, size, date

---

## 🌐 Google Drive Integration

### Import from Google Drive
- **OAuth 2.0 authentication** - Secure Google login
- **File browser** - Select files to import
- **Batch import** - Multiple files at once
- **Automatic encryption** - Files encrypted before upload
- **Progress tracking** - Real-time import progress
- **Original files preserved** - Files remain in Google Drive

### Web2 → Web3 Bridge
- **Seamless migration** - Move files to decentralized storage
- **No data loss** - Original files untouched
- **Metadata preservation** - Filenames and timestamps kept
- **Selective import** - Choose specific files

---

## 📊 Activity Tracking

### Activity Log
- **All actions logged:**
  - File uploads
  - File downloads
  - File deletions
  - Google Drive imports
- **Metadata captured:**
  - Action type
  - Timestamp
  - Wallet address
  - File name
  - Blob ID

### Audit Trail
- **Immutable log** - Cannot be modified
- **Chronological order** - Sorted by timestamp
- **Wallet-specific** - Only see your own activity
- **Export capability** - Download activity log

### Analytics (via Tatum RPC)
- **Wallet balance** - Current SUI balance
- **Transaction count** - Total transactions
- **Last activity** - Most recent transaction
- **Transaction history** - Full blockchain history

---

## 🎨 User Interface

### Design System
- **Framework:** React + TypeScript
- **Styling:** TailwindCSS
- **Components:** Radix UI
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Dark/Light Mode
- **Toggle switch** - Top-right corner
- **System preference** - Auto-detect OS theme
- **Persistent** - Theme saved to localStorage
- **Smooth transitions** - Animated theme changes

### Multilingual Support
- **Languages:** Indonesian (ID), English (EN)
- **Toggle switch** - Top-right corner
- **Persistent** - Language saved to localStorage
- **Complete translation** - All UI text translated

### Responsive Design
- **Mobile-first** - Optimized for mobile devices
- **Tablet support** - Adaptive layout
- **Desktop optimized** - Full-screen experience
- **Touch-friendly** - Large tap targets

### Accessibility
- **Keyboard navigation** - Full keyboard support
- **Screen reader friendly** - ARIA labels
- **High contrast** - Readable text
- **Focus indicators** - Clear focus states

---

## 🔒 Security Features

### End-to-End Encryption
- **Client-side only** - Encryption in browser
- **AES-256-CBC** - Military-grade encryption
- **Unique keys** - Per-wallet encryption key
- **Random IVs** - Per-file initialization vector

### Zero-Knowledge Architecture
- **Server blind** - Server never sees plaintext
- **No key storage** - Keys derived on-demand
- **No password storage** - Wallet-based auth only
- **No session hijacking** - Stateless authentication

### Blockchain Security
- **SUI signature verification** - Cryptographic proof
- **Immutable storage** - Walrus blockchain-backed
- **Distributed redundancy** - No single point of failure
- **Tamper-proof** - Cannot modify stored files

---

## 🚀 Performance

### Frontend Optimization
- **Code splitting** - Lazy-loaded routes
- **Tree shaking** - Minimal bundle size
- **Image optimization** - WebP format
- **Caching** - Service worker caching

### Backend Optimization
- **Connection pooling** - Database connections
- **Request caching** - Frequently accessed data
- **Compression** - Gzip response compression
- **Rate limiting** - Prevent abuse

### File Processing
- **Streaming** - Large file support
- **Chunked upload** - Resume capability
- **Parallel processing** - Multiple files at once
- **Memory efficient** - No full file buffering

---

## 🔌 API Integration

### Walrus Protocol
- **Publisher API** - Upload encrypted files
- **Aggregator API** - Download encrypted files
- **Blob storage** - Decentralized file storage
- **Epoch management** - Storage duration control

### Tatum RPC
- **Balance queries** - Get wallet balance
- **Transaction history** - Blockchain transactions
- **Wallet stats** - Activity analytics
- **Object ownership** - Verify wallet owns objects

### SUI Blockchain
- **Wallet connection** - @mysten/dapp-kit
- **Signature verification** - @mysten/sui/verify
- **Network:** SUI Testnet
- **RPC:** Tatum RPC endpoints

---

## 📦 Data Management

### Database (Drizzle ORM)
- **Files table:**
  - Blob ID (primary key)
  - File name
  - Wallet address
  - File size
  - Upload timestamp
- **Activity logs table:**
  - Action type
  - Timestamp
  - Wallet address
  - File name
  - Blob ID

### File Metadata
- **Stored on server:**
  - File name
  - File size
  - Wallet address
  - Blob ID
  - Upload timestamp
- **Not stored:**
  - File contents (encrypted on Walrus)
  - Encryption keys (derived on-demand)
  - User passwords (wallet-based auth)

---

## 🛠️ Developer Features

### TypeScript
- **Type safety** - Compile-time error checking
- **IntelliSense** - Auto-completion
- **Refactoring** - Safe code changes
- **Documentation** - Self-documenting code

### Monorepo Structure
- **pnpm workspace** - Shared dependencies
- **Modular architecture** - Separate packages
- **Code sharing** - Shared libraries
- **Independent deployment** - Deploy separately

### Testing (Planned)
- **Unit tests** - Component testing
- **Integration tests** - API testing
- **E2E tests** - Full flow testing
- **Coverage reports** - Code coverage tracking

---

## 🌟 Unique Selling Points

1. **No Passwords** - Wallet-only authentication
2. **Zero-Knowledge** - Server never sees plaintext
3. **Decentralized** - Walrus Protocol storage
4. **Web2 Bridge** - Google Drive import
5. **Blockchain Analytics** - Tatum RPC integration
6. **Modern UI** - Dark/Light mode, animations
7. **Multilingual** - ID/EN support
8. **Open Source** - MIT License

---

**Last Updated:** 2026-05-29  
**Version:** 1.0.0  
**License:** MIT
