# 🚀 GUIDE D'INSTALLATION COMPLÈTE - AI RISK MANAGER v2.0

**Date**: 2025-11-05
**Version**: 2.0 - Inclut Python, uv, Promptfoo, Garak, Strix

---

## 📋 Vue d'Ensemble

Ce guide décrit l'installation complète de la plateforme AI RISK MANAGER avec :
- ✅ Frontend (React + Vite + Tailwind + Composants Unifiés)
- ✅ Backend (NestJS + Prisma + PostgreSQL + Redis)
- ✅ **Promptfoo** (Tests LLM - déjà intégré)
- ✅ **Garak** (Scanner vulnérabilités LLM - Python)
- ✅ **Strix** (Agent autonome Agentic AI - Python + Playwright)

---

## 🛠️ Prérequis à Installer

###  1. Node.js & npm
- **Version requise**: Node.js >= 18.0.0, npm >= 9.0.0
- **Téléchargement**: https://nodejs.org/
- **Vérification**:
  ```powershell
  node --version  # doit afficher v18.x.x ou supérieur
  npm --version   # doit afficher 9.x.x ou supérieur
  ```

### 2. Python
- **Version requise**: Python >= 3.10
- **Téléchargement**: https://www.python.org/downloads/
- **IMPORTANT**: Cocher "Add Python to PATH" lors de l'installation
- **Vérification**:
  ```powershell
  python --version  # doit afficher Python 3.10.x ou supérieur
  pip --version     # doit afficher pip 23.x.x ou supérieur
  ```

### 3. uv (Gestionnaire de Packages Python Ultra-Rapide)
- **Installation**:
  ```powershell
  pip install uv
  ```
- **Vérification**:
  ```powershell
  uv --version
  ```

### 4. Git
- **Téléchargement**: https://git-scm.com/
- **Nécessaire pour**: Cloner Garak et Strix depuis GitHub
- **Vérification**:
  ```powershell
  git --version
  ```

### 5. Docker (pour mode fullstack/docker uniquement)
- **Téléchargement**: https://www.docker.com/products/docker-desktop
- **Vérification**:
  ```powershell
  docker --version
  docker-compose --version
  docker ps  # vérifie que Docker est démarré
  ```

---

## 📦 ÉTAPE 1 : Installation du Frontend

### 1.1 Installation des dépendances npm

```powershell
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert
npm install
```

**Dépendances critiques à vérifier**:
- ✅ react
- ✅ react-dom
- ✅ vite
- ✅ tailwindcss
- ✅ lucide-react
- ✅ socket.io-client

### 1.2 Configuration .env

Créer `.env` à la racine avec :

```env
# Gemini API Key (REQUIS pour génération de prompts)
GEMINI_API_KEY=votre_cle_gemini_ici

# Configuration Backend (pour mode fullstack)
VITE_API_URL=http://localhost:3003/api/v1
VITE_WS_URL=ws://localhost:3003

# MCP (Model Context Protocol)
VITE_MCP_API_URL=http://localhost:3003/api/v1/mcp
VITE_MCP_MOCK_MODE=false
```

### 1.3 Vérifier les composants unifiés

```powershell
# Vérifier que les fichiers existent
Test-Path src/components/unified/UnifiedSecurityHub.tsx
Test-Path src/components/unified/GarakScannerUI.tsx
Test-Path src/components/unified/StrixDashboard.tsx
```

---

## 🔧 ÉTAPE 2 : Installation du Backend

### 2.1 Installation des dépendances npm backend

```powershell
cd backend
npm install
```

**Modules critiques à vérifier**:
- ✅ @nestjs/core
- ✅ @nestjs/websockets
- ✅ @prisma/client
- ✅ @nestjs/bull
- ✅ bull
- ✅ socket.io
- ✅ bcrypt
- ✅ passport-jwt

### 2.2 Configuration backend/.env

Créer `backend/.env` avec :

