# 🚀 DEPLOYMENT CHECKLIST - UNIFIED AI PENTEST PLATFORM

## ✅ Pre-Deployment Verification

Date: ________________
Operator: ________________
Environment: ☐ Staging  ☐ Production

---

## 📋 Phase 1: Infrastructure Validation

### System Requirements
- [ ] Docker Engine ≥ 20.10 installed and running
- [ ] Docker Compose ≥ 2.0 installed
- [ ] Minimum 16 GB RAM available
- [ ] Minimum 50 GB disk space free
- [ ] Ports available: 3002, 3003, 3004, 3005, 5435, 6380, 8081, 8082, 9000, 9001, 9090, 5601, 9200

```bash
# Verify Docker
docker --version  # Expected: Docker version 20.10+
docker-compose --version  # Expected: Docker Compose version 2.0+
docker info  # Should show no errors

# Check available resources
docker system df
df -h  # Check disk space
free -h  # Check RAM (Linux)
```

### Files Present
- [ ] `docker-compose.production.yml` exists
- [ ] `.env.production.example` exists
- [ ] `scripts/deploy.sh` exists and is executable
- [ ] `infrastructure/monitoring/prometheus/prometheus.yml` exists
- [ ] `infrastructure/monitoring/prometheus/alerts.yml` exists
- [ ] `infrastructure/monitoring/grafana/provisioning/datasources/prometheus.yml` exists
- [ ] `backend/apps/github-sync-service/` complete (19 TypeScript files)

```bash
# Verify files
ls -la docker-compose.production.yml
ls -la .env.production.example
ls -la scripts/deploy.sh
ls -la infrastructure/monitoring/prometheus/
ls -la backend/apps/github-sync-service/src/
```

---

## 📋 Phase 2: Configuration

### Environment Variables
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] **DATABASE_URL** - PostgreSQL connection string configured
- [ ] **POSTGRES_PASSWORD** - Strong password set (min 16 chars)
- [ ] **REDIS_PASSWORD** - Strong password set (min 16 chars)
- [ ] **JWT_SECRET** - Strong secret set (min 32 chars)
- [ ] **ENCRYPTION_KEY** - 32-character encryption key set
- [ ] **GITHUB_WEBHOOK_SECRET** - Strong secret for webhooks
- [ ] **GEMINI_API_KEY** - Valid API key (if using Gemini)
- [ ] **OPENAI_API_KEY** - Valid API key (if using OpenAI)
- [ ] **GROQ_API_KEY** - Valid API key (if using Groq)
- [ ] **COHERE_API_KEY** - Valid API key (if using Cohere)
- [ ] **MINIO_ROOT_PASSWORD** - Strong password set
- [ ] **GRAFANA_PASSWORD** - Strong password set
- [ ] **CORS_ORIGIN** - Frontend URL configured
- [ ] **SLACK_WEBHOOK_URL** - Configured (optional)
- [ ] **SMTP credentials** - Configured (optional)

```bash
# Create production environment file
cp .env.production.example .env.production

# CRITICAL: Edit .env.production with real secrets
nano .env.production  # or vim, code, etc.

# Verify no placeholder values remain
grep -i "CHANGE_ME" .env.production  # Should return nothing
grep -i "your_" .env.production  # Should return nothing
```

### Security Checks
- [ ] All passwords are unique and strong (16+ chars, mixed case, numbers, symbols)
- [ ] No secrets committed to Git
- [ ] `.env.production` added to `.gitignore`
- [ ] GitHub webhook secret is cryptographically random
- [ ] API keys are valid and have appropriate rate limits

```bash
# Generate strong random passwords
openssl rand -base64 32  # Use for passwords
openssl rand -hex 32  # Use for encryption key
```

---

## 📋 Phase 3: GitHub Webhook Configuration

For each repository (Promptfoo, Garak, Strix):

### Repository: _____________________ (Promptfoo / Garak / Strix)

- [ ] Navigate to **Settings** → **Webhooks** → **Add webhook**
- [ ] **Payload URL**: `https://your-domain.com:3005/webhook`
- [ ] **Content type**: `application/json`
- [ ] **Secret**: Value from `GITHUB_WEBHOOK_SECRET` in `.env.production`
- [ ] **SSL verification**: Enable SSL verification
- [ ] **Events**: "Just the push event"
- [ ] **Filter**: Only tags matching `refs/tags/v*`
- [ ] **Active**: ✅ Checked
- [ ] Test webhook delivery (push a test tag)
- [ ] Verify webhook signature validation works

