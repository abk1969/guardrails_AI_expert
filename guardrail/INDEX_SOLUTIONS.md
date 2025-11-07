# 🎯 Index des Solutions de Test de Sécurité AI

## 📚 Vue d'Ensemble

Ce répertoire contient **3 solutions complémentaires** pour tester la sécurité des applications AI :

| Solution | Type | Statut | Documentation |
|----------|------|--------|---------------|
| **Promptfoo** | Benchmarking LLM | ✅ Installé | [📁 solution_promptfoo/](solution_promptfoo/) |
| **GARAK** | Red Teaming LLM | ✅ Installé | [📁 solution_garak/](solution_garak/) |
| **Strix** | Pentesting Applicatif | ⬜ À installer | [📁 solution_strix/](solution_strix/) |

---

## 🗺️ Navigation Rapide

### 📖 Documentation Générale

- **[COMPARAISON_3_SOLUTIONS.md](COMPARAISON_3_SOLUTIONS.md)** - Comparaison détaillée des 3 solutions
- **[INDEX_SOLUTIONS.md](INDEX_SOLUTIONS.md)** - Ce fichier (navigation)

### 🔧 Solution 1: Promptfoo

**Répertoire:** `solution_promptfoo/`

| Fichier | Description |
|---------|-------------|
| **README.md** | Vue d'ensemble et quick start |
| **promptfooconfig.yaml** | Configuration principale |
| **prompts.txt** | Prompts de test |
| **providers.yaml** | Configuration des providers LLM |

**Commandes rapides:**
```bash
cd solution_promptfoo
npx promptfoo@latest eval
npx promptfoo@latest view
```

### 🛡️ Solution 2: GARAK

**Répertoire:** `solution_garak/`

| Fichier | Description |
|---------|-------------|
| **README.md** | Point d'entrée principal |
| **INDEX.md** | Guide de navigation |
| **RESUME_INSTALLATION.md** | Résumé de l'installation |
| **README_GARAK.md** | Guide d'utilisation complet |
| **INTEGRATION_GUIDE.md** | Guide d'intégration |
| **SUMMARY.md** | Résumé technique |
| **TEST_EBIOS_APP.md** | Guide de test pour EBIOS |
| **QUICK_TEST_EBIOS.md** | Test rapide EBIOS |
| **test_ebios_app.sh** | Script de test automatisé |
| **test_ebios_direct.py** | Test manuel guidé |
| **custom_generator_ebios.py** | Générateur personnalisé |
| **.env.example** | Template de configuration |

**Commandes rapides:**
```bash
cd solution_garak
./test_ebios_app.sh  # Test automatisé
uv run python test_ebios_direct.py  # Test guidé
```

### 🦉 Solution 3: Strix

**Répertoire:** `solution_strix/`

