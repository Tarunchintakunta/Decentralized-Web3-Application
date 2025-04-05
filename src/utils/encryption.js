import CryptoJS from 'crypto-js';

/**
 * Encrypt patient data using AES encryption
 * @param {Object} data - Data to encrypt
 * @param {string} privateKey - Patient's private key for encryption
 * @returns {string} - Encrypted data string
 */
export const encryptData = (data, privateKey) => {
  try {
    // Convert data object to string
    const dataString = JSON.stringify(data);
    
    // Generate an encryption key from the private key
    const encryptionKey = CryptoJS.SHA256(privateKey).toString();
    
    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(dataString, encryptionKey).toString();
    
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt patient data using AES decryption
 * @param {string} encryptedData - Encrypted data string
 * @param {string} privateKey - Patient's private key for decryption
 * @returns {Object} - Decrypted data object
 */
export const decryptData = (encryptedData, privateKey) => {
  try {
    // Generate the decryption key from the private key
    const decryptionKey = CryptoJS.SHA256(privateKey).toString();
    
    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
    
    // Convert the decrypted data to string then parse as JSON
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
    
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Generate a unique record ID
 * @returns {string} - Unique record ID
 */
export const generateRecordId = () => {
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 10);
  return `record_${timestamp}_${random}`;
};

/**
 * Hash patient data for verification purposes
 * @param {Object} data - Data to hash
 * @returns {string} - Hash of the data
 */
export const hashData = (data) => {
  try {
    const dataString = JSON.stringify(data);
    return CryptoJS.SHA256(dataString).toString();
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
};

/**
 * Verify data integrity using hash
 * @param {Object} data - Data to verify
 * @param {string} hash - Original hash of the data
 * @returns {boolean} - Whether the data is valid
 */
export const verifyDataIntegrity = (data, hash) => {
  try {
    const dataString = JSON.stringify(data);
    const currentHash = CryptoJS.SHA256(dataString).toString();
    return currentHash === hash;
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};