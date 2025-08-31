const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const { authorizeRole } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const infrastructureService = require('../services/infrastructureService');

const router = express.Router();

const infrastructureController = require('../controllers/infrastructureController');

// Validation middleware
const validateInfrastructureData = [
  body('infrastructureType').isIn(['pipeline', 'storage_facility', 'production_plant', 'distribution_hub']).withMessage('Invalid infrastructure type'),
  body('geometry.type').isIn(['Point', 'LineString', 'Polygon', 'MultiPolygon']).withMessage('Invalid geometry type'),
  body('geometry.coordinates').notEmpty().withMessage('Coordinates are required'),
  body('capacity.value').isFloat({ min: 0 }).withMessage('Capacity value must be a positive number'),
  body('capacity.unit').optional().isString().withMessage('Capacity unit must be a string'),
  body('operationalStatus').optional().isIn(['operational', 'under_construction', 'planned', 'decommissioned']).withMessage('Invalid operational status'),
  body('projectId').isMongoId().withMessage('Valid project ID is required')
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// GET /api/infrastructure - Get infrastructure with filters
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
    if (req.query.infrastructureType) filters.infrastructureType = req.query.infrastructureType;
    if (req.query.operationalStatus) filters.operationalStatus = req.query.operationalStatus;
    if (req.query.projectId) filters.projectId = req.query.projectId;

    const result = await infrastructureService.getInfrastructure(filters, { page, limit });

    res.status(200).json({
      success: true,
      data: result.infrastructure,
      pagination: result.pagination
    });

  } catch (error) {
    logger.error('Get infrastructure failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get infrastructure'
    });
  }
});

// POST /api/infrastructure - Create new infrastructure
router.post('/', validateInfrastructureData, authorizeRole('analyst'), infrastructureController.createInfrastructure);

// GET /api/infrastructure/:id - Get infrastructure by ID
router.get('/:id', param('id').isMongoId().withMessage('Invalid infrastructure ID'), async (req, res) => {
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

    const infrastructureId = req.params.id;
    const infrastructure = await infrastructureService.getInfrastructureById(infrastructureId);

    res.status(200).json({
      success: true,
      data: infrastructure
    });

  } catch (error) {
    logger.error('Get infrastructure by ID failed:', error);
    if (error.message === 'Infrastructure not found') {
      return res.status(404).json({
        success: false,
        error: 'Infrastructure not found'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get infrastructure'
    });
  }
});

// GET /api/infrastructure/route-optimization - Route optimization analysis
router.get('/route-optimization', async (req, res) => {
  try {
    // Placeholder response
    res.status(200).json({
      success: true,
      message: 'Route optimization endpoint - to be implemented',
      data: {}
    });

  } catch (error) {
    logger.error('Route optimization failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to perform route optimization'
    });
  }
});

// POST /api/infrastructure/site-suitability - Site suitability analysis
router.post('/site-suitability', async (req, res) => {
  try {
    // Placeholder response
    res.status(200).json({
      success: true,
      message: 'Site suitability endpoint - to be implemented',
      data: {}
    });

  } catch (error) {
    logger.error('Site suitability analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to perform site suitability analysis'
    });
  }
});

// GET /api/infrastructure/connectivity-analysis - Network connectivity analysis
router.get('/connectivity-analysis', async (req, res) => {
  try {
    // Placeholder response
    res.status(200).json({
      success: true,
      message: 'Connectivity analysis endpoint - to be implemented',
      data: {}
    });

  } catch (error) {
    logger.error('Connectivity analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to perform connectivity analysis'
    });
  }
});

module.exports = router;
