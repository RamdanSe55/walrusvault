# WalrusVault - Use Cases & User Stories

**Project:** WalrusVault - Decentralized Encrypted File Storage
**Purpose:** Demonstrate real-world usage scenarios
**Audience:** Hackathon judges, users, developers

---

## 🎯 Primary Use Cases

### Use Case 1: Personal Document Storage
**Actor:** Individual User (Alice)
**Goal:** Store sensitive documents securely

**Scenario:**
Alice has personal documents (passport, tax returns, medical records) that she wants to store securely but access from anywhere.

**Steps:**
1. Alice opens WalrusVault
2. Connects her SUI wallet (0xAlice...)
3. Selects "passport.pdf" from her computer
4. Sets encryption password: "MySecurePass123!"
5. Clicks "Upload & Encrypt"
6. System encrypts file locally
7. Uploads encrypted file to Walrus
8. Registers file hash on SUI blockchain
9. Alice receives confirmation with file hash

**Result:**
- File encrypted with AES-256
- Stored on decentralized Walrus network
- Ownership recorded on SUI blockchain
- Only Alice can decrypt with password

**Benefits:**
- ✅ No central server can access files
- ✅ Files survive even if nodes go down
- ✅ Blockchain proves ownership
- ✅ Password-protected encryption

---

### Use Case 2: Secure File Sharing
**Actor:** Business User (Bob)
**Goal:** Share confidential files with clients

**Scenario:**
Bob is a lawyer who needs to share confidential contracts with clients securely.

**Steps:**
1. Bob uploads "contract_draft.pdf" to WalrusVault
2. Sets encryption password: "ClientAccess2026"
3. System generates file hash: `abc123...`
4. Bob shares:
   - File name: `contract_draft.pdf`
   - Password: `ClientAccess2026`
   - Walrus blob ID (from blockchain)
5. Client downloads file from WalrusVault
6. Enters password to decrypt
7. Verifies file integrity via hash

**Result:**
- Secure file transfer without email
- Client verifies file hasn't been tampered
- Blockchain audit trail of access
- No intermediary can read content

**Benefits:**
- ✅ End-to-end encryption
- ✅ Verifiable integrity
- ✅ Audit trail on blockchain
- ✅ No email attachment limits

---

### Use Case 3: Backup & Recovery
**Actor:** Developer (Charlie)
**Goal:** Backup important code and recover later

**Scenario:**
Charlie wants to backup his project source code before major refactoring.

**Steps:**
1. Charlie zips his project: `myproject.zip`
2. Uploads to WalrusVault with password
3. Notes file hash: `def456...`
4. Performs risky refactoring
5. Refactoring breaks everything
6. Charlie downloads backup from WalrusVault
7. Enters password to decrypt
8. Verifies hash matches original
9. Restores project

**Result:**
- Code safely backed up
- Decentralized storage (no single point of failure)
- Cryptographic proof of integrity
- Quick recovery

**Benefits:**
- ✅ Immutable backup
- ✅ Verifiable integrity
- ✅ Decentralized (survives outages)
- ✅ Version control via blockchain

---

### Use Case 4: Medical Records Storage
**Actor:** Healthcare Provider (Dr. Diana)
**Goal:** Store patient records securely and compliantly

**Scenario:**
Dr. Diana needs HIPAA-compliant storage for patient medical records.

**Steps:**
1. Dr. Diana uploads patient_record.pdf
2. Sets strong encryption password
3. System encrypts file locally (HIPAA-compliant)
4. Uploads to Walrus (decentralized)
5. Records metadata on SUI blockchain
6. Patient can access with password
7. All access logged on blockchain

**Result:**
- HIPAA-compliant encryption
- Patient controls access (password)
- Immutable audit trail
- No central database breach risk

**Benefits:**
- ✅ Regulatory compliance
- ✅ Patient data sovereignty
- ✅ Audit trail for compliance
- ✅ Breach-resistant architecture

---

### Use Case 5: NFT Metadata Storage
**Actor:** NFT Creator (Eve)
**Goal:** Store NFT images/videos on decentralized storage

**Scenario:**
Eve creates NFT collection and needs reliable storage for media files.

**Steps:**
1. Eve uploads NFT images to WalrusVault
2. Each image gets unique Walrus blob ID
3. Blob IDs recorded on SUI blockchain
4. Eve mints NFTs with Walrus blob IDs as metadata
5. NFT buyers can always access original media
6. Media survives even if Eve's server goes down

**Result:**
- NFT media truly decentralized
- Permanent storage on Walrus
- Blockchain-verified authenticity
- No "rug pull" risk

**Benefits:**
- ✅ True decentralization
- ✅ Permanent availability
- ✅ Verifiable authenticity
- ✅ No centralized hosting costs

---

## 🔄 User Journey: Complete Flow

### Journey 1: First-Time User Upload

