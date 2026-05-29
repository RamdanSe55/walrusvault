import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "id" | "en";

export interface AppStrings {
  layout: {
    brand: string;
    navDashboard: string;
    navUpload: string;
    navDownload: string;
    navActivity: string;
    navImport: string;
    walletConnected: string;
    logout: string;
    darkMode: string;
    lightMode: string;
  };
  login: {
    subtitle: string;
    connectTitle: string;
    connectDesc: string;
    verifying: string;
    connectBtn: string;
    step1title: string;
    step1desc: string;
    step2title: string;
    step2desc: string;
    step3title: string;
    step3desc: string;
    footer1: string;
    footer2: string;
  };
  dashboard: {
    totalFiles: string;
    totalSize: string;
    onWalrus: string;
    local: string;
    fileVault: string;
    uploadFile: string;
    emptyTitle: string;
    emptyDesc: string;
    downloading: string;
    download: string;
    deleteTitle: string;
    deleteDesc: (name: string) => string;
    cancel: string;
    delete: string;
    deleting: string;
    viewWalrus: string;
    verifiedToast: (name: string) => string;
    unverifiedToast: (name: string) => string;
    downloadFailed: string;
    deletedSuccess: (name: string) => string;
    deleteFailed: string;
  };
  upload: {
    title: string;
    subtitle: string;
    step1title: string;
    step1desc: (mb: number) => string;
    step2title: string;
    step2desc: string;
    step3title: string;
    step3desc: string;
    dropRelease: string;
    dropPrompt: string;
    dropSupported: (mb: number) => string;
    reading: string;
    encrypting: string;
    successTitle: string;
    fileLbl: string;
    sizeLbl: string;
    storageLbl: string;
    walrusNet: string;
    localLbl: string;
    blobId: string;
    uploadAgain: string;
    viewVault: string;
    errorTitle: string;
    tryAgain: string;
    encTitle: string;
    encLine1: string;
    encLine2: string;
    encLine3: string;
    encLine4: string;
    tooBig: (mb: number) => string;
    uploadedSuccess: (name: string) => string;
    savedWalrus: string;
    savedLocal: string;
    uploadFailed: string;
  };
  download: {
    title: string;
    subtitle: string;
    secureDecrypt: string;
    secureDesc: string;
    searchPlaceholder: string;
    emptySearch: string;
    emptyVault: string;
    emptySearchHint: string;
    emptyVaultHint: string;
    uploadFile: string;
    fileCount: (n: number) => string;
    viewWalrus: string;
    verified: string;
    downloaded: string;
    failed: string;
    decrypting: string;
    download: string;
    downloadingFrom: (src: string) => string;
    verifiedToast: (name: string) => string;
    unverifiedToast: (name: string) => string;
    failedToast: string;
  };
  activity: {
    title: string;
    subtitle: string;
    upload: string;
    download: string;
    delete: string;
    import: string;
    emptyTitle: string;
    emptyDesc: string;
  };
  importDrive: {
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    connectTitle: string;
    connectDesc: string;
    configRequired: string;
    connectBtn: string;
    readOnly: string;
    searchPlaceholder: string;
    loading: string;
    refresh: string;
    disconnect: string;
    noMatch: string;
    emptyDrive: string;
    filesFound: (n: number) => string;
    imported: string;
    failed: string;
    importing: string;
    import: string;
    notSupported: string;
    fetchError: string;
    importSuccess: (name: string) => string;
    importSuccessDesc: (src: string) => string;
    importFailed: (name: string) => string;
    loadGoogleError: string;
  };
}

