const Infrastructure = require('../models/Infrastructure');
const { logger } = require('../utils/logger');

class InfrastructureService {
  constructor() {
    this.logger = logger;
  }

  /**
   * Get infrastructure with filters and pagination
   * @param {object} filters - Filter criteria
   * @param {object} options - Pagination options
   * @returns {Promise<object>} Infrastructure list with pagination
   */
  async getInfrastructure(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      // Build query
      const query = {};

      if (filters.infrastructureType) {
        query.infrastructureType = filters.infrastructureType;
      }

      if (filters.operationalStatus) {
        query.operationalStatus = filters.operationalStatus;
      }

      if (filters.projectId) {
        query.projectId = filters.projectId;
      }

      // Execute query with pagination
      const [infrastructure, total] = await Promise.all([
        Infrastructure.find(query)
          .populate('projectId', 'name projectType status')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Infrastructure.countDocuments(query)
      ]);

      // Transform data to match frontend expectations
      const transformedData = infrastructure.map(item => ({
        id: item._id.toString(),
        infrastructureType: item.infrastructureType,
        geometry: item.geometry,
        capacity: item.capacity,
        operationalStatus: item.operationalStatus,
        projectId: item.projectId?._id?.toString() || item.projectId,
        project: item.projectId,
        specifications: item.specifications,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));

      return {
        infrastructure: transformedData,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error('Error getting infrastructure:', error);
      throw new Error('Failed to get infrastructure from the database.');
    }
  }

  /**
   * Get infrastructure by ID
   * @param {string} id - Infrastructure ID
   * @returns {Promise<Document>} Infrastructure document
   */
  async getInfrastructureById(id) {
    try {
      const infrastructure = await Infrastructure.findById(id)
        .populate('projectId', 'name projectType status')
        .lean();

      if (!infrastructure) {
        throw new Error('Infrastructure not found');
      }

      return {
        id: infrastructure._id.toString(),
        infrastructureType: infrastructure.infrastructureType,
        geometry: infrastructure.geometry,
        capacity: infrastructure.capacity,
        operationalStatus: infrastructure.operationalStatus,
        projectId: infrastructure.projectId?._id?.toString() || infrastructure.projectId,
        project: infrastructure.projectId,
        specifications: infrastructure.specifications,
        createdAt: infrastructure.createdAt,
        updatedAt: infrastructure.updatedAt
      };
    } catch (error) {
      this.logger.error('Error getting infrastructure by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new infrastructure asset
   * @param {object} infrastructureData - The data for the new infrastructure
   * @returns {Promise<Document>} The newly created infrastructure document
   */
  async createInfrastructure(infrastructureData) {
    try {
      // Debug logging
      this.logger.info('Creating infrastructure:', {
        type: infrastructureData.infrastructureType,
        geometryType: infrastructureData.geometry?.type,
        coordinates: infrastructureData.geometry?.coordinates
      });

      const newInfrastructure = new Infrastructure(infrastructureData);
      await newInfrastructure.save();
      this.logger.info(`New infrastructure created with ID: ${newInfrastructure._id}`);

      // Return transformed data
      return {
        id: newInfrastructure._id.toString(),
        infrastructureType: newInfrastructure.infrastructureType,
        geometry: newInfrastructure.geometry,
        capacity: newInfrastructure.capacity,
        operationalStatus: newInfrastructure.operationalStatus,
        projectId: newInfrastructure.projectId.toString(),
        specifications: newInfrastructure.specifications,
        createdAt: newInfrastructure.createdAt,
        updatedAt: newInfrastructure.updatedAt
      };
    } catch (error) {
      this.logger.error('Error creating infrastructure:', error);
      this.logger.error('Failed to create infrastructure:', error.message);
      throw new Error('Failed to create infrastructure in the database.');
    }
  }
}

module.exports = new InfrastructureService();