#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Utilitaire de développement pour AI RISK MANAGER
.DESCRIPTION
    Commandes rapides pour les tâches courantes de développement
.PARAMETER Task
    Tâche à exécuter
.EXAMPLE
    .\dev.ps1
    .\dev.ps1 -Task start
    .\dev.ps1 -Task test
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$Task = ''
)

$ErrorActionPreference = "Stop"

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
        if (Get-Command $Command -ErrorAction Stop) { return $true }
    } catch {
        return $false
    }
    return $false
}

function Start-Dev {
    Write-Header "Démarrage des Services de Développement"

    Write-ColorOutput "Comment voulez-vous démarrer?" -Type Info
    Write-Host ""
    Write-ColorOutput "  1) Frontend seul (standalone)" -Type Info
    Write-ColorOutput "  2) Frontend + Backend (fullstack)" -Type Info
    Write-ColorOutput "  3) Docker (tous les services)" -Type Info
    Write-Host ""

    $choice = Read-Host "Votre choix (1-3)"

    switch ($choice) {
        '1' {
            Write-ColorOutput "🚀 Démarrage du frontend..." -Type Info
            Write-ColorOutput "   URL: http://localhost:5080" -Type Success
            Write-Host ""
            npm run dev
        }
        '2' {
            Write-ColorOutput "🚀 Démarrage en mode fullstack..." -Type Info
            Write-Host ""

            # Démarrer PostgreSQL et Redis avec Docker
            Write-ColorOutput "📦 Démarrage de PostgreSQL et Redis..." -Type Info
            docker-compose up -d postgres redis

            # Attendre que les services soient prêts
            Start-Sleep -Seconds 3

            # Ouvrir deux terminaux PowerShell
            Write-ColorOutput "🔧 Ouverture du backend dans une nouvelle fenêtre..." -Type Info
            Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd backend; npm run start:dev"

            Start-Sleep -Seconds 2

            Write-ColorOutput "🎨 Démarrage du frontend..." -Type Info
            Write-ColorOutput "   Frontend: http://localhost:5080" -Type Success
            Write-ColorOutput "   Backend:  http://localhost:3001" -Type Success
            Write-Host ""
            npm run dev
        }
        '3' {
            Write-ColorOutput "🐳 Démarrage de tous les services Docker..." -Type Info
            docker-compose up -d

            Write-Host ""
            Write-ColorOutput "✓ Services démarrés!" -Type Success
            Write-Host ""
            Write-ColorOutput "📍 URLs:" -Type Info
            Write-ColorOutput "   Frontend:        http://localhost:3004" -Type Success
            Write-ColorOutput "   API:             http://localhost:3003" -Type Success
            Write-ColorOutput "   Adminer:         http://localhost:8082" -Type Success
            Write-ColorOutput "   Redis Commander: http://localhost:8081" -Type Success
            Write-Host ""
            Write-ColorOutput "📝 Logs: docker-compose logs -f" -Type Info
        }
        default {
            Write-ColorOutput "Choix invalide" -Type Error
        }
    }
}

function Stop-Dev {
    Write-Header "Arrêt des Services"

    Write-ColorOutput "Arrêt des services Docker..." -Type Info
    docker-compose down 2>&1 | Out-Null

    Write-ColorOutput "✓ Services arrêtés" -Type Success
}

function Show-Status {
    Write-Header "Statut des Services"

    # Vérifier Node.js
    if (Test-CommandExists "node") {
        $nodeVersion = node --version
        Write-ColorOutput "✓ Node.js: $nodeVersion" -Type Success
    } else {
        Write-ColorOutput "✗ Node.js non installé" -Type Error
    }

    # Vérifier npm
    if (Test-CommandExists "npm") {
        $npmVersion = npm --version
        Write-ColorOutput "✓ npm: v$npmVersion" -Type Success
    } else {
        Write-ColorOutput "✗ npm non installé" -Type Error
    }

    # Vérifier Docker
    if (Test-CommandExists "docker") {
        $dockerVersion = docker --version
        Write-ColorOutput "✓ Docker: $dockerVersion" -Type Success

        Write-Host ""
        Write-ColorOutput "🐳 Conteneurs Docker:" -Type Info
        docker-compose ps
    } else {
        Write-ColorOutput "⚠️  Docker non installé" -Type Warning
    }

    # Vérifier les fichiers .env
    Write-Host ""
    Write-ColorOutput "📝 Configuration:" -Type Info
    if (Test-Path ".env") {
        Write-ColorOutput "  ✓ .env (frontend)" -Type Success
    } else {
        Write-ColorOutput "  ✗ .env (frontend) manquant" -Type Error
    }

    if (Test-Path "backend/.env") {
        Write-ColorOutput "  ✓ backend/.env" -Type Success
    } else {
        Write-ColorOutput "  ⚠️  backend/.env manquant" -Type Warning
    }

    # Vérifier node_modules
    Write-Host ""
    Write-ColorOutput "📦 Dépendances:" -Type Info
    if (Test-Path "node_modules") {
        Write-ColorOutput "  ✓ node_modules (frontend)" -Type Success
    } else {
        Write-ColorOutput "  ✗ node_modules (frontend) manquant - Exécutez: npm install" -Type Error
    }

    if (Test-Path "backend/node_modules") {
        Write-ColorOutput "  ✓ node_modules (backend)" -Type Success
    } else {
        Write-ColorOutput "  ⚠️  node_modules (backend) manquant" -Type Warning
    }
}

