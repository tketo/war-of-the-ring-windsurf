// Mock the modules before requiring the logger
jest.mock('winston', () => {
  return {
    format: {
      combine: jest.fn().mockReturnValue('combinedFormat'),
      timestamp: jest.fn().mockReturnValue('timestampFormat'),
      printf: jest.fn().mockReturnValue('printfFormat'),
      colorize: jest.fn().mockReturnValue('colorizeFormat'),
      json: jest.fn().mockReturnValue('jsonFormat'),
      errors: jest.fn().mockReturnValue('errorsFormat'),
      splat: jest.fn().mockReturnValue('splatFormat')
    },
    createLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      http: jest.fn(),
      add: jest.fn()
    }),
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    }
  };
});

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}));

jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/'))
}));

// Import the modules after mocking
const winston = require('winston');
const { logger, httpLogger, securityLogger } = require('../../../utils/logger');

describe('Logger Utility', () => {
  it('should have the correct logger structure', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.http).toBe('function');
  });

  it('should have HTTP logging middleware', () => {
    expect(httpLogger).toBeDefined();
    expect(typeof httpLogger).toBe('function');
  });

  it('should have security logging functions', () => {
    expect(securityLogger).toBeDefined();
    expect(typeof securityLogger.logAuthAttempt).toBe('function');
    expect(typeof securityLogger.logAccessDenied).toBe('function');
    expect(typeof securityLogger.logRateLimited).toBe('function');
    expect(typeof securityLogger.logSuspiciousActivity).toBe('function');
  });
});
