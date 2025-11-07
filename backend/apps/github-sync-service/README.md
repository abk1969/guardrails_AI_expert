# GitHub Sync Service

Automated GitHub repository synchronization and deployment service for the AI Risk Manager unified pentest platform.

## Overview

This service automatically:
1. Listens to GitHub webhooks from Promptfoo, Garak, and Strix repositories
2. Clones and builds new versions when tags are pushed
3. Runs automated tests
4. Deploys using blue-green deployment strategy
5. Performs health checks and automatic rollback on failures
6. Sends notifications via Slack and Email

## Architecture

```
GitHub Repositories (Promptfoo, Garak, Strix)
  ↓ (webhook on tag push)
WebhookHandler
  ↓ (validate signature)
  ↓ (clone repository)
DockerBuilderService
  ↓ (build Docker image)
TestRunnerService
  ↓ (run tests + smoke tests)
BlueGreenDeployerService
  ↓ (deploy to staging)
  ↓ (smoke tests)
  ↓ (deploy to production)
HealthCheckerService
  ↓ (health checks + error rate monitoring)
  ↓ (rollback if needed)
RollbackService
  ↓ (notifications)
SlackNotifierService + EmailNotifierService
```

## Components

### Core Services

- **GitHubSyncService**: Main orchestration service with Bull queue
- **GitHubSyncController**: REST API endpoints for webhooks and status
- **WebhookHandler**: Processes GitHub webhook events (14-step pipeline)
- **SignatureValidator**: Validates GitHub webhook signatures (HMAC SHA-256)

### Deployment Services

- **BlueGreenDeployerService**: Implements zero-downtime blue-green deployment
- **HealthCheckerService**: HTTP health checks and Docker health status monitoring
- **RollbackService**: Automatic rollback to previous version on failure

### Testing Services

- **TestRunnerService**: Runs automated tests and tool-specific smoke tests
  - Promptfoo: Basic prompt evaluation
  - Garak: Quick scan with test.Blank probe
  - Strix: Agent initialization test

### Version Management

- **VersionManagerService**: Tracks deployed versions
- **SemverParser**: Parses and compares semantic versions
- **ChangelogGenerator**: Generates conventional commit changelogs

### Docker Services

- **DockerBuilderService**: Builds Docker images with BuildKit
- **DockerfileGenerator**: Generates tool-specific Dockerfiles
- **ImageRegistryService**: Push/pull images from registry

### Notification Services

- **SlackNotifierService**: Sends Slack notifications for deployments, failures, rollbacks
- **EmailNotifierService**: Sends email notifications with HTML templates

## API Endpoints

### Health Check
```bash
GET /health
```

Returns service health status.

### Webhook Endpoint
```bash
POST /webhook
Headers:
  X-Hub-Signature-256: sha256=<signature>
Body: <GitHub webhook payload>
```

Receives GitHub webhook events.

### Rollback
```bash
POST /rollback/:tool
Body: { "tool": "promptfoo" | "garak" | "strix" }
```

Triggers manual rollback to previous version.

### Deployment Status
```bash
GET /status
```

Returns current deployment status for all tools.

## Configuration

### Environment Variables

```bash
# GitHub
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# Docker Registry
DOCKER_REGISTRY=registry.gitlab.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# Notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EMAIL_FROM=noreply@domain.com
EMAIL_TO=admin@domain.com,team@domain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## GitHub Webhook Setup

### 1. Configure Webhook in GitHub Repository

For each repository (Promptfoo, Garak, Strix):

1. Go to **Settings** → **Webhooks** → **Add webhook**
2. **Payload URL**: `https://your-domain.com:3005/webhook`
3. **Content type**: `application/json`
4. **Secret**: Your `GITHUB_WEBHOOK_SECRET`
5. **Events**: Select "Push events" and filter by tags (`refs/tags/*`)
6. **Active**: ✅

### 2. Test Webhook

Push a new tag to trigger the webhook:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The service will:
1. Receive webhook
2. Validate signature
3. Clone repository
4. Build Docker image
5. Run tests
6. Deploy to staging
7. Run smoke tests
8. Deploy to production (blue-green)
9. Verify health checks
10. Send notifications

## Deployment Workflow

### Automatic Deployment (14 Steps)

1. **Webhook Received**: GitHub sends webhook on tag push
2. **Signature Validation**: HMAC SHA-256 signature verification
3. **Tool Identification**: Determine tool from repository name
4. **Version Parsing**: Extract semantic version from tag
5. **Repository Clone**: Clone repository to `/tmp/repos/<tool>-<version>`
6. **Docker Build**: Build Docker image with version tag
7. **Registry Push**: Push image to container registry
8. **Automated Tests**: Run Jest/Pytest tests in isolated container
9. **Staging Deployment**: Deploy to staging environment
10. **Smoke Tests**: Run tool-specific smoke tests
11. **Production Deployment**: Blue-green deployment to production
12. **Health Checks**: 30s warm-up + HTTP health checks
13. **Error Rate Monitoring**: Monitor error rate (rollback if >5%)
14. **Cleanup**: Remove old containers, keep last 5 versions

