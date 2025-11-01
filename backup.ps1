#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de backup pour AI RISK MANAGER
.DESCRIPTION
    Crée des backups de la base de données, des fichiers de configuration et du code
.PARAMETER Type
    Type de backup: 'full', 'database', 'config', 'code'
.PARAMETER Restore
    Restaure depuis un backup spécifique
.EXAMPLE
    .\backup.ps1
    .\backup.ps1 -Type database
    .\backup.ps1 -Restore backups/backup_20250131_120000
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('full', 'database', 'config', 'code')]
    [string]$Type = 'full',

    [Parameter(Mandatory=$false)]
    [string]$Restore = ''
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

function Get-BackupDirectory {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupDir = "backups/backup_$timestamp"
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    return $backupDir
}

function Backup-Database {
    param([string]$BackupDir)

    Write-Header "Backup de la Base de Données"

    if (-not (Test-CommandExists "docker")) {
        Write-ColorOutput "⚠️  Docker n'est pas disponible, backup database ignoré" -Type Warning
        return $false
    }

    try {
        # Vérifier si le conteneur PostgreSQL est en cours d'exécution
        $postgresRunning = docker ps --filter "name=airiskmgr-postgres" --format "{{.Names}}" 2>$null

        if (-not $postgresRunning) {
            Write-ColorOutput "⚠️  Conteneur PostgreSQL non démarré" -Type Warning
            return $false
        }

        Write-ColorOutput "💾 Export de la base de données PostgreSQL..." -Type Info

        $dbBackupFile = Join-Path $BackupDir "database_dump.sql"
        docker exec airiskmgr-postgres pg_dump -U airiskmgr -d airiskmgr_db -F p -f /tmp/dump.sql 2>&1 | Out-Null
        docker cp airiskmgr-postgres:/tmp/dump.sql $dbBackupFile 2>&1 | Out-Null

        if (Test-Path $dbBackupFile) {
            $size = (Get-Item $dbBackupFile).Length / 1MB
            Write-ColorOutput "✓ Base de données sauvegardée ($([math]::Round($size, 2)) MB)" -Type Success
            return $true
        } else {
            throw "Fichier de backup non créé"
        }

    } catch {
        Write-ColorOutput "✗ Erreur lors du backup de la base de données" -Type Error
        Write-ColorOutput $_.Exception.Message -Type Error
        return $false
    }
}

function Backup-RedisData {
    param([string]$BackupDir)

    Write-ColorOutput "📦 Backup des données Redis..." -Type Info

    if (-not (Test-CommandExists "docker")) {
        Write-ColorOutput "⚠️  Docker n'est pas disponible" -Type Warning
        return $false
    }

    try {
        $redisRunning = docker ps --filter "name=airiskmgr-redis" --format "{{.Names}}" 2>$null

        if (-not $redisRunning) {
            Write-ColorOutput "⚠️  Conteneur Redis non démarré" -Type Warning
            return $false
        }

        # Forcer Redis à sauvegarder
        docker exec airiskmgr-redis redis-cli -a redis_dev_password SAVE 2>&1 | Out-Null

        # Copier le fichier dump.rdb
        $redisBackupFile = Join-Path $BackupDir "redis_dump.rdb"
        docker cp airiskmgr-redis:/data/dump.rdb $redisBackupFile 2>&1 | Out-Null

        if (Test-Path $redisBackupFile) {
            Write-ColorOutput "✓ Données Redis sauvegardées" -Type Success
            return $true
        }

    } catch {
        Write-ColorOutput "⚠️  Impossible de sauvegarder Redis: $($_.Exception.Message)" -Type Warning
        return $false
    }
}

