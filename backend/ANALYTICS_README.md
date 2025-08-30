# Advanced Geospatial Analytics and Optimization Engine

## Overview

This document describes the sophisticated MongoDB-based analytics system for hydrogen infrastructure optimization, featuring advanced geospatial analysis, multi-criteria decision analysis, genetic algorithms, and real-time monitoring capabilities.

## 🏗️ Architecture

### Core Components

1. **Analytics Service** (`src/services/analyticsService.js`)
   - Advanced geospatial analysis using MongoDB aggregation pipelines
   - Demand forecasting with time-series analysis
   - Cost optimization using mathematical aggregation operators
   - Network analysis with graph-like queries
   - Environmental impact assessment
   - Real-time metrics aggregation

2. **Optimization Service** (`src/services/optimizationService.js`)
   - Multi-criteria decision analysis (MCDA)
   - Genetic algorithm optimization
   - Cost surface modeling
   - Capacity planning algorithms
   - Scenario planning with versioning

3. **Job Service** (`src/services/jobService.js`)
   - Background processing with Bull queues
   - MongoDB job storage
   - Real-time job monitoring
   - Queue management and statistics

4. **Data Models**
   - `AnalyticsData` - Time-series analytics data with geospatial features
   - `OptimizationScenario` - Multi-criteria optimization scenarios with versioning

## 🗄️ Database Schema

### AnalyticsData Model

```javascript
{
  dataType: 'demand_forecast' | 'capacity_utilization' | 'cost_analysis' | 
           'environmental_impact' | 'network_performance' | 'renewable_integration',
  location: {
    type: 'Point' | 'Polygon' | 'MultiPolygon',
    coordinates: [Number] // GeoJSON coordinates
  },
  timestamp: Date,
  timePeriod: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  infrastructureId: ObjectId,
  projectId: ObjectId,
  
  // Demand forecasting data
  demandForecast: {
    predictedDemand: Decimal128,
    confidenceInterval: { lower: Decimal128, upper: Decimal128 },
    factors: {
      populationGrowth: Decimal128,
      economicGrowth: Decimal128,
      seasonalVariation: Decimal128,
      policyImpact: Decimal128
    }
  },
  
  // Capacity utilization data
  capacityUtilization: {
    currentUtilization: Decimal128,
    peakUtilization: Decimal128,
    averageUtilization: Decimal128,
    bottlenecks: [{ component: String, severity: String }]
  },
  
  // Cost analysis data
  costAnalysis: {
    operationalCosts: Decimal128,
    capitalCosts: Decimal128,
    maintenanceCosts: Decimal128,
    energyCosts: Decimal128,
    levelizedCost: Decimal128,
    currency: String
  },
  
  // Environmental impact data
  environmentalImpact: {
    carbonEmissions: Decimal128,
    waterUsage: Decimal128,
    landUse: Decimal128,
    biodiversityImpact: String,
    airQualityImpact: String
  },
  
  // Network performance data
  networkPerformance: {
    efficiency: Decimal128,
    reliability: Decimal128,
    connectivity: Decimal128,
    redundancy: Decimal128
  },
  
  // Renewable integration data
  renewableIntegration: {
    renewablePercentage: Decimal128,
    gridStability: Decimal128,
    storageRequirements: Decimal128,
    intermittencyFactor: Decimal128
  },
  
  scenarioId: String,
  version: Number,
  metadata: {
    source: String,
    quality: 'low' | 'medium' | 'high' | 'verified',
    lastUpdated: Date,
    updateFrequency: String
  }
}
```

### OptimizationScenario Model

