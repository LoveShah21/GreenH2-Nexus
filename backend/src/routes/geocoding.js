const express = require('express');
const { body, query, validationResult } = require('express-validator');
const geocodingService = require('../services/geocodingService');
const { logger } = require('../utils/logger');

const router = express.Router();

// Validation middleware
const validateGeocodeRequest = [
    body('address').trim().isLength({ min: 3, max: 500 }).withMessage('Address must be between 3 and 500 characters')
];

const validateReverseGeocodeRequest = [
    query('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    query('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
];

const validateBatchGeocodeRequest = [
    body('addresses').isArray({ min: 1, max: 10 }).withMessage('Addresses must be an array with 1-10 items'),
    body('addresses.*').trim().isLength({ min: 3, max: 500 }).withMessage('Each address must be between 3 and 500 characters')
];

// POST /api/geocoding/geocode - Convert address to coordinates
router.post('/geocode', validateGeocodeRequest, async (req, res) => {
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

        const { address } = req.body;

        const result = await geocodingService.geocodeAddress(address);

        res.status(200).json({
            success: true,
            data: {
                coordinates: {
                    lat: result.lat,
                    lng: result.lng
                },
                formattedAddress: result.formattedAddress,
                addressComponents: geocodingService.normalizeAddressComponents(result.address),
                boundingBox: result.boundingBox
            }
        });

    } catch (error) {
        logger.error('Geocoding request failed:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to geocode address'
        });
    }
});

// GET /api/geocoding/reverse - Convert coordinates to address
router.get('/reverse', validateReverseGeocodeRequest, async (req, res) => {
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

        const result = await geocodingService.reverseGeocode(lat, lng);

        res.status(200).json({
            success: true,
            data: {
                address: result.address,
                addressComponents: geocodingService.normalizeAddressComponents(result.components),
                type: result.type,
                importance: result.importance
            }
        });

    } catch (error) {
        logger.error('Reverse geocoding request failed:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to reverse geocode coordinates'
        });
    }
});

// POST /api/geocoding/batch - Batch geocode multiple addresses
router.post('/batch', validateBatchGeocodeRequest, async (req, res) => {
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

        const { addresses } = req.body;

        const results = await geocodingService.batchGeocode(addresses);

        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;

        res.status(200).json({
            success: true,
            data: results,
            summary: {
                total: results.length,
                successful: successCount,
                failed: failureCount
            }
        });

    } catch (error) {
        logger.error('Batch geocoding request failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process batch geocoding request'
        });
    }
});

module.exports = router;