# WalrusVault - Demo Video Script
## Tatum x Walrus Hackathon Submission
**Duration:** 2-3 minutes  
**Target:** Judges & Technical Audience  
**Language:** English (with Indonesian subtitles optional)

---

## OPENING (0:00 - 0:15)
**Visual:** WalrusVault logo animation + tagline  
**Narration:**
> "Meet WalrusVault - the decentralized file storage platform that puts YOU in control. No passwords. No servers. Just your wallet and the power of Walrus Protocol."

**On-screen text:**
- WalrusVault
- Decentralized Storage with SUI Wallet
- Built on Walrus Protocol

---

## PROBLEM STATEMENT (0:15 - 0:30)
**Visual:** Split screen showing traditional cloud storage vs WalrusVault  
**Narration:**
> "Traditional cloud storage requires passwords, trusts centralized servers, and gives companies access to your data. WalrusVault changes that with wallet-based authentication and end-to-end encryption."

**On-screen comparison:**
```
Traditional Cloud          WalrusVault
❌ Passwords              ✅ Wallet signature
❌ Centralized servers    ✅ Decentralized storage
❌ Company access         ✅ Zero-knowledge encryption
```

---

## SOLUTION OVERVIEW (0:30 - 0:45)
**Visual:** Architecture diagram with animated flow  
**Narration:**
> "WalrusVault combines three powerful technologies: SUI blockchain for authentication, AES-256 encryption for security, and Walrus Protocol for decentralized storage."

**On-screen diagram:**
```
User Wallet → SUI Signature → AES-256 Encryption → Walrus Storage
     ↓              ↓                  ↓                  ↓
  Identity    Authentication      Security         Decentralization
```

---

## LIVE DEMO - PART 1: LOGIN (0:45 - 1:00)
**Visual:** Screen recording of login page  
**Actions:**
1. Show login page with wallet connect button
2. Click "Connect Wallet"
3. SUI wallet popup appears
4. Approve connection
5. Redirect to dashboard

**Narration:**
> "Getting started is simple. Connect your SUI wallet - no email, no password, no signup form. Your wallet IS your identity."

**Highlight:**
- Wallet-only authentication
- One-click login
- Instant access

---

## LIVE DEMO - PART 2: UPLOAD (1:00 - 1:20)
**Visual:** Screen recording of upload page  
**Actions:**
1. Navigate to Upload page
2. Drag & drop a file (e.g., "hackathon-proposal.pdf")
3. Show encryption progress
4. Show upload to Walrus progress
5. Success notification with blob ID

**Narration:**
> "Upload any file - it's encrypted locally with your wallet signature before leaving your device. The encrypted file is then stored on Walrus, a decentralized storage network."

**Highlight:**
- Client-side encryption
- AES-256-CBC with wallet-derived key
- Walrus blob ID returned
- 10MB file size limit

**On-screen technical details:**
```
File: hackathon-proposal.pdf (2.3 MB)
Encryption: AES-256-CBC
Key: Derived from wallet address
Walrus Blob ID: 5a7f3e9c...
Storage Duration: 5 epochs
```

---

## LIVE DEMO - PART 3: DOWNLOAD (1:20 - 1:35)
**Visual:** Screen recording of download page  
**Actions:**
1. Navigate to Download page
2. Show list of uploaded files
3. Click download on "hackathon-proposal.pdf"
4. Show decryption progress
5. File downloaded successfully

**Narration:**
> "Downloading is just as easy. Your files are retrieved from Walrus and decrypted locally using your wallet signature. Only you can decrypt your files."

**Highlight:**
- List all user files
- One-click download
- Automatic decryption
- Zero-knowledge: server never sees plaintext

---

## LIVE DEMO - PART 4: GOOGLE DRIVE IMPORT (1:35 - 1:50)
**Visual:** Screen recording of import page  
**Actions:**
1. Navigate to Import from Google Drive
2. Click "Connect Google Drive"
3. Authorize Google account
4. Select files to import
5. Show batch encryption + upload
6. Success: files migrated to WalrusVault

**Narration:**
> "WalrusVault bridges Web2 and Web3. Import files directly from Google Drive, and they're automatically encrypted and stored on Walrus. Your data, your control."

**Highlight:**
- Web2 → Web3 bridge
- Batch import
- Original files remain in Drive
- Seamless migration

---

## LIVE DEMO - PART 5: ACTIVITY LOG (1:50 - 2:00)
**Visual:** Screen recording of activity page  
**Actions:**
1. Navigate to Activity page
2. Show upload/download/delete history
3. Show timestamps and wallet addresses
4. Show audit trail

**Narration:**
> "Every action is logged for transparency. Track uploads, downloads, and deletions with timestamps and wallet addresses."

**Highlight:**
- Complete audit trail
- Timestamp tracking
- Wallet address logging
- Transparency

---

