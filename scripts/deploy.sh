#!/bin/bash
set -e

# ==============================================================================
# PRODUCTION DEPLOYMENT SCRIPT - AI RISK MANAGER
# ==============================================================================

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==============================================================================
# PRE-DEPLOYMENT CHECKS
# ==============================================================================

echo "📋 Running pre-deployment checks..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found${NC}"
    echo "Copy .env.production.example to .env.production and fill in the values"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Error: docker-compose is not installed${NC}"
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

echo -e "${GREEN}✅ Pre-deployment checks passed${NC}"

# ==============================================================================
# BACKUP DATABASE
# ==============================================================================

echo "💾 Backing up database..."

docker-compose -f docker-compose.production.yml exec -T postgres \
    pg_dump -U airiskmgr -d airiskmgr_db -Fc > "backups/db-backup-$(date +%Y%m%d-%H%M%S).dump"

echo -e "${GREEN}✅ Database backup completed${NC}"

# ==============================================================================
# PULL LATEST IMAGES
# ==============================================================================

echo "📥 Pulling latest Docker images..."

docker-compose -f docker-compose.production.yml pull

echo -e "${GREEN}✅ Images pulled${NC}"

# ==============================================================================
# BUILD IMAGES
# ==============================================================================

echo "🔨 Building Docker images..."

docker-compose -f docker-compose.production.yml build --no-cache

echo -e "${GREEN}✅ Images built${NC}"

# ==============================================================================
# RUN DATABASE MIGRATIONS
# ==============================================================================

echo "🔄 Running database migrations..."

docker-compose -f docker-compose.production.yml run --rm api-gateway npm run prisma:migrate deploy

echo -e "${GREEN}✅ Migrations completed${NC}"

# ==============================================================================
# START SERVICES
# ==============================================================================

echo "🚢 Starting services..."

docker-compose -f docker-compose.production.yml up -d

echo -e "${GREEN}✅ Services started${NC}"

# ==============================================================================
# HEALTH CHECKS
# ==============================================================================

echo "🏥 Running health checks..."

sleep 30  # Wait for services to start

# Check API Gateway
if curl -f http://localhost:3003/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API Gateway is healthy${NC}"
else
    echo -e "${RED}❌ API Gateway health check failed${NC}"
    echo "Rolling back..."
    docker-compose -f docker-compose.production.yml down
    exit 1
fi

# Check Promptfoo Service
if docker-compose -f docker-compose.production.yml exec -T promptfoo-service curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Promptfoo Service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Promptfoo Service health check failed${NC}"
fi

# Check Garak Service
if docker-compose -f docker-compose.production.yml exec -T garak-service curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Garak Service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Garak Service health check failed${NC}"
fi

# Check Strix Service
if docker-compose -f docker-compose.production.yml exec -T strix-service curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Strix Service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Strix Service health check failed${NC}"
fi

# Check PostgreSQL
if docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U airiskmgr > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is healthy${NC}"
else
    echo -e "${RED}❌ PostgreSQL health check failed${NC}"
    exit 1
fi

# Check Redis
if docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis health check failed${NC}"
    exit 1
fi

# ==============================================================================
# DEPLOYMENT COMPLETE
# ==============================================================================

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Services:"
echo "  - Frontend: http://localhost:3004 (if using Docker frontend)"
echo "  - API Gateway: http://localhost:3003"
echo "  - Grafana: http://localhost:3002"
echo "  - Prometheus: http://localhost:9090"
echo "  - Kibana: http://localhost:5601"
echo "  - MinIO Console: http://localhost:9001"
echo ""
echo "GitHub Webhook endpoint: http://your-domain.com:3005/webhook"
echo ""
echo "📊 View logs:"
echo "  docker-compose -f docker-compose.production.yml logs -f"
echo ""
echo "🔍 View metrics:"
echo "  Open http://localhost:3002 (Grafana) - admin / ${GRAFANA_PASSWORD}"
echo ""
