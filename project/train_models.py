"""
Model training module for Green Hydrogen Infrastructure Optimization.
Trains efficiency (classification/ranking) and cost (regression) models.
"""

import pandas as pd
import numpy as np
import joblib
import logging
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, f1_score
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
from data_preprocessing import DataPreprocessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelTrainer:
    """Handles training of efficiency and cost prediction models."""
    
    def __init__(self):
        self.efficiency_model = None
        self.cost_model = None
        self.metrics = {}
        
    def load_processed_data(self) -> tuple:
        """Load preprocessed data."""
        try:
            df = pd.read_csv('processed_dataset.csv')
            preprocessor = DataPreprocessor()
            X_eff, X_cost, y_eff, y_cost = preprocessor.get_feature_sets(df)
            return X_eff, X_cost, y_eff, y_cost
        except FileNotFoundError:
            logger.error("Processed data not found. Run preprocessing first.")
            raise
    
    def train_efficiency_model(self, X: pd.DataFrame, y: pd.Series) -> any:
        """Train efficiency prediction model (0-1 score)."""
        logger.info("Training efficiency model...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Use XGBoost for ranking/regression
        model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        # Train model
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        self.metrics['efficiency'] = {
            'mae': mae,
            'rmse': rmse,
            'r2': r2
        }
        
        logger.info(f"Efficiency Model - MAE: {mae:.4f}, RMSE: {rmse:.4f}, R²: {r2:.4f}")
        return model
    
    def train_cost_model(self, X: pd.DataFrame, y: pd.Series) -> any:
        """Train cost prediction model ($/kg)."""
        logger.info("Training cost model...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Use Gradient Boosting for regression
        model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42
        )
        
        # Train model
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        self.metrics['cost'] = {
            'mae': mae,
            'rmse': rmse,
            'r2': r2
        }
        
        logger.info(f"Cost Model - MAE: {mae:.4f}, RMSE: {rmse:.4f}, R²: {r2:.4f}")
        return model
    
    def train_models(self) -> tuple:
        """Train both models and save them."""
        X_eff, X_cost, y_eff, y_cost = self.load_processed_data()
        
        # Train efficiency model
        self.efficiency_model = self.train_efficiency_model(X_eff, y_eff)
        
        # Train cost model
        self.cost_model = self.train_cost_model(X_cost, y_cost)
        
        # Save models
        joblib.dump(self.efficiency_model, 'models/eff_model.pkl')
        joblib.dump(self.cost_model, 'models/cost_model.pkl')
        joblib.dump(self.metrics, 'models/training_metrics.pkl')
        
        logger.info("Models trained and saved successfully")
        return self.efficiency_model, self.cost_model
    
    def cross_validate_models(self):
        """Optional: Perform cross-validation for better model selection."""
        # This can be expanded with GridSearchCV for hyperparameter tuning
        pass

def main():
    """Main training function."""
    # Ensure models directory exists
    import os
    os.makedirs('models', exist_ok=True)
    
    # First, preprocess data if not already done
    try:
        pd.read_csv('processed_dataset.csv')
    except FileNotFoundError:
        logger.info("Preprocessing data...")
        preprocessor = DataPreprocessor('dummy_dataset.csv')
        preprocessor.prepare_training_data()
    
    # Train models
    trainer = ModelTrainer()
    eff_model, cost_model = trainer.train_models()
    
    # Print final metrics
    print("\n=== Training Results ===")
    for model_name, metrics in trainer.metrics.items():
        print(f"{model_name.upper()} Model:")
        for metric, value in metrics.items():
            print(f"  {metric.upper()}: {value:.4f}")

if __name__ == "__main__":
    main()