# GreenH2-Nexus: Green Hydrogen Infrastructure Mapping & Optimization Platform

A comprehensive full-stack platform for mapping, analyzing, and optimizing green hydrogen infrastructure using advanced geospatial analytics, machine learning, and real-time monitoring capabilities.

## 🌟 Overview

GreenH2-Nexus is an integrated platform that combines geospatial mapping, predictive analytics, and optimization algorithms to support the planning and deployment of green hydrogen infrastructure. The platform provides tools for site suitability analysis, demand forecasting, cost optimization, and network connectivity analysis.

## 🏗️ Architecture

The platform consists of three main components:

### Frontend (Next.js 15 + TypeScript)

- **Framework**: Next.js 15 with Turbopack
- **UI Components**: Radix UI, Tailwind CSS, Framer Motion
- **Mapping**: Leaflet, Mapbox GL, React Map GL
- **State Management**: Zustand
- **Data Visualization**: Recharts

### Backend (Node.js + Express + MongoDB)

- **Runtime**: Node.js 18+
- **Framework**: Express.js with comprehensive middleware
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis for performance optimization
- **Job Processing**: Bull queues for background tasks
- **Real-time**: Socket.IO for live updates

### ML/AI Service (Python + FastAPI)

- **Framework**: FastAPI with Pydantic validation
- **ML Libraries**: scikit-learn, XGBoost, pandas, numpy
- **Models**: Efficiency prediction and cost optimization
- **Deployment**: Uvicorn ASGI server

## 🚀 Key Features

### 🗺️ Interactive Mapping

- Real-time geospatial visualization of hydrogen infrastructure
- Multi-layer mapping with renewable energy sources
- Interactive site selection and analysis tools
- Cluster-based infrastructure grouping

### 📊 Advanced Analytics

- **Geospatial Analysis**: MongoDB-powered spatial queries and aggregations
- **Demand Forecasting**: Time-series analysis with confidence intervals
- **Cost Optimization**: Multi-criteria decision analysis (MCDA)
- **Network Analysis**: Graph-based connectivity analysis
- **Environmental Impact Assessment**: Carbon footprint and sustainability metrics

### 🤖 Machine Learning

- **Efficiency Prediction**: XGBoost-based efficiency scoring (0-1 scale)
- **Cost Modeling**: Gradient boosting for cost estimation ($/kg)
- **Zone Classification**: Automated green/yellow/red zone categorization
- **Batch Processing**: Support for large-scale predictions

### ⚡ Optimization Algorithms

- **Genetic Algorithm Optimization**: Multi-objective infrastructure placement
- **Site Suitability Analysis**: Comprehensive location scoring
- **Route Optimization**: Network path optimization
- **Capacity Planning**: Demand-driven capacity allocation

### 📈 Real-time Monitoring

- Live infrastructure performance metrics
- Real-time job processing status
- WebSocket-based updates
- Comprehensive logging and error tracking

## 🛠️ Technology Stack

### Frontend Dependencies

```json
{
  "next": "15.5.2",
  "react": "19.1.0",
  "typescript": "^5",
  "tailwindcss": "^4",
  "@radix-ui/react-select": "^2.2.6",
  "leaflet": "^1.9.4",
  "mapbox-gl": "^3.14.0",
  "recharts": "^3.1.2",
  "zustand": "^5.0.8",
  "framer-motion": "^12.23.12"
}
```

### Backend Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "bull": "^4.12.0",
  "redis": "^4.6.10",
  "socket.io": "^4.7.4",
  "winston": "^3.11.0",
  "jsonwebtoken": "^9.0.2",
  "helmet": "^7.1.0"
}
```

### ML Service Dependencies

```python
fastapi==0.104.1
uvicorn==0.24.0
scikit-learn==1.3.2
xgboost==2.0.2
pandas==2.1.3
numpy==1.26.2
```

## 📋 Prerequisites

- **Node.js**: 18.0.0 or higher
- **Python**: 3.8 or higher
- **MongoDB**: 6.0 or higher
- **Redis**: 6.0 or higher
- **Git**: Latest version

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/greenh2-nexus.git
cd greenh2-nexus
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### 4. ML Service Setup

```bash
cd project
python -m venv myvenv
source myvenv/bin/activate  # On Windows: myvenv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## ⚙️ Configuration

### Backend Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/greenh2-nexus
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# ML Service
ML_API_BASE_URL=http://localhost:8000

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Map Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token-here

