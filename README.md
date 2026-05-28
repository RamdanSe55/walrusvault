# WalrusVault

**Decentralized File Storage with SUI Wallet Authentication**

🏆 Tatum x Walrus Hackathon 2026

## Overview

WalrusVault adalah platform penyimpanan file terdesentralisasi yang menggunakan:
- **SUI Blockchain** untuk autentikasi wallet
- **Walrus Protocol** untuk penyimpanan file terenkripsi
- **Tatum SDK** untuk integrasi blockchain
- **React + Vite** untuk frontend modern

## Features

✅ **Wallet-Only Authentication** - Tidak perlu password, gunakan SUI wallet
✅ **End-to-End Encryption** - File dienkripsi dengan signature wallet
✅ **Decentralized Storage** - File disimpan di Walrus Blobs
✅ **On-Chain Registry** - Metadata file di SUI blockchain
✅ **Google Drive Import** - Bridge Web2 ke Web3
✅ **Dark & Light Mode** - UI responsif dengan 2 tema

## Tech Stack

- **Frontend**: React 18 + Vite + Framer Motion
- **Backend**: Express.js + Node.js
- **Blockchain**: SUI Testnet + Tatum SDK
- **Storage**: Walrus Protocol (Decentralized)
- **Encryption**: Wallet Signature-based

## Project Structure

```
walrusvault/
├── backend/              # Express server
│   ├── server.js
│   ├── routes/
│   ├── services/
│   └── package.json
├── frontend-v3/          # React frontend
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── contracts/            # SUI Move contracts
│   └── file_registry.move
├── docs/                 # Documentation
├── index.html            # Showcase page
├── pages-*.svg           # UI mockups
└── README.md
```

## Getting Started

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend-v3
npm install
npm run dev
```

## Demo

Open `index.html` in browser to see:
- Dark Mode showcase (5 pages)
- Light Mode showcase (5 pages)
- Walrus mascot icon
- Interactive theme toggle

## Deployment

- **Backend**: Running on port 3001
- **Frontend**: Running on port 3000
- **Smart Contract**: Deployed to SUI Testnet

## Security

🔐 Wallet-only authentication (no passwords)
🔒 End-to-end encryption with wallet signatures
✓ Signature verification on all operations
📝 On-chain audit trail
🌐 Decentralized storage (no single point of failure)

## Hackathon Info

**Event**: Tatum x Walrus Hackathon 2026
**Prize**: $2,000
**Deadline**: June 6, 2026 17:00 UTC
**Repository**: https://github.com/RamdanSe55/walrusvault

## License

MIT