**Step 1: Landing**
- User opens WalrusVault UI
- Sees clean interface with 3 sections:
  - Upload
  - Download
  - File List

**Step 2: Wallet Connection**
- User enters SUI wallet address
- System validates address format
- Shows confirmation

**Step 3: File Selection**
- User clicks "Select File"
- Browser file picker opens
- User selects "document.pdf" (2.5 MB)

**Step 4: Encryption Setup**
- User enters password: "MyPassword123"
- System shows password strength indicator
- User confirms password

**Step 5: Upload**
- User clicks "Upload & Encrypt"
- Progress bar shows:
  - Encrypting... (2 seconds)
  - Uploading... (3 seconds)
  - Registering on blockchain... (5 seconds)
- Total: 10 seconds

**Step 6: Confirmation**
- Success message appears
- Shows file details:
  - Original name: document.pdf
  - File hash: abc123...
  - Size: 2.5 MB
  - Status: Encrypted & Stored
- File appears in "Your Files" list

**Step 7: Verification**
- User sees file in list
- Can download immediately
- Can share file name + password with others

---

### Journey 2: File Download & Verification

**Step 1: Access**
- User (or recipient) opens WalrusVault
- Goes to "Download File" section

**Step 2: File Identification**
- Enters file name: "document.pdf"
- Enters decryption password: "MyPassword123"

**Step 3: Download**
- Clicks "Download & Decrypt"
- System:
  - Fetches encrypted file from Walrus
  - Decrypts locally with password
  - Verifies file hash
  - Triggers browser download

**Step 4: Verification**
- File downloads to user's computer
- User opens file
- Content matches original
- Hash verification confirms integrity

---

## 📊 Use Case Comparison

| Use Case | User Type | File Type | Key Benefit |
|----------|-----------|-----------|-------------|
| Personal Storage | Individual | Documents | Privacy & Security |
| File Sharing | Business | Contracts | Secure Transfer |
| Backup | Developer | Code | Disaster Recovery |
| Medical Records | Healthcare | Patient Data | Compliance |
| NFT Storage | Creator | Images/Video | Decentralization |

---

## 🎬 Demo Scenario (For Video)

**Title:** "Secure Your Files in 60 Seconds"

**Scene 1: Problem (10s)**
- Show traditional cloud storage risks
- Data breaches, server downtime, privacy concerns

**Scene 2: Solution (15s)**
- Introduce WalrusVault
- Show UI
- Explain: Encryption + Blockchain + Decentralized Storage

**Scene 3: Upload Demo (20s)**
- Select file
- Set password
- Upload
- Show confirmation with hash

**Scene 4: Blockchain Verification (10s)**
- Show file metadata on SUI blockchain
- Highlight ownership record
- Show Walrus blob ID

**Scene 5: Download Demo (15s)**
- Enter file name + password
- Download file
- Verify integrity

**Scene 6: Call to Action (10s)**
- "Your files, your control"
- "Try WalrusVault today"
- Show GitHub link

**Total:** 80 seconds (under 2 min target)

---

## 🧪 Testing Scenarios

### Test Scenario 1: Happy Path
1. Upload file with valid password
2. File appears in list
3. Download with correct password
4. File content matches original
5. Hash verification passes

**Expected Result:** ✅ All steps succeed

---

### Test Scenario 2: Wrong Password
1. Upload file with password "test123"
2. Try download with password "wrong456"
3. Decryption fails
4. Error message shown

**Expected Result:** ✅ Download fails gracefully

---

### Test Scenario 3: Large File
1. Upload 9 MB file (near 10 MB limit)
2. Upload completes successfully
3. Download file
4. Verify content matches

**Expected Result:** ✅ Large file handled correctly

---

### Test Scenario 4: Multiple Files
1. Upload file A
2. Upload file B
3. Upload file C
4. List shows all 3 files
5. Download each file individually
6. All downloads succeed

**Expected Result:** ✅ Multiple files managed correctly

---

### Test Scenario 5: File Deletion
1. Upload file
2. File appears in list
3. Click delete
4. Confirm deletion
5. File removed from list
6. Download attempt fails

**Expected Result:** ✅ File deleted successfully

---

## 📝 User Stories (Agile Format)

**Story 1:**
As a **user**, I want to **upload encrypted files** so that **my data remains private**.

**Story 2:**
As a **user**, I want to **verify file integrity** so that **I know files haven't been tampered with**.

**Story 3:**
As a **user**, I want to **share files securely** so that **only authorized people can access them**.

**Story 4:**
As a **developer**, I want to **integrate WalrusVault** so that **my app has decentralized storage**.

**Story 5:**
As a **business**, I want to **audit file access** so that **I can prove compliance**.

---

**Document Version:** 1.0
**Last Updated:** May 24, 02:35 UTC
**Status:** Complete