```bash
# Test webhook locally (replace variables)
PAYLOAD='{"ref":"refs/tags/v1.0.0","repository":{"full_name":"tool/repo","clone_url":"https://github.com/tool/repo.git"},"commits":[]}'
SECRET="your_webhook_secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST http://localhost:3005/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

---

## 📋 Phase 4: Network Configuration

### Firewall Rules
- [ ] Port 3003 (API Gateway) - Allow from frontend
- [ ] Port 3004 (Frontend) - Allow from users
- [ ] Port 3005 (GitHub Webhooks) - Allow from GitHub IP ranges
- [ ] Port 3002 (Grafana) - Restrict to admin IPs only
- [ ] Port 9090 (Prometheus) - Restrict to admin IPs only
- [ ] Port 5601 (Kibana) - Restrict to admin IPs only
- [ ] All other ports - Internal only (Docker networks)

### DNS Configuration
- [ ] Domain pointed to server IP
- [ ] SSL/TLS certificate installed (Let's Encrypt recommended)
- [ ] HTTPS redirect configured
- [ ] Webhook endpoint accessible from internet: `https://your-domain.com:3005/webhook`

---

## 📋 Phase 5: Deployment Execution

### Pre-Deployment Backup
- [ ] Database backup created (if upgrading existing installation)
- [ ] Configuration files backed up
- [ ] Backup location: _____________________

```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d-%H%M%S)

# Backup database (if exists)
docker-compose -f docker-compose.production.yml exec postgres \
  pg_dump -U airiskmgr -d airiskmgr_db -Fc > backups/$(date +%Y%m%d-%H%M%S)/db-backup.dump

# Backup config
cp .env.production backups/$(date +%Y%m%d-%H%M%S)/
```

### Deployment Steps
- [ ] Review deployment script: `cat scripts/deploy.sh`
- [ ] Make script executable: `chmod +x scripts/deploy.sh`
- [ ] Run deployment: `./scripts/deploy.sh`
- [ ] Monitor deployment logs
- [ ] Wait for all services to start (2-3 minutes)

```bash
# Execute deployment
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# Monitor logs
docker-compose -f docker-compose.production.yml logs -f
```

### Expected Deployment Output
- [ ] ✅ Pre-deployment checks passed
- [ ] ✅ Database backup completed
- [ ] ✅ Images pulled
- [ ] ✅ Images built
- [ ] ✅ Migrations completed
- [ ] ✅ Services started
- [ ] ✅ API Gateway health check passed
- [ ] ✅ PostgreSQL health check passed
- [ ] ✅ Redis health check passed
- [ ] ⚠️ Tool services health checks (may fail initially - normal)

---

## 📋 Phase 6: Health Checks

### Service Health Verification

#### 1. API Gateway
- [ ] HTTP health check: `curl http://localhost:3003/health`
- [ ] Expected response: `{"status":"ok"}`
- [ ] Response time: < 100ms

#### 2. PostgreSQL
- [ ] Connection test: `docker-compose -f docker-compose.production.yml exec postgres pg_isready -U airiskmgr`
- [ ] Expected: `accepting connections`

#### 3. Redis
- [ ] Connection test: `docker-compose -f docker-compose.production.yml exec redis redis-cli ping`
- [ ] Expected: `PONG`

#### 4. MinIO
- [ ] Web UI accessible: `http://localhost:9001`
- [ ] Login with `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`

#### 5. Prometheus
- [ ] Web UI accessible: `http://localhost:9090`
- [ ] Targets page shows all services: `http://localhost:9090/targets`
- [ ] Expected: 15 targets, most should be UP

#### 6. Grafana
- [ ] Web UI accessible: `http://localhost:3002`
- [ ] Login with `admin` / `GRAFANA_PASSWORD`
- [ ] Prometheus datasource configured

#### 7. Kibana
- [ ] Web UI accessible: `http://localhost:5601`
- [ ] Elasticsearch connection healthy

