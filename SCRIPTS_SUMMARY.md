# 📦 Résumé des Scripts PowerShell - AI RISK MANAGER

## 🎯 Vue d'Ensemble

Suite complète de 6 scripts PowerShell pour gérer l'installation, la maintenance et le développement du projet.

```
📂 guardrails_AI_expert/
├── 🚀 install.ps1          - Installation initiale
├── 🗑️  uninstall.ps1        - Nettoyage
├── 🔄 update.ps1           - Mise à jour
├── 💾 backup.ps1           - Sauvegarde/Restauration
├── 🔧 migrate.ps1          - Migrations DB
└── 🛠️  dev.ps1              - Utilitaire de dev
```

## ⚡ Démarrage Ultra-Rapide

```powershell
# Installation complète en 2 commandes
.\install.ps1 -Mode docker
.\dev.ps1 start
```

✅ **Temps total: 5-10 minutes**

## 📊 Tableau de Référence

| Besoin | Script | Commande |
|--------|--------|----------|
| **Première installation** | install.ps1 | `.\install.ps1 -Mode docker` |
| **Démarrer dev** | dev.ps1 | `.\dev.ps1 start` |
| **Voir logs** | dev.ps1 | `.\dev.ps1 logs` |
| **Exécuter tests** | dev.ps1 | `.\dev.ps1 test` |
| **Créer backup** | backup.ps1 | `.\backup.ps1` |
| **Mettre à jour** | update.ps1 | `.\update.ps1` |
| **Migration DB** | migrate.ps1 | `.\migrate.ps1` |
| **Nettoyer** | uninstall.ps1 | `.\uninstall.ps1` |

## 🎬 Scénarios d'Usage

### Scénario 1: Premier Jour
```powershell
# Jour 1 - Installation
.\install.ps1 -Mode docker

# Éditer .env avec votre clé API Gemini
notepad .env

# Démarrer
.\dev.ps1 start

# Ouvrir URLs
.\dev.ps1 urls
```

### Scénario 2: Développement Quotidien
```powershell
# Matin - Démarrer
.\dev.ps1 start

# Pendant le dev - Voir logs
.\dev.ps1 logs

# Après modifications - Tester
.\dev.ps1 test

# Soir - Arrêter
.\dev.ps1 stop
```

### Scénario 3: Avant Mise à Jour
```powershell
# 1. Backup
.\backup.ps1 -Type full

# 2. Update
.\update.ps1

# 3. Tester
.\dev.ps1 test

# 4. Si problème, restaurer
.\backup.ps1 -Restore backups/backup_XXXXXXXX_XXXXXX
```

### Scénario 4: Gestion de la Base de Données
```powershell
# Voir statut migrations
.\migrate.ps1 -Action status

# Créer migration
.\migrate.ps1 -Action create -Name "add_new_feature"

# Appliquer
.\migrate.ps1 -Action apply

# Interface graphique
.\migrate.ps1 -Action studio
```

### Scénario 5: Problème et Récupération
```powershell
# 1. Diagnostiquer
.\dev.ps1 status
.\dev.ps1 logs

# 2. Si corruption
.\backup.ps1 -Restore backups/backup_XXXXXXXX_XXXXXX

# 3. Si vraiment cassé
.\uninstall.ps1 -CleanAll
.\install.ps1 -Mode docker
```

## 📈 Fonctionnalités Clés

### install.ps1
- ✅ 3 modes: standalone, fullstack, docker
- ✅ Vérification automatique des prérequis
- ✅ Configuration .env automatique
- ✅ Initialisation Prisma
- ✅ Démarrage optionnel

### dev.ps1
- ✅ Menu interactif
- ✅ Gestion multi-services
- ✅ Logs en temps réel
- ✅ Tests automatisés
- ✅ Build production
- ✅ Shell Docker

### backup.ps1
- ✅ 4 types de backup
- ✅ Manifeste avec checksums SHA256
- ✅ Restauration guidée
- ✅ Liste des backups
- ✅ Export PostgreSQL + Redis

### update.ps1
- ✅ Backup automatique avant MAJ
- ✅ Affichage des packages obsolètes
- ✅ Audit de sécurité
- ✅ Rollback automatique si échec
- ✅ MAJ par composant

### migrate.ps1
- ✅ Wrapper Prisma convivial
- ✅ Backup auto avant migration
- ✅ Confirmation pour actions destructives
- ✅ Prisma Studio intégré
- ✅ Génération seed

