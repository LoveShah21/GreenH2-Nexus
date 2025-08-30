const mongoose = require('mongoose');

const analyticsDataSchema = new mongoose.Schema({
  // Core identification
  dataType: {
    type: String,
    enum: ['demand_forecast', 'capacity_utilization', 'cost_analysis', 'environmental_impact', 'network_performance', 'renewable_integration'],
    required: true,
    index: true
  },
  
  // Geospatial reference
  location: {
    type: {
      type: String,
      enum: ['Point', 'Polygon', 'MultiPolygon'],
      required: true
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  
  // Time-series data
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  
  // Time period for aggregation
  timePeriod: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
    index: true
  },
  
  // Infrastructure reference
  infrastructureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Infrastructure',
    index: true
  },
  
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    index: true
  },
  
  // Demand forecasting data
  demandForecast: {
    predictedDemand: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Predicted demand must be at least 0']
    },
    confidenceInterval: {
      lower: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Lower bound must be at least 0']
      },
      upper: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Upper bound must be at least 0']
      }
    },
    factors: {
      populationGrowth: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Population growth must be at least 0']
      },
      economicGrowth: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Economic growth must be at least 0']
      },
      seasonalVariation: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Seasonal variation must be at least 0']
      },
      policyImpact: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Policy impact must be at least 0']
      }
    }
  },
  
  // Capacity utilization data
  capacityUtilization: {
    currentUtilization: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Current utilization must be at least 0'],
      max: [1, 'Current utilization must be at most 1']
    },
    peakUtilization: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Peak utilization must be at least 0'],
      max: [1, 'Peak utilization must be at most 1']
    },
    averageUtilization: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Average utilization must be at least 0'],
      max: [1, 'Average utilization must be at most 1']
    },
    bottlenecks: [{
      component: String,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    }]
  },
  
  // Cost analysis data
  costAnalysis: {
    operationalCosts: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Operational costs must be at least 0']
    },
    capitalCosts: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Capital costs must be at least 0']
    },
    maintenanceCosts: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Maintenance costs must be at least 0']
    },
    energyCosts: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Energy costs must be at least 0']
    },
    levelizedCost: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Levelized cost must be at least 0']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Environmental impact data
  environmentalImpact: {
    carbonEmissions: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Carbon emissions must be at least 0']
    },
    waterUsage: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Water usage must be at least 0']
    },
    landUse: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Land use must be at least 0']
    },
    biodiversityImpact: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    airQualityImpact: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  
  // Network performance data
  networkPerformance: {
    efficiency: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Efficiency must be at least 0'],
      max: [1, 'Efficiency must be at most 1']
    },
    reliability: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Reliability must be at least 0'],
      max: [1, 'Reliability must be at most 1']
    },
    connectivity: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Connectivity must be at least 0'],
      max: [1, 'Connectivity must be at most 1']
    },
    redundancy: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Redundancy must be at least 0'],
      max: [1, 'Redundancy must be at most 1']
    }
  },
  
  // Renewable integration data
  renewableIntegration: {
    renewablePercentage: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Renewable percentage must be at least 0'],
      max: [1, 'Renewable percentage must be at most 1']
    },
    gridStability: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Grid stability must be at least 0'],
      max: [1, 'Grid stability must be at most 1']
    },
    storageRequirements: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Storage requirements must be at least 0']
    },
    intermittencyFactor: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Intermittency factor must be at least 0'],
      max: [1, 'Intermittency factor must be at most 1']
    }
  },
  
  // Scenario and versioning
  scenarioId: {
    type: String,
    index: true
  },
  
  version: {
    type: Number,
    default: 1,
    index: true
  },
  
  // Metadata
  metadata: {
    source: String,
    quality: {
      type: String,
      enum: ['low', 'medium', 'high', 'verified']
    },
    lastUpdated: Date,
    updateFrequency: String
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
analyticsDataSchema.index({ location: '2dsphere' });

// Compound indexes for efficient queries
analyticsDataSchema.index({ dataType: 1, timestamp: -1, location: '2dsphere' });
analyticsDataSchema.index({ projectId: 1, dataType: 1, timestamp: -1 });
analyticsDataSchema.index({ infrastructureId: 1, dataType: 1, timestamp: -1 });
analyticsDataSchema.index({ scenarioId: 1, version: -1, timestamp: -1 });

// TTL index for automatic cleanup of old data (optional)
// analyticsDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Static method to find analytics data by type and time range
analyticsDataSchema.statics.findByTypeAndTimeRange = function(dataType, startTime, endTime) {
  return this.find({
    dataType,
    timestamp: {
      $gte: startTime,
      $lte: endTime
    }
  }).sort({ timestamp: 1 });
};

// Static method to find analytics data within geographic bounds
analyticsDataSchema.statics.findWithinBounds = function(bounds, dataType = null) {
  const query = {
    location: {
      $geoWithin: {
        $box: [
          [bounds.swLng, bounds.swLat],
          [bounds.neLng, bounds.neLat]
        ]
      }
    }
  };
  
  if (dataType) {
    query.dataType = dataType;
  }
  
  return this.find(query);
};

// Static method to find analytics data near a point
analyticsDataSchema.statics.findNearPoint = function(longitude, latitude, maxDistanceKm, dataType = null) {
  const query = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistanceKm * 1000
      }
    }
  };
  
  if (dataType) {
    query.dataType = dataType;
  }
  
  return this.find(query);
};

// Static method to get latest analytics data for a project
analyticsDataSchema.statics.getLatestForProject = function(projectId, dataType = null) {
  const query = { projectId };
  if (dataType) {
    query.dataType = dataType;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(1);
};

// Instance method to calculate trend
analyticsDataSchema.methods.calculateTrend = function() {
  // This would be implemented with historical data comparison
  return 'stable'; // Placeholder
};

// Instance method to get data quality score
analyticsDataSchema.methods.getQualityScore = function() {
  const qualityScores = {
    'low': 0.3,
    'medium': 0.6,
    'high': 0.8,
    'verified': 1.0
  };
  return qualityScores[this.metadata.quality] || 0.5;
};

const AnalyticsData = mongoose.model('AnalyticsData', analyticsDataSchema);

module.exports = AnalyticsData;
