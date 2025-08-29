const Project = require('../models/Project');
const { redisClient } = require('../config/redis');
const { logger } = require('../utils/logger');

class ProjectService {
  constructor() {
    this.cachePrefix = 'project:';
    this.cacheTTL = 300; // 5 minutes
  }

  // Create new project
  async createProject(projectData, userId) {
    try {
      const project = new Project({
        ...projectData,
        createdBy: userId,
        updatedBy: userId
      });

      await project.save();
      logger.info(`Project created: ${project.name} by user ${userId}`);

      // Invalidate cache
      await this.invalidateCache();

      return project;
    } catch (error) {
      logger.error('Project creation failed:', error);
      throw error;
    }
  }

  // Get project by ID
  async getProjectById(projectId, useCache = true) {
    try {
      if (useCache) {
        const cached = await redisClient.get(`${this.cachePrefix}${projectId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const project = await Project.findById(projectId)
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

      if (!project) {
        throw new Error('Project not found');
      }

      // Cache the result
      if (useCache) {
        await redisClient.set(
          `${this.cachePrefix}${projectId}`,
          JSON.stringify(project),
          this.cacheTTL
        );
      }

      return project;
    } catch (error) {
      logger.error('Get project by ID failed:', error);
      throw error;
    }
  }

  // Get projects with pagination and filters
  async getProjects(filters = {}, pagination = { page: 1, limit: 20 }, useCache = true) {
    try {
      const cacheKey = `${this.cachePrefix}list:${JSON.stringify(filters)}:${pagination.page}:${pagination.limit}`;
      
      if (useCache) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const query = {};

      // Apply filters
      if (filters.projectType) query.projectType = filters.projectType;
      if (filters.status) query.status = filters.status;
      if (filters.capacityMin || filters.capacityMax) {
        query.capacityTPA = {};
        if (filters.capacityMin) query.capacityTPA.$gte = filters.capacityMin;
        if (filters.capacityMax) query.capacityTPA.$lte = filters.capacityMax;
      }
      if (filters.tags && filters.tags.length > 0) {
        query['metadata.tags'] = { $in: filters.tags };
      }

      // Apply geospatial bounds filter
      if (filters.bounds) {
        query.location = {
          $geoWithin: {
            $box: [
              [filters.bounds.swLng, filters.bounds.swLat],
              [filters.bounds.neLng, filters.bounds.neLat]
            ]
          }
        };
      }

      // Calculate pagination
      const skip = (pagination.page - 1) * pagination.limit;
      const total = await Project.countDocuments(query);
      const totalPages = Math.ceil(total / pagination.limit);

      // Execute query with pagination
      const projects = await Project.find(query)
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pagination.limit);

      const result = {
        projects,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1
        }
      };

      // Cache the result
      if (useCache) {
        await redisClient.set(cacheKey, JSON.stringify(result), this.cacheTTL);
      }

      return result;
    } catch (error) {
      logger.error('Get projects failed:', error);
      throw error;
    }
  }

  // Find projects nearby a point
  async findProjectsNearby(lat, lng, radius, unit = 'km', useCache = true) {
    try {
      const cacheKey = `${this.cachePrefix}nearby:${lat}:${lng}:${radius}:${unit}`;
      
      if (useCache) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Convert to meters if needed
      const radiusInMeters = unit === 'miles' ? radius * 1609.34 : radius * 1000;

      const projects = await Project.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat] // MongoDB expects [longitude, latitude]
            },
            $maxDistance: radiusInMeters
          }
        }
      })
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

      // Cache the result
      if (useCache) {
        await redisClient.set(cacheKey, JSON.stringify(projects), this.cacheTTL);
      }

      return projects;
    } catch (error) {
      logger.error('Find projects nearby failed:', error);
      throw error;
    }
  }

  // Find projects within bounds
  async findProjectsWithinBounds(bounds, useCache = true) {
    try {
      const cacheKey = `${this.cachePrefix}bounds:${JSON.stringify(bounds)}`;
      
      if (useCache) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const projects = await Project.find({
        location: {
          $geoWithin: {
            $box: [
              [bounds.swLng, bounds.swLat],
              [bounds.neLng, bounds.neLat]
            ]
          }
        }
      })
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

      // Cache the result
      if (useCache) {
        await redisClient.set(cacheKey, JSON.stringify(projects), this.cacheTTL);
      }

      return projects;
    } catch (error) {
      logger.error('Find projects within bounds failed:', error);
      throw error;
    }
  }

  // Update project
  async updateProject(projectId, updateData, userId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Update fields
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== 'createdBy') {
          project[key] = updateData[key];
        }
      });

      project.updatedBy = userId;
      project.updatedAt = new Date();

      await project.save();
      logger.info(`Project updated: ${project.name} by user ${userId}`);

      // Invalidate cache
      await this.invalidateCache(projectId);

      return project;
    } catch (error) {
      logger.error('Project update failed:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(projectId, userId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      await Project.findByIdAndDelete(projectId);
      logger.info(`Project deleted: ${project.name} by user ${userId}`);

      // Invalidate cache
      await this.invalidateCache(projectId);

      return { success: true, message: 'Project deleted successfully' };
    } catch (error) {
      logger.error('Project deletion failed:', error);
      throw error;
    }
  }

  // Search projects by text
  async searchProjects(searchTerm, useCache = true) {
    try {
      const cacheKey = `${this.cachePrefix}search:${searchTerm}`;
      
      if (useCache) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const projects = await Project.find({
        $text: { $search: searchTerm }
      })
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ score: { $meta: 'textScore' } });

      // Cache the result
      if (useCache) {
        await redisClient.set(cacheKey, JSON.stringify(projects), this.cacheTTL);
      }

      return projects;
    } catch (error) {
      logger.error('Project search failed:', error);
      throw error;
    }
  }

  // Get project statistics
  async getProjectStats(useCache = true) {
    try {
      const cacheKey = `${this.cachePrefix}stats`;
      
      if (useCache) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const stats = await Project.aggregate([
        {
          $group: {
            _id: null,
            totalProjects: { $sum: 1 },
            totalCapacity: { $sum: '$capacityTPA' },
            avgCapacity: { $avg: '$capacityTPA' },
            byType: {
              $push: {
                type: '$projectType',
                capacity: '$capacityTPA'
              }
            },
            byStatus: {
              $push: {
                status: '$status',
                capacity: '$capacityTPA'
              }
            }
          }
        }
      ]);

      // Process the results
      const result = {
        totalProjects: stats[0]?.totalProjects || 0,
        totalCapacity: stats[0]?.totalCapacity || 0,
        avgCapacity: stats[0]?.avgCapacity || 0,
        byType: this.processAggregationResults(stats[0]?.byType || []),
        byStatus: this.processAggregationResults(stats[0]?.byStatus || [])
      };

      // Cache the result
      if (useCache) {
        await redisClient.set(cacheKey, JSON.stringify(result), this.cacheTTL * 2); // Longer TTL for stats
      }

      return result;
    } catch (error) {
      logger.error('Get project stats failed:', error);
      throw error;
    }
  }

  // Process aggregation results
  processAggregationResults(data) {
    const result = {};
    data.forEach(item => {
      const key = item.type || item.status;
      if (!result[key]) {
        result[key] = { count: 0, totalCapacity: 0 };
      }
      result[key].count++;
      result[key].totalCapacity += item.capacity || 0;
    });
    return result;
  }

  // Invalidate cache
  async invalidateCache(projectId = null) {
    try {
      if (projectId) {
        // Invalidate specific project cache
        await redisClient.del(`${this.cachePrefix}${projectId}`);
      }
      
      // Invalidate list caches (pattern matching)
      const keys = await redisClient.get(`${this.cachePrefix}list:*`);
      if (keys) {
        await redisClient.del(`${this.cachePrefix}list:*`);
      }
      
      // Invalidate other caches
      await redisClient.del(`${this.cachePrefix}stats`);
      await redisClient.del(`${this.cachePrefix}search:*`);
      await redisClient.del(`${this.cachePrefix}nearby:*`);
      await redisClient.del(`${this.cachePrefix}bounds:*`);
      
      logger.info('Project cache invalidated');
    } catch (error) {
      logger.error('Cache invalidation failed:', error);
    }
  }
}

module.exports = new ProjectService();
