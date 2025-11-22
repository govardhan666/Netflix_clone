#!/bin/bash

# Netflix Clone Deployment Script
# This script helps deploy the application locally or to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main deployment function
deploy_local() {
    print_info "Deploying Netflix Clone locally with Docker Compose..."

    # Check Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Start services
    print_info "Starting all services..."
    docker-compose up -d

    # Wait for services to be healthy
    print_info "Waiting for services to be ready..."
    sleep 10

    # Seed database
    print_info "Seeding database with sample content..."
    docker-compose exec -T backend node seedData.js || print_info "Database may already be seeded"

    # Train ML model
    print_info "Training ML recommendation model..."
    curl -X POST http://localhost:8000/train \
        -H "Content-Type: application/json" \
        -d '{"force_retrain": true}' || print_info "ML service may not be ready yet"

    print_success "Deployment complete!"
    echo ""
    print_info "Access the application at:"
    echo "  Frontend:    http://localhost"
    echo "  Backend API: http://localhost:5000"
    echo "  ML Service:  http://localhost:8000"
    echo "  MLflow:      http://localhost:5001"
    echo "  Prometheus:  http://localhost:9090"
    echo "  Grafana:     http://localhost:3000 (admin/admin123)"
}

deploy_kubernetes() {
    print_info "Deploying Netflix Clone to Kubernetes..."

    # Check kubectl
    if ! command_exists kubectl; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi

    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please configure kubectl."
        exit 1
    fi

    # Create namespace
    print_info "Creating namespace..."
    kubectl apply -f infrastructure/kubernetes/namespace.yaml

    # Apply secrets
    print_info "Applying secrets..."
    kubectl apply -f infrastructure/kubernetes/secrets.yaml

    # Deploy services
    print_info "Deploying all services..."
    kubectl apply -f infrastructure/kubernetes/

    # Wait for deployments
    print_info "Waiting for deployments to be ready..."
    kubectl wait --for=condition=ready pod -l app=mongodb -n netflix-clone --timeout=300s || true
    kubectl wait --for=condition=ready pod -l app=backend -n netflix-clone --timeout=300s || true

    print_success "Kubernetes deployment complete!"
    echo ""
    print_info "Check deployment status:"
    echo "  kubectl get pods -n netflix-clone"
    echo "  kubectl get svc -n netflix-clone"
}

build_images() {
    print_info "Building Docker images..."

    docker build -f infrastructure/docker/Dockerfile.backend -t netflix-clone-backend:latest .
    docker build -f infrastructure/docker/Dockerfile.frontend -t netflix-clone-frontend:latest .
    docker build -f infrastructure/docker/Dockerfile.ml-service -t netflix-clone-ml-service:latest .

    print_success "Images built successfully!"
}

stop_local() {
    print_info "Stopping local deployment..."
    docker-compose down
    print_success "All services stopped!"
}

show_logs() {
    print_info "Showing logs..."
    docker-compose logs -f
}

# Parse command line arguments
case "${1:-local}" in
    local)
        deploy_local
        ;;
    kubernetes|k8s)
        deploy_kubernetes
        ;;
    build)
        build_images
        ;;
    stop)
        stop_local
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Usage: $0 {local|kubernetes|build|stop|logs}"
        echo ""
        echo "Commands:"
        echo "  local       - Deploy locally using Docker Compose (default)"
        echo "  kubernetes  - Deploy to Kubernetes cluster"
        echo "  build       - Build Docker images"
        echo "  stop        - Stop local deployment"
        echo "  logs        - Show logs from local deployment"
        exit 1
        ;;
esac
