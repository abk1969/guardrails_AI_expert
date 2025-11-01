#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de migration pour AI RISK MANAGER
.DESCRIPTION
    Gère les migrations de base de données Prisma et les migrations de données
.PARAMETER Action
    Action à effectuer: 'create', 'apply', 'reset', 'status', 'seed'
.PARAMETER Name
    Nom de la migration (pour create)
.EXAMPLE
    .\migrate.ps1 -Action status
    .\migrate.ps1 -Action create -Name "add_user_roles"
    .\migrate.ps1 -Action apply
    .\migrate.ps1 -Action reset
    .\migrate.ps1 -Action seed
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('create', 'apply', 'reset', 'status', 'seed', 'rollback')]
    [string]$Action = '',

    [Parameter(Mandatory=$false)]
    [string]$Name = ''
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

function Test-PrismaSetup {
    if (-not (Test-Path "backend/prisma/schema.prisma")) {
        Write-ColorOutput "✗ Schéma Prisma introuvable" -Type Error
        Write-ColorOutput "  Assurez-vous d'être dans le répertoire racine du projet" -Type Warning
        return $false
    }

    if (-not (Test-Path "backend/.env")) {
        Write-ColorOutput "✗ Fichier backend/.env introuvable" -Type Error
        Write-ColorOutput "  Créez le fichier .env avec DATABASE_URL" -Type Warning
        return $false
    }

    return $true
}

function Test-DatabaseConnection {
    Write-ColorOutput "🔍 Test de la connexion à la base de données..." -Type Info

    Push-Location backend
    try {
        $result = npm run prisma:studio -- --browser none 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ Connexion à la base de données réussie" -Type Success
            Pop-Location
            return $true
        }
    } catch {
        Write-ColorOutput "✗ Impossible de se connecter à la base de données" -Type Error
        Write-ColorOutput "  Vérifiez que PostgreSQL est démarré: docker-compose up -d postgres" -Type Warning
        Pop-Location
        return $false
    }
    Pop-Location
    return $false
}

function Show-MigrationStatus {
    Write-Header "Statut des Migrations"

    if (-not (Test-PrismaSetup)) { return }

    Push-Location backend
    try {
        Write-ColorOutput "📊 État actuel des migrations:" -Type Info
        Write-Host ""

        # Afficher le statut des migrations
        npx prisma migrate status

        Write-Host ""

        # Afficher les migrations appliquées
        if (Test-Path "prisma/migrations") {
            $migrations = Get-ChildItem -Path "prisma/migrations" -Directory | Sort-Object Name

            if ($migrations.Count -gt 0) {
                Write-ColorOutput "📜 Migrations disponibles:" -Type Info
                foreach ($migration in $migrations) {
                    Write-ColorOutput "  • $($migration.Name)" -Type Success
                }
            } else {
                Write-ColorOutput "ℹ️  Aucune migration trouvée" -Type Info
            }
        }

    } catch {
        Write-ColorOutput "✗ Erreur lors de la vérification du statut: $($_.Exception.Message)" -Type Error
    } finally {
        Pop-Location
    }
}

function Create-Migration {
    param([string]$MigrationName)

    Write-Header "Création d'une Nouvelle Migration"

    if (-not (Test-PrismaSetup)) { return }

    if ([string]::IsNullOrEmpty($MigrationName)) {
        $MigrationName = Read-Host "Nom de la migration"
        if ([string]::IsNullOrEmpty($MigrationName)) {
            Write-ColorOutput "✗ Nom de migration requis" -Type Error
            return
        }
    }

    # Nettoyer le nom (remplacer espaces par underscores)
    $MigrationName = $MigrationName -replace '\s+', '_'

    Write-ColorOutput "📝 Création de la migration: $MigrationName" -Type Info
    Write-Host ""

    Push-Location backend
    try {
        # Créer un backup avant la migration
        Write-ColorOutput "💾 Création d'un backup avant migration..." -Type Info
        & "$(Split-Path -Parent $PSScriptRoot)\backup.ps1" -Type database -Confirm:$false 2>&1 | Out-Null

        # Créer la migration
        npx prisma migrate dev --name $MigrationName --create-only

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-ColorOutput "✓ Migration créée avec succès!" -Type Success
            Write-ColorOutput "  Fichier: prisma/migrations/[timestamp]_$MigrationName" -Type Info
            Write-Host ""

            $apply = Read-Host "Voulez-vous appliquer cette migration maintenant? (O/N)"
            if ($apply -eq 'O' -or $apply -eq 'o') {
                npx prisma migrate dev
                Write-ColorOutput "✓ Migration appliquée" -Type Success
            } else {
                Write-ColorOutput "ℹ️  Migration créée mais non appliquée" -Type Info
                Write-ColorOutput "  Appliquez-la avec: .\migrate.ps1 -Action apply" -Type Info
            }
        } else {
            throw "Échec de la création de la migration"
        }

    } catch {
        Write-ColorOutput "✗ Erreur lors de la création: $($_.Exception.Message)" -Type Error
    } finally {
        Pop-Location
    }
}

