import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth.js';
import SearchHistory from '../models/SearchHistory.js';
import User from '../models/User.js';

const router = express.Router();

const JWT_EXPIRES_IN = '7d';

// Helper to get JWT secret
const getJwtSecret = () => process.env.JWT_SECRET || 'visual-product-matcher-secret-key-change-in-production-2025';

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password',
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create account',
    });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password',
      });
    }
    
    // Find user (include password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }
    
    const secret = getJwtSecret();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      secret,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/history
 * Get user's search history
 */
router.get('/auth/history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const history = await SearchHistory
      .find({ user: req.userId })
      .sort({ searchedAt: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * DELETE /api/auth/history/:id
 * Delete a specific search history item
 */
router.delete('/auth/history/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find and delete the history item (ensure it belongs to the user)
    const deletedItem = await SearchHistory.findOneAndDelete({
      _id: id,
      user: req.userId,
    });
    
    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        error: 'History item not found or unauthorized',
      });
    }
    
    res.json({
      success: true,
      message: 'Search history deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
