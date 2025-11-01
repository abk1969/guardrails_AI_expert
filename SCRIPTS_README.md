# Scripts PowerShell - Guide Complet

Ce répertoire contient une suite complète de scripts PowerShell pour gérer tous les aspects du projet AI RISK MANAGER.

## 📋 Vue d'Ensemble

| Script | Description | Usage Principal |
|--------|-------------|-----------------|
| **install.ps1** | Installation complète du projet | Première installation |
| **uninstall.ps1** | Nettoyage et désinstallation | Suppression de dépendances |
| **update.ps1** | Mise à jour des dépendances | Maintenance régulière |
| **backup.ps1** | Sauvegarde et restauration | Protection des données |
| **migrate.ps1** | Gestion des migrations DB | Évolution du schéma |
| **dev.ps1** | Utilitaire de développement | Usage quotidien |

---

## 🚀 install.ps1 - Installation

### Description
Script d'installation intelligent qui configure tous les services selon le mode choisi.

### Modes Disponibles

#### 1. Mode Standalone (Frontend Seul)
```powershell
.\install.ps1 -Mode standalone
```
- Installe uniquement le frontend
- Idéal pour démonstration/test rapide
- Aucune dépendance Docker requise

#### 2. Mode Fullstack (Frontend + Backend Local)
```powershell
.\install.ps1 -Mode fullstack
```
- Installe frontend et backend
- Docker requis pour PostgreSQL/Redis
- Idéal pour développement

#### 3. Mode Docker (Recommandé)
```powershell
.\install.ps1 -Mode docker
```
- Tous les services dans Docker
- Configuration complète
- Prêt pour production

### Options
```powershell
-Mode <standalone|fullstack|docker>  # Mode d'installation
-SkipDependencies                     # Ignore vérification prérequis
```

### Ce Que le Script Fait
1. ✅ Vérifie Node.js >= 18, npm >= 9, Docker
2. 📦 Installe les dépendances npm (frontend + backend)
3. 📝 Crée les fichiers .env avec configuration par défaut
4. 🔧 Initialise Prisma (génère client, sync schéma)
5. 🚀 Optionnellement démarre les services

---

## 🗑️ uninstall.ps1 - Nettoyage

### Description
Nettoie les dépendances et conteneurs Docker.

### Usage
```powershell
# Nettoyage standard (node_modules, dist)
.\uninstall.ps1

# Nettoyage complet (inclut .env)
.\uninstall.ps1 -CleanAll

# Nettoyer uniquement Docker
.\uninstall.ps1 -CleanDocker
```

### Ce Qui Est Supprimé
- ✅ `node_modules/` (frontend + backend)
- ✅ `dist/` (builds compilés)
- ✅ `package-lock.json`
- ✅ Conteneurs Docker
- ✅ Images Docker (optionnel)
- ⚠️ `.env` (uniquement avec -CleanAll)

---

## 🔄 update.ps1 - Mise à Jour

### Description
Met à jour les dépendances npm et images Docker avec sauvegarde automatique.

### Usage
```powershell
# Mise à jour interactive (recommandé)
.\update.ps1

# Mettre à jour un composant spécifique
.\update.ps1 -Component frontend
.\update.ps1 -Component backend
.\update.ps1 -Component docker

# Forcer la mise à jour sans confirmation
.\update.ps1 -Force
```

### Processus
1. 📊 Affiche les packages obsolètes
2. 💾 Crée un backup automatique
3. 🔄 Met à jour les dépendances
4. 🔒 Exécute `npm audit fix`
5. 🔧 Régénère le client Prisma
6. ✅ Restaure le backup en cas d'erreur

### Sécurité
- Backup automatique avant toute modification
- Rollback automatique si échec
- Logs détaillés de chaque changement

---

## 💾 backup.ps1 - Sauvegarde & Restauration

### Description
Système complet de backup avec manifeste et vérification d'intégrité.

### Types de Backup

