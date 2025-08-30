const analyticsService = require('../services/analyticsService');
const optimizationService = require('../services/optimizationService');
const AnalyticsData = require('../models/AnalyticsData');
const OptimizationScenario = require('../models/OptimizationScenario');
const { logger } = require('../utils/logger');

class AnalyticsController {
  constructor() {
    this.logger = logger;
    
    // Bind all methods to ensure proper 'this' context
    this.performGeospatialAnalysis = this.performGeospatialAnalysis.bind(this);
    this.performDemandForecasting = this.performDemandForecasting.bind(this);
    this.performCostOptimization = this.performCostOptimization.bind(this);
    this.performNetworkAnalysis = this.performNetworkAnalysis.bind(this);
    this.performEnvironmentalAssessment = this.performEnvironmentalAssessment.bind(this);
    this.getRealTimeMetrics = this.getRealTimeMetrics.bind(this);
    this.performMultiCriteriaAnalysis = this.performMultiCriteriaAnalysis.bind(this);
    this.performGeneticOptimization = this.performGeneticOptimization.bind(this);
    this.performCostSurfaceModeling = this.performCostSurfaceModeling.bind(this);
    this.performCapacityPlanning = this.performCapacityPlanning.bind(this);
    this.getAnalyticsData = this.getAnalyticsData.bind(this);
    this.createAnalyticsData = this.createAnalyticsData.bind(this);
    this.getOptimizationScenarios = this.getOptimizationScenarios.bind(this);
    this.createOptimizationScenario = this.createOptimizationScenario.bind(this);
    this.getOptimizationScenario = this.getOptimizationScenario.bind(this);
    this.getScenarioHistory = this.getScenarioHistory.bind(this);
    this.updateOptimizationScenario = this.updateOptimizationScenario.bind(this);
    this.deleteOptimizationScenario = this.deleteOptimizationScenario.bind(this);
    this.getAnalyticsSummary = this.getAnalyticsSummary.bind(this);
  }

