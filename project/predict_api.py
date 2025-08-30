"""
FastAPI backend for Green Hydrogen Infrastructure predictions.
Provides API endpoints for zone efficiency and cost predictions.
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Green Hydrogen Infrastructure API",
    description="API for predicting hydrogen production efficiency and cost",
    version="1.0.0"
)

class PredictionResponse(BaseModel):
    """Response model for prediction endpoint."""
    lat: float
    lng: float
    efficiency: float
    cost: float
    zone: str
    timestamp: str

class PredictionRequest(BaseModel):
    """Request model for batch predictions."""
    locations: List[Dict[str, float]]  # List of {lat, lng} objects

class ModelManager:
    """Manages ML models and predictions."""
    
    def __init__(self):
        self.efficiency_model = None
        self.cost_model = None
        self.scalers = None
        self.load_models()
    
    def load_models(self):
        """Load trained models and scalers."""
        try:
            self.efficiency_model = joblib.load('models/eff_model.pkl')
            self.cost_model = joblib.load('models/cost_model.pkl')
            self.scalers = joblib.load('models/scalers.pkl')
            logger.info("Models loaded successfully")
        except FileNotFoundError:
            logger.error("Model files not found. Train models first.")
            raise
    
    def get_dummy_features(self, lat: float, lng: float) -> Dict[str, float]:
        """
        Generate dummy features for a given location.
        In production, this would query a database or spatial service.
        """
        # Simple dummy feature generation based on coordinates
        # This is a placeholder - real implementation would use spatial queries
        seed_value = hash(f"{lat}_{lng}") % (2**32 - 1)
        np.random.seed(seed_value)
        
        features = {
            'renewable_proximity': max(0, min(1, 0.5 + (lat - 35) / 100 + np.random.normal(0, 0.1))),
            'demand_proximity': max(0, min(1, 0.6 + (lng + 120) / 100 + np.random.normal(0, 0.1))),
            'transport_score': max(0, min(1, 0.7 + np.random.normal(0, 0.15))),
            'land_cost': 1000000 + abs(lat) * 50000 + abs(lng) * 30000,
            'energy_cost': 0.1 + abs(lat - 40) * 0.002 + np.random.normal(0, 0.02),
            'subsidy_score': max(0, min(1, 0.5 + (40 - abs(lat)) / 100 + np.random.normal(0, 0.1)))
        }
        
        return features
    
    def preprocess_features(self, features: Dict[str, float]) -> tuple:
        """Preprocess features for model input."""
        # Features for efficiency model (all already 0-1 range)
        eff_features = ['renewable_proximity', 'demand_proximity', 'transport_score', 'subsidy_score']
        eff_array = np.array([[features[f] for f in eff_features]])
        
        # Features for cost model - only scale land_cost and energy_cost
        cost_features = ['land_cost', 'energy_cost', 'demand_proximity', 'subsidy_score']
        cost_array = np.array([[features[f] for f in cost_features]])
        
        # Apply normalization
        if self.scalers:
            # Efficiency features are already 0-1, just use the scaler if it exists
            eff_array = self.scalers['efficiency'].transform(eff_array)
            
            # Scale only the numerical cost features
            # Create a temporary array with just land_cost and energy_cost for scaling
            temp_cost_features = ['land_cost', 'energy_cost']
            temp_array = np.array([[features[f] for f in temp_cost_features]])
            temp_scaled = self.scalers['cost'].transform(temp_array)
            
            # Rebuild the full cost array with scaled values + original normalized values
            cost_array = np.array([[
                temp_scaled[0][0],              # scaled land_cost
                temp_scaled[0][1],              # scaled energy_cost
                features['demand_proximity'],   # already 0-1
                features['subsidy_score']       # already 0-1
            ]])
        
        return eff_array, cost_array
    
    def predict_zone(self, efficiency: float, cost: float) -> str:
        """Categorize zone based on efficiency and cost."""
        if efficiency > 0.8 and cost < 2.5:
            return "green"
        elif efficiency > 0.6:
            return "yellow"
        else:
            return "red"
    
    def predict(self, lat: float, lng: float) -> Dict[str, Any]:
        """Make predictions for a single location."""
        try:
            # Get features (in production, this would query a database)
            features = self.get_dummy_features(lat, lng)
            
            # Preprocess features
            eff_array, cost_array = self.preprocess_features(features)
            
            # Make predictions
            efficiency = float(self.efficiency_model.predict(eff_array)[0])
            cost = float(self.cost_model.predict(cost_array)[0])
            
            # Ensure predictions are within reasonable bounds
            efficiency = max(0, min(1, efficiency))
            cost = max(0.5, min(10, cost))
            
            # Determine zone category
            zone = self.predict_zone(efficiency, cost)
            
            return {
                'lat': lat,
                'lng': lng,
                'efficiency': round(efficiency, 3),
                'cost': round(cost, 2),
                'zone': zone,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise

# Initialize model manager
model_manager = ModelManager()

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Green Hydrogen Infrastructure API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict-zones?lat=...&lng=...",
            "batch_predict": "/predict-zones/batch"
        }
    }

@app.get("/predict-zones", response_model=PredictionResponse)
async def predict_zones(
    lat: float = Query(..., description="Latitude of the location", ge=-90, le=90),
    lng: float = Query(..., description="Longitude of the location", ge=-180, le=180)
):
    """
    Predict hydrogen production efficiency and cost for a given location.
    
    Returns:
    - efficiency: Score from 0-1 (higher is better)
    - cost: Estimated cost in $/kg
    - zone: Category (green, yellow, red)
    """
    try:
        prediction = model_manager.predict(lat, lng)
        return PredictionResponse(**prediction)
    except Exception as e:
        logger.error(f"API error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-zones/batch")
async def predict_zones_batch(request: PredictionRequest):
    """
    Batch prediction for multiple locations.
    
    Input: List of {lat, lng} objects
    Output: List of predictions with efficiency, cost, and zone
    """
    try:
        results = []
        for location in request.locations:
            prediction = model_manager.predict(location['lat'], location['lng'])
            results.append(prediction)
        
        return {"predictions": results}
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "models_loaded": model_manager.efficiency_model is not None and model_manager.cost_model is not None,
        "timestamp": datetime.utcnow().isoformat()
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)