```env
# Database
DATABASE_URL=postgresql://airiskmgr:airiskmgr_dev_password@localhost:5435/airiskmgr_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=redis_dev_password

# JWT (générer des secrets aléatoires)
JWT_SECRET=votre_secret_jwt_32_caracteres_minimum
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Encryption (32+ caractères)
ENCRYPTION_KEY=votre_cle_encryption_32_caracteres_minimum

# API Keys
GEMINI_API_KEY=votre_cle_gemini_ici
OPENAI_API_KEY=votre_cle_openai_ici

# CORS
CORS_ORIGIN=http://localhost:3004

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# Environment
NODE_ENV=development
PORT=3001
```

### 2.3 Générer le client Prisma

```powershell
cd backend
npm run prisma:generate
```

### 2.4 Vérifier les modules API Gateway

```powershell
# Vérifier que tous les modules sont présents
Test-Path apps/api-gateway/src/unified/unified.module.ts    # ✓
Test-Path apps/api-gateway/src/garak/garak.module.ts        # ✓
Test-Path apps/api-gateway/src/strix/strix.module.ts        # ✓
Test-Path apps/api-gateway/src/promptfoo/promptfoo.module.ts # ✓
Test-Path apps/api-gateway/src/tests/tests.module.ts         # ✓
Test-Path apps/api-gateway/src/policies/policies.module.ts   # ✓
Test-Path apps/api-gateway/src/risks/risks.module.ts         # ✓
Test-Path apps/api-gateway/src/users/users.module.ts         # ✓
Test-Path apps/api-gateway/src/mcp/mcp.module.ts            # ✓
Test-Path apps/api-gateway/src/gemini/gemini.module.ts      # ✓
```

---

## 🐍 ÉTAPE 3 : Installation de Promptfoo

### 3.1 Vérifier l'installation existante

```powershell
cd guardrail/solution_promptfoo/promptfoo

# Vérifier si Promptfoo est déjà installé
npm list -g promptfoo
```

### 3.2 Installer/Mettre à jour Promptfoo

```powershell
# Installation globale (recommandé)
npm install -g promptfoo

# OU installation locale dans le projet
cd guardrail/solution_promptfoo/promptfoo
npm install
```

### 3.3 Vérifier la version GitHub

```powershell
# Obtenir la dernière version depuis GitHub
$latestRelease = Invoke-RestMethod -Uri "https://api.github.com/repos/promptfoo/promptfoo/releases/latest"
Write-Host "Dernière version GitHub: $($latestRelease.tag_name)"

# Comparer avec la version installée
promptfoo --version
```

### 3.4 Tester Promptfoo

```powershell
promptfoo --help
promptfoo init  # créer une configuration de test
```

---

## 🔍 ÉTAPE 4 : Installation de Garak (Scanner LLM)

### 4.1 Cloner le repository GitHub

```powershell
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert\guardrail

# Cloner Garak si pas déjà fait
if (-not (Test-Path "garak")) {
    git clone https://github.com/leondz/garak.git
    Write-Host "✓ Garak cloné depuis GitHub"
} else {
    Write-Host "✓ Garak existe déjà, mise à jour..."
    cd garak
    git pull origin main
    cd ..
}
```

### 4.2 Vérifier la version et les mises à jour

```powershell
cd guardrail/garak

# Obtenir la dernière version GitHub
$latestCommit = git log -1 --format="%H %s"
Write-Host "Dernier commit: $latestCommit"

# Vérifier s'il y a des mises à jour
git fetch origin
$behind = git rev-list HEAD..origin/main --count
if ($behind -gt 0) {
    Write-Host "⚠ Garak a $behind commits de retard. Mise à jour recommandée."
    Write-Host "→ Exécuter: git pull origin main"
} else {
    Write-Host "✓ Garak est à jour"
}
```

### 4.3 Installer les dépendances Python avec uv

```powershell
cd guardrail/garak

# Vérifier si requirements.txt existe
if (Test-Path "requirements.txt") {
    Write-Host "📦 Installation des dépendances Garak avec uv..."

    # Installer avec uv (ultra-rapide)
    uv pip install -r requirements.txt

    # OU avec pip classique si uv n'est pas disponible
    # python -m pip install -r requirements.txt

    Write-Host "✓ Dépendances Garak installées"
} else {
    Write-Host "⚠ requirements.txt introuvable, installation via setup.py..."
    python -m pip install -e .
}
```

