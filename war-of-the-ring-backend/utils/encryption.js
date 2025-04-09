const crypto = require('crypto');

/**
 * Utility functions for AES-256 encryption and decryption
 */
const encryptionUtils = {
  /**
   * Generate a secure encryption key
   * @returns {string} Hex-encoded 32-byte key for AES-256
   */
  generateKey: () => {
    return crypto.randomBytes(32).toString('hex');
  },

  /**
   * Encrypt data using AES-256-CBC
   * @param {Object|string} data - Data to encrypt
   * @param {string} key - Hex-encoded encryption key
   * @returns {string} Encrypted data in format 'iv:encryptedData'
   */
  encrypt: (data, key) => {
    // Convert data to string if it's an object
    const dataString = typeof data === 'object' ? JSON.stringify(data) : data.toString();
    
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Create cipher with key and iv
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      Buffer.from(key, 'hex'), 
      iv
    );
    
    // Encrypt the data
    let encrypted = cipher.update(dataString, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return iv and encrypted data
    return `${iv.toString('hex')}:${encrypted}`;
  },

  /**
   * Decrypt data using AES-256-CBC
   * @param {string} encryptedData - Data in format 'iv:encryptedData'
   * @param {string} key - Hex-encoded encryption key
   * @returns {Object|string} Decrypted data
   */
  decrypt: (encryptedData, key) => {
    // Split the iv and encrypted data
    const [ivHex, encryptedHex] = encryptedData.split(':');
    
    // Convert hex to buffers
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    // Create decipher with key and iv
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      Buffer.from(key, 'hex'), 
      iv
    );
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Try to parse as JSON if possible
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      // Return as string if not valid JSON
      return decrypted;
    }
  },

  /**
   * Hash a string using SHA-256
   * @param {string} data - Data to hash
   * @returns {string} Hex-encoded hash
   */
  hash: (data) => {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }
};

module.exports = encryptionUtils;
