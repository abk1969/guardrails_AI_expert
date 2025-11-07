#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Module d'installation des outils Python (Promptfoo, Garak, Strix)
.DESCRIPTION
    Ce script est appele par install-complete.ps1 pour installer les 3 outils de pentest
#>

# ============================================
# INSTALLATION PROMPTFOO
# ============================================

function Install-Promptfoo {
    param([hashtable]$Context)

    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host "  [7/12] Installation de Promptfoo                              " -ForegroundColor Magenta
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host ""

    Write-Host "[CHK] Verification de l'installation existante" -ForegroundColor Blue

    if (Get-Command "promptfoo" -ErrorAction SilentlyContinue) {
        $promptfooVersion = promptfoo --version 2>&1
        Write-Host "  [+] Promptfoo deja installe: $promptfooVersion" -ForegroundColor Green

        try {
            $latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/promptfoo/promptfoo/releases/latest" -ErrorAction SilentlyContinue
            Write-Host "  -> Derniere version GitHub: $($latestRelease.tag_name)" -ForegroundColor Cyan
        } catch {
            Write-Host "  [!] Impossible de verifier la version GitHub" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[*] Installation globale de Promptfoo" -ForegroundColor Blue
        Write-Host "[PKG] npm install -g promptfoo..." -ForegroundColor Cyan

        npm install -g promptfoo --loglevel=error 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "[+] Promptfoo installe globalement" -ForegroundColor Green

            if (Get-Command "promptfoo" -ErrorAction SilentlyContinue) {
                $version = promptfoo --version 2>&1
                Write-Host "[+] Version installee: $version" -ForegroundColor Green
            }
        } else {
            Write-Host "[-] Installation de Promptfoo echouee" -ForegroundColor Red
            Write-Host "  -> Continuons sans Promptfoo" -ForegroundColor Yellow
        }
    }

    # Installation locale
    if (Test-Path "guardrail/solution_promptfoo/promptfoo/package.json") {
        Write-Host "[*] Installation locale Promptfoo" -ForegroundColor Blue
        Push-Location "guardrail/solution_promptfoo/promptfoo"

        if (-not (Test-Path "node_modules")) {
            Write-Host "[PKG] npm install (local)..." -ForegroundColor Cyan
            npm install --loglevel=error 2>&1 | Out-Null
            Write-Host "[+] Promptfoo local installe" -ForegroundColor Green
        } else {
            Write-Host "[+] Promptfoo local deja installe" -ForegroundColor Green
        }

        Pop-Location
    }
}

# ============================================
# INSTALLATION GARAK
# ============================================

function Install-Garak {
    param([hashtable]$Context)

    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host "  [8/12] Installation de Garak (Scanner LLM)                    " -ForegroundColor Magenta
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host ""

    $garakPath = "guardrail/garak"

    if (-not (Test-Path "guardrail")) {
        New-Item -Path "guardrail" -ItemType Directory -Force | Out-Null
    }

    Write-Host "[*] Clone/Mise a jour du repository GitHub" -ForegroundColor Blue

    if (-not (Test-Path $garakPath)) {
        Write-Host "[DL] Clone de Garak depuis GitHub..." -ForegroundColor Cyan
        Write-Host "     Repository: https://github.com/leondz/garak" -ForegroundColor Cyan

        Push-Location "guardrail"
        git clone https://github.com/leondz/garak.git 2>&1 | Out-Null
        Pop-Location

        if ($LASTEXITCODE -eq 0) {
            Write-Host "[+] Garak clone avec succes" -ForegroundColor Green
        } else {
            Write-Host "[-] Clone de Garak echoue" -ForegroundColor Red
            return
        }
    } else {
        Write-Host "[+] Garak existe deja" -ForegroundColor Green

        Push-Location $garakPath
        git fetch origin 2>&1 | Out-Null
        $behind = git rev-list HEAD..origin/main --count 2>&1

        if ([int]$behind -gt 0) {
            Write-Host "  [!] Garak a $behind commits de retard" -ForegroundColor Yellow
            Write-Host "  [DL] Mise a jour en cours..." -ForegroundColor Cyan

            git pull origin main 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [+] Garak mis a jour" -ForegroundColor Green
            }
        } else {
            Write-Host "  [+] Garak est a jour" -ForegroundColor Green
        }
        Pop-Location
    }

    Write-Host "[*] Installation des dependances Python" -ForegroundColor Blue
    Push-Location $garakPath

    if (Test-Path "requirements.txt") {
        Write-Host "[PKG] Installation avec uv (ultra-rapide)..." -ForegroundColor Cyan

        if (Get-Command "uv" -ErrorAction SilentlyContinue) {
            uv pip install -r requirements.txt 2>&1 | Out-Null
        } else {
            python -m pip install -r requirements.txt 2>&1 | Out-Null
        }
    }

    Write-Host "[TOOL] Installation de Garak en mode developpement..." -ForegroundColor Cyan
    python -m pip install -e . 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] Garak installe en mode developpement" -ForegroundColor Green
    }

    Write-Host "[*] Test de Garak" -ForegroundColor Blue
    $garakTest = python -m garak --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] Garak fonctionne: $garakTest" -ForegroundColor Green
    } else {
        Write-Host "[!] Test de Garak echoue" -ForegroundColor Yellow
    }

    Pop-Location
}

