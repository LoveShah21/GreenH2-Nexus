# Complete API Integration Guide

## Overview

This document provides a comprehensive guide to the integrated full-stack system with backend APIs, frontend components, and ML model integration for hydrogen infrastructure mapping and zone prediction.

## Backend API Endpoints

### 1. Authentication APIs (`/api/auth`)

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `DELETE /api/auth/logout` - User logout

### 2. Project Management APIs (`/api/projects`)

- `GET /api/projects` - Get projects with filters
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/nearby` - Get nearby projects
- `GET /api/projects/within-bounds` - Get projects within map bounds

### 3. Infrastructure APIs (`/api/infrastructure`)

- `GET /api/infrastructure` - Get infrastructure with filters
- `POST /api/infrastructure` - Create new infrastructure
- `GET /api/infrastructure/route-optimization` - Route optimization analysis
- `POST /api/infrastructure/site-suitability` - Site suitability analysis
- `GET /api/infrastructure/connectivity-analysis` - Network connectivity analysis

### 4. Analytics APIs (`/api/analytics`)

- `GET /api/analytics/data` - Get analytics data
- `POST /api/analytics/data` - Create analytics data
- `POST /api/analytics/geospatial` - Geospatial analysis
- `POST /api/analytics/demand-forecast` - Demand forecasting
- `POST /api/analytics/cost-optimization` - Cost optimization
- `POST /api/analytics/network-analysis` - Network analysis
- `POST /api/analytics/environmental-assessment` - Environmental impact assessment
- `GET /api/analytics/real-time-metrics/:projectId` - Real-time metrics
- `POST /api/analytics/mcda` - Multi-criteria decision analysis
- `POST /api/analytics/genetic-optimization` - Genetic algorithm optimization
- `GET /api/analytics/summary` - Analytics summary

### 5. ML Prediction APIs (`/api/ml-predictions`)

- `GET /api/ml-predictions/predict-zone` - Single location zone prediction
- `POST /api/ml-predictions/predict-zones/batch` - Batch zone predictions
- `POST /api/ml-predictions/analyze-area` - Area analysis with grid sampling
- `GET /api/ml-predictions/health` - ML service health check

## ML Model Integration

### Input Format

```json
{
  "lat": 51.505,
  "lng": -0.09
}
```

### Output Format

```json
{
  "lat": 51.505,
  "lng": -0.09,
  "efficiency": 0.85,
  "cost": 2.3,
  "zone": "green",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Zone Classification

- **Green Zone**: High efficiency (>0.8) + Low cost (<2.5)
- **Yellow Zone**: Medium efficiency (>0.6)
- **Red Zone**: Low efficiency (≤0.6) or High cost (≥2.5)

## Frontend Integration

### Map Components

#### 1. IntegratedMap Component

```tsx
<IntegratedMap
  center={[51.505, -0.09]}
  zoom={11}
  enableAreaAnalysis={true}
  enableInfrastructureLayer={true}
  enableAnalyticsLayer={true}
  onZonePrediction={(prediction) => console.log(prediction)}
  onAreaAnalysis={(analysis) => console.log(analysis)}
/>
```

#### 2. Features

- **Click Prediction**: Click anywhere to get zone prediction
- **Area Analysis**: Select area to analyze multiple points
- **Infrastructure Layer**: Display pipelines, storage, production plants
- **Project Layer**: Display existing hydrogen projects
- **Real-time Updates**: Live data from backend APIs

### API Client Usage

#### Zone Prediction

```typescript
import { mlPredictionsApi } from "@/lib/api/ml-predictions";

const prediction = await mlPredictionsApi.predictZone(51.505, -0.09);
console.log(prediction.zone); // "green", "yellow", or "red"
```

#### Area Analysis

```typescript
const analysis = await mlPredictionsApi.analyzeArea({
  bounds: {
    north: 51.52,
    south: 51.48,
    east: -0.05,
    west: -0.15,
  },
  gridSize: 10,
});
console.log(analysis.zoneDistribution); // { green: 45, yellow: 30, red: 25 }
```

#### Project Management

```typescript
import { projectsApi } from "@/lib/api/projects";

const projects = await projectsApi.getProjects({
  status: "operational",
  type: "production",
});
```

#### Infrastructure Management

```typescript
import { infrastructureApi } from "@/lib/api/infrastructure";

const infrastructure = await infrastructureApi.getInfrastructure({
  infrastructureType: "pipeline",
  operationalStatus: "operational",
});
```

## Complete Workflow Examples

### 1. User Clicks on Map

1. Frontend captures click coordinates
2. Calls `mlPredictionsApi.predictZone(lat, lng)`
3. Backend forwards request to ML service
4. ML model returns prediction
5. Backend caches result and returns to frontend
6. Frontend displays zone marker and prediction details

### 2. Area Analysis Workflow

1. User selects "Area Analysis Mode"
2. User clicks two points to define area
3. Frontend calls `mlPredictionsApi.analyzeArea(bounds)`
4. Backend generates grid points within bounds
5. Backend calls ML service for batch predictions
6. Backend analyzes results and returns summary
7. Frontend displays analysis results and zone distribution

### 3. Infrastructure Integration

1. Frontend loads infrastructure data on map initialization
2. Calls `infrastructureApi.getInfrastructure()`
3. Backend returns infrastructure with geospatial data
4. Frontend converts to map markers and polygons
5. Displays different infrastructure types with color coding

## Performance Optimizations

### Backend Caching

- ML predictions cached for 5 minutes
- Reduces redundant ML API calls
- Improves response times

### Frontend Optimizations

- Marker clustering for large datasets
- Lazy loading of infrastructure data
- Debounced search and filtering

### Database Indexing

- Geospatial indexes for location queries
- Compound indexes for filtered queries
- TTL indexes for temporary data

## Error Handling

### Backend Error Responses

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "lat",
      "message": "Latitude must be between -90 and 90"
    }
  ]
}
```

### Frontend Error Handling

```typescript
try {
  const prediction = await mlPredictionsApi.predictZone(lat, lng);
  // Handle success
} catch (error) {
  console.error("Prediction failed:", error);
  // Show user-friendly error message
}
```

## Security Considerations

### Authentication

- JWT token-based authentication
- Role-based access control (admin, analyst, user)
- Token refresh mechanism

### API Security

- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

### Data Protection

- Sensitive data encryption
- SQL injection prevention
- XSS protection

## Testing

### API Testing

```bash
# Test ML prediction endpoint
curl -X GET "http://localhost:3000/api/ml-predictions/predict-zone?lat=51.505&lng=-0.09" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test area analysis
curl -X POST "http://localhost:3000/api/ml-predictions/analyze-area" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bounds": {
      "north": 51.52,
      "south": 51.48,
      "east": -0.05,
      "west": -0.15
    },
    "gridSize": 10
  }'
