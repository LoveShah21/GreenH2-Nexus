const mongoose = require('mongoose');

const optimizationScenarioSchema = new mongoose.Schema({
  // Core identification
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  scenarioType: {
    type: String,
    enum: ['site_selection', 'network_optimization', 'capacity_planning', 'cost_optimization', 'environmental_assessment', 'renewable_integration'],
    required: true,
    index: true
  },
  
  // Project reference
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  
  // Versioning
  version: {
    type: Number,
    default: 1,
    index: true
  },
  
  parentScenarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OptimizationScenario'
  },
  
  // Status and lifecycle
  status: {
    type: String,
    enum: ['draft', 'running', 'completed', 'failed', 'archived'],
    default: 'draft',
    index: true
  },
  
  // Geospatial scope
  geographicScope: {
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
  
  // Time horizon
  timeHorizon: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    timeStep: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    }
  },
  
  // Multi-criteria decision analysis parameters
  criteria: {
    economic: {
      weight: {
        type: Number,
        min: [0, 'Weight must be at least 0'],
        max: [1, 'Weight must be at most 1'],
        default: 0.3
      },
      factors: {
        capitalCost: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        operationalCost: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        maintenanceCost: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        energyCost: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        levelizedCost: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } }
      }
    },
    environmental: {
      weight: {
        type: Number,
        min: [0, 'Weight must be at least 0'],
        max: [1, 'Weight must be at most 1'],
        default: 0.25
      },
      factors: {
        carbonEmissions: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        waterUsage: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        landUse: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        biodiversityImpact: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        airQualityImpact: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } }
      }
    },
    technical: {
      weight: {
        type: Number,
        min: [0, 'Weight must be at least 0'],
        max: [1, 'Weight must be at most 1'],
        default: 0.25
      },
      factors: {
        efficiency: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        reliability: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        scalability: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        technologyMaturity: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } }
      }
    },
    social: {
      weight: {
        type: Number,
        min: [0, 'Weight must be at least 0'],
        max: [1, 'Weight must be at most 1'],
        default: 0.2
      },
      factors: {
        communityAcceptance: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        jobCreation: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        localDevelopment: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } },
        safety: { weight: { type: Number, min: [0, 'Weight must be at least 0'], max: [1, 'Weight must be at most 1'] } }
      }
    }
  },
  
  // Optimization constraints
  constraints: {
    budget: {
      type: mongoose.Schema.Types.Decimal128,
      min: [0, 'Budget must be at least 0']
    },
    timeline: {
      type: Number, // months
      min: [0, 'Timeline must be at least 0']
    },
    capacity: {
      min: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Minimum capacity must be at least 0']
      },
      max: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Maximum capacity must be at least 0']
      }
    },
    environmental: {
      maxCarbonEmissions: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Carbon emissions must be at least 0']
      },
      maxWaterUsage: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Water usage must be at least 0']
      },
      maxLandUse: {
        type: mongoose.Schema.Types.Decimal128,
        min: [0, 'Land use must be at least 0']
      }
    },
    regulatory: {
      complianceZones: [String],
      permits: [String],
      restrictions: [String]
    }
  },
  
  // Optimization algorithm parameters
  algorithm: {
    type: {
      type: String,
      enum: ['genetic_algorithm', 'particle_swarm', 'simulated_annealing', 'linear_programming', 'mixed_integer_programming'],
      required: true
    },
    parameters: {
      populationSize: Number,
      generations: Number,
      mutationRate: Number,
      crossoverRate: Number,
      convergenceThreshold: Number
    }
  },
  
  // Results and outputs
  results: {
    optimalSolution: {
      score: mongoose.Schema.Types.Decimal128,
      rank: Number,
      details: mongoose.Schema.Types.Mixed
    },
    alternatives: [{
      rank: Number,
      score: mongoose.Schema.Types.Decimal128,
      solution: mongoose.Schema.Types.Mixed,
      tradeoffs: mongoose.Schema.Types.Mixed
    }],
    sensitivityAnalysis: {
      parameterVariations: [mongoose.Schema.Types.Mixed],
      impactAssessment: mongoose.Schema.Types.Mixed
    },
    riskAssessment: {
      risks: [{
        type: String,
        probability: Number,
        impact: String,
        mitigation: String
      }],
      overallRisk: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    }
  },
  
  // Performance metrics
  performance: {
    executionTime: Number, // milliseconds
    iterations: Number,
    convergenceRate: Number,
    accuracy: Number,
    memoryUsage: Number
  },
  
  // Metadata
  metadata: {
    tags: [String],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    confidentiality: {
      type: String,
      enum: ['public', 'internal', 'confidential', 'restricted'],
      default: 'internal'
    },
    lastModified: Date,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
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

// Geospatial index for geographic scope queries
optimizationScenarioSchema.index({ geographicScope: '2dsphere' });

// Compound indexes for efficient queries
optimizationScenarioSchema.index({ projectId: 1, scenarioType: 1, status: 1 });
optimizationScenarioSchema.index({ status: 1, createdAt: -1 });
optimizationScenarioSchema.index({ createdBy: 1, scenarioType: 1, createdAt: -1 });
optimizationScenarioSchema.index({ version: 1, parentScenarioId: 1 });

// Static method to find scenarios by type and status
optimizationScenarioSchema.statics.findByTypeAndStatus = function(scenarioType, status) {
  return this.find({ scenarioType, status }).sort({ createdAt: -1 });
};

// Static method to find scenarios within geographic bounds
optimizationScenarioSchema.statics.findWithinBounds = function(bounds, scenarioType = null) {
  const query = {
    geographicScope: {
      $geoWithin: {
        $box: [
          [bounds.swLng, bounds.swLat],
          [bounds.neLng, bounds.neLat]
        ]
      }
    }
  };
  
  if (scenarioType) {
    query.scenarioType = scenarioType;
  }
  
  return this.find(query);
};

// Static method to find scenarios by project
optimizationScenarioSchema.statics.findByProject = function(projectId, status = null) {
  const query = { projectId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get scenario version history
optimizationScenarioSchema.statics.getVersionHistory = function(scenarioId) {
  return this.find({
    $or: [
      { _id: scenarioId },
      { parentScenarioId: scenarioId }
    ]
  }).sort({ version: 1 });
};

// Instance method to calculate overall score
optimizationScenarioSchema.methods.calculateOverallScore = function() {
  if (!this.results.optimalSolution) return null;
  
  const weights = {
    economic: this.criteria.economic.weight,
    environmental: this.criteria.environmental.weight,
    technical: this.criteria.technical.weight,
    social: this.criteria.social.weight
  };
  
  // This would be calculated based on the actual optimization results
  return this.results.optimalSolution.score;
};

// Instance method to get scenario summary
optimizationScenarioSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    type: this.scenarioType,
    status: this.status,
    version: this.version,
    score: this.calculateOverallScore(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Instance method to check if scenario is complete
optimizationScenarioSchema.methods.isComplete = function() {
  return this.status === 'completed' && this.results.optimalSolution;
};

// Instance method to get risk level
optimizationScenarioSchema.methods.getRiskLevel = function() {
  if (!this.results.riskAssessment) return 'unknown';
  return this.results.riskAssessment.overallRisk;
};

const OptimizationScenario = mongoose.model('OptimizationScenario', optimizationScenarioSchema);

module.exports = OptimizationScenario;
