# WalrusVault - Architecture Documentation

Technical deep-dive into WalrusVault system architecture, design decisions, and implementation details.

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Frontend (React SPA)                       │ │
│  │  - SUI Wallet Integration (@mysten/dapp-kit)          │ │
│  │  - Client-side Encryption (AES-256-CBC)               │ │
│  │  - File Upload/Download UI                            │ │
│  │  - Google Drive OAuth                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS/TLS
┌──────────────────────────▼──────────────────────────────────┐
│                    Backend API (Express)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Routes Layer                                          │ │
│  │  - /health (health check)                             │ │
│  │  - /api/upload (file upload)                          │ │
│  │  - /api/download (file download)                      │ │
│  │  - /api/files (list files)                            │ │
│  │  - /api/tatum/* (analytics)                           │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Business Logic Layer                                  │ │
│  │  - SUI Signature Verification                         │ │
│  │  - Walrus Integration                                 │ │
│  │  - Tatum RPC Client                                   │ │
│  │  - Activity Logging                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Data Access Layer (Drizzle ORM)                      │ │
│  │  - Files Table                                        │ │
│  │  - Activity Logs Table                                │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌─────▼──────┐  ┌───────▼────────┐
│ Walrus Network │  │ Tatum RPC  │  │   Database     │
│  (Testnet)     │  │ (SUI Chain)│  │  (SQLite/PG)   │
│                │  │            │  │                │
│ - Publisher    │  │ - Balance  │  │ - Files        │
│ - Aggregator   │  │ - Txs      │  │ - Activity     │
│ - Blob Storage │  │ - Stats    │  │                │
└────────────────┘  └────────────┘  └────────────────┘
```

---

## 📦 Component Architecture

### Frontend Components

```
frontend/
├── src/
│   ├── App.tsx                    # Root component, routing
│   ├── main.tsx                   # Entry point
│   ├── pages/
│   │   ├── login.tsx              # Wallet connect page
│   │   ├── dashboard.tsx          # Main hub
│   │   ├── upload.tsx             # File upload
│   │   ├── download.tsx           # File download
│   │   ├── import-drive.tsx       # Google Drive import
│   │   ├── activity.tsx           # Activity log
│   │   └── not-found.tsx          # 404 page
│   ├── components/
│   │   ├── ui/                    # Radix UI components
│   │   ├── FileUpload.tsx         # Drag & drop upload
│   │   ├── FileList.tsx           # File listing
│   │   ├── ActivityLog.tsx        # Activity viewer
│   │   └── WalletConnect.tsx      # Wallet button
│   ├── contexts/
│   │   ├── theme-context.tsx      # Dark/Light mode
│   │   └── language-context.tsx   # i18n
│   ├── hooks/
│   │   ├── use-auth.tsx           # Authentication
│   │   ├── use-files.tsx          # File operations
│   │   └── use-tatum.tsx          # Tatum RPC
│   └── lib/
│       ├── encryption.ts          # AES-256-CBC
│       ├── walrus.ts              # Walrus client
│       └── utils.ts               # Helpers
└── package.json
```

### Backend Components

```
backend/
├── src/
│   ├── index.ts                   # Entry point
│   ├── app.ts                     # Express app setup
│   ├── routes/
│   │   ├── index.ts               # Route aggregation
│   │   ├── health.ts              # Health check
│   │   ├── files.ts               # File operations
│   │   └── tatum.ts               # Tatum RPC
│   ├── lib/
│   │   ├── logger.ts              # Pino logger
│   │   └── tatum.ts               # Tatum client
│   └── middlewares/
│       ├── cors.ts                # CORS config
│       └── auth.ts                # Signature verification
└── package.json
```

### Shared Libraries

```
lib/
├── api-client-react/              # React hooks for API
├── api-zod/                       # API schema validation
├── api-spec/                      # OpenAPI spec
└── db/                            # Database schema
    ├── schema.ts                  # Drizzle schema
    └── index.ts                   # DB client
```

---

## 🔄 Data Flow

### Upload Flow

```
1. User selects file in browser
   ↓
2. Frontend reads file as Buffer
   ↓
3. Derive encryption key from wallet address
   key = SHA256(walletAddress)
   ↓
4. Generate random 16-byte IV
   ↓
5. Encrypt file with AES-256-CBC
   encrypted = AES(file, key, iv)
   ↓
6. Prepend IV to encrypted data
   payload = [IV || encrypted]
   ↓
7. Upload to Walrus Publisher
   POST /v1/store?epochs=5
   ↓
8. Walrus returns blob ID
   blobId = "5a7f3e9c..."
   ↓
9. Send metadata to backend
   POST /api/upload
   { fileName, blobId, walletAddress, signature }
   ↓
10. Backend verifies signature
    ↓
11. Backend saves metadata to database
    INSERT INTO files (blobId, fileName, walletAddress, ...)
    ↓
12. Backend logs activity
    INSERT INTO activity_logs (action, walletAddress, ...)
    ↓
13. Return success to frontend
    { success: true, blobId }
```

### Download Flow

```
1. User clicks download button
   ↓
2. Frontend requests file metadata
   GET /api/files/:walletAddress
   ↓
3. Backend verifies signature
   ↓
4. Backend returns file list
   [{ blobId, fileName, size, ... }]
   ↓
5. User selects file to download
   ↓
6. Frontend requests download
   POST /api/download
   { blobId, walletAddress, signature }
   ↓
7. Backend verifies signature
   ↓
8. Backend fetches from Walrus Aggregator
   GET /v1/{blobId}
   ↓
9. Walrus returns encrypted file
   encryptedBuffer = [IV || encrypted]
   ↓
10. Backend returns encrypted file to frontend
    ↓
11. Frontend extracts IV (first 16 bytes)
    iv = encryptedBuffer.slice(0, 16)
    ↓
12. Frontend extracts ciphertext
    ciphertext = encryptedBuffer.slice(16)
    ↓
13. Derive decryption key from wallet
    key = SHA256(walletAddress)
    ↓
14. Decrypt file with AES-256-CBC
    file = AES_DECRYPT(ciphertext, key, iv)
    ↓
15. Trigger browser download
    downloadFile(file, fileName)
```

---

## 🗄️ Database Schema

### Files Table

```typescript
export const filesTable = pgTable("files", {
  blobId: text("blob_id").primaryKey(),
  fileName: text("file_name").notNull(),
  walletAddress: text("wallet_address").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});
```

**Indexes:**
- Primary key: `blobId`
- Index: `walletAddress` (for fast user file lookup)
- Index: `uploadedAt` (for chronological sorting)

### Activity Logs Table

```typescript
export const activityLogsTable = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(), // "upload", "download", "delete"
  walletAddress: text("wallet_address").notNull(),
  fileName: text("file_name"),
  blobId: text("blob_id"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
```

**Indexes:**
- Primary key: `id`
- Index: `walletAddress` (for user activity lookup)
- Index: `timestamp` (for chronological sorting)

---

## 🔌 API Design

### RESTful Endpoints

#### File Operations

**Upload File Metadata**
```
POST /api/upload
Content-Type: application/json

Request:
{
  "fileName": "document.pdf",
  "blobId": "5a7f3e9c...",
  "fileSize": 1024000,
  "walletAddress": "0x1234...abcd",
  "signature": "base64_signature"
}

Response:
{
  "success": true,
  "blobId": "5a7f3e9c...",
  "message": "File uploaded successfully"
}
```

**List Files**
```
GET /api/files/:walletAddress

Response:
{
  "success": true,
  "files": [
    {
      "blobId": "5a7f3e9c...",
      "fileName": "document.pdf",
      "fileSize": 1024000,
      "uploadedAt": "2026-05-29T12:00:00Z"
    }
  ],
  "count": 1
}
```

**Download File**
```
POST /api/download
Content-Type: application/json

Request:
{
  "blobId": "5a7f3e9c...",
  "walletAddress": "0x1234...abcd",
  "signature": "base64_signature"
}

Response:
{
  "success": true,
  "fileName": "document.pdf",
  "fileData": "base64_encrypted_data",
  "size": 1024000
}
```

**Delete File**
```
DELETE /api/files/:blobId
Content-Type: application/json

Request:
{
  "walletAddress": "0x1234...abcd",
  "signature": "base64_signature"
}

Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### Tatum RPC Endpoints

**Get Wallet Balance**
```
GET /api/tatum/balance/:walletAddress

Response:
{
  "success": true,
  "walletAddress": "0x1234...abcd",
  "balance": "1000000000"
}
```

**Get Wallet Stats**
```
GET /api/tatum/stats/:walletAddress

Response:
{
  "success": true,
  "walletAddress": "0x1234...abcd",
  "stats": {
    "balance": "1000000000",
    "txCount": 42,
    "lastActivity": "2026-05-29T12:00:00Z"
  }
}
```

**Get Transaction History**
```
GET /api/tatum/transactions/:walletAddress?limit=10

Response:
{
  "success": true,
  "walletAddress": "0x1234...abcd",
  "count": 10,
  "transactions": [...]
}
```

---

## 🔗 External Integrations

### Walrus Protocol Integration

**Publisher API (Upload)**
```typescript
const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
const WALRUS_EPOCHS = 5;

async function uploadToWalrus(encryptedBuffer: Buffer): Promise<string> {
  const response = await fetch(
    `${WALRUS_PUBLISHER}/v1/store?epochs=${WALRUS_EPOCHS}`,
    {
      method: "PUT",
      body: encryptedBuffer,
    }
  );
  
  const data = await response.json();
  return data.newlyCreated.blobObject.blobId;
}
```

**Aggregator API (Download)**
```typescript
const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

async function downloadFromWalrus(blobId: string): Promise<Buffer> {
  const response = await fetch(`${WALRUS_AGGREGATOR}/v1/${blobId}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
```

### Tatum RPC Integration

**Initialize Client**
```typescript
import { TatumSDK, Network, Sui } from "@tatum/sdk";

const tatum = await TatumSDK.init<Sui>({
  network: Network.SUI,
  apiKey: {
    v4: process.env.TATUM_API_KEY,
  },
});
```

**Get Balance**
```typescript
const balance = await tatum.rpc.getBalance({
  owner: walletAddress,
});
```

**Query Transactions**
```typescript
const txs = await tatum.rpc.queryTransactionBlocks({
  filter: {
    FromAddress: walletAddress,
  },
  options: {
    showInput: true,
    showEffects: true,
    showEvents: true,
  },
  limit: 10,
});
```

### SUI Wallet Integration

**Connect Wallet**
```typescript
import { ConnectButton } from "@mysten/dapp-kit";

<ConnectButton connectText="Connect Wallet" />
```

**Verify Signature**
```typescript
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";

const messageBytes = new TextEncoder().encode("WalrusVault access request");
const publicKey = await verifyPersonalMessageSignature(messageBytes, signature);
const isValid = publicKey.toSuiAddress() === claimedAddress;
```

---

## 🚀 Deployment Architecture

### Frontend Deployment (Replit)

**Build Process:**
```bash
cd frontend
pnpm install
pnpm build
# Output: dist/
```

**Deployment:**
- Platform: Replit
- URL: https://walrus-drive-sync--haifa123co.replit.app
- Static files served from `dist/`
- SPA routing handled by Vite

### Backend Deployment (Replit + Cloudflare Tunnel)

**Build Process:**
```bash
cd backend
pnpm install
pnpm build
# Output: dist/index.mjs
```

**Deployment:**
- Platform: Replit (backend server)
- Public URL: Cloudflare Tunnel
- Process: Node.js (Express)
- Port: 3001 (internal), 443 (public)

**Cloudflare Tunnel:**
```bash
cloudflared tunnel --url http://localhost:3001
# Public URL: https://stuffed-faculty-consciousness-harry.trycloudflare.com
```

---

## 🔧 Technology Choices

### Why React?
- Component-based architecture
- Large ecosystem
- TypeScript support
- SUI wallet integration available

### Why Express?
- Minimal overhead
- Flexible middleware
- TypeScript support
- Easy to deploy

### Why Drizzle ORM?
- Type-safe queries
- Lightweight
- SQL-first approach
- Great TypeScript integration

### Why Walrus?
- Decentralized storage
- Blockchain-backed
- Immutable files
- High availability

### Why Tatum?
- Unified RPC interface
- No infrastructure management
- Analytics capabilities
- Free tier available

---

## 📊 Performance Considerations

### Frontend Optimization
- Code splitting (React.lazy)
- Tree shaking (Vite)
- Image optimization (WebP)
- Service worker caching

### Backend Optimization
- Connection pooling (database)
- Request caching (Redis, if needed)
- Compression (gzip)
- Rate limiting (prevent abuse)

### File Processing
- Streaming (large files)
- Chunked upload (resume capability)
- Parallel processing (multiple files)
- Memory efficient (no full buffering)

---

## 🔮 Future Enhancements

### Planned Features
- [ ] File sharing (share encrypted files)
- [ ] Folder support (organize files)
- [ ] File versioning (track changes)
- [ ] Batch operations (bulk upload/download)
- [ ] Mobile app (React Native)

### Technical Improvements
- [ ] Redis caching (performance)
- [ ] WebSocket (real-time updates)
- [ ] CDN integration (faster delivery)
- [ ] Load balancing (horizontal scaling)
- [ ] Monitoring (Prometheus, Grafana)

---

**Last Updated:** 2026-05-29  
**Version:** 1.0.0  
**License:** MIT
