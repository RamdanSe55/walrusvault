# GitHub Pages Setup Guide

## Problem: GitHub Pages tidak aktif otomatis

GitHub Pages **TIDAK** aktif otomatis. Kamu harus enable manual di repository settings.

---

## Step-by-Step Activation

### 1. Buka Repository Settings
```
https://github.com/RamdanSe55/walrusvault/settings/pages
```

### 2. Configure Source
Di bagian **"Build and deployment"**:

**Source:** Deploy from a branch

**Branch:**
- Branch: `main`
- Folder: `/ (root)`

**Klik tombol "Save"**

### 3. Tunggu Deployment
- GitHub akan mulai deploy (1-2 menit)
- Refresh halaman untuk lihat status
- Akan muncul: "Your site is live at https://ramdanse55.github.io/walrusvault/"

---

## Troubleshooting

### Issue 1: "GitHub Pages is currently disabled"
**Solution:** Enable di settings seperti langkah di atas

### Issue 2: "404 - File not found"
**Solution:** Sudah di-fix! Path sudah diubah dari absolute (`/assets/`) ke relative (`./assets/`)

### Issue 3: "Blank page / white screen"
**Possible causes:**
- Assets tidak load (path issue) - FIXED
- JavaScript error - Check browser console
- Backend tidak running - Normal, frontend standalone

### Issue 4: "Workflow failed"
**Check:**
```
https://github.com/RamdanSe55/walrusvault/actions
```
Lihat error di workflow run

---

## Verification

### After enabling GitHub Pages:

1. **Check deployment status:**
   ```
   https://github.com/RamdanSe55/walrusvault/deployments
   ```

2. **Open live site:**
   ```
   https://ramdanse55.github.io/walrusvault/
   ```

3. **Test functionality:**
   - Page loads ✓
   - Assets load (CSS + JS) ✓
   - Wallet connect button visible ✓

---

## Current Status

✅ Frontend built (commit 7ddedc2)
✅ Path fixed (absolute → relative)
✅ Pushed to GitHub
⏳ GitHub Pages activation (MANUAL - waiting for you)

---

## Quick Links

- **Settings:** https://github.com/RamdanSe55/walrusvault/settings/pages
- **Actions:** https://github.com/RamdanSe55/walrusvault/actions
- **Live Site:** https://ramdanse55.github.io/walrusvault/ (after activation)

---

## Why Manual Activation?

GitHub Pages tidak aktif otomatis karena:
1. Security - Prevent accidental public deployment
2. Privacy - User control over what gets published
3. Billing - Pages counts toward bandwidth quota

Kamu harus explicitly enable di settings.

---

**Next:** Buka link settings di atas dan enable GitHub Pages sekarang!
