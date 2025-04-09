const { validateBody, validateQuery, sanitizeInput } = require('../../../middleware/validation');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('validateBody', () => {
    it('should call next() when all required fields are present', () => {
      const schema = {
        required: ['name', 'email']
      };
      req.body = { name: 'Test User', email: 'test@example.com' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', () => {
      const schema = {
        required: ['name', 'email']
      };
      req.body = { name: 'Test User' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('Missing required field')
        })
      }));
    });

    it('should validate types correctly', () => {
      const schema = {
        types: {
          name: 'string',
          age: 'number',
          active: 'boolean'
        }
      };
      req.body = { name: 'Test User', age: 30, active: true };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 when types are incorrect', () => {
      const schema = {
        types: {
          name: 'string',
          age: 'number'
        }
      };
      req.body = { name: 'Test User', age: 'thirty' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('must be a number')
        })
      }));
    });

    it('should validate enum values correctly', () => {
      const schema = {
        enums: {
          role: ['admin', 'user', 'guest']
        }
      };
      req.body = { role: 'admin' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 when enum values are invalid', () => {
      const schema = {
        enums: {
          role: ['admin', 'user', 'guest']
        }
      };
      req.body = { role: 'superuser' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('must be one of')
        })
      }));
    });

    it('should validate custom validators correctly', () => {
      const schema = {
        custom: {
          password: (value) => {
            if (value.length < 8) {
              return 'Password must be at least 8 characters';
            }
            return true;
          }
        }
      };
      req.body = { password: 'password123' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 when custom validation fails', () => {
      const schema = {
        custom: {
          password: (value) => {
            if (value.length < 8) {
              return 'Password must be at least 8 characters';
            }
            return true;
          }
        }
      };
      req.body = { password: 'pass' };
      
      validateBody(schema)(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Password must be at least 8 characters'
        })
      }));
    });
  });

  describe('validateQuery', () => {
    it('should call next() when all required query params are present', () => {
      const schema = {
        required: ['page', 'limit']
      };
      req.query = { page: '1', limit: '10' };
      
      validateQuery(schema)(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 when required query params are missing', () => {
      const schema = {
        required: ['page', 'limit']
      };
      req.query = { page: '1' };
      
      validateQuery(schema)(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('Missing required query parameter')
        })
      }));
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize string values in the request body', () => {
      req.body = {
        name: 'Test <script>alert("XSS")</script>',
        description: 'Normal text',
        age: 30
      };
      
      sanitizeInput()(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.body.name).not.toContain('<script>');
      expect(req.body.description).toBe('Normal text');
      expect(req.body.age).toBe(30);
    });
  });
});
