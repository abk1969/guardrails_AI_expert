# 🚀 Scripts d'Installation - AI RISK MANAGER v2.0

## 📋 Fichiers Disponibles

### ⭐ Pour Utilisateurs Novices (RECOMMANDÉ)

**`install-auto.ps1`** - Installation 100% Automatique
- ✅ **Aucune action requise** de l'utilisateur (sauf choix du mode)
- ✅ Installe **TOUT automatiquement**:
  - Frontend complet
  - Backend complet (11 modules API)
  - Python + uv
  - **Promptfoo** (tests LLM)
  - **Garak** (clone depuis GitHub + installation)
  - **Strix** (clone depuis GitHub + installation)
  - Playwright (pour Strix)
  - Configuration .env automatique
- ✅ Messages clairs à chaque étape
- ✅ Vérification des prérequis
- ✅ Tests de validation
- ⏱️ Durée: 15-30 minutes

### 📚 Pour Utilisateurs Avancés

**`install-complete.ps1`** - Script enrichi avec plus de contrôle
- Configuration plus détaillée
- Options avancées (--SkipTests, --UpdateTools)
- 440+ lignes de code

**`install-tools.ps1`** - Module séparé pour les outils Python
- Fonctions modulaires pour Promptfoo, Garak, Strix
- Peut être utilisé indépendamment
- Appelé automatiquement par install-auto.ps1

**`GUIDE_INSTALLATION_COMPLETE.md`** - Documentation détaillée
- Guide pas à pas complet (9 étapes)
- Toutes les commandes PowerShell
- Section dépannage
- 700+ lignes de documentation

---

## 🎯 Utilisation (Pour Novices)

### 1. Ouvrir PowerShell

```powershell
# Clic droit sur le menu Démarrer → Windows PowerShell
# OU appuyez sur Win+X puis P
```

### 2. Naviguer vers le dossier du projet

```powershell
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert
```

### 3. Exécuter le script automatique

```powershell
.\install-auto.ps1
```

### 4. Choisir le mode

Le script vous demandera de choisir :
- **[1] STANDALONE** ← Recommandé pour débutants (Frontend uniquement)
- **[2] FULLSTACK** ← Pour développeurs (Frontend + Backend)
- **[3] DOCKER** ← Pour production (Tout via Docker)

### 5. Attendre la fin (15-30 minutes)

Le script fait **TOUT automatiquement** :
- ✅ Installe npm dependencies (frontend + backend)
- ✅ Installe Python uv
- ✅ Clone Garak depuis GitHub
- ✅ Clone Strix depuis GitHub
- ✅ Installe requirements.txt pour Garak et Strix
- ✅ Installe Playwright avec navigateurs
- ✅ Configure les fichiers .env
- ✅ Génère le client Prisma
- ✅ Teste que tout fonctionne

### 6. Configurer les clés API

Après l'installation, éditez les fichiers `.env` :

**`.env` (racine):**
```env
GEMINI_API_KEY=votre_cle_gemini_ici
```

**`backend/.env`:**
```env
GEMINI_API_KEY=votre_cle_gemini_ici
OPENAI_API_KEY=votre_cle_openai_ici
```

### 7. Démarrer l'application

**Mode Standalone:**
```powershell
npm run dev
# Ouvrir http://localhost:5080
```

**Mode Fullstack:**
```powershell
# Terminal 1 (Backend)
cd backend
npm run start:dev

# Terminal 2 (Frontend)
npm run dev
# Ouvrir http://localhost:5080
```

**Mode Docker:**
```powershell
docker-compose up -d
# Ouvrir http://localhost:3004
```

---

## 🛠️ Prérequis (à installer AVANT le script)

### Obligatoires

1. **Node.js >= 18.0.0**
   - Télécharger: https://nodejs.org/
   - Vérifier: `node --version`

2. **Python >= 3.10**
   - Télécharger: https://www.python.org/downloads/
   - ⚠️ **IMPORTANT**: Cocher "Add Python to PATH" lors de l'installation
   - Vérifier: `python --version`

3. **Git**
   - Télécharger: https://git-scm.com/
   - Nécessaire pour cloner Garak et Strix
   - Vérifier: `git --version`

### Optionnels (selon le mode)

4. **Docker** (pour mode fullstack/docker)
   - Télécharger: https://www.docker.com/products/docker-desktop
   - Vérifier: `docker --version` et `docker ps`

---

## ✅ Ce que le Script Installe Automatiquement

### Frontend
- ✅ npm dependencies (react, vite, tailwindcss, etc.)
- ✅ Composants unifiés (UnifiedSecurityHub, GarakScannerUI, StrixDashboard)
- ✅ Configuration .env

### Backend (mode fullstack/docker)
- ✅ npm dependencies (@nestjs/core, @prisma/client, bull, etc.)
- ✅ 11 modules API Gateway:
  - UnifiedModule
  - GarakModule
  - StrixModule
  - PromptfooModule
  - TestsModule
  - PoliciesModule
  - RisksModule
  - UsersModule
  - AnalyticsModule
  - McpModule
  - GeminiModule
- ✅ Client Prisma généré
- ✅ Configuration backend/.env avec secrets aléatoires

### Python + Outils
- ✅ **uv** (gestionnaire de packages ultra-rapide)
- ✅ **Promptfoo** (npm install -g promptfoo)
- ✅ **Garak** (clone GitHub + installation)
  - Clone depuis: https://github.com/leondz/garak
  - Installation: `uv pip install -r requirements.txt`
  - Installation dev: `python -m pip install -e .`
