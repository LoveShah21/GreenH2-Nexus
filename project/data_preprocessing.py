"""
Data preprocessing module for Green Hydrogen Infrastructure Mapping.
Handles data loading, cleaning, feature engineering, and normalization.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import train_test_split
import joblib
import logging
from typing import Tuple, Dict, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataPreprocessor:
    """Handles data preprocessing and feature engineering."""
    
    def __init__(self, data_path: str = 'dummy_dataset.csv'):
        self.data_path = data_path
        self.scalers = {}
        self.feature_columns = [
            'renewable_proximity', 
            'demand_proximity', 
            'transport_score', 
            'land_cost', 
            'energy_cost', 
            'subsidy_score'
        ]
        self.efficiency_target = 'efficiency_score'
        self.cost_target = 'cost_per_kg'
        
    def load_data(self) -> pd.DataFrame:
        """Load data from CSV file."""
        try:
            df = pd.read_csv(self.data_path)
            logger.info(f"Loaded data with shape: {df.shape}")
            return df
        except FileNotFoundError:
            logger.error(f"File {self.data_path} not found")
            raise
            
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and validate the dataset."""
        # Check for missing values
        missing_values = df.isnull().sum()
        if missing_values.any():
            logger.warning(f"Missing values found: {missing_values[missing_values > 0]}")
            df = df.dropna()
            
        # Validate data ranges
        df = df[(df['renewable_proximity'] >= 0) & (df['renewable_proximity'] <= 1)]
        df = df[(df['demand_proximity'] >= 0) & (df['demand_proximity'] <= 1)]
        df = df[(df['transport_score'] >= 0) & (df['transport_score'] <= 1)]
        df = df[(df['subsidy_score'] >= 0) & (df['subsidy_score'] <= 1)]
        df = df[df['land_cost'] > 0]
        df = df[df['energy_cost'] > 0]
        df = df[df['cost_per_kg'] > 0]
        
        logger.info(f"Data cleaned. Remaining rows: {len(df)}")
        return df
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create additional features if needed."""
        # Example: Create composite scores
        df['infrastructure_score'] = (df['renewable_proximity'] * 0.4 + 
                                     df['demand_proximity'] * 0.3 + 
                                     df['transport_score'] * 0.3)
        
        df['cost_factor'] = (df['land_cost'] / 1000000 * 0.4 + 
                            df['energy_cost'] * 100 * 0.4 + 
                            (1 - df['subsidy_score']) * 0.2)
        
        logger.info("Feature engineering completed")
        return df
    
    def normalize_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Normalize features using appropriate scalers."""
        df_normalized = df.copy()
        
        # For efficiency features (0-1 range expected)
        efficiency_features = ['renewable_proximity', 'demand_proximity', 'transport_score', 'subsidy_score']
        minmax_scaler = MinMaxScaler()
        df_normalized[efficiency_features] = minmax_scaler.fit_transform(df[efficiency_features])
        self.scalers['efficiency'] = minmax_scaler
        
        # For cost features (large ranges)
        cost_features = ['land_cost', 'energy_cost']
        standard_scaler = StandardScaler()
        df_normalized[cost_features] = standard_scaler.fit_transform(df[cost_features])
        self.scalers['cost'] = standard_scaler
        
        logger.info("Features normalized")
        return df_normalized, self.scalers
    
    def prepare_training_data(self) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Complete preprocessing pipeline."""
        df = self.load_data()
        df = self.clean_data(df)
        df = self.engineer_features(df)
        df_normalized, scalers = self.normalize_features(df)
        
        # Save processed data
        df_normalized.to_csv('processed_dataset.csv', index=False)
        joblib.dump(scalers, 'models/scalers.pkl')
        
        logger.info("Preprocessing completed. Data saved to processed_dataset.csv")
        return df_normalized, scalers
    
    def get_feature_sets(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        """Get feature sets for efficiency and cost models."""
        # Features for efficiency prediction
        efficiency_features = ['renewable_proximity', 'demand_proximity', 'transport_score', 'subsidy_score']
        X_eff = df[efficiency_features]
        y_eff = df[self.efficiency_target]
        
        # Features for cost prediction
        cost_features = ['land_cost', 'energy_cost', 'demand_proximity', 'subsidy_score']
        X_cost = df[cost_features]
        y_cost = df[self.cost_target]
        
        return X_eff, X_cost, y_eff, y_cost

# Example usage
if __name__ == "__main__":
    preprocessor = DataPreprocessor('dummy_dataset.csv')
    processed_data, scalers = preprocessor.prepare_training_data()
    
    # Get feature sets for training
    X_eff, X_cost, y_eff, y_cost = preprocessor.get_feature_sets(processed_data)
    
    print(f"Efficiency features shape: {X_eff.shape}")
    print(f"Cost features shape: {X_cost.shape}")