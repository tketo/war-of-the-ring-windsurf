// Mock the logger before requiring the error handler
jest.mock('../../../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

// Now import the modules
const { errorHandler } = require('../../../middleware/errorHandler');
const { logger } = require('../../../utils/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      path: '/test'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    logger.error.mockClear();
  });

  it('should handle standard errors with status code', () => {
    const error = new Error('Test error');
    error.statusCode = 400;
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Test error'
      }
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('should default to 500 status code for errors without statusCode', () => {
    const error = new Error('Server error');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Server error'
      }
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle validation errors', () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.errors = {
      name: { path: 'name', message: 'Name is required' },
      email: { path: 'email', message: 'Invalid email format' }
    };
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Validation failed',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Invalid email format' }
        ]
      }
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle MongoDB duplicate key errors', () => {
    const error = {
      name: 'MongoError',
      code: 11000,
      keyValue: { email: 'test@example.com' }
    };
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Duplicate key error',
        field: 'email',
        value: 'test@example.com'
      }
    });
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle production environment by hiding error details', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Sensitive error details');
    error.statusCode = 500;
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Internal server error'
      }
    });
    expect(logger.error).toHaveBeenCalled();
    
    // Restore environment
    process.env.NODE_ENV = originalEnv;
  });
});
