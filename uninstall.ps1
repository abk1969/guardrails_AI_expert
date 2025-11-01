#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de désinstallation/nettoyage pour AI RISK MANAGER
.DESCRIPTION
    Nettoie les dépendances, conteneurs Docker et fichiers générés
.PARAMETER CleanAll
    Supprime tout y compris les fichiers .env
.PARAMETER CleanDocker
    Arrête et supprime uniquement les conteneurs Docker
.EXAMPLE
    .\uninstall.ps1
    .\uninstall.ps1 -CleanAll
    .\uninstall.ps1 -CleanDocker
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [switch]$CleanAll,

    [Parameter(Mandatory=$false)]
    [switch]$CleanDocker
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

Clear-Host
Write-Header "AI RISK MANAGER - Nettoyage"

if ($CleanDocker -or $CleanAll) {
    Write-Header "Arrêt et suppression des conteneurs Docker"

    try {
        Write-ColorOutput "🐳 Arrêt des services Docker..." -Type Info
        docker-compose down -v 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ Conteneurs Docker arrêtés et supprimés" -Type Success
        }

        # Nettoyage des images
        $cleanImages = Read-Host "Voulez-vous aussi supprimer les images Docker? (O/N)"
        if ($cleanImages -eq 'O' -or $cleanImages -eq 'o') {
            Write-ColorOutput "🗑️  Suppression des images Docker..." -Type Info
            docker-compose down --rmi all 2>&1 | Out-Null
            Write-ColorOutput "✓ Images Docker supprimées" -Type Success
        }
    } catch {
        Write-ColorOutput "⚠️  Erreur lors du nettoyage Docker: $($_.Exception.Message)" -Type Warning
    }
}

if (-not $CleanDocker) {
    Write-Header "Nettoyage des dépendances"

    # Supprimer node_modules frontend
    if (Test-Path "node_modules") {
        Write-ColorOutput "🗑️  Suppression de node_modules (frontend)..." -Type Info
        Remove-Item -Recurse -Force "node_modules"
        Write-ColorOutput "✓ node_modules (frontend) supprimé" -Type Success
    }

    # Supprimer package-lock.json frontend
    if (Test-Path "package-lock.json") {
        Write-ColorOutput "🗑️  Suppression de package-lock.json (frontend)..." -Type Info
        Remove-Item -Force "package-lock.json"
        Write-ColorOutput "✓ package-lock.json (frontend) supprimé" -Type Success
    }

    # Supprimer node_modules backend
    if (Test-Path "backend/node_modules") {
        Write-ColorOutput "🗑️  Suppression de node_modules (backend)..." -Type Info
        Remove-Item -Recurse -Force "backend/node_modules"
        Write-ColorOutput "✓ node_modules (backend) supprimé" -Type Success
    }

    # Supprimer package-lock.json backend
    if (Test-Path "backend/package-lock.json") {
        Write-ColorOutput "🗑️  Suppression de package-lock.json (backend)..." -Type Info
        Remove-Item -Force "backend/package-lock.json"
        Write-ColorOutput "✓ package-lock.json (backend) supprimé" -Type Success
    }

    # Supprimer dist/build
    if (Test-Path "dist") {
        Write-ColorOutput "🗑️  Suppression du dossier dist..." -Type Info
        Remove-Item -Recurse -Force "dist"
        Write-ColorOutput "✓ Dossier dist supprimé" -Type Success
    }

    if (Test-Path "backend/dist") {
        Write-ColorOutput "🗑️  Suppression du dossier backend/dist..." -Type Info
        Remove-Item -Recurse -Force "backend/dist"
        Write-ColorOutput "✓ Dossier backend/dist supprimé" -Type Success
    }

    # Supprimer fichiers Prisma générés
    if (Test-Path "backend/node_modules/.prisma") {
        Write-ColorOutput "🗑️  Suppression des fichiers Prisma générés..." -Type Info
        Remove-Item -Recurse -Force "backend/node_modules/.prisma"
        Write-ColorOutput "✓ Fichiers Prisma supprimés" -Type Success
    }
}

if ($CleanAll) {
    Write-Header "Nettoyage complet (incluant .env)"

    $confirm = Read-Host "⚠️  Êtes-vous sûr de vouloir supprimer les fichiers .env? (O/N)"

    if ($confirm -eq 'O' -or $confirm -eq 'o') {
        if (Test-Path ".env") {
            Remove-Item -Force ".env"
            Write-ColorOutput "✓ Fichier .env supprimé" -Type Success
        }

        if (Test-Path "backend/.env") {
            Remove-Item -Force "backend/.env"
            Write-ColorOutput "✓ Fichier backend/.env supprimé" -Type Success
        }

        Write-ColorOutput "⚠️  Fichiers de configuration supprimés" -Type Warning
    } else {
        Write-ColorOutput "ℹ️  Fichiers .env conservés" -Type Info
    }
}

Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
Write-ColorOutput "Nettoyage terminé! ✨" -Type Success
Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
Write-Host ""

Write-ColorOutput "Pour réinstaller, exécutez: .\install.ps1" -Type Info
Write-Host ""
