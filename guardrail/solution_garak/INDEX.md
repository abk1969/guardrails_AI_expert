# 📚 GARAK - Index de la Documentation

## 🎯 Démarrage Rapide (5 minutes)

**Vous êtes pressé ? Commencez ici :**

1. **Tester GARAK immédiatement** (sans API key) :
   ```bash
   cd guardrail/solution_garak
   ./quick_start.sh demo
   ```

2. **Voir les résultats** :
   - Ouvrir `~/.local/share/garak/garak_runs/demo_test.report.html` dans votre navigateur

3. **Lire le résumé** :
   - Ouvrir `RESUME_INSTALLATION.md` pour comprendre ce qui a été installé

---

## 📖 Guide de Navigation de la Documentation

### Pour Commencer

| Fichier | Description | Temps de Lecture | Quand le Lire |
|---------|-------------|------------------|---------------|
| **RESUME_INSTALLATION.md** | Résumé de l'installation | 5 min | **COMMENCEZ ICI** |
| **README_GARAK.md** | Guide d'utilisation complet | 15 min | Après le premier test |
| **quick_start.sh** | Script de démarrage | - | Pour tester rapidement |

### Pour Intégrer

| Fichier | Description | Temps de Lecture | Quand le Lire |
|---------|-------------|------------------|---------------|
| **INTEGRATION_GUIDE.md** | Guide d'intégration détaillé | 20 min | Avant de coder l'intégration |
| **SUMMARY.md** | Résumé technique | 10 min | Pour comprendre les composants |
| **.env.example** | Configuration des API keys | 2 min | Avant de tester avec des API réelles |

### Pour Approfondir

| Fichier | Description | Temps de Lecture | Quand le Lire |
|---------|-------------|------------------|---------------|
| **examples/test_openai.sh** | Exemples de tests OpenAI | 5 min | Pour créer vos propres tests |
| **examples/analyze_results.py** | Analyseur de résultats | 5 min | Pour analyser les rapports |
| **garak/README.md** | Documentation officielle GARAK | 30 min | Pour une compréhension approfondie |

---

## 🗂️ Structure de la Documentation

```
guardrail/solution_garak/
│
├── 📄 INDEX.md                         ← VOUS ÊTES ICI
│   └── Guide de navigation de toute la documentation
│
├── 🚀 RESUME_INSTALLATION.md           ← COMMENCEZ ICI
│   ├── Résumé de l'installation
│   ├── Ce qui a été fait
│   ├── Comment utiliser GARAK
│   └── Prochaines étapes
│
├── 📖 README_GARAK.md                  ← Guide Principal
│   ├── Installation
│   ├── Premiers pas
│   ├── Commandes essentielles
│   ├── Exemples d'utilisation
│   ├── Intégration avec AI Risk Manager
│   └── Référence rapide
│
├── 🔗 INTEGRATION_GUIDE.md             ← Pour Développeurs
│   ├── Vue d'ensemble
│   ├── Architecture proposée
│   ├── Option 1: Service Backend NestJS (code complet)
│   ├── Option 2: API REST Python (code complet)
│   ├── Option 3: Import direct
│   └── Mapping des concepts
│
├── 📊 SUMMARY.md                       ← Référence Technique
│   ├── État de l'installation
│   ├── Composants installés (détails)
│   ├── Configuration
│   └── Dépannage
│
├── ⚙️ .env.example                     ← Configuration
│   └── Template pour les API keys
│
├── 🎬 quick_start.sh                   ← Script Principal
│   ├── 7 modes de test
│   ├── Interface interactive
│   └── Gestion des erreurs
│
└── 📁 examples/                        ← Exemples de Code
    ├── test_openai.sh                  ← Tests OpenAI
    └── analyze_results.py              ← Analyseur de résultats
```

---

## 🎯 Parcours Recommandés

### Parcours 1 : Utilisateur Débutant (30 minutes)

**Objectif :** Comprendre et tester GARAK

1. ✅ Lire `RESUME_INSTALLATION.md` (5 min)
2. ✅ Exécuter `./quick_start.sh demo` (2 min)
3. ✅ Consulter le rapport HTML généré (5 min)
4. ✅ Lire `README_GARAK.md` sections "Premiers Pas" et "Commandes Essentielles" (10 min)
5. ✅ Lister les probes : `./quick_start.sh list-probes` (2 min)
6. ✅ Lister les générateurs : `./quick_start.sh list-gens` (2 min)
7. ✅ Configurer `.env` avec vos API keys (4 min)

**Résultat :** Vous savez utiliser GARAK en ligne de commande

---

### Parcours 2 : Développeur Backend (1 heure)

**Objectif :** Intégrer GARAK dans AI Risk Manager

1. ✅ Lire `RESUME_INSTALLATION.md` (5 min)
2. ✅ Lire `INTEGRATION_GUIDE.md` (20 min)
3. ✅ Choisir une option d'intégration (5 min)
4. ✅ Étudier le code d'exemple correspondant (15 min)
5. ✅ Tester GARAK avec `./quick_start.sh openai-basic` (5 min)
6. ✅ Analyser les résultats avec `analyze_results.py` (5 min)
7. ✅ Planifier l'implémentation (5 min)

**Résultat :** Vous avez un plan d'intégration clair

---

### Parcours 3 : Architecte Système (45 minutes)

**Objectif :** Comprendre l'architecture et les composants

