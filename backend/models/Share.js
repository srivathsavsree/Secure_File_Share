const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.ObjectId,
    ref: 'File',
    required: true
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  accessCount: {
    type: Number,
    default: 0
  },
  isAccessed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Set expiration to 24 hours from now
      const date = new Date();
      date.setHours(date.getHours() + 24);
      return date;
    }
  }
});

// Create index for auto-deleting expired shares
ShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Share', ShareSchema);
