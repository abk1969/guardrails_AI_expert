#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de mise à jour pour AI RISK MANAGER
.DESCRIPTION
    Met à jour les dépendances et services du projet
.PARAMETER Component
    Composant à mettre à jour: 'all', 'frontend', 'backend', 'docker'
.PARAMETER Force
    Force la mise à jour même si aucun changement détecté
.EXAMPLE
    .\update.ps1
    .\update.ps1 -Component frontend
    .\update.ps1 -Force
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('all', 'frontend', 'backend', 'docker')]
    [string]$Component = 'all',

    [Parameter(Mandatory=$false)]
    [switch]$Force
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

function Update-Frontend {
    Write-Header "Mise à jour Frontend"

    if (Test-Path "package.json") {
        # Créer un backup du package-lock.json
        if (Test-Path "package-lock.json") {
            Write-ColorOutput "💾 Sauvegarde de package-lock.json..." -Type Info
            Copy-Item "package-lock.json" "package-lock.json.backup"
        }

        try {
            Write-ColorOutput "📦 Vérification des mises à jour disponibles..." -Type Info
            npm outdated | Out-String | Write-Host

            Write-ColorOutput "🔄 Mise à jour des dépendances..." -Type Info
            npm update

            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✓ Dépendances frontend mises à jour" -Type Success
            } else {
                throw "Échec de la mise à jour"
            }

            # Vérifier les vulnérabilités
            Write-ColorOutput "🔒 Audit de sécurité..." -Type Info
            npm audit fix --force 2>&1 | Out-Null

        } catch {
            Write-ColorOutput "✗ Erreur lors de la mise à jour frontend" -Type Error
            Write-ColorOutput $_.Exception.Message -Type Error

            # Restaurer le backup
            if (Test-Path "package-lock.json.backup") {
                Write-ColorOutput "🔄 Restauration du backup..." -Type Warning
                Move-Item "package-lock.json.backup" "package-lock.json" -Force
            }
            return $false
        }

        # Nettoyer le backup si tout s'est bien passé
        if (Test-Path "package-lock.json.backup") {
            Remove-Item "package-lock.json.backup" -Force
        }

        return $true
    } else {
        Write-ColorOutput "✗ package.json introuvable" -Type Error
        return $false
    }
}

function Update-Backend {
    Write-Header "Mise à jour Backend"

    if (Test-Path "backend/package.json") {
        Push-Location backend

        # Créer un backup du package-lock.json
        if (Test-Path "package-lock.json") {
            Write-ColorOutput "💾 Sauvegarde de package-lock.json..." -Type Info
            Copy-Item "package-lock.json" "package-lock.json.backup"
        }

        try {
            Write-ColorOutput "📦 Vérification des mises à jour disponibles..." -Type Info
            npm outdated | Out-String | Write-Host

            Write-ColorOutput "🔄 Mise à jour des dépendances..." -Type Info
            npm update

            if ($LASTEXITCODE -ne 0) {
                throw "Échec de la mise à jour"
            }

            Write-ColorOutput "✓ Dépendances backend mises à jour" -Type Success

            # Vérifier les vulnérabilités
            Write-ColorOutput "🔒 Audit de sécurité..." -Type Info
            npm audit fix --force 2>&1 | Out-Null

            # Regénérer le client Prisma si le schéma existe
            if (Test-Path "prisma/schema.prisma") {
                Write-ColorOutput "🔧 Régénération du client Prisma..." -Type Info
                npm run prisma:generate 2>&1 | Out-Null
                Write-ColorOutput "✓ Client Prisma régénéré" -Type Success
            }

        } catch {
            Write-ColorOutput "✗ Erreur lors de la mise à jour backend" -Type Error
            Write-ColorOutput $_.Exception.Message -Type Error

            # Restaurer le backup
            if (Test-Path "package-lock.json.backup") {
                Write-ColorOutput "🔄 Restauration du backup..." -Type Warning
                Move-Item "package-lock.json.backup" "package-lock.json" -Force
            }
            Pop-Location
            return $false
        }

        # Nettoyer le backup si tout s'est bien passé
        if (Test-Path "package-lock.json.backup") {
            Remove-Item "package-lock.json.backup" -Force
        }

        Pop-Location
        return $true
    } else {
        Write-ColorOutput "✗ backend/package.json introuvable" -Type Error
        return $false
    }
}

