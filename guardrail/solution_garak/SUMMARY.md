# 📦 GARAK - Installation et Configuration Complète

## ✅ État de l'Installation

**Version installée :** GARAK v0.13.1  
**Date d'installation :** 2025-11-04  
**Packages installés :** 162  
**Environnement :** Python 3.11.8 avec uv  

---

## 📁 Structure du Répertoire

```
guardrail/solution_garak/
├── .venv/                          # Environnement virtuel Python
├── examples/                       # Scripts d'exemple
│   ├── test_openai.sh             # Tests OpenAI
│   └── analyze_results.py         # Analyse des résultats
├── .env.example                    # Template de configuration
├── README_GARAK.md                 # Guide d'utilisation complet
├── INTEGRATION_GUIDE.md            # Guide d'intégration avec AI Risk Manager
├── SUMMARY.md                      # Ce fichier
└── quick_start.sh                  # Script de démarrage rapide
```

---

## 🚀 Démarrage Rapide

### 1. Test de Démonstration (sans API key)

```bash
cd guardrail/solution_garak
./quick_start.sh demo
```

### 2. Test avec OpenAI

```bash
# Configurer la clé API
export OPENAI_API_KEY="sk-..."

# Lancer le test
./quick_start.sh openai-basic
```

### 3. Lister les Composants

```bash
# Probes disponibles
./quick_start.sh list-probes

# Générateurs disponibles
./quick_start.sh list-gens
```

---

## 📊 Composants Installés

### Probes (30+ familles)

| Famille | Description | Nombre de Variantes |
|---------|-------------|---------------------|
| `ansiescape` | Échappement ANSI | 3 |
| `atkgen` | Génération d'attaques adaptatives | 1 |
| `av_spam_scanning` | Signatures malveillantes | 3 |
| `continuation` | Continuation de slurs | 2 |
| `dan` | Jailbreaks DAN | 15+ |
| `divergence` | Tests de divergence | 3 |
| `doctor` | Bypass de guardrails | 3 |
| `donotanswer` | Questions interdites | 5 |
| `encoding` | Injection par encodage | 15+ |
| `gcg` | Greedy Coordinate Gradient | 2 |
| `glitch` | Tokens glitch | 2 |
| `goodside` | Attaques Riley Goodside | 4 |
| `leakreplay` | Fuite de données d'entraînement | 10+ |
| `lmrc` | Language Model Risk Cards | 8 |
| `malwaregen` | Génération de malware | 4 |
| `misleading` | Fausses affirmations | 1 |
| `packagehallucination` | Packages inexistants | 1 |
| `promptinject` | Injection de prompts | 6 |
| `realtoxicityprompts` | Toxicité | 8 |
| `replay` | Replay de données | 1 |
| `snowball` | Hallucinations en cascade | 6 |
| `xss` | Exfiltration XSS | 1 |

### Générateurs (15+ types)

- `openai` - OpenAI API (GPT-3.5, GPT-4, etc.)
- `huggingface` - Hugging Face (Pipeline, Inference API, Endpoints)
- `cohere` - Cohere API
- `groq` - Groq API
- `azure` - Azure OpenAI
- `mistral` - Mistral AI
- `litellm` - LiteLLM (multi-provider)
- `ggml` - Modèles GGUF (llama.cpp)
- `replicate` - Replicate API
- `nemo` - NVIDIA NeMo
- `langchain` - LangChain
- `test` - Générateurs de test

### Détecteurs (20+ types)

- `always` - Détecteurs de test (Pass, Fail, Random)
- `ansiescape` - Détection d'échappement ANSI
- `continuation` - Détection de continuation
- `dan` - Détection de jailbreak DAN
- `divergence` - Détection de divergence
- `encoding` - Détection de décodage
- `exploitation` - Détection d'exploitation (SQLi, XSS, etc.)
- `mitigation` - Détection de bypass de mitigation
- `packagehallucination` - Détection de packages inexistants
- `toxicity` - Détection de toxicité (ML-based)

---

## 🔧 Configuration

### Variables d'Environnement

Copiez `.env.example` vers `.env` et configurez vos clés API :

```bash
cp .env.example .env
nano .env  # ou votre éditeur préféré
```

### Clés API Requises

