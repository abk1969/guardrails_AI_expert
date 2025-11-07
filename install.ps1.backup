#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script d'installation complet pour AI RISK MANAGER
.DESCRIPTION
    Installe et configure tous les services frontend et backend du projet AI RISK MANAGER
    Supporte les modes standalone (frontend seul) et full-stack (frontend + backend + Docker)
.PARAMETER Mode
    Mode d'installation: 'standalone', 'fullstack', ou 'docker'
.PARAMETER SkipDependencies
    Ignore la vérification des prérequis
.EXAMPLE
    .\install.ps1 -Mode standalone
    .\install.ps1 -Mode fullstack
    .\install.ps1 -Mode docker
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('standalone', 'fullstack', 'docker')]
    [string]$Mode = '',

    [Parameter(Mandatory=$false)]
    [switch]$SkipDependencies
)

# Configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Couleurs pour l'affichage
function Write-ColorOutput {
    param(
        [string]$Message,
        [ValidateSet('Success', 'Error', 'Warning', 'Info', 'Header')]
        [string]$Type = 'Info'
    )

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

function Test-CommandExists {
    param([string]$Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    } catch {
        return $false
    }
    return $false
}

function Get-NodeVersion {
    try {
        $version = node --version 2>$null
        if ($version -match 'v(\d+)\.(\d+)\.(\d+)') {
            return [int]$Matches[1]
        }
    } catch {
        return 0
    }
    return 0
}

function Get-NpmVersion {
    try {
        $version = npm --version 2>$null
        if ($version -match '(\d+)\.(\d+)\.(\d+)') {
            return [int]$Matches[1]
        }
    } catch {
        return 0
    }
    return 0
}

function Test-Prerequisites {
    Write-Header "Vérification des prérequis"

    $allOk = $true

    # Vérifier Node.js
    Write-ColorOutput "⚙️  Vérification de Node.js..." -Type Info
    if (Test-CommandExists "node") {
        $nodeVersion = Get-NodeVersion
        if ($nodeVersion -ge 18) {
            Write-ColorOutput "✓ Node.js v$nodeVersion installé" -Type Success
        } else {
            Write-ColorOutput "✗ Node.js version $nodeVersion détectée. Version 18+ requise." -Type Error
            $allOk = $false
        }
    } else {
        Write-ColorOutput "✗ Node.js n'est pas installé. Version 18+ requise." -Type Error
        Write-ColorOutput "  Télécharger: https://nodejs.org/" -Type Warning
        $allOk = $false
    }

    # Vérifier npm
    Write-ColorOutput "⚙️  Vérification de npm..." -Type Info
    if (Test-CommandExists "npm") {
        $npmVersion = Get-NpmVersion
        if ($npmVersion -ge 9) {
            Write-ColorOutput "✓ npm v$npmVersion installé" -Type Success
        } else {
            Write-ColorOutput "✗ npm version $npmVersion détectée. Version 9+ requise." -Type Error
            $allOk = $false
        }
    } else {
        Write-ColorOutput "✗ npm n'est pas installé" -Type Error
        $allOk = $false
    }

    # Vérifier Docker (optionnel pour mode standalone)
    if ($Mode -eq 'docker' -or $Mode -eq 'fullstack') {
        Write-ColorOutput "⚙️  Vérification de Docker..." -Type Info
        if (Test-CommandExists "docker") {
            try {
                $dockerVersion = docker --version
                Write-ColorOutput "✓ Docker installé: $dockerVersion" -Type Success

                # Vérifier si Docker est en cours d'exécution
                docker ps 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "✓ Docker est en cours d'exécution" -Type Success
                } else {
                    Write-ColorOutput "✗ Docker est installé mais n'est pas démarré" -Type Error
                    Write-ColorOutput "  Démarrez Docker Desktop et réessayez" -Type Warning
                    $allOk = $false
                }
            } catch {
                Write-ColorOutput "✗ Erreur lors de la vérification de Docker" -Type Error
                $allOk = $false
            }
        } else {
            Write-ColorOutput "✗ Docker n'est pas installé (requis pour mode fullstack/docker)" -Type Error
            Write-ColorOutput "  Télécharger: https://www.docker.com/products/docker-desktop" -Type Warning
            $allOk = $false
        }

        # Vérifier docker-compose
        Write-ColorOutput "⚙️  Vérification de docker-compose..." -Type Info
        if (Test-CommandExists "docker-compose") {
            $composeVersion = docker-compose --version
            Write-ColorOutput "✓ docker-compose installé: $composeVersion" -Type Success
        } else {
            Write-ColorOutput "✗ docker-compose n'est pas installé" -Type Error
            $allOk = $false
        }
    }

    if (-not $allOk) {
        Write-ColorOutput "`n❌ Des prérequis sont manquants. Installation interrompue." -Type Error
        exit 1
    }

    Write-ColorOutput "`n✓ Tous les prérequis sont satisfaits!" -Type Success
}

