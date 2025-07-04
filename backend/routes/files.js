const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const File = require('../models/File');
const Share = require('../models/Share');
const { encryptFile, decryptFile, generateEncryptionKey, encryptKey, decryptKey } = require('../utils/encryption');
const { validateFileType, generateFileName, saveFile, readFile, deleteFile, generateQRCode } = require('../utils/fileUtils');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for encryption

const upload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 50000000 // Default 50MB
  },
  fileFilter: (req, file, cb) => {
    // Check if file type is allowed
    const allowedTypes = process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx,txt,zip,rar';
    const fileExt = path.extname(file.originalname).substring(1);
    
    if (!validateFileType(file.mimetype, allowedTypes)) {
      return cb(new Error('File type not allowed'), false);
    }
    
    cb(null, true);
  }
});

// Ensure upload directory exists
const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// @route   POST api/files/upload
// @desc    Upload a file
// @access  Private
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload a file'
      });
    }

    const { originalname, mimetype, size, buffer } = req.file;
    
    // Generate encryption key
    const encryptionKey = generateEncryptionKey();
    
    // Encrypt file data
    const encryptedData = encryptFile(buffer.toString('base64'), encryptionKey);
    
    // Generate unique filename
    const filename = generateFileName(originalname);
    
    // Save encrypted file
    const filePath = path.join(uploadPath, filename);
    await saveFile(filePath, encryptedData);
    
    // Encrypt the encryption key for storage
    const encryptedKey = encryptKey(encryptionKey);
    
    // Create file record
    const file = await File.create({
      originalName: originalname,
      filename,
      fileSize: size,
      fileType: mimetype,
      encryptionKey: encryptedKey,
      owner: req.user.id,
      path: filePath,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    res.status(201).json({
      status: 'success',
      data: {
        file: {
          id: file._id,
          originalName: file.originalName,
          fileSize: file.fileSize,
          fileType: file.fileType,
          createdAt: file.createdAt,
          expiresAt: file.expiresAt
        }
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
});

// @route   POST api/files/share
// @desc    Share a file with another user
// @access  Private
router.post('/share', protect, 
  [
    check('fileId', 'File ID is required').not().isEmpty(),
    check('recipientEmail', 'Recipient email is required').isEmail()
  ], 
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', errors: errors.array() });
    }

    try {
      const { fileId, recipientEmail } = req.body;
      
      // Check if file exists and belongs to user
      const file = await File.findOne({ _id: fileId, owner: req.user.id });
      
      if (!file) {
        return res.status(404).json({
          status: 'fail',
          message: 'File not found or you do not have permission'
        });
      }
      
      // Check if recipient exists
      const recipient = await User.findOne({ email: recipientEmail });
      
      if (!recipient) {
        return res.status(404).json({
          status: 'fail',
          message: 'Recipient user not found'
        });
      }
      
      // Create share record
      const share = await Share.create({
        file: file._id,
        sender: req.user.id,
        recipient: recipient._id,
        expiresAt: file.expiresAt // Use the same expiration time as the file
      });
      
      res.status(201).json({
        status: 'success',
        data: {
          share: {
            id: share._id,
            file: {
              id: file._id,
              originalName: file.originalName
            },
            recipient: {
              id: recipient._id,
              email: recipient.email
            },
            expiresAt: share.expiresAt
          }
        }
      });
    } catch (error) {
      console.error('Share error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Server Error'
      });
    }
  }
);