#### Backup Complet (Recommandé)
```powershell
.\backup.ps1 -Type full
```
Inclut:
- Base de données PostgreSQL (dump SQL)
- Données Redis (dump.rdb)
- Fichiers de configuration (.env, docker-compose.yml)
- Données importantes (compassContent.ts, etc.)
- Snapshot du code (package.json, git info)

#### Backup Base de Données Uniquement
```powershell
.\backup.ps1 -Type database
```

#### Backup Configuration
```powershell
.\backup.ps1 -Type config
```

#### Backup Code Source
```powershell
.\backup.ps1 -Type code
```

### Restauration
```powershell
# Lister les backups disponibles
.\backup.ps1

# Restaurer un backup spécifique
.\backup.ps1 -Restore backups/backup_20250131_120000
```

### Structure du Backup
```
backups/backup_YYYYMMDD_HHMMSS/
├── MANIFEST.json          # Métadonnées + checksums SHA256
├── database_dump.sql      # Export PostgreSQL
├── redis_dump.rdb         # Données Redis
├── .env                   # Configuration frontend
├── backend/.env           # Configuration backend
├── docker-compose.yml     # Configuration Docker
├── data/                  # Données importantes
├── code/                  # Snapshot du code
│   ├── package.json
│   └── GIT_INFO.md       # Commit, branch, status
└── LOCALSTORAGE_README.md # Instructions manuelles
```

### Manifeste
Chaque backup inclut un manifeste JSON avec:
- Timestamp et type de backup
- Hostname et utilisateur
- Liste complète des fichiers
- Hash SHA256 de chaque fichier
- Taille de chaque fichier

---

## 🔧 migrate.ps1 - Gestion des Migrations

### Description
Wrapper convivial pour Prisma Migrate avec sécurité renforcée.

### Actions Disponibles

#### 1. Voir le Statut
```powershell
.\migrate.ps1 -Action status
```
Affiche:
- Migrations appliquées
- Migrations en attente
- État de la base de données

#### 2. Créer une Migration
```powershell
.\migrate.ps1 -Action create -Name "add_user_roles"
```
Processus:
1. Crée un backup automatique
2. Génère la migration
3. Propose de l'appliquer immédiatement

#### 3. Appliquer les Migrations
```powershell
.\migrate.ps1 -Action apply
```
Options:
- `dev`: Utilise `prisma migrate dev` (avec validations)
- `prod`: Utilise `prisma migrate deploy` (sans validations)

#### 4. Peupler la Base (Seed)
```powershell
.\migrate.ps1 -Action seed
```
- Exécute `prisma/seed.ts`
- Crée le fichier si inexistant
- Propose d'ouvrir dans l'éditeur

#### 5. Réinitialiser la Base
```powershell
.\migrate.ps1 -Action reset
```
⚠️ **DANGER**: Supprime TOUTES les données!
- Requiert confirmation ("RESET")
- Crée un backup de sécurité
- Réapplique toutes les migrations
- Propose d'exécuter le seed

#### 6. Rollback
```powershell
.\migrate.ps1 -Action rollback
```
Options suggérées:
- Restaurer depuis backup
- Créer migration inverse
- Reset complet

#### 7. Prisma Studio
```powershell
.\migrate.ps1 -Action studio
```
Ouvre l'interface GUI sur http://localhost:5555

### Sécurité
- ✅ Backup automatique avant chaque migration
- ✅ Confirmation requise pour actions destructives
- ✅ Validation de connexion DB avant action
- ✅ Messages d'erreur clairs avec suggestions

---

## 🛠️ dev.ps1 - Utilitaire de Développement

### Description
Commande centralisée pour toutes les tâches de développement quotidiennes.

### Usage Rapide
```powershell
# Mode interactif (recommandé)
.\dev.ps1

# Commande directe
.\dev.ps1 -Task start
.\dev.ps1 -Task status
.\dev.ps1 -Task logs
```

### Commandes Disponibles

#### Gestion des Services
```powershell
.\dev.ps1 start      # Démarrer (standalone/fullstack/docker)
.\dev.ps1 stop       # Arrêter les services
.\dev.ps1 restart    # Redémarrer
.\dev.ps1 status     # Voir le statut
.\dev.ps1 logs       # Afficher les logs
```

