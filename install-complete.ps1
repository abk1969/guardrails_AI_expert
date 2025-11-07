#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🚀 AI RISK MANAGER - Installation Ultra-Complète v2.0
    Inclut Python, uv, Promptfoo, Garak, Strix avec vérification GitHub

.DESCRIPTION
    Script d'installation complet qui :
    ✅ Vérifie TOUS les prérequis (Node.js, npm, Python, uv, Docker, Git)
    ✅ Installe le frontend complet avec tous les nouveaux composants
    ✅ Installe le backend complet avec TOUS les modules (Unified, Garak, Strix, Vault, MCP)
    ✅ Installe les 3 outils de pentest:
       - Promptfoo (tests LLM)
       - Garak (scanner vulnérabilités LLM)
       - Strix (agent autonome agentic AI)
    ✅ Vérifie les versions GitHub et met à jour si nécessaire
    ✅ Installe requirements.txt avec uv pour chaque outil Python
    ✅ Teste que tout fonctionne correctement

.PARAMETER Mode
    Mode d'installation: 'standalone', 'fullstack', ou 'docker'
.PARAMETER SkipDependencies
    Ignore la vérification des prérequis
.PARAMETER SkipTests
    Ignore les tests de validation
.PARAMETER UpdateTools
    Force la mise à jour des outils depuis GitHub
.EXAMPLE
    .\install-complete.ps1
    .\install-complete.ps1 -Mode fullstack
    .\install-complete.ps1 -Mode docker -UpdateTools
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('standalone', 'fullstack', 'docker')]
    [string]$Mode = '',

    [Parameter(Mandatory=$false)]
    [switch]$SkipDependencies,

    [Parameter(Mandatory=$false)]
    [switch]$SkipTests,

    [Parameter(Mandatory=$false)]
    [switch]$UpdateTools
)

# Configuration globale
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$script:InstallLog = @()
$script:StartTime = Get-Date
$script:TotalSteps = 12

# URLs GitHub pour les outils
$script:GitHubRepos = @{
    'Promptfoo' = 'https://github.com/promptfoo/promptfoo'
    'Garak' = 'https://github.com/leondz/garak'
    'Strix' = 'https://github.com/BishopFox/strix'
}

# ============================================
# FONCTIONS UTILITAIRES
# ============================================

function Write-ColorOutput {
    param(
        [string]$Message,
        [ValidateSet('Success', 'Error', 'Warning', 'Info', 'Header', 'SubHeader', 'Progress')]
        [string]$Type = 'Info'
    )

    $color = switch ($Type) {
        'Success'    { 'Green' }
        'Error'      { 'Red' }
        'Warning'    { 'Yellow' }
        'Info'       { 'Cyan' }
        'Header'     { 'Magenta' }
        'SubHeader'  { 'Blue' }
        'Progress'   { 'DarkCyan' }
        default      { 'White' }
    }

    $timestamp = Get-Date -Format "HH:mm:ss"
    $logEntry = "[$timestamp] [$Type] $Message"
    $script:InstallLog += $logEntry

    Write-Host $Message -ForegroundColor $color
}

function Write-Header {
    param([string]$Text, [int]$Step = 0)
    Write-Host ""
    Write-ColorOutput "╔════════════════════════════════════════════════════════════════╗" -Type Header
    if ($Step -gt 0) {
        Write-ColorOutput "║  [$Step/$($script:TotalSteps)] $($Text.PadRight(55))  ║" -Type Header
    } else {
        Write-ColorOutput "║  $($Text.PadRight(60))  ║" -Type Header
    }
    Write-ColorOutput "╚════════════════════════════════════════════════════════════════╝" -Type Header
    Write-Host ""
}

function Write-SubHeader {
    param([string]$Text)
    Write-Host ""
    Write-ColorOutput "┌─ $Text" -Type SubHeader
}

function Write-Progress {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Activity
    )
    $percent = [math]::Round(($Current / $Total) * 100)
    $bar = "█" * [math]::Round($percent / 5) + "░" * (20 - [math]::Round($percent / 5))
    Write-ColorOutput "[$bar] $percent% - $Activity" -Type Progress
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