function Install-FrontendDependencies {
    Write-Header "Installation des dépendances Frontend"

    if (Test-Path "package.json") {
        Write-ColorOutput "📦 Installation des packages npm (frontend)..." -Type Info
        try {
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✓ Dépendances frontend installées avec succès" -Type Success

                # Vérifier les dépendances critiques
                Write-ColorOutput "🔍 Vérification des dépendances critiques..." -Type Info
                $criticalDeps = @('socket.io-client', 'react', 'react-dom', 'vite')
                $allPresent = $true
                foreach ($dep in $criticalDeps) {
                    if (Test-Path "node_modules/$dep") {
                        Write-ColorOutput "  ✓ $dep installé" -Type Success
                    } else {
                        Write-ColorOutput "  ✗ $dep manquant" -Type Error
                        $allPresent = $false
                    }
                }
                if (-not $allPresent) {
                    throw "Certaines dépendances critiques sont manquantes"
                }
            } else {
                throw "npm install a échoué"
            }
        } catch {
            Write-ColorOutput "✗ Erreur lors de l'installation des dépendances frontend" -Type Error
            Write-ColorOutput $_.Exception.Message -Type Error
            exit 1
        }
    } else {
        Write-ColorOutput "✗ Fichier package.json introuvable dans le répertoire racine" -Type Error
        exit 1
    }
}

function Install-BackendDependencies {
    Write-Header "Installation des dépendances Backend"

    if (Test-Path "backend/package.json") {
        Push-Location backend
        try {
            Write-ColorOutput "📦 Installation des packages npm (backend)..." -Type Info
            npm install
            if ($LASTEXITCODE -ne 0) {
                throw "npm install a échoué"
            }
            Write-ColorOutput "✓ Dépendances backend installées avec succès" -Type Success

            # Vérifier les dépendances critiques du backend
            Write-ColorOutput "🔍 Vérification des dépendances critiques backend..." -Type Info
            $criticalBackendDeps = @('@nestjs/websockets', 'socket.io', '@google/genai', '@nestjs/core', '@prisma/client')
            $allPresent = $true
            foreach ($dep in $criticalBackendDeps) {
                if (Test-Path "node_modules/$dep") {
                    Write-ColorOutput "  ✓ $dep installé" -Type Success
                } else {
                    Write-ColorOutput "  ✗ $dep manquant" -Type Error
                    $allPresent = $false
                }
            }
            if (-not $allPresent) {
                throw "Certaines dépendances critiques backend sont manquantes"
            }
        } catch {
            Write-ColorOutput "✗ Erreur lors de l'installation des dépendances backend" -Type Error
            Write-ColorOutput $_.Exception.Message -Type Error
            Pop-Location
            exit 1
        }
        Pop-Location
    } else {
        Write-ColorOutput "✗ Fichier backend/package.json introuvable" -Type Error
        exit 1
    }
}

