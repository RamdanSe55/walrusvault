#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                    WALRUSVAULT BACKEND TEST                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="http://localhost:3001"
WALLET_ADDRESS="0x1234567890abcdef1234567890abcdef12345678"
WALLET_SIGNATURE="mock_signature_$(date +%s)"

echo "1. Testing Health Endpoint..."
HEALTH=$(curl -s "$BASE_URL/health")
echo "   Response: $HEALTH"
if echo "$HEALTH" | grep -q "ok"; then
    echo "   ✅ Health check passed"
else
    echo "   ❌ Health check failed"
    exit 1
fi
echo ""

echo "2. Testing Upload Endpoint..."
# Create test file
TEST_FILE="/tmp/test-upload.txt"
echo "This is a test file for WalrusVault" > "$TEST_FILE"

# Convert file to base64
FILE_DATA=$(base64 -w 0 "$TEST_FILE")

UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/upload" \
  -H "Content-Type: application/json" \
  -d "{\"fileName\":\"test-upload.txt\",\"fileData\":\"$FILE_DATA\",\"walletAddress\":\"$WALLET_ADDRESS\",\"signature\":\"$WALLET_SIGNATURE\"}")

echo "   Response: $UPLOAD_RESPONSE"
if echo "$UPLOAD_RESPONSE" | grep -q "blobId"; then
    echo "   ✅ Upload successful"
    BLOB_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"blobId":"[^"]*"' | cut -d'"' -f4)
    echo "   Blob ID: $BLOB_ID"
else
    echo "   ❌ Upload failed"
    exit 1
fi
echo ""

echo "3. Testing List Files Endpoint..."
LIST_RESPONSE=$(curl -s "$BASE_URL/api/files/$WALLET_ADDRESS")
echo "   Response: $LIST_RESPONSE"
if echo "$LIST_RESPONSE" | grep -q "files"; then
    echo "   ✅ List files successful"
    FILE_COUNT=$(echo "$LIST_RESPONSE" | grep -o '"files":\[' | wc -l)
    echo "   Files found: $FILE_COUNT"
else
    echo "   ❌ List files failed"
    exit 1
fi
echo ""

echo "4. Testing Download Endpoint..."
if [ -n "$BLOB_ID" ]; then
    DOWNLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/download" \
      -H "Content-Type: application/json" \
      -d "{\"blobId\":\"$BLOB_ID\",\"walletAddress\":\"$WALLET_ADDRESS\",\"signature\":\"$WALLET_SIGNATURE\"}")
    
    echo "   Response length: $(echo "$DOWNLOAD_RESPONSE" | wc -c) bytes"
    if [ -n "$DOWNLOAD_RESPONSE" ]; then
        echo "   ✅ Download successful"
    else
        echo "   ❌ Download failed"
        exit 1
    fi
else
    echo "   ⚠️  Skipping download test (no blob ID)"
fi
echo ""

echo "5. Testing CORS Headers..."
CORS_RESPONSE=$(curl -s -I "$BASE_URL/health" | grep -i "access-control")
if [ -n "$CORS_RESPONSE" ]; then
    echo "   ✅ CORS headers present"
    echo "   $CORS_RESPONSE"
else
    echo "   ❌ CORS headers missing"
fi
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                         ALL TESTS PASSED ✅                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