#### Build & Test
```powershell
.\dev.ps1 build      # Compiler frontend/backend/tous
.\dev.ps1 test       # Exécuter les tests
.\dev.ps1 lint       # Analyser le code (ESLint)
.\dev.ps1 format     # Formater (Prettier)
```

#### Maintenance
```powershell
.\dev.ps1 clean      # Nettoyer node_modules
.\dev.ps1 update     # Mettre à jour dépendances
.\dev.ps1 backup     # Créer un backup
.\dev.ps1 migrate    # Gérer migrations DB
```

#### Utilitaires
```powershell
.\dev.ps1 urls       # Ouvrir toutes les URLs
.\dev.ps1 studio     # Ouvrir Prisma Studio
.\dev.ps1 shell      # Shell dans conteneur Docker
.\dev.ps1 help       # Aide complète
```

### Modes de Démarrage

#### 1. Standalone (Frontend Seul)
- URL: http://localhost:5080
- Pas de backend
- Données en localStorage

#### 2. Fullstack
- Démarre PostgreSQL/Redis avec Docker
- Ouvre backend dans nouvelle fenêtre
- Démarre frontend
- URLs: Frontend (5080) + Backend (3001)

#### 3. Docker
- Tous les services dans Docker
- URLs multiples (frontend, API, Adminer, etc.)
- Monitoring inclus (Grafana, Prometheus)

### Shell Docker
Accès direct aux conteneurs:
- Backend (api-gateway)
- PostgreSQL (psql)
- Redis (redis-cli)

---

## 🎯 Workflows Recommandés

### Premier Démarrage
```powershell
# 1. Installation complète
.\install.ps1 -Mode docker

# 2. Vérifier le statut
.\dev.ps1 status

# 3. Démarrer les services
.\dev.ps1 start
```

### Développement Quotidien
```powershell
# Démarrer en mode fullstack
.\dev.ps1 start

# Voir les logs en temps réel
.\dev.ps1 logs

# Tester après modifications
.\dev.ps1 test

# Compiler pour production
.\dev.ps1 build
```

### Maintenance Hebdomadaire
```powershell
# 1. Créer un backup
.\backup.ps1 -Type full

# 2. Mettre à jour les dépendances
.\update.ps1

# 3. Exécuter les tests
.\dev.ps1 test

# 4. Vérifier les migrations
.\migrate.ps1 -Action status
```

### Avant Mise en Production
```powershell
# 1. Backup complet
.\backup.ps1 -Type full

# 2. Appliquer les migrations
.\migrate.ps1 -Action apply

# 3. Build production
.\dev.ps1 build

# 4. Tests complets
.\dev.ps1 test

# 5. Vérifier le statut
.\dev.ps1 status
```

### En Cas de Problème
```powershell
# 1. Voir les logs
.\dev.ps1 logs

# 2. Vérifier le statut
.\dev.ps1 status

# 3. Si nécessaire, restaurer backup
.\backup.ps1 -Restore backups/backup_XXXXXXXX_XXXXXX

# 4. Réinitialiser complètement
.\uninstall.ps1 -CleanAll
.\install.ps1 -Mode docker
```

---

## ⚙️ Configuration PowerShell

### Exécution des Scripts

#### Windows - Politique d'Exécution
```powershell
# Temporaire (session actuelle)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Permanent (utilisateur actuel)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

#### Erreur "Impossible de charger le fichier .ps1"
```powershell
# Solution 1: Débloquer le fichier
Unblock-File -Path .\install.ps1

# Solution 2: Exécuter avec bypass
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

### Alias Pratiques (Optionnel)
Ajoutez à votre profil PowerShell (`$PROFILE`):
```powershell
function dev { .\dev.ps1 @args }
function backup { .\backup.ps1 @args }
function migrate { .\migrate.ps1 @args }
function update { .\update.ps1 @args }
```

Usage simplifié:
```powershell
dev start
backup -Type full
migrate -Action status
```

---

## 🔍 Dépannage

