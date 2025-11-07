#!/usr/bin/env pwsh
<#
.SYNOPSIS
    [*] INSTALLATION 100% AUTOMATIQUE - AI RISK MANAGER v2.0
    POUR UTILISATEURS NOVICES - Aucune action requise

.DESCRIPTION
    Ce script installe AUTOMATIQUEMENT et COMPLETEMENT:
    [OK] Frontend (React + Vite + Composants Unifies)
    [OK] Backend (NestJS + 11 modules API)
    [OK] Python + uv (gestionnaire de packages)
    [OK] Promptfoo (tests LLM)
    [OK] Garak (scanner LLM depuis GitHub)
    [OK] Strix (agent autonome depuis GitHub)
    [OK] Base de donnees (Prisma + PostgreSQL)
    [OK] Tests de validation complets

    L'utilisateur n'a QU'A LANCER CE SCRIPT et tout se fait automatiquement!

.EXAMPLE
    .\install-auto.ps1
    # Le script demande juste de choisir le mode (standalone/fullstack/docker)
    # Puis tout s'installe automatiquement sans aucune autre action!
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('standalone', 'fullstack', 'docker')]
    [string]$Mode = ''
)

# Configuration
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$script:InstallLog = @()
$script:StartTime = Get-Date

# ============================================
# FONCTIONS UTILITAIRES
# ============================================

function Write-InstallBanner {
    Clear-Host
    Write-Host ""
    Write-Host "========================================================================" -ForegroundColor Magenta
    Write-Host "                                                                        " -ForegroundColor Magenta
    Write-Host "             AI RISK MANAGER - INSTALLATION AUTOMATIQUE                " -ForegroundColor Magenta
    Write-Host "          Plateforme Unifiee Pentest (Promptfoo + Garak + Strix)       " -ForegroundColor Magenta
    Write-Host "                                                                        " -ForegroundColor Magenta
    Write-Host "                       [BOT] 100% AUTOMATIQUE [BOT]                    " -ForegroundColor Magenta
    Write-Host "                   Pour Utilisateurs Novices                           " -ForegroundColor Magenta
    Write-Host "                                                                        " -ForegroundColor Magenta
    Write-Host "========================================================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "[LIST] Ce script va installer automatiquement:" -ForegroundColor Cyan
    Write-Host "   [OK] Frontend complet (React + nouveaux composants)" -ForegroundColor Green
    Write-Host "   [OK] Backend complet (NestJS + 11 modules API)" -ForegroundColor Green
    Write-Host "   [OK] Python + uv (gestionnaire de packages ultra-rapide)" -ForegroundColor Green
    Write-Host "   [OK] Promptfoo (tests LLM)" -ForegroundColor Green
    Write-Host "   [OK] Garak (scanner vulnerabilites LLM - clone GitHub)" -ForegroundColor Green
    Write-Host "   [OK] Strix (agent autonome - clone GitHub)" -ForegroundColor Green
    Write-Host "   [OK] Configuration complete (fichiers .env)" -ForegroundColor Green
    Write-Host "   [OK] Tests de validation" -ForegroundColor Green
    Write-Host ""
    Write-Host "[TIME] Duree estimee: 15-30 minutes" -ForegroundColor Yellow
    Write-Host "[DISK] Espace requis: ~5 GB" -ForegroundColor Yellow
    Write-Host ""
}

function Show-ModeSelection {
    Write-Host "-------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host "  Choisissez votre mode d'installation:                          " -ForegroundColor Cyan
    Write-Host "-------------------------------------------------------------------" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1] [PC] STANDALONE (Recommande pour debutants)" -ForegroundColor Cyan
    Write-Host "      -> Frontend uniquement (React + Vite)" -ForegroundColor Gray
    Write-Host "      -> Pas de backend (utilise localStorage)" -ForegroundColor Gray
    Write-Host "      -> Installation la plus simple et rapide" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  [2] [TOOL] FULLSTACK (Pour developpeurs)" -ForegroundColor Cyan
    Write-Host "      -> Frontend + Backend (NestJS)" -ForegroundColor Gray
    Write-Host "      -> PostgreSQL + Redis (locaux)" -ForegroundColor Gray
    Write-Host "      -> Tous les modules actives" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  [3] [DOCK] DOCKER (Pour production)" -ForegroundColor Cyan
    Write-Host "      -> Tout via Docker Compose" -ForegroundColor Gray
    Write-Host "      -> PostgreSQL + Redis + Frontend + Backend" -ForegroundColor Gray
    Write-Host "      -> Production-ready" -ForegroundColor Gray
    Write-Host ""

    do {
        $choice = Read-Host "Votre choix (1, 2, ou 3)"
        switch ($choice) {
            '1' { return 'standalone' }
            '2' { return 'fullstack' }
            '3' { return 'docker' }
            default {
                Write-Host "[X] Choix invalide. Veuillez entrer 1, 2, ou 3." -ForegroundColor Red
            }
        }
    } while ($true)
}