function Setup-FrontendEnvironment {
    Write-Header "Configuration de l'environnement Frontend"

    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Write-ColorOutput "📝 Création du fichier .env depuis .env.example..." -Type Info
            Copy-Item ".env.example" ".env"
            Write-ColorOutput "✓ Fichier .env créé" -Type Success
            Write-ColorOutput "⚠️  IMPORTANT: Éditez le fichier .env et ajoutez votre GEMINI_API_KEY" -Type Warning
        } else {
            Write-ColorOutput "⚠️  Fichier .env.example introuvable" -Type Warning
            Write-ColorOutput "📝 Création d'un fichier .env minimal..." -Type Info

            $envContent = @"
# Gemini API Key pour la génération de prompts
GEMINI_API_KEY=your_gemini_key_here

# Configuration API Backend (pour mode fullstack)
VITE_API_URL=http://localhost:3003/api/v1
VITE_WS_URL=ws://localhost:3003
VITE_MCP_API_URL=http://localhost:3003/api/v1/mcp
VITE_MCP_MOCK_MODE=false
"@
            Set-Content -Path ".env" -Value $envContent
            Write-ColorOutput "✓ Fichier .env créé avec configuration par défaut" -Type Success
            Write-ColorOutput "⚠️  IMPORTANT: Éditez le fichier .env et ajoutez votre GEMINI_API_KEY" -Type Warning
        }
    } else {
        Write-ColorOutput "✓ Fichier .env existe déjà" -Type Success
    }
}

function Setup-BackendEnvironment {
    Write-Header "Configuration de l'environnement Backend"

    if (-not (Test-Path "backend/.env")) {
        Write-ColorOutput "📝 Création du fichier backend/.env..." -Type Info

        $envContent = @"
# Database Configuration
DATABASE_URL=postgresql://airiskmgr:airiskmgr_dev_password@localhost:5435/airiskmgr_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=redis_dev_password

# JWT Configuration
JWT_SECRET=dev-jwt-secret-change-in-production-$(Get-Random -Maximum 999999)
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Encryption Key (32 caractères minimum)
ENCRYPTION_KEY=dev-32-char-encryption-key-here-$(Get-Random -Maximum 999)

# API Keys
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3004

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Node Environment
NODE_ENV=development
PORT=3001
"@

        New-Item -Path "backend" -ItemType Directory -Force | Out-Null
        Set-Content -Path "backend/.env" -Value $envContent
        Write-ColorOutput "✓ Fichier backend/.env créé" -Type Success
        Write-ColorOutput "⚠️  IMPORTANT: Éditez backend/.env et ajoutez vos clés API" -Type Warning
    } else {
        Write-ColorOutput "✓ Fichier backend/.env existe déjà" -Type Success
    }
}

function Initialize-PrismaDatabase {
    Write-Header "Initialisation de la base de données Prisma"

    if (Test-Path "backend/prisma/schema.prisma") {
        Push-Location backend
        try {
            Write-ColorOutput "🔧 Génération du client Prisma..." -Type Info
            npm run prisma:generate
            if ($LASTEXITCODE -ne 0) {
                throw "Génération du client Prisma échouée"
            }
            Write-ColorOutput "✓ Client Prisma généré avec succès" -Type Success

            # Tentative de push du schéma (peut échouer si la DB n'est pas accessible)
            Write-ColorOutput "🔧 Tentative de synchronisation du schéma..." -Type Info
            npm run prisma:push 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✓ Schéma de base de données synchronisé" -Type Success
            } else {
                Write-ColorOutput "⚠️  Impossible de synchroniser le schéma (base de données non accessible)" -Type Warning
                Write-ColorOutput "   Exécutez 'npm run prisma:push' après avoir démarré la base de données" -Type Info
            }
        } catch {
            Write-ColorOutput "⚠️  Erreur lors de l'initialisation Prisma: $($_.Exception.Message)" -Type Warning
        } finally {
            Pop-Location
        }
    }
}

function Verify-ProjectStructure {
    Write-Header "Vérification de la structure du projet"

    $requiredFiles = @{
        'types/promptfoo.ts' = 'Définitions TypeScript Promptfoo Wizard'
        'services/promptfooAutomationService.ts' = 'Service d''automation Promptfoo'
        'components/PromptfooWizard.tsx' = 'Interface Assistant Guidé (Débutant)'
        'backend/apps/api-gateway/src/app.controller.ts' = 'Contrôleur principal avec health check'
        'vite.config.ts' = 'Configuration Vite'
        'docker-compose.yml' = 'Configuration Docker'
    }

    $allPresent = $true
    foreach ($file in $requiredFiles.Keys) {
        if (Test-Path $file) {
            Write-ColorOutput "  ✓ $($requiredFiles[$file])" -Type Success
        } else {
            Write-ColorOutput "  ✗ Fichier manquant: $file" -Type Error
            $allPresent = $false
        }
    }

    if ($allPresent) {
        Write-ColorOutput "`n✓ Structure du projet validée!" -Type Success
    } else {
        Write-ColorOutput "`n⚠️  Certains fichiers sont manquants. Le projet peut ne pas fonctionner correctement." -Type Warning
    }

    return $allPresent
}

