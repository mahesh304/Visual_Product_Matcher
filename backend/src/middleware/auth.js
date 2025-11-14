import jwt from 'jsonwebtoken';

/**
 * Authentication Middleware
 * Protects routes that require user authentication
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
    }
    
    // Verify token
    const secret = process.env.JWT_SECRET || 'visual-product-matcher-secret-key-change-in-production-2025';
    const decoded = jwt.verify(token, secret);
    
    // Attach user ID to request
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('❌ [authenticate] Error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please log in again.',
    });
  }
};

/**
 * Optional Authentication Middleware
 * Adds user info if authenticated, but doesn't block request
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'visual-product-matcher-secret-key-change-in-production-2025');
    req.userId = decoded.userId;
    
    // Fetch user details from database
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail - user not authenticated
  }
  
  next();
};