```javascript
{
  name: String,
  description: String,
  scenarioType: 'site_selection' | 'network_optimization' | 'capacity_planning' | 
               'cost_optimization' | 'environmental_assessment' | 'renewable_integration',
  projectId: ObjectId,
  version: Number,
  parentScenarioId: ObjectId,
  status: 'draft' | 'running' | 'completed' | 'failed' | 'archived',
  
  geographicScope: {
    type: 'Point' | 'Polygon' | 'MultiPolygon',
    coordinates: [Number]
  },
  
  timeHorizon: {
    startDate: Date,
    endDate: Date,
    timeStep: String
  },
  
  criteria: {
    economic: { weight: Number, factors: Object },
    environmental: { weight: Number, factors: Object },
    technical: { weight: Number, factors: Object },
    social: { weight: Number, factors: Object }
  },
  
  constraints: {
    budget: Decimal128,
    timeline: Number,
    capacity: { min: Decimal128, max: Decimal128 },
    environmental: Object,
    regulatory: Object
  },
  
  algorithm: {
    type: 'genetic_algorithm' | 'particle_swarm' | 'simulated_annealing' | 
          'linear_programming' | 'mixed_integer_programming',
    parameters: Object
  },
  
  results: {
    optimalSolution: { score: Decimal128, rank: Number, details: Object },
    alternatives: [{ rank: Number, score: Decimal128, solution: Object, tradeoffs: Object }],
    sensitivityAnalysis: Object,
    riskAssessment: Object
  },
  
  performance: {
    executionTime: Number,
    iterations: Number,
    convergenceRate: Number,
    accuracy: Number,
    memoryUsage: Number
  }
}
```

## 🔧 API Endpoints

### Analytics Endpoints

#### Geospatial Analysis
```http
POST /api/analytics/geospatial
Content-Type: application/json

{
  "centerPoint": {
    "longitude": -122.4194,
    "latitude": 37.7749
  },
  "radiusKm": 50,
  "infrastructureTypes": ["pipeline", "production_plant"],
  "renewableTypes": ["solar", "wind"],
  "criteria": {
    "economic": 0.3,
    "environmental": 0.25,
    "technical": 0.25,
    "social": 0.2
  }
}
```

#### Demand Forecasting
```http
POST /api/analytics/demand-forecast
Content-Type: application/json

{
  "projectId": "507f1f77bcf86cd799439011",
  "timeHorizon": 12,
  "timeStep": "monthly",
  "factors": {
    "populationGrowth": 0.02,
    "economicGrowth": 0.03,
    "seasonalVariation": 0.1,
    "policyImpact": 0.05
  }
}
```

#### Cost Optimization
```http
POST /api/analytics/cost-optimization
Content-Type: application/json

{
  "projectId": "507f1f77bcf86cd799439011",
  "infrastructureIds": ["507f1f77bcf86cd799439012"],
  "costTypes": ["operational", "capital", "maintenance", "energy"],
  "timeRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-12-31T23:59:59Z"
  }
}
```

#### Network Analysis
```http
POST /api/analytics/network-analysis
Content-Type: application/json

{
  "projectId": "507f1f77bcf86cd799439011",
  "analysisType": "connectivity",
  "depth": 3
}
```

#### Environmental Assessment
```http
POST /api/analytics/environmental-assessment
Content-Type: application/json

{
  "projectId": "507f1f77bcf86cd799439011",
  "geographicBounds": {
    "swLng": -122.5,
    "swLat": 37.7,
    "neLng": -122.3,
    "neLat": 37.9
  },
  "impactTypes": ["carbon", "water", "land", "biodiversity", "air"]
}
```

### Optimization Endpoints

#### Multi-Criteria Decision Analysis
```http
POST /api/analytics/mcda
Content-Type: application/json

{
  "projectId": "507f1f77bcf86cd799439011",
  "alternatives": [
    {
      "id": "alt1",
      "economic": 0.8,
      "environmental": 0.7,
      "technical": 0.9,
      "social": 0.6
    }
  ],
  "criteria": {
    "economic": { "min": 0, "max": 1 },
    "environmental": { "min": 0, "max": 1 },
    "technical": { "min": 0, "max": 1 },
    "social": { "min": 0, "max": 1 }
  },
  "weights": {
    "economic": 0.3,
    "environmental": 0.25,
    "technical": 0.25,
    "social": 0.2
  },
  "method": "weighted_sum"
}
```

