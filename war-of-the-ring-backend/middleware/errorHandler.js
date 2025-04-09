/**
 * Global error handling middleware
 * Provides consistent error responses across the API
 */
const { logger } = require('../utils/logger');

// Custom API error class
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Default error values
  const statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Log the error with context
  logger.error(`${statusCode} - ${message}`, {
    method: req.method,
    path: req.path,
    statusCode,
    error: err.stack
  });
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    const errors = Object.values(err.errors || {}).map(val => ({
      field: val.path,
      message: val.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        errors
      }
    });
  } 
  
  if (err.name === 'CastError') {
    // Mongoose cast error
    return res.status(400).json({
      success: false,
      error: {
        message: `Invalid ${err.path}: ${err.value}`
      }
    });
  } 
  
  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    
    return res.status(409).json({
      success: false,
      error: {
        message: 'Duplicate key error',
        field,
        value
      }
    });
  }
  
  // In production, don't expose error details
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message
    }
  });
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not found - ${req.originalUrl}`);
  next(error);
};

module.exports = {
  ApiError,
  errorHandler,
  notFound
};