# Environment
NODE_ENV=development
```

## 📊 Database Schema

### Infrastructure Model

```javascript
{
  infrastructureType: 'pipeline' | 'storage_facility' | 'production_plant' | 'distribution_hub',
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon',
    coordinates: [Number]
  },
  capacity: {
    value: Number,
    unit: String
  },
  operationalStatus: 'operational' | 'under_construction' | 'planned' | 'decommissioned',
  projectId: ObjectId,
  connectedInfrastructure: [{ infrastructureId: ObjectId, connectionType: String }]
}
```

### Analytics Data Model

```javascript
{
  dataType: 'demand_forecast' | 'capacity_utilization' | 'cost_analysis' | 'environmental_impact',
  location: { type: 'Point', coordinates: [Number] },
  timestamp: Date,
  timePeriod: 'hourly' | 'daily' | 'weekly' | 'monthly',
  demandForecast: {
    predictedDemand: Decimal128,
    confidenceInterval: { lower: Decimal128, upper: Decimal128 }
  },
  costAnalysis: {
    operationalCosts: Decimal128,
    capitalCosts: Decimal128,
    levelizedCost: Decimal128
  }
}
```

## 🔌 API Endpoints

### Infrastructure Management

```http
GET    /api/infrastructure              # List infrastructure with filters
POST   /api/infrastructure              # Create new infrastructure
GET    /api/infrastructure/:id          # Get infrastructure by ID
PUT    /api/infrastructure/:id          # Update infrastructure
DELETE /api/infrastructure/:id          # Delete infrastructure
```

### Analytics & Optimization

```http
POST   /api/analytics/geospatial        # Geospatial analysis
POST   /api/analytics/demand-forecast   # Demand forecasting
POST   /api/analytics/cost-optimization # Cost optimization
POST   /api/analytics/mcda              # Multi-criteria decision analysis
POST   /api/analytics/genetic-optimization # Genetic algorithm optimization
```

### ML Predictions

```http
GET    /predict-zones?lat=...&lng=...   # Single location prediction
POST   /predict-zones/batch             # Batch predictions
GET    /health                          # Health check
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Integration Tests

```bash
cd backend
npm run test:integration   # Run integration tests
```

### ML Model Testing

```bash
cd project
python -m pytest tests/   # Run ML tests (if test files exist)
```

## 📦 Deployment

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Production Environment

```bash
# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
REDIS_URL=redis://production-redis:6379

# Frontend
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

## 🔒 Security Features

- **Authentication**: JWT-based authentication system
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware
- **Data Sanitization**: Input sanitization and validation

## 📈 Performance Optimization

### Database Optimization

- **Indexing**: Geospatial and compound indexes
- **Aggregation**: MongoDB aggregation pipelines
- **Caching**: Redis caching for frequent queries
- **Connection Pooling**: Optimized database connections

### Frontend Optimization

- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js image optimization
- **Caching**: Browser and CDN caching strategies
- **Bundle Analysis**: Webpack bundle analyzer

## 🔧 Development Tools

### Code Quality

```bash
# Linting
npm run lint              # ESLint
npm run lint:fix          # Auto-fix issues

# Formatting
npx prettier --write .    # Format code
```

### Monitoring

- **Logging**: Winston-based structured logging
- **Error Tracking**: Comprehensive error handling
- **Performance Monitoring**: Request timing and metrics
- **Health Checks**: Service health monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript/JavaScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow the existing code style and conventions

## 📚 Documentation

- **API Documentation**: Available at `/api/docs` when running the backend
- **Component Documentation**: Storybook documentation (if configured)
- **Database Schema**: Detailed in `/backend/ANALYTICS_README.md`
- **Deployment Guide**: Production deployment instructions

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**

   ```bash
   # Check MongoDB status
   mongosh --eval "db.adminCommand('ismaster')"
   ```

2. **Redis Connection Issues**

   ```bash
   # Test Redis connection
   redis-cli ping
   ```

3. **ML Model Loading Issues**
   ```bash
   # Retrain models if needed
   cd project
   python train_models.py
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **GreenH2-Nexus Team** - Initial development and maintenance
- **Contributors** - See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the list of contributors

## 🙏 Acknowledgments

- MongoDB for geospatial database capabilities
- Mapbox and Leaflet for mapping solutions
- scikit-learn and XGBoost for machine learning capabilities
- Next.js and React ecosystem for frontend development

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation and troubleshooting guide

---

**Built with ❤️ for sustainable hydrogen infrastructure development**
