# Complete Hydrogen Infrastructure Integration System

A fully integrated full-stack system combining backend APIs, frontend mapping interface, and ML-powered zone prediction for hydrogen infrastructure planning and optimization.

## 🎯 System Overview

This integrated system provides:

- **Interactive Map Interface** with real-time zone predictions
- **ML-Powered Analysis** for site suitability and cost optimization
- **Complete API Integration** connecting frontend, backend, and ML services
- **Real-time Data Visualization** with infrastructure and project layers
- **Area Analysis Tools** for bulk zone assessment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   ML Service    │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (FastAPI)     │
│   Port: 3001    │    │   Port: 3000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Interactive    │    │   MongoDB       │    │  ML Models      │
│  Map UI         │    │   Redis Cache   │    │  (Scikit-learn) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

**Windows:**

```bash
# Run the automated setup script
start-system.bat
```

**Linux/Mac:**

```bash
# Make script executable and run
chmod +x start-system.sh
./start-system.sh
```

### Option 2: Manual Setup

1. **Start ML Service**

   ```bash
   cd project
   python -m venv myvenv
   source myvenv/bin/activate  # On Windows: myvenv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```

2. **Start Backend**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the System**
   - Frontend: http://localhost:3001
   - Interactive Map: http://localhost:3001/mapping/interactive
   - Backend API: http://localhost:3000
   - ML Service: http://localhost:8000

## 🗺️ Interactive Map Features

### Core Functionality

- **Click Prediction**: Click anywhere on the map to get instant zone predictions
- **Area Analysis**: Select rectangular areas for bulk zone analysis
- **Layer Management**: Toggle infrastructure, projects, and prediction layers
- **Real-time Updates**: Live data from backend APIs

### Zone Classification

- 🟢 **Green Zone**: High efficiency (>80%) + Low cost (<$2.5/kg)
- 🟡 **Yellow Zone**: Medium efficiency (60-80%)
- 🔴 **Red Zone**: Low efficiency (<60%) or High cost (>$2.5/kg)

### Map Controls

- **Search**: Find locations by name
- **Locate**: Get current GPS position
- **Satellite View**: Toggle satellite imagery
- **Layer Controls**: Show/hide different data layers

## 📡 API Integration

### Backend Endpoints

#### ML Predictions

```javascript
// Single prediction
GET /api/ml-predictions/predict-zone?lat=51.505&lng=-0.09

// Batch predictions
POST /api/ml-predictions/predict-zones/batch
{
  "locations": [
    {"lat": 51.505, "lng": -0.09},
    {"lat": 51.515, "lng": -0.1}
  ]
}

// Area analysis
POST /api/ml-predictions/analyze-area
{
  "bounds": {
    "north": 51.52,
    "south": 51.48,
    "east": -0.05,
    "west": -0.15
  },
  "gridSize": 10
}
```

#### Projects & Infrastructure

```javascript
// Get projects
GET /api/projects?limit=100&status=operational

// Get infrastructure
GET /api/infrastructure?infrastructureType=pipeline

// Get projects in map bounds
GET /api/projects/within-bounds?neLat=51.52&neLng=-0.05&swLat=51.48&swLng=-0.15
```

### Frontend API Usage

```typescript
import { mlPredictionsApi } from "@/lib/api/ml-predictions";
import { projectsApi } from "@/lib/api/projects";

// Get zone prediction
const prediction = await mlPredictionsApi.predictZone(51.505, -0.09);
console.log(prediction.zone); // "green", "yellow", or "red"

// Analyze area
const analysis = await mlPredictionsApi.analyzeArea({
  bounds: { north: 51.52, south: 51.48, east: -0.05, west: -0.15 },
  gridSize: 15,
});
console.log(analysis.zoneDistribution); // { green: 45, yellow: 30, red: 25 }

// Load projects
const projects = await projectsApi.getProjects({ limit: 100 });
```

## 🧪 Testing

### Run Integration Tests

```bash
# Test all endpoints and ML integration
node test-integration.js

# Performance testing
node test-integration.js --performance

# Check service status
./start-system.sh status  # Linux/Mac
# Or manually check:
# curl http://localhost:3000/health
# curl http://localhost:8000/health
```

### Expected Test Results

- ✅ Backend Health Check
- ✅ ML Service Health
- ✅ Authentication
- ✅ ML Zone Prediction
- ✅ ML Batch Prediction
- ✅ Area Analysis
- ✅ Projects API
- ✅ Infrastructure API
- ✅ Analytics API

## 🎮 User Workflow Examples

### 1. Site Selection Workflow

1. Open interactive map at http://localhost:3001/mapping/interactive
2. Navigate to area of interest using search or map controls
3. Click on potential site locations
4. View instant zone predictions with efficiency and cost data
5. Compare multiple locations using the prediction markers

### 2. Area Analysis Workflow

1. Click "Area Analysis Mode" button
2. Click two points on map to define analysis area
3. System automatically analyzes grid points within the area
4. View zone distribution and average metrics in results panel
5. Use results to identify optimal development zones

