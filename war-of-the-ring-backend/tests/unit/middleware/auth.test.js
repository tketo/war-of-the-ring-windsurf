// Mock dependencies before requiring the auth middleware
jest.mock('@clerk/clerk-sdk-node', () => ({
  verifyToken: jest.fn()
}));

jest.mock('../../../utils/logger', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Import modules after mocking
const clerk = require('@clerk/clerk-sdk-node');
const { requireAuth } = require('../../../middleware/auth');
const { logger } = require('../../../utils/logger');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should return 401 when no authorization header is present', async () => {
      await requireAuth(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Authentication required'
        }
      });
    });

    it('should return 401 when authorization header format is invalid', async () => {
      req.headers.authorization = 'InvalidFormat';
      
      await requireAuth(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid token format'
        }
      });
    });

    it('should return 401 when token is invalid', async () => {
      clerk.verifyToken.mockRejectedValue(new Error('Invalid token'));
      
      req.headers.authorization = 'Bearer invalidtoken';
      
      await requireAuth(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid token'
        }
      });
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should set req.userId and call next() when token is valid', async () => {
      clerk.verifyToken.mockResolvedValue({
        sub: 'user_123',
        sid: 'session_123'
      });
      
      req.headers.authorization = 'Bearer validtoken';
      
      await requireAuth(req, res, next);
      
      expect(clerk.verifyToken).toHaveBeenCalledWith('validtoken');
      expect(req.userId).toBe('user_123');
      expect(req.sessionId).toBe('session_123');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