### 4.4 Installer Garak en mode développement

```powershell
cd guardrail/garak

# Installation en mode éditable (développement)
python -m pip install -e .

# Vérifier l'installation
python -m garak --version
```

### 4.5 Tester Garak

```powershell
# Test basique
python -m garak --help

# Test de scan (simulation)
python -m garak --model_name test --probes encoding
```

### 4.6 Configuration Garak

Créer `guardrail/garak/.garak.yaml` :

```yaml
# Configuration Garak
model_name: "openai/gpt-4"
probes:
  - encoding
  - injection
  - toxicity
  - jailbreak
  - hallucination
  - leakage
  - malicious

# API Keys (ou utiliser variables d'environnement)
# OPENAI_API_KEY sera lu depuis l'environnement
```

---

## 🦉 ÉTAPE 5 : Installation de Strix (Agent Autonome)

### 5.1 Cloner le repository GitHub

```powershell
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert\guardrail

# Cloner Strix si pas déjà fait
if (-not (Test-Path "strix")) {
    git clone https://github.com/BishopFox/strix.git
    Write-Host "✓ Strix cloné depuis GitHub"
} else {
    Write-Host "✓ Strix existe déjà, mise à jour..."
    cd strix
    git pull origin main
    cd ..
}
```

### 5.2 Vérifier la version et les mises à jour

```powershell
cd guardrail/strix

# Obtenir la dernière version GitHub
$latestCommit = git log -1 --format="%H %s"
Write-Host "Dernier commit: $latestCommit"

# Vérifier s'il y a des mises à jour
git fetch origin
$behind = git rev-list HEAD..origin/main --count
if ($behind -gt 0) {
    Write-Host "⚠ Strix a $behind commits de retard. Mise à jour recommandée."
    Write-Host "→ Exécuter: git pull origin main"
} else {
    Write-Host "✓ Strix est à jour"
}
```

### 5.3 Installer les dépendances Python avec uv

```powershell
cd guardrail/strix

# Installer les dépendances avec uv
if (Test-Path "requirements.txt") {
    Write-Host "📦 Installation des dépendances Strix avec uv..."
    uv pip install -r requirements.txt
    Write-Host "✓ Dépendances Strix installées"
}

# Installer en mode développement
python -m pip install -e .
```

### 5.4 Installer Playwright (nécessaire pour Strix)

```powershell
# Strix utilise Playwright pour l'automatisation du navigateur
Write-Host "📦 Installation de Playwright..."

# Installer playwright via pip
python -m pip install playwright

# Installer les navigateurs Playwright
python -m playwright install chromium

Write-Host "✓ Playwright installé avec succès"
```

### 5.5 Tester Strix

```powershell
cd guardrail/strix

# Test basique
python -m strix --help

# Test de scan (mode light)
python -m strix scan --url https://example.com --mode light --headless
```

### 5.6 Configuration Strix

Créer `guardrail/strix/config.yaml` :

```yaml
# Configuration Strix
strix:
  mode: moderate  # light | moderate | aggressive
  headless: true
  timeout: 300
  max_steps: 50

  # Navigateur
  browser: chromium
  user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

  # Logging
  log_level: INFO
  log_file: strix_scan.log
```

---

## 🗄️ ÉTAPE 6 : Configuration de la Base de Données (Mode Fullstack/Docker)

### 6.1 Démarrer PostgreSQL et Redis via Docker

```powershell
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert

# Démarrer uniquement PostgreSQL et Redis
docker-compose up -d postgres redis

# Vérifier que les conteneurs sont en cours d'exécution
docker ps
```

### 6.2 Appliquer le schéma Prisma

```powershell
cd backend

# Appliquer le schéma à la base de données
npm run prisma:push

# Optionnel: Seed la base avec des données initiales
npm run prisma:seed
```

### 6.3 Ouvrir Prisma Studio (optionnel)

```powershell
cd backend
npm run prisma:studio
# Ouvre http://localhost:5555
```

---

## 🧪 ÉTAPE 7 : Tests de Validation

### 7.1 Tester le Frontend