function Show-Logs {
    Write-Header "Logs des Services"

    Write-ColorOutput "Quel service?" -Type Info
    Write-Host ""
    Write-ColorOutput "  1) Tous" -Type Info
    Write-ColorOutput "  2) Frontend" -Type Info
    Write-ColorOutput "  3) Backend (API Gateway)" -Type Info
    Write-ColorOutput "  4) PostgreSQL" -Type Info
    Write-ColorOutput "  5) Redis" -Type Info
    Write-Host ""

    $choice = Read-Host "Votre choix (1-5)"

    $service = switch ($choice) {
        '1' { '' }
        '2' { 'frontend' }
        '3' { 'api-gateway' }
        '4' { 'postgres' }
        '5' { 'redis' }
        default { '' }
    }

    Write-ColorOutput "📜 Affichage des logs..." -Type Info
    Write-ColorOutput "   Appuyez sur Ctrl+C pour arrêter" -Type Info
    Write-Host ""

    if ($service) {
        docker-compose logs -f $service
    } else {
        docker-compose logs -f
    }
}

function Run-Tests {
    Write-Header "Exécution des Tests"

    Write-ColorOutput "Quel composant?" -Type Info
    Write-Host ""
    Write-ColorOutput "  1) Frontend" -Type Info
    Write-ColorOutput "  2) Backend" -Type Info
    Write-ColorOutput "  3) Tous" -Type Info
    Write-Host ""

    $choice = Read-Host "Votre choix (1-3)"

    switch ($choice) {
        '1' {
            Write-ColorOutput "🧪 Tests frontend..." -Type Info
            npm test
        }
        '2' {
            Write-ColorOutput "🧪 Tests backend..." -Type Info
            Push-Location backend
            npm test
            Pop-Location
        }
        '3' {
            Write-ColorOutput "🧪 Tests frontend..." -Type Info
            npm test

            Write-Host ""
            Write-ColorOutput "🧪 Tests backend..." -Type Info
            Push-Location backend
            npm test
            Pop-Location
        }
        default {
            Write-ColorOutput "Choix invalide" -Type Error
        }
    }
}

function Build-Project {
    Write-Header "Build du Projet"

    Write-ColorOutput "Quel composant?" -Type Info
    Write-Host ""
    Write-ColorOutput "  1) Frontend" -Type Info
    Write-ColorOutput "  2) Backend" -Type Info
    Write-ColorOutput "  3) Tous" -Type Info
    Write-Host ""

    $choice = Read-Host "Votre choix (1-3)"

    switch ($choice) {
        '1' {
            Write-ColorOutput "🔨 Build frontend..." -Type Info
            npm run build
            Write-ColorOutput "✓ Build frontend terminé: dist/" -Type Success
        }
        '2' {
            Write-ColorOutput "🔨 Build backend..." -Type Info
            Push-Location backend
            npm run build
            Pop-Location
            Write-ColorOutput "✓ Build backend terminé: backend/dist/" -Type Success
        }
        '3' {
            Write-ColorOutput "🔨 Build frontend..." -Type Info
            npm run build

            Write-Host ""
            Write-ColorOutput "🔨 Build backend..." -Type Info
            Push-Location backend
            npm run build
            Pop-Location

            Write-ColorOutput "✓ Build complet terminé!" -Type Success
        }
        default {
            Write-ColorOutput "Choix invalide" -Type Error
        }
    }
}

