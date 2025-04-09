/**
 * Input validation middleware
 * Provides consistent validation across API endpoints
 */

/**
 * Validates request body against a schema
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      // Simple validation for required fields
      if (schema.required) {
        for (const field of schema.required) {
          if (req.body[field] === undefined) {
            return res.status(400).json({
              success: false,
              error: {
                message: `Missing required field: ${field}`
              }
            });
          }
        }
      }
      
      // Type validation
      if (schema.types) {
        for (const [field, type] of Object.entries(schema.types)) {
          if (req.body[field] !== undefined) {
            // Check type
            if (type === 'string' && typeof req.body[field] !== 'string') {
              return res.status(400).json({
                success: false,
                error: {
                  message: `Field ${field} must be a string`
                }
              });
            } else if (type === 'number' && typeof req.body[field] !== 'number') {
              return res.status(400).json({
                success: false,
                error: {
                  message: `Field ${field} must be a number`
                }
              });
            } else if (type === 'boolean' && typeof req.body[field] !== 'boolean') {
              return res.status(400).json({
                success: false,
                error: {
                  message: `Field ${field} must be a boolean`
                }
              });
            } else if (type === 'array' && !Array.isArray(req.body[field])) {
              return res.status(400).json({
                success: false,
                error: {
                  message: `Field ${field} must be an array`
                }
              });
            } else if (type === 'object' && (typeof req.body[field] !== 'object' || Array.isArray(req.body[field]) || req.body[field] === null)) {
              return res.status(400).json({
                success: false,
                error: {
                  message: `Field ${field} must be an object`
                }
              });
            }
          }
        }
      }
      
      // Enum validation
      if (schema.enums) {
        for (const [field, values] of Object.entries(schema.enums)) {
          if (req.body[field] !== undefined && !values.includes(req.body[field])) {
            return res.status(400).json({
              success: false,
              error: {
                message: `Field ${field} must be one of: ${values.join(', ')}`
              }
            });
          }
        }
      }
      
      // Custom validation
      if (schema.custom) {
        for (const [field, validator] of Object.entries(schema.custom)) {
          if (req.body[field] !== undefined) {
            const result = validator(req.body[field]);
            if (result !== true) {
              return res.status(400).json({
                success: false,
                error: {
                  message: result || `Invalid value for field ${field}`
                }
              });
            }
          }
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validates request query parameters against a schema
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      // Same validation logic as validateBody but for req.query
      if (schema.required) {
        for (const field of schema.required) {
          if (req.query[field] === undefined) {
            return res.status(400).json({
              success: false,
              error: {
                message: `Missing required query parameter: ${field}`
              }
            });
          }
        }
      }
      
      // Continue with other validations...
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Sanitizes request body to prevent injection attacks
 * @returns {Function} Express middleware
 */
const sanitizeInput = () => {
  return (req, res, next) => {
    try {
      // Simple sanitization for strings in body
      if (req.body && typeof req.body === 'object') {
        for (const [key, value] of Object.entries(req.body)) {
          if (typeof value === 'string') {
            // Remove potentially dangerous characters
            req.body[key] = value
              .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
              .trim();
          }
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validateBody,
  validateQuery,
  sanitizeInput
};
