const encryptionUtils = require('../../../utils/encryption');

describe('Encryption Utilities', () => {
  describe('generateKey', () => {
    it('should generate a 64-character hex string', () => {
      const key = encryptionUtils.generateKey();
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate different keys on each call', () => {
      const key1 = encryptionUtils.generateKey();
      const key2 = encryptionUtils.generateKey();
      expect(key1).not.toEqual(key2);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const key = encryptionUtils.generateKey();
      const data = 'test data';
      
      const encrypted = encryptionUtils.encrypt(data, key);
      expect(encrypted).toBeTruthy();
      expect(encrypted).toContain(':'); // IV:encryptedData format
      
      const decrypted = encryptionUtils.decrypt(encrypted, key);
      expect(decrypted).toEqual(data);
    });

    it('should encrypt and decrypt an object correctly', () => {
      const key = encryptionUtils.generateKey();
      const data = { test: 'data', number: 123 };
      
      const encrypted = encryptionUtils.encrypt(data, key);
      expect(encrypted).toBeTruthy();
      
      const decrypted = encryptionUtils.decrypt(encrypted, key);
      expect(decrypted).toEqual(data);
    });

    it('should produce different ciphertexts for the same plaintext', () => {
      const key = encryptionUtils.generateKey();
      const data = 'test data';
      
      const encrypted1 = encryptionUtils.encrypt(data, key);
      const encrypted2 = encryptionUtils.encrypt(data, key);
      
      expect(encrypted1).not.toEqual(encrypted2);
    });

    it('should throw an error when decrypting with wrong key', () => {
      const key1 = encryptionUtils.generateKey();
      const key2 = encryptionUtils.generateKey();
      const data = 'test data';
      
      const encrypted = encryptionUtils.encrypt(data, key1);
      
      expect(() => {
        encryptionUtils.decrypt(encrypted, key2);
      }).toThrow();
    });
  });

  describe('hash', () => {
    it('should generate a consistent hash for the same input', () => {
      const data = 'test data';
      const hash1 = encryptionUtils.hash(data);
      const hash2 = encryptionUtils.hash(data);
      
      expect(hash1).toEqual(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = encryptionUtils.hash('test data 1');
      const hash2 = encryptionUtils.hash('test data 2');
      
      expect(hash1).not.toEqual(hash2);
    });

    it('should generate a 64-character hex string', () => {
      const hash = encryptionUtils.hash('test data');
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});
