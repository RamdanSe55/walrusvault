#!/bin/bash

# Create test file (5MB)
TEST_FILE="/tmp/test-5mb.bin"
dd if=/dev/urandom of=$TEST_FILE bs=1M count=5 2>/dev/null

# Convert to base64
FILE_DATA=$(base64 -w 0 $TEST_FILE)

# Upload
curl -s -X POST http://localhost:3001/api/upload \
  -H "Content-Type: application/json" \
  -d "{
    \"fileName\": \"test-5mb.bin\",
    \"fileData\": \"$FILE_DATA\",
    \"walletAddress\": \"0x1234567890abcdef\",
    \"signature\": \"sig_test_12345\"
  }" | jq .

echo ""
echo "Testing 15MB file (should fail)..."
TEST_FILE_LARGE="/tmp/test-15mb.bin"
dd if=/dev/urandom of=$TEST_FILE_LARGE bs=1M count=15 2>/dev/null
FILE_DATA_LARGE=$(base64 -w 0 $TEST_FILE_LARGE)

curl -s -X POST http://localhost:3001/api/upload \
  -H "Content-Type: application/json" \
  -d "{
    \"fileName\": \"test-15mb.bin\",
    \"fileData\": \"$FILE_DATA_LARGE\",
    \"walletAddress\": \"0x1234567890abcdef\",
    \"signature\": \"sig_test_12345\"
  }" | jq .
