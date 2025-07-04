const CryptoJS = require('crypto-js');
const crypto = require('crypto');

// Generate a random encryption key
exports.generateEncryptionKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Encrypt file data using AES-256
exports.encryptFile = (fileData, key) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(fileData, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('File encryption failed');
  }
};

// Decrypt file data
exports.decryptFile = (encryptedData, key) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('File decryption failed');
  }
};

// Encrypt key for storage (adds another layer of security)
exports.encryptKey = (key) => {
  const encryptionSecret = process.env.JWT_SECRET; // Using JWT secret for key encryption
  try {
    const encrypted = CryptoJS.AES.encrypt(key, encryptionSecret).toString();
    return encrypted;
  } catch (error) {
    console.error('Key encryption error:', error);
    throw new Error('Key encryption failed');
  }
};

// Decrypt stored key
exports.decryptKey = (encryptedKey) => {
  const encryptionSecret = process.env.JWT_SECRET;
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedKey, encryptionSecret);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Key decryption error:', error);
    throw new Error('Key decryption failed');
  }
};
