# ✅ Checklist d'Installation - AI RISK MANAGER

## 🎯 Objectif
S'assurer que tous les composants sont correctement installés et fonctionnels.

---

## 📋 Phase 1: Prérequis

### Logiciels Requis
- [ ] **Node.js >= 18.0.0**
  ```powershell
  node --version
  # Devrait afficher v18.x.x ou supérieur
  ```

- [ ] **npm >= 9.0.0**
  ```powershell
  npm --version
  # Devrait afficher 9.x.x ou supérieur
  ```

### Logiciels Optionnels (selon le mode)
- [ ] **Docker Desktop** (pour modes fullstack/docker)
  ```powershell
  docker --version
  docker-compose --version
  docker ps  # Vérifier que Docker est démarré
  ```

---

## 📋 Phase 2: Installation

### Exécution du Script
- [ ] Script d'installation exécuté sans erreur
  ```powershell
  .\install.ps1 -Mode docker
  # OU
  .\install.ps1 -Mode standalone
  # OU
  .\install.ps1 -Mode fullstack
  ```

### Fichiers Créés
- [ ] Fichier `.env` existe à la racine
- [ ] Fichier `backend/.env` existe (modes fullstack/docker)
- [ ] Dossier `node_modules/` créé à la racine
- [ ] Dossier `backend/node_modules/` créé (modes fullstack/docker)

### Configuration
- [ ] Clé API Gemini ajoutée dans `.env`
  ```env
  GEMINI_API_KEY=votre_cle_reelle_ici
  ```

---

## 📋 Phase 3: Vérification (Mode Docker)

### Conteneurs Docker
- [ ] Tous les conteneurs sont démarrés
  ```powershell
  docker-compose ps
  # Tous les services doivent être "Up"
  ```

### Services Accessibles
- [ ] **Frontend:** http://localhost:3004
  - Page se charge correctement
  - Pas d'erreur dans la console navigateur (F12)

- [ ] **API Gateway:** http://localhost:3003/api/docs
  - Swagger UI se charge
  - Liste des endpoints visible

- [ ] **Adminer:** http://localhost:8082
  - Interface de connexion visible
  - Connexion possible avec:
    - Server: `postgres`
    - User: `airiskmgr`
    - Password: `airiskmgr_dev_password`
    - Database: `airiskmgr_db`

- [ ] **Redis Commander:** http://localhost:8081
  - Interface Redis visible
  - Connexion établie

- [ ] **Grafana:** http://localhost:3002
  - Login: admin / admin
  - Tableau de bord visible

### Base de Données
- [ ] PostgreSQL accessible
  ```powershell
  docker exec airiskmgr-postgres psql -U airiskmgr -d airiskmgr_db -c "\dt"
  # Liste des tables visible
  ```

- [ ] Schéma Prisma appliqué
  ```powershell
  cd backend
  npm run prisma:studio
  # Prisma Studio s'ouvre sur http://localhost:5555
  ```

---

## 📋 Phase 4: Vérification (Mode Standalone)

### Frontend
- [ ] Serveur de développement démarre
  ```powershell
  npm run dev
  ```

- [ ] **Frontend:** http://localhost:5080
  - Page se charge correctement
  - Tableau de bord visible
  - Aucune erreur console

### Fonctionnalités
- [ ] Navigation fonctionne (sidebar)
- [ ] Modules accessibles:
  - [ ] Tableau de bord
  - [ ] Analyses
  - [ ] Dataset Manager
  - [ ] OWASP COMPASS

---

## 📋 Phase 5: Vérification (Mode Fullstack)

### Backend
- [ ] Backend démarre sans erreur
  ```powershell
  cd backend
  npm run start:dev
  ```

- [ ] API accessible: http://localhost:3001
- [ ] Swagger UI: http://localhost:3001/api/docs

### Frontend
- [ ] Frontend démarre sans erreur
  ```powershell
  npm run dev
  ```

- [ ] Frontend accessible: http://localhost:5080
- [ ] Communication frontend ↔ backend fonctionne

### Base de Données
- [ ] PostgreSQL démarré
  ```powershell
  docker-compose ps postgres
  # État: Up
  ```

- [ ] Redis démarré
  ```powershell
  docker-compose ps redis
  # État: Up
  ```

---

## 📋 Phase 6: Test Fonctionnel