#### Genetic Algorithm Optimization
```http
POST /api/analytics/genetic-optimization
Content-Type: application/json

{
  "projectId": "507f1f77bcf86cd799439011",
  "populationSize": 50,
  "generations": 100,
  "mutationRate": 0.1,
  "crossoverRate": 0.8,
  "constraints": {
    "geographicBounds": {
      "swLng": -122.5,
      "swLat": 37.7,
      "neLng": -122.3,
      "neLat": 37.9
    },
    "capacityRange": { "min": 100, "max": 1000 },
    "maxConnections": 5
  },
  "objectives": {
    "economic": { "weight": 0.3 },
    "environmental": { "weight": 0.25 },
    "technical": { "weight": 0.25 },
    "social": { "weight": 0.2 }
  }
}
```

#### Cost Surface Modeling
```http
POST /api/analytics/cost-surface
Content-Type: application/json

{
  "projectId": "507f1f77bcf86cd799439011",
  "geographicBounds": {
    "swLng": -122.5,
    "swLat": 37.7,
    "neLng": -122.3,
    "neLat": 37.9
  },
  "resolution": 1000,
  "costFactors": ["land", "construction", "transportation", "energy"]
}
```

#### Capacity Planning
```http
POST /api/analytics/capacity-planning
Content-Type: application/json

{
  "projectId": "507f1f77bcf86cd799439011",
  "timeHorizon": 24,
  "demandForecast": {
    "baseline": 1000,
    "growthRate": 0.05,
    "seasonality": 0.1
  },
  "capacityConstraints": {
    "minCapacity": 500,
    "maxCapacity": 2000,
    "budget": 1000000
  },
  "optimizationObjectives": {
    "minimizeCost": 0.4,
    "maximizeEfficiency": 0.3,
    "minimizeEnvironmentalImpact": 0.3
  }
}
```

### Scenario Management Endpoints

#### Create Scenario
```http
POST /api/analytics/scenarios
Content-Type: application/json

{
  "name": "Baseline Scenario",
  "description": "Baseline optimization scenario",
  "scenarioType": "site_selection",
  "projectId": "507f1f77bcf86cd799439011",
  "criteria": { /* criteria object */ },
  "constraints": { /* constraints object */ },
  "algorithm": { /* algorithm object */ }
}
```

#### Get Scenarios
```http
GET /api/analytics/scenarios?projectId=507f1f77bcf86cd799439011&scenarioType=site_selection&status=completed&page=1&limit=10
```

#### Get Scenario Details
```http
GET /api/analytics/scenarios/507f1f77bcf86cd799439012
```

#### Update Scenario
```http
PUT /api/analytics/scenarios/507f1f77bcf86cd799439012
Content-Type: application/json

{
  "name": "Updated Scenario Name",
  "description": "Updated description"
}
```

#### Delete Scenario
```http
DELETE /api/analytics/scenarios/507f1f77bcf86cd799439012
```

### Data Management Endpoints

#### Get Analytics Data
```http
GET /api/analytics/data?projectId=507f1f77bcf86cd799439011&dataType=demand_forecast&timeRange[start]=2024-01-01T00:00:00Z&timeRange[end]=2024-12-31T23:59:59Z&page=1&limit=50
```

#### Create Analytics Data
```http
POST /api/analytics/data
Content-Type: application/json

{
  "dataType": "demand_forecast",
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "timePeriod": "monthly",
  "projectId": "507f1f77bcf86cd799439011",
  "demandForecast": {
    "predictedDemand": 1000.5,
    "confidenceInterval": {
      "lower": 950.0,
      "upper": 1050.0
    }
  }
}
```

#### Real-time Metrics
```http
GET /api/analytics/real-time-metrics/507f1f77bcf86cd799439011?timeWindow=1h&metrics=demand,capacity,cost,environmental
```