### "Node.js n'est pas installé"
```powershell
# Télécharger depuis https://nodejs.org/
# Version requise: >= 18.0.0
```

### "Docker n'est pas démarré"
```powershell
# Démarrer Docker Desktop
# Attendre que l'icône soit verte
# Réessayer le script
```

### "Port déjà utilisé"
```powershell
# Trouver le processus
netstat -ano | findstr :5080

# Tuer le processus
taskkill /PID <PID> /F
```

### "Cannot connect to database"
```powershell
# Vérifier que PostgreSQL est démarré
docker-compose ps postgres

# Redémarrer si nécessaire
docker-compose restart postgres

# Vérifier l'URL dans backend/.env
```

### "Migration failed"
```powershell
# Restaurer depuis backup
.\backup.ps1 -Restore backups/backup_XXXXXXXX_XXXXXX

# Ou réinitialiser complètement
.\migrate.ps1 -Action reset
```

---

## 📚 Ressources

### Documentation Liée
- [INSTALLATION.md](./INSTALLATION.md) - Guide d'installation détaillé
- [CLAUDE.md](./CLAUDE.md) - Architecture et développement
- [README.md](./README.md) - Guide utilisateur
- [SETUP_GEMINI_API.md](./SETUP_GEMINI_API.md) - Configuration API Gemini

### Commandes PowerShell Utiles
```powershell
# Voir l'aide d'un script
Get-Help .\install.ps1 -Full

# Lister les paramètres
Get-Command .\dev.ps1 -Syntax

# Historique des commandes
Get-History

# Nettoyer l'écran
Clear-Host  # ou cls
```

---

## 🔐 Sécurité

### Bonnes Pratiques
1. ✅ **Backups réguliers**: Utilisez `backup.ps1` avant modifications importantes
2. ✅ **Vérification des mises à jour**: Lisez le changelog avant `update.ps1`
3. ✅ **Environnements séparés**: Différents `.env` pour dev/staging/prod
4. ✅ **Pas de secrets dans Git**: Les `.env` sont dans `.gitignore`
5. ✅ **Migrations testées**: Testez en dev avant prod

### Fichiers Sensibles
Ces fichiers contiennent des secrets et ne doivent JAMAIS être commités:
- `.env`
- `backend/.env`
- `backups/` (peuvent contenir des secrets)

---

## 💡 Astuces

### Raccourcis Clavier
- **Ctrl+C**: Arrêter un script en cours
- **Ctrl+L**: Effacer l'écran (ou `cls`)
- **Tab**: Auto-complétion
- **F7**: Historique des commandes

### Automatisation
Créez un fichier `quick-start.bat`:
```batch
@echo off
powershell -ExecutionPolicy Bypass -File .\dev.ps1 -Task start
```

Double-cliquez pour démarrer rapidement!

### Monitoring
```powershell
# Terminal 1: Logs backend
docker-compose logs -f api-gateway

# Terminal 2: Logs frontend
docker-compose logs -f frontend

# Terminal 3: Logs base de données
docker-compose logs -f postgres
```

---

## 📊 Comparaison avec npm scripts

| Tâche | npm | PowerShell Script |
|-------|-----|-------------------|
| Démarrer dev | `npm run dev` | `.\dev.ps1 start` (mode interactif) |
| Build | `npm run build` | `.\dev.ps1 build` (choix composant) |
| Tests | `npm test` | `.\dev.ps1 test` (frontend+backend) |
| Mise à jour | `npm update` | `.\update.ps1` (avec backup auto) |
| Migration | `npx prisma migrate dev` | `.\migrate.ps1` (avec sécurité) |

**Avantages des scripts PowerShell:**
- ✅ Interface interactive
- ✅ Gestion multi-composants
- ✅ Backups automatiques
- ✅ Validation et sécurité
- ✅ Messages colorés
- ✅ Gestion d'erreurs robuste

---

**Version:** 1.0.0
**Dernière mise à jour:** 2025-10-31
**Compatibilité:** Windows PowerShell 5.1+, PowerShell Core 7+