| Fichier | Description |
|---------|-------------|
| **ANALYSE_STRIX.md** | Analyse complète de Strix |
| **INSTALLATION_STRIX.md** | Guide d'installation |
| **strix/** | Code source Strix (clone GitHub) |

**Commandes rapides:**
```bash
# Installation
pipx install strix-agent

# Test
strix --target https://your-app.com
```

---

## 🚀 Quick Start par Cas d'Usage

### Cas 1: Tester un LLM (Qualité)

**Solution:** Promptfoo

```bash
cd solution_promptfoo
npx promptfoo@latest eval
npx promptfoo@latest view
```

**Temps:** 5-10 minutes  
**Coût:** $0.10 - $1

### Cas 2: Tester les Guardrails LLM

**Solution:** GARAK

```bash
cd solution_garak
./test_ebios_app.sh
# Choisir option 1 (Test Rapide)
```

**Temps:** 15-30 minutes  
**Coût:** $1 - $5

### Cas 3: Pentest d'Application Web

**Solution:** Strix

```bash
strix --target https://your-app.com \
      --instruction "Full security assessment"
```

**Temps:** 30-60 minutes  
**Coût:** $5 - $20

### Cas 4: Test Complet (LLM + Application)

**Solutions:** GARAK + Strix + Promptfoo

```bash
# 1. Pentest applicatif
strix --target https://your-app.com

# 2. Red teaming LLM
cd solution_garak
./test_ebios_app.sh

# 3. Benchmarking LLM
cd ../solution_promptfoo
npx promptfoo@latest eval
```

**Temps:** 1-2 heures  
**Coût:** $6 - $26

---

## 📊 Matrice de Décision Rapide

| Besoin | Solution | Commande |
|--------|----------|----------|
| Tester qualité LLM | Promptfoo | `cd solution_promptfoo && npx promptfoo eval` |
| Tester guardrails | GARAK | `cd solution_garak && ./test_ebios_app.sh` |
| Trouver injections prompts | GARAK | `uv run python -m garak --probes promptinject` |
| Tester authentification | Strix | `strix --target URL --instruction "Test auth"` |
| Trouver SQL injection | Strix | `strix --target URL` |
| Comparer modèles | Promptfoo | `npx promptfoo eval -c config.yaml` |
| Pentest complet | Strix | `strix --target URL` |

---

## 🎯 Workflows Recommandés

### Workflow 1: Développement Quotidien

```bash
# CI/CD: Tests de régression LLM
cd solution_promptfoo
npx promptfoo@latest eval
```

**Fréquence:** À chaque commit  
**Durée:** 5 minutes

### Workflow 2: Release Hebdomadaire

```bash
# Red teaming LLM
cd solution_garak
./test_ebios_app.sh  # Option 2 (Test Standard)
```

**Fréquence:** Hebdomadaire  
**Durée:** 15 minutes

### Workflow 3: Release Majeure

```bash
# Pentest complet
strix --target https://your-app.com \
      --instruction "Full security assessment"
```

**Fréquence:** Avant chaque release majeure  
**Durée:** 30-60 minutes

### Workflow 4: Audit de Sécurité

```bash
# Test complet avec les 3 solutions
./run_full_security_audit.sh
```

**Fréquence:** Trimestriel  
**Durée:** 1-2 heures

---

## 📁 Structure des Répertoires

```
guardrail/
├── INDEX_SOLUTIONS.md                    # Ce fichier
├── COMPARAISON_3_SOLUTIONS.md            # Comparaison détaillée
│
├── solution_promptfoo/                   # Solution 1: Benchmarking LLM
│   ├── README.md
│   ├── promptfooconfig.yaml
│   ├── prompts.txt
│   └── providers.yaml
│
├── solution_garak/                       # Solution 2: Red Teaming LLM
│   ├── README.md
│   ├── INDEX.md
│   ├── RESUME_INSTALLATION.md
│   ├── README_GARAK.md
│   ├── INTEGRATION_GUIDE.md
│   ├── SUMMARY.md
│   ├── TEST_EBIOS_APP.md
│   ├── QUICK_TEST_EBIOS.md
│   ├── test_ebios_app.sh
│   ├── test_ebios_direct.py
│   ├── custom_generator_ebios.py
│   ├── .env.example
│   ├── .venv/                            # Environnement virtuel
│   └── examples/
│       ├── test_openai.sh
│       └── analyze_results.py
│
└── solution_strix/                       # Solution 3: Pentesting Applicatif
    ├── ANALYSE_STRIX.md
    ├── INSTALLATION_STRIX.md
    └── strix/                            # Clone GitHub
        ├── README.md
        ├── pyproject.toml
        └── strix/
            ├── agents/
            ├── tools/
            └── prompts/
```

---

## 🔧 Configuration Requise

### Promptfoo

- ✅ Node.js 18+
- ✅ npm ou npx
- ✅ Clé API LLM (OpenAI, Anthropic, etc.)

### GARAK

- ✅ Python 3.10+
- ✅ uv (package manager)
- ✅ Clés API LLM (OpenAI, Groq, HF, etc.)
- ✅ Environnement virtuel `.venv`

### Strix

- ✅ Python 3.12+
- ✅ Docker (running)
- ✅ pipx
- ✅ Clé API LLM (OpenAI, Anthropic, Groq, ou local)

---

## 📚 Documentation par Solution

### Promptfoo

1. **README.md** - Vue d'ensemble
2. **promptfooconfig.yaml** - Configuration
3. Documentation officielle: https://promptfoo.dev

### GARAK

1. **INDEX.md** - Navigation
2. **README.md** - Point d'entrée
3. **RESUME_INSTALLATION.md** - Installation
4. **README_GARAK.md** - Utilisation
5. **INTEGRATION_GUIDE.md** - Intégration
6. **TEST_EBIOS_APP.md** - Test EBIOS
7. **QUICK_TEST_EBIOS.md** - Quick start
8. Documentation officielle: https://garak.readthedocs.io

### Strix

1. **ANALYSE_STRIX.md** - Analyse complète
2. **INSTALLATION_STRIX.md** - Installation
3. **strix/README.md** - Documentation officielle
4. Site web: https://usestrix.com

---

## 🎓 Parcours d'Apprentissage

### Débutant (1 heure)

1. Lire **COMPARAISON_3_SOLUTIONS.md**
2. Tester **Promptfoo** (quick start)
3. Lire **solution_garak/QUICK_TEST_EBIOS.md**

### Intermédiaire (1 journée)

1. Configurer **GARAK** avec générateur personnalisé
2. Exécuter tests complets avec GARAK
3. Installer **Strix** et faire premier test

### Avancé (1 semaine)

1. Intégrer les 3 solutions en CI/CD
2. Créer workflows personnalisés
3. Automatiser les rapports consolidés

---

## 🚨 Troubleshooting

### Promptfoo

**Problème:** `npx: command not found`
```bash
# Installer Node.js
# https://nodejs.org/
```

### GARAK

**Problème:** `uv: command not found`
```bash
# Installer uv
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Problème:** `python -m garak: No module named garak`
```bash
cd solution_garak
uv run python -m garak --version
```

### Strix

**Problème:** `Docker not running`
```bash
# Démarrer Docker Desktop (Windows/Mac)
# Ou: sudo systemctl start docker (Linux)
```

**Problème:** `Python version too old`
```bash
# Installer Python 3.12+
# https://www.python.org/downloads/
```

---

## ✅ Checklist Complète

### Installation

- [ ] Promptfoo installé et testé
- [ ] GARAK installé avec uv
- [ ] Strix installé avec pipx
- [ ] Toutes les clés API configurées
- [ ] Docker en cours d'exécution (pour Strix)

### Configuration

- [ ] `promptfooconfig.yaml` créé
- [ ] `.env` créé pour GARAK
- [ ] Variables d'environnement Strix définies
- [ ] Générateur personnalisé GARAK adapté

### Tests

- [ ] Premier test Promptfoo réussi
- [ ] Premier test GARAK réussi
- [ ] Premier test Strix réussi
- [ ] Rapports générés et consultés

### Intégration

- [ ] CI/CD workflows créés
- [ ] Documentation équipe rédigée
- [ ] Processus de remediation défini

---

## 🎉 Prochaines Étapes

### Immédiat (Aujourd'hui)

1. ✅ Lire **COMPARAISON_3_SOLUTIONS.md**
2. ✅ Tester **Promptfoo** (5 min)
3. ✅ Tester **GARAK** avec `./test_ebios_app.sh` (15 min)

### Court Terme (Cette Semaine)

4. ⬜ Installer **Strix**
5. ⬜ Tester Strix sur application EBIOS
6. ⬜ Créer workflow CI/CD

### Moyen Terme (Ce Mois)

7. ⬜ Intégrer les 3 solutions
8. ⬜ Automatiser les rapports
9. ⬜ Former l'équipe

---

**Vous avez maintenant une stack complète de sécurité AI ! 🚀**

**Questions ?** Consultez la documentation de chaque solution ou le fichier **COMPARAISON_3_SOLUTIONS.md**.

