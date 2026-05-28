# WalrusVault - Project Structure

**Expert-Level Organization & Architecture**

---

## 📁 Complete Project Structure

```
walrusvault/                          # Root directory
│
├── backend/                          # Node.js Express Backend
│   ├── routes/                       # API route handlers
│   │   ├── upload.js                 # File upload & encryption (3.1 KB)
│   │   └── files.js                  # File management (4.3 KB)
│   │
│   ├── server.js                     # Express server entry point (2.0 KB)
│   ├── package.json                  # Dependencies & scripts
│   ├── package-lock.json             # Locked dependency versions
│   └── .env.example                  # Environment configuration template
│
├── contracts/                        # SUI Move Smart Contracts
│   └── file_registry.move            # File registry contract (4.9 KB)
│
├── frontend/                         # React Frontend UI
│   ├── index.html                    # Single-page application (12.6 KB)
│   └── package.json                  # Frontend dependencies
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # System design (6.8 KB)
│   ├── DEVELOPMENT.md                # Development log (7.0 KB)
│   └── USE_CASES.md                  # Use cases & scenarios (9.3 KB)
│
└── README.md                         # Main documentation (7.7 KB)
```

**Total Files:** 13
**Total Size:** ~58 KB (excluding node_modules)
**Lines of Code:** ~1,800

---

## 🏗️ Architecture Layers

### Layer 1: Frontend (Presentation)
```
┌─────────────────────────────────────────┐
│         React UI (index.html)           │
│  - File upload form                     │
│  - File download form                   │
│  - File list display                    │
│  - Status notifications                 │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST API
                  ▼
```

### Layer 2: Backend (Business Logic)
```
┌─────────────────────────────────────────┐
│      Express Server (server.js)         │
│  - CORS middleware                      │
│  - File upload handling                 │
│  - Error handling                       │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│  Upload Route  │  │  Files Route    │
│  - Encryption  │  │  - List files   │
│  - Hash gen    │  │  - Download     │
│  - Validation  │  │  - Verify       │
└────────────────┘  └─────────────────┘
```

### Layer 3: Storage & Blockchain
```
┌──────────────────┐    ┌──────────────────┐
│  Walrus Storage  │    │  SUI Blockchain  │
│  - Encrypted     │    │  - File registry │
│    blobs         │    │  - Ownership     │
│  - Decentralized │    │  - Access logs   │
└──────────────────┘    └──────────────────┘
```

---

## 📦 Component Details

### Backend Components

#### 1. Server (server.js)
**Purpose:** Main Express application entry point
**Responsibilities:**
- Initialize Express app
- Configure middleware (CORS, JSON parsing)
- Mount route handlers
- Error handling
- Start HTTP server

**Key Code:**
```javascript
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/upload', uploadRoutes);
app.use('/api/files', fileRoutes);
app.listen(PORT);
```

**Dependencies:**
- express: Web framework
- cors: Cross-origin requests
- dotenv: Environment variables

---

#### 2. Upload Route (routes/upload.js)
**Purpose:** Handle file uploads and encryption
**Responsibilities:**
- Accept multipart file uploads
- Generate SHA-256 file hash
- Encrypt file with password
- Return file metadata

**Key Functions:**
- `generateFileHash(filePath)` - SHA-256 hashing
- `encryptFile(filePath, password)` - File encryption
- `POST /api/upload` - Upload endpoint

**Request Flow:**
```
1. Receive file + password + wallet address
2. Save file to disk
3. Generate SHA-256 hash
4. Encrypt file with password
5. Return metadata (hash, size, status)
```

**Security:**
- File size limit: 10 MB
- Password required
- Wallet address validation
- Encrypted storage

---

#### 3. Files Route (routes/files.js)
**Purpose:** File management operations
**Responsibilities:**
- List uploaded files
- Download and decrypt files
- Verify file integrity
- Delete files

**Key Functions:**
- `GET /api/files/list` - List all files
- `POST /api/files/download` - Download & decrypt
- `POST /api/files/verify` - Verify hash
- `DELETE /api/files/:fileName` - Delete file

**Request Flow (Download):**
```
1. Receive fileName + password
2. Locate encrypted file
3. Decrypt with password
4. Stream to client
5. Client saves file
```

---

### Smart Contract Components

#### File Registry (file_registry.move)
**Purpose:** On-chain file metadata registry
**Responsibilities:**
- Store file metadata on SUI blockchain
- Track file ownership
- Log file access
- Enable file deletion

**Key Structs:**
```move
struct FileMetadata {
    owner: address,
    file_name: String,
    file_hash: String,
    walrus_blob_id: String,
    file_size: u64,
    encrypted: bool,
    created_at: u64,
    access_count: u64,
}

struct FileRegistry {
    files: Table<String, address>,
    total_files: u64,
}
```

**Key Functions:**
- `upload_file()` - Register file on blockchain
- `access_file()` - Increment access counter
- `delete_file()` - Remove file metadata
- `get_file_owner()` - Query ownership

**Events:**
- `FileUploaded` - Emitted on upload
- `FileAccessed` - Emitted on access
- `FileDeleted` - Emitted on deletion

