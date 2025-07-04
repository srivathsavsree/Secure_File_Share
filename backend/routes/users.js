const express = require('express');
const { check, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      status: 'success',
      count: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'error',
      message: 'Server Error'
    });
  }
});

// @route   GET api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Server Error'
    });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    protect,
    [
      check('name', 'Name is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', errors: errors.array() });
    }

    const { name } = req.body;

    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }
      
      user.name = name;
      
      await user.save();
      
      res.json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
          }
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        status: 'error',
        message: 'Server Error'
      });
    }
  }
);

// @route   PUT api/users/password
// @desc    Update user password
// @access  Private
router.put(
  '/password',
  [
    protect,
    [
      check('currentPassword', 'Current password is required').exists(),
      check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'fail', errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user.id).select('+password');
      
      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'User not found'
        });
      }
      
      // Check if current password matches
      const isMatch = await user.matchPassword(currentPassword);
      
      if (!isMatch) {
        return res.status(401).json({
          status: 'fail',
          message: 'Current password is incorrect'
        });
      }
      
      // Update password
      user.password = newPassword;
      
      await user.save();
      
      res.json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        status: 'error',
        message: 'Server Error'
      });
    }
  }
);

module.exports = router;
