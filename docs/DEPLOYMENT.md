# Deployment Guide

Complete guide for deploying the Netflix Clone application to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Monitoring Setup](#monitoring-setup)

## Prerequisites

### Required Tools
- Docker 20.10+
- Docker Compose 2.0+
- kubectl 1.24+
- Helm 3.0+ (optional)
- Git

### Accounts & Access
- Container registry access (GitHub Container Registry, Docker Hub, etc.)
- Kubernetes cluster (EKS, GKE, AKS, or local)
- Domain name (for production)

## Local Development

### 1. Clone Repository
```bash
git clone <repository-url>
cd Netflix_clone
```

### 2. Environment Configuration
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# ML Service
cp ml-service/.env.example ml-service/.env
```

### 3. Start Development Services
```bash
docker-compose up -d
```

### 4. Seed Database
```bash
docker-compose exec backend node seedData.js
```

### 5. Access Services
- Application: http://localhost
- API Docs: http://localhost:5000/health
- ML Service: http://localhost:8000/health
- MLflow: http://localhost:5001
- Grafana: http://localhost:3000

## Docker Deployment

### Build Images
```bash
# Build all images
docker-compose build

# Build specific service
docker build -f infrastructure/docker/Dockerfile.backend -t netflix-backend .
```

### Push to Registry
```bash
# Tag images
docker tag netflix-backend ghcr.io/your-username/netflix-clone-backend:latest
docker tag netflix-frontend ghcr.io/your-username/netflix-clone-frontend:latest
docker tag netflix-ml-service ghcr.io/your-username/netflix-clone-ml-service:latest

# Push to registry
docker push ghcr.io/your-username/netflix-clone-backend:latest
docker push ghcr.io/your-username/netflix-clone-frontend:latest
docker push ghcr.io/your-username/netflix-clone-ml-service:latest
```

### Production Docker Compose
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

## Kubernetes Deployment

### 1. Cluster Setup

#### Local (Minikube)
```bash
minikube start --cpus=4 --memory=8192
minikube addons enable ingress
```

#### Cloud (GKE Example)
```bash
gcloud container clusters create netflix-clone \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --zone=us-central1-a
```

### 2. Configure kubectl
```bash
# Verify connection
kubectl cluster-info
kubectl get nodes
```

### 3. Create Namespace
```bash
kubectl apply -f infrastructure/kubernetes/namespace.yaml
```

### 4. Configure Secrets
```bash
# Create JWT secret
kubectl create secret generic netflix-secrets \
  --from-literal=jwt-secret='your-secure-secret-key' \
  -n netflix-clone

# Or apply from file (after editing)
kubectl apply -f infrastructure/kubernetes/secrets.yaml
```

### 5. Deploy Services

#### Option A: Deploy All at Once
```bash
kubectl apply -f infrastructure/kubernetes/
```

#### Option B: Deploy Step by Step
```bash
# Storage & Databases
kubectl apply -f infrastructure/kubernetes/mongodb-deployment.yaml
kubectl apply -f infrastructure/kubernetes/redis-deployment.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n netflix-clone --timeout=300s

# Application Services
kubectl apply -f infrastructure/kubernetes/backend-deployment.yaml
kubectl apply -f infrastructure/kubernetes/ml-service-deployment.yaml
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml

# Ingress
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

### 6. Verify Deployment
```bash
# Check pod status
kubectl get pods -n netflix-clone

# Check services
kubectl get svc -n netflix-clone

# View logs
kubectl logs -f deployment/backend -n netflix-clone
```

### 7. Access Application

#### Using LoadBalancer
```bash
kubectl get svc frontend -n netflix-clone
# Access using EXTERNAL-IP
```

#### Using Port Forward (Testing)
```bash
kubectl port-forward svc/frontend 8080:80 -n netflix-clone
# Access at http://localhost:8080
```

## Cloud Deployment

### AWS (EKS)

#### 1. Create EKS Cluster
```bash
eksctl create cluster \
  --name netflix-clone \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3
```

#### 2. Configure kubectl
```bash
aws eks update-kubeconfig --region us-west-2 --name netflix-clone
```

#### 3. Deploy
```bash
kubectl apply -f infrastructure/kubernetes/
```

### Google Cloud (GKE)

#### 1. Create GKE Cluster
```bash
gcloud container clusters create netflix-clone \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --zone=us-central1-a
```

#### 2. Configure kubectl
```bash
gcloud container clusters get-credentials netflix-clone --zone=us-central1-a
```

#### 3. Deploy
```bash
kubectl apply -f infrastructure/kubernetes/
```

### Azure (AKS)

#### 1. Create AKS Cluster
```bash
az aks create \
  --resource-group netflix-clone-rg \
  --name netflix-clone \
  --node-count 3 \
  --node-vm-size Standard_D2s_v3
```

#### 2. Configure kubectl
```bash
az aks get-credentials --resource-group netflix-clone-rg --name netflix-clone
```

#### 3. Deploy
```bash
kubectl apply -f infrastructure/kubernetes/
```

## Monitoring Setup

### 1. Deploy Prometheus
```bash
# Already included in docker-compose.yml
# For Kubernetes, use Helm:
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n netflix-clone
```

### 2. Deploy Grafana
```bash
# Access Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n netflix-clone

# Default credentials: admin/prom-operator
```

### 3. Configure Dashboards
- Import dashboards from `/infrastructure/monitoring/`
- Configure data sources
- Set up alerts

## SSL/TLS Configuration

### Using Let's Encrypt with cert-manager

#### 1. Install cert-manager
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

#### 2. Create ClusterIssuer
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

#### 3. Update Ingress
The ingress in `infrastructure/kubernetes/ingress.yaml` is already configured for TLS.

## Database Backup

### MongoDB Backup
```bash
# Create backup
kubectl exec -it deployment/mongodb -n netflix-clone -- mongodump --out=/backup

# Copy backup locally
kubectl cp netflix-clone/mongodb-pod:/backup ./backup
```

### Automated Backups
```bash
# Create CronJob for automated backups
kubectl apply -f infrastructure/kubernetes/backup-cronjob.yaml
```

## Scaling

### Manual Scaling
```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n netflix-clone

# Scale ML service
kubectl scale deployment ml-service --replicas=3 -n netflix-clone
```

### Auto-scaling
HPA is already configured in deployment manifests. Verify:
```bash
kubectl get hpa -n netflix-clone
```

## Troubleshooting

### Common Issues

#### Pods Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n netflix-clone

# Check logs
kubectl logs <pod-name> -n netflix-clone
```

#### Database Connection Issues
```bash
# Verify MongoDB is running
kubectl get pods -l app=mongodb -n netflix-clone

# Check service
kubectl get svc mongodb -n netflix-clone

# Test connection
kubectl run -it --rm debug --image=mongo:7.0 --restart=Never -- mongosh mongodb://mongodb:27017/netflix_clone
```

#### Image Pull Errors
```bash
# Create registry secret
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=<username> \
  --docker-password=<token> \
  -n netflix-clone

# Add to deployment spec
# imagePullSecrets:
#   - name: regcred
```

## Rollback

### Kubernetes Rollback
```bash
# View rollout history
kubectl rollout history deployment/backend -n netflix-clone

# Rollback to previous version
kubectl rollout undo deployment/backend -n netflix-clone

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2 -n netflix-clone
```

## Health Checks

### Verify All Services
```bash
# Check all pods
kubectl get pods -n netflix-clone

# Check all services
kubectl get svc -n netflix-clone

# Check ingress
kubectl get ingress -n netflix-clone
```

### Test Endpoints
```bash
# Backend health
curl http://your-domain/api/health

# ML service health
curl http://your-ml-service-url/health
```

## Cleanup

### Remove Deployment
```bash
# Delete all resources
kubectl delete namespace netflix-clone

# Or delete specific resources
kubectl delete -f infrastructure/kubernetes/
```

### Delete Cluster
```bash
# Minikube
minikube delete

# EKS
eksctl delete cluster --name netflix-clone

# GKE
gcloud container clusters delete netflix-clone --zone=us-central1-a

# AKS
az aks delete --resource-group netflix-clone-rg --name netflix-clone
```

---

For more information, refer to the main [README.md](../README.md)