function Clean-Project {
    Write-Header "Nettoyage du Projet"

    Write-ColorOutput "⚠️  Cette action va supprimer:" -Type Warning
    Write-ColorOutput "  • node_modules/" -Type Warning
    Write-ColorOutput "  • dist/" -Type Warning
    Write-ColorOutput "  • package-lock.json" -Type Warning
    Write-Host ""

    $confirm = Read-Host "Continuer? (O/N)"

    if ($confirm -eq 'O' -or $confirm -eq 'o') {
        & "$PSScriptRoot\uninstall.ps1" 2>&1

        Write-ColorOutput "✓ Nettoyage terminé" -Type Success
        Write-Host ""
        Write-ColorOutput "Pour réinstaller: .\install.ps1" -Type Info
    } else {
        Write-ColorOutput "❌ Annulé" -Type Warning
    }
}

function Format-Code {
    Write-Header "Formatage du Code"

    if (Test-Path "backend") {
        Write-ColorOutput "✨ Formatage du code backend..." -Type Info
        Push-Location backend
        npm run format 2>&1 | Out-Null
        Pop-Location
        Write-ColorOutput "✓ Backend formaté" -Type Success
    }

    Write-ColorOutput "✓ Formatage terminé" -Type Success
}

function Lint-Code {
    Write-Header "Analyse du Code (Linting)"

    if (Test-Path "backend") {
        Write-ColorOutput "🔍 Analyse du code backend..." -Type Info
        Push-Location backend
        npm run lint
        Pop-Location
    }
}

function Open-URLs {
    Write-Header "Ouverture des URLs"

    Write-ColorOutput "📍 Ouverture des services dans le navigateur..." -Type Info

    $urls = @(
        "http://localhost:3004",      # Frontend Docker
        "http://localhost:5080",      # Frontend standalone
        "http://localhost:3003/api/docs",  # Swagger API
        "http://localhost:8082",      # Adminer
        "http://localhost:8081",      # Redis Commander
        "http://localhost:3002"       # Grafana
    )

    foreach ($url in $urls) {
        try {
            Start-Process $url 2>&1 | Out-Null
            Start-Sleep -Milliseconds 500
        } catch {
            # Ignorer les erreurs
        }
    }

    Write-ColorOutput "✓ URLs ouvertes" -Type Success
}

function Show-Help {
    Write-Header "Aide - Commandes Disponibles"

    Write-ColorOutput "Tâches de développement:" -Type Info
    Write-Host ""
    Write-ColorOutput "  start      - Démarrer les services de développement" -Type Success
    Write-ColorOutput "  stop       - Arrêter les services" -Type Success
    Write-ColorOutput "  restart    - Redémarrer les services" -Type Success
    Write-ColorOutput "  status     - Afficher le statut des services" -Type Success
    Write-ColorOutput "  logs       - Voir les logs" -Type Success
    Write-Host ""
    Write-ColorOutput "Build & Test:" -Type Info
    Write-Host ""
    Write-ColorOutput "  build      - Compiler le projet" -Type Success
    Write-ColorOutput "  test       - Exécuter les tests" -Type Success
    Write-ColorOutput "  lint       - Analyser le code" -Type Success
    Write-ColorOutput "  format     - Formater le code" -Type Success
    Write-Host ""
    Write-ColorOutput "Maintenance:" -Type Info
    Write-Host ""
    Write-ColorOutput "  clean      - Nettoyer node_modules et dist" -Type Success
    Write-ColorOutput "  update     - Mettre à jour les dépendances" -Type Success
    Write-ColorOutput "  backup     - Créer un backup" -Type Success
    Write-ColorOutput "  migrate    - Gérer les migrations DB" -Type Success
    Write-Host ""
    Write-ColorOutput "Utilitaires:" -Type Info
    Write-Host ""
    Write-ColorOutput "  urls       - Ouvrir toutes les URLs dans le navigateur" -Type Success
    Write-ColorOutput "  studio     - Ouvrir Prisma Studio" -Type Success
    Write-ColorOutput "  shell      - Shell dans un conteneur Docker" -Type Success
    Write-Host ""
    Write-ColorOutput "Exemples:" -Type Warning
    Write-Host ""
    Write-ColorOutput "  .\dev.ps1 start" -Type Info
    Write-ColorOutput "  .\dev.ps1 logs" -Type Info
    Write-ColorOutput "  .\dev.ps1 test" -Type Info
}

