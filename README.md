# Netflix Clone with Full MLOps Pipeline

A production-ready Netflix clone featuring a complete MLOps pipeline, microservices architecture, real-time recommendations, and comprehensive monitoring.

## Features

### Core Features
- User authentication and authorization with JWT
- Multiple user profiles support
- Content browsing and streaming
- Personalized recommendations using ML
- Watch history tracking
- My List functionality
- Search and filtering
- Responsive Netflix-like UI

### Technical Stack

#### Frontend
- React 18 with React Router
- Modern responsive UI matching Netflix design
- React Player for video streaming
- Context API for state management

#### Backend
- Node.js with Express
- MongoDB for data persistence
- Redis for caching
- RESTful API architecture
- JWT-based authentication

#### ML/AI
- Python with FastAPI
- TensorFlow for recommendation engine
- Collaborative filtering
- MLflow for experiment tracking
- Model versioning and deployment

#### Infrastructure
- Docker & Docker Compose
- Kubernetes for orchestration
- Prometheus for monitoring
- Grafana for visualization
- GitHub Actions for CI/CD

## Architecture

```
├── frontend/              # React application
├── backend/              # Node.js API server
├── ml-service/           # Python ML service
├── infrastructure/
│   ├── docker/          # Docker configurations
│   ├── kubernetes/      # K8s manifests
│   └── monitoring/      # Prometheus & Grafana configs
└── data/                # Sample data and seeds
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for ML service development)
- kubectl (for Kubernetes deployment)

### Local Development with Docker Compose

1. **Clone the repository**
```bash
git clone <repository-url>
cd Netflix_clone
```

2. **Start all services**
```bash
docker-compose up -d
```

3. **Seed the database**
```bash
docker-compose exec backend node seedData.js
```

4. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000
- MLflow UI: http://localhost:5001
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin123)

### Production Deployment on Kubernetes

1. **Create namespace**
```bash
kubectl apply -f infrastructure/kubernetes/namespace.yaml
```

2. **Configure secrets**
```bash
# Edit secrets.yaml with your production values
kubectl apply -f infrastructure/kubernetes/secrets.yaml
```

3. **Deploy all services**
```bash
kubectl apply -f infrastructure/kubernetes/
```

4. **Check deployment status**
```bash
kubectl get pods -n netflix-clone
kubectl get services -n netflix-clone
```

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Content Endpoints

#### Get All Content
```http
GET /api/content?type=movie&genre=Action&limit=20
Authorization: Bearer <token>
```

#### Get Content by ID
```http
GET /api/content/:id
Authorization: Bearer <token>
```

### Recommendations

#### Get Personalized Recommendations
```http
GET /api/recommendations/:profileId?limit=20
Authorization: Bearer <token>
```

## MLOps Pipeline

### Model Training

Train the recommendation model:
```bash
curl -X POST http://localhost:8000/train \
  -H "Content-Type: application/json" \
  -d '{"force_retrain": true}'
```

### Model Monitoring

- **MLflow UI**: http://localhost:5001
  - View experiment runs
  - Compare model versions
  - Track metrics and parameters

- **Prometheus**: http://localhost:9090
  - Monitor service health
  - Track API metrics
  - Alert configuration

- **Grafana**: http://localhost:3000
  - Visualize metrics
  - Create dashboards
  - Set up alerts

### Automated Retraining

The CI/CD pipeline automatically triggers model training on:
- Push to main branch
- Manual workflow dispatch
- Scheduled (can be configured)

## Monitoring & Observability

### Health Checks

All services expose `/health` endpoints:
- Backend: http://localhost:5000/health
- ML Service: http://localhost:8000/health

### Metrics

Prometheus scrapes metrics from:
- Application services
- MongoDB
- Redis
- System metrics

### Dashboards

Grafana provides pre-configured dashboards for:
- Service health overview
- API performance
- Database metrics
- ML model performance

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Helmet.js security headers
- Input validation
- Rate limiting (ready to configure)

## Scaling

### Horizontal Scaling

The application supports horizontal scaling:

```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n netflix-clone

# Scale ML service
kubectl scale deployment ml-service --replicas=3 -n netflix-clone
```

### Auto-scaling

HPA (Horizontal Pod Autoscaler) is configured for:
- Backend: 3-10 replicas based on CPU
- ML Service: 2-5 replicas based on CPU

## Development

### Running Tests

Backend:
```bash
cd backend
npm test
```

Frontend:
```bash
cd frontend
npm test
```

ML Service:
```bash
cd ml-service
pip install -r requirements.txt
pytest
```

### Code Style

- ESLint for JavaScript/React
- Prettier for formatting
- Flake8 for Python

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Ensure MongoDB is running
   - Check connection string in environment variables

2. **ML service not responding**
   - Check if model is trained
   - Verify MLflow is running
   - Check logs: `docker-compose logs ml-service`

3. **Frontend can't connect to backend**
   - Verify proxy configuration in package.json
   - Check CORS settings
   - Ensure backend is running

### Logs

View service logs:
```bash
# Docker Compose
docker-compose logs -f <service-name>

# Kubernetes
kubectl logs -f deployment/<service-name> -n netflix-clone
```

## Performance Optimization

- Redis caching for frequently accessed data
- Content CDN integration (ready)
- Database indexing
- Image optimization
- Code splitting in React
- Lazy loading components

## Future Enhancements

- [ ] Social features (sharing, comments)
- [ ] Live streaming support
- [ ] Download for offline viewing
- [ ] Multi-language support
- [ ] Advanced recommendation algorithms (deep learning)
- [ ] A/B testing framework
- [ ] Real-time analytics
- [ ] Push notifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by Netflix
- Built with modern web technologies
- Designed for learning and demonstration purposes

## Support

For issues and questions:
- Open an issue on GitHub
- Check documentation in `/docs`
- Review troubleshooting guide above

---

Built with ❤️ for learning and demonstration purposes