function Backup-Configuration {
    param([string]$BackupDir)

    Write-Header "Backup de la Configuration"

    $configFiles = @(
        ".env",
        "backend/.env",
        "docker-compose.yml",
        "vite.config.ts",
        "tsconfig.json",
        "backend/tsconfig.json",
        "backend/nest-cli.json",
        "backend/prisma/schema.prisma"
    )

    $backupCount = 0

    foreach ($file in $configFiles) {
        if (Test-Path $file) {
            $destination = Join-Path $BackupDir $file
            $destDir = Split-Path $destination

            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            Copy-Item $file $destination -Force

            Write-ColorOutput "  ✓ $file" -Type Success
            $backupCount++
        }
    }

    if ($backupCount -gt 0) {
        Write-ColorOutput "✓ $backupCount fichiers de configuration sauvegardés" -Type Success
        return $true
    } else {
        Write-ColorOutput "⚠️  Aucun fichier de configuration trouvé" -Type Warning
        return $false
    }
}

function Backup-LocalStorage {
    param([string]$BackupDir)

    Write-ColorOutput "💾 Backup des données localStorage..." -Type Info

    # Créer un fichier README expliquant que les données localStorage
    # sont dans le navigateur et doivent être exportées manuellement
    $readmeContent = @"
# Backup des Données localStorage

Les données localStorage sont stockées dans votre navigateur et ne peuvent pas être
sauvegardées automatiquement par ce script.

## Pour sauvegarder manuellement vos données:

1. Ouvrez l'application dans votre navigateur (http://localhost:5080 ou http://localhost:3004)
2. Ouvrez les Developer Tools (F12)
3. Allez dans l'onglet "Application" ou "Storage"
4. Sélectionnez "Local Storage" > "http://localhost:xxxx"
5. Copiez les clés importantes:
   - llmGuardrailTestHistory
   - compass-ooda-progress
   - compass-language

## Pour restaurer:

1. Ouvrez les Developer Tools
2. Allez dans la Console
3. Exécutez:
   ```javascript
   localStorage.setItem('llmGuardrailTestHistory', 'votre_valeur_ici');
   ```

Date du backup: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

    $readmePath = Join-Path $BackupDir "LOCALSTORAGE_README.md"
    Set-Content -Path $readmePath -Value $readmeContent

    Write-ColorOutput "✓ Instructions localStorage créées" -Type Success
}

function Backup-ImportantData {
    param([string]$BackupDir)

    Write-Header "Backup des Données Importantes"

    $dataFiles = @(
        "data/compassContent.ts",
        "data/aiPolicyContent.ts",
        "data/wikiContent.tsx",
        "data/aiRiskRepositoryContent.ts",
        "data_ai_risk/compass-data-final.json"
    )

    $backupCount = 0

    foreach ($file in $dataFiles) {
        if (Test-Path $file) {
            $destination = Join-Path $BackupDir $file
            $destDir = Split-Path $destination

            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            Copy-Item $file $destination -Force

            Write-ColorOutput "  ✓ $file" -Type Success
            $backupCount++
        }
    }

    if ($backupCount -gt 0) {
        Write-ColorOutput "✓ $backupCount fichiers de données sauvegardés" -Type Success
    }

    # Backup localStorage info
    Backup-LocalStorage -BackupDir $BackupDir
}

function Backup-CodeSnapshot {
    param([string]$BackupDir)

    Write-Header "Backup du Code Source"

    $codeDir = Join-Path $BackupDir "code"
    New-Item -ItemType Directory -Force -Path $codeDir | Out-Null

    # Backup des fichiers package.json pour référence des versions
    $packageFiles = @(
        "package.json",
        "package-lock.json",
        "backend/package.json",
        "backend/package-lock.json"
    )

    foreach ($file in $packageFiles) {
        if (Test-Path $file) {
            $destination = Join-Path $codeDir $file
            $destDir = Split-Path $destination
            New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            Copy-Item $file $destination -Force
        }
    }

    # Créer un fichier avec les informations Git
    if (Test-CommandExists "git") {
        $gitInfo = @"
# Informations Git au moment du backup

Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Commit actuel
$(git log -1 --pretty=format:"%H%n%an%n%ae%n%ad%n%s" 2>$null)

## Branche
$(git branch --show-current 2>$null)

## Status
$(git status --short 2>$null)

## Fichiers modifiés non commités
$(git diff --name-only 2>$null)
"@

        $gitInfoPath = Join-Path $codeDir "GIT_INFO.md"
        Set-Content -Path $gitInfoPath -Value $gitInfo
        Write-ColorOutput "✓ Informations Git sauvegardées" -Type Success
    }

    Write-ColorOutput "✓ Snapshot du code créé" -Type Success
}