| Service | Variable | Où l'obtenir |
|---------|----------|--------------|
| OpenAI | `OPENAI_API_KEY` | https://platform.openai.com/account/api-keys |
| Hugging Face | `HF_INFERENCE_TOKEN` | https://huggingface.co/settings/tokens |
| Cohere | `COHERE_API_KEY` | https://dashboard.cohere.ai/api-keys |
| Groq | `GROQ_API_KEY` | https://console.groq.com/keys |
| Replicate | `REPLICATE_API_TOKEN` | https://replicate.com/account/api-tokens |

---

## 📖 Documentation

### Fichiers de Documentation

1. **README_GARAK.md** - Guide d'utilisation complet
   - Installation
   - Commandes essentielles
   - Exemples d'utilisation
   - Référence rapide

2. **INTEGRATION_GUIDE.md** - Guide d'intégration
   - Architecture proposée
   - Option 1: Service Backend NestJS
   - Option 2: API REST Python
   - Mapping des concepts
   - Exemples de code

3. **SUMMARY.md** - Ce fichier
   - État de l'installation
   - Démarrage rapide
   - Composants installés

### Ressources Externes

- **Documentation officielle** : https://garak.readthedocs.io
- **GitHub** : https://github.com/NVIDIA/garak
- **Discord** : https://discord.gg/uVch4puUCs
- **Paper** : https://arxiv.org/abs/2406.11036
- **Site Web** : https://garak.ai

---

## 🎯 Prochaines Étapes

### 1. Tester GARAK

```bash
# Test de démonstration
./quick_start.sh demo

# Analyser les résultats
python examples/analyze_results.py garak.demo_test.report.jsonl
```

### 2. Intégrer avec AI Risk Manager

Choisissez une option d'intégration :

- **Option A** : Service Backend NestJS (recommandé pour production)
- **Option B** : API REST Python (plus simple, déploiement séparé)
- **Option C** : Import direct Python (pour scripts)

Consultez `INTEGRATION_GUIDE.md` pour les détails.

### 3. Personnaliser les Tests

Créez vos propres scripts de test dans `examples/` :

```bash
# Exemple de test personnalisé
uv run python -m garak \
    --target_type openai \
    --target_name gpt-4 \
    --probes encoding dan malwaregen \
    --generations 5 \
    --report_prefix custom_test
```

---

## 🐛 Dépannage

### Problème : `garak: command not found`

**Solution :** Utilisez `uv run python -m garak` au lieu de `garak`

### Problème : `Python interpreter not found`

**Solution :** Activez l'environnement virtuel :
```bash
source .venv/Scripts/activate  # Git Bash
```

### Problème : API key non reconnue

**Solution :** Exportez la variable d'environnement :
```bash
export OPENAI_API_KEY="sk-..."
```

### Problème : Timeout lors de l'exécution

**Solution :** Réduisez le nombre de générations :
```bash
uv run python -m garak ... --generations 3
```

---

## 📊 Statistiques d'Installation

```
Packages installés : 162
Taille de l'environnement : ~2.5 GB
Temps d'installation : ~3 minutes
Python version : 3.11.8
uv version : 0.6.16
```

### Dépendances Principales

- `transformers` 4.57.1 - Modèles Hugging Face
- `torch` 2.9.0 - PyTorch
- `openai` 1.109.1 - Client OpenAI
- `langchain` 1.0.3 - LangChain
- `fastapi` 0.121.0 - API REST
- `datasets` 3.6.0 - Datasets Hugging Face
- `nltk` 3.9.2 - Natural Language Toolkit

---

## ✅ Checklist de Vérification

- [x] GARAK v0.13.1 installé
- [x] Environnement virtuel créé (.venv)
- [x] 162 packages installés
- [x] Documentation créée (README, INTEGRATION_GUIDE)
- [x] Scripts d'exemple créés (quick_start.sh, analyze_results.py)
- [x] Configuration exemple créée (.env.example)
- [ ] Tests de démonstration exécutés
- [ ] Clés API configurées
- [ ] Intégration avec AI Risk Manager planifiée

---

## 🎉 Conclusion

GARAK est maintenant **complètement installé et configuré** dans votre projet AI Risk Manager !

**Prochaine action recommandée :**
```bash
cd guardrail/solution_garak
./quick_start.sh demo
```

Cela lancera un test de démonstration sans nécessiter de clé API et vous permettra de voir GARAK en action.

---

**Installation réalisée le :** 2025-11-04  
**Par :** Augment Agent  
**Version GARAK :** 0.13.1  
**Statut :** ✅ Prêt à l'emploi

