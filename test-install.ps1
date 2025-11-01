#!/usr/bin/env pwsh
# Test simple d'installation

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param([string]$Message, [string]$Type = 'Info')
    $color = switch ($Type) {
        'Success' { 'Green' }
        'Error'   { 'Red' }
        'Warning' { 'Yellow' }
        'Info'    { 'Cyan' }
        'Header'  { 'Magenta' }
        default   { 'White' }
    }
    Write-Host $Message -ForegroundColor $color
}

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-ColorOutput "================================================" -Type Header
    Write-ColorOutput "  $Text" -Type Header
    Write-ColorOutput "================================================" -Type Header
    Write-Host ""
}

Write-Host ""
Write-ColorOutput "╔════════════════════════════════════════════════╗" -Type Header
Write-ColorOutput "║      AI RISK MANAGER - Test Installation       ║" -Type Header
Write-ColorOutput "╚════════════════════════════════════════════════╝" -Type Header
Write-Host ""

Write-Header "Vérification de l'Environnement"

# Test Node.js
Write-ColorOutput "⚙️  Vérification de Node.js..." -Type Info
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-ColorOutput "✓ Node.js $nodeVersion installé" -Type Success
} else {
    Write-ColorOutput "✗ Node.js n'est pas installé" -Type Error
}

# Test npm
Write-ColorOutput "⚙️  Vérification de npm..." -Type Info
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-ColorOutput "✓ npm v$npmVersion installé" -Type Success
} else {
    Write-ColorOutput "✗ npm n'est pas installé" -Type Error
}

# Test Docker
Write-ColorOutput "⚙️  Vérification de Docker..." -Type Info
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVersion = docker --version
    Write-ColorOutput "✓ Docker installé: $dockerVersion" -Type Success
} else {
    Write-ColorOutput "⚠️  Docker n'est pas installé" -Type Warning
}

Write-Header "Vérification des Fichiers"

# Vérifier package.json
if (Test-Path "package.json") {
    Write-ColorOutput "✓ package.json trouvé" -Type Success
} else {
    Write-ColorOutput "✗ package.json introuvable" -Type Error
}

# Vérifier backend
if (Test-Path "backend/package.json") {
    Write-ColorOutput "✓ backend/package.json trouvé" -Type Success
} else {
    Write-ColorOutput "⚠️  backend/package.json introuvable" -Type Warning
}

# Vérifier docker-compose
if (Test-Path "docker-compose.yml") {
    Write-ColorOutput "✓ docker-compose.yml trouvé" -Type Success
} else {
    Write-ColorOutput "⚠️  docker-compose.yml introuvable" -Type Warning
}

Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
Write-ColorOutput "Test terminé! ✨" -Type Success
Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
Write-Host ""

Write-ColorOutput "Pour installer:" -Type Info
Write-ColorOutput "  1. Mode Standalone: npm install && npm run dev" -Type Info
Write-ColorOutput "  2. Mode Docker: docker-compose up -d" -Type Info
Write-Host ""