function Get-VersionInfo {
    param(
        [string]$Command,
        [string]$VersionArg = "--version"
    )
    try {
        $output = & $Command $VersionArg 2>&1
        if ($output -match '(\d+)\.(\d+)\.(\d+)') {
            return @{
                Major = [int]$Matches[1]
                Minor = [int]$Matches[2]
                Patch = [int]$Matches[3]
                Full = "$($Matches[1]).$($Matches[2]).$($Matches[3])"
            }
        }
    } catch {
        return $null
    }
    return $null
}

function Save-InstallLog {
    $logPath = "install_log_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    $script:InstallLog | Out-File -FilePath $logPath -Encoding UTF8
    Write-ColorOutput "📄 Log d'installation sauvegardé: $logPath" -Type Info
}

function Write-Banner {
    Clear-Host
    Write-Host ""
    Write-ColorOutput "╔══════════════════════════════════════════════════════════════════════╗" -Type Header
    Write-ColorOutput "║                                                                      ║" -Type Header
    Write-ColorOutput "║             AI RISK MANAGER - INSTALLATION COMPLÈTE                 ║" -Type Header
    Write-ColorOutput "║          Plateforme Unifiée Pentest (Promptfoo + Garak + Strix)     ║" -Type Header
    Write-ColorOutput "║                                                                      ║" -Type Header
    Write-ColorOutput "║                          Version 2.0                                 ║" -Type Header
    Write-ColorOutput "║                Inclut: Python + uv + GitHub Integration             ║" -Type Header
    Write-ColorOutput "║                                                                      ║" -Type Header
    Write-ColorOutput "╚══════════════════════════════════════════════════════════════════════╝" -Type Header
    Write-Host ""
}

# ============================================
# VÉRIFICATION DES PRÉREQUIS
# ============================================