### uninstall.ps1
- ✅ Nettoyage sélectif
- ✅ Suppression Docker
- ✅ Conservation .env optionnelle
- ✅ Confirmations de sécurité

## 🔐 Sécurité Intégrée

Tous les scripts incluent:
- 🛡️ Validation des entrées
- 🛡️ Confirmations pour actions destructives
- 🛡️ Backups automatiques
- 🛡️ Gestion d'erreurs robuste
- 🛡️ Rollback automatique
- 🛡️ Messages clairs et colorés

## 📚 Documentation Complète

| Document | Description |
|----------|-------------|
| **QUICK_START.md** | Démarrage en 5 minutes |
| **INSTALLATION.md** | Installation détaillée + dépannage |
| **SCRIPTS_README.md** | Documentation complète de chaque script |
| **CLAUDE.md** | Architecture et développement |
| **README.md** | Guide utilisateur complet |

## 💡 Trucs et Astuces

### Alias PowerShell
Ajoutez à votre `$PROFILE`:
```powershell
function dev { .\dev.ps1 @args }
function backup { .\backup.ps1 @args }
function update { .\update.ps1 @args }
```

Usage:
```powershell
dev start
backup -Type full
update
```

### Démarrage Automatique
Créez `START.bat`:
```batch
@echo off
powershell -ExecutionPolicy Bypass -File dev.ps1 -Task start
```

Double-cliquez pour démarrer!

### Multi-Terminal
```powershell
# Terminal 1
.\dev.ps1 start

# Terminal 2
.\dev.ps1 logs

# Terminal 3
.\migrate.ps1 -Action studio
```

## 🎓 Bonnes Pratiques

### ✅ À Faire
- Créer un backup avant toute modification importante
- Lire les messages avant de confirmer
- Tester en dev avant prod
- Utiliser le mode interactif au début
- Consulter la documentation

### ❌ À Éviter
- Confirmer sans lire
- Modifier .env en production sans backup
- Reset DB sans backup
- Ignorer les avertissements
- Forcer les actions (-Force) sans raison

## 📊 Statistiques

- **Total de scripts:** 6
- **Lignes de code:** ~3000+
- **Fonctionnalités:** 50+
- **Modes d'installation:** 3
- **Types de backup:** 4
- **Tâches dev:** 13

## 🚀 Prochaines Étapes

1. **Maintenant:**
   ```powershell
   .\install.ps1 -Mode docker
   ```

2. **Ensuite:**
   - Lisez [QUICK_START.md](./QUICK_START.md)
   - Explorez l'application
   - Créez votre premier test

3. **Plus tard:**
   - [SCRIPTS_README.md](./SCRIPTS_README.md) pour maîtriser les scripts
   - [CLAUDE.md](./CLAUDE.md) pour l'architecture
   - [INSTALLATION.md](./INSTALLATION.md) pour le dépannage

## ❓ Questions Fréquentes

**Q: Quel mode choisir pour débuter?**
A: `.\install.ps1 -Mode docker` - Le plus complet et simple

**Q: Comment mettre à jour?**
A: `.\update.ps1` - Avec backup automatique

**Q: Comment sauvegarder?**
A: `.\backup.ps1` - Backup complet avec un clic

**Q: Comment voir les logs?**
A: `.\dev.ps1 logs` - Temps réel, tous services

**Q: Erreur "cannot be loaded"?**
A: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

**Q: Port déjà utilisé?**
A: `.\dev.ps1 stop` puis redémarrer

**Q: Docker ne démarre pas?**
A: Démarrez Docker Desktop et attendez l'icône verte

**Q: Base de données corrompue?**
A: `.\backup.ps1 -Restore backups/backup_XXXXXXXX_XXXXXX`

**Q: Réinitialiser complètement?**
A:
```powershell
.\uninstall.ps1 -CleanAll
.\install.ps1 -Mode docker
```

**Q: Aide sur un script?**
A: `Get-Help .\script.ps1 -Full`

## 🎯 Objectif Atteint

Vous disposez maintenant d'une suite d'outils professionnelle pour:
- ✅ Installer en quelques minutes
- ✅ Développer efficacement
- ✅ Gérer les mises à jour en sécurité
- ✅ Sauvegarder et restaurer facilement
- ✅ Gérer les migrations sans stress
- ✅ Déboguer rapidement

**Bon développement! 🚀**

---

**Version:** 1.0.0
**Date:** 2025-10-31
**Auteur:** Claude Code
**Licence:** Voir LICENSE du projet
