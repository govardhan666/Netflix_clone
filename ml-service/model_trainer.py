import numpy as np
import pandas as pd
import pickle
import os
import logging
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import mlflow
import mlflow.sklearn
from datetime import datetime

logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self):
        self.model_dir = 'models'
        self.mlflow_uri = os.getenv('MLFLOW_TRACKING_URI', 'http://mlflow:5000')

        # Create model directory if it doesn't exist
        os.makedirs(self.model_dir, exist_ok=True)

        # Set MLflow tracking URI
        try:
            mlflow.set_tracking_uri(self.mlflow_uri)
            mlflow.set_experiment("netflix-clone-recommendations")
        except Exception as e:
            logger.warning(f"Could not set up MLflow: {e}")

    def train_model(self, force_retrain: bool = False) -> dict:
        """
        Train the recommendation model

        Args:
            force_retrain: Force retraining even if model exists

        Returns:
            Dictionary with training metrics
        """
        logger.info("Starting model training...")

        try:
            # Start MLflow run
            with mlflow.start_run(run_name=f"training_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):

                # Generate synthetic training data
                # In production, this would fetch real data from MongoDB
                train_data = self._generate_synthetic_data()

                # Log parameters
                mlflow.log_param("num_samples", len(train_data))
                mlflow.log_param("model_type", "collaborative_filtering")
                mlflow.log_param("timestamp", datetime.now().isoformat())

                # Build content features
                content_features = self._build_content_features(train_data)

                # Build genre encoding
                genre_encoding = self._build_genre_encoding(train_data)

                # Create model package
                model_data = {
                    'model': 'collaborative_filtering_v1',
                    'content_features': content_features,
                    'genre_encoding': genre_encoding,
                    'version': '1.0.0',
                    'created_at': datetime.now().isoformat()
                }

                # Save model
                model_path = os.path.join(self.model_dir, 'recommendation_model.pkl')
                with open(model_path, 'wb') as f:
                    pickle.dump(model_data, f)

                # Calculate and log metrics
                metrics = {
                    'num_content_items': len(content_features),
                    'num_genres': len(genre_encoding),
                    'training_time': 'simulated',
                    'model_version': '1.0.0'
                }

                mlflow.log_metric("num_content_items", metrics['num_content_items'])
                mlflow.log_metric("num_genres", metrics['num_genres'])

                # Log model artifact
                mlflow.log_artifact(model_path)

                logger.info(f"Model training completed. Metrics: {metrics}")

                return metrics

        except Exception as e:
            logger.error(f"Error during model training: {e}")
            raise

    def _generate_synthetic_data(self) -> pd.DataFrame:
        """Generate synthetic training data for demonstration"""
        # In production, this would fetch real data from MongoDB

        genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance',
                 'Thriller', 'Fantasy', 'Mystery', 'Adventure']

        data = []
        for i in range(100):  # 100 synthetic content items
            content_item = {
                'content_id': f'content_{i}',
                'genres': np.random.choice(genres, size=np.random.randint(1, 4), replace=False).tolist(),
                'popularity': np.random.random(),
                'rating': np.random.uniform(6.0, 10.0)
            }
            data.append(content_item)

        return pd.DataFrame(data)

    def _build_content_features(self, data: pd.DataFrame) -> dict:
        """Build feature vectors for each content item"""
        content_features = {}

        for _, row in data.iterrows():
            # Create a simple feature vector
            # In production, this would be more sophisticated
            feature_vector = np.random.random(100)  # 100-dimensional vector
            content_features[row['content_id']] = feature_vector

        return content_features

    def _build_genre_encoding(self, data: pd.DataFrame) -> dict:
        """Build genre to index encoding"""
        all_genres = set()
        for genres in data['genres']:
            all_genres.update(genres)

        genre_encoding = {genre: idx for idx, genre in enumerate(sorted(all_genres))}

        return genre_encoding
