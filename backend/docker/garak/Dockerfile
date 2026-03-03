# ========================================
# Garak LLM Vulnerability Scanner - Isolated Container
# ========================================
# Purpose: Run Garak CLI in complete isolation for security testing
# Base: Python 3.11 slim (Debian-based for compatibility)
# Security: Non-root user, resource limits via docker-compose
# Execution: Long-running container, invoked via docker exec from API Gateway
# ========================================

FROM python:3.11-slim

# Version pinning for reproducible builds
ARG GARAK_VERSION=0.14.0

LABEL maintainer="AI Risk Manager <airiskmgr@globacom3000.com>"
LABEL description="Garak LLM Vulnerability Scanner - Isolated pentest container"
LABEL version="${GARAK_VERSION}"
LABEL org.opencontainers.image.source="https://github.com/NVIDIA/garak"
LABEL org.opencontainers.image.title="airiskmgr-garak-runner"

# Set working directory
WORKDIR /app

# Install system dependencies and clean up in single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    ca-certificates \
    openssl \
    curl \
    wget \
    procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Upgrade pip and install pinned Garak version
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir garak==${GARAK_VERSION} && \
    pip cache purge 2>/dev/null || true

# Verify Garak installation
RUN python -c "import garak; print(f'Garak {garak.__version__} installed successfully')"

# Create output directory
RUN mkdir -p /app/output && chmod 755 /app/output

# Create non-root user for security with home directory
RUN groupadd -r garak && useradd -r -g garak -m -d /home/garak garak

# Create Garak config directory with proper permissions
RUN mkdir -p /home/garak/.config/garak && \
    chown -R garak:garak /home/garak

# Change ownership of app directory
RUN chown -R garak:garak /app

# Switch to non-root user
USER garak

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV GARAK_OUTPUT_DIR=/app/output

# Expose no ports (internal service only)

# Health check - verify Garak module is importable (faster and more reliable than --help)
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD python -c "import garak" || exit 1

# Default command: keep container running for exec commands
CMD ["tail", "-f", "/dev/null"]