#### 8. GitHub Sync Service
- [ ] HTTP health check: `curl http://localhost:3005/health`
- [ ] Expected response: `{"status":"ok","service":"github-sync"}`

```bash
# Health check script
echo "🏥 Running health checks..."

echo -n "API Gateway: "
curl -f http://localhost:3003/health && echo "✅" || echo "❌"

echo -n "GitHub Sync: "
curl -f http://localhost:3005/health && echo "✅" || echo "❌"

echo -n "PostgreSQL: "
docker-compose -f docker-compose.production.yml exec -T postgres pg_isready -U airiskmgr && echo "✅" || echo "❌"

echo -n "Redis: "
docker-compose -f docker-compose.production.yml exec -T redis redis-cli ping && echo "✅" || echo "❌"

echo -n "Prometheus: "
curl -f http://localhost:9090/-/healthy && echo "✅" || echo "❌"

echo -n "Grafana: "
curl -f http://localhost:3002/api/health && echo "✅" || echo "❌"
```

---

## 📋 Phase 7: Functional Testing

### API Gateway Tests
- [ ] GET `/health` returns 200
- [ ] GET `/api/docs` shows Swagger documentation
- [ ] Authentication endpoint responds (if configured)

### GitHub Sync Service Tests
- [ ] GET `/health` returns 200
- [ ] GET `/status` returns deployment status
- [ ] POST `/webhook` validates signatures correctly

### Integration Tests
- [ ] Push test tag to GitHub repository
- [ ] Verify webhook received in logs
- [ ] Verify signature validation passed
- [ ] Verify deployment pipeline triggered
- [ ] Monitor deployment in Grafana

```bash
# Test webhook integration (after GitHub webhook configured)
# 1. Create and push a test tag
cd /path/to/promptfoo
git tag v1.0.0-test
git push origin v1.0.0-test

# 2. Monitor webhook handler logs
docker-compose -f docker-compose.production.yml logs -f github-sync

# 3. Verify deployment status
curl http://localhost:3005/status
```

---

## 📋 Phase 8: Monitoring Setup

### Prometheus
- [ ] Access Prometheus UI: `http://localhost:9090`
- [ ] Verify all targets are UP: `http://localhost:9090/targets`
- [ ] Check alert rules loaded: `http://localhost:9090/rules`
- [ ] Verify metrics scraping: Query `up{job="api-gateway"}`

### Grafana
- [ ] Access Grafana: `http://localhost:3002`
- [ ] Login with admin credentials
- [ ] Verify Prometheus datasource: Configuration → Data Sources
- [ ] Import default dashboards (optional)
- [ ] Create custom dashboard for GitHub Sync Service

### Alerting
- [ ] Verify Slack webhook works (if configured)
- [ ] Test email notifications (if configured)
- [ ] Configure PagerDuty integration (optional)
- [ ] Set up on-call schedule

```bash
# Test Slack notification manually
curl -X POST $SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text":"🚀 Test notification from AI Risk Manager"}'

# Test email notification (if SMTP configured)
docker-compose -f docker-compose.production.yml exec github-sync \
  node -e "require('./dist/notifications/email-notifier.service').EmailNotifierService.testConnection()"
```

---

## 📋 Phase 9: Security Validation

### Container Security
- [ ] No containers running as root: `docker-compose -f docker-compose.production.yml exec <service> whoami`
- [ ] Capabilities dropped: Inspect container security options
- [ ] No privileged containers: `docker ps --filter "label=privileged=true"` returns empty

### Network Security
- [ ] Verify network isolation: `docker network ls`
- [ ] Test database not accessible from internet
- [ ] Test Redis not accessible from internet
- [ ] Only frontend-network has internet access

### Secrets Security
- [ ] `.env.production` not readable by others: `ls -la .env.production` should show `-rw-------`
- [ ] No secrets in logs: `docker-compose logs | grep -i "password\|secret\|key"` (should show masked)
- [ ] Webhook signature validation working

```bash
# Set correct permissions on .env.production
chmod 600 .env.production

# Verify network isolation
docker network inspect backend-network | grep -i internal  # Should be true
docker network inspect frontend-network | grep -i internal  # Should be false
```

---

## 📋 Phase 10: Performance Testing

