# Guide d'Installation - AI RISK MANAGER

Ce guide détaille les différentes méthodes d'installation du projet AI RISK MANAGER.

## 📋 Prérequis

### Prérequis Obligatoires
- **Node.js** >= 18.0.0 ([Télécharger](https://nodejs.org/))
- **npm** >= 9.0.0 (inclus avec Node.js)

### Prérequis Optionnels (selon le mode)
- **Docker Desktop** ([Télécharger](https://www.docker.com/products/docker-desktop)) - Requis pour modes `fullstack` et `docker`
- **PostgreSQL 16** - Optionnel si vous utilisez Docker
- **Redis 7** - Optionnel si vous utilisez Docker

## 🚀 Installation Rapide (Recommandé)

### Windows (PowerShell)

```powershell
# Cloner le repository (si ce n'est pas déjà fait)
git clone <repository-url>
cd guardrails_AI_expert

# Rendre le script exécutable et lancer l'installation
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\install.ps1
```

Le script vous guidera à travers le processus d'installation en mode interactif.

### Options du Script PowerShell

```powershell
# Mode Standalone (Frontend uniquement)
.\install.ps1 -Mode standalone

# Mode Fullstack (Frontend + Backend local)
.\install.ps1 -Mode fullstack

# Mode Docker (Tous les services dans Docker - RECOMMANDÉ)
.\install.ps1 -Mode docker

# Ignorer la vérification des prérequis
.\install.ps1 -SkipDependencies
```

## 📦 Modes d'Installation

### 1. Mode Standalone (Frontend Seul)

**Idéal pour:** Démonstration, test rapide, développement frontend uniquement

**Ce qui est installé:**
- Dépendances frontend (React, Vite, Tailwind, etc.)
- Configuration .env frontend

**Commandes:**
```powershell
.\install.ps1 -Mode standalone
npm run dev
```

**Services disponibles:**
- Frontend: http://localhost:5080

**Limitations:**
- Pas de persistance des données (localStorage uniquement)
- Simulation des tests uniquement
- Pas d'authentification multi-utilisateurs

---

### 2. Mode Fullstack (Local)

**Idéal pour:** Développement backend, test des API, debugging

**Ce qui est installé:**
- Dépendances frontend
- Dépendances backend (NestJS, Prisma, etc.)
- Configuration .env pour frontend et backend
- Client Prisma généré

**Commandes:**
```powershell
.\install.ps1 -Mode fullstack

# Démarrer PostgreSQL et Redis avec Docker
docker-compose up -d postgres redis

# Synchroniser le schéma de base de données
cd backend
npm run prisma:push
npm run prisma:seed  # (Optionnel) Peupler avec des données de test

# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
npm run dev
```

**Services disponibles:**
- Frontend: http://localhost:5080
- API Gateway: http://localhost:3001
- PostgreSQL: localhost:5435
- Redis: localhost:6380

**Avantages:**
- Contrôle total sur chaque service
- Debugging facilité
- Hot reload sur frontend et backend

---

### 3. Mode Docker (Recommandé pour Production)

**Idéal pour:** Déploiement, environnement complet, CI/CD

**Ce qui est installé:**
- Tous les services dans des conteneurs Docker
- Base de données PostgreSQL
- Cache Redis
- Monitoring (Prometheus, Grafana)
- Email testing (Mailhog)

**Commandes:**
```powershell
.\install.ps1 -Mode docker

# Ou démarrer manuellement après installation
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

**Services disponibles:**
- **Frontend:** http://localhost:3004
- **API Gateway:** http://localhost:3003
- **Adminer (DB UI):** http://localhost:8082
  - Server: `postgres`, User: `airiskmgr`, Password: `airiskmgr_dev_password`, Database: `airiskmgr_db`
- **Redis Commander:** http://localhost:8081
- **Mailhog UI:** http://localhost:8025
- **Grafana:** http://localhost:3002
  - User: `admin`, Password: `admin`
- **Prometheus:** http://localhost:9090

**Avantages:**
- Environnement complet en une commande
- Isolation des services
- Facile à déployer
- Inclut monitoring et outils de debug

## 🔧 Installation Manuelle

Si vous préférez installer manuellement sans le script PowerShell:

### Étape 1: Installer les dépendances

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### Étape 2: Configurer les environnements

**Frontend (.env):**
```env
GEMINI_API_KEY=your_gemini_key_here
VITE_API_URL=http://localhost:3003/api/v1
VITE_WS_URL=ws://localhost:3003
VITE_MCP_API_URL=http://localhost:3003/api/v1/mcp
VITE_MCP_MOCK_MODE=false
```

**Backend (backend/.env):**
```env
DATABASE_URL=postgresql://airiskmgr:airiskmgr_dev_password@localhost:5435/airiskmgr_db
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=redis_dev_password
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
ENCRYPTION_KEY=your-32-char-encryption-key
```

### Étape 3: Initialiser Prisma (pour mode fullstack/docker)

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### Étape 4: Démarrer les services

**Mode Standalone:**
```bash
npm run dev
```

**Mode Fullstack:**
```bash
# Terminal 1
cd backend
npm run start:dev

# Terminal 2
npm run dev
```

**Mode Docker:**
```bash
docker-compose up -d
```

## 🔑 Configuration de l'API Gemini

1. Obtenez une clé API Gemini sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Ajoutez la clé dans votre fichier `.env`:
   ```env
   GEMINI_API_KEY=votre_cle_api_ici
   ```
3. Pour plus de détails, consultez [SETUP_GEMINI_API.md](./SETUP_GEMINI_API.md)

## 🗑️ Désinstallation / Nettoyage

### Utiliser le script de désinstallation

```powershell
# Nettoyage standard (node_modules, dist)
.\uninstall.ps1

# Nettoyage complet (inclut .env)
.\uninstall.ps1 -CleanAll

# Nettoyer uniquement Docker
.\uninstall.ps1 -CleanDocker
```

### Nettoyage manuel

```bash
# Supprimer les dépendances
rm -rf node_modules backend/node_modules
rm package-lock.json backend/package-lock.json

# Supprimer les builds
rm -rf dist backend/dist

# Arrêter et supprimer les conteneurs Docker
docker-compose down -v

# Supprimer aussi les images Docker (optionnel)
docker-compose down --rmi all
```

## 🐛 Dépannage

### Erreur: "Cannot find module"

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur: "Port already in use"

**Frontend (port 5080):**
```bash
# Windows
netstat -ano | findstr :5080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5080 | xargs kill -9
```

**Backend (port 3001/3003):**
```bash
# Vérifier les processus
netstat -ano | findstr :3001

# Ou simplement changer le port dans .env
PORT=3005
```

### Erreur Docker: "Cannot connect to Docker daemon"

1. Assurez-vous que Docker Desktop est démarré
2. Windows: Vérifiez que WSL2 est activé
3. Redémarrez Docker Desktop

### Erreur Prisma: "Can't reach database server"

1. Vérifiez que PostgreSQL est démarré:
   ```bash
   docker-compose ps postgres
   ```

2. Vérifiez l'URL de connexion dans `backend/.env`:
   ```env
   # Depuis l'hôte (host machine)
   DATABASE_URL=postgresql://airiskmgr:airiskmgr_dev_password@localhost:5435/airiskmgr_db

   # Depuis Docker (container)
   DATABASE_URL=postgresql://airiskmgr:airiskmgr_dev_password@postgres:5432/airiskmgr_db
   ```

3. Recréez la base de données:
   ```bash
   docker-compose down -v
   docker-compose up -d postgres
   cd backend
   npm run prisma:push
   ```

### Problème de permissions sur Windows

```powershell
# Exécuter PowerShell en tant qu'administrateur
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Puis relancer l'installation
.\install.ps1
```

### Le frontend ne peut pas se connecter au backend

1. Vérifiez que le backend est démarré:
   ```bash
   curl http://localhost:3001/health
   # ou
   curl http://localhost:3003/health  # Si Docker
   ```

2. Vérifiez la configuration CORS dans `backend/.env`:
   ```env
   CORS_ORIGIN=http://localhost:5080  # Pour standalone
   CORS_ORIGIN=http://localhost:3004  # Pour Docker
   ```

3. Vérifiez les URLs dans le frontend `.env`:
   ```env
   VITE_API_URL=http://localhost:3001/api/v1  # Standalone backend
   # ou
   VITE_API_URL=http://localhost:3003/api/v1  # Docker
   ```

## 📚 Prochaines Étapes

Après l'installation:

1. ✅ Configurez votre clé API Gemini (voir [SETUP_GEMINI_API.md](./SETUP_GEMINI_API.md))
2. 📖 Lisez [CLAUDE.md](./CLAUDE.md) pour comprendre l'architecture
3. 🚀 Consultez [README.md](./README.md) pour le guide d'utilisation
4. 🧪 Lancez vos premiers tests de guardrails!

## 💡 Conseils de Développement

### Développement Frontend Uniquement
```bash
# Mode standalone suffit
npm run dev
```

### Développement Fullstack
```bash
# Utilisez Docker pour la DB/Redis uniquement
docker-compose up -d postgres redis

# Backend en local pour hot reload
cd backend && npm run start:dev

# Frontend en local
npm run dev
```

### Tests de Performance/Production
```bash
# Utilisez le mode Docker complet
docker-compose up -d

# Vérifiez les metrics
# Grafana: http://localhost:3002
# Prometheus: http://localhost:9090
```

## 🔗 Ressources

- **Documentation complète:** [CLAUDE.md](./CLAUDE.md)
- **Configuration Gemini:** [SETUP_GEMINI_API.md](./SETUP_GEMINI_API.md)
- **Guide utilisateur:** [README.md](./README.md)
- **Docker Compose:** [docker-compose.yml](./docker-compose.yml)
- **API Documentation:** http://localhost:3003/api/docs (Swagger) - après démarrage

## ❓ Support

Si vous rencontrez des problèmes:

1. Consultez la section [Dépannage](#-dépannage) ci-dessus
2. Vérifiez les logs:
   ```bash
   # Docker
   docker-compose logs -f

   # Backend local
   cd backend && npm run start:dev

   # Frontend local
   npm run dev
   ```
3. Recherchez dans les issues GitHub (si le projet est sur GitHub)
4. Créez une nouvelle issue avec les logs d'erreur

---

**Version:** 1.0.0
**Dernière mise à jour:** 2025-10-31
