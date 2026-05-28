const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Walrus Service - Handles decentralized blob storage
 */
class WalrusService {
  constructor() {
    this.publisherUrl = process.env.WALRUS_PUBLISHER || 'https://publisher.walrus-testnet.walrus.space';
    this.aggregatorUrl = process.env.WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space';
    this.endpoint = process.env.WALRUS_ENDPOINT || 'https://walrus-testnet-publisher.nodes.guru';
  }

  /**
   * Upload file to Walrus storage
   * @param {String} filePath - Path to file
   * @param {Number} epochs - Storage duration in epochs (default: 5)
   * @returns {Object} Upload result with blob ID
   */
  async uploadFile(filePath, epochs = 5) {
    try {
      console.log('📤 Uploading file to Walrus:', filePath);

      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fileBuffer.length;

      // Create form data
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: filePath.split('/').pop(),
        contentType: 'application/octet-stream'
      });

      // Upload to Walrus publisher
      const response = await axios.put(
        `${this.publisherUrl}/v1/store?epochs=${epochs}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxBodyLength: Infinity,
          timeout: 60000 // 60 seconds
        }
      );

      console.log('✅ File uploaded to Walrus successfully');

      // Extract blob ID from response
      const blobId = response.data?.newlyCreated?.blobObject?.blobId || 
                     response.data?.alreadyCertified?.blobId ||
                     `blob_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      return {
        success: true,
        blobId: blobId,
        size: fileSize,
        epochs: epochs,
        endEpoch: response.data?.newlyCreated?.blobObject?.storage?.endEpoch || null,
        url: `${this.aggregatorUrl}/v1/${blobId}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error uploading to Walrus:', error.message);
      
      // Fallback: Return mock blob ID for development
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Using mock blob ID for development');
        return {
          success: true,
          blobId: `mock_blob_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          size: fs.statSync(filePath).size,
          epochs: epochs,
          endEpoch: null,
          url: `${this.aggregatorUrl}/v1/mock_blob`,
          timestamp: new Date().toISOString(),
          mock: true
        };
      }

      throw error;
    }
  }

  /**
   * Download file from Walrus storage
   * @param {String} blobId - Blob ID
   * @returns {Buffer} File buffer
   */
  async downloadFile(blobId) {
    try {
      console.log('📥 Downloading file from Walrus:', blobId);

      const response = await axios.get(
        `${this.aggregatorUrl}/v1/${blobId}`,
        {
          responseType: 'arraybuffer',
          timeout: 60000 // 60 seconds
        }
      );

      console.log('✅ File downloaded from Walrus successfully');

      return Buffer.from(response.data);
    } catch (error) {
      console.error('❌ Error downloading from Walrus:', error.message);
      throw error;
    }
  }

  /**
   * Check if blob exists
   * @param {String} blobId - Blob ID
   * @returns {Boolean} Exists status
   */
  async blobExists(blobId) {
    try {
      const response = await axios.head(
        `${this.aggregatorUrl}/v1/${blobId}`,
        { timeout: 10000 }
      );

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get blob metadata
   * @param {String} blobId - Blob ID
   * @returns {Object} Blob metadata
   */
  async getBlobMetadata(blobId) {
    try {
      console.log('🔍 Fetching blob metadata:', blobId);

      const response = await axios.head(
        `${this.aggregatorUrl}/v1/${blobId}`,
        { timeout: 10000 }
      );

      return {
        blobId: blobId,
        size: parseInt(response.headers['content-length']) || 0,
        contentType: response.headers['content-type'] || 'application/octet-stream',
        exists: true,
        url: `${this.aggregatorUrl}/v1/${blobId}`
      };
    } catch (error) {
      console.error('❌ Error fetching blob metadata:', error.message);
      return {
        blobId: blobId,
        exists: false
      };
    }
  }

  /**
   * Get Walrus network status
   * @returns {Object} Network status
   */
  async getNetworkStatus() {
    try {
      const response = await axios.get(
        `${this.publisherUrl}/v1/status`,
        { timeout: 5000 }
      );

      return {
        status: 'connected',
        network: 'walrus-testnet',
        publisherUrl: this.publisherUrl,
        aggregatorUrl: this.aggregatorUrl,
        timestamp: new Date().toISOString(),
        details: response.data
      };
    } catch (error) {
      return {
        status: 'disconnected',
        network: 'walrus-testnet',
        publisherUrl: this.publisherUrl,
        aggregatorUrl: this.aggregatorUrl,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

module.exports = new WalrusService();
