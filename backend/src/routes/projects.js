const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const projectService = require('../services/projectService');
const { authorizeRole, authorizeProjectAccess } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Validation middleware
const validateProjectData = [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Project name is required and must be less than 200 characters'),
  body('projectType').isIn(['production', 'storage', 'distribution', 'hub']).withMessage('Invalid project type'),
  body('status').optional().isIn(['concept', 'planning', 'construction', 'operational']).withMessage('Invalid status'),
  body('location.type').equals('Point').withMessage('Location type must be Point'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of 2 numbers'),
  body('location.coordinates.*').isFloat({ min: -180, max: 180 }).withMessage('Invalid coordinate values'),
  body('capacityTPA').isFloat({ min: 0 }).withMessage('Capacity must be a positive number'),
  body('stakeholders').optional().isArray().withMessage('Stakeholders must be an array'),
  body('stakeholders.*').optional().isString().withMessage('Stakeholder must be a string'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('completionDate').optional().isISO8601().withMessage('Completion date must be a valid date'),
  body('cost.estimated').optional().isFloat({ min: 0 }).withMessage('Estimated cost must be a positive number'),
  body('cost.actual').optional().isFloat({ min: 0 }).withMessage('Actual cost must be a positive number'),
  body('cost.currency').optional().isString().withMessage('Currency must be a string'),
  body('metadata.tags').optional().isArray().withMessage('Tags must be an array'),
  body('metadata.tags.*').optional().isString().withMessage('Tag must be a string')
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

const validateGeospatialQuery = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  query('radius').isFloat({ min: 0.1, max: 1000 }).withMessage('Radius must be between 0.1 and 1000'),
  query('unit').optional().isIn(['km', 'miles']).withMessage('Unit must be km or miles')
];

const validateBoundsQuery = [
  query('neLat').isFloat({ min: -90, max: 90 }).withMessage('Northeast latitude must be between -90 and 90'),
  query('neLng').isFloat({ min: -180, max: 180 }).withMessage('Northeast longitude must be between -180 and 180'),
  query('swLat').isFloat({ min: -90, max: 90 }).withMessage('Southwest latitude must be between -90 and 90'),
  query('swLng').isFloat({ min: -180, max: 180 }).withMessage('Southwest longitude must be between -180 and 180')
];

// GET /api/projects - Get all projects with pagination and filters
router.get('/', validatePagination, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Build filters
    const filters = {};
    if (req.query.projectType) filters.projectType = req.query.projectType;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.capacityMin) filters.capacityMin = parseFloat(req.query.capacityMin);
    if (req.query.capacityMax) filters.capacityMax = parseFloat(req.query.capacityMax);
    if (req.query.tags) filters.tags = req.query.tags.split(',');
    
    // Handle bounds filter
    if (req.query.neLat && req.query.neLng && req.query.swLat && req.query.swLng) {
      filters.bounds = {
        neLat: parseFloat(req.query.neLat),
        neLng: parseFloat(req.query.neLng),
        swLat: parseFloat(req.query.swLat),
        swLng: parseFloat(req.query.swLng)
      };
    }

    const result = await projectService.getProjects(filters, { page, limit });

    res.status(200).json({
      success: true,
      data: result.projects,
      pagination: result.pagination
    });

  } catch (error) {
    logger.error('Get projects failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get projects'
    });
  }
});

// POST /api/projects - Create new project
router.post('/', validateProjectData, authorizeRole('analyst'), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const projectData = req.body;
    const userId = req.user.userId;

    const project = await projectService.createProject(projectData, userId);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });

  } catch (error) {
    logger.error('Create project failed:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create project'
    });
  }
});

// GET /api/projects/:id - Get project by ID
router.get('/:id', param('id').isMongoId().withMessage('Invalid project ID'), async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const projectId = req.params.id;
    const project = await projectService.getProjectById(projectId);

    res.status(200).json({
      success: true,
      data: project
    });

  } catch (error) {
    logger.error('Get project by ID failed:', error);
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get project'
    });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', 
  param('id').isMongoId().withMessage('Invalid project ID'),
  validateProjectData,
  authorizeProjectAccess,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const projectId = req.params.id;
      const updateData = req.body;
      const userId = req.user.userId;

      const project = await projectService.updateProject(projectId, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });

    } catch (error) {
      logger.error('Update project failed:', error);
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update project'
      });
    }
  }
);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', 
  param('id').isMongoId().withMessage('Invalid project ID'),
  authorizeProjectAccess,
  async (req, res) => {
    try {
      const projectId = req.params.id;
      const userId = req.user.userId;

      const result = await projectService.deleteProject(projectId, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      logger.error('Delete project failed:', error);
      if (error.message === 'Project not found') {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete project'
      });
    }
  }
);

// GET /api/projects/nearby - Find projects within radius
router.get('/nearby', validateGeospatialQuery, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius);
    const unit = req.query.unit || 'km';

    const projects = await projectService.findProjectsNearby(lat, lng, radius, unit);

    res.status(200).json({
      success: true,
      data: projects,
      query: { lat, lng, radius, unit }
    });

  } catch (error) {
    logger.error('Find projects nearby failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to find nearby projects'
    });
  }
});

// GET /api/projects/within-bounds - Find projects within bounds
router.get('/within-bounds', validateBoundsQuery, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const bounds = {
      neLat: parseFloat(req.query.neLat),
      neLng: parseFloat(req.query.neLng),
      swLat: parseFloat(req.query.swLat),
      swLng: parseFloat(req.query.swLng)
    };

    const projects = await projectService.findProjectsWithinBounds(bounds);

    res.status(200).json({
      success: true,
      data: projects,
      query: { bounds }
    });

  } catch (error) {
    logger.error('Find projects within bounds failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to find projects within bounds'
    });
  }
});

// GET /api/projects/search/:term - Search projects by text
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search term must be at least 2 characters long'
      });
    }

    const projects = await projectService.searchProjects(searchTerm.trim());

    res.status(200).json({
      success: true,
      data: projects,
      searchTerm: searchTerm.trim()
    });

  } catch (error) {
    logger.error('Search projects failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search projects'
    });
  }
});

// GET /api/projects/stats/overview - Get project statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await projectService.getProjectStats();

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('Get project stats failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get project statistics'
    });
  }
});

module.exports = router;