const idStrings: AppStrings = {
  layout: {
    brand: "Penyimpanan Terdesentralisasi",
    navDashboard: "Dashboard",
    navUpload: "Upload File",
    navDownload: "Download File",
    navActivity: "Log Aktivitas",
    navImport: "Import Google Drive",
    walletConnected: "Wallet Terhubung",
    logout: "Keluar",
    darkMode: "Mode Gelap",
    lightMode: "Mode Terang",
  },
  login: {
    subtitle: "Penyimpanan terdesentralisasi yang dienkripsi dengan SUI",
    connectTitle: "Hubungkan Dompet SUI",
    connectDesc: "Hubungkan dompet SUI Anda untuk mengakses vault terenkripsi Anda secara aman",
    verifying: "Memverifikasi identitas...",
    connectBtn: "Hubungkan Dompet",
    step1title: "Hubungkan",
    step1desc: "Dompet SUI Anda",
    step2title: "Tanda tangan",
    step2desc: "Pesan auth sekali",
    step3title: "Akses",
    step3desc: "Vault Anda",
    footer1: "File dienkripsi secara lokal menggunakan kunci berbasis alamat dompet Anda.",
    footer2: "Tidak ada server yang pernah melihat data plaintext Anda.",
  },
  dashboard: {
    totalFiles: "Total File",
    totalSize: "Ukuran Total",
    onWalrus: "Di Walrus",
    local: "Lokal",
    fileVault: "File Vault",
    uploadFile: "Upload File",
    emptyTitle: "Vault Kosong",
    emptyDesc: "Upload file pertama Anda untuk memulai",
    downloading: "Mengunduh...",
    download: "Unduh",
    deleteTitle: "Hapus File?",
    deleteDesc: (name) => `File ${name} akan dihapus secara permanen dari vault. Tindakan ini tidak dapat dibatalkan.`,
    cancel: "Batal",
    delete: "Hapus",
    deleting: "Menghapus...",
    viewWalrus: "Walrus",
    verifiedToast: (name) => `✅ ${name} — Integritas terverifikasi`,
    unverifiedToast: (name) => `⚠️ ${name} — Diunduh (hash tidak cocok)`,
    downloadFailed: "Gagal mengunduh file",
    deletedSuccess: (name) => `${name} berhasil dihapus`,
    deleteFailed: "Gagal menghapus file",
  },
  upload: {
    title: "Upload File",
    subtitle: "File dienkripsi secara lokal sebelum diunggah ke Walrus atau vault lokal",
    step1title: "Pilih File",
    step1desc: (mb) => `Maks. ${mb}MB`,
    step2title: "Enkripsi AES-256",
    step2desc: "Kunci dari alamat wallet",
    step3title: "Simpan di Walrus",
    step3desc: "Terdesentralisasi",
    dropRelease: "Lepaskan file di sini",
    dropPrompt: "Seret & lepas atau klik untuk memilih",
    dropSupported: (mb) => `Semua jenis file didukung · Maks. ${mb}MB`,
    reading: "Membaca file...",
    encrypting: "Mengenkripsi & mengunggah...",
    successTitle: "Upload Berhasil!",
    fileLbl: "File",
    sizeLbl: "Ukuran",
    storageLbl: "Penyimpanan",
    walrusNet: "Walrus Network",
    localLbl: "Lokal",
    blobId: "Blob ID",
    uploadAgain: "Upload Lagi",
    viewVault: "Lihat Vault",
    errorTitle: "Upload Gagal",
    tryAgain: "Coba Lagi",
    encTitle: "🔒 Cara Enkripsi Bekerja",
    encLine1: "• Kunci enkripsi diturunkan dari SHA-256 alamat wallet Anda",
    encLine2: "• File dienkripsi dengan AES-256-CBC sebelum meninggalkan browser",
    encLine3: "• Server hanya menerima data terenkripsi — tidak pernah plaintext",
    encLine4: "• File disimpan di Walrus Protocol (terdesentralisasi) jika tersedia",
    tooBig: (mb) => `File terlalu besar. Maksimum ${mb}MB.`,
    uploadedSuccess: (name) => `${name} berhasil diunggah`,
    savedWalrus: "🦭 Disimpan di Walrus Protocol",
    savedLocal: "💾 Disimpan di vault lokal",
    uploadFailed: "Upload gagal",
  },
  download: {
    title: "Download File",
    subtitle: "Unduh dan dekripsi file dari vault Anda. Setiap download diverifikasi integritas SHA-256-nya.",
    secureDecrypt: "Dekripsi aman",
    secureDesc: "File diunduh dari Walrus Network atau vault lokal dalam bentuk terenkripsi, lalu didekripsi di server menggunakan kunci dari alamat wallet Anda. Hash SHA-256 diverifikasi otomatis.",
    searchPlaceholder: "Cari file...",
    emptySearch: "Tidak ada file yang cocok",
    emptyVault: "Vault kosong",
    emptySearchHint: "Coba kata kunci lain",
    emptyVaultHint: "Upload file pertama Anda",
    uploadFile: "Upload File",
    fileCount: (n) => `${n} file · Klik tombol unduh untuk mendekripsi dan mengunduh`,
    viewWalrus: "Lihat di Walrus",
    verified: "Terverifikasi ✓",
    downloaded: "Diunduh",
    failed: "Gagal",
    decrypting: "Mendekripsi...",
    download: "Unduh",
    downloadingFrom: (src) => `Mengunduh dari ${src} dan mendekripsi...`,
    verifiedToast: (name) => `✅ ${name} — Integritas SHA-256 terverifikasi`,
    unverifiedToast: (name) => `⚠️ ${name} — Diunduh (hash tidak cocok)`,
    failedToast: "Download gagal",
  },
  activity: {
    title: "Log Aktivitas",
    subtitle: "Riwayat semua operasi vault Anda",
    upload: "Upload",
    download: "Download",
    delete: "Hapus",
    import: "Import GDrive",
    emptyTitle: "Belum ada aktivitas",
    emptyDesc: "Upload file pertama Anda untuk memulai",
  },
  importDrive: {
    title: "Import dari Google Drive",
    subtitle: "Hubungkan Google Drive dan impor file ke WalrusVault dengan enkripsi AES-256",
    step1: "Hubungkan Drive",
    step2: "Pilih File",
    step3: "Enkripsi Server",
    step4: "Simpan Walrus",
    connectTitle: "Hubungkan Google Drive",
    connectDesc: "Izinkan WalrusVault akses hanya-baca ke Google Drive Anda untuk menelusuri dan mengimpor file. Akses token tidak disimpan di server.",
    configRequired: "Konfigurasi diperlukan",
    connectBtn: "Hubungkan Google Drive",
    readOnly: "Hanya akses baca-saja. Token OAuth tidak disimpan di server manapun.",
    searchPlaceholder: "Cari file...",
    loading: "Memuat...",
    refresh: "Refresh",
    disconnect: "Putuskan",
    noMatch: "Tidak ada file yang cocok",
    emptyDrive: "Google Drive kosong",
    filesFound: (n) => `${n} file ditemukan`,
    imported: "Diimpor",
    failed: "Gagal",
    importing: "Mengimpor...",
    import: "Import",
    notSupported: "Tidak didukung",
    fetchError: "Gagal mengambil file Drive",
    importSuccess: (name) => `${name} berhasil diimpor`,
    importSuccessDesc: (src) => src === "walrus" ? "🦭 Disimpan di Walrus Protocol" : "💾 Disimpan di vault lokal",
    importFailed: (name) => `Gagal mengimpor ${name}`,
    loadGoogleError: "Gagal memuat Google Identity Services: ",
  },
};

