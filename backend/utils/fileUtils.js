const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const QRCode = require('qrcode');

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

// Validate file type
exports.validateFileType = (fileType, allowedTypes) => {
  const allowedTypesArray = allowedTypes.split(',');
  const extension = fileType.split('/')[1];
  
  return allowedTypesArray.includes(extension);
};

// Generate unique file name
exports.generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 12);
  const extension = path.extname(originalName);
  
  return `${timestamp}-${randomString}${extension}`;
};

// Save file to disk
exports.saveFile = async (filePath, fileData) => {
  try {
    await writeFileAsync(filePath, fileData);
    return true;
  } catch (error) {
    console.error('File save error:', error);
    throw new Error('Failed to save file');
  }
};

// Read file from disk
exports.readFile = async (filePath) => {
  try {
    const fileData = await readFileAsync(filePath);
    return fileData;
  } catch (error) {
    console.error('File read error:', error);
    throw new Error('Failed to read file');
  }
};

// Delete file from disk
exports.deleteFile = async (filePath) => {
  try {
    await unlinkAsync(filePath);
    return true;
  } catch (error) {
    console.error('File delete error:', error);
    throw new Error('Failed to delete file');
  }
};

// Generate QR code for file download
exports.generateQRCode = async (data) => {
  try {
    const qrCodeData = await QRCode.toDataURL(data);
    return qrCodeData;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};
