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
      infrastructureData.createdBy = req.user.userId; // Assuming userId is available on req.user
      infrastructureData.updatedBy = req.user.userId; // Set updatedBy on creation

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