- ✅ **Strix** (clone GitHub + installation)
  - Clone depuis: https://github.com/BishopFox/strix
  - Installation: `uv pip install -r requirements.txt`
  - Installation dev: `python -m pip install -e .`
  - Playwright + navigateurs chromium

---

## 📊 Vérifications Post-Installation

Le script vérifie automatiquement :

- ✅ Dépendances npm frontend installées
- ✅ Dépendances npm backend installées (si mode fullstack/docker)
- ✅ Composants frontend unifiés présents
- ✅ Modules backend API Gateway présents
- ✅ Client Prisma généré
- ✅ Garak cloné et installé
- ✅ Strix cloné et installé
- ✅ Playwright installé avec navigateurs

---

## 🔍 Tester les Installations

### Tester Promptfoo
```powershell
promptfoo --version
promptfoo --help
```

### Tester Garak
```powershell
cd guardrail/garak
python -m garak --version
python -m garak --help
```

### Tester Strix
```powershell
cd guardrail/strix
python -m strix --help
```

### Tester Playwright
```powershell
python -m playwright --version
```

---

## 🆘 Dépannage

### Erreur: "PowerShell execution policy"
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Erreur: "Node.js version < 18"
- Désinstaller l'ancienne version de Node.js
- Télécharger Node.js 18+ depuis https://nodejs.org/
- Réinstaller

### Erreur: "Python not found"
- Vérifier que Python est dans le PATH :
  ```powershell
  $env:Path
  ```
- Ajouter Python au PATH manuellement si nécessaire

### Erreur: "Git clone failed"
- Vérifier la connexion Internet
- Vérifier que Git est installé : `git --version`
- Réessayer : le script peut être relancé sans problème

### Erreur: "uv install failed"
- Pas grave ! Le script continue avec pip classique
- uv est juste un accélérateur, pas obligatoire

### Erreur: "Playwright install failed"
- Réinstaller manuellement :
  ```powershell
  python -m pip install playwright
  python -m playwright install chromium
  ```

---

## 📁 Structure Créée par le Script

```
guardrails_AI_expert/
├── .env                                    # ✅ Créé automatiquement
├── backend/
│   ├── .env                                # ✅ Créé automatiquement
│   ├── node_modules/                       # ✅ Installé automatiquement
│   ├── apps/api-gateway/src/
│   │   ├── unified/                        # ✅ Vérifié
│   │   ├── garak/                          # ✅ Vérifié
│   │   ├── strix/                          # ✅ Vérifié
│   │   └── ...autres modules
│   └── node_modules/.prisma/client/        # ✅ Généré automatiquement
├── node_modules/                           # ✅ Installé automatiquement
├── guardrail/
│   ├── garak/                              # ✅ Cloné depuis GitHub
│   │   ├── .git/
│   │   ├── requirements.txt
│   │   └── garak/
│   ├── strix/                              # ✅ Cloné depuis GitHub
│   │   ├── .git/
│   │   ├── requirements.txt
│   │   └── strix/
│   └── solution_promptfoo/                 # Déjà existant
└── src/components/unified/                 # ✅ Vérifié
    ├── UnifiedSecurityHub.tsx
    ├── GarakScannerUI.tsx
    └── StrixDashboard.tsx
```

---

## 🎯 Ordre d'Exécution du Script

Le script `install-auto.ps1` exécute dans cet ordre :

1. **[1/12]** Vérification des prérequis (Node, Python, Git, Docker)
2. **[2/12]** Installation de uv (Python package manager)
3. **[3/12]** Installation du frontend (npm install)
4. **[4/12]** Installation du backend (npm install backend)
5. **[5/12]** Configuration des fichiers .env
6. **[6/12]** Initialisation de Prisma (client generation)
7. **[7/12]** Installation de Promptfoo (npm -g)
8. **[8/12]** Installation de Garak (git clone + pip install)
9. **[9/12]** Installation de Strix (git clone + pip install + Playwright)
10. **[10/12]** Tests de validation
11. **[11/12]** Vérification finale
12. **[12/12]** Résumé et prochaines étapes

---

## 💡 Conseils

1. **Première installation ?** → Utilisez **install-auto.ps1** en mode **STANDALONE**
2. **Connexion Internet lente ?** → L'installation peut prendre 30-45 minutes
3. **Erreur pendant l'installation ?** → Relancez le script, il reprend où il s'est arrêté
4. **Besoin de tout réinstaller ?** → Supprimez `node_modules/`, `backend/node_modules/`, `guardrail/garak/`, `guardrail/strix/` puis relancez
5. **Mettre à jour Garak/Strix ?** → Le script détecte automatiquement les mises à jour disponibles et propose de les appliquer

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **GUIDE_INSTALLATION_COMPLETE.md** (700+ lignes, très détaillé)
- **UNIFIED_PLATFORM_IMPLEMENTATION_SUMMARY.md** (architecture technique)
- **README.md** (vue d'ensemble du projet)
- **src/components/unified/README.md** (composants frontend)

---

## ✨ Résumé pour Utilisateurs Novices

```powershell
# 1. Ouvrir PowerShell
# 2. Naviguer vers le dossier
cd C:\Users\globa\ai_risk_and_red_team_manager\guardrails_AI_expert

# 3. Lancer le script automatique
.\install-auto.ps1

# 4. Choisir le mode (1, 2, ou 3)
# 5. Attendre 15-30 minutes ☕
# 6. Éditer .env avec votre GEMINI_API_KEY
# 7. Lancer: npm run dev
# 8. Ouvrir: http://localhost:5080
# 9. Profiter! 🎉
```

---

**Version**: 2.0
**Date**: 2025-11-05
**Auteur**: Claude Code Assistant
