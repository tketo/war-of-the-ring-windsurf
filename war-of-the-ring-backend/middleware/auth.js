const clerk = require('@clerk/clerk-sdk-node');
const { logger } = require('../utils/logger');

/**
 * Authentication middleware using Clerk
 * Verifies JWT token and attaches user data to the request
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get the session token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: {
          message: 'Authentication required'
        }
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: {
          message: 'Invalid token format'
        }
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token with Clerk
      const session = await clerk.verifyToken(token);
      
      // Attach user data to request
      req.userId = session.sub;
      req.sessionId = session.sid;
      
      next();
    } catch (error) {
      logger.warn('Token verification error', { error: error.message });
      return res.status(401).json({ 
        success: false,
        error: {
          message: error.message || 'Invalid token'
        }
      });
    }
  } catch (error) {
    logger.error('Auth middleware error', { error: error.stack });
    return res.status(500).json({ 
      success: false,
      error: {
        message: 'Internal server error'
      }
    });
  }
};

module.exports = {
  requireAuth
};