#### Analytics Summary
```http
GET /api/analytics/summary?projectId=507f1f77bcf86cd799439011
```

## 🔄 Background Job Processing

### Job Types

1. **Analytics Jobs**
   - `geospatial-analysis`
   - `demand-forecasting`
   - `cost-optimization`
   - `network-analysis`
   - `environmental-assessment`

2. **Optimization Jobs**
   - `genetic-optimization`
   - `mcda-analysis`
   - `cost-surface-modeling`
   - `capacity-planning`

3. **Report Jobs**
   - `generate-report`

### Job Management

```javascript
const jobService = require('./services/jobService');

// Add analytics job
const job = await jobService.addAnalyticsJob('geospatial-analysis', {
  centerPoint: { longitude: -122.4194, latitude: 37.7749 },
  radiusKm: 50
}, {
  priority: 'high',
  delay: 0
});

// Get job status
const status = await jobService.getJobStatus('analytics', job.id);

// Get queue statistics
const stats = await jobService.getAllQueueStats();
```

## 📊 MongoDB Aggregation Examples

### Geospatial Analysis Pipeline

```javascript
const pipeline = [
  {
    $geoNear: {
      near: {
        type: 'Point',
        coordinates: [centerPoint.longitude, centerPoint.latitude]
      },
      distanceField: 'distance',
      maxDistance: radiusKm * 1000,
      spherical: true,
      key: 'geometry'
    }
  },
  {
    $lookup: {
      from: 'renewablesources',
      let: { infraLocation: '$geometry' },
      pipeline: [
        {
          $geoNear: {
            near: '$$infraLocation',
            distanceField: 'distanceToInfrastructure',
            maxDistance: 50000,
            spherical: true,
            key: 'location'
          }
        }
      ],
      as: 'nearbyRenewables'
    }
  },
  {
    $addFields: {
      totalRenewableCapacity: { $sum: '$nearbyRenewables.capacityMW' },
      averageRenewableAvailability: { $avg: '$nearbyRenewables.availabilityFactor' },
      compositeScore: {
        $add: [
          { $multiply: ['$capacity.value', 0.3] },
          { $multiply: ['$totalRenewableCapacity', 0.25] },
          { $multiply: ['$averageRenewableAvailability', 0.2] }
        ]
      }
    }
  },
  { $sort: { compositeScore: -1 } }
];
```

### Time-Series Demand Forecasting

```javascript
const pipeline = [
  {
    $match: {
      projectId: projectId,
      dataType: 'demand_forecast',
      timePeriod: timeStep
    }
  },
  {
    $group: {
      _id: {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' }
      },
      avgDemand: { $avg: '$demandForecast.predictedDemand' },
      minDemand: { $min: '$demandForecast.predictedDemand' },
      maxDemand: { $max: '$demandForecast.predictedDemand' },
      demandGrowth: {
        $divide: [
          { $subtract: ['$maxDemand', '$minDemand'] },
          '$avgDemand'
        ]
      }
    }
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } }
];
```

### Network Analysis with Graph Lookup

```javascript
const pipeline = [
  {
    $match: { projectId: projectId }
  },
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
  {
    $addFields: {
      connectionCount: { $size: '$connectedInfrastructure' },
      networkSize: { $size: '$networkConnections' },
      networkDensity: {
        $divide: [
          { $size: '$connectedInfrastructure' },
          { $max: [{ $size: '$networkConnections' }, 1] }
        ]
      }
    }
  }
];
```

## 🚀 Performance Optimization

### Indexing Strategy

```javascript
// Geospatial indexes
analyticsDataSchema.index({ location: '2dsphere' });
optimizationScenarioSchema.index({ geographicScope: '2dsphere' });

// Compound indexes for efficient queries
analyticsDataSchema.index({ dataType: 1, timestamp: -1, location: '2dsphere' });
analyticsDataSchema.index({ projectId: 1, dataType: 1, timestamp: -1 });
optimizationScenarioSchema.index({ projectId: 1, scenarioType: 1, status: 1 });

// Time-series indexes
analyticsDataSchema.index({ timestamp: -1 });
analyticsDataSchema.index({ timePeriod: 1, timestamp: -1 });
```