---

### Frontend Components

#### Single-Page App (index.html)
**Purpose:** User interface for file operations
**Responsibilities:**
- File upload form
- File download form
- File list display
- Status notifications

**Key Sections:**
1. **Upload Section**
   - Wallet address input
   - Password input
   - File selector
   - Upload button

2. **Download Section**
   - File name input
   - Password input
   - Download button

3. **File List Section**
   - Display uploaded files
   - Show file size & date
   - Delete button per file

**JavaScript Functions:**
- `uploadFile()` - Handle upload
- `downloadFile()` - Handle download
- `listFiles()` - Fetch file list
- `deleteFile()` - Delete file
- `showStatus()` - Display messages

---

## 🔄 Data Flow

### Upload Flow
```
User                Frontend              Backend              Walrus         SUI
 │                     │                     │                   │            │
 │ 1. Select file      │                     │                   │            │
 │────────────────────>│                     │                   │            │
 │                     │                     │                   │            │
 │ 2. Enter password   │                     │                   │            │
 │────────────────────>│                     │                   │            │
 │                     │                     │                   │            │
 │ 3. Click upload     │                     │                   │            │
 │────────────────────>│                     │                   │            │
 │                     │                     │                   │            │
 │                     │ 4. POST /api/upload │                   │            │
 │                     │────────────────────>│                   │            │
 │                     │                     │                   │            │
 │                     │                     │ 5. Encrypt file   │            │
 │                     │                     │ (local)           │            │
 │                     │                     │                   │            │
 │                     │                     │ 6. Upload blob    │            │
 │                     │                     │──────────────────>│            │
 │                     │                     │                   │            │
 │                     │                     │ 7. Get blob ID    │            │
 │                     │                     │<──────────────────│            │
 │                     │                     │                   │            │
 │                     │                     │ 8. Register metadata           │
 │                     │                     │───────────────────────────────>│
 │                     │                     │                   │            │
 │                     │ 9. Return metadata  │                   │            │
 │                     │<────────────────────│                   │            │
 │                     │                     │                   │            │
 │ 10. Show success    │                     │                   │            │
 │<────────────────────│                     │                   │            │
```

### Download Flow
```
User                Frontend              Backend              Walrus         SUI
 │                     │                     │                   │            │
 │ 1. Enter filename   │                     │                   │            │
 │────────────────────>│                     │                   │            │
 │                     │                     │                   │            │
 │ 2. Enter password   │                     │                   │            │
 │────────────────────>│                     │                   │            │
 │                     │                     │                   │            │
 │ 3. Click download   │                     │                   │            │
 │────────────────────>│                     │                   │            │
 │                     │                     │                   │            │
 │                     │ 4. POST /download   │                   │            │
 │                     │────────────────────>│                   │            │
 │                     │                     │                   │            │
 │                     │                     │ 5. Query metadata │            │
 │                     │                     │───────────────────────────────>│
 │                     │                     │                   │            │
 │                     │                     │ 6. Get blob ID    │            │
 │                     │                     │<───────────────────────────────│
 │                     │                     │                   │            │
 │                     │                     │ 7. Fetch blob     │            │
 │                     │                     │──────────────────>│            │
 │                     │                     │                   │            │
 │                     │                     │ 8. Get encrypted  │            │
 │                     │                     │<──────────────────│            │
 │                     │                     │                   │            │
 │                     │                     │ 9. Decrypt file   │            │
 │                     │                     │ (local)           │            │
 │                     │                     │                   │            │
 │                     │ 10. Stream file     │                   │            │
 │                     │<────────────────────│                   │            │
 │                     │                     │                   │            │
 │ 11. Save file       │                     │                   │            │
 │<────────────────────│                     │                   │            │
```

---

## 🔐 Security Architecture

### Encryption Layer
```
┌─────────────────────────────────────────┐
│         User's Browser                  │
│  - Password input                       │
│  - Never sent to server in plain text  │
└─────────────────┬───────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────┐
│         Backend Server                  │
│  - Receives file + password             │
│  - Encrypts file locally                │
│  - Stores encrypted version only        │
└─────────────────┬───────────────────────┘
                  │ Encrypted blob
                  ▼
┌─────────────────────────────────────────┐
│         Walrus Storage                  │
│  - Stores encrypted blobs only          │
│  - Cannot decrypt without password      │
└─────────────────────────────────────────┘
```

### Blockchain Layer
```
┌─────────────────────────────────────────┐
│         SUI Blockchain                  │
│  - File hash (SHA-256)                  │
│  - Owner address                        │
│  - Walrus blob ID                       │
│  - File size                            │
│  - Timestamp                            │
│  - Access count                         │
└─────────────────────────────────────────┘
```

**Security Properties:**
- ✅ End-to-end encryption
- ✅ Password never stored
- ✅ Decentralized storage
- ✅ Immutable ownership record
- ✅ Verifiable file integrity

---

**Document Version:** 1.0
**Last Updated:** May 24, 02:37 UTC
**Status:** Complete
