# 🚀 Guide de Démarrage Rapide - AI RISK MANAGER

**Temps estimé: 5-10 minutes**

## ⚡ Installation Express

### Option 1: Mode Docker (Recommandé)
```powershell
# 1. Cloner le repository
git clone <repository-url>
cd guardrails_AI_expert

# 2. Installer et démarrer
.\install.ps1 -Mode docker

# 3. Ouvrir l'application
# Frontend: http://localhost:3004
```

### Option 2: Mode Standalone (Plus Rapide)
```powershell
# 1. Installation frontend uniquement
.\install.ps1 -Mode standalone

# 2. Démarrer
npm run dev

# 3. Ouvrir l'application
# Frontend: http://localhost:5080
```

## 📝 Configuration Minimale

### Étape 1: Obtenir une Clé API Gemini
1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créez une nouvelle clé API
3. Copiez la clé

### Étape 2: Configurer l'Application
```powershell
# Éditez le fichier .env
notepad .env

# Ajoutez votre clé:
GEMINI_API_KEY=votre_cle_api_ici
```

## 🎯 Premier Test

1. **Ouvrez l'application** dans votre navigateur
2. **Allez au Tableau de bord**
3. **Configurez un test:**
   - Sélectionnez une catégorie (ex: Sécurité et Confidentialité)
   - Choisissez la complexité: Simple
   - Volume: 10 prompts
4. **Cliquez sur "Lancer le Test"**
5. **Visualisez les résultats** en temps réel

## 📊 Accès Rapide aux Services

### Mode Docker
- **Frontend:** http://localhost:3004
- **API Gateway:** http://localhost:3003
- **Swagger API:** http://localhost:3003/api/docs
- **Adminer (DB):** http://localhost:8082
  - Server: `postgres`
  - User: `airiskmgr`
  - Password: `airiskmgr_dev_password`
  - Database: `airiskmgr_db`
- **Redis Commander:** http://localhost:8081
- **Grafana:** http://localhost:3002 (admin/admin)

### Mode Standalone
- **Frontend:** http://localhost:5080

## 🛠️ Commandes Utiles

```powershell
# Démarrer les services
.\dev.ps1 start

# Voir les logs
.\dev.ps1 logs

# Arrêter les services
.\dev.ps1 stop

# Voir le statut
.\dev.ps1 status

# Créer un backup
.\backup.ps1

# Mettre à jour
.\update.ps1
```

## 🔧 Dépannage Rapide

### Problème: "Cannot find module"
```powershell
npm install
cd backend && npm install
```

### Problème: "Port already in use"
```powershell
# Arrêter les services
.\dev.ps1 stop

# Ou tuer le processus
netstat -ano | findstr :5080
taskkill /PID <PID> /F
```

### Problème: "Docker not running"
1. Démarrez Docker Desktop
2. Attendez que l'icône soit verte
3. Réessayez

### Problème: "Cannot connect to database"
```powershell
# Redémarrer PostgreSQL
docker-compose restart postgres

# Vérifier le statut
docker-compose ps
```

## 📚 Prochaines Étapes

1. **Explorez les Modules:**
   - Tableau de bord (tests)
   - Analyses (tendances)
   - Dataset Manager (bibliothèque)
   - OWASP COMPASS (31 scénarios)

2. **Configurez Votre Système:**
   - Créez un profil de menaces
   - Ajoutez des cas d'usage
   - Configurez des politiques AI

3. **Lisez la Documentation:**
   - [README.md](./README.md) - Guide complet
   - [CLAUDE.md](./CLAUDE.md) - Architecture
   - [SCRIPTS_README.md](./SCRIPTS_README.md) - Scripts PowerShell
   - [INSTALLATION.md](./INSTALLATION.md) - Installation détaillée

## 💡 Raccourcis Utiles

### Démarrage Rapide
```powershell
# Ouvrir toutes les URLs
.\dev.ps1 urls

# Ouvrir Prisma Studio (GUI DB)
.\dev.ps1 studio

# Shell dans un conteneur
.\dev.ps1 shell
```

### Workflow de Développement
```powershell
# Terminal 1: Services
.\dev.ps1 start

# Terminal 2: Logs
.\dev.ps1 logs

# Terminal 3: Tests
.\dev.ps1 test
```

## 🎓 Tutoriel Vidéo

> ℹ️ Tutoriel vidéo à venir

## ❓ Besoin d'Aide?

- **Documentation complète:** [README.md](./README.md)
- **Scripts PowerShell:** [SCRIPTS_README.md](./SCRIPTS_README.md)
- **Installation:** [INSTALLATION.md](./INSTALLATION.md)
- **Dépannage:** Voir section ci-dessus

## ✨ C'est Parti!

Vous êtes maintenant prêt à utiliser AI RISK MANAGER. Bon test! 🚀

---

**Astuce:** Utilisez `.\dev.ps1` pour accéder à un menu interactif avec toutes les commandes disponibles.