1. ✅ Lire `SUMMARY.md` (10 min)
2. ✅ Lire `INTEGRATION_GUIDE.md` section "Architecture" (10 min)
3. ✅ Consulter `README_GARAK.md` section "Référence Rapide" (10 min)
4. ✅ Examiner les probes disponibles : `./quick_start.sh list-probes` (5 min)
5. ✅ Lire la documentation officielle `garak/README.md` (10 min)

**Résultat :** Vous comprenez l'architecture complète

---

### Parcours 4 : Testeur de Sécurité (2 heures)

**Objectif :** Maîtriser les tests de vulnérabilités LLM

1. ✅ Lire `README_GARAK.md` (15 min)
2. ✅ Configurer `.env` avec vos API keys (5 min)
3. ✅ Tester chaque famille de probes :
   - Injection : `--probes encoding promptinject` (10 min)
   - Jailbreak : `--probes dan` (10 min)
   - Malware : `--probes malwaregen` (10 min)
   - Toxicité : `--probes realtoxicityprompts` (10 min)
   - Fuite : `--probes leakreplay` (10 min)
4. ✅ Analyser les résultats avec `analyze_results.py` (15 min)
5. ✅ Créer vos propres scripts de test (30 min)
6. ✅ Documenter vos découvertes (15 min)

**Résultat :** Vous maîtrisez le red teaming LLM avec GARAK

---

## 🔍 Recherche Rapide

### Je veux...

| Objectif | Fichier | Section |
|----------|---------|---------|
| **Tester GARAK maintenant** | `quick_start.sh` | Exécuter `./quick_start.sh demo` |
| **Comprendre ce qui a été installé** | `RESUME_INSTALLATION.md` | "Ce qui a été fait" |
| **Voir toutes les commandes** | `README_GARAK.md` | "Commandes Essentielles" |
| **Intégrer dans le backend** | `INTEGRATION_GUIDE.md` | "Option 1: Service Backend NestJS" |
| **Créer une API Python** | `INTEGRATION_GUIDE.md` | "Option 2: API REST Python" |
| **Lister les probes** | Terminal | `./quick_start.sh list-probes` |
| **Configurer les API keys** | `.env.example` | Copier vers `.env` |
| **Analyser des résultats** | `examples/analyze_results.py` | Exécuter le script |
| **Créer mes propres tests** | `examples/test_openai.sh` | Adapter le script |
| **Comprendre l'architecture** | `INTEGRATION_GUIDE.md` | "Architecture Proposée" |
| **Voir les composants disponibles** | `SUMMARY.md` | "Composants Installés" |
| **Résoudre un problème** | `SUMMARY.md` | "Dépannage" |

---

## 📊 Statistiques de la Documentation

| Métrique | Valeur |
|----------|--------|
| **Fichiers de documentation** | 7 |
| **Lignes de documentation** | ~1500 |
| **Exemples de code** | 15+ |
| **Scripts exécutables** | 3 |
| **Temps de lecture total** | ~2 heures |
| **Temps pour démarrer** | 5 minutes |

---

## 🎓 Ressources Externes

### Documentation Officielle

- **Site Web** : https://garak.ai
- **Documentation** : https://garak.readthedocs.io
- **GitHub** : https://github.com/NVIDIA/garak
- **Paper** : https://arxiv.org/abs/2406.11036

### Communauté

- **Discord** : https://discord.gg/uVch4puUCs
- **Issues GitHub** : https://github.com/NVIDIA/garak/issues
- **Discussions** : https://github.com/NVIDIA/garak/discussions

### Ressources Complémentaires

- **OWASP LLM Top 10** : https://owasp.org/www-project-top-10-for-large-language-model-applications/
- **AVID (AI Vulnerability Database)** : https://avidml.org/
- **MITRE ATLAS** : https://atlas.mitre.org/

---

## ✅ Checklist de Démarrage

Cochez au fur et à mesure :

- [ ] J'ai lu `RESUME_INSTALLATION.md`
- [ ] J'ai exécuté `./quick_start.sh demo`
- [ ] J'ai consulté le rapport HTML généré
- [ ] J'ai listé les probes disponibles
- [ ] J'ai listé les générateurs disponibles
- [ ] J'ai copié `.env.example` vers `.env`
- [ ] J'ai configuré au moins une API key
- [ ] J'ai exécuté un test avec une API réelle
- [ ] J'ai analysé les résultats avec `analyze_results.py`
- [ ] J'ai lu le guide d'intégration
- [ ] J'ai choisi une option d'intégration
- [ ] J'ai planifié l'implémentation

---

## 🎯 Prochaine Action

**Si vous n'avez rien fait encore :**
```bash
cd guardrail/solution_garak
./quick_start.sh demo
```

**Si vous avez déjà testé :**
- Lire `INTEGRATION_GUIDE.md` pour planifier l'intégration

**Si vous êtes prêt à intégrer :**
- Choisir entre Option 1 (NestJS) ou Option 2 (FastAPI)
- Suivre le code d'exemple dans `INTEGRATION_GUIDE.md`

---

## 📞 Support

**Problème avec GARAK ?**
1. Consulter `SUMMARY.md` section "Dépannage"
2. Lire la FAQ officielle : `garak/FAQ.md`
3. Chercher dans les issues GitHub
4. Poser une question sur Discord

**Problème avec l'intégration ?**
1. Relire `INTEGRATION_GUIDE.md`
2. Vérifier les logs de GARAK : `~/.local/share/garak/garak.log`
3. Tester GARAK en ligne de commande d'abord

---

**Dernière mise à jour :** 2025-11-04  
**Version GARAK :** 0.13.1  
**Statut de la documentation :** ✅ Complète