const enStrings: AppStrings = {
  layout: {
    brand: "Decentralized Storage",
    navDashboard: "Dashboard",
    navUpload: "Upload File",
    navDownload: "Download File",
    navActivity: "Activity Log",
    navImport: "Import Google Drive",
    walletConnected: "Wallet Connected",
    logout: "Logout",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
  },
  login: {
    subtitle: "Decentralized storage encrypted with SUI",
    connectTitle: "Connect SUI Wallet",
    connectDesc: "Connect your SUI wallet to securely access your encrypted vault",
    verifying: "Verifying identity...",
    connectBtn: "Connect Wallet",
    step1title: "Connect",
    step1desc: "Your SUI Wallet",
    step2title: "Sign",
    step2desc: "Auth message once",
    step3title: "Access",
    step3desc: "Your Vault",
    footer1: "Files are encrypted locally using a key derived from your wallet address.",
    footer2: "No server ever sees your plaintext data.",
  },
  dashboard: {
    totalFiles: "Total Files",
    totalSize: "Total Size",
    onWalrus: "On Walrus",
    local: "Local",
    fileVault: "File Vault",
    uploadFile: "Upload File",
    emptyTitle: "Empty Vault",
    emptyDesc: "Upload your first file to get started",
    downloading: "Downloading...",
    download: "Download",
    deleteTitle: "Delete File?",
    deleteDesc: (name) => `File ${name} will be permanently deleted from the vault. This action cannot be undone.`,
    cancel: "Cancel",
    delete: "Delete",
    deleting: "Deleting...",
    viewWalrus: "Walrus",
    verifiedToast: (name) => `✅ ${name} — Integrity verified`,
    unverifiedToast: (name) => `⚠️ ${name} — Downloaded (hash mismatch)`,
    downloadFailed: "Failed to download file",
    deletedSuccess: (name) => `${name} deleted successfully`,
    deleteFailed: "Failed to delete file",
  },
  upload: {
    title: "Upload File",
    subtitle: "Files are encrypted locally before uploading to Walrus or local vault",
    step1title: "Select File",
    step1desc: (mb) => `Max. ${mb}MB`,
    step2title: "AES-256 Encrypt",
    step2desc: "Key from wallet address",
    step3title: "Store on Walrus",
    step3desc: "Decentralized",
    dropRelease: "Release file here",
    dropPrompt: "Drag & drop or click to select",
    dropSupported: (mb) => `All file types supported · Max. ${mb}MB`,
    reading: "Reading file...",
    encrypting: "Encrypting & uploading...",
    successTitle: "Upload Successful!",
    fileLbl: "File",
    sizeLbl: "Size",
    storageLbl: "Storage",
    walrusNet: "Walrus Network",
    localLbl: "Local",
    blobId: "Blob ID",
    uploadAgain: "Upload Again",
    viewVault: "View Vault",
    errorTitle: "Upload Failed",
    tryAgain: "Try Again",
    encTitle: "🔒 How Encryption Works",
    encLine1: "• Encryption key is derived from SHA-256 of your wallet address",
    encLine2: "• Files are encrypted with AES-256-CBC before leaving your browser",
    encLine3: "• Server only receives encrypted data — never plaintext",
    encLine4: "• Files are stored on Walrus Protocol (decentralized) if available",
    tooBig: (mb) => `File too large. Maximum ${mb}MB.`,
    uploadedSuccess: (name) => `${name} uploaded successfully`,
    savedWalrus: "🦭 Stored on Walrus Protocol",
    savedLocal: "💾 Stored in local vault",
    uploadFailed: "Upload failed",
  },
  download: {
    title: "Download File",
    subtitle: "Download and decrypt files from your vault. Every download is SHA-256 integrity verified.",
    secureDecrypt: "Secure decrypt",
    secureDesc: "Files are downloaded from Walrus Network or local vault in encrypted form, then decrypted on the server using your wallet address key. SHA-256 hash is automatically verified.",
    searchPlaceholder: "Search files...",
    emptySearch: "No matching files",
    emptyVault: "Empty vault",
    emptySearchHint: "Try another keyword",
    emptyVaultHint: "Upload your first file",
    uploadFile: "Upload File",
    fileCount: (n) => `${n} files · Click download to decrypt and download`,
    viewWalrus: "View on Walrus",
    verified: "Verified ✓",
    downloaded: "Downloaded",
    failed: "Failed",
    decrypting: "Decrypting...",
    download: "Download",
    downloadingFrom: (src) => `Downloading from ${src} and decrypting...`,
    verifiedToast: (name) => `✅ ${name} — SHA-256 integrity verified`,
    unverifiedToast: (name) => `⚠️ ${name} — Downloaded (hash mismatch)`,
    failedToast: "Download failed",
  },
  activity: {
    title: "Activity Log",
    subtitle: "History of all your vault operations",
    upload: "Upload",
    download: "Download",
    delete: "Delete",
    import: "Import GDrive",
    emptyTitle: "No activity yet",
    emptyDesc: "Upload your first file to get started",
  },
  importDrive: {
    title: "Import from Google Drive",
    subtitle: "Connect Google Drive and import files to WalrusVault with AES-256 encryption",
    step1: "Connect Drive",
    step2: "Select File",
    step3: "Server Encrypt",
    step4: "Save Walrus",
    connectTitle: "Connect Google Drive",
    connectDesc: "Allow WalrusVault read-only access to your Google Drive to browse and import files. Access tokens are not stored on the server.",
    configRequired: "Configuration required",
    connectBtn: "Connect Google Drive",
    readOnly: "Read-only access. OAuth tokens are not stored on any server.",
    searchPlaceholder: "Search files...",
    loading: "Loading...",
    refresh: "Refresh",
    disconnect: "Disconnect",
    noMatch: "No matching files",
    emptyDrive: "Google Drive is empty",
    filesFound: (n) => `${n} files found`,
    imported: "Imported",
    failed: "Failed",
    importing: "Importing...",
    import: "Import",
    notSupported: "Not supported",
    fetchError: "Failed to fetch Drive files",
    importSuccess: (name) => `${name} imported successfully`,
    importSuccessDesc: (src) => src === "walrus" ? "🦭 Stored on Walrus Protocol" : "💾 Stored in local vault",
    importFailed: (name) => `Failed to import ${name}`,
    loadGoogleError: "Failed to load Google Identity Services: ",
  },
};

const allStrings: Record<Lang, AppStrings> = { id: idStrings, en: enStrings };

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  s: AppStrings;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem("wv-lang");
    return (stored === "en" || stored === "id") ? stored : "id";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("wv-lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, s: allStrings[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
