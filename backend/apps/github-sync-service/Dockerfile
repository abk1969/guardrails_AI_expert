# Multi-stage Dockerfile for GitHub Sync Service

# ==============================================================================
# Stage 1: Dependencies
# ==============================================================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --workspace=backend

# ==============================================================================
# Stage 2: Builder
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules

# Copy source code
COPY backend/ ./backend/
COPY tsconfig*.json ./

# Build the service
RUN npm run build --workspace=backend/apps/github-sync-service

# ==============================================================================
# Stage 3: Development
# ==============================================================================
FROM node:20-alpine AS development

WORKDIR /app

# Install Docker CLI
RUN apk add --no-cache docker-cli curl

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules

# Copy source code
COPY backend/ ./backend/
COPY tsconfig*.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run in development mode
CMD ["npm", "run", "start:dev", "--workspace=backend/apps/github-sync-service"]

# ==============================================================================
# Stage 4: Production
# ==============================================================================
FROM node:20-alpine AS production

WORKDIR /app

# Install Docker CLI and curl
RUN apk add --no-cache docker-cli curl git

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/backend/node_modules ./backend/node_modules

# Copy built files
COPY --from=builder /app/backend/apps/github-sync-service/dist ./backend/apps/github-sync-service/dist

# Copy package.json files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Create directories for repositories and changelogs
RUN mkdir -p /tmp/repos /tmp/changelogs && chown -R nodejs:nodejs /tmp/repos /tmp/changelogs

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV SERVICE_PORT=3000

# Run the service
CMD ["node", "backend/apps/github-sync-service/dist/main.js"]