function Apply-Migrations {
    Write-Header "Application des Migrations"

    if (-not (Test-PrismaSetup)) { return }

    Write-ColorOutput "⚠️  Cette action va appliquer toutes les migrations en attente" -Type Warning
    $confirm = Read-Host "Continuer? (O/N)"

    if ($confirm -ne 'O' -and $confirm -ne 'o') {
        Write-ColorOutput "❌ Annulé" -Type Warning
        return
    }

    Push-Location backend
    try {
        # Créer un backup avant
        Write-ColorOutput "💾 Création d'un backup avant migration..." -Type Info
        & "$PSScriptRoot\backup.ps1" -Type database 2>&1 | Out-Null

        Write-Host ""
        Write-ColorOutput "🔄 Application des migrations..." -Type Info

        # Pour la production, utiliser migrate deploy
        # Pour le développement, utiliser migrate dev
        $env = Read-Host "Environnement (dev/prod)? [dev]"
        if ([string]::IsNullOrEmpty($env)) { $env = "dev" }

        if ($env -eq "prod") {
            npx prisma migrate deploy
        } else {
            npx prisma migrate dev
        }

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-ColorOutput "✓ Migrations appliquées avec succès!" -Type Success

            # Régénérer le client Prisma
            Write-ColorOutput "🔧 Régénération du client Prisma..." -Type Info
            npm run prisma:generate 2>&1 | Out-Null
            Write-ColorOutput "✓ Client Prisma régénéré" -Type Success
        } else {
            throw "Échec de l'application des migrations"
        }

    } catch {
        Write-ColorOutput "✗ Erreur lors de l'application: $($_.Exception.Message)" -Type Error
        Write-ColorOutput "  Restaurez le backup si nécessaire: .\backup.ps1 -Restore backups/..." -Type Warning
    } finally {
        Pop-Location
    }
}

function Reset-Database {
    Write-Header "Réinitialisation de la Base de Données"

    if (-not (Test-PrismaSetup)) { return }

    Write-ColorOutput "⚠️  ATTENTION: Cette action va:" -Type Error
    Write-ColorOutput "  • Supprimer TOUTES les données de la base" -Type Error
    Write-ColorOutput "  • Supprimer toutes les tables" -Type Error
    Write-ColorOutput "  • Réappliquer toutes les migrations" -Type Error
    Write-Host ""

    $confirm = Read-Host "Êtes-vous ABSOLUMENT sûr? Tapez 'RESET' pour confirmer"

    if ($confirm -ne 'RESET') {
        Write-ColorOutput "❌ Annulé (heureusement!)" -Type Warning
        return
    }

    Push-Location backend
    try {
        # Créer un backup avant (au cas où)
        Write-ColorOutput "💾 Création d'un backup de sécurité..." -Type Info
        & "$PSScriptRoot\backup.ps1" -Type full 2>&1 | Out-Null

        Write-Host ""
        Write-ColorOutput "🔄 Réinitialisation en cours..." -Type Info

        npx prisma migrate reset --force

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-ColorOutput "✓ Base de données réinitialisée!" -Type Success

            $seed = Read-Host "Voulez-vous peupler avec des données de test? (O/N)"
            if ($seed -eq 'O' -or $seed -eq 'o') {
                Write-ColorOutput "🌱 Exécution du seed..." -Type Info
                npm run prisma:seed 2>&1
                Write-ColorOutput "✓ Données de test insérées" -Type Success
            }
        } else {
            throw "Échec de la réinitialisation"
        }

    } catch {
        Write-ColorOutput "✗ Erreur lors de la réinitialisation: $($_.Exception.Message)" -Type Error
    } finally {
        Pop-Location
    }
}