# ============================================
# INSTALLATION STRIX
# ============================================

function Install-Strix {
    param([hashtable]$Context)

    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host "  [9/12] Installation de Strix (Agent Autonome)                 " -ForegroundColor Magenta
    Write-Host "===================================================================" -ForegroundColor Magenta
    Write-Host ""

    $strixPath = "guardrail/strix"

    Write-Host "[*] Clone/Mise a jour du repository GitHub" -ForegroundColor Blue

    if (-not (Test-Path $strixPath)) {
        Write-Host "[DL] Clone de Strix depuis GitHub..." -ForegroundColor Cyan
        Write-Host "     Repository: https://github.com/BishopFox/strix" -ForegroundColor Cyan

        Push-Location "guardrail"
        git clone https://github.com/BishopFox/strix.git 2>&1 | Out-Null
        Pop-Location

        if ($LASTEXITCODE -eq 0) {
            Write-Host "[+] Strix clone avec succes" -ForegroundColor Green
        } else {
            Write-Host "[-] Clone de Strix echoue" -ForegroundColor Red
            return
        }
    } else {
        Write-Host "[+] Strix existe deja" -ForegroundColor Green

        Push-Location $strixPath
        git fetch origin 2>&1 | Out-Null
        $behind = git rev-list HEAD..origin/main --count 2>&1

        if ([int]$behind -gt 0) {
            Write-Host "  [!] Strix a $behind commits de retard" -ForegroundColor Yellow
            Write-Host "  [DL] Mise a jour en cours..." -ForegroundColor Cyan

            git pull origin main 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [+] Strix mis a jour" -ForegroundColor Green
            }
        } else {
            Write-Host "  [+] Strix est a jour" -ForegroundColor Green
        }
        Pop-Location
    }

    Write-Host "[*] Installation des dependances Python" -ForegroundColor Blue
    Push-Location $strixPath

    if (Test-Path "requirements.txt") {
        Write-Host "[PKG] Installation avec uv..." -ForegroundColor Cyan

        if (Get-Command "uv" -ErrorAction SilentlyContinue) {
            uv pip install -r requirements.txt 2>&1 | Out-Null
        } else {
            python -m pip install -r requirements.txt 2>&1 | Out-Null
        }
    }

    Write-Host "[TOOL] Installation de Strix en mode developpement..." -ForegroundColor Cyan
    python -m pip install -e . 2>&1 | Out-Null
    Write-Host "[+] Strix installe" -ForegroundColor Green

    Pop-Location

    Write-Host "[*] Installation de Playwright" -ForegroundColor Blue
    Write-Host "[PKG] Installation de Playwright..." -ForegroundColor Cyan
    python -m pip install playwright 2>&1 | Out-Null

    Write-Host "[WEB] Installation des navigateurs Playwright (2-5 minutes)..." -ForegroundColor Cyan
    python -m playwright install chromium 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] Playwright et navigateurs installes" -ForegroundColor Green
    }

    Push-Location $strixPath
    Write-Host "[*] Test de Strix" -ForegroundColor Blue
    $strixTest = python -m strix --help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[+] Strix fonctionne correctement" -ForegroundColor Green
    } else {
        Write-Host "[!] Test de Strix echoue" -ForegroundColor Yellow
    }
    Pop-Location
}

# Export des fonctions
Export-ModuleMember -Function Install-Promptfoo, Install-Garak, Install-Strix
