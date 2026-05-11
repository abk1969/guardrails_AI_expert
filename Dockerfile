# ========================================
# Stage 1: Development
# ========================================
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies first (layer caching optimization)
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy only necessary files for Vite (optimize build context)
COPY index.html ./
COPY index.tsx ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY public/ ./public/

# Copy source directories
COPY src/ ./src/
COPY components/ ./components/
COPY contexts/ ./contexts/
COPY hooks/ ./hooks/
COPY utils/ ./utils/
COPY types/ ./types/
COPY constants/ ./constants/
COPY services/ ./services/
COPY data/ ./data/

# Expose Vite dev server port
EXPOSE 3000

# Copy Docker-specific Vite config
COPY vite.config.docker.ts ./

# Start development server with Docker config
CMD ["npm", "run", "dev", "--", "--config", "vite.config.docker.ts", "--host", "0.0.0.0", "--port", "3000"]

# ========================================
# Stage 2: Build
# ========================================
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# ========================================
# Stage 3: Production
# ========================================
FROM nginx:alpine AS production

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY infrastructure/docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