```powershell
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert

# Vérifier la compilation TypeScript
npx tsc --noEmit

# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:5080
# Vérifier que la section "Plateforme Unifiée (3 Outils)" apparaît dans la navigation
```

### 7.2 Tester le Backend

```powershell
cd backend

# Vérifier la compilation NestJS
npm run build

# Démarrer en mode développement
npm run start:dev

# Ouvrir http://localhost:3003 (API Gateway)
```

### 7.3 Tester les Endpoints API

```powershell
# Tester l'endpoint Unified
Invoke-RestMethod -Uri "http://localhost:3003/api/v1/unified/metrics" -Method GET -Headers @{"Authorization"="Bearer your_jwt_token"}

# Tester l'endpoint Garak (nécessite authentification)
$body = @{
    model = "openai/gpt-4"
    probes = @("injection", "toxicity")
    generators = @("default")
    detectors = @("default")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3003/api/v1/garak/scan" -Method POST -Body $body -ContentType "application/json" -Headers @{"Authorization"="Bearer your_jwt_token"}

# Tester l'endpoint Strix
$body = @{
    targetUrl = "https://example.com"
    attackMode = "moderate"
    headless = $true
    maxSteps = 50
    timeout = 300
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3003/api/v1/strix/execute" -Method POST -Body $body -ContentType "application/json" -Headers @{"Authorization"="Bearer your_jwt_token"}
```

### 7.4 Tester Promptfoo

```powershell
cd guardrail/solution_promptfoo/promptfoo

# Test de Promptfoo CLI
promptfoo eval

# Générer un rapport
promptfoo view
```

### 7.5 Tester Garak

```powershell
cd guardrail/garak

# Test basique
python -m garak --model_name test --probes encoding

# Scan complet (attention: peut prendre du temps et coûter en API calls)
# python -m garak --model_name openai/gpt-4 --probes all
```

### 7.6 Tester Strix

```powershell
cd guardrail/strix

# Test en mode light (reconnaissance)
python -m strix scan --url https://example.com --mode light --headless --max-steps 10

# Test complet (attention: peut être détecté comme activité suspecte)
# python -m strix scan --url https://example.com --mode moderate --headless
```

---

## 🚀 ÉTAPE 8 : Démarrage Complet

### Mode Standalone (Frontend uniquement)

```powershell
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert
npm run dev
# Ouvrir http://localhost:5080
```

### Mode Fullstack (Frontend + Backend)

**Terminal 1** (Backend):
```powershell
cd backend
npm run start:dev
```

**Terminal 2** (Frontend):
```powershell
npm run dev
```

**Terminal 3** (Garak - optionnel):
```powershell
cd guardrail/garak
python -m garak --help  # prêt pour utilisation
```

**Terminal 4** (Strix - optionnel):
```powershell
cd guardrail/strix
python -m strix --help  # prêt pour utilisation
```

### Mode Docker (Tout via Docker Compose)

```powershell
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert

# Construire les images
docker-compose build

# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f frontend
docker-compose logs -f api-gateway

# Arrêter les services
docker-compose down
```

---

## 📊 ÉTAPE 9 : Vérification Finale

### Checklist Complète

- [ ] **Frontend**
  - [ ] npm dependencies installées
  - [ ] .env configuré avec GEMINI_API_KEY
  - [ ] Composants unifiés présents (UnifiedSecurityHub, GarakScannerUI, StrixDashboard)
  - [ ] App.tsx contient la section "Plateforme Unifiée"
  - [ ] npm run dev fonctionne

- [ ] **Backend**
  - [ ] npm dependencies installées
  - [ ] backend/.env configuré
  - [ ] Client Prisma généré
  - [ ] Tous les modules présents (Unified, Garak, Strix, etc.)
  - [ ] app.module.ts importe les 3 nouveaux modules
  - [ ] npm run start:dev fonctionne

- [ ] **Python + uv**
  - [ ] Python >= 3.10 installé
  - [ ] pip fonctionnel
  - [ ] uv installé et fonctionnel

- [ ] **Promptfoo**
  - [ ] Installation globale: `promptfoo --version` fonctionne
  - [ ] OU installation locale dans guardrail/solution_promptfoo/
  - [ ] Tests fonctionnent: `promptfoo eval`

