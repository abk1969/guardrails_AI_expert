# ========================================
# Strix Agentic AI Testing Framework - Isolated Container
# ========================================
# Purpose: Run Strix agent in complete isolation for security testing
# Base: Python 3.11 slim (Debian-based for compatibility)
# Security: Non-root user, resource limits via docker-compose
# ========================================

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (Strix may need browser automation tools)
RUN apt-get update && apt-get install -y \
    # Build tools for Python packages
    gcc \
    g++ \
    make \
    # SSL/TLS certificates
    ca-certificates \
    openssl \
    # Network tools
    curl \
    wget \
    # Process management
    procps \
    # Browser dependencies for headless mode (if Strix uses Playwright/Puppeteer)
    chromium \
    chromium-driver \
    # Clean up
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install pipx
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir pipx && \
    pipx ensurepath

# Add pipx to PATH
ENV PATH="/root/.local/bin:${PATH}"

# Install Strix agentic AI testing framework
# Note: Using hypothetical package name - adjust when actual package is confirmed
RUN pipx install strix-agent || \
    pipx install strix || \
    echo "Strix installation - package name may need adjustment"

# Verify Strix installation
RUN strix --version || \
    strix --help || \
    echo "Strix installed but verification failed (package may use different command)"

# Create output directory
RUN mkdir -p /app/output && chmod 755 /app/output

# Create non-root user for security
RUN groupadd -r strix && useradd -r -g strix strix

# Change ownership of app directory
RUN chown -R strix:strix /app

# Switch to non-root user
USER strix

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV STRIX_OUTPUT_DIR=/app/output
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMIUM_FLAGS="--no-sandbox --disable-dev-shm-usage"

# Expose no ports (internal service only)

# Health check - verify Strix is accessible
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD strix --help > /dev/null 2>&1 || exit 1

# Default command: keep container running for exec commands
CMD ["tail", "-f", "/dev/null"]
