/**
 * Test Wallet Flow - Simulates real wallet interaction
 * Tests: signature generation → upload → download → decrypt
 */

const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:3001';

// Mock wallet data
const mockWallet = {
  address: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
  privateKey: 'mock_private_key_for_testing'
};

// Simulate wallet signature
function generateMockSignature(message) {
  const hash = crypto.createHash('sha256').update(message).digest('hex');
  return `0x${hash}${hash.substring(0, 32)}`;
}

async function testWalletFlow() {
  console.log('\n🧪 Testing Wallet Flow End-to-End\n');
  console.log('Wallet Address:', mockWallet.address);
  
  try {
    // Step 1: Generate signature
    const message = `WalrusVault:encrypt:test-file.txt:${mockWallet.address}`;
    const signature = generateMockSignature(message);
    console.log('✅ Step 1: Signature generated');
    console.log('   Message:', message);
    console.log('   Signature:', signature.substring(0, 20) + '...');

    // Step 2: Upload file
    const testFile = '/tmp/test-file.txt';
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFile));
    formData.append('walletAddress', mockWallet.address);
    formData.append('signature', signature);

    const uploadResponse = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: formData.getHeaders()
    });

    if (!uploadResponse.data.success) {
      throw new Error('Upload failed: ' + uploadResponse.data.error);
    }

    const uploadedFile = uploadResponse.data.file;
    console.log('✅ Step 2: File uploaded successfully');
    console.log('   File Hash:', uploadedFile.fileHash.substring(0, 20) + '...');
    console.log('   Walrus Blob ID:', uploadedFile.walrusBlobId);
    console.log('   TX Hash:', uploadedFile.transactionHash);

    // Step 3: List files
    const listResponse = await axios.get(`${API_URL}/api/files/list`);
    console.log('✅ Step 3: Files listed');
    console.log('   Total files:', listResponse.data.files.length);

    // Step 4: Download and decrypt
    const downloadResponse = await axios.post(`${API_URL}/api/files/download`, {
      fileName: uploadedFile.fileName,
      signature: signature
    }, {
      responseType: 'arraybuffer'
    });

    const decryptedContent = Buffer.from(downloadResponse.data).toString('utf-8');
    console.log('✅ Step 4: File downloaded and decrypted');
    console.log('   Content:', decryptedContent.substring(0, 50) + '...');

    // Verify content matches
    const originalContent = fs.readFileSync(testFile, 'utf-8');
    if (decryptedContent === originalContent) {
      console.log('✅ Step 5: Content verification PASSED');
    } else {
      throw new Error('Content mismatch after decryption');
    }

    console.log('\n✅ All tests PASSED!\n');
    return true;

  } catch (error) {
    console.error('\n❌ Test FAILED:', error.message);
    return false;
  }
}

// Run test
testWalletFlow().then(success => {
  process.exit(success ? 0 : 1);
});