function Test-DockerServices {
    param([int]$MaxAttempts = 30, [int]$WaitSeconds = 2)

    Write-Header "Vérification de la santé des services Docker"

    # Attendre que les conteneurs démarrent
    Write-ColorOutput "⏳ Attente du démarrage des services (jusqu'à $($MaxAttempts * $WaitSeconds)s)..." -Type Info
    Start-Sleep -Seconds 5

    # Tester le backend health endpoint
    $backendHealthy = $false
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3003/api/v1/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $backendHealthy = $true
                Write-ColorOutput "✓ API Gateway: http://localhost:3003/api/v1/health - OK" -Type Success
                break
            }
        } catch {
            Start-Sleep -Seconds $WaitSeconds
        }
    }

    if (-not $backendHealthy) {
        Write-ColorOutput "⚠️  API Gateway ne répond pas au health check" -Type Warning
    }

    # Tester le frontend
    $frontendHealthy = $false
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3004" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $frontendHealthy = $true
                Write-ColorOutput "✓ Frontend: http://localhost:3004 - OK" -Type Success
                break
            }
        } catch {
            Start-Sleep -Seconds $WaitSeconds
        }
    }

    if (-not $frontendHealthy) {
        Write-ColorOutput "⚠️  Frontend ne répond pas encore (peut nécessiter plus de temps)" -Type Warning
    }

    # Vérifier les conteneurs Docker
    Write-ColorOutput "`n🐳 Statut des conteneurs Docker:" -Type Info
    $containers = docker-compose ps --format json 2>$null | ConvertFrom-Json
    if ($containers) {
        foreach ($container in $containers) {
            $status = $container.State
            if ($status -eq 'running') {
                Write-ColorOutput "  ✓ $($container.Service): running" -Type Success
            } else {
                Write-ColorOutput "  ✗ $($container.Service): $status" -Type Warning
            }
        }
    }

    return ($backendHealthy -and $frontendHealthy)
}

function Start-StandaloneMode {
    Write-Header "Démarrage en mode Standalone"

    Write-ColorOutput "🚀 Démarrage du serveur de développement frontend..." -Type Info
    Write-ColorOutput "   URL: http://localhost:5080" -Type Info
    Write-ColorOutput "   Appuyez sur Ctrl+C pour arrêter" -Type Info
    Write-Host ""

    npm run dev
}

function Start-DockerMode {
    Write-Header "Démarrage en mode Docker"

    Write-ColorOutput "🐳 Démarrage de tous les services Docker..." -Type Info
    Write-ColorOutput "   Cette opération peut prendre quelques minutes..." -Type Info

    docker-compose up -d

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-ColorOutput "✓ Conteneurs Docker démarrés!" -Type Success

        # Tester la santé des services
        $servicesHealthy = Test-DockerServices

        Write-Host ""
        Write-ColorOutput "📍 URLs des services:" -Type Info
        Write-ColorOutput "   Frontend:         http://localhost:3004" -Type Info
        Write-ColorOutput "   API Gateway:      http://localhost:3003" -Type Info
        Write-ColorOutput "   Health Check:     http://localhost:3003/api/v1/health" -Type Info
        Write-ColorOutput "   API Docs:         http://localhost:3003/api/docs" -Type Info
        Write-ColorOutput "   Adminer (DB UI):  http://localhost:8082" -Type Info
        Write-ColorOutput "   Redis Commander:  http://localhost:8081" -Type Info
        Write-ColorOutput "   Mailhog UI:       http://localhost:8025" -Type Info
        Write-ColorOutput "   Grafana:          http://localhost:3002" -Type Info
        Write-ColorOutput "   Prometheus:       http://localhost:9090" -Type Info
        Write-Host ""
        Write-ColorOutput "📝 Commandes utiles:" -Type Info
        Write-ColorOutput "   Logs frontend:    docker-compose logs -f frontend" -Type Info
        Write-ColorOutput "   Logs backend:     docker-compose logs -f api-gateway" -Type Info
        Write-ColorOutput "   Tous les logs:    docker-compose logs -f" -Type Info
        Write-ColorOutput "   Statut:           docker-compose ps" -Type Info
        Write-ColorOutput "   Arrêter:          docker-compose down" -Type Info
        Write-ColorOutput "   Redémarrer:       docker-compose restart" -Type Info

        if ($servicesHealthy) {
            Write-Host ""
            Write-ColorOutput "🎉 Tous les services sont opérationnels!" -Type Success
            Write-ColorOutput "🚀 Accédez à l'application: http://localhost:3004" -Type Success
        } else {
            Write-Host ""
            Write-ColorOutput "⚠️  Certains services mettent du temps à démarrer" -Type Warning
            Write-ColorOutput "   Patientez 30-60 secondes puis vérifiez: http://localhost:3004" -Type Info
        }
    } else {
        Write-ColorOutput "✗ Erreur lors du démarrage des services Docker" -Type Error
        Write-ColorOutput "   Vérifiez les logs: docker-compose logs" -Type Info
        exit 1
    }
}

