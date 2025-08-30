# GreenH2-Nexus Integration Guide

## System Architecture

The system consists of three main components:

1. **Backend** (Node.js/Express) - API endpoints and business logic
2. **Frontend** (Next.js/React) - User interface with interactive map
3. **ML Model** (Python/FastAPI) - Zone prediction service

## API Endpoints

### Backend Endpoints (Port 3000)

#### Projects API
- `GET /api/projects` - Get all projects with pagination
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/nearby` - Find projects within radius
- `GET /api/projects/within-bounds` - Find projects within bounds

#### ML Predictions API
- `GET /api/ml-predictions/predict-zone?lat=X&lng=Y` - Single location prediction
- `POST /api/ml-predictions/predict-zones/batch` - Batch predictions
- `GET /api/ml-predictions/health` - Check ML service health

#### Analytics API
- `GET /api/analytics/data` - Get analytics data
- `POST /api/analytics/geospatial` - Geospatial analysis
- `POST /api/analytics/demand-forecast` - Demand forecasting
- `GET /api/analytics/real-time-metrics/:projectId` - Real-time metrics

#### Infrastructure API
- `GET /api/infrastructure` - Get infrastructure data
- `POST /api/infrastructure` - Create infrastructure
- `GET /api/infrastructure/route-optimization` - Route optimization
- `POST /api/infrastructure/site-suitability` - Site suitability analysis

### ML Model Endpoints (Port 8000)

- `GET /predict-zones?lat=X&lng=Y` - Single prediction
- `POST /predict-zones/batch` - Batch predictions
- `GET /health` - Health check

## Frontend Integration

### Map Component Features

1. **Interactive Map** - Click anywhere to get zone predictions
2. **Project Visualization** - Display existing projects as markers
3. **Zone Classification** - Color-coded markers (green/yellow/red)
4. **Real-time Updates** - Dynamic marker updates based on API responses

### State Management

The enhanced map component manages:
- Project data from backend API
- ML predictions from coordinate clicks
- Marker visualization and clustering
- Loading states and error handling

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### 2. ML Model Setup
```bash
cd project
pip install -r requirements.txt
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run dev
```

## Data Flow

1. **User clicks map** → Frontend captures coordinates
2. **Frontend → Backend** → `/api/ml-predictions/predict-zone`
3. **Backend → ML Service** → `/predict-zones`
4. **ML Service** → Returns zone prediction (green/yellow/red)
5. **Backend** → Forwards prediction to frontend
6. **Frontend** → Updates map with colored marker

## Zone Classification

- **Green Zone**: High efficiency (>80%), Low cost (<$2.5/kg)
- **Yellow Zone**: Medium efficiency (>60%)
- **Red Zone**: Low efficiency, High cost

## API Response Format

### Zone Prediction Response
```json
{
  "success": true,
  "data": {
    "lat": 51.505,
    "lng": -0.09,
    "efficiency": 0.85,
    "cost": 2.1,
    "zone": "green",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### Project Response
```json
{
  "success": true,
  "data": [
    {
      "id": "project-id",
      "name": "Project Name",
      "projectType": "production",
      "status": "operational",
      "location": {
        "type": "Point",
        "coordinates": [-0.09, 51.505]
      },
      "capacityTPA": 100
    }
  ]
}
```

## Error Handling

All APIs return consistent error format:
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Validation errors if applicable
}
```

## Development Notes

- Backend runs on port 3000
- ML service runs on port 8000
- Frontend runs on port 3000 (Next.js dev server)
- All coordinates use [longitude, latitude] format in GeoJSON
- Map displays use [latitude, longitude] format