# ========================================
# Promptfoo LLM Testing Framework - Isolated Container
# ========================================
# Purpose: Run Promptfoo CLI in complete isolation for prompt testing
# Base: Node.js 20 slim (Debian-based for compatibility)
# Security: Non-root user, resource limits via docker-compose
# Execution: Long-running container, invoked via docker exec from API Gateway
# ========================================

FROM node:20-slim

# Version pinning for reproducible builds
ARG PROMPTFOO_VERSION=0.120.26

LABEL maintainer="AI Risk Manager <airiskmgr@globacom3000.com>"
LABEL description="Promptfoo LLM Testing Framework - Isolated pentest container"
LABEL version="${PROMPTFOO_VERSION}"
LABEL org.opencontainers.image.source="https://github.com/promptfoo/promptfoo"
LABEL org.opencontainers.image.title="airiskmgr-promptfoo-runner"

# Set working directory
WORKDIR /app

# Install system dependencies and clean up in single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    openssl \
    curl \
    wget \
    procps \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install pinned Promptfoo version globally
RUN npm install -g promptfoo@${PROMPTFOO_VERSION} && \
    npm cache clean --force

# Verify Promptfoo installation
RUN promptfoo --version

# Create output and config directories
RUN mkdir -p /app/output && \
    mkdir -p /app/configs && \
    chmod 755 /app/output /app/configs

# Create non-root user for security
RUN groupadd -r promptfoo && useradd -r -g promptfoo -m -d /home/promptfoo promptfoo

# Change ownership of app directory
RUN chown -R promptfoo:promptfoo /app

# Switch to non-root user
USER promptfoo

# Set environment variables
ENV NODE_ENV=production
ENV PROMPTFOO_OUTPUT_DIR=/app/output
ENV PROMPTFOO_CONFIG_DIR=/app/configs

# Expose no ports (internal service only)

# Health check - verify Promptfoo CLI responds (--version is fast and validates the install)
HEALTHCHECK --interval=60s --timeout=10s --start-period=15s --retries=3 \
  CMD promptfoo --version > /dev/null 2>&1 || exit 1

# Default command: keep container running for exec commands
CMD ["tail", "-f", "/dev/null"]