function Show-InstallationSummary {
    param([string]$InstallMode)

    Write-Header "Installation terminée avec succès!"

    Write-ColorOutput "Mode d'installation: $InstallMode" -Type Success
    Write-Host ""

    # Vérifier la structure du projet
    Verify-ProjectStructure | Out-Null

    Write-Host ""
    switch ($InstallMode) {
        'standalone' {
            Write-ColorOutput "🎯 Prochaines étapes:" -Type Info
            Write-ColorOutput "   1. Éditez le fichier .env et ajoutez votre GEMINI_API_KEY" -Type Info
            Write-ColorOutput "   2. Lancez le serveur: npm run dev" -Type Info
            Write-ColorOutput "   3. Ouvrez http://localhost:5080 dans votre navigateur" -Type Info
            Write-Host ""
            Write-ColorOutput "🚀 Nouvelles fonctionnalités:" -Type Info
            Write-ColorOutput "   • Assistant Guidé (Débutant) - Configuration Promptfoo en 3 étapes" -Type Success
            Write-ColorOutput "   • Tests de sécurité automatisés avec validation" -Type Success
            Write-ColorOutput "   • Protection contre les erreurs de configuration" -Type Success
        }
        'fullstack' {
            Write-ColorOutput "🎯 Prochaines étapes:" -Type Info
            Write-ColorOutput "   1. Éditez .env et backend/.env avec vos clés API" -Type Info
            Write-ColorOutput "   2. Démarrez la base de données: docker-compose up -d postgres redis" -Type Info
            Write-ColorOutput "   3. Synchronisez le schéma: cd backend && npm run prisma:push" -Type Info
            Write-ColorOutput "   4. Démarrez le backend: cd backend && npm run start:dev" -Type Info
            Write-ColorOutput "   5. Démarrez le frontend: npm run dev" -Type Info
            Write-Host ""
            Write-ColorOutput "🚀 Nouvelles fonctionnalités:" -Type Info
            Write-ColorOutput "   • Assistant Guidé avec backend WebSocket temps réel" -Type Success
            Write-ColorOutput "   • Health checks et monitoring intégrés" -Type Success
            Write-ColorOutput "   • API Gateway avec authentification JWT" -Type Success
        }
        'docker' {
            Write-ColorOutput "🎯 Services accessibles:" -Type Info
            Write-ColorOutput "   • Frontend:       http://localhost:3004" -Type Info
            Write-ColorOutput "   • API Gateway:    http://localhost:3003" -Type Info
            Write-ColorOutput "   • Health Check:   http://localhost:3003/api/v1/health" -Type Info
            Write-ColorOutput "   • API Docs:       http://localhost:3003/api/docs" -Type Info
            Write-ColorOutput "   • Admin DB:       http://localhost:8082" -Type Info
            Write-ColorOutput "   • Redis UI:       http://localhost:8081" -Type Info
            Write-Host ""
            Write-ColorOutput "🚀 Nouvelles fonctionnalités:" -Type Info
            Write-ColorOutput "   • Assistant Guidé (Débutant) - Configuration automatisée" -Type Success
            Write-ColorOutput "   • Tests de sécurité avec dry-run et validation" -Type Success
            Write-ColorOutput "   • WebSocket pour suivi temps réel des tests" -Type Success
            Write-ColorOutput "   • Infrastructure complète (PostgreSQL, Redis, Monitoring)" -Type Success
        }
    }

    Write-Host ""
    Write-ColorOutput "📚 Documentation:" -Type Info
    Write-ColorOutput "   • README.md - Vue d'ensemble du projet" -Type Info
    Write-ColorOutput "   • CLAUDE.md - Guide d'architecture technique" -Type Info
    Write-ColorOutput "   • QUICK_START.md - Guide de démarrage rapide" -Type Info
    Write-ColorOutput "   • INSTALLATION.md - Guide d'installation détaillé" -Type Info
    Write-Host ""
    Write-ColorOutput "💡 Aide et Support:" -Type Info
    Write-ColorOutput "   • Mode Débutant: Utilisez l'Assistant Guidé dans l'interface" -Type Info
    Write-ColorOutput "   • Mode Expert: Accès complet aux configurations manuelles" -Type Info
    Write-ColorOutput "   • Tests sécurisés: Dry-run par défaut pour éviter les erreurs" -Type Info
    Write-Host ""
    Write-ColorOutput "✨ Bon développement!" -Type Success
}