function Update-DockerImages {
    Write-Header "Mise à jour des Images Docker"

    if (-not (Test-CommandExists "docker")) {
        Write-ColorOutput "✗ Docker n'est pas installé" -Type Error
        return $false
    }

    try {
        Write-ColorOutput "🐳 Récupération des dernières images..." -Type Info
        docker-compose pull

        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ Images Docker mises à jour" -Type Success

            # Demander si l'utilisateur veut reconstruire les images locales
            $rebuild = Read-Host "Voulez-vous reconstruire les images locales? (O/N)"
            if ($rebuild -eq 'O' -or $rebuild -eq 'o') {
                Write-ColorOutput "🔨 Reconstruction des images..." -Type Info
                docker-compose build --no-cache

                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "✓ Images reconstruites" -Type Success

                    # Demander si l'utilisateur veut redémarrer les services
                    $restart = Read-Host "Voulez-vous redémarrer les services? (O/N)"
                    if ($restart -eq 'O' -or $restart -eq 'o') {
                        Write-ColorOutput "🔄 Redémarrage des services..." -Type Info
                        docker-compose down
                        docker-compose up -d

                        if ($LASTEXITCODE -eq 0) {
                            Write-ColorOutput "✓ Services redémarrés" -Type Success
                        }
                    }
                }
            }
            return $true
        } else {
            throw "Échec de la mise à jour des images"
        }
    } catch {
        Write-ColorOutput "✗ Erreur lors de la mise à jour Docker" -Type Error
        Write-ColorOutput $_.Exception.Message -Type Error
        return $false
    }
}

function Show-ChangeLog {
    Write-Header "Résumé des Modifications"

    Write-ColorOutput "📊 Changements détectés:" -Type Info

    # Frontend
    if (Test-Path "package.json") {
        $outdated = npm outdated --json 2>$null | ConvertFrom-Json
        if ($outdated) {
            Write-ColorOutput "`n🎨 Frontend:" -Type Info
            $outdated.PSObject.Properties | ForEach-Object {
                $name = $_.Name
                $info = $_.Value
                Write-ColorOutput "  • $name: $($info.current) → $($info.latest)" -Type Warning
            }
        }
    }

    # Backend
    if (Test-Path "backend/package.json") {
        Push-Location backend
        $outdated = npm outdated --json 2>$null | ConvertFrom-Json
        if ($outdated) {
            Write-ColorOutput "`n⚙️  Backend:" -Type Info
            $outdated.PSObject.Properties | ForEach-Object {
                $name = $_.Name
                $info = $_.Value
                Write-ColorOutput "  • $name: $($info.current) → $($info.latest)" -Type Warning
            }
        }
        Pop-Location
    }
}

function Backup-BeforeUpdate {
    Write-Header "Création d'un Backup"

    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backups/update_$timestamp"

    Write-ColorOutput "💾 Création du backup dans $backupDir..." -Type Info

    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

    # Backup des fichiers critiques
    $filesToBackup = @(
        "package.json",
        "package-lock.json",
        ".env",
        "backend/package.json",
        "backend/package-lock.json",
        "backend/.env"
    )

    foreach ($file in $filesToBackup) {
        if (Test-Path $file) {
            $destination = Join-Path $backupDir $file
            $destDir = Split-Path $destination
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            Copy-Item $file $destination
            Write-ColorOutput "  ✓ $file" -Type Success
        }
    }

    Write-ColorOutput "✓ Backup créé avec succès" -Type Success
}

# ============================================
# Script Principal
# ============================================

Clear-Host
Write-Header "AI RISK MANAGER - Mise à Jour"

Write-ColorOutput "Composant à mettre à jour: $Component" -Type Info
Write-Host ""

# Créer un backup avant de commencer
if (-not $Force) {
    $createBackup = Read-Host "Créer un backup avant la mise à jour? (O/N)"
    if ($createBackup -eq 'O' -or $createBackup -eq 'o') {
        Backup-BeforeUpdate
    }
}

# Afficher les changements disponibles
if (-not $Force) {
    Show-ChangeLog
    Write-Host ""
    $continue = Read-Host "Continuer avec la mise à jour? (O/N)"
    if ($continue -ne 'O' -and $continue -ne 'o') {
        Write-ColorOutput "❌ Mise à jour annulée" -Type Warning
        exit 0
    }
}

$success = $true

# Exécuter les mises à jour selon le composant sélectionné
switch ($Component) {
    'all' {
        $success = (Update-Frontend) -and $success
        $success = (Update-Backend) -and $success
        $success = (Update-DockerImages) -and $success
    }
    'frontend' {
        $success = Update-Frontend
    }
    'backend' {
        $success = Update-Backend
    }
    'docker' {
        $success = Update-DockerImages
    }
}

Write-Host ""
if ($success) {
    Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
    Write-ColorOutput "Mise à jour terminée avec succès! ✨" -Type Success
    Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
    Write-Host ""

    Write-ColorOutput "🎯 Prochaines étapes:" -Type Info
    Write-ColorOutput "   1. Vérifiez que tout fonctionne correctement" -Type Info
    Write-ColorOutput "   2. Exécutez les tests: npm test" -Type Info
    Write-ColorOutput "   3. Si problème, restaurez depuis backups/" -Type Info
} else {
    Write-ColorOutput "❌ Certaines mises à jour ont échoué" -Type Error
    Write-ColorOutput "   Consultez les messages d'erreur ci-dessus" -Type Warning
    Write-ColorOutput "   Restaurez le backup si nécessaire" -Type Warning
}

Write-Host ""
