const Infrastructure = require('../models/Infrastructure');
const { logger } = require('../utils/logger');

class InfrastructureService {
  constructor() {
    this.logger = logger;
  }

  /**
   * Create a new infrastructure asset
   * @param {object} infrastructureData - The data for the new infrastructure
   * @returns {Promise<Document>} The newly created infrastructure document
   */
  async createInfrastructure(infrastructureData) {
    try {
      const newInfrastructure = new Infrastructure(infrastructureData);
      await newInfrastructure.save();
      this.logger.info(`New infrastructure created with ID: ${newInfrastructure._id}`);
      return newInfrastructure;
    } catch (error) {
      this.logger.error('Error creating infrastructure:', error);
      throw new Error('Failed to create infrastructure in the database.');
    }
  }
}

module.exports = new InfrastructureService();