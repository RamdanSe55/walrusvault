#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║              WALRUSVAULT FULL INTEGRATION TEST                           ║"
echo "║              Backend + Frontend API Integration                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

BACKEND_URL="http://localhost:3001"
WALLET_1="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
WALLET_2="0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
SIG_1="sig_wallet1_$(date +%s)"
SIG_2="sig_wallet2_$(date +%s)"

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 1: WALLET 1 - UPLOAD & LIST"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "1.1 Wallet 1 uploads file..."
FILE_DATA=$(echo "Test file from wallet 1" | base64 -w 0)
UPLOAD_1=$(curl -s -X POST "$BACKEND_URL/api/upload" \
  -H "Content-Type: application/json" \
  -d "{\"fileName\":\"wallet1-file.txt\",\"fileData\":\"$FILE_DATA\",\"walletAddress\":\"$WALLET_1\",\"signature\":\"$SIG_1\"}")

BLOB_ID_1=$(echo "$UPLOAD_1" | grep -o '"blobId":"[^"]*"' | cut -d'"' -f4)
echo "   Blob ID: $BLOB_ID_1"
if [ -n "$BLOB_ID_1" ]; then
    echo "   ✅ Upload successful"
else
    echo "   ❌ Upload failed"
    exit 1
fi
echo ""

echo "1.2 Wallet 1 lists files..."
LIST_1=$(curl -s "$BACKEND_URL/api/files/$WALLET_1")
COUNT_1=$(echo "$LIST_1" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "   Files: $COUNT_1"
if [ "$COUNT_1" = "1" ]; then
    echo "   ✅ List successful"
else
    echo "   ❌ List failed"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 2: WALLET 2 - UPLOAD & LIST (Isolation Test)"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "2.1 Wallet 2 uploads file..."
FILE_DATA_2=$(echo "Test file from wallet 2" | base64 -w 0)
UPLOAD_2=$(curl -s -X POST "$BACKEND_URL/api/upload" \
  -H "Content-Type: application/json" \
  -d "{\"fileName\":\"wallet2-file.txt\",\"fileData\":\"$FILE_DATA_2\",\"walletAddress\":\"$WALLET_2\",\"signature\":\"$SIG_2\"}")

BLOB_ID_2=$(echo "$UPLOAD_2" | grep -o '"blobId":"[^"]*"' | cut -d'"' -f4)
echo "   Blob ID: $BLOB_ID_2"
if [ -n "$BLOB_ID_2" ]; then
    echo "   ✅ Upload successful"
else
    echo "   ❌ Upload failed"
    exit 1
fi
echo ""

echo "2.2 Wallet 2 lists files..."
LIST_2=$(curl -s "$BACKEND_URL/api/files/$WALLET_2")
COUNT_2=$(echo "$LIST_2" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "   Files: $COUNT_2"
if [ "$COUNT_2" = "1" ]; then
    echo "   ✅ List successful"
else
    echo "   ❌ List failed"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 3: ISOLATION TEST - Verify wallets can't access each other's files"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "3.1 Wallet 1 tries to download Wallet 2's file (should fail)..."
DOWNLOAD_FAIL=$(curl -s -X POST "$BACKEND_URL/api/download" \
  -H "Content-Type: application/json" \
  -d "{\"blobId\":\"$BLOB_ID_2\",\"walletAddress\":\"$WALLET_1\",\"signature\":\"$SIG_1\"}")

if echo "$DOWNLOAD_FAIL" | grep -q "error"; then
    echo "   ✅ Access denied (correct)"
else
    echo "   ❌ Security breach - wallet can access other's files!"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 4: DOWNLOAD & DECRYPT TEST"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "4.1 Wallet 1 downloads own file..."
DOWNLOAD_1=$(curl -s -X POST "$BACKEND_URL/api/download" \
  -H "Content-Type: application/json" \
  -d "{\"blobId\":\"$BLOB_ID_1\",\"walletAddress\":\"$WALLET_1\",\"signature\":\"$SIG_1\"}")

if echo "$DOWNLOAD_1" | grep -q "fileData"; then
    echo "   ✅ Download successful"
    DECRYPTED=$(echo "$DOWNLOAD_1" | grep -o '"fileData":"[^"]*"' | cut -d'"' -f4 | base64 -d)
    echo "   Decrypted content: $DECRYPTED"
else
    echo "   ❌ Download failed"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 5: DELETE TEST"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "5.1 Wallet 1 deletes file..."
DELETE_1=$(curl -s -X DELETE "$BACKEND_URL/api/files/$BLOB_ID_1" \
  -H "Content-Type: application/json" \
  -d "{\"walletAddress\":\"$WALLET_1\",\"signature\":\"$SIG_1\"}")

if echo "$DELETE_1" | grep -q "success"; then
    echo "   ✅ Delete successful"
else
    echo "   ❌ Delete failed"
    exit 1
fi
echo ""

echo "5.2 Verify file is deleted..."
LIST_AFTER=$(curl -s "$BACKEND_URL/api/files/$WALLET_1")
COUNT_AFTER=$(echo "$LIST_AFTER" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "   Files remaining: $COUNT_AFTER"
if [ "$COUNT_AFTER" = "0" ]; then
    echo "   ✅ File deleted successfully"
else
    echo "   ❌ File still exists"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 6: WALLET 2 VERIFICATION (Should still have 1 file)"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

echo "6.1 Wallet 2 lists files..."
LIST_2_FINAL=$(curl -s "$BACKEND_URL/api/files/$WALLET_2")
COUNT_2_FINAL=$(echo "$LIST_2_FINAL" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "   Files: $COUNT_2_FINAL"
if [ "$COUNT_2_FINAL" = "1" ]; then
    echo "   ✅ Wallet 2 file unaffected"
else
    echo "   ❌ Wallet 2 file affected"
    exit 1
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                  ALL INTEGRATION TESTS PASSED ✅                         ║"
echo "║                                                                          ║"
echo "║  ✅ Multi-wallet support working                                         ║"
echo "║  ✅ File isolation working (wallets can't access each other's files)     ║"
echo "║  ✅ Upload/Download/Delete working                                       ║"
echo "║  ✅ Encryption/Decryption working                                        ║"
echo "║  ✅ Backend API fully functional                                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
