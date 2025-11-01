# ========================================
# Stage 1: Development
# ========================================
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy Prisma schema first
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Start development server
CMD ["pnpm", "run", "start:dev", "test-execution-service"]

# ========================================
# Stage 2: Build
# ========================================
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies for building native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN pnpm run build test-execution-service

# ========================================
# Stage 3: Production
# ========================================
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/apps/test-execution-service/main.js"]