- [ ] **Garak**
  - [ ] Repository cloné dans guardrail/garak/
  - [ ] Dépendances Python installées
  - [ ] `python -m garak --version` fonctionne
  - [ ] Tests basiques fonctionnent

- [ ] **Strix**
  - [ ] Repository cloné dans guardrail/strix/
  - [ ] Dépendances Python installées
  - [ ] Playwright installé avec navigateurs
  - [ ] `python -m strix --help` fonctionne
  - [ ] Tests basiques fonctionnent

- [ ] **Base de Données** (mode fullstack/docker)
  - [ ] PostgreSQL en cours d'exécution
  - [ ] Redis en cours d'exécution
  - [ ] Schéma Prisma appliqué

- [ ] **Tests API**
  - [ ] GET /api/v1/unified/metrics fonctionne
  - [ ] POST /api/v1/garak/scan fonctionne
  - [ ] POST /api/v1/strix/execute fonctionne

---

## 🛠️ Dépannage

### Problème: "uv: command not found"
**Solution**:
```powershell
# Réinstaller uv
python -m pip install --upgrade uv

# Ajouter au PATH si nécessaire
$env:Path += ";$env:LOCALAPPDATA\Programs\Python\Python310\Scripts"
```

### Problème: "Garak ne se lance pas"
**Solution**:
```powershell
cd guardrail/garak

# Réinstaller les dépendances
python -m pip uninstall garak
python -m pip install -e .

# Vérifier Python
python --version  # doit être >= 3.10
```

### Problème: "Strix - Playwright browsers not found"
**Solution**:
```powershell
# Réinstaller les navigateurs Playwright
python -m playwright install chromium
python -m playwright install-deps
```

### Problème: "Port 5080 déjà utilisé"
**Solution**:
```powershell
# Trouver le processus
Get-Process -Id (Get-NetTCPConnection -LocalPort 5080).OwningProcess

# Tuer le processus
Stop-Process -Id <PID> -Force

# OU changer le port dans vite.config.ts
```

### Problème: "Module 'UnifiedModule' not found"
**Solution**:
```powershell
cd backend

# Vérifier que le fichier existe
Test-Path apps/api-gateway/src/unified/unified.module.ts

# Vérifier app.module.ts
Get-Content apps/api-gateway/src/app.module.ts | Select-String "UnifiedModule"

# Si absent, vérifier que l'implémentation est complète
```

---

## 📚 Ressources

### Documentation
- **AI Risk Manager**: README.md, UNIFIED_PLATFORM_IMPLEMENTATION_SUMMARY.md
- **Promptfoo**: https://www.promptfoo.dev/docs/
- **Garak**: https://github.com/leondz/garak/wiki
- **Strix**: https://github.com/BishopFox/strix/blob/main/README.md

### API Keys Nécessaires
- **Gemini API**: https://ai.google.dev/
- **OpenAI API** (optionnel): https://platform.openai.com/

### Support
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Documentation Claude Code: https://docs.claude.com/en/docs/claude-code/

---

## ✅ Résumé Final

Après avoir suivi ce guide, vous aurez :

1. ✅ **Frontend complet** avec composants unifiés (UnifiedSecurityHub, GarakScannerUI, StrixDashboard)
2. ✅ **Backend complet** avec 11 modules API (Unified, Garak, Strix, Promptfoo, Tests, Policies, Risks, Users, Analytics, MCP, Gemini)
3. ✅ **Promptfoo** installé et fonctionnel pour tests LLM
4. ✅ **Garak** installé et fonctionnel pour scan de vulnérabilités LLM
5. ✅ **Strix** installé et fonctionnel pour tests agentic AI autonomes
6. ✅ **Python + uv** configurés pour gestion rapide des packages
7. ✅ **Base de données** (PostgreSQL + Redis) configurée
8. ✅ **Tous les composants testés** et validés

🎉 **Félicitations ! Votre plateforme unifiée de pentest AI est maintenant complètement opérationnelle !**

---

**Version**: 2.0
**Dernière mise à jour**: 2025-11-05
**Auteur**: Claude Code Assistant