function Create-BackupManifest {
    param([string]$BackupDir, [string]$Type)

    $manifest = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        type = $Type
        hostname = $env:COMPUTERNAME
        user = $env:USERNAME
        backupDir = $BackupDir
        files = @()
    }

    # Lister tous les fichiers dans le backup
    $files = Get-ChildItem -Path $BackupDir -Recurse -File
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($BackupDir.Length + 1)
        $manifest.files += @{
            path = $relativePath
            size = $file.Length
            hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash
        }
    }

    $manifestPath = Join-Path $BackupDir "MANIFEST.json"
    $manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath

    Write-ColorOutput "✓ Manifeste de backup créé" -Type Success
}

function Restore-FromBackup {
    param([string]$BackupDir)

    Write-Header "Restauration depuis Backup"

    if (-not (Test-Path $BackupDir)) {
        Write-ColorOutput "✗ Répertoire de backup introuvable: $BackupDir" -Type Error
        return
    }

    # Vérifier le manifeste
    $manifestPath = Join-Path $BackupDir "MANIFEST.json"
    if (Test-Path $manifestPath) {
        $manifest = Get-Content $manifestPath | ConvertFrom-Json
        Write-ColorOutput "📋 Backup créé le: $($manifest.timestamp)" -Type Info
        Write-ColorOutput "📋 Type: $($manifest.type)" -Type Info
        Write-ColorOutput "📋 Machine: $($manifest.hostname)" -Type Info
        Write-Host ""
    }

    $confirm = Read-Host "⚠️  Confirmer la restauration? (O/N)"
    if ($confirm -ne 'O' -and $confirm -ne 'o') {
        Write-ColorOutput "❌ Restauration annulée" -Type Warning
        return
    }

    # Restaurer la base de données
    $dbDump = Join-Path $BackupDir "database_dump.sql"
    if (Test-Path $dbDump) {
        Write-ColorOutput "🔄 Restauration de la base de données..." -Type Info

        try {
            docker cp $dbDump airiskmgr-postgres:/tmp/restore.sql
            docker exec airiskmgr-postgres psql -U airiskmgr -d airiskmgr_db -f /tmp/restore.sql 2>&1 | Out-Null
            Write-ColorOutput "✓ Base de données restaurée" -Type Success
        } catch {
            Write-ColorOutput "✗ Erreur lors de la restauration de la DB: $($_.Exception.Message)" -Type Error
        }
    }

    # Restaurer Redis
    $redisDump = Join-Path $BackupDir "redis_dump.rdb"
    if (Test-Path $redisDump) {
        Write-ColorOutput "🔄 Restauration de Redis..." -Type Info

        try {
            docker cp $redisDump airiskmgr-redis:/data/dump.rdb
            docker-compose restart redis
            Write-ColorOutput "✓ Redis restauré" -Type Success
        } catch {
            Write-ColorOutput "⚠️  Erreur lors de la restauration de Redis: $($_.Exception.Message)" -Type Warning
        }
    }

    # Restaurer les fichiers de configuration
    $configFiles = @(".env", "backend/.env")
    foreach ($file in $configFiles) {
        $backupFile = Join-Path $BackupDir $file
        if (Test-Path $backupFile) {
            $restoreConfig = Read-Host "Restaurer $file ? (O/N)"
            if ($restoreConfig -eq 'O' -or $restoreConfig -eq 'o') {
                Copy-Item $backupFile $file -Force
                Write-ColorOutput "✓ $file restauré" -Type Success
            }
        }
    }

    Write-ColorOutput "`n✓ Restauration terminée" -Type Success
}

