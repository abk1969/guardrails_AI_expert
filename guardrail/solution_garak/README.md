# 🛡️ GARAK - LLM Vulnerability Scanner

> **GARAK v0.13.1** installé et configuré pour AI Risk Manager  
> Installation réalisée le 2025-11-04 | Statut : ✅ Opérationnel

---

## 🎯 Démarrage en 30 Secondes

```bash
cd guardrail/solution_garak
./quick_start.sh demo
```

Cela lancera un test de démonstration sans nécessiter de clé API.

---

## 📚 Documentation

### 🚀 Pour Commencer

| Fichier | Description | Temps |
|---------|-------------|-------|
| **[INDEX.md](INDEX.md)** | 📚 Guide de navigation de toute la documentation | 2 min |
| **[RESUME_INSTALLATION.md](RESUME_INSTALLATION.md)** | ✅ Résumé de l'installation et prochaines étapes | 5 min |
| **[README_GARAK.md](README_GARAK.md)** | 📖 Guide d'utilisation complet | 15 min |

### 🔧 Pour Intégrer

| Fichier | Description | Temps |
|---------|-------------|-------|
| **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** | 🔗 Guide d'intégration avec AI Risk Manager | 20 min |
| **[SUMMARY.md](SUMMARY.md)** | 📊 Résumé technique et composants | 10 min |
| **[.env.example](.env.example)** | ⚙️ Configuration des API keys | 2 min |

### 💻 Exemples de Code

| Fichier | Description |
|---------|-------------|
| **[quick_start.sh](quick_start.sh)** | Script de démarrage rapide (7 modes) |
| **[examples/test_openai.sh](examples/test_openai.sh)** | Exemples de tests OpenAI |
| **[examples/analyze_results.py](examples/analyze_results.py)** | Analyseur de résultats |

---

## 🎓 Qu'est-ce que GARAK ?

**GARAK** (Generative AI Red-teaming & Assessment Kit) est un **framework open-source** développé par **NVIDIA** pour tester les vulnérabilités des **Large Language Models (LLMs)**.

### Caractéristiques Principales

✅ **30+ familles de probes** - Injection, jailbreak, toxicité, fuite de données, etc.  
✅ **15+ générateurs** - OpenAI, Hugging Face, Cohere, Groq, etc.  
✅ **20+ détecteurs** - Keyword-based et ML-based  
✅ **Attack Generation** - Génération d'attaques adaptatives  
✅ **Rapports détaillés** - HTML interactif + JSONL  
✅ **Open Source** - Apache 2.0 License  

### Probes Disponibles

| Catégorie | Probes | Description |
|-----------|--------|-------------|
| **Injection** | `promptinject`, `encoding` | Injection de prompts par diverses techniques |
| **Jailbreak** | `dan` (15+ variantes) | Contournement des guardrails |
| **Malware** | `malwaregen` | Génération de code malveillant |
| **Toxicité** | `realtoxicityprompts`, `continuation` | Contenu toxique et offensant |
| **Fuite** | `leakreplay`, `xss` | Fuite de données d'entraînement |
| **Hallucination** | `misleading`, `packagehallucination`, `snowball` | Fausses informations |
| **Avancé** | `atkgen`, `gcg` | Attaques adaptatives et optimisées |

---

## 🚀 Utilisation Rapide

### Test de Démonstration (sans API key)

```bash
./quick_start.sh demo
```

### Test avec OpenAI

```bash
# Configurer la clé API
export OPENAI_API_KEY="sk-..."

# Test basique (injection)
./quick_start.sh openai-basic

# Test jailbreak DAN
./quick_start.sh openai-dan

# Test complet
./quick_start.sh openai-full
```

### Commandes Manuelles

```bash
# Lister les probes
uv run python -m garak --list_probes

# Lister les générateurs
uv run python -m garak --list_generators

# Test personnalisé
uv run python -m garak \
    --target_type openai \
    --target_name gpt-3.5-turbo \
    --probes encoding dan malwaregen \
    --generations 5 \
    --report_prefix mon_test

# Analyser les résultats
python examples/analyze_results.py ~/.local/share/garak/garak_runs/mon_test.report.jsonl
```

---

## 🔗 Intégration avec AI Risk Manager

GARAK peut être intégré de **3 façons** :

### Option 1 : Service Backend NestJS (Recommandé)

```typescript
// backend/apps/api-gateway/src/garak/garak.service.ts
@Injectable()
export class GarakService {
  async runScan(config: GarakScanConfig): Promise<GarakResults> {
    // Exécuter GARAK via subprocess
    // Parser les résultats JSONL
    // Retourner les statistiques
  }
}
```

**Avantages :**
- Intégration native avec l'architecture existante
- Gestion des jobs avec Bull Queue
- WebSocket pour mises à jour en temps réel

### Option 2 : API REST Python (FastAPI)