function Test-Prerequisites {
    Write-Header "Vérification des Prérequis Système" -Step 1

    $allOk = $true
    $currentStep = 0
    $totalChecks = 10

    # 1. Vérifier Node.js
    $currentStep++
    Write-Progress -Current $currentStep -Total $totalChecks -Activity "Vérification de Node.js"
    Write-SubHeader "Node.js"

    if (Test-CommandExists "node") {
        $nodeVer = Get-VersionInfo -Command "node" -VersionArg "--version"
        if ($nodeVer -and $nodeVer.Major -ge 18) {
            Write-ColorOutput "  ✓ Node.js $($nodeVer.Full) installé (>= 18 requis)" -Type Success
        } else {
            Write-ColorOutput "  ✗ Node.js version insuffisante. Version 18+ requise." -Type Error
            Write-ColorOutput "    → Télécharger: https://nodejs.org/" -Type Warning
            $allOk = $false
        }
    } else {
        Write-ColorOutput "  ✗ Node.js n'est pas installé. Version 18+ requise." -Type Error
        Write-ColorOutput "    → Télécharger: https://nodejs.org/" -Type Warning
        $allOk = $false
    }

    # 2. Vérifier npm
    $currentStep++
    Write-Progress -Current $currentStep -Total $totalChecks -Activity "Vérification de npm"
    Write-SubHeader "npm"

    if (Test-CommandExists "npm") {
        $npmVer = Get-VersionInfo -Command "npm"
        if ($npmVer -and $npmVer.Major -ge 9) {
            Write-ColorOutput "  ✓ npm $($npmVer.Full) installé (>= 9 requis)" -Type Success
        } else {
            Write-ColorOutput "  ✗ npm version insuffisante. Version 9+ requise." -Type Error
            $allOk = $false
        }
    } else {
        Write-ColorOutput "  ✗ npm n'est pas installé" -Type Error
        $allOk = $false
    }

    # 3. Vérifier Python
    $currentStep++
    Write-Progress -Current $currentStep -Total $totalChecks -Activity "Vérification de Python"
    Write-SubHeader "Python"

    if (Test-CommandExists "python") {
        $pythonVer = Get-VersionInfo -Command "python"
        if ($pythonVer -and $pythonVer.Major -ge 3 -and $pythonVer.Minor -ge 10) {
            Write-ColorOutput "  ✓ Python $($pythonVer.Full) installé (>= 3.10 requis)" -Type Success
        } else {
            Write-ColorOutput "  ✗ Python $($pythonVer.Full) détecté. Version 3.10+ requise." -Type Error
            Write-ColorOutput "    → Télécharger: https://www.python.org/downloads/" -Type Warning
            $allOk = $false
        }
    } else {
        Write-ColorOutput "  ✗ Python n'est pas installé. Version 3.10+ requise pour Garak et Strix." -Type Error
        Write-ColorOutput "    → Télécharger: https://www.python.org/downloads/" -Type Warning
        $allOk = $false
    }

    # 4. Vérifier uv (gestionnaire de packages Python)
    $currentStep++
    Write-Progress -Current $currentStep -Total $totalChecks -Activity "Vérification de uv"
    Write-SubHeader "uv (Python Package Manager)"

    if (Test-CommandExists "uv") {
        $uvVer = Get-VersionInfo -Command "uv"
        Write-ColorOutput "  ✓ uv $($uvVer.Full) installé" -Type Success
    } else {
        Write-ColorOutput "  ⚠ uv n'est pas installé (sera installé automatiquement)" -Type Warning
        Write-ColorOutput "    → uv est un gestionnaire de packages Python ultra-rapide" -Type Info
    }

    # 5. Vérifier pip
    $currentStep++
    Write-Progress -Current $currentStep -Total $totalChecks -Activity "Vérification de pip"
    Write-SubHeader "pip"

    if (Test-CommandExists "pip") {
        $pipVer = Get-VersionInfo -Command "pip"
        Write-ColorOutput "  ✓ pip $($pipVer.Full) installé" -Type Success
    } else {
        Write-ColorOutput "  ⚠ pip n'est pas installé" -Type Warning
        $allOk = $false
    }

    # 6. Vérifier Git
    $currentStep++
    Write-Progress -Current $currentStep -Total $totalChecks -Activity "Vérification de Git"
    Write-SubHeader "Git"

    if (Test-CommandExists "git") {
        $gitVersion = git --version
        Write-ColorOutput "  ✓ Git installé: $gitVersion" -Type Success
    } else {
        Write-ColorOutput "  ✗ Git n'est pas installé (REQUIS pour cloner Garak et Strix)" -Type Error
        Write-ColorOutput "    → Télécharger: https://git-scm.com/" -Type Warning
        $allOk = $false
    }

    # 7. Vérifier Docker (pour modes fullstack/docker)
    if ($Mode -eq 'docker' -or $Mode -eq 'fullstack') {
        $currentStep++
        Write-Progress -Current $currentStep -Total $totalChecks -Activity "Vérification de Docker"
        Write-SubHeader "Docker"

        if (Test-CommandExists "docker") {
            try {
                $dockerVersion = docker --version
                Write-ColorOutput "  ✓ Docker installé: $dockerVersion" -Type Success

                docker ps 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "  ✓ Docker est en cours d'exécution" -Type Success
                } else {
                    Write-ColorOutput "  ✗ Docker est installé mais n'est pas démarré" -Type Error
                    Write-ColorOutput "    → Démarrez Docker Desktop et réessayez" -Type Warning
                    $allOk = $false
                }
            } catch {
                Write-ColorOutput "  ✗ Erreur lors de la vérification de Docker" -Type Error
                $allOk = $false
            }
        } else {
            Write-ColorOutput "  ✗ Docker n'est pas installé (requis pour mode fullstack/docker)" -Type Error
            Write-ColorOutput "    → Télécharger: https://www.docker.com/products/docker-desktop" -Type Warning
            $allOk = $false
        }

        # 8. Vérifier docker-compose
        $currentStep++
        Write-Progress -Current $currentStep -Total $totalChecks -Activity "Vérification de docker-compose"
        Write-SubHeader "Docker Compose"

        if (Test-CommandExists "docker-compose") {
            $composeVersion = docker-compose --version
            Write-ColorOutput "  ✓ docker-compose installé: $composeVersion" -Type Success
        } elseif (Test-CommandExists "docker") {
            docker compose version 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                $composeVersion = docker compose version
                Write-ColorOutput "  ✓ docker compose installé: $composeVersion" -Type Success
            } else {
                Write-ColorOutput "  ✗ docker-compose n'est pas installé" -Type Error
                $allOk = $false
            }
        }
    }

    # 9. Vérifier l'espace disque
    $currentStep++
    Write-Progress -Current $currentStep -Total $totalChecks -Activity "Vérification de l'espace disque"
    Write-SubHeader "Espace Disque"

    try {
        $drive = (Get-Location).Drive
        $freeSpaceGB = [math]::Round((Get-PSDrive $drive.Name).Free / 1GB, 2)
        if ($freeSpaceGB -gt 10) {
            Write-ColorOutput "  ✓ Espace disque disponible: $freeSpaceGB GB (>10 GB recommandé)" -Type Success
        } else {
            Write-ColorOutput "  ⚠ Espace disque faible: $freeSpaceGB GB (<10 GB)" -Type Warning
            Write-ColorOutput "    → Les outils Python peuvent nécessiter beaucoup d'espace" -Type Warning
        }
    } catch {
        Write-ColorOutput "  ⚠ Impossible de vérifier l'espace disque disponible" -Type Warning
    }

    # 10. Vérifier les ports
    $currentStep++
    Write-Progress -Current $currentStep -Total $totalChecks -Activity "Vérification des ports"
    Write-SubHeader "Ports Réseau"

    $requiredPorts = @{
        5080 = "Frontend (standalone)"
        3004 = "Frontend (Docker)"
        3003 = "API Gateway"
        5435 = "PostgreSQL"
        6380 = "Redis"
    }

    foreach ($port in $requiredPorts.Keys) {
        try {
            $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
            if ($connection.TcpTestSucceeded) {
                Write-ColorOutput "  ⚠ Port $port ($($requiredPorts[$port])) est déjà utilisé" -Type Warning
            } else {
                Write-ColorOutput "  ✓ Port $port ($($requiredPorts[$port])) est disponible" -Type Success
            }
        } catch {
            Write-ColorOutput "  ✓ Port $port ($($requiredPorts[$port])) est disponible" -Type Success
        }
    }

    if (-not $allOk) {
        Write-Host ""
        Write-ColorOutput "╔════════════════════════════════════════════════════════════════╗" -Type Error
        Write-ColorOutput "║  ❌ ERREUR: Des prérequis critiques sont manquants            ║" -Type Error
        Write-ColorOutput "║                                                                ║" -Type Error
        Write-ColorOutput "║  Installez les composants manquants et relancez ce script     ║" -Type Error
        Write-ColorOutput "╚════════════════════════════════════════════════════════════════╝" -Type Error
        Write-Host ""
        Save-InstallLog
        exit 1
    }

    Write-Host ""
    Write-ColorOutput "✓ Tous les prérequis sont satisfaits!" -Type Success
    Write-Host ""
}

