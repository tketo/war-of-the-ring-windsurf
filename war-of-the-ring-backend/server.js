const express = require('express');
const https = require('https');
const fs = require('fs');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const clerk = require('@clerk/clerk-sdk-node');
const crypto = require('crypto'); // Use built-in crypto module
require('dotenv').config();

// Import routes
const gameRoutes = require('./routes/game');
const playerRoutes = require('./routes/player');
const lobbyRoutes = require('./routes/lobby');
const cardRoutes = require('./routes/card');

// Import WebSocket handler
const setupSocketHandlers = require('./websockets/socketHandler');

// Import middleware
const { errorHandler, notFound, sanitizeInput } = require('./middleware');

// Import logger
const { logger, httpLogger, securityLogger } = require('./utils/logger');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
}));
app.use(sanitizeInput()); // Add input sanitization
app.use(httpLogger); // Add HTTP request/response logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    securityLogger.logRateLimited(req.ip, req.originalUrl);
    res.status(options.statusCode).json({
      success: false,
      error: {
        message: options.message
      }
    });
  }
});
app.use(limiter);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'War of the Ring API is running',
    version: '1.0.0',
    documentation: '/api-docs' // For future Swagger documentation
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// API Routes
app.use('/game', gameRoutes);
app.use('/player', playerRoutes);
app.use('/lobby', lobbyRoutes);
app.use('/card', cardRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Self-signed certificates for development
// In production, use proper certificates
let server;
try {
  const options = {
    key: fs.readFileSync('./certs/key.pem', 'utf8'),
    cert: fs.readFileSync('./certs/cert.pem', 'utf8')
  };
  
  // Create HTTPS server
  server = https.createServer(options, app);
  console.log('HTTPS server created successfully');
} catch (error) {
  console.warn('Warning: Could not load SSL certificates. Falling back to HTTP (not recommended for production)');
  console.error(error);
  
  // Fallback to HTTP for development
  const http = require('http');
  server = http.createServer(app);
}

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Set up WebSocket handlers
setupSocketHandlers(io);

// Socket.io events
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/war-of-the-ring', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  
  // Close server
  server.close(() => {
    console.log('HTTP server closed');
    
    // Close database connection
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on ${server instanceof https.Server ? 'https' : 'http'}://localhost:${PORT}`);
});