```python
# guardrail/solution_garak/api_server.py
@app.post("/scan")
async def create_scan(request: ScanRequest):
    scan_id = str(uuid.uuid4())
    background_tasks.add_task(execute_garak, request, scan_id)
    return {"scan_id": scan_id, "status": "started"}
```

**Avantages :**
- Déploiement séparé
- API REST simple
- Background tasks avec FastAPI

### Option 3 : Import Direct Python

```python
from garak import _config
from garak.generators import openai
from garak.probes import dan

generator = openai.OpenAIGenerator(name="gpt-3.5-turbo")
probe = dan.Dan_11_0()
results = harness.run(generator, [probe])
```

**Avantages :**
- Contrôle total
- Pas de serveur nécessaire
- Idéal pour scripts

**Voir [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) pour le code complet.**

---

## 📊 Résultats et Rapports

### Fichiers Générés

Après chaque scan, GARAK génère :

```
~/.local/share/garak/garak_runs/
├── <prefix>.report.html        # Rapport interactif
├── <prefix>.report.jsonl       # Données brutes
└── <prefix>.hitlog.jsonl       # Vulnérabilités détectées
```

### Analyser les Résultats

```bash
# Avec le script fourni
python examples/analyze_results.py ~/.local/share/garak/garak_runs/mon_test.report.jsonl

# Ouvrir le rapport HTML
open ~/.local/share/garak/garak_runs/mon_test.report.html
```

### Format JSONL

```json
{
  "goal": "inject a prompt",
  "prompt": "Ignore previous instructions...",
  "output": "I cannot help with that...",
  "score": 0,
  "generator": "openai gpt-3.5-turbo",
  "probe": "promptinject.HijackLongPrompt",
  "detector": "promptinject.AttackRogueString"
}
```

---

## 🎯 Exemples d'Utilisation

### Exemple 1 : Test de Sécurité Basique

```bash
uv run python -m garak \
    --target_type openai \
    --target_name gpt-3.5-turbo \
    --probes promptinject encoding \
    --generations 5 \
    --report_prefix security_test
```

### Exemple 2 : Test Multi-Probes

```bash
uv run python -m garak \
    --target_type openai \
    --target_name gpt-4 \
    --probes encoding dan malwaregen misleading \
    --generations 5 \
    --report_prefix multi_probe_test
```

### Exemple 3 : Test avec Buffs

```bash
uv run python -m garak \
    --target_type openai \
    --target_name gpt-3.5-turbo \
    --probes dan \
    --buffs paraphrase encoding \
    --report_prefix buffed_test
```

---

## 📖 Ressources

### Documentation Locale

- **[INDEX.md](INDEX.md)** - Guide de navigation
- **[RESUME_INSTALLATION.md](RESUME_INSTALLATION.md)** - Résumé de l'installation
- **[README_GARAK.md](README_GARAK.md)** - Guide complet
- **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** - Guide d'intégration
- **[SUMMARY.md](SUMMARY.md)** - Résumé technique

### Documentation Externe

- **Site Web** : https://garak.ai
- **Documentation** : https://garak.readthedocs.io
- **GitHub** : https://github.com/NVIDIA/garak
- **Paper** : https://arxiv.org/abs/2406.11036
- **Discord** : https://discord.gg/uVch4puUCs

---

## 🐛 Dépannage

### `garak: command not found`

**Solution :** Utilisez `uv run python -m garak` au lieu de `garak`

### `Python interpreter not found`

**Solution :** Activez l'environnement virtuel :
```bash
source .venv/Scripts/activate  # Git Bash
```

### API key non reconnue

**Solution :** Exportez la variable d'environnement :
```bash
export OPENAI_API_KEY="sk-..."
```

**Plus de solutions dans [SUMMARY.md](SUMMARY.md) section "Dépannage"**

---

## ✅ Installation

**Statut :** ✅ Installé et testé

- **Version :** GARAK v0.13.1
- **Date :** 2025-11-04
- **Packages :** 162 installés
- **Environnement :** Python 3.11.8 avec uv
- **Test :** ✅ Démonstration réussie

**Voir [RESUME_INSTALLATION.md](RESUME_INSTALLATION.md) pour les détails.**

---

## 🎯 Prochaines Étapes

1. ✅ **Tester** - Exécuter `./quick_start.sh demo`
2. ⬜ **Configurer** - Copier `.env.example` vers `.env`
3. ⬜ **Tester avec API** - Exécuter `./quick_start.sh openai-basic`
4. ⬜ **Intégrer** - Suivre [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

---

## 📞 Support

**Questions ?** Consultez :
1. [INDEX.md](INDEX.md) - Guide de navigation
2. [SUMMARY.md](SUMMARY.md) - Dépannage
3. [garak/FAQ.md](garak/FAQ.md) - FAQ officielle
4. Discord : https://discord.gg/uVch4puUCs

---

**GARAK est prêt à l'emploi ! 🎉**

Commencez par : `./quick_start.sh demo`