function Open-Shell {
    Write-Header "Shell Docker"

    Write-ColorOutput "Quel conteneur?" -Type Info
    Write-Host ""
    Write-ColorOutput "  1) Backend (api-gateway)" -Type Info
    Write-ColorOutput "  2) PostgreSQL" -Type Info
    Write-ColorOutput "  3) Redis" -Type Info
    Write-Host ""

    $choice = Read-Host "Votre choix (1-3)"

    $container = switch ($choice) {
        '1' { 'airiskmgr-api-gateway' }
        '2' { 'airiskmgr-postgres' }
        '3' { 'airiskmgr-redis' }
        default { '' }
    }

    if ($container) {
        Write-ColorOutput "🐚 Connexion à $container..." -Type Info
        Write-ColorOutput "   Tapez 'exit' pour quitter" -Type Info
        Write-Host ""
        docker exec -it $container sh
    } else {
        Write-ColorOutput "Choix invalide" -Type Error
    }
}

# ============================================
# Script Principal
# ============================================

Clear-Host
Write-ColorOutput "╔════════════════════════════════════════════════╗" -Type Header
Write-ColorOutput "║                                                ║" -Type Header
Write-ColorOutput "║      AI RISK MANAGER - Dev Utilities           ║" -Type Header
Write-ColorOutput "║                                                ║" -Type Header
Write-ColorOutput "╚════════════════════════════════════════════════╝" -Type Header

# Si aucune tâche spécifiée, afficher le menu
if ([string]::IsNullOrEmpty($Task)) {
    Write-Host ""
    Write-ColorOutput "Que voulez-vous faire?" -Type Info
    Write-Host ""
    Write-ColorOutput "  1)  Start      - Démarrer les services" -Type Info
    Write-ColorOutput "  2)  Stop       - Arrêter les services" -Type Info
    Write-ColorOutput "  3)  Status     - Statut des services" -Type Info
    Write-ColorOutput "  4)  Logs       - Voir les logs" -Type Info
    Write-ColorOutput "  5)  Test       - Exécuter les tests" -Type Info
    Write-ColorOutput "  6)  Build      - Compiler le projet" -Type Info
    Write-ColorOutput "  7)  Clean      - Nettoyer le projet" -Type Info
    Write-ColorOutput "  8)  Update     - Mettre à jour" -Type Info
    Write-ColorOutput "  9)  Backup     - Créer un backup" -Type Info
    Write-ColorOutput "  10) Migrate    - Gérer les migrations" -Type Info
    Write-ColorOutput "  11) URLs       - Ouvrir les URLs" -Type Info
    Write-ColorOutput "  12) Shell      - Shell Docker" -Type Info
    Write-ColorOutput "  13) Help       - Aide complète" -Type Info
    Write-Host ""

    $choice = Read-Host "Votre choix (1-13)"

    $Task = switch ($choice) {
        '1' { 'start' }
        '2' { 'stop' }
        '3' { 'status' }
        '4' { 'logs' }
        '5' { 'test' }
        '6' { 'build' }
        '7' { 'clean' }
        '8' { 'update' }
        '9' { 'backup' }
        '10' { 'migrate' }
        '11' { 'urls' }
        '12' { 'shell' }
        '13' { 'help' }
        default {
            Write-ColorOutput "Choix invalide" -Type Error
            exit 1
        }
    }
}

# Exécuter la tâche
switch ($Task.ToLower()) {
    'start' { Start-Dev }
    'stop' { Stop-Dev }
    'restart' {
        Stop-Dev
        Start-Sleep -Seconds 2
        Start-Dev
    }
    'status' { Show-Status }
    'logs' { Show-Logs }
    'test' { Run-Tests }
    'build' { Build-Project }
    'clean' { Clean-Project }
    'lint' { Lint-Code }
    'format' { Format-Code }
    'update' { & "$PSScriptRoot\update.ps1" }
    'backup' { & "$PSScriptRoot\backup.ps1" }
    'migrate' { & "$PSScriptRoot\migrate.ps1" }
    'urls' { Open-URLs }
    'studio' {
        Write-ColorOutput "🎨 Ouverture de Prisma Studio..." -Type Info
        Push-Location backend
        npm run prisma:studio
        Pop-Location
    }
    'shell' { Open-Shell }
    'help' { Show-Help }
    default {
        Write-ColorOutput "Tâche inconnue: $Task" -Type Error
        Write-ColorOutput "Utilisez '.\dev.ps1 help' pour voir les commandes disponibles" -Type Info
    }
}

Write-Host ""