```

### Frontend Testing

```typescript
// Test zone prediction callback
const handleZonePrediction = (prediction: ZonePrediction) => {
  expect(prediction.zone).toBeOneOf(["green", "yellow", "red"]);
  expect(prediction.efficiency).toBeGreaterThanOrEqual(0);
  expect(prediction.cost).toBeGreaterThan(0);
};
```

## Deployment

### Environment Variables

```env
# Backend
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hydrogen_analytics
REDIS_HOST=localhost
REDIS_PORT=6379
ML_API_BASE_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### Docker Deployment

```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring and Logging

### Health Checks

- `/health` - Backend service health
- `/api/ml-predictions/health` - ML service health
- Cache size and performance metrics

### Logging

- Request/response logging
- Error tracking
- Performance monitoring
- ML prediction accuracy tracking

## Future Enhancements

### Planned Features

1. **Real-time Streaming**: WebSocket integration for live updates
2. **Advanced Analytics**: Time-series analysis and forecasting
3. **Mobile Optimization**: Responsive design and mobile APIs
4. **Batch Processing**: Background job processing for large analyses
5. **Data Export**: CSV/JSON export functionality
6. **Advanced Visualization**: Heat maps and 3D visualizations

### Performance Improvements

1. **Database Sharding**: Horizontal scaling for large datasets
2. **CDN Integration**: Static asset optimization
3. **GraphQL API**: Flexible query interface
4. **Microservices**: Service decomposition for scalability

## Support and Troubleshooting

### Common Issues

1. **ML Service Unavailable**: Check ML service health endpoint
2. **Authentication Errors**: Verify JWT token validity
3. **Slow Map Loading**: Check network and enable clustering
4. **Prediction Errors**: Validate coordinate ranges

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in environment variables.

### Contact

For technical support or questions about the integration, please refer to the project documentation or create an issue in the repository.