  /**
   * Advanced Geospatial Analysis
   * POST /api/analytics/geospatial
   */
  async performGeospatialAnalysis(req, res) {
    try {
      const {
        centerPoint,
        radiusKm,
        infrastructureTypes,
        renewableTypes,
        criteria
      } = req.body;

      // Validate required parameters
      if (!centerPoint || !radiusKm) {
        return res.status(400).json({
          success: false,
          error: 'Center point and radius are required'
        });
      }

      const result = await analyticsService.performGeospatialAnalysis({
        centerPoint,
        radiusKm,
        infrastructureTypes,
        renewableTypes,
        criteria
      });

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Geospatial analysis controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Geospatial analysis failed'
      });
    }
  }

  /**
   * Demand Forecasting
   * POST /api/analytics/demand-forecast
   */
  async performDemandForecasting(req, res) {
    try {
      const {
        projectId,
        timeHorizon,
        timeStep,
        factors
      } = req.body;

      // Validate required parameters
      if (!projectId || !timeHorizon) {
        return res.status(400).json({
          success: false,
          error: 'Project ID and time horizon are required'
        });
      }

      const result = await analyticsService.performDemandForecasting({
        projectId,
        timeHorizon,
        timeStep,
        factors
      });

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Demand forecasting controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Demand forecasting failed'
      });
    }
  }

  /**
   * Cost Optimization Analysis
   * POST /api/analytics/cost-optimization
   */
  async performCostOptimization(req, res) {
    try {
      const {
        projectId,
        infrastructureIds,
        costTypes,
        timeRange
      } = req.body;

      // Validate required parameters
      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      const result = await analyticsService.performCostOptimization({
        projectId,
        infrastructureIds,
        costTypes,
        timeRange
      });

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Cost optimization controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Cost optimization analysis failed'
      });
    }
  }

  /**
   * Network Analysis
   * POST /api/analytics/network-analysis
   */
  async performNetworkAnalysis(req, res) {
    try {
      const {
        projectId,
        analysisType,
        depth
      } = req.body;

      // Validate required parameters
      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      const result = await analyticsService.performNetworkAnalysis({
        projectId,
        analysisType,
        depth
      });

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Network analysis controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Network analysis failed'
      });
    }
  }

  /**
   * Environmental Impact Assessment
   * POST /api/analytics/environmental-assessment
   */
  async performEnvironmentalAssessment(req, res) {
    try {
      const {
        projectId,
        geographicBounds,
        impactTypes
      } = req.body;

      // Validate required parameters
      if (!projectId || !geographicBounds) {
        return res.status(400).json({
          success: false,
          error: 'Project ID and geographic bounds are required'
        });
      }

      const result = await analyticsService.performEnvironmentalAssessment({
        projectId,
        geographicBounds,
        impactTypes
      });

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Environmental assessment controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Environmental assessment failed'
      });
    }
  }

  /**
   * Real-time Metrics
   * GET /api/analytics/real-time-metrics
   */
  async getRealTimeMetrics(req, res) {
    try {
      const { projectId } = req.params;
      const { timeWindow, metrics } = req.query;

      // Validate required parameters
      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      // Validate ObjectId format
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Project ID format'
        });
      }

      const result = await analyticsService.getRealTimeMetrics({
        projectId,
        timeWindow,
        metrics: metrics ? metrics.split(',') : undefined
      });

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Real-time metrics controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Real-time metrics retrieval failed'
      });
    }
  }

  /**
   * Multi-Criteria Decision Analysis
   * POST /api/analytics/mcda
   */
  async performMultiCriteriaAnalysis(req, res) {
    try {
      const {
        projectId,
        alternatives,
        criteria,
        weights,
        method
      } = req.body;

      // Validate required parameters
      if (!projectId || !alternatives || !criteria || !weights) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, alternatives, criteria, and weights are required'
        });
      }

      const result = await optimizationService.performMultiCriteriaAnalysis({
        projectId,
        alternatives,
        criteria,
        weights,
        method,
        userId: req.user.userId
      });

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('MCDA controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Multi-criteria decision analysis failed'
      });
    }
  }

  /**
   * Genetic Algorithm Optimization
   * POST /api/analytics/genetic-optimization
   */
  async performGeneticOptimization(req, res) {
    try {
      const {
        projectId,
        populationSize,
        generations,
        mutationRate,
        crossoverRate,
        constraints,
        objectives,
        geographicScope,
        timeHorizon
      } = req.body;

      // Validate required parameters
      if (!projectId || !constraints || !objectives || !geographicScope || !timeHorizon) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, constraints, objectives, geographicScope, and timeHorizon are required'
        });
      }

      const result = await optimizationService.performGeneticOptimization({
        projectId,
        populationSize,
        generations,
        mutationRate,
        crossoverRate,
        constraints,
        objectives,
        geographicScope,
        timeHorizon,
        userId: req.user.userId,
        startTime: Date.now()
      });

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Genetic optimization controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Genetic optimization failed'
      });
    }
  }

  /**
   * Cost Surface Modeling
   * POST /api/analytics/cost-surface
   */
  async performCostSurfaceModeling(req, res) {
    try {
      const {
        projectId,
        geographicBounds,
        resolution,
        costFactors
      } = req.body;

      // Validate required parameters
      if (!projectId || !geographicBounds) {
        return res.status(400).json({
          success: false,
          error: 'Project ID and geographic bounds are required'
        });
      }

      const result = await optimizationService.performCostSurfaceModeling({
        projectId,
        geographicBounds,
        resolution,
        costFactors
      });

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Cost surface modeling controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Cost surface modeling failed'
      });
    }
  }

  /**
   * Capacity Planning
   * POST /api/analytics/capacity-planning
   */
  async performCapacityPlanning(req, res) {
    try {
      const {
        projectId,
        timeHorizon,
        demandForecast,
        capacityConstraints,
        optimizationObjectives
      } = req.body;

      // Validate required parameters
      if (!projectId || !timeHorizon || !demandForecast) {
        return res.status(400).json({
          success: false,
          error: 'Project ID, time horizon, and demand forecast are required'
        });
      }

      const result = await optimizationService.performCapacityPlanning({
        projectId,
        timeHorizon,
        demandForecast,
        capacityConstraints,
        optimizationObjectives
      });

      res.status(200).json(result);
    } catch (error) {
      this.logger.error('Capacity planning controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Capacity planning failed'
      });
    }
  }

  /**
   * Create Optimization Scenario
   * POST /api/analytics/scenarios
   */
  async createOptimizationScenario(req, res) {
    try {
      const {
        name,
        description,
        scenarioType,
        projectId,
        criteria,
        constraints,
        algorithm,
        parentScenarioId,
        geographicScope,
        timeHorizon
      } = req.body;

      // Validate required parameters
      if (!name || !scenarioType || !projectId || !geographicScope || !timeHorizon) {
        return res.status(400).json({
          success: false,
          error: 'Name, scenario type, project ID, geographicScope, and timeHorizon are required'
        });
      }

      const result = await optimizationService.createOptimizationScenario({
        name,
        description,
        scenarioType,
        projectId,
        criteria,
        constraints,
        algorithm,
        parentScenarioId,
        geographicScope,
        timeHorizon,
        userId: req.user.userId
      });

      res.status(201).json(result);
    } catch (error) {
      this.logger.error('Scenario creation controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Scenario creation failed'
      });
    }
  }

  /**
   * Get Optimization Scenarios
   * GET /api/analytics/scenarios
   */
  async getOptimizationScenarios(req, res) {
    try {
      const { projectId, scenarioType, status } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      let query = {};
      if (projectId) query.projectId = projectId;
      if (scenarioType) query.scenarioType = scenarioType;
      if (status) query.status = status;

      const scenarios = await OptimizationScenario.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('projectId', 'name')
        .populate('createdBy', 'firstName lastName');

      const total = await OptimizationScenario.countDocuments(query);

      res.status(200).json({
        success: true,
        data: scenarios,
        metadata: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      this.logger.error('Get scenarios controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve scenarios'
      });
    }
  }

  /**
   * Get Optimization Scenario by ID
   * GET /api/analytics/scenarios/:id
   */
  async getOptimizationScenario(req, res) {
    try {
      const { id } = req.params;

      const scenario = await OptimizationScenario.findById(id)
        .populate('projectId', 'name')
        .populate('createdBy', 'firstName lastName')
        .populate('parentScenarioId', 'name version');

      if (!scenario) {
        return res.status(404).json({
          success: false,
          error: 'Scenario not found'
        });
      }

      res.status(200).json({
        success: true,
        data: scenario
      });
    } catch (error) {
      this.logger.error('Get scenario controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve scenario'
      });
    }
  }

  /**
   * Get Scenario Version History
   * GET /api/analytics/scenarios/:id/history
   */
  async getScenarioHistory(req, res) {
    try {
      const { id } = req.params;

      const history = await OptimizationScenario.getVersionHistory(id);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      this.logger.error('Get scenario history controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve scenario history'
      });
    }
  }

  /**
   * Update Optimization Scenario
   * PUT /api/analytics/scenarios/:id
   */
  async updateOptimizationScenario(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const scenario = await OptimizationScenario.findById(id);

      if (!scenario) {
        return res.status(404).json({
          success: false,
          error: 'Scenario not found'
        });
      }

      // Update scenario
      Object.assign(scenario, updateData);
      scenario.metadata.lastModified = new Date();
      scenario.metadata.modifiedBy = req.user.userId;

      await scenario.save();

      res.status(200).json({
        success: true,
        data: scenario
      });
    } catch (error) {
      this.logger.error('Update scenario controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update scenario'
      });
    }
  }

  /**
   * Delete Optimization Scenario
   * DELETE /api/analytics/scenarios/:id
   */
  async deleteOptimizationScenario(req, res) {
    try {
      const { id } = req.params;

      const scenario = await OptimizationScenario.findById(id);

      if (!scenario) {
        return res.status(404).json({
          success: false,
          error: 'Scenario not found'
        });
      }

      // Check if scenario has child scenarios
      const childScenarios = await OptimizationScenario.find({ parentScenarioId: id });
      if (childScenarios.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete scenario with child scenarios'
        });
      }

      await OptimizationScenario.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Scenario deleted successfully'
      });
    } catch (error) {
      this.logger.error('Delete scenario controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete scenario'
      });
    }
  }

  /**
   * Get Analytics Data
   * GET /api/analytics/data
   */
  async getAnalyticsData(req, res) {
    try {
      const { projectId, dataType, timeRange, infrastructureId } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      let query = {};
      if (projectId) query.projectId = projectId;
      if (dataType) query.dataType = dataType;
      if (infrastructureId) query.infrastructureId = infrastructureId;
      if (timeRange) {
        query.timestamp = {
          $gte: new Date(timeRange.start),
          $lte: new Date(timeRange.end)
        };
      }

      const data = await AnalyticsData.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('infrastructureId', 'infrastructureType capacity')
        .populate('projectId', 'name');

      const total = await AnalyticsData.countDocuments(query);

      res.status(200).json({
        success: true,
        data: data,
        metadata: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      this.logger.error('Get analytics data controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics data'
      });
    }
  }

  /**
   * Create Analytics Data
   * POST /api/analytics/data
   */
  async createAnalyticsData(req, res) {
    try {
      const {
        dataType,
        location,
        timestamp,
        timePeriod,
        infrastructureId,
        projectId,
        demandForecast,
        capacityUtilization,
        costAnalysis,
        environmentalImpact,
        networkPerformance,
        renewableIntegration,
        scenarioId,
        metadata
      } = req.body;

      // Validate required parameters
      if (!dataType || !location || !timestamp || !timePeriod || !projectId) {
        return res.status(400).json({
          success: false,
          error: 'Data type, location, timestamp, time period, and project ID are required'
        });
      }

      const analyticsData = new AnalyticsData({
        dataType,
        location,
        timestamp,
        timePeriod,
        infrastructureId,
        projectId,
        demandForecast,
        capacityUtilization,
        costAnalysis,
        environmentalImpact,
        networkPerformance,
        renewableIntegration,
        scenarioId,
        metadata,
        createdBy: req.user.userId
      });

      await analyticsData.save();

      res.status(201).json({
        success: true,
        data: analyticsData
      });
    } catch (error) {
      this.logger.error('Create analytics data controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create analytics data'
      });
    }
  }

  /**
   * Get Analytics Summary
   * GET /api/analytics/summary
   */
  async getAnalyticsSummary(req, res) {
    try {
      const { projectId } = req.query;

      if (!projectId) {
        return res.status(400).json({
          success: false,
          error: 'Project ID is required'
        });
      }

      // Get summary statistics
      const summary = await AnalyticsData.aggregate([
        {
          $match: { projectId: projectId }
        },
        {
          $group: {
            _id: '$dataType',
            count: { $sum: 1 },
            latestTimestamp: { $max: '$timestamp' },
            avgQuality: { $avg: { $toDouble: '$metadata.quality' } }
          }
        }
      ]);

      // Get scenario summary
      const scenarioSummary = await OptimizationScenario.aggregate([
        {
          $match: { projectId: projectId }
        },
        {
          $group: {
            _id: '$scenarioType',
            count: { $sum: 1 },
            completedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            avgScore: { $avg: '$results.optimalSolution.score' }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: {
          analyticsSummary: summary,
          scenarioSummary: scenarioSummary
        }
      });
    } catch (error) {
      this.logger.error('Get analytics summary controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve analytics summary'
      });
    }
  }
}

module.exports = new AnalyticsController();
