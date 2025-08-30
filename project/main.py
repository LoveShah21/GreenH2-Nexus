"""
Main entry point for the Green Hydrogen Infrastructure backend.
"""

import uvicorn
from predict_api import app

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload during development
        log_level="info"
    )