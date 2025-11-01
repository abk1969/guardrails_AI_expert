# 📑 Index des Scripts et Documentation

## 🎯 Navigation Rapide

**Nouveau sur le projet?** → [QUICK_START.md](./QUICK_START.md)

**Besoin d'aide?** → [SCRIPTS_README.md](./SCRIPTS_README.md)

**Problème d'installation?** → [INSTALLATION.md](./INSTALLATION.md)

---

## 📂 Structure Complète

```
guardrails_AI_expert/
│
├── 🚀 SCRIPTS POWERSHELL (6 fichiers)
│   ├── install.ps1              # Installation initiale
│   ├── uninstall.ps1            # Nettoyage
│   ├── dev.ps1                  # Développement
│   ├── backup.ps1               # Sauvegarde/Restauration
│   ├── update.ps1               # Mise à jour
│   └── migrate.ps1              # Migrations DB
│
├── 📚 GUIDES UTILISATEUR
│   ├── QUICK_START.md           # ⚡ Démarrage en 5 minutes
│   ├── SCRIPTS_SUMMARY.md       # 📊 Vue d'ensemble scripts
│   └── SCRIPTS_INSTALLATION_COMPLETE.md  # ✅ Résumé complet
│
├── 📖 DOCUMENTATION TECHNIQUE
│   ├── INSTALLATION.md          # 🔧 Installation détaillée
│   ├── SCRIPTS_README.md        # 📘 Référence complète
│   ├── CLAUDE.md                # 🏗️ Architecture
│   └── README.md                # 📄 Guide principal
│
├── ✅ RESSOURCES
│   ├── .github/INSTALLATION_CHECKLIST.md  # Checklist validation
│   └── INDEX_SCRIPTS.md         # 📑 Ce fichier
│
└── 🔧 CONFIGURATION
    ├── .env.example             # Template configuration
    ├── docker-compose.yml       # Configuration Docker
    └── package.json             # Dépendances npm
```

---

## 🎯 Par Objectif

### Je veux installer le projet
1. [QUICK_START.md](./QUICK_START.md) - Démarrage rapide
2. [INSTALLATION.md](./INSTALLATION.md) - Installation détaillée
3. [.github/INSTALLATION_CHECKLIST.md](./.github/INSTALLATION_CHECKLIST.md) - Validation

### Je veux comprendre les scripts
1. [SCRIPTS_SUMMARY.md](./SCRIPTS_SUMMARY.md) - Vue d'ensemble
2. [SCRIPTS_README.md](./SCRIPTS_README.md) - Documentation complète
3. [SCRIPTS_INSTALLATION_COMPLETE.md](./SCRIPTS_INSTALLATION_COMPLETE.md) - Résumé détaillé

### Je veux développer
1. `dev.ps1` - Commandes de développement
2. [CLAUDE.md](./CLAUDE.md) - Architecture du projet
3. [README.md](./README.md) - Guide utilisateur

### Je veux maintenir
1. `backup.ps1` - Sauvegardes
2. `update.ps1` - Mises à jour
3. `migrate.ps1` - Migrations DB

### J'ai un problème
1. [INSTALLATION.md](./INSTALLATION.md) - Section Dépannage
2. [SCRIPTS_README.md](./SCRIPTS_README.md) - Documentation des scripts
3. `.\dev.ps1 status` - Diagnostic rapide

---

## 📋 Par Type de Fichier

### Scripts PowerShell (.ps1)
| Script | Taille | Fonctions | Usage |
|--------|--------|-----------|-------|
| **install.ps1** | 19KB | 15+ | `.\install.ps1 -Mode docker` |
| **dev.ps1** | 18KB | 20+ | `.\dev.ps1 start` |
| **backup.ps1** | 17KB | 12+ | `.\backup.ps1 -Type full` |
| **migrate.ps1** | 15KB | 10+ | `.\migrate.ps1 -Action status` |
| **update.ps1** | 9KB | 8+ | `.\update.ps1` |
| **uninstall.ps1** | 4KB | 5+ | `.\uninstall.ps1` |

### Documentation Markdown (.md)
| Document | Pages | Cible | Temps Lecture |
|----------|-------|-------|---------------|
| **SCRIPTS_README.md** | 40+ | Référence | 30-60 min |
| **INSTALLATION.md** | 15+ | Installation | 15-30 min |
| **SCRIPTS_SUMMARY.md** | 12+ | Vue rapide | 10-15 min |
| **QUICK_START.md** | 5+ | Débutants | 5-10 min |
| **SCRIPTS_INSTALLATION_COMPLETE.md** | 10+ | Résumé | 10-15 min |
| **INSTALLATION_CHECKLIST.md** | 8+ | Validation | 15-30 min |

---

## 🔗 Liens Rapides par Commande