### 3. Infrastructure Planning Workflow

1. Enable infrastructure layer to see existing facilities
2. Enable projects layer to see planned developments
3. Use zone predictions to identify gaps in coverage
4. Analyze areas with high green zone concentration
5. Plan new infrastructure in optimal locations

## 🔧 Configuration

### Environment Variables

**Backend (.env)**

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hydrogen_analytics
REDIS_HOST=localhost
REDIS_PORT=6379
ML_API_BASE_URL=http://localhost:8000
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3001
```

**Frontend (.env.local)**

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### ML Model Configuration

The ML service uses trained models for:

- **Efficiency Prediction**: Based on renewable proximity, demand proximity, transport score
- **Cost Prediction**: Based on land cost, energy cost, demand proximity, subsidies
- **Zone Classification**: Combines efficiency and cost into green/yellow/red zones

## 📊 Performance Optimizations

### Backend Optimizations

- **Prediction Caching**: 5-minute cache for ML predictions
- **Database Indexing**: Geospatial indexes for location queries
- **Connection Pooling**: MongoDB and Redis connection optimization
- **Rate Limiting**: 100 requests per 15 minutes per IP

### Frontend Optimizations

- **Marker Clustering**: Groups nearby markers for better performance
- **Lazy Loading**: Infrastructure data loaded on demand
- **Debounced Search**: Reduces API calls during typing
- **State Management**: Efficient React state updates

### ML Service Optimizations

- **Model Caching**: Pre-loaded models in memory
- **Batch Processing**: Efficient handling of multiple predictions
- **Feature Engineering**: Optimized input preprocessing

## 🔒 Security Features

### Authentication & Authorization

- JWT token-based authentication
- Role-based access control (admin, analyst, user)
- Secure token refresh mechanism
- Session management

### API Security

- Input validation and sanitization
- Rate limiting protection
- CORS configuration
- Helmet.js security headers
- SQL injection prevention

## 🐛 Troubleshooting

### Common Issues

**ML Service Not Starting**

```bash
# Check Python environment
cd project
source myvenv/bin/activate
python --version
pip list

# Check model files
ls models/
# Should contain: eff_model.pkl, cost_model.pkl, scalers.pkl
```

**Backend Connection Errors**

```bash
# Check MongoDB
mongosh --eval "db.adminCommand('ismaster')"

# Check Redis
redis-cli ping

# Check environment variables
cat backend/.env
```

**Frontend Build Errors**

```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Map Not Loading**

- Check browser console for JavaScript errors
- Verify API endpoints are accessible
- Check CORS configuration
- Ensure all services are running

### Debug Mode

Enable detailed logging:

```bash
# Backend
export LOG_LEVEL=debug

# Frontend
export NEXT_PUBLIC_DEBUG=true
```

## 📈 Monitoring & Analytics

### Health Checks

- Backend: http://localhost:3000/health
- ML Service: http://localhost:8000/health
- Combined: http://localhost:3000/api/ml-predictions/health

### Performance Metrics

- Prediction response times
- Cache hit rates
- API request volumes
- Error rates and types

### Logging

- Request/response logging
- ML prediction accuracy tracking
- User interaction analytics
- System performance monitoring

## 🚀 Deployment

### Production Deployment

**Docker Compose**

```yaml
version: "3.8"
services:
  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://backend:3000/api

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/hydrogen_analytics
      - REDIS_HOST=redis
      - ML_API_BASE_URL=http://ml-service:8000

  ml-service:
    build: ./project
    ports:
      - "8000:8000"

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"

  redis:
    image: redis:6
    ports:
      - "6379:6379"
```

### Cloud Deployment

- **AWS**: ECS/EKS with RDS and ElastiCache
- **Azure**: Container Instances with CosmosDB
- **GCP**: Cloud Run with Cloud SQL and Memorystore

## 🔮 Future Enhancements

### Planned Features

1. **Real-time Collaboration**: Multi-user map editing
2. **Advanced Analytics**: Time-series forecasting
3. **Mobile App**: React Native mobile interface
4. **3D Visualization**: Three.js integration
5. **Export Tools**: PDF reports and data export
6. **Offline Mode**: Progressive Web App capabilities

### Performance Improvements

1. **GraphQL API**: Flexible query interface
2. **Microservices**: Service decomposition
3. **CDN Integration**: Global content delivery
4. **Database Sharding**: Horizontal scaling

## 📞 Support

### Getting Help

1. Check this documentation
2. Review the API Integration Guide
3. Run integration tests for diagnostics
4. Check service logs for errors
5. Create an issue in the repository

### Development Team

- **Backend**: Node.js/Express with MongoDB
- **Frontend**: Next.js/React with TypeScript
- **ML Service**: FastAPI with Scikit-learn
- **Integration**: Full-stack API integration

---

**Built with ❤️ for the Hydrogen Economy**

🌱 Enabling sustainable hydrogen infrastructure through intelligent mapping and prediction.
