const AnalyticsData = require('../models/AnalyticsData');
const Infrastructure = require('../models/Infrastructure');
const RenewableSource = require('../models/RenewableSource');
const OptimizationScenario = require('../models/OptimizationScenario');
const { logger } = require('../utils/logger');

class AnalyticsService {
  constructor() {
    this.logger = logger;
  }

  /**
   * Advanced Geospatial Analysis using MongoDB Aggregation Framework
   * Combines multiple criteria for comprehensive site analysis
   */
  async performGeospatialAnalysis(params) {
    const {
      centerPoint,
      radiusKm,
      infrastructureTypes = [],
      renewableTypes = [],
      criteria = {}
    } = params;

    try {
      const pipeline = [
        // Stage 1: Find infrastructure within radius
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [centerPoint.lng, centerPoint.lat],
              maxDistance: radiusKm * 1000
            },
            distanceField: 'distance',
            spherical: true,
            key: 'geometry'
          }
        },
        
        // Stage 2: Filter by infrastructure type if specified
        ...(infrastructureTypes.length > 0 ? [{
          $match: {
            infrastructureType: { $in: infrastructureTypes }
          }
        }] : []),
        
        // Stage 3: Lookup related renewable sources
        {
          $lookup: {
            from: 'renewablesources',
            let: { infraLocation: '$geometry' },
            pipeline: [
              {
                $geoNear: {
                  near: '$$infraLocation',
                  distanceField: 'distanceToInfrastructure',
                  spherical: true,
                  key: 'location',
                  maxDistance: 50000 // 50km
                }
              },
              ...(renewableTypes.length > 0 ? [{
                $match: { sourceType: { $in: renewableTypes } }
              }] : []),
              {
                $project: {
                  sourceType: 1,
                  capacityMW: 1,
                  availabilityFactor: 1,
                  distanceToInfrastructure: 1,
                  lcoe: 1
                }
              }
            ],
            as: 'nearbyRenewables'
          }
        },
        
        // Stage 4: Calculate aggregated metrics
        {
          $addFields: {
            totalRenewableCapacity: {
              $sum: '$nearbyRenewables.capacityMW'
            },
            averageRenewableAvailability: {
              $avg: '$nearbyRenewables.availabilityFactor'
            },
            averageRenewableLCOE: {
              $avg: '$nearbyRenewables.lcoe.value'
            },
            renewableCount: {
              $size: '$nearbyRenewables'
            }
          }
        },
        
        // Stage 5: Calculate composite score
        {
          $addFields: {
            compositeScore: {
              $add: [
                { $multiply: ['$capacity.value', 0.3] },
                { $multiply: ['$totalRenewableCapacity', 0.25] },
                { $multiply: ['$averageRenewableAvailability', 0.2] },
                { $multiply: [{ $divide: [1000, '$averageRenewableLCOE'] }, 0.15] },
                { $multiply: [{ $divide: [100, '$distance'] }, 0.1] }
              ]
            }
          }
        },
        
        // Stage 6: Sort by composite score
        {
          $sort: { compositeScore: -1 }
        },
        
