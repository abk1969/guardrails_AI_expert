# Quick Installation Script for AI RISK MANAGER
# Simple version without special characters

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('standalone', 'fullstack', 'docker')]
    [string]$Mode = 'standalone'
)

$ErrorActionPreference = "Stop"

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Warning2 {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

function Write-Error2 {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

function Write-Title {
    param([string]$Text)
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Magenta
    Write-Host "  $Text" -ForegroundColor Magenta
    Write-Host "============================================" -ForegroundColor Magenta
    Write-Host ""
}

Clear-Host
Write-Title "AI RISK MANAGER - Installation"

Write-Info "Mode: $Mode"
Write-Host ""

# Check Node.js
Write-Info "Checking Node.js..."
try {
    $nodeVersion = node --version
    Write-Success "[OK] Node.js $nodeVersion"
} catch {
    Write-Error2 "[ERROR] Node.js not found"
    exit 1
}

# Check npm
Write-Info "Checking npm..."
try {
    $npmVersion = npm --version
    Write-Success "[OK] npm v$npmVersion"
} catch {
    Write-Error2 "[ERROR] npm not found"
    exit 1
}

# Install frontend dependencies
Write-Title "Installing Frontend Dependencies"
Write-Info "Running npm install..."
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Success "[OK] Frontend dependencies installed"
} else {
    Write-Error2 "[ERROR] npm install failed"
    exit 1
}

# Create .env if not exists
if (-not (Test-Path ".env")) {
    Write-Info "Creating .env file..."
    $envContent = @"
GEMINI_API_KEY=your_gemini_key_here
VITE_API_URL=http://localhost:3003/api/v1
VITE_WS_URL=ws://localhost:3003
VITE_MCP_API_URL=http://localhost:3003/api/v1/mcp
VITE_MCP_MOCK_MODE=false
"@
    Set-Content -Path ".env" -Value $envContent
    Write-Success "[OK] .env file created"
    Write-Warning2 "[IMPORTANT] Edit .env and add your GEMINI_API_KEY"
} else {
    Write-Success "[OK] .env file already exists"
}

if ($Mode -eq 'fullstack' -or $Mode -eq 'docker') {
    # Install backend dependencies
    Write-Title "Installing Backend Dependencies"
    if (Test-Path "backend/package.json") {
        Push-Location backend
        Write-Info "Running npm install in backend..."
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Success "[OK] Backend dependencies installed"
        } else {
            Write-Error2 "[ERROR] Backend npm install failed"
            Pop-Location
            exit 1
        }
        Pop-Location
    }

    # Create backend .env
    if (-not (Test-Path "backend/.env")) {
        Write-Info "Creating backend/.env file..."
        $backendEnv = @"
DATABASE_URL=postgresql://airiskmgr:airiskmgr_dev_password@localhost:5435/airiskmgr_db
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=redis_dev_password
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
ENCRYPTION_KEY=dev-32-char-encryption-key-here
CORS_ORIGIN=http://localhost:3004
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
NODE_ENV=development
PORT=3001
"@
        New-Item -Path "backend" -ItemType Directory -Force | Out-Null
        Set-Content -Path "backend/.env" -Value $backendEnv
        Write-Success "[OK] backend/.env created"
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""

switch ($Mode) {
    'standalone' {
        Write-Info "Next steps:"
        Write-Info "  1. Edit .env and add your GEMINI_API_KEY"
        Write-Info "  2. Run: npm run dev"
        Write-Info "  3. Open: http://localhost:5080"
    }
    'fullstack' {
        Write-Info "Next steps:"
        Write-Info "  1. Edit .env files with your API keys"
        Write-Info "  2. Start PostgreSQL and Redis: docker-compose up -d postgres redis"
        Write-Info "  3. Start backend: cd backend && npm run start:dev"
        Write-Info "  4. Start frontend: npm run dev"
    }
    'docker' {
        Write-Info "Next steps:"
        Write-Info "  1. Edit .env files with your API keys"
        Write-Info "  2. Start all services: docker-compose up -d"
        Write-Info "  3. Open: http://localhost:3004"
    }
}

Write-Host ""
