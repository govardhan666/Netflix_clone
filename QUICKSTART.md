# Quick Start Guide - Netflix Clone

Get your Netflix Clone up and running in minutes!

## Option 1: One-Command Deployment (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- At least 8GB RAM available
- Ports 80, 5000, 8000, 5001, 9090, 3000 available

### Deploy Now!

```bash
# Clone the repository
git clone <your-repo-url>
cd Netflix_clone

# Deploy everything
./deploy.sh local
```

That's it! The application will:
1. Start all services (Frontend, Backend, MongoDB, Redis, ML Service, MLflow, Prometheus, Grafana)
2. Seed the database with sample content
3. Train the ML recommendation model

### Access Your Application

After deployment completes (about 2-3 minutes), access:

- **Netflix Clone App**: http://localhost
- **Backend API**: http://localhost:5000/health
- **ML Service**: http://localhost:8000/health
- **MLflow Dashboard**: http://localhost:5001
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
  - Username: `admin`
  - Password: `admin123`

### First User Registration

1. Open http://localhost in your browser
2. Click "Sign up now"
3. Create an account with:
   - Username: Your Name
   - Email: user@example.com
   - Password: password123 (min 6 characters)
4. You'll be automatically logged in with a default profile
5. Start browsing content!

## Option 2: Manual Docker Compose

```bash
# Start services
docker-compose up -d

# Wait for services to start (30 seconds)
sleep 30

# Seed database
docker-compose exec backend node seedData.js

# Train ML model
curl -X POST http://localhost:8000/train \
  -H "Content-Type: application/json" \
  -d '{"force_retrain": true}'

# View logs
docker-compose logs -f
```

## Option 3: Kubernetes Deployment

### Prerequisites
- kubectl configured with cluster access
- At least 3 worker nodes with 8GB RAM each

### Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f infrastructure/kubernetes/

# Wait for pods to be ready
kubectl wait --for=condition=ready pod --all -n netflix-clone --timeout=300s

# Get frontend URL
kubectl get svc frontend -n netflix-clone
```

## Verify Installation

Run these health checks:

```bash
# Backend health
curl http://localhost:5000/health

# ML Service health
curl http://localhost:8000/health

# Check all containers
docker-compose ps

# View logs
docker-compose logs -f backend
```

Expected response from health endpoints:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "netflix-clone-backend"
}
```

## Stop the Application

```bash
# Using deploy script
./deploy.sh stop

# Or manually
docker-compose down

# To remove volumes (database data)
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 80
lsof -i :80

# Kill process or change port in docker-compose.yml
```

### Services Not Starting
```bash
# Check logs
docker-compose logs backend
docker-compose logs ml-service

# Restart specific service
docker-compose restart backend
```

### Database Not Seeding
```bash
# Manually seed
docker-compose exec backend node seedData.js

# Or restart and reseed
docker-compose down -v
docker-compose up -d
docker-compose exec backend node seedData.js
```

### ML Model Not Training
```bash
# Check ML service logs
docker-compose logs ml-service

# Manually trigger training
curl -X POST http://localhost:8000/train \
  -H "Content-Type: application/json" \
  -d '{"force_retrain": true}'
```

## What's Included

### Sample Content
The database includes 8 sample movies and series across various genres:
- Action movies
- Sci-Fi adventures
- Comedy films
- Mystery series
- Horror content
- Romance movies

### Features Available
- User registration and authentication
- Multiple user profiles
- Content browsing by genre
- Video streaming
- Personalized recommendations (ML-powered)
- Watch history tracking
- My List functionality
- Search and filtering
- Real-time monitoring dashboards

### Monitoring Dashboards

**Grafana** (http://localhost:3000):
- Service health overview
- API performance metrics
- Database statistics
- Real-time request monitoring

**Prometheus** (http://localhost:9090):
- Raw metrics explorer
- Query interface
- Alert configuration

**MLflow** (http://localhost:5001):
- Model experiments
- Training runs history
- Model versioning
- Performance metrics

## Next Steps

1. **Explore the Application**
   - Register a user
   - Browse content
   - Watch videos
   - Add to My List
   - Check recommendations

2. **View Monitoring**
   - Open Grafana dashboards
   - Explore Prometheus metrics
   - Check MLflow experiments

3. **API Testing**
   - Review API documentation in `/docs/API.md`
   - Test endpoints with Postman or curl
   - Try the recommendation API

4. **Customize**
   - Add your own content via MongoDB
   - Modify UI components
   - Configure new features
   - Deploy to production

## Production Deployment

For production deployment:

1. **Configure Secrets**
   ```bash
   # Update backend/.env with production values
   # Update JWT_SECRET
   # Configure MongoDB connection
   # Set up SSL certificates
   ```

2. **Use Kubernetes**
   ```bash
   # Deploy to your cluster
   kubectl apply -f infrastructure/kubernetes/

   # Configure ingress with your domain
   # Set up TLS/SSL
   # Configure monitoring alerts
   ```

3. **Enable CI/CD**
   - GitHub Actions are pre-configured
   - Set up registry credentials
   - Configure deployment secrets
   - Enable automated testing

## Resources

- **Full Documentation**: See `README.md`
- **API Reference**: See `docs/API.md`
- **Deployment Guide**: See `docs/DEPLOYMENT.md`
- **Architecture**: See project structure in README

## Support

Having issues?

1. Check the troubleshooting section above
2. Review logs: `docker-compose logs -f`
3. Check health endpoints
4. Open an issue on GitHub

---

Enjoy your Netflix Clone! 🎬🍿
