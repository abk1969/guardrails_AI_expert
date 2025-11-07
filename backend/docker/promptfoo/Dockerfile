# ========================================
# Promptfoo LLM Testing Framework - Isolated Container
# ========================================
# Purpose: Run Promptfoo CLI in complete isolation for prompt testing
# Base: Node.js 20 slim (Debian-based for compatibility)
# Security: Non-root user, resource limits via docker-compose
# ========================================

FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # SSL/TLS certificates
    ca-certificates \
    openssl \
    # Network tools for debugging
    curl \
    wget \
    # Process management
    procps \
    # Git (Promptfoo may need it for remote configs)
    git \
    # Clean up
    && rm -rf /var/lib/apt/lists/*

# Install Promptfoo globally
RUN npm install -g promptfoo

# Verify Promptfoo installation
RUN promptfoo --version

# Create output directory
RUN mkdir -p /app/output && \
    mkdir -p /app/configs && \
    chmod 755 /app/output /app/configs

# Create non-root user for security
RUN groupadd -r promptfoo && useradd -r -g promptfoo promptfoo

# Change ownership of app directory
RUN chown -R promptfoo:promptfoo /app

# Switch to non-root user
USER promptfoo

# Set environment variables
ENV NODE_ENV=production
ENV PROMPTFOO_OUTPUT_DIR=/app/output
ENV PROMPTFOO_CONFIG_DIR=/app/configs

# Expose no ports (internal service only)

# Health check - verify Promptfoo is accessible
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD promptfoo --version > /dev/null 2>&1 || exit 1

# Default command: keep container running for exec commands
CMD ["tail", "-f", "/dev/null"]
