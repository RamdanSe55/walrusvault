# WalrusVault

Decentralized file storage app using SUI wallet authentication, AES-256 encryption, and Walrus Protocol for on-chain storage.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/walrusvault run dev` — run the frontend (port 22819)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + TanStack Query + Wouter + Tailwind CSS
- SUI auth: `@mysten/dapp-kit` v1 + `@mysten/sui` v2
- Storage: Walrus Protocol (testnet) with local fallback

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle schema: `files.ts`, `activity-logs.ts`
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod validation schemas
- `artifacts/api-server/src/routes/files.ts` — all file/upload/download/drive routes
- `artifacts/walrusvault/src/` — React frontend
  - `pages/login.tsx` — SUI wallet connect page
  - `pages/dashboard.tsx` — file vault browser
  - `pages/upload.tsx` — drag & drop file upload
  - `pages/activity.tsx` — activity log
  - `pages/import-drive.tsx` — Google Drive → Walrus importer
  - `hooks/use-auth.tsx` — SUI wallet auth + signature management
  - `components/layout.tsx` — sidebar navigation shell

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → typed React hooks + Zod schemas
- **AES-256-CBC encryption**: Key = SHA256(walletAddress), IV prepended to ciphertext; all encryption/decryption happens server-side
- **Walrus-first storage**: Every upload attempts Walrus Protocol testnet first; falls back to local disk (`uploads/<blobId>.enc`)
- **Auth signature caching**: SUI wallet signs "WalrusVault access request" once per session, signature cached in localStorage per wallet address
- **Google Drive OAuth**: Client-side Google Identity Services OAuth popup; access token passed to backend for server-side file download (no client secret needed)
- **Orval body naming rule**: All request body schemas use entity-shaped names (`FileUploadInput`, `DriveImportInput`) — never `<OperationId>Body` — to avoid TS2308 collision with auto-generated Zod names
- **No query params on operations with path params**: Avoids Orval `GetXxxParams` name collision between `api.ts` Zod schema and `types/` TypeScript interface

## Product

- **Login**: Connect any SUI wallet; sign an auth message to generate encryption key material
- **Dashboard**: Browse your encrypted vault files with Walrus/local source badge, download (with integrity verification), and delete
- **Upload**: Drag-and-drop or click-to-select files (up to 10MB); automatic AES-256 encryption before upload; tries Walrus Protocol first
- **Activity Log**: Full audit trail of uploads, downloads, deletes, and imports with timestamps
- **Google Drive Import**: OAuth2 popup to connect Drive, browse files, import any file directly into the vault (server downloads → encrypts → uploads to Walrus)

## User preferences

- Language of user is Indonesian; app UI is in Indonesian

## Gotchas

- `getFullnodeUrl` is not available in `@mysten/sui` v2 — hardcode the RPC URL string directly
- `@mysten/dapp-kit/dist/index.css` MUST be imported BEFORE `index.css` in `main.tsx`
- `SuiClientProvider` network config requires `network: "mainnet" as const` field in the config object
- `WalletProvider` v1 does not accept `stashedWallet` prop
- Walrus upload endpoint changed: use `/v1/blobs?epochs=N` (PUT method), not `/v1/store`
- Walrus download: use `/v1/blobs/<blobId>` on the aggregator

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Walrus testnet publisher: `https://publisher.walrus-testnet.walrus.space`
- Walrus testnet aggregator: `https://aggregator.walrus-testnet.walrus.space`
- Google Drive OAuth needs `VITE_GOOGLE_CLIENT_ID` env var (Google Cloud Console → OAuth 2.0 Client ID)
