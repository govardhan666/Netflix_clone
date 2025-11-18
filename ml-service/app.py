from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import pandas as pd
from datetime import datetime
import os
import logging

from recommendation_engine import RecommendationEngine
from model_trainer import ModelTrainer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Netflix Clone ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recommendation engine
rec_engine = RecommendationEngine()
model_trainer = ModelTrainer()

class RecommendationRequest(BaseModel):
    userId: str
    profileId: str
    preferences: dict
    limit: int = 20

class RecommendationResponse(BaseModel):
    recommendations: List[str]
    source: str
    confidence: float

class TrainingRequest(BaseModel):
    force_retrain: bool = False

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    logger.info("Starting ML Service...")
    try:
        rec_engine.load_model()
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.warning(f"Could not load model: {e}")
        logger.info("Will use fallback recommendations until model is trained")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ml-service",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": rec_engine.model is not None
    }

@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """Get personalized recommendations for a user"""
    try:
        logger.info(f"Getting recommendations for user {request.userId}, profile {request.profileId}")

        # Get recommendations from the engine
        recommendations = rec_engine.get_recommendations(
            user_id=request.userId,
            profile_id=request.profileId,
            preferences=request.preferences,
            limit=request.limit
        )

        return RecommendationResponse(
            recommendations=recommendations['content_ids'],
            source=recommendations['source'],
            confidence=recommendations['confidence']
        )

    except Exception as e:
        logger.error(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_model(request: TrainingRequest):
    """Train or retrain the recommendation model"""
    try:
        logger.info("Starting model training...")

        # Train the model
        metrics = model_trainer.train_model(force_retrain=request.force_retrain)

        # Reload the model in the recommendation engine
        rec_engine.load_model()

        logger.info("Model training completed successfully")

        return {
            "status": "success",
            "message": "Model trained successfully",
            "metrics": metrics,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Error training model: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model/info")
async def get_model_info():
    """Get information about the current model"""
    try:
        model_info = rec_engine.get_model_info()
        return model_info
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feedback")
async def log_feedback(user_id: str, content_id: str, rating: float):
    """Log user feedback for model improvement"""
    try:
        # In production, this would store feedback in a database
        # for future model retraining
        logger.info(f"Received feedback: user={user_id}, content={content_id}, rating={rating}")

        return {
            "status": "success",
            "message": "Feedback logged successfully"
        }
    except Exception as e:
        logger.error(f"Error logging feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
