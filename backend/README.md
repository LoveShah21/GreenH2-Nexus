# Advanced Geospatial Analytics and Optimization Engine

A sophisticated MongoDB-based analytics system for hydrogen infrastructure optimization, featuring advanced geospatial analysis, multi-criteria decision analysis, cost optimization, demand forecasting, and machine learning integration.

## 🚀 Features

### Core Analytics Capabilities
- **Advanced Geospatial Analysis**: Site selection, spatial joins, cost surface modeling
- **Multi-Criteria Decision Analysis (MCDA)**: Weighted Sum, TOPSIS, AHP methods
- **Demand Forecasting**: Time-series analysis with trend prediction
- **Cost Optimization**: Linear programming and genetic algorithms
- **Network Analysis**: Graph-based connectivity and performance analysis
- **Environmental Impact Assessment**: Carbon emissions, water usage, biodiversity impact
- **Capacity Planning**: Resource allocation and utilization optimization
- **Real-time Monitoring**: Time-windowed queries and live metrics

### Technical Features
- **MongoDB Aggregation Framework**: Complex geospatial and analytical queries
- **Background Job Processing**: Bull queues for long-running tasks
- **WebSocket Integration**: Real-time updates and notifications
- **RESTful API**: Comprehensive endpoints with GeoJSON support
- **Microservices Architecture**: Scalable and maintainable design
- **Advanced Indexing**: Optimized for geospatial and time-series queries

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- Redis (v6.0 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GreenH2-Nexus/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/hydrogen_analytics
   MONGODB_USER=your_username
   MONGODB_PASSWORD=your_password
   
   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # Logging
   LOG_LEVEL=info
   ```

4. **Start the application**
   ```bash
   npm start
   ```

## 🏗️ Architecture

### Project Structure
```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── index.js         # Application entry point
├── tests/               # Test files
├── package.json
└── README.md
```

### Database Schema

#### AnalyticsData Model
Stores various types of analytics data with geospatial and time-series capabilities:
- **Demand Forecasting**: Predicted demand with confidence intervals
- **Capacity Utilization**: Current, peak, and average utilization metrics
- **Cost Analysis**: Operational, capital, maintenance, and energy costs
- **Environmental Impact**: Carbon emissions, water usage, land use
- **Network Performance**: Efficiency, reliability, connectivity metrics
- **Renewable Integration**: Renewable percentage, grid stability

#### OptimizationScenario Model
Manages optimization scenarios with versioning and lifecycle management:
- **Multi-Criteria Decision Analysis**: Economic, environmental, technical, social criteria
- **Algorithm Parameters**: Genetic algorithms, particle swarm, simulated annealing
- **Results Storage**: Optimal solutions, alternatives, sensitivity analysis
- **Performance Metrics**: Execution time, iterations, convergence rates

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | User logout |

### Advanced Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analytics/geospatial` | Geospatial analysis |
| POST | `/api/analytics/demand-forecast` | Demand forecasting |
| POST | `/api/analytics/cost-optimization` | Cost optimization analysis |
| POST | `/api/analytics/network-analysis` | Network analysis |
| POST | `/api/analytics/environmental-assessment` | Environmental impact assessment |
| GET | `/api/analytics/real-time-metrics/:projectId` | Real-time metrics |

### Optimization Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analytics/mcda` | Multi-criteria decision analysis |
| POST | `/api/analytics/genetic-optimization` | Genetic algorithm optimization |
| POST | `/api/analytics/cost-surface` | Cost surface modeling |
| POST | `/api/analytics/capacity-planning` | Capacity planning |

### Data Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/data` | Get analytics data |
| POST | `/api/analytics/data` | Create analytics data |
| GET | `/api/analytics/scenarios` | Get optimization scenarios |
| POST | `/api/analytics/scenarios` | Create optimization scenario |
| GET | `/api/analytics/scenarios/:id` | Get scenario by ID |
| PUT | `/api/analytics/scenarios/:id` | Update scenario |
| DELETE | `/api/analytics/scenarios/:id` | Delete scenario |
| GET | `/api/analytics/summary` | Analytics summary |

## 🔧 Usage Examples

### Geospatial Analysis
```javascript
const response = await fetch('/api/analytics/geospatial', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    centerPoint: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    radiusKm: 50,
    infrastructureTypes: ['electrolyzer', 'storage_facility'],
    renewableTypes: ['solar', 'wind'],
    criteria: {
      economic: { weight: 0.4 },
      environmental: { weight: 0.3 },
      technical: { weight: 0.3 }
    }
  })
});
```

### Multi-Criteria Decision Analysis
```javascript
const response = await fetch('/api/analytics/mcda', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    projectId: '507f1f77bcf86cd799439011',
    alternatives: [
      {
        id: 'site_1',
        name: 'Site A',
        economic: 0.8,
        environmental: 0.6,
        technical: 0.9,
        social: 0.7
      }
    ],
    criteria: ['economic', 'environmental', 'technical', 'social'],
    weights: {
      economic: 0.4,
      environmental: 0.3,
      technical: 0.2,
      social: 0.1
    },
    method: 'weighted_sum'
  })
});
```

### Genetic Algorithm Optimization
```javascript
const response = await fetch('/api/analytics/genetic-optimization', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    projectId: '507f1f77bcf86cd799439011',
    populationSize: 100,
    generations: 50,
    mutationRate: 0.1,
    crossoverRate: 0.8,
    constraints: {
      budget: 10000000,
      timeline: 24,
      capacity: { min: 100, max: 1000 }
    },
    objectives: {
      minimize: ['cost', 'emissions'],
      maximize: ['efficiency', 'reliability']
    }
  })
});
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=analytics.test.js
```

### API Testing with Postman
1. Import the provided Postman collection
2. Set up environment variables:
   - `base_url`: `http://localhost:3000`
   - `jwt_token`: (will be set after login)
3. Start with authentication endpoints
4. Test analytics and optimization endpoints

## 📊 Performance Optimization

### Database Indexing
- **Geospatial Indexes**: 2dsphere indexes on location fields
- **Compound Indexes**: Multi-field indexes for efficient queries
- **TTL Indexes**: Automatic cleanup of old data
- **Text Indexes**: Full-text search capabilities

### Caching Strategy
- **Redis Caching**: Frequently accessed data
- **Query Result Caching**: Aggregation pipeline results
- **Session Management**: User sessions and tokens

### Background Processing
- **Bull Queues**: Long-running analytics tasks
- **Job Prioritization**: Critical vs. non-critical tasks
- **Retry Mechanisms**: Failed job handling
- **Progress Tracking**: Real-time job status updates

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Analyst, Manager, Admin roles
- **Project-level Permissions**: User access to specific projects
- **API Rate Limiting**: Protection against abuse

### Data Protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Protection**: Helmet.js security headers
- **CORS Configuration**: Cross-origin request handling

## 📈 Monitoring & Logging

### Logging Levels
- **Error**: Application errors and exceptions
- **Warn**: Warning conditions
- **Info**: General information
- **Debug**: Detailed debugging information

### Metrics Collection
- **Request/Response Times**: Performance monitoring
- **Database Query Performance**: MongoDB query analysis
- **Memory Usage**: Application resource monitoring
- **Error Rates**: Application health tracking

## 🚀 Deployment

### Production Setup
1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   MONGODB_URI=mongodb://production-db:27017/hydrogen_analytics
   REDIS_HOST=production-redis
   ```

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

3. **Load Balancing**
   ```bash
   # Using Nginx
   upstream api_servers {
       server localhost:3000;
       server localhost:3001;
   }
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**MongoDB Connection Error**
```bash
# Check MongoDB service
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

**Redis Connection Error**
```bash
# Check Redis service
sudo systemctl status redis

# Restart Redis
sudo systemctl restart redis
```

**Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🔮 Future Enhancements

### Planned Features
- **Machine Learning Integration**: Advanced ML models for prediction
- **Real-time Streaming**: Apache Kafka integration
- **Advanced Visualization**: Interactive charts and maps
- **Mobile API**: Optimized endpoints for mobile applications
- **Multi-tenant Support**: Organization-level data isolation
- **Advanced Reporting**: Automated report generation
- **Integration APIs**: Third-party system integrations

### Performance Improvements
- **Database Sharding**: Horizontal scaling for large datasets
- **Microservices Split**: Service decomposition for scalability
- **CDN Integration**: Static asset optimization
- **GraphQL API**: Flexible query interface

---

**Built with ❤️ for the Hydrogen Economy**
