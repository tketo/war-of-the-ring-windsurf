const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ level, message, timestamp, ...metadata }) => {
      let metaStr = '';
      if (Object.keys(metadata).length > 0 && metadata.stack !== undefined) {
        metaStr = `\n${metadata.stack}`;
      } else if (Object.keys(metadata).length > 0) {
        metaStr = `\n${JSON.stringify(metadata, null, 2)}`;
      }
      return `[${timestamp}] ${level}: ${message}${metaStr}`;
    }
  )
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'war-of-the-ring-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Create a stream object for Morgan integration
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Log HTTP requests
const httpLogger = (req, res, next) => {
  // Skip logging for health check endpoints
  if (req.path === '/health' || req.path === '/ping') {
    return next();
  }

  const startHrTime = process.hrtime();
  
  // Log request
  logger.debug(`HTTP Request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response when finished
  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1000000;
    
    const logLevel = res.statusCode >= 500 ? 'error' : 
                     res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel](`HTTP Response: ${res.statusCode} ${elapsedTimeInMs.toFixed(3)}ms`, {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: elapsedTimeInMs.toFixed(3),
    });
  });

  next();
};

// Add security logging
const securityLogger = {
  logAuthAttempt: (success, userId, ip, details = {}) => {
    const level = success ? 'info' : 'warn';
    logger[level](`Authentication attempt: ${success ? 'success' : 'failure'}`, {
      userId,
      ip,
      ...details,
      event: 'auth_attempt',
    });
  },
  
  logAccessDenied: (userId, resource, ip, details = {}) => {
    logger.warn(`Access denied to resource: ${resource}`, {
      userId,
      resource,
      ip,
      ...details,
      event: 'access_denied',
    });
  },
  
  logRateLimited: (ip, endpoint, details = {}) => {
    logger.warn(`Rate limit exceeded`, {
      ip,
      endpoint,
      ...details,
      event: 'rate_limit_exceeded',
    });
  },
  
  logSuspiciousActivity: (type, ip, details = {}) => {
    logger.warn(`Suspicious activity detected: ${type}`, {
      type,
      ip,
      ...details,
      event: 'suspicious_activity',
    });
  }
};

module.exports = {
  logger,
  httpLogger,
  securityLogger,
};