function Seed-Database {
    Write-Header "Peuplement de la Base de Données"

    if (-not (Test-PrismaSetup)) { return }

    Push-Location backend
    try {
        # Vérifier si un fichier seed existe
        if (-not (Test-Path "prisma/seed.ts")) {
            Write-ColorOutput "⚠️  Fichier prisma/seed.ts introuvable" -Type Warning
            Write-ColorOutput "  Création d'un fichier seed basique..." -Type Info

            $seedContent = @"
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // TODO: Ajouter vos données de test ici

  console.log('✓ Seeding terminé!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.\$disconnect();
  });
"@

            New-Item -Path "prisma" -Name "seed.ts" -ItemType File -Force | Out-Null
            Set-Content -Path "prisma/seed.ts" -Value $seedContent

            Write-ColorOutput "✓ Fichier seed.ts créé" -Type Success
            Write-ColorOutput "  Éditez prisma/seed.ts et ajoutez vos données de test" -Type Info
            Write-Host ""

            $editNow = Read-Host "Voulez-vous ouvrir le fichier maintenant? (O/N)"
            if ($editNow -eq 'O' -or $editNow -eq 'o') {
                & code "prisma/seed.ts"
            }

            Pop-Location
            return
        }

        Write-ColorOutput "🌱 Exécution du script de seed..." -Type Info
        npm run prisma:seed

        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✓ Base de données peuplée avec succès!" -Type Success
        } else {
            throw "Échec du seeding"
        }

    } catch {
        Write-ColorOutput "✗ Erreur lors du seeding: $($_.Exception.Message)" -Type Error
    } finally {
        Pop-Location
    }
}

function Rollback-Migration {
    Write-Header "Rollback de Migration"

    Write-ColorOutput "⚠️  Prisma ne supporte pas nativement le rollback" -Type Warning
    Write-ColorOutput "  Options disponibles:" -Type Info
    Write-Host ""
    Write-ColorOutput "  1. Restaurer depuis un backup:" -Type Info
    Write-ColorOutput "     .\backup.ps1 -Restore backups/backup_XXXXXXXX_XXXXXX" -Type Info
    Write-Host ""
    Write-ColorOutput "  2. Créer une migration inverse manuelle:" -Type Info
    Write-ColorOutput "     - Modifiez le schema.prisma pour revenir en arrière" -Type Info
    Write-ColorOutput "     - Créez une nouvelle migration: .\migrate.ps1 -Action create -Name rollback_xxx" -Type Info
    Write-Host ""
    Write-ColorOutput "  3. Reset complet (DANGER):" -Type Info
    Write-ColorOutput "     .\migrate.ps1 -Action reset" -Type Info
    Write-Host ""

    $showBackups = Read-Host "Voulez-vous voir les backups disponibles? (O/N)"
    if ($showBackups -eq 'O' -or $showBackups -eq 'o') {
        & "$PSScriptRoot\backup.ps1" 2>&1
    }
}

function Show-PrismaStudio {
    Write-Header "Ouverture de Prisma Studio"

    if (-not (Test-PrismaSetup)) { return }

    Write-ColorOutput "🎨 Lancement de Prisma Studio..." -Type Info
    Write-ColorOutput "  URL: http://localhost:5555" -Type Info
    Write-ColorOutput "  Appuyez sur Ctrl+C pour arrêter" -Type Info
    Write-Host ""

    Push-Location backend
    npm run prisma:studio
    Pop-Location
}

# ============================================
# Script Principal
# ============================================

Clear-Host
Write-Header "AI RISK MANAGER - Gestion des Migrations"

# Vérifier Prisma
if (-not (Test-PrismaSetup)) {
    exit 1
}

# Si aucune action n'est spécifiée, afficher le menu
if ([string]::IsNullOrEmpty($Action)) {
    Write-ColorOutput "Que voulez-vous faire?" -Type Info
    Write-Host ""
    Write-ColorOutput "  1) Status      - Voir l'état des migrations" -Type Info
    Write-ColorOutput "  2) Create      - Créer une nouvelle migration" -Type Info
    Write-ColorOutput "  3) Apply       - Appliquer les migrations en attente" -Type Info
    Write-ColorOutput "  4) Seed        - Peupler la base avec des données de test" -Type Info
    Write-ColorOutput "  5) Reset       - Réinitialiser complètement la base" -Type Info
    Write-ColorOutput "  6) Rollback    - Annuler une migration (voir options)" -Type Info
    Write-ColorOutput "  7) Studio      - Ouvrir Prisma Studio (GUI)" -Type Info
    Write-Host ""

    $choice = Read-Host "Votre choix (1-7)"

    $Action = switch ($choice) {
        '1' { 'status' }
        '2' { 'create' }
        '3' { 'apply' }
        '4' { 'seed' }
        '5' { 'reset' }
        '6' { 'rollback' }
        '7' { 'studio' }
        default {
            Write-ColorOutput "Choix invalide" -Type Error
            exit 1
        }
    }
}

# Exécuter l'action
switch ($Action) {
    'status' { Show-MigrationStatus }
    'create' { Create-Migration -MigrationName $Name }
    'apply' { Apply-Migrations }
    'reset' { Reset-Database }
    'seed' { Seed-Database }
    'rollback' { Rollback-Migration }
    'studio' { Show-PrismaStudio }
}

Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
Write-ColorOutput "Terminé! ✨" -Type Success
Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
Write-Host ""