function List-Backups {
    Write-Header "Backups Disponibles"

    if (-not (Test-Path "backups")) {
        Write-ColorOutput "ℹ️  Aucun backup trouvé" -Type Info
        return
    }

    $backups = Get-ChildItem -Path "backups" -Directory | Sort-Object Name -Descending

    if ($backups.Count -eq 0) {
        Write-ColorOutput "ℹ️  Aucun backup trouvé" -Type Info
        return
    }

    Write-ColorOutput "📦 Backups disponibles:" -Type Info
    Write-Host ""

    foreach ($backup in $backups) {
        $manifestPath = Join-Path $backup.FullName "MANIFEST.json"

        if (Test-Path $manifestPath) {
            $manifest = Get-Content $manifestPath | ConvertFrom-Json
            $size = (Get-ChildItem -Path $backup.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

            Write-ColorOutput "  📁 $($backup.Name)" -Type Success
            Write-ColorOutput "     Date: $($manifest.timestamp)" -Type Info
            Write-ColorOutput "     Type: $($manifest.type)" -Type Info
            Write-ColorOutput "     Taille: $([math]::Round($size, 2)) MB" -Type Info
            Write-ColorOutput "     Fichiers: $($manifest.files.Count)" -Type Info
            Write-Host ""
        } else {
            Write-ColorOutput "  📁 $($backup.Name) (pas de manifeste)" -Type Warning
            Write-Host ""
        }
    }

    Write-ColorOutput "💡 Pour restaurer: .\backup.ps1 -Restore backups/backup_XXXXXXXX_XXXXXX" -Type Info
}

# ============================================
# Script Principal
# ============================================

Clear-Host
Write-Header "AI RISK MANAGER - Backup & Restore"

# Mode restauration
if ($Restore) {
    Restore-FromBackup -BackupDir $Restore
    exit 0
}

# Lister les backups si demandé
$listBackups = Read-Host "Voulez-vous voir les backups existants avant de continuer? (O/N)"
if ($listBackups -eq 'O' -or $listBackups -eq 'o') {
    List-Backups
    Write-Host ""
    $continue = Read-Host "Continuer avec un nouveau backup? (O/N)"
    if ($continue -ne 'O' -and $continue -ne 'o') {
        exit 0
    }
}

Write-ColorOutput "Type de backup: $Type" -Type Info
Write-Host ""

# Créer le répertoire de backup
$backupDir = Get-BackupDirectory
Write-ColorOutput "📂 Répertoire de backup: $backupDir" -Type Info
Write-Host ""

$success = $true

# Exécuter les backups selon le type
switch ($Type) {
    'full' {
        $success = (Backup-Database -BackupDir $backupDir) -and $success
        Backup-RedisData -BackupDir $backupDir
        $success = (Backup-Configuration -BackupDir $backupDir) -and $success
        Backup-ImportantData -BackupDir $backupDir
        Backup-CodeSnapshot -BackupDir $backupDir
    }
    'database' {
        $success = Backup-Database -BackupDir $backupDir
        Backup-RedisData -BackupDir $backupDir
    }
    'config' {
        $success = Backup-Configuration -BackupDir $backupDir
    }
    'code' {
        Backup-CodeSnapshot -BackupDir $backupDir
    }
}

# Créer le manifeste
Create-BackupManifest -BackupDir $backupDir -Type $Type

# Calculer la taille totale
$totalSize = (Get-ChildItem -Path $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host ""
Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
Write-ColorOutput "Backup terminé avec succès! 💾" -Type Success
Write-ColorOutput "═══════════════════════════════════════════════" -Type Header
Write-Host ""

Write-ColorOutput "📊 Résumé:" -Type Info
Write-ColorOutput "   Location: $backupDir" -Type Info
Write-ColorOutput "   Taille: $([math]::Round($totalSize, 2)) MB" -Type Info
Write-Host ""

Write-ColorOutput "💡 Pour restaurer: .\backup.ps1 -Restore $backupDir" -Type Info
Write-Host ""