        // Stage 7: Project final results
        {
          $project: {
            _id: 1,
            infrastructureType: 1,
            capacity: 1,
            operationalStatus: 1,
            distance: 1,
            compositeScore: 1,
            totalRenewableCapacity: 1,
            averageRenewableAvailability: 1,
            averageRenewableLCOE: 1,
            renewableCount: 1,
            nearbyRenewables: 1,
            geometry: 1
          }
        }
      ];

      const results = await Infrastructure.aggregate(pipeline);
      
      this.logger.info(`Geospatial analysis completed for ${results.length} infrastructure items`);
      return {
        success: true,
        data: results,
        metadata: {
          totalResults: results.length,
          searchRadius: radiusKm,
          criteria: criteria
        }
      };
    } catch (error) {
      this.logger.error('Geospatial analysis failed:', error);
      throw error;
    }
  }

  /**
   * Demand Forecasting using Time-Series Aggregation
   * Analyzes historical data to predict future demand patterns
   */
  async performDemandForecasting(params) {
    const {
      projectId,
      timeHorizon,
      timeStep = 'monthly',
      factors = {}
    } = params;

    try {
      const pipeline = [
        // Stage 1: Filter by project and data type
        {
          $match: {
            projectId: projectId,
            dataType: 'demand_forecast',
            timePeriod: timeStep
          }
        },
        
        // Stage 2: Sort by timestamp
        {
          $sort: { timestamp: 1 }
        },
        
        // Stage 3: Group by time periods
        {
          $group: {
            _id: {
              year: { $year: '$timestamp' },
              month: { $month: '$timestamp' },
              ...(timeStep === 'weekly' && { week: { $week: '$timestamp' } }),
              ...(timeStep === 'daily' && { day: { $dayOfYear: '$timestamp' } })
            },
            avgDemand: { $avg: '$demandForecast.predictedDemand' },
            minDemand: { $min: '$demandForecast.predictedDemand' },
            maxDemand: { $max: '$demandForecast.predictedDemand' },
            totalDemand: { $sum: '$demandForecast.predictedDemand' },
            demandCount: { $sum: 1 },
            avgPopulationGrowth: { $avg: '$demandForecast.factors.populationGrowth' },
            avgEconomicGrowth: { $avg: '$demandForecast.factors.economicGrowth' },
            avgSeasonalVariation: { $avg: '$demandForecast.factors.seasonalVariation' },
            avgPolicyImpact: { $avg: '$demandForecast.factors.policyImpact' }
          }
        },
        
        // Stage 4: Calculate trend analysis
        {
          $addFields: {
            period: {
              $concat: [
                { $toString: '$_id.year' },
                '-',
                { $toString: '$_id.month' }
              ]
            },
            demandGrowth: {
              $cond: {
                if: { $gt: ['$demandCount', 1] },
                then: {
                  $divide: [
                    { $subtract: ['$maxDemand', '$minDemand'] },
                    '$avgDemand'
                  ]
                },
                else: 0
              }
            }
          }
        },
        
        // Stage 5: Sort by period
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        },
        
        // Stage 6: Calculate moving averages
        {
          $addFields: {
            movingAverage3: {
              $avg: {
                $slice: ['$avgDemand', -3]
              }
            },
            movingAverage6: {
              $avg: {
                $slice: ['$avgDemand', -6]
              }
            }
          }
        },
        
        // Stage 7: Project final results
        {
          $project: {
            _id: 0,
            period: 1,
            avgDemand: 1,
            minDemand: 1,
            maxDemand: 1,
            demandGrowth: 1,
            movingAverage3: 1,
            movingAverage6: 1,
            factors: {
              populationGrowth: '$avgPopulationGrowth',
              economicGrowth: '$avgEconomicGrowth',
              seasonalVariation: '$avgSeasonalVariation',
              policyImpact: '$avgPolicyImpact'
            }
          }
        }
      ];

      const results = await AnalyticsData.aggregate(pipeline);
      
      // Calculate forecast using trend analysis
      const forecast = this.calculateForecast(results, timeHorizon, factors);
      
      this.logger.info(`Demand forecasting completed for project ${projectId}`);
      return {
        success: true,
        data: {
          historical: results,
          forecast: forecast
        },
        metadata: {
          timeHorizon,
          timeStep,
          factors
        }
      };
    } catch (error) {
      this.logger.error('Demand forecasting failed:', error);
      throw error;
    }
  }

  /**
   * Cost Optimization Analysis using Mathematical Aggregation Operators
   * Analyzes cost structures and identifies optimization opportunities
   */
  async performCostOptimization(params) {
    const {
      projectId,
      infrastructureIds = [],
      costTypes = ['operational', 'capital', 'maintenance', 'energy'],
      timeRange
    } = params;

    try {
      const pipeline = [
        // Stage 1: Filter by project and data type
        {
          $match: {
            projectId: projectId,
            dataType: 'cost_analysis',
            ...(timeRange && {
              timestamp: {
                $gte: new Date(timeRange.start),
                $lte: new Date(timeRange.end)
              }
            }),
            ...(infrastructureIds.length > 0 && {
              infrastructureId: { $in: infrastructureIds }
            })
          }
        },
        
        // Stage 2: Lookup infrastructure details
        {
          $lookup: {
            from: 'infrastructure',
            localField: 'infrastructureId',
            foreignField: '_id',
            as: 'infrastructure'
          }
        },
        
        // Stage 3: Unwind infrastructure array
        {
          $unwind: '$infrastructure'
        },
        
        // Stage 4: Calculate cost metrics
        {
          $addFields: {
            totalCost: {
              $add: [
                '$costAnalysis.operationalCosts',
                '$costAnalysis.capitalCosts',
                '$costAnalysis.maintenanceCosts',
                '$costAnalysis.energyCosts'
              ]
            },
            costPerUnit: {
              $cond: {
                if: { $gt: ['$infrastructure.capacity.value', 0] },
                then: {
                  $divide: [
                    {
                      $add: [
                        '$costAnalysis.operationalCosts',
                        '$costAnalysis.capitalCosts',
                        '$costAnalysis.maintenanceCosts',
                        '$costAnalysis.energyCosts'
                      ]
                    },
                    '$infrastructure.capacity.value'
                  ]
                },
                else: 0
              }
            }
          }
        },
        
        // Stage 5: Group by infrastructure type
        {
          $group: {
            _id: '$infrastructure.infrastructureType',
            avgTotalCost: { $avg: '$totalCost' },
            minTotalCost: { $min: '$totalCost' },
            maxTotalCost: { $max: '$totalCost' },
            avgCostPerUnit: { $avg: '$costPerUnit' },
            totalInfrastructure: { $sum: 1 },
            avgOperationalCost: { $avg: '$costAnalysis.operationalCosts' },
            avgCapitalCost: { $avg: '$costAnalysis.capitalCosts' },
            avgMaintenanceCost: { $avg: '$costAnalysis.maintenanceCosts' },
            avgEnergyCost: { $avg: '$costAnalysis.energyCosts' },
            avgLevelizedCost: { $avg: '$costAnalysis.levelizedCost' }
          }
        },
        
        // Stage 6: Calculate optimization potential
        {
          $addFields: {
            optimizationPotential: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$maxTotalCost', '$minTotalCost'] },
                    '$avgTotalCost'
                  ]
                },
                100
              ]
            },
            costEfficiency: {
              $cond: {
                if: { $lt: ['$avgCostPerUnit', 1000] },
                then: 'high',
                else: {
                  $cond: {
                    if: { $lt: ['$avgCostPerUnit', 2000] },
                    then: 'medium',
                    else: 'low'
                  }
                }
              }
            }
          }
        },
        
        // Stage 7: Sort by optimization potential
        {
          $sort: { optimizationPotential: -1 }
        },
        
        // Stage 8: Project final results
        {
          $project: {
            _id: 0,
            infrastructureType: '$_id',
            avgTotalCost: 1,
            minTotalCost: 1,
            maxTotalCost: 1,
            avgCostPerUnit: 1,
            totalInfrastructure: 1,
            optimizationPotential: 1,
            costEfficiency: 1,
            costBreakdown: {
              operational: '$avgOperationalCost',
              capital: '$avgCapitalCost',
              maintenance: '$avgMaintenanceCost',
              energy: '$avgEnergyCost',
              levelized: '$avgLevelizedCost'
            }
          }
        }
      ];

      const results = await AnalyticsData.aggregate(pipeline);
      
      this.logger.info(`Cost optimization analysis completed for project ${projectId}`);
      return {
        success: true,
        data: results,
        metadata: {
          totalInfrastructureTypes: results.length,
          costTypes,
          timeRange
        }
      };
    } catch (error) {
      this.logger.error('Cost optimization analysis failed:', error);
      throw error;
    }
  }

  /**
   * Network Analysis using Graph-like Queries
   * Analyzes infrastructure connectivity and network performance
   */
  async performNetworkAnalysis(params) {
    const {
      projectId,
      analysisType = 'connectivity',
      depth = 3
    } = params;

    try {
      const pipeline = [
        // Stage 1: Find all infrastructure in project
        {
          $match: {
            projectId: projectId
          }
        },
        
        // Stage 2: Lookup connected infrastructure recursively
        {
          $graphLookup: {
            from: 'infrastructure',
            startWith: '$connectedInfrastructure.infrastructureId',
            connectFromField: 'connectedInfrastructure.infrastructureId',
            connectToField: '_id',
            as: 'networkConnections',
            depthField: 'connectionDepth',
            maxDepth: depth
          }
        },
        
        // Stage 3: Calculate network metrics
        {
          $addFields: {
            connectionCount: { $size: '$connectedInfrastructure' },
            networkSize: { $size: '$networkConnections' },
            avgConnectionDistance: {
              $avg: '$connectedInfrastructure.distance'
            },
            networkDensity: {
              $divide: [
                { $size: '$connectedInfrastructure' },
                { $max: [{ $size: '$networkConnections' }, 1] }
              ]
            }
          }
        },
        
        // Stage 4: Lookup network performance data
        {
          $lookup: {
            from: 'analyticsdata',
            let: { infraId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$infrastructureId', '$$infraId'] },
                  dataType: 'network_performance'
                }
              },
              {
                $sort: { timestamp: -1 }
              },
              {
                $limit: 1
              }
            ],
            as: 'performanceData'
          }
        },
        
        // Stage 5: Unwind performance data
        {
          $unwind: {
            path: '$performanceData',
            preserveNullAndEmptyArrays: true
          }
        },
        
        // Stage 6: Calculate composite network score
        {
          $addFields: {
            networkScore: {
              $add: [
                { $multiply: ['$networkDensity', 0.3] },
                { $multiply: [{ $divide: [1, { $add: ['$avgConnectionDistance', 1] }] }, 0.2] },
                { $multiply: ['$performanceData.networkPerformance.efficiency', 0.25] },
                { $multiply: ['$performanceData.networkPerformance.reliability', 0.25] }
              ]
            }
          }
        },
        
        // Stage 7: Group by infrastructure type
        {
          $group: {
            _id: '$infrastructureType',
            avgNetworkScore: { $avg: '$networkScore' },
            avgConnectionCount: { $avg: '$connectionCount' },
            avgNetworkSize: { $avg: '$networkSize' },
            avgNetworkDensity: { $avg: '$networkDensity' },
            avgEfficiency: { $avg: '$performanceData.networkPerformance.efficiency' },
            avgReliability: { $avg: '$performanceData.networkPerformance.reliability' },
            totalInfrastructure: { $sum: 1 }
          }
        },
        
        // Stage 8: Sort by network score
        {
          $sort: { avgNetworkScore: -1 }
        },
        
        // Stage 9: Project final results
        {
          $project: {
            _id: 0,
            infrastructureType: '$_id',
            avgNetworkScore: 1,
            avgConnectionCount: 1,
            avgNetworkSize: 1,
            avgNetworkDensity: 1,
            avgEfficiency: 1,
            avgReliability: 1,
            totalInfrastructure: 1
          }
        }
      ];

      const results = await Infrastructure.aggregate(pipeline);
      
      this.logger.info(`Network analysis completed for project ${projectId}`);
      return {
        success: true,
        data: results,
        metadata: {
          analysisType,
          depth,
          totalInfrastructureTypes: results.length
        }
      };
    } catch (error) {
      this.logger.error('Network analysis failed:', error);
      throw error;
    }
  }

  /**
   * Environmental Impact Assessment using Geospatial Overlap Analysis
   * Analyzes environmental constraints and impact zones
   */
  async performEnvironmentalAssessment(params) {
    const {
      projectId,
      geographicBounds,
      impactTypes = ['carbon', 'water', 'land', 'biodiversity', 'air']
    } = params;

    try {
      const pipeline = [
        // Stage 1: Find infrastructure within bounds
        {
          $match: {
            projectId: projectId,
            geometry: {
              $geoWithin: {
                $box: [
                  [geographicBounds.swLng, geographicBounds.swLat],
                  [geographicBounds.neLng, geographicBounds.neLat]
                ]
              }
            }
          }
        },
        
        // Stage 2: Lookup environmental impact data
        {
          $lookup: {
            from: 'analyticsdata',
            let: { infraId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$infrastructureId', '$$infraId'] },
                  dataType: 'environmental_impact'
                }
              },
              {
                $sort: { timestamp: -1 }
              },
              {
                $limit: 1
              }
            ],
            as: 'environmentalData'
          }
        },
        
        // Stage 3: Unwind environmental data
        {
          $unwind: {
            path: '$environmentalData',
            preserveNullAndEmptyArrays: true
          }
        },
        
        // Stage 4: Calculate environmental metrics
        {
          $addFields: {
            totalEnvironmentalImpact: {
              $add: [
                '$environmentalData.environmentalImpact.carbonEmissions',
                '$environmentalData.environmentalImpact.waterUsage',
                '$environmentalData.environmentalImpact.landUse'
              ]
            },
            impactScore: {
              $add: [
                { $multiply: ['$environmentalData.environmentalImpact.carbonEmissions', 0.4] },
                { $multiply: ['$environmentalData.environmentalImpact.waterUsage', 0.3] },
                { $multiply: ['$environmentalData.environmentalImpact.landUse', 0.3] }
              ]
            }
          }
        },
        
        // Stage 5: Group by infrastructure type
        {
          $group: {
            _id: '$infrastructureType',
            avgCarbonEmissions: { $avg: '$environmentalData.environmentalImpact.carbonEmissions' },
            avgWaterUsage: { $avg: '$environmentalData.environmentalImpact.waterUsage' },
            avgLandUse: { $avg: '$environmentalData.environmentalImpact.landUse' },
            avgImpactScore: { $avg: '$impactScore' },
            totalInfrastructure: { $sum: 1 },
            biodiversityImpactCount: {
              $sum: {
                $cond: [
                  { $eq: ['$environmentalData.environmentalImpact.biodiversityImpact', 'high'] },
                  1,
                  0
                ]
              }
            },
            airQualityImpactCount: {
              $sum: {
                $cond: [
                  { $eq: ['$environmentalData.environmentalImpact.airQualityImpact', 'high'] },
                  1,
                  0
                ]
              }
            }
          }
        },
        
        // Stage 6: Calculate environmental risk
        {
          $addFields: {
            environmentalRisk: {
              $cond: {
                if: { $gt: ['$avgImpactScore', 100] },
                then: 'high',
                else: {
                  $cond: {
                    if: { $gt: ['$avgImpactScore', 50] },
                    then: 'medium',
                    else: 'low'
                  }
                }
              }
            },
            complianceScore: {
              $subtract: [
                100,
                { $multiply: ['$avgImpactScore', 0.5] }
              ]
            }
          }
        },
        
        // Stage 7: Sort by environmental risk
        {
          $sort: { avgImpactScore: -1 }
        },
        
        // Stage 8: Project final results
        {
          $project: {
            _id: 0,
            infrastructureType: '$_id',
            avgCarbonEmissions: 1,
            avgWaterUsage: 1,
            avgLandUse: 1,
            avgImpactScore: 1,
            environmentalRisk: 1,
            complianceScore: 1,
            totalInfrastructure: 1,
            biodiversityImpactCount: 1,
            airQualityImpactCount: 1
          }
        }
      ];

      const results = await Infrastructure.aggregate(pipeline);
      
      this.logger.info(`Environmental assessment completed for project ${projectId}`);
      return {
        success: true,
        data: results,
        metadata: {
          geographicBounds,
          impactTypes,
          totalInfrastructureTypes: results.length
        }
      };
    } catch (error) {
      this.logger.error('Environmental assessment failed:', error);
      throw error;
    }
  }

  /**
   * Helper method to calculate forecast based on historical data
   */
  calculateForecast(historicalData, timeHorizon, factors) {
    if (historicalData.length < 3) {
      return null;
    }

    // Simple linear regression for trend calculation
    const n = historicalData.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    const yValues = historicalData.map(d => d.avgDemand);

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecast
    const forecast = [];
    for (let i = 1; i <= timeHorizon; i++) {
      const predictedValue = slope * (n + i) + intercept;
      forecast.push({
        period: `forecast_${i}`,
        predictedDemand: Math.max(0, predictedValue),
        confidence: 0.8 - (i * 0.05) // Decreasing confidence over time
      });
    }

    return forecast;
  }

  /**
   * Real-time monitoring data aggregation with time-windowed queries
   */
  async getRealTimeMetrics(params) {
    const {
      projectId,
      timeWindow = '1h', // 1h, 6h, 24h, 7d
      metrics = ['demand', 'capacity', 'cost', 'environmental']
    } = params;

    try {
      const now = new Date();
      const timeWindowMs = this.parseTimeWindow(timeWindow);
      const startTime = new Date(now.getTime() - timeWindowMs);

      // Convert projectId to ObjectId if it's a string
      const mongoose = require('mongoose');
      const projectObjectId = mongoose.Types.ObjectId.isValid(projectId) 
        ? new mongoose.Types.ObjectId(projectId) 
        : projectId;

      // First, check if we have any data for this project
      const dataCount = await AnalyticsData.countDocuments({ projectId: projectObjectId });
      
      if (dataCount === 0) {
        return {
          success: true,
          data: [],
          metadata: {
            timeWindow,
            startTime,
            endTime: now,
            totalDataPoints: 0,
            message: 'No analytics data found for this project'
          }
        };
      }

      const pipeline = [
        // Stage 1: Filter by time window and project
        {
          $match: {
            projectId: projectObjectId,
            timestamp: { $gte: startTime, $lte: now }
          }
        },
        
        // Stage 2: Add computed fields with null checks
        {
          $addFields: {
            demandValue: {
              $cond: {
                if: { $ne: ['$demandForecast.predictedDemand', null] },
                then: { $toDouble: '$demandForecast.predictedDemand' },
                else: 0
              }
            },
            capacityValue: {
              $cond: {
                if: { $ne: ['$capacityUtilization.currentUtilization', null] },
                then: { $toDouble: '$capacityUtilization.currentUtilization' },
                else: 0
              }
            },
            costValue: {
              $cond: {
                if: { $ne: ['$costAnalysis.levelizedCost', null] },
                then: { $toDouble: '$costAnalysis.levelizedCost' },
                else: 0
              }
            },
            emissionsValue: {
              $cond: {
                if: { $ne: ['$environmentalImpact.carbonEmissions', null] },
                then: { $toDouble: '$environmentalImpact.carbonEmissions' },
                else: 0
              }
            }
          }
        },
        
        // Stage 3: Group by time intervals
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d %H:%M',
                date: '$timestamp'
              }
            },
            avgDemand: { $avg: '$demandValue' },
            avgCapacity: { $avg: '$capacityValue' },
            avgCost: { $avg: '$costValue' },
            avgCarbonEmissions: { $avg: '$emissionsValue' },
            dataPoints: { $sum: 1 },
            dataTypes: { $addToSet: '$dataType' }
          }
        },
        
        // Stage 4: Sort by time
        {
          $sort: { '_id': 1 }
        }
      ];

      const results = await AnalyticsData.aggregate(pipeline);
      
      // Calculate trends if we have multiple data points
      if (results.length > 1) {
        for (let i = 1; i < results.length; i++) {
          results[i].demandTrend = results[i].avgDemand - results[i-1].avgDemand;
          results[i].capacityTrend = results[i].avgCapacity - results[i-1].avgCapacity;
          results[i].costTrend = results[i].avgCost - results[i-1].avgCost;
        }
      }
      
      return {
        success: true,
        data: results,
        metadata: {
          timeWindow,
          startTime,
          endTime: now,
          totalDataPoints: results.length,
          availableMetrics: metrics,
          dataTypes: [...new Set(results.flatMap(r => r.dataTypes || []))]
        }
      };
    } catch (error) {
      this.logger.error('Real-time metrics aggregation failed:', error);
      
      // Handle database connection errors gracefully
      if (error.name === 'MongooseServerSelectionError' || error.code === 'ECONNREFUSED') {
        return {
          success: true,
          data: [],
          metadata: {
            timeWindow,
            startTime,
            endTime: now,
            totalDataPoints: 0,
            message: 'Database connection unavailable - using mock data',
            mockData: true
          },
          mockData: [
            {
              _id: '2024-01-15 10:00',
              avgDemand: 175.5,
              avgCapacity: 0.82,
              avgCost: 0.085,
              avgCarbonEmissions: 1100.5,
              dataPoints: 1,
              demandTrend: 0,
              capacityTrend: 0,
              costTrend: 0
            },
            {
              _id: '2024-01-15 10:06',
              avgDemand: 178.2,
              avgCapacity: 0.84,
              avgCost: 0.087,
              avgCarbonEmissions: 1120.3,
              dataPoints: 1,
              demandTrend: 2.7,
              capacityTrend: 0.02,
              costTrend: 0.002
            }
          ]
        };
      }
      
      throw error;
    }
  }

  /**
   * Helper methods for time window parsing
   */
  parseTimeWindow(window) {
    const units = {
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    };
    
    const value = parseInt(window);
    const unit = window.slice(-1);
    
    return value * units[unit];
  }

  getBinSize(timeWindow) {
    const units = {
      '1h': 5, // 5 minutes
      '6h': 30, // 30 minutes
      '24h': 60, // 1 hour
      '7d': 1440 // 1 day
    };
    
    return units[timeWindow] || 60;
  }
}

module.exports = new AnalyticsService();