# ============================================
# INSTALLATION DE UV
# ============================================

function Install-Uv {
    Write-Header "Installation de uv (Python Package Manager)" -Step 2

    if (Test-CommandExists "uv") {
        Write-ColorOutput "✓ uv est déjà installé" -Type Success
        return
    }

    Write-SubHeader "Installation via pip"
    Write-ColorOutput "📦 pip install uv..." -Type Info

    try {
        python -m pip install --upgrade uv 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ uv installé avec succès" -Type Success

            # Vérifier l'installation
            if (Test-CommandExists "uv") {
                $uvVer = Get-VersionInfo -Command "uv"
                Write-ColorOutput "✓ uv $($uvVer.Full) est maintenant disponible" -Type Success
            } else {
                Write-ColorOutput "⚠ uv installé mais non disponible dans PATH. Redémarrage du terminal recommandé." -Type Warning
            }
        } else {
            throw "Installation de uv échouée"
        }
    } catch {
        Write-ColorOutput "✗ Erreur lors de l'installation de uv" -Type Error
        Write-ColorOutput "  → Tentative d'installation via pipx..." -Type Info

        try {
            python -m pip install --upgrade pipx 2>&1 | Out-Null
            python -m pipx install uv 2>&1 | Out-Null
            Write-ColorOutput "✓ uv installé via pipx" -Type Success
        } catch {
            Write-ColorOutput "✗ Impossible d'installer uv. Continuer avec pip uniquement." -Type Warning
        }
    }
}

# Suite dans le prochain bloc...