### Caching Strategy

```javascript
// Redis caching for frequently accessed data
const cacheKey = `analytics:${projectId}:${dataType}:${timeRange}`;
const cachedData = await redisClient.get(cacheKey);

if (!cachedData) {
  const data = await AnalyticsData.aggregate(pipeline);
  await redisClient.set(cacheKey, JSON.stringify(data), 3600); // 1 hour
  return data;
}

return JSON.parse(cachedData);
```

## 🔒 Security Considerations

1. **Authentication & Authorization**
   - All endpoints require valid JWT tokens
   - Role-based access control for different analytics features
   - Project-level data isolation

2. **Data Validation**
   - Input validation for all API parameters
   - Geospatial data validation
   - Time range validation

3. **Rate Limiting**
   - API rate limiting to prevent abuse
   - Job queue rate limiting for resource-intensive operations

## 📈 Monitoring & Logging

### Metrics to Monitor

1. **Performance Metrics**
   - Query execution time
   - Aggregation pipeline performance
   - Memory usage
   - CPU utilization

2. **Business Metrics**
   - Number of analyses performed
   - Optimization success rate
   - Scenario completion rate
   - Data quality scores

3. **System Metrics**
   - Queue lengths
   - Job completion rates
   - Error rates
   - Database connection pool usage

### Logging Strategy

```javascript
// Structured logging for analytics operations
logger.info('Analytics operation completed', {
  operation: 'geospatial-analysis',
  projectId: projectId,
  executionTime: executionTime,
  resultCount: results.length,
  userId: req.user.userId
});

// Error logging with context
logger.error('Analytics operation failed', {
  operation: 'demand-forecasting',
  projectId: projectId,
  error: error.message,
  stack: error.stack,
  userId: req.user.userId
});
```

## 🧪 Testing Strategy

### Unit Tests

```javascript
describe('AnalyticsService', () => {
  describe('performGeospatialAnalysis', () => {
    it('should perform geospatial analysis with valid parameters', async () => {
      const params = {
        centerPoint: { longitude: -122.4194, latitude: 37.7749 },
        radiusKm: 50
      };
      
      const result = await analyticsService.performGeospatialAnalysis(params);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metadata.totalResults).toBeGreaterThan(0);
    });
  });
});
```

### Integration Tests

```javascript
describe('Analytics API', () => {
  it('should perform geospatial analysis via API', async () => {
    const response = await request(app)
      .post('/api/analytics/geospatial')
      .set('Authorization', `Bearer ${token}`)
      .send({
        centerPoint: { longitude: -122.4194, latitude: 37.7749 },
        radiusKm: 50
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## 📚 Dependencies

### Core Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "bull": "^4.12.0",
  "redis": "^4.6.10",
  "winston": "^3.11.0",
  "socket.io": "^4.7.4"
}
```

### Development Dependencies

```json
{
  "jest": "^29.7.0",
  "supertest": "^6.3.3",
  "mongodb-memory-server": "^9.1.1"
}
```

## 🚀 Deployment

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Job Processing
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Performance
NODE_ENV=production
LOG_LEVEL=info
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

## 🔮 Future Enhancements

1. **Machine Learning Integration**
   - TensorFlow.js for client-side ML models
   - Automated feature engineering
   - Predictive analytics models

2. **Advanced Visualization**
   - 3D geospatial visualization
   - Interactive dashboards
   - Real-time data streaming

3. **API Enhancements**
   - GraphQL support
   - WebSocket real-time updates
   - Batch processing endpoints

4. **Performance Improvements**
   - Database sharding
   - Read replicas
   - Advanced caching strategies

## 📞 Support

For questions and support regarding the analytics system, please contact the development team or refer to the project documentation.