// @route   GET api/files/shared
// @desc    Get files shared by the user
// @access  Private
router.get('/shared', protect, async (req, res) => {
  try {
    const shares = await Share.find({ sender: req.user.id })
      .populate('file', 'originalName filename fileSize fileType createdAt expiresAt')
      .populate('recipient', 'name email')
      .sort('-createdAt');
      
    res.json({
      status: 'success',
      data: {
        count: shares.length,
        shares
      }
    });
  } catch (error) {
    console.error('Get shared files error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
});

// @route   GET api/files/received
// @desc    Get files shared with the user
// @access  Private
router.get('/received', protect, async (req, res) => {
  try {
    const shares = await Share.find({ recipient: req.user.id })
      .populate('file', 'originalName filename fileSize fileType createdAt expiresAt')
      .populate('sender', 'name email')
      .sort('-createdAt');
    
    // Add decryption keys and QR codes to response
    const sharesWithKeys = await Promise.all(shares.map(async (share) => {
      const file = await File.findById(share.file);
      
      if (!file) {
        return null;
      }
      
      // Decrypt the stored encryption key
      const decryptedKey = decryptKey(file.encryptionKey);
      
      // Generate QR code with file ID and key
      const qrData = JSON.stringify({
        fileId: file._id,
        key: decryptedKey
      });
      
      // Get QR code as data URL
      const qrCode = await generateQRCode(qrData);
      
      return {
        ...share.toObject(),
        decryptionKey: decryptedKey,
        qrCode
      };
    }));
    
    // Filter out any null values (files that no longer exist)
    const validShares = sharesWithKeys.filter(share => share !== null);
    
    res.json({
      status: 'success',
      data: {
        count: validShares.length,
        shares: validShares
      }
    });
  } catch (error) {
    console.error('Get received files error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
});

// @route   GET api/files/download/:id
// @desc    Download a file
// @access  Private
router.get('/download/:id', protect, async (req, res) => {
  try {
    const fileId = req.params.id;
    const { key } = req.query;
    
    if (!key) {
      return res.status(400).json({
        status: 'fail',
        message: 'Decryption key is required'
      });
    }
    
    // Find file
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({
        status: 'fail',
        message: 'File not found'
      });
    }
    
    // Check if user has access to file (owner or recipient)
    const isOwner = file.owner.toString() === req.user.id;
    const isRecipient = await Share.findOne({
      file: fileId,
      recipient: req.user.id
    });
    
    if (!isOwner && !isRecipient) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this file'
      });
    }
    
    // If user is a recipient, update access count
    if (isRecipient) {
      isRecipient.accessCount += 1;
      isRecipient.isAccessed = true;
      await isRecipient.save();
    }
    
    // Read encrypted file
    const encryptedData = await readFile(file.path);
    
    // Decrypt file using provided key
    const decryptedData = decryptFile(encryptedData.toString(), key);
    
    // Convert back to buffer from base64
    const fileBuffer = Buffer.from(decryptedData, 'base64');
    
    // Set headers for file download
    res.setHeader('Content-Type', file.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
});

// @route   GET api/files/qr/:id
// @desc    Get QR code for file download
// @access  Private
router.get('/qr/:id', protect, async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Find file
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({
        status: 'fail',
        message: 'File not found'
      });
    }
    
    // Check if user has access to file (owner or recipient)
    const isOwner = file.owner.toString() === req.user.id;
    const isRecipient = await Share.findOne({
      file: fileId,
      recipient: req.user.id
    });
    
    if (!isOwner && !isRecipient) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to access this file'
      });
    }
    
    // Decrypt the stored encryption key
    const decryptedKey = decryptKey(file.encryptionKey);
    
    // Generate QR code with just the URL, not including the decryption key
    // This way the key is entered separately for better security
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrData = `${frontendUrl}/file/${file._id}`;
    
    const qrCode = await generateQRCode(qrData);
    
    res.json({
      status: 'success',
      data: {
        qrCode
      }
    });
  } catch (error) {
    console.error('QR code error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
});

// @route   DELETE api/files/:id
// @desc    Delete a file
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Find file
    const file = await File.findById(fileId);
    
    if (!file) {
      return res.status(404).json({
        status: 'fail',
        message: 'File not found'
      });
    }
    
    // Check if user is the owner
    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this file'
      });
    }
    
    // Delete file from disk
    await deleteFile(file.path);
    
    // Delete related shares
    await Share.deleteMany({ file: fileId });
    
    // Delete file record using deleteOne() instead of deprecated remove()
    await File.deleteOne({ _id: fileId });
    
    res.json({
      status: 'success',
      data: {}
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
});

// @route   DELETE api/files/shares/:shareId
// @desc    Delete a shared file link
// @access  Private
router.delete('/shares/:shareId', protect, async (req, res) => {
  try {
    const share = await Share.findById(req.params.shareId);
    
    if (!share) {
      return res.status(404).json({
        status: 'fail',
        message: 'Share not found'
      });
    }
    
    // Check if user is the sender of the share
    if (share.sender.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this share'
      });
    }
    
    // Delete the share record using deleteOne() instead of deprecated remove()
    await Share.deleteOne({ _id: req.params.shareId });
    
    res.json({
      status: 'success',
      data: {}
    });
  } catch (error) {
    console.error('Delete share error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server Error'
    });
  }
});

// @route   GET api/files/:id
// @desc    Get public file info (only name and existence)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Find file but only return minimal info
    const file = await File.findById(fileId).select('originalName');
    
    if (!file) {
      return res.status(404).json({
        status: 'fail',
        message: 'File not found'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        file: {
          _id: file._id,
          originalName: file.originalName
        }
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