### Load Testing (Optional)
- [ ] Run load test on API Gateway (100 req/s for 1 min)
- [ ] Monitor CPU and memory usage
- [ ] Verify no degradation in response times
- [ ] Check for memory leaks over 10 minutes

### Scalability Testing (Optional)
- [ ] Deploy multiple tool service containers
- [ ] Verify load balancing works
- [ ] Test horizontal scaling

```bash
# Simple load test with Apache Bench (if installed)
ab -n 1000 -c 10 http://localhost:3003/health

# Monitor resource usage
docker stats
```

---

## 📋 Phase 11: Backup & Recovery

### Backup Strategy
- [ ] Automated database backups configured (cron job)
- [ ] Backup retention policy defined: _____ days
- [ ] Backup storage location secured
- [ ] Recovery procedure documented

### Recovery Test
- [ ] Stop all services
- [ ] Restore from backup
- [ ] Verify data integrity
- [ ] Document recovery time: _____ minutes

```bash
# Setup automated daily backup (cron)
# Add to crontab: 0 2 * * * /path/to/backup-script.sh

# Create backup script
cat > backup-script.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/$(date +\%Y\%m\%d)"
mkdir -p $BACKUP_DIR
cd /path/to/guardrails_AI_expert
docker-compose -f docker-compose.production.yml exec -T postgres \
  pg_dump -U airiskmgr -d airiskmgr_db -Fc > $BACKUP_DIR/db-backup.dump
cp .env.production $BACKUP_DIR/
# Delete backups older than 30 days
find /backups -type d -mtime +30 -exec rm -rf {} +
EOF

chmod +x backup-script.sh
```

---

## 📋 Phase 12: Documentation

### Documentation Complete
- [ ] Architecture diagram updated
- [ ] Deployment procedure documented
- [ ] Rollback procedure documented
- [ ] Troubleshooting guide created
- [ ] On-call runbook created
- [ ] Contact list updated

### Knowledge Transfer
- [ ] Team trained on deployment procedure
- [ ] Monitoring dashboards explained
- [ ] Alert handling procedures reviewed
- [ ] Rollback procedure practiced

---

## 📋 Phase 13: Go-Live Checklist

### Final Verification
- [ ] All health checks passing
- [ ] Monitoring active and alerting working
- [ ] Backup system operational
- [ ] Team notified of deployment
- [ ] Incident response team on standby
- [ ] Rollback plan ready

### Go-Live Sign-Off

**Deployment Date/Time**: ___________________
**Deployed By**: ___________________
**Approved By**: ___________________
**Status**: ☐ Successful  ☐ Failed  ☐ Rolled Back

### Post-Deployment Monitoring (First 24 Hours)
- [ ] Hour 1: Monitor all services
- [ ] Hour 2: Check error rates
- [ ] Hour 4: Verify no memory leaks
- [ ] Hour 8: Review logs for anomalies
- [ ] Hour 24: Performance report generated

---

## 🔥 Emergency Rollback Procedure

If critical issues occur:

```bash
# 1. Stop deployment immediately
docker-compose -f docker-compose.production.yml down

# 2. Restore database from backup
docker-compose -f docker-compose.production.yml up -d postgres
docker-compose -f docker-compose.production.yml exec -T postgres \
  pg_restore -U airiskmgr -d airiskmgr_db -c /backups/latest/db-backup.dump

# 3. Revert to previous version
git checkout <previous-commit>
./scripts/deploy.sh

# 4. Notify team
# Use Slack/Email to notify incident

# 5. Post-mortem
# Document what went wrong and lessons learned
```

---

## 📞 Support Contacts

**Technical Lead**: ___________________
**DevOps Team**: ___________________
**On-Call Engineer**: ___________________
**Emergency Hotline**: ___________________

---

## ✅ Deployment Completion

**All checks passed**: ☐ Yes  ☐ No

**If No, document issues**:
___________________________________________
___________________________________________
___________________________________________

**Deployment Status**: ☐ Production  ☐ Staging  ☐ Rolled Back

**Signature**: ___________________ Date: ___________

---

**Generated by Claude Code - Enterprise AI Pentest Platform**
**Version**: 1.0.0
**Last Updated**: 2025-11-05
