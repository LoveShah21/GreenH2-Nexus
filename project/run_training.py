"""
Script to run the complete training pipeline.
"""

from data_preprocessing import DataPreprocessor
from train_models import ModelTrainer
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_pipeline():
    """Run complete training pipeline."""
    logger.info("Starting Green Hydrogen Infrastructure training pipeline...")
    
    # Step 1: Preprocess data
    logger.info("Step 1: Data preprocessing")
    preprocessor = DataPreprocessor('dummy_dataset.csv')
    processed_data, scalers = preprocessor.prepare_training_data()
    
    # Step 2: Train models
    logger.info("Step 2: Model training")
    trainer = ModelTrainer()
    eff_model, cost_model = trainer.train_models()
    
    logger.info("Training pipeline completed successfully!")
    print("\n=== Final Metrics ===")
    for model_name, metrics in trainer.metrics.items():
        print(f"{model_name.upper()} Model:")
        for metric, value in metrics.items():
            print(f"  {metric.upper()}: {value:.4f}")

if __name__ == "__main__":
    run_pipeline()