### Test de Génération de Prompts
- [ ] Ouvrir le Tableau de bord
- [ ] Sélectionner une catégorie (ex: "Sécurité et Confidentialité")
- [ ] Choisir complexité: Simple
- [ ] Volume: 10 prompts
- [ ] Cliquer "Lancer le Test"
- [ ] Test s'exécute sans erreur
- [ ] Résultats s'affichent

### Test de Navigation
- [ ] Module "Analytics" accessible
- [ ] Module "Dataset Manager" accessible
- [ ] Module "OWASP COMPASS" accessible
  - [ ] 31 cas d'usage visibles
  - [ ] Filtres fonctionnent
  - [ ] Modal de détails s'ouvre

### Test des Scripts Utilitaires
- [ ] `.\dev.ps1 status` affiche le statut
- [ ] `.\dev.ps1 logs` affiche les logs (Ctrl+C pour quitter)
- [ ] `.\backup.ps1` liste les backups

---

## 📋 Phase 7: Performance & Stabilité

### Temps de Réponse
- [ ] Frontend se charge en < 3 secondes
- [ ] Navigation entre modules fluide
- [ ] Génération de test démarre rapidement

### Logs Propres
- [ ] Pas d'erreurs dans les logs frontend
  ```powershell
  # Console navigateur (F12) - onglet Console
  ```

- [ ] Pas d'erreurs dans les logs backend (mode fullstack/docker)
  ```powershell
  docker-compose logs api-gateway
  # OU
  cd backend && npm run start:dev
  ```

- [ ] Pas d'erreurs PostgreSQL
  ```powershell
  docker-compose logs postgres
  ```

---

## 📋 Phase 8: Documentation

### Fichiers Présents
- [ ] `README.md` - Guide principal
- [ ] `CLAUDE.md` - Architecture
- [ ] `QUICK_START.md` - Démarrage rapide
- [ ] `INSTALLATION.md` - Installation détaillée
- [ ] `SCRIPTS_README.md` - Documentation scripts
- [ ] `SCRIPTS_SUMMARY.md` - Résumé scripts
- [ ] `SETUP_GEMINI_API.md` - Configuration API

### Scripts PowerShell
- [ ] `install.ps1` - Installation
- [ ] `uninstall.ps1` - Nettoyage
- [ ] `dev.ps1` - Développement
- [ ] `backup.ps1` - Sauvegarde
- [ ] `update.ps1` - Mise à jour
- [ ] `migrate.ps1` - Migrations

---

## 🎉 Installation Complète!

Si toutes les cases sont cochées, félicitations! L'installation est réussie.

### Prochaines Étapes

1. **Lire la documentation:**
   - [ ] [QUICK_START.md](../QUICK_START.md)
   - [ ] [README.md](../README.md)
   - [ ] [SCRIPTS_README.md](../SCRIPTS_README.md)

2. **Personnaliser:**
   - [ ] Configurer votre profil de menaces
   - [ ] Ajouter vos cas d'usage
   - [ ] Importer votre dataset

3. **Explorer:**
   - [ ] Tester tous les modules
   - [ ] Consulter OWASP COMPASS
   - [ ] Configurer des politiques AI

---

## 🐛 En Cas de Problème

### ❌ Cases Non Cochées?

**Consultez:**
1. [INSTALLATION.md](../INSTALLATION.md) - Section Dépannage
2. [SCRIPTS_README.md](../SCRIPTS_README.md) - Documentation des scripts
3. Logs des services:
   ```powershell
   .\dev.ps1 logs
   ```

**Actions Correctives:**
```powershell
# Réinitialiser complètement
.\uninstall.ps1 -CleanAll
docker-compose down -v
.\install.ps1 -Mode docker

# Ou restaurer un backup
.\backup.ps1 -Restore backups/backup_XXXXXXXX_XXXXXX
```

---

## 📝 Notes d'Installation

**Date d'installation:** _______________

**Mode choisi:** [ ] Standalone  [ ] Fullstack  [ ] Docker

**Problèmes rencontrés:**
```
_________________________________________________________
_________________________________________________________
_________________________________________________________
```

**Solutions appliquées:**
```
_________________________________________________________
_________________________________________________________
_________________________________________________________
```

**Temps total d'installation:** _______________ minutes

**Version Node.js:** _______________
**Version npm:** _______________
**Version Docker:** _______________

---

**Checklist Version:** 1.0.0
**Date:** 2025-10-31
