const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const router = express.Router();

// ML Model API base URL
const ML_API_BASE_URL = process.env.ML_API_BASE_URL || 'http://localhost:8000';

// Cache for ML predictions to improve performance
const predictionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Validation middleware
const validateCoordinates = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
];

const validateBatchPrediction = [
  body('locations').isArray({ min: 1 }).withMessage('Locations must be a non-empty array'),
  body('locations.*.lat').isFloat({ min: -90, max: 90 }).withMessage('Each location must have valid latitude'),
  body('locations.*.lng').isFloat({ min: -180, max: 180 }).withMessage('Each location must have valid longitude')
];

// GET /api/ml-predictions/predict-zone - Single location prediction
router.get('/predict-zone', validateCoordinates, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { lat, lng } = req.query;
    const cacheKey = `${lat},${lng}`;

    // Check cache first
    const cached = predictionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.status(200).json({
        success: true,
        data: cached.data,
        cached: true
      });
    }

    // Forward request to ML API
    const response = await fetch(`${ML_API_BASE_URL}/predict-zones?lat=${lat}&lng=${lng}`);

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    const prediction = await response.json();

    // Cache the result
    predictionCache.set(cacheKey, {
      data: prediction,
      timestamp: Date.now()
    });

    res.status(200).json({
      success: true,
      data: prediction
    });

  } catch (error) {
    logger.error('ML prediction failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get ML prediction'
    });
  }
});

// POST /api/ml-predictions/predict-zones/batch - Batch predictions
router.post('/predict-zones/batch', validateBatchPrediction, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { locations } = req.body;

    // Forward request to ML API
    const response = await fetch(`${ML_API_BASE_URL}/predict-zones/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ locations })
    });

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    const predictions = await response.json();

    res.status(200).json({
      success: true,
      data: predictions
    });

  } catch (error) {
    logger.error('Batch ML prediction failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get batch ML predictions'
    });
  }
});

// POST /api/ml-predictions/analyze-area - Analyze area with multiple points
router.post('/analyze-area', [
  body('bounds').isObject().withMessage('Bounds object is required'),
  body('bounds.north').isFloat({ min: -90, max: 90 }).withMessage('Valid north bound required'),
  body('bounds.south').isFloat({ min: -90, max: 90 }).withMessage('Valid south bound required'),
  body('bounds.east').isFloat({ min: -180, max: 180 }).withMessage('Valid east bound required'),
  body('bounds.west').isFloat({ min: -180, max: 180 }).withMessage('Valid west bound required'),
  body('gridSize').optional().isInt({ min: 5, max: 50 }).withMessage('Grid size must be between 5 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { bounds, gridSize = 10 } = req.body;

    // Generate grid points within bounds
    const latStep = (bounds.north - bounds.south) / gridSize;
    const lngStep = (bounds.east - bounds.west) / gridSize;

    const locations = [];
    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        locations.push({
          lat: bounds.south + (i * latStep),
          lng: bounds.west + (j * lngStep)
        });
      }
    }

    // Get batch predictions
    const response = await fetch(`${ML_API_BASE_URL}/predict-zones/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ locations })
    });

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    const predictions = await response.json();

    // Analyze results
    const analysis = {
      totalPoints: locations.length,
      zoneDistribution: {
        green: predictions.predictions.filter(p => p.zone === 'green').length,
        yellow: predictions.predictions.filter(p => p.zone === 'yellow').length,
        red: predictions.predictions.filter(p => p.zone === 'red').length
      },
      averageEfficiency: predictions.predictions.reduce((sum, p) => sum + p.efficiency, 0) / predictions.predictions.length,
      averageCost: predictions.predictions.reduce((sum, p) => sum + p.cost, 0) / predictions.predictions.length,
      predictions: predictions.predictions
    };

    res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (error) {
    logger.error('Area analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze area'
    });
  }
});

// GET /api/ml-predictions/health - Check ML service health
router.get('/health', async (req, res) => {
  try {
    const response = await fetch(`${ML_API_BASE_URL}/health`);
    const healthData = await response.json();

    res.status(200).json({
      success: true,
      data: {
        ml_service_status: response.ok ? 'healthy' : 'unhealthy',
        ml_service_data: healthData,
        cache_size: predictionCache.size
      }
    });

  } catch (error) {
    logger.error('ML health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'ML service unavailable'
    });
  }
});

module.exports = router;