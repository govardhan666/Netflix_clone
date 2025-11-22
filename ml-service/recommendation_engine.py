import numpy as np
import pandas as pd
import pickle
import os
import logging
from typing import List, Dict
from datetime import datetime

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self, model_path='models/recommendation_model.pkl'):
        self.model_path = model_path
        self.model = None
        self.content_features = None
        self.genre_encoding = None

    def load_model(self):
        """Load the trained recommendation model"""
        try:
            if os.path.exists(self.model_path):
                with open(self.model_path, 'rb') as f:
                    model_data = pickle.load(f)
                    self.model = model_data.get('model')
                    self.content_features = model_data.get('content_features')
                    self.genre_encoding = model_data.get('genre_encoding')
                logger.info("Model loaded successfully")
                return True
            else:
                logger.warning(f"Model file not found at {self.model_path}")
                return False
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False

    def get_recommendations(self, user_id: str, profile_id: str,
                          preferences: Dict, limit: int = 20) -> Dict:
        """
        Get personalized recommendations for a user

        Args:
            user_id: User ID
            profile_id: Profile ID
            preferences: User preferences including genres and watch history
            limit: Number of recommendations to return

        Returns:
            Dictionary with content IDs, source, and confidence
        """
        try:
            # If model is available, use ML-based recommendations
            if self.model is not None and self.content_features is not None:
                recommendations = self._ml_based_recommendations(
                    user_id, profile_id, preferences, limit
                )
                return {
                    'content_ids': recommendations,
                    'source': 'ml-model',
                    'confidence': 0.85
                }
            else:
                # Fallback to rule-based recommendations
                recommendations = self._rule_based_recommendations(
                    preferences, limit
                )
                return {
                    'content_ids': recommendations,
                    'source': 'rule-based',
                    'confidence': 0.6
                }
        except Exception as e:
            logger.error(f"Error in get_recommendations: {e}")
            # Return empty recommendations in case of error
            return {
                'content_ids': [],
                'source': 'error',
                'confidence': 0.0
            }

    def _ml_based_recommendations(self, user_id: str, profile_id: str,
                                 preferences: Dict, limit: int) -> List[str]:
        """Generate recommendations using the ML model"""
        try:
            # Extract watched content IDs
            watched_ids = set()
            if 'watchHistory' in preferences:
                watched_ids = {item['contentId'] for item in preferences['watchHistory']}

            # Get user's preferred genres
            preferred_genres = preferences.get('genres', [])

            # Create user profile vector
            user_vector = self._create_user_vector(preferred_genres, watched_ids)

            # Calculate similarity scores with all content
            if self.content_features is not None:
                content_ids = list(self.content_features.keys())
                scores = []

                for content_id in content_ids:
                    if content_id not in watched_ids:
                        content_vector = self.content_features[content_id]
                        similarity = self._cosine_similarity(user_vector, content_vector)
                        scores.append((content_id, similarity))

                # Sort by similarity score and return top N
                scores.sort(key=lambda x: x[1], reverse=True)
                recommendations = [content_id for content_id, _ in scores[:limit]]

                return recommendations

            return []

        except Exception as e:
            logger.error(f"Error in ML-based recommendations: {e}")
            return []

    def _rule_based_recommendations(self, preferences: Dict, limit: int) -> List[str]:
        """Generate recommendations using simple rules"""
        # This is a placeholder - in production, this would query the database
        # For now, return empty list and let the backend use its fallback
        return []

    def _create_user_vector(self, preferred_genres: List[str],
                           watched_ids: set) -> np.ndarray:
        """Create a feature vector for the user based on preferences"""
        # Create a simple vector based on genre preferences
        vector = np.zeros(100)  # 100-dimensional vector

        # Encode preferred genres
        if self.genre_encoding and preferred_genres:
            for genre in preferred_genres:
                if genre in self.genre_encoding:
                    idx = self.genre_encoding[genre]
                    if idx < len(vector):
                        vector[idx] = 1.0

        # Add watch history influence
        vector[50] = min(len(watched_ids) / 10.0, 1.0)  # Normalize watch count

        return vector

    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return dot_product / (norm1 * norm2)

    def get_model_info(self) -> Dict:
        """Get information about the current model"""
        return {
            'model_loaded': self.model is not None,
            'model_path': self.model_path,
            'has_content_features': self.content_features is not None,
            'num_content_items': len(self.content_features) if self.content_features else 0,
            'model_type': 'collaborative_filtering',
            'last_updated': datetime.now().isoformat()
        }
