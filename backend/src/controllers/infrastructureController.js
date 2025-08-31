const infrastructureService = require('../services/infrastructureService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

class InfrastructureController {
  constructor() {
    this.createInfrastructure = this.createInfrastructure.bind(this);
  }

  async createInfrastructure(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    try {
      const infrastructureData = req.body;
      // Use authenticated user ID if available, otherwise use a default
      const userId = req.user?.userId || '507f1f77bcf86cd799439000'; // Default user ID for testing
      infrastructureData.createdBy = userId;
      infrastructureData.updatedBy = userId;

      const newInfrastructure = await infrastructureService.createInfrastructure(infrastructureData);

      res.status(201).json({
        success: true,
        message: 'Infrastructure created successfully',
        data: newInfrastructure
      });
    } catch (error) {
      logger.error('Create infrastructure failed:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create infrastructure'
      });
    }
  }
}

module.exports = new InfrastructureController();