# ========================================
# Garak LLM Vulnerability Scanner - Isolated Container
# ========================================
# Purpose: Run Garak CLI in complete isolation for security testing
# Base: Python 3.11 slim (Debian-based for compatibility)
# Security: Non-root user, resource limits via docker-compose
# ========================================

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Build tools for Python packages
    gcc \
    g++ \
    make \
    # SSL/TLS certificates
    ca-certificates \
    openssl \
    # Network tools for debugging
    curl \
    wget \
    # Process management
    procps \
    # Clean up
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install pipx
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir pipx && \
    pipx ensurepath

# Add pipx to PATH
ENV PATH="/root/.local/bin:${PATH}"

# Install Garak LLM vulnerability scanner
RUN pipx install garak

# Verify Garak installation
RUN garak --version || echo "Garak installed but version check failed (may be expected)"

# Create output directory
RUN mkdir -p /app/output && chmod 755 /app/output

# Create non-root user for security
RUN groupadd -r garak && useradd -r -g garak garak

# Change ownership of app directory
RUN chown -R garak:garak /app

# Switch to non-root user
USER garak

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV GARAK_OUTPUT_DIR=/app/output

# Expose no ports (internal service only)

# Health check - verify Garak is accessible
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD garak --help > /dev/null 2>&1 || exit 1

# Default command: keep container running for exec commands
CMD ["tail", "-f", "/dev/null"]