### Installation
```powershell
.\install.ps1 -Mode docker
```
→ [install.ps1](./install.ps1) | [Doc](./SCRIPTS_README.md#install-ps1)

### Démarrage
```powershell
.\dev.ps1 start
```
→ [dev.ps1](./dev.ps1) | [Doc](./SCRIPTS_README.md#dev-ps1)

### Logs
```powershell
.\dev.ps1 logs
```
→ [dev.ps1](./dev.ps1) | [Doc](./SCRIPTS_README.md#dev-ps1)

### Backup
```powershell
.\backup.ps1 -Type full
```
→ [backup.ps1](./backup.ps1) | [Doc](./SCRIPTS_README.md#backup-ps1)

### Mise à jour
```powershell
.\update.ps1
```
→ [update.ps1](./update.ps1) | [Doc](./SCRIPTS_README.md#update-ps1)

### Migration
```powershell
.\migrate.ps1 -Action status
```
→ [migrate.ps1](./migrate.ps1) | [Doc](./SCRIPTS_README.md#migrate-ps1)

### Nettoyage
```powershell
.\uninstall.ps1
```
→ [uninstall.ps1](./uninstall.ps1) | [Doc](./SCRIPTS_README.md#uninstall-ps1)

---

## 🎓 Par Niveau d'Expérience

### Débutant
1. **Commencer ici:** [QUICK_START.md](./QUICK_START.md)
2. **Installation guidée:** `.\install.ps1` (mode interactif)
3. **Validation:** [INSTALLATION_CHECKLIST.md](./.github/INSTALLATION_CHECKLIST.md)
4. **Premiers pas:** `.\dev.ps1` (menu interactif)

### Intermédiaire
1. **Vue d'ensemble:** [SCRIPTS_SUMMARY.md](./SCRIPTS_SUMMARY.md)
2. **Workflows:** [SCRIPTS_README.md#workflows](./SCRIPTS_README.md)
3. **Commandes directes:** `.\dev.ps1 -Task <task>`
4. **Maintenance:** `.\backup.ps1`, `.\update.ps1`

### Avancé
1. **Architecture:** [CLAUDE.md](./CLAUDE.md)
2. **Référence complète:** [SCRIPTS_README.md](./SCRIPTS_README.md)
3. **Personnalisation:** Modifier les scripts
4. **CI/CD:** Intégration automatisée

---

## 🔍 Index Thématique

### Sécurité
- Backups automatiques → [backup.ps1](./backup.ps1)
- Confirmations actions critiques → Tous les scripts
- Vérification intégrité → [backup.ps1](./backup.ps1)
- Rollback automatique → [update.ps1](./update.ps1)

### Performance
- Mode Docker optimisé → [docker-compose.yml](./docker-compose.yml)
- Hot reload → [dev.ps1](./dev.ps1)
- Builds parallèles → [dev.ps1](./dev.ps1)
- Monitoring → Grafana/Prometheus

### Base de Données
- Migrations → [migrate.ps1](./migrate.ps1)
- Seeding → [migrate.ps1](./migrate.ps1)
- Backup DB → [backup.ps1](./backup.ps1)
- Prisma Studio → `.\migrate.ps1 -Action studio`

### Développement
- Démarrage rapide → [dev.ps1](./dev.ps1)
- Tests → [dev.ps1](./dev.ps1)
- Linting → [dev.ps1](./dev.ps1)
- Building → [dev.ps1](./dev.ps1)

---

## 📊 Statistiques

### Scripts PowerShell
- **Fichiers:** 6
- **Lignes de code:** ~3000+
- **Fonctions:** 80+
- **Taille totale:** ~82KB

### Documentation
- **Fichiers:** 7
- **Pages:** ~100+
- **Exemples:** 150+
- **Taille totale:** ~90KB

### Commandes
- **Scripts PowerShell:** 50+
- **npm scripts:** 20+
- **Docker commands:** 15+
- **Total:** 85+ commandes

---

## 🎯 Workflows Recommandés

### Premier Jour
```
QUICK_START.md → install.ps1 → INSTALLATION_CHECKLIST.md → dev.ps1
```

### Développement Quotidien
```
dev.ps1 start → Coder → dev.ps1 test → dev.ps1 logs
```

### Maintenance Hebdomadaire
```
backup.ps1 → update.ps1 → dev.ps1 test → migrate.ps1 status
```

### Avant Production
```
backup.ps1 full → migrate.ps1 apply → dev.ps1 build → dev.ps1 test
```

---

## 💡 Astuces de Navigation

### Recherche Rapide
```powershell
# Chercher dans la documentation
Select-String -Path *.md -Pattern "docker"

# Lister les scripts
Get-ChildItem *.ps1

# Voir l'aide d'un script
Get-Help .\install.ps1 -Full
```

### Favoris PowerShell
Ajoutez à `$PROFILE`:
```powershell
# Navigation rapide
Set-Alias dev "C:\...\dev.ps1"
Set-Alias backup "C:\...\backup.ps1"

# Fonctions personnalisées
function docs { Start-Process "SCRIPTS_README.md" }
function quick { Start-Process "QUICK_START.md" }
```

---

## 📞 Obtenir de l'Aide

### Documentation
1. [QUICK_START.md](./QUICK_START.md) - Questions rapides
2. [INSTALLATION.md](./INSTALLATION.md) - Problèmes d'installation
3. [SCRIPTS_README.md](./SCRIPTS_README.md) - Référence complète

### Commandes
```powershell
# Aide PowerShell
Get-Help .\script.ps1 -Full

# Menu interactif
.\dev.ps1

# Statut système
.\dev.ps1 status

# Logs en temps réel
.\dev.ps1 logs
```

### Dépannage
1. Consulter [INSTALLATION.md#dépannage](./INSTALLATION.md)
2. Vérifier [SCRIPTS_README.md#dépannage](./SCRIPTS_README.md)
3. Exécuter `.\dev.ps1 status`
4. Consulter les logs: `.\dev.ps1 logs`

---

## 🎉 Prêt à Commencer?

**Choisissez votre point d'entrée:**

- 🚀 **Démarrage rapide:** [QUICK_START.md](./QUICK_START.md)
- 📚 **Guide complet:** [SCRIPTS_README.md](./SCRIPTS_README.md)
- 🔧 **Installation détaillée:** [INSTALLATION.md](./INSTALLATION.md)
- 📊 **Vue d'ensemble:** [SCRIPTS_SUMMARY.md](./SCRIPTS_SUMMARY.md)

**Ou lancez directement:**
```powershell
.\install.ps1 -Mode docker
```

---

**Version:** 1.0.0
**Date:** 2025-10-31
**Navigation:** [Haut de page](#-navigation-rapide)
