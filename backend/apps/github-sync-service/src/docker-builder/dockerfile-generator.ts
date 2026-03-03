import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

type ToolName = 'promptfoo' | 'garak';

@Injectable()
export class DockerfileGenerator {
  private readonly logger = new Logger(DockerfileGenerator.name);

  async generate(tool: ToolName, repositoryPath: string): Promise<string> {
    this.logger.log(`Generating Dockerfile for ${tool}...`);

    const dockerfile = this.getDockerfileContent(tool);
    const dockerfilePath = path.join(repositoryPath, 'Dockerfile.service');

    await fs.writeFile(dockerfilePath, dockerfile, 'utf-8');

    this.logger.log(`✅ Dockerfile generated at ${dockerfilePath}`);

    return dockerfilePath;
  }

  private getDockerfileContent(tool: ToolName): string {
    switch (tool) {
      case 'promptfoo':
        return this.getPromptfooDockerfile();

      case 'garak':
        return this.getGarakDockerfile();

      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  private getPromptfooDockerfile(): string {
    return `# Multi-stage Dockerfile for Promptfoo Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy source code
COPY . .

# Build if needed
RUN npm run build || echo "No build step"

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create results directory
RUN mkdir -p /app/results

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Expose port
EXPOSE 3000

# Run service
CMD ["node", "dist/main.js"]
`;
  }

  private getGarakDockerfile(): string {
    return `# Multi-stage Dockerfile for Garak Service
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    g++ \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim AS production

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /root/.local /root/.local

# Make sure scripts in .local are usable
ENV PATH=/root/.local/bin:$PATH

# Copy source code
COPY . .

# Create results and cache directories
RUN mkdir -p /app/results /root/.cache/garak

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \\
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:3000/health')"

# Expose port
EXPOSE 3000

# Run service
CMD ["python", "service/main.py"]
`;
  }

}
