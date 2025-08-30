require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import configurations
const { database } = require('./config/database');
const { redisClient } = require('./config/redis');

// Import middleware
const { requestLogger } = require('./utils/logger');
const { authenticateToken: authMiddleware } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const infrastructureRoutes = require('./routes/infrastructure');
const renewableSourceRoutes = require('./routes/renewableSources');
const analyticsRoutes = require('./routes/analytics');
const recommendationRoutes = require('./routes/recommendations');
const mlPredictionRoutes = require('./routes/ml-predictions');

// Import services
const { logger } = require('./utils/logger');

class App {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    this.port = process.env.PORT || 3000;
  }

  // Configure middleware
  configureMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      optionsSuccessStatus: 200
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
      }
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Request logging
    this.app.use((req, res, next) => {
      requestLogger.info({
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });

    // Performance monitoring middleware
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
      });
      next();
    });
  }

  // Configure routes
  configureRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/projects', authMiddleware, projectRoutes);
    this.app.use('/api/infrastructure', authMiddleware, infrastructureRoutes);
    this.app.use('/api/renewable-sources', authMiddleware, renewableSourceRoutes);
    this.app.use('/api/analytics', authMiddleware, analyticsRoutes);
    this.app.use('/api/recommendations', authMiddleware, recommendationRoutes);
    this.app.use('/api/ml-predictions', mlPredictionRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Route not found'
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      logger.error('Global error handler:', error);

      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });
  }

  // Configure WebSocket
  configureWebSocket() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Join room for user-specific updates
      socket.on('join-user-room', (userId) => {
        socket.join(`user-${userId}`);
        logger.info(`User ${userId} joined their room`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      // Handle real-time infrastructure updates
      socket.on('infrastructure-update', (data) => {
        // Broadcast to all connected clients
        this.io.emit('infrastructure-updated', data);
      });

      // Handle real-time project updates
      socket.on('project-update', (data) => {
        this.io.emit('project-updated', data);
      });
    });
  }

  // Initialize database connections
  async initializeConnections() {
    try {
      // Connect to MongoDB
      await database.connect();
      logger.info('MongoDB connected successfully');

      // Connect to Redis
      await redisClient.connect();
      logger.info('Redis connected successfully');

    } catch (error) {
      logger.error('Failed to initialize connections:', error);
      process.exit(1);
    }
  }

  // Start server
  async start() {
    try {
      // Initialize connections
      await this.initializeConnections();

      // Configure middleware and routes
      this.configureMiddleware();
      this.configureRoutes();
      this.configureWebSocket();

      // Start listening
      this.server.listen(this.port, () => {
        logger.info(`Server running on port ${this.port}`);
        logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`Health check: http://localhost:${this.port}/health`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.gracefulShutdown());
      process.on('SIGINT', () => this.gracefulShutdown());

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  // Graceful shutdown
  async gracefulShutdown() {
    logger.info('Received shutdown signal, starting graceful shutdown...');

    try {
      // Close HTTP server
      this.server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close database connections
      await database.disconnect();
      await redisClient.disconnect();

      logger.info('Graceful shutdown completed');
      process.exit(0);

    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start server instance
const server = new App();
server.start().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = server;