# ============================================
# Script Principal
# ============================================

Clear-Host
Write-Host ""
Write-ColorOutput "╔════════════════════════════════════════════════╗" -Type Header
Write-ColorOutput "║                                                ║" -Type Header
Write-ColorOutput "║        AI RISK MANAGER - Installation          ║" -Type Header
Write-ColorOutput "║        Version 1.1.0 - Wizard Edition         ║" -Type Header
Write-ColorOutput "║                                                ║" -Type Header
Write-ColorOutput "╚════════════════════════════════════════════════╝" -Type Header
Write-Host ""

# Demander le mode si non spécifié
if ([string]::IsNullOrEmpty($Mode)) {
    Write-ColorOutput "Choisissez le mode d'installation:" -Type Info
    Write-ColorOutput "  1) Standalone - Frontend uniquement (localhost:5080)" -Type Info
    Write-ColorOutput "  2) Fullstack  - Frontend + Backend local (nécessite Docker pour DB)" -Type Info
    Write-ColorOutput "  3) Docker     - Tous les services dans Docker (recommandé)" -Type Info
    Write-Host ""

    do {
        $choice = Read-Host "Entrez votre choix (1-3)"
        switch ($choice) {
            '1' { $Mode = 'standalone'; break }
            '2' { $Mode = 'fullstack'; break }
            '3' { $Mode = 'docker'; break }
            default { Write-ColorOutput "Choix invalide. Réessayez." -Type Warning }
        }
    } while ([string]::IsNullOrEmpty($Mode))
}

Write-ColorOutput "Mode sélectionné: $Mode" -Type Success
Write-Host ""

# Vérifier les prérequis
if (-not $SkipDependencies) {
    Test-Prerequisites
}

# Installation selon le mode
switch ($Mode) {
    'standalone' {
        Install-FrontendDependencies
        Setup-FrontendEnvironment
        Show-InstallationSummary -InstallMode 'standalone'

        # Demander si l'utilisateur veut démarrer maintenant
        Write-Host ""
        $start = Read-Host "Voulez-vous démarrer le serveur maintenant? (O/N)"
        if ($start -eq 'O' -or $start -eq 'o') {
            Start-StandaloneMode
        }
    }

    'fullstack' {
        Install-FrontendDependencies
        Install-BackendDependencies
        Setup-FrontendEnvironment
        Setup-BackendEnvironment
        Initialize-PrismaDatabase
        Show-InstallationSummary -InstallMode 'fullstack'
    }

    'docker' {
        Install-FrontendDependencies
        Install-BackendDependencies
        Setup-FrontendEnvironment
        Setup-BackendEnvironment
        Initialize-PrismaDatabase
        Show-InstallationSummary -InstallMode 'docker'

        # Demander si l'utilisateur veut démarrer Docker maintenant
        Write-Host ""
        $start = Read-Host "Voulez-vous démarrer les services Docker maintenant? (O/N)"
        if ($start -eq 'O' -or $start -eq 'o') {
            Start-DockerMode
        }
    }
}

Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
Write-ColorOutput "Installation terminée avec succès! 🎉" -Type Success
Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
Write-Host ""
