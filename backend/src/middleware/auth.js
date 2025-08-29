const authService = require('../services/authService');
const { logger } = require('../utils/logger');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = authService.verifyToken(token);

    if (!decoded || decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired access token'
      });
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Role-based authorization middleware
const authorizeRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const hasPermission = await authService.validatePermissions(req.user.userId, requiredRole);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Authorization check failed'
      });
    }
  };
};

// Optional authentication middleware (for endpoints that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = authService.verifyToken(token);
      
      if (decoded && decoded.type === 'access') {
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Project ownership middleware
const authorizeProjectAccess = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const projectId = req.params.id || req.params.projectId;
    if (!projectId) {
      return next(); // No project ID to check
    }

    // Import Project model here to avoid circular dependencies
    const Project = require('../models/Project');
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Check if user is admin or the project creator
    const user = await require('../models/User').findById(req.user.userId);
    if (user.role === 'admin' || project.createdBy.toString() === req.user.userId) {
      req.project = project;
      return next();
    }

    // Check if user has analyst or manager role
    if (['analyst', 'manager'].includes(user.role)) {
      req.project = project;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied to this project'
    });

  } catch (error) {
    logger.error('Project access authorization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization check failed'
    });
  }
};

// Infrastructure ownership middleware
const authorizeInfrastructureAccess = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const infrastructureId = req.params.id;
    if (!infrastructureId) {
      return next(); // No infrastructure ID to check
    }

    // Import Infrastructure model here to avoid circular dependencies
    const Infrastructure = require('../models/Infrastructure');
    const infrastructure = await Infrastructure.findById(infrastructureId);

    if (!infrastructure) {
      return res.status(404).json({
        success: false,
        error: 'Infrastructure not found'
      });
    }

    // Check if user is admin or the infrastructure creator
    const user = await require('../models/User').findById(req.user.userId);
    if (user.role === 'admin' || infrastructure.createdBy.toString() === req.user.userId) {
      req.infrastructure = infrastructure;
      return next();
    }

    // Check if user has analyst or manager role
    if (['analyst', 'manager'].includes(user.role)) {
      req.infrastructure = infrastructure;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied to this infrastructure'
    });

  } catch (error) {
    logger.error('Infrastructure access authorization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization check failed'
    });
  }
};

// Rate limiting for specific endpoints
const createRateLimiter = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Export middleware functions
module.exports = {
  authenticateToken,
  authorizeRole,
  optionalAuth,
  authorizeProjectAccess,
  authorizeInfrastructureAccess,
  createRateLimiter
};

// Default export for backward compatibility
module.exports.default = authenticateToken;