### Manual Rollback

```bash
curl -X POST http://localhost:3005/rollback/promptfoo \
  -H "Content-Type: application/json" \
  -d '{"tool":"promptfoo"}'
```

Rollback completes in **< 30 seconds**.

## Blue-Green Deployment Strategy

### How It Works

1. **Current State**: Container running with color tag (e.g., `blue`)
2. **New Deployment**: New container created with opposite color (e.g., `green`)
3. **Health Check**: Wait for new container to become healthy (60s timeout)
4. **Warm-up**: 30-second warm-up period
5. **Error Rate Check**: Monitor error rate for 30 seconds
6. **Switch**: If healthy and error rate < 5%, swap load balancer
7. **Cleanup**: Remove old container
8. **Rollback**: If unhealthy or high error rate, automatic rollback

### Color Switching

The active color is determined by the `COLOR` environment variable:
- `COLOR=blue` → Active: blue, New: green
- `COLOR=green` → Active: green, New: blue

After successful deployment, the `COLOR` variable is updated.

## Monitoring

### Prometheus Metrics

The service exposes metrics for monitoring:

- `deployments_total{tool, status}` - Total deployments
- `deployment_duration_seconds{tool}` - Deployment duration
- `rollbacks_total{tool}` - Total rollbacks
- `health_checks_total{service, status}` - Health check results
- `tool_versions{tool, version}` - Currently deployed versions

### Logs

View logs with Docker Compose:

```bash
docker-compose -f docker-compose.production.yml logs -f github-sync
```

### Notifications

#### Slack Notifications

- **Deployment Started**: ⏳ In Progress
- **Deployment Success**: ✅ With duration
- **Deployment Failed**: ❌ With error details
- **Rollback Executed**: ⚠️ Version changes
- **Health Check Failed**: 🚨 Service alerts

#### Email Notifications

HTML email templates for:
- Deployment success/failure
- Rollback events
- Health check failures

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Build
npm run build

# Run tests
npm run test
```

### Docker Development

```bash
# Build development image
docker build --target development -t github-sync:dev .

# Run development container
docker run -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e GITHUB_WEBHOOK_SECRET=dev-secret \
  github-sync:dev
```

## Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test:e2e
```

### Manual Testing

Test webhook locally:

```bash
# Generate signature
PAYLOAD='{"ref":"refs/tags/v1.0.0","repository":{"full_name":"promptfoo/promptfoo","clone_url":"https://github.com/promptfoo/promptfoo.git"},"commits":[]}'
SECRET="your_webhook_secret"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# Send webhook
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \
  -d "$PAYLOAD"
```

## Troubleshooting

### Deployment Fails

1. Check logs: `docker-compose logs -f github-sync`
2. Verify environment variables in `.env.production`
3. Check GitHub webhook delivery in repository settings
4. Verify signature secret matches

### Health Checks Fail

1. Check container logs: `docker logs <container-name>`
2. Verify health check endpoint: `curl http://localhost:3000/health`
3. Check resource limits (CPU, memory)

### Rollback Not Working

1. Verify previous container exists
2. Check Docker socket permissions
3. Review rollback logs

### No Notifications

1. Verify `SLACK_WEBHOOK_URL` or SMTP credentials
2. Check network connectivity
3. Test connection: `EmailNotifierService.testConnection()`

## Security

### Webhook Signature Validation

All webhooks are validated using HMAC SHA-256:

```typescript
const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
hmac.update(payload);
const expectedSignature = hmac.digest('hex');
```

### Container Security

- **No privileged mode**: Even for Docker-in-Docker operations
- **Capability dropping**: `cap_drop: ALL`, minimal `cap_add`
- **Security options**: `no-new-privileges:true`
- **Resource limits**: CPU and memory constraints

### Network Isolation

- **Frontend network**: Internet access (webhooks only)
- **Backend network**: Internal services only
- **No direct database access**: Isolated database network

## Production Checklist

- [ ] Configure `GITHUB_WEBHOOK_SECRET` in `.env.production`
- [ ] Setup GitHub webhooks for all 3 repositories
- [ ] Configure Docker registry credentials
- [ ] Setup Slack webhook URL (optional)
- [ ] Configure SMTP credentials (optional)
- [ ] Verify Docker socket access
- [ ] Test webhook signature validation
- [ ] Run smoke tests for all tools
- [ ] Monitor Prometheus metrics
- [ ] Configure alerting (PagerDuty, etc.)

## License

Proprietary - AI Risk Manager Platform

## Support

For issues and questions, contact the AI Risk Manager team.