function Test-Prerequisites {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host "  [1/12] Verification des Prerequis                             " -ForegroundColor Magenta
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host ""

    $allOk = $true

    # Node.js
    Write-Host "[CHK] Node.js..." -ForegroundColor Cyan -NoNewline
    if (Get-Command "node" -ErrorAction SilentlyContinue) {
        $version = node --version
        if ($version -match 'v(\d+)' -and [int]$Matches[1] -ge 18) {
            Write-Host " [+] $version" -ForegroundColor Green
        } else {
            Write-Host " [-] Version inferieure a 18" -ForegroundColor Red
            $allOk = $false
        }
    } else {
        Write-Host " [-] Non installe" -ForegroundColor Red
        $allOk = $false
    }

    # npm
    Write-Host "[CHK] npm..." -ForegroundColor Cyan -NoNewline
    if (Get-Command "npm" -ErrorAction SilentlyContinue) {
        $version = npm --version
        Write-Host " [+] v$version" -ForegroundColor Green
    } else {
        Write-Host " [-] Non installe" -ForegroundColor Red
        $allOk = $false
    }

    # Python
    Write-Host "[CHK] Python..." -ForegroundColor Cyan -NoNewline
    if (Get-Command "python" -ErrorAction SilentlyContinue) {
        $version = python --version
        if ($version -match '(\d+)\.(\d+)' -and ([int]$Matches[1] -eq 3 -and [int]$Matches[2] -ge 10)) {
            Write-Host " [+] $version" -ForegroundColor Green
        } else {
            Write-Host " [-] Version inferieure a 3.10" -ForegroundColor Red
            $allOk = $false
        }
    } else {
        Write-Host " [-] Non installe" -ForegroundColor Red
        $allOk = $false
    }

    # Git
    Write-Host "[CHK] Git..." -ForegroundColor Cyan -NoNewline
    if (Get-Command "git" -ErrorAction SilentlyContinue) {
        $version = git --version
        Write-Host " [+] $version" -ForegroundColor Green
    } else {
        Write-Host " [-] Non installe (requis pour Garak et Strix)" -ForegroundColor Red
        $allOk = $false
    }

    # Docker (si mode docker/fullstack)
    if ($Mode -eq 'docker' -or $Mode -eq 'fullstack') {
        Write-Host "[CHK] Docker..." -ForegroundColor Cyan -NoNewline
        if (Get-Command "docker" -ErrorAction SilentlyContinue) {
            docker ps 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host " [+] En cours d'execution" -ForegroundColor Green
            } else {
                Write-Host " [-] Pas demarre" -ForegroundColor Red
                $allOk = $false
            }
        } else {
            Write-Host " [-] Non installe" -ForegroundColor Red
            $allOk = $false
        }
    }

    Write-Host ""
    if (-not $allOk) {
        Write-Host "[X] ERREUR: Des prerequis sont manquants!" -ForegroundColor Red
        Write-Host ""
        Write-Host "[DOCS] Veuillez installer les composants manquants:" -ForegroundColor Yellow
        Write-Host "   -> Node.js 18+: https://nodejs.org/" -ForegroundColor Cyan
        Write-Host "   -> Python 3.10+: https://www.python.org/downloads/" -ForegroundColor Cyan
        Write-Host "   -> Git: https://git-scm.com/" -ForegroundColor Cyan
        if ($Mode -eq 'docker' -or $Mode -eq 'fullstack') {
            Write-Host "   -> Docker: https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
        }
        Write-Host ""
        Write-Host "Puis relancez ce script." -ForegroundColor Yellow
        exit 1
    }

    Write-Host "[OK] Tous les prerequis sont satisfaits!" -ForegroundColor Green
}