## TECHNICAL HIGHLIGHTS (2:00 - 2:20)
**Visual:** Code snippets + architecture diagram  
**Narration:**
> "Under the hood, WalrusVault uses cutting-edge technology. Files are encrypted with AES-256-CBC using a key derived from your wallet address. SUI signature verification ensures only you can access your files. And Walrus Protocol provides decentralized, immutable storage."

**On-screen technical stack:**
```
Frontend:
- React + TypeScript + Vite
- @mysten/dapp-kit (SUI wallet integration)
- Framer Motion (animations)
- Radix UI (components)

Backend:
- Express.js + TypeScript
- Drizzle ORM (database)
- Walrus Publisher/Aggregator API
- SUI signature verification

Security:
- AES-256-CBC encryption
- Wallet-derived encryption key
- Zero-knowledge architecture
- Blockchain-backed authentication
```

---

## KEY FEATURES SUMMARY (2:20 - 2:35)
**Visual:** Feature showcase with icons  
**Narration:**
> "WalrusVault delivers: wallet-only authentication, end-to-end encryption, decentralized storage, Google Drive import, activity tracking, and a modern responsive UI with dark/light mode and multilingual support."

**On-screen feature list:**
```
✅ Wallet-only authentication (no passwords)
✅ End-to-end encryption (AES-256-CBC)
✅ Decentralized storage (Walrus Protocol)
✅ Google Drive import bridge (Web2 → Web3)
✅ Activity tracking & audit trail
✅ Modern responsive UI (Dark/Light mode)
✅ Multilingual support (ID/EN)
✅ Open source (GitHub)
```

---

## USE CASES (2:35 - 2:45)
**Visual:** Use case scenarios with icons  
**Narration:**
> "WalrusVault is perfect for: secure document storage, private photo backups, confidential file sharing, and migrating from centralized cloud providers."

**On-screen use cases:**
```
📄 Secure Document Storage
   - Legal documents, contracts, certificates
   - Encrypted with wallet signature
   - Decentralized backup

📸 Private Photo Backups
   - Personal photos, family memories
   - Zero-knowledge storage
   - Only you can decrypt

🔒 Confidential File Sharing
   - Share encrypted files via blob ID
   - Recipient needs wallet signature
   - No middleman access

☁️ Cloud Migration
   - Import from Google Drive
   - Migrate to decentralized storage
   - Own your data
```

---

## CLOSING & CALL TO ACTION (2:45 - 3:00)
**Visual:** WalrusVault logo + links  
**Narration:**
> "WalrusVault: Your files. Your wallet. Your control. Try it now at the link below, and check out our open-source code on GitHub. Built for the Tatum x Walrus Hackathon."

**On-screen text:**
```
🌐 Live Demo:
https://fdb99ac9-8e70-42b7-86be-723b5a166ba3-00-yctdmyeyyr5l.pike.replit.dev

💻 GitHub Repository:
https://github.com/RamdanSe55/walrusvault

🏆 Tatum x Walrus Hackathon
Prize: $2,000

Built with ❤️ by WalrusVault Team
```

**End screen:**
- WalrusVault logo
- "Decentralized Storage. Wallet-Powered Security."
- Social links (if any)

---

## PRODUCTION NOTES

### Recording Setup:
- **Screen resolution:** 1920x1080 (Full HD)
- **Frame rate:** 60fps
- **Audio:** Clear voiceover with background music (low volume)
- **Cursor:** Highlight cursor for better visibility

### Editing Tips:
- Add smooth transitions between sections
- Use zoom-in effects for important UI elements
- Add text overlays for technical details
- Include subtle background music (royalty-free)
- Add captions/subtitles for accessibility

### Tools Recommended:
- **Screen recording:** OBS Studio, Loom, or ScreenFlow
- **Video editing:** DaVinci Resolve (free), Adobe Premiere, or Final Cut Pro
- **Voiceover:** Audacity (free) or Adobe Audition
- **Music:** YouTube Audio Library, Epidemic Sound, or Artlist

### File Export:
- **Format:** MP4 (H.264 codec)
- **Resolution:** 1920x1080
- **Bitrate:** 8-10 Mbps
- **Audio:** AAC, 192 kbps
- **File size:** < 100MB (for easy upload)

---

## SCRIPT VARIATIONS

### Short Version (1 minute):
- Opening (0:00-0:10)
- Quick demo: Login → Upload → Download (0:10-0:45)
- Key features (0:45-0:55)
- Closing (0:55-1:00)

### Long Version (5 minutes):
- Add detailed technical deep-dive
- Show code walkthrough
- Explain Walrus Protocol integration
- Demonstrate error handling
- Show mobile responsive design

---

## BACKUP PLAN (If recording fails):
1. Use screenshots with voiceover
2. Create animated presentation (PowerPoint/Keynote)
3. Use screen recording GIFs with captions
4. Combine static images with transitions

---

**END OF SCRIPT**

Total estimated duration: 2:45 - 3:00 minutes
Target audience: Hackathon judges, developers, crypto enthusiasts
Tone: Professional, technical, confident
Goal: Showcase innovation, security, and usability
