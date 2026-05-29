#!/bin/bash

# Create 1MB test file
TEST_FILE="/tmp/test-1mb.bin"
dd if=/dev/urandom of=$TEST_FILE bs=1M count=1 2>/dev/null

# Convert to base64
FILE_DATA=$(base64 -w 0 $TEST_FILE)

# Upload
echo "Testing 1MB file upload..."
curl -s -X POST http://localhost:3001/api/upload \
  -H "Content-Type: application/json" \
  -d "{\"fileName\":\"test-1mb.bin\",\"fileData\":\"$FILE_DATA\",\"walletAddress\":\"0x1234567890abcdef\",\"signature\":\"sig_test_12345\"}" | jq .

# List files
echo ""
echo "Listing files for wallet..."
curl -s http://localhost:3001/api/files/0x1234567890abcdef | jq .