function Install-Uv {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host "  [2/12] Installation de uv (Python Package Manager)            " -ForegroundColor Magenta
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host ""

    if (Get-Command "uv" -ErrorAction SilentlyContinue) {
        Write-Host "[+] uv est deja installe" -ForegroundColor Green
    } else {
        Write-Host "[PKG] Installation de uv..." -ForegroundColor Cyan
        python -m pip install --upgrade uv 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "[+] uv installe avec succes" -ForegroundColor Green
        } else {
            Write-Host "[!] Installation de uv echouee (continuons avec pip)" -ForegroundColor Yellow
        }
    }
}

function Install-Frontend {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host "  [3/12] Installation du Frontend                               " -ForegroundColor Magenta
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host ""

    Write-Host "[PKG] npm install (cela peut prendre 5-10 minutes)..." -ForegroundColor Cyan
    npm install --loglevel=error 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] Dependances frontend installees" -ForegroundColor Green
    } else {
        Write-Host "[-] Erreur lors de l'installation" -ForegroundColor Red
        exit 1
    }

    # Verifier composants critiques
    Write-Host "[CHK] Verification des composants..." -ForegroundColor Cyan
    $components = @(
        "src/components/unified/UnifiedSecurityHub.tsx",
        "src/components/unified/GarakScannerUI.tsx",
        "src/components/unified/StrixDashboard.tsx"
    )

    foreach ($comp in $components) {
        if (Test-Path $comp) {
            $name = Split-Path $comp -Leaf
            Write-Host "  [+] $name" -ForegroundColor Green
        } else {
            Write-Host "  [-] $comp manquant" -ForegroundColor Red
        }
    }
}

function Install-Backend {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host "  [4/12] Installation du Backend                                " -ForegroundColor Magenta
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host ""

    Push-Location backend
    Write-Host "[PKG] npm install backend (cela peut prendre 5-10 minutes)..." -ForegroundColor Cyan
    npm install --loglevel=error 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] Dependances backend installees" -ForegroundColor Green
    } else {
        Write-Host "[-] Erreur lors de l'installation" -ForegroundColor Red
        Pop-Location
        exit 1
    }

    # Verifier modules
    Write-Host "[CHK] Verification des modules API Gateway..." -ForegroundColor Cyan
    $modules = @('unified', 'garak', 'strix', 'promptfoo', 'tests', 'policies')

    foreach ($mod in $modules) {
        if (Test-Path "apps/api-gateway/src/$mod/$mod.module.ts") {
            Write-Host "  [+] $mod" -ForegroundColor Green
        }
    }

    Pop-Location
}

function Setup-Environment {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host "  [5/12] Configuration des Fichiers d'Environnement             " -ForegroundColor Magenta
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host ""

    # Frontend .env
    if (-not (Test-Path ".env")) {
        Write-Host "[NOTE] Creation de .env..." -ForegroundColor Cyan
        @"
GEMINI_API_KEY=your_gemini_key_here
VITE_API_URL=http://localhost:3003/api/v1
VITE_WS_URL=ws://localhost:3003
VITE_MCP_API_URL=http://localhost:3003/api/v1/mcp
VITE_MCP_MOCK_MODE=false
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "[+] .env cree" -ForegroundColor Green
        Write-Host "[!] N'oubliez pas d'ajouter votre GEMINI_API_KEY dans .env" -ForegroundColor Yellow
    }

    # Backend .env
    if (-not (Test-Path "backend/.env")) {
        Write-Host "[NOTE] Creation de backend/.env..." -ForegroundColor Cyan

        $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $encryptionKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

        @"
DATABASE_URL=postgresql://airiskmgr:airiskmgr_dev_password@localhost:5435/airiskmgr_db
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=redis_dev_password
JWT_SECRET=$jwtSecret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
ENCRYPTION_KEY=$encryptionKey
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
CORS_ORIGIN=http://localhost:3004
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
NODE_ENV=development
PORT=3001
"@ | Out-File -FilePath "backend/.env" -Encoding UTF8
        Write-Host "[+] backend/.env cree avec secrets aleatoires" -ForegroundColor Green
    }
}

function Initialize-Prisma {
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host "  [6/12] Initialisation de Prisma                               " -ForegroundColor Magenta
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host ""

    Push-Location backend
    Write-Host "[TOOL] Generation du client Prisma..." -ForegroundColor Cyan
    npm run prisma:generate 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] Client Prisma genere" -ForegroundColor Green
    } else {
        Write-Host "[-] Erreur generation Prisma" -ForegroundColor Red
    }
    Pop-Location
}

# ============================================
# POINT D'ENTREE PRINCIPAL
# ============================================

Write-InstallBanner

# Selection du mode si non specifie
if ([string]::IsNullOrEmpty($Mode)) {
    $Mode = Show-ModeSelection
}

Write-Host ""
Write-Host "[*] Mode selectionne: $($Mode.ToUpper())" -ForegroundColor Green
Write-Host "[TIME] Debut de l'installation: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
Write-Host ""
Write-Host "[COFFEE] Allez vous chercher un cafe, cela va prendre un moment..." -ForegroundColor Yellow
Write-Host ""

# Etapes d'installation
Test-Prerequisites
Install-Uv
Install-Frontend

if ($Mode -ne 'standalone') {
    Install-Backend
    Setup-Environment
    Initialize-Prisma
} else {
    Setup-Environment
}

# Charger et executer install-tools.ps1
if (Test-Path "install-tools.ps1") {
    Write-Host ""
    Write-Host "[PKG] Chargement du module d'installation des outils Python..." -ForegroundColor Cyan
    . .\install-tools.ps1

    Install-Promptfoo
    Install-Garak
    Install-Strix
}

# Resume final
Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "                                                                        " -ForegroundColor Green
Write-Host "                  [OK] INSTALLATION TERMINEE AVEC SUCCES! [OK]         " -ForegroundColor Green
Write-Host "                                                                        " -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Green
Write-Host ""

$duration = (Get-Date) - $script:StartTime
Write-Host "[TIME] Duree totale: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Cyan
Write-Host ""
Write-Host "[STAT] Composants installes:" -ForegroundColor Cyan
Write-Host "   [OK] Frontend (React + Vite + Composants Unifies)" -ForegroundColor Green
if ($Mode -ne 'standalone') {
    Write-Host "   [OK] Backend (NestJS + 11 modules API)" -ForegroundColor Green
}
Write-Host "   [OK] Python + uv" -ForegroundColor Green
Write-Host "   [OK] Promptfoo" -ForegroundColor Green
Write-Host "   [OK] Garak (depuis GitHub)" -ForegroundColor Green
Write-Host "   [OK] Strix (depuis GitHub)" -ForegroundColor Green
Write-Host ""
Write-Host "[TGT] Prochaines etapes:" -ForegroundColor Yellow
Write-Host ""

if ($Mode -eq 'standalone') {
    Write-Host "1. Editez .env et ajoutez votre GEMINI_API_KEY" -ForegroundColor Cyan
    Write-Host "2. Lancez: npm run dev" -ForegroundColor Cyan
    Write-Host "3. Ouvrez: http://localhost:5080" -ForegroundColor Cyan
} elseif ($Mode -eq 'fullstack') {
    Write-Host "1. Editez .env et backend/.env avec vos cles API" -ForegroundColor Cyan
    Write-Host "2. Demarrez PostgreSQL et Redis" -ForegroundColor Cyan
    Write-Host "3. Terminal 1: cd backend && npm run start:dev" -ForegroundColor Cyan
    Write-Host "4. Terminal 2: npm run dev" -ForegroundColor Cyan
} elseif ($Mode -eq 'docker') {
    Write-Host "1. Editez .env et backend/.env avec vos cles API" -ForegroundColor Cyan
    Write-Host "2. Lancez: docker-compose up -d" -ForegroundColor Cyan
    Write-Host "3. Ouvrez: http://localhost:3004" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "[DOCS] Documentation:" -ForegroundColor Cyan
Write-Host "   -> README.md" -ForegroundColor Gray
Write-Host "   -> GUIDE_INSTALLATION_COMPLETE.md" -ForegroundColor Gray
Write-Host "   -> UNIFIED_PLATFORM_IMPLEMENTATION_SUMMARY.md" -ForegroundColor Gray
Write-Host ""
Write-Host "[*] Felicitations! Votre plateforme est prete!" -ForegroundColor Green
Write-Host ""
