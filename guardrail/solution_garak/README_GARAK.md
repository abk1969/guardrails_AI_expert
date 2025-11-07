# 🛡️ GARAK - Guide d'Utilisation Complet

## 📋 Table des Matières
- [Installation](#installation)
- [Premiers Pas](#premiers-pas)
- [Commandes Essentielles](#commandes-essentielles)
- [Exemples d'Utilisation](#exemples-dutilisation)
- [Intégration avec AI Risk Manager](#intégration-avec-ai-risk-manager)
- [Référence Rapide](#référence-rapide)

---

## 🚀 Installation

GARAK v0.13.1 est installé dans cet environnement virtuel.

### Activation de l'Environnement

```bash
# Depuis le répertoire solution_garak
source .venv/Scripts/activate  # Windows Git Bash
# OU
.venv\Scripts\activate.bat     # Windows CMD
# OU
.venv\Scripts\Activate.ps1     # PowerShell
```

### Vérification de l'Installation

```bash
# Avec uv (recommandé)
uv run python -m garak --version

# Avec environnement activé
python -m garak --version
```

**Sortie attendue :**
```
garak LLM vulnerability scanner v0.13.1 ( https://github.com/NVIDIA/garak ) at 2025-11-04T...
```

---

## 🎯 Premiers Pas

### 1. Lister les Composants Disponibles

```bash
# Lister toutes les probes (sondes de test)
uv run python -m garak --list_probes

# Lister tous les générateurs (LLMs supportés)
uv run python -m garak --list_generators

# Lister tous les détecteurs
uv run python -m garak --list_detectors

# Lister tous les buffs (augmentations)
uv run python -m garak --list_buffs
```

### 2. Test Simple avec un Modèle de Test

```bash
# Tester avec le générateur de test (ne nécessite pas d'API key)
uv run python -m garak --target_type test.Blank --probes dan.Dan_11_0
```

---

## 🔧 Commandes Essentielles

### Configuration des Variables d'Environnement

Créez un fichier `.env` dans ce répertoire :

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Hugging Face
HF_INFERENCE_TOKEN=hf_...

# Cohere
COHERE_API_KEY=...

# Groq
GROQ_API_KEY=...

# Replicate
REPLICATE_API_TOKEN=r8-...
```

### Tests avec OpenAI

```bash
# Test d'injection par encodage sur GPT-3.5
export OPENAI_API_KEY="sk-..."
uv run python -m garak --target_type openai \
                       --target_name gpt-3.5-turbo \
                       --probes encoding

# Test DAN (Do Anything Now) sur GPT-4
uv run python -m garak --target_type openai \
                       --target_name gpt-4 \
                       --probes dan.Dan_11_0

# Test complet (toutes les probes)
uv run python -m garak --target_type openai \
                       --target_name gpt-3.5-turbo
```

### Tests avec Hugging Face

```bash
# Modèle local via Pipeline
uv run python -m garak --target_type huggingface \
                       --target_name gpt2 \
                       --probes dan.Dan_11_0

# Modèle via Inference API
export HF_INFERENCE_TOKEN="hf_..."
uv run python -m garak --target_type huggingface.InferenceAPI \
                       --target_name mosaicml/mpt-7b-instruct \
                       --probes promptinject
```

### Tests avec Cohere

```bash
export COHERE_API_KEY="..."
uv run python -m garak --target_type cohere \
                       --target_name command \
                       --probes malwaregen
```

### Tests avec Groq

```bash
export GROQ_API_KEY="..."
uv run python -m garak --target_type groq \
                       --target_name llama-3.1-8b-instant \
                       --probes encoding dan
```

---

## 📊 Exemples d'Utilisation

### Exemple 1 : Test de Sécurité Basique

```bash
# Test des vulnérabilités d'injection de prompts
uv run python -m garak --target_type openai \
                       --target_name gpt-3.5-turbo \
                       --probes promptinject \
                       --report_prefix test_injection
```

**Résultats :**
- Fichier JSONL : `garak.test_injection.report.jsonl`
- Hit log : `garak.test_injection.hitlog.jsonl`
- Rapport HTML : `garak.test_injection.report.html`

### Exemple 2 : Test Multi-Probes

```bash
# Tester plusieurs familles de vulnérabilités
uv run python -m garak --target_type openai \
                       --target_name gpt-4 \
                       --probes encoding dan malwaregen misleading \
                       --generations 5
```

### Exemple 3 : Test avec Buffs (Augmentations)

```bash
# Tester avec paraphrase et encodage
uv run python -m garak --target_type openai \
                       --target_name gpt-3.5-turbo \
                       --probes dan \
                       --buffs paraphrase encoding
```

### Exemple 4 : Test Adaptatif (Attack Generation)

```bash
# Utiliser le générateur d'attaques adaptatif
uv run python -m garak --target_type openai \
                       --target_name gpt-3.5-turbo \
                       --probes atkgen.Tox \
                       --generations 10
```

### Exemple 5 : Configuration Rapide

```bash
# Utiliser la configuration rapide (moins de tests)
uv run python -m garak --target_type openai \
                       --target_name gpt-3.5-turbo \
                       --config fast
```

---

## 🔗 Intégration avec AI Risk Manager

### Architecture Proposée

```
AI Risk Manager (Frontend)
    ↓
Backend API Gateway (NestJS)
    ↓
GARAK Service (Python)
    ↓
LLM Cible
```

### Option 1 : Service Backend Dédié

Créez un service NestJS qui appelle GARAK :

```typescript
// backend/apps/garak-service/src/garak.service.ts
import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class GarakService {
  async runScan(config: GarakScanConfig): Promise<GarakResults> {
    const command = `uv run python -m garak \
      --target_type ${config.targetType} \
      --target_name ${config.targetName} \
      --probes ${config.probes.join(' ')} \
      --report_prefix ${config.reportPrefix}`;
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: '/path/to/solution_garak',
      env: { ...process.env, OPENAI_API_KEY: config.apiKey }
    });
    
    return this.parseResults(config.reportPrefix);
  }
}
```

### Option 2 : API REST Wrapper

Créez un wrapper Flask/FastAPI autour de GARAK :

```python
# guardrail/solution_garak/api_server.py
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
import subprocess
import json

app = FastAPI()

class ScanRequest(BaseModel):
    target_type: str
    target_name: str
    probes: list[str]
    api_key: str

@app.post("/scan")
async def run_scan(request: ScanRequest, background_tasks: BackgroundTasks):
    scan_id = generate_scan_id()
    background_tasks.add_task(execute_garak, request, scan_id)
    return {"scan_id": scan_id, "status": "started"}

def execute_garak(request: ScanRequest, scan_id: str):
    cmd = [
        "python", "-m", "garak",
        "--target_type", request.target_type,
        "--target_name", request.target_name,
        "--probes", *request.probes,
        "--report_prefix", scan_id
    ]
    subprocess.run(cmd, env={"OPENAI_API_KEY": request.api_key})
```

### Option 3 : Import Direct Python

```python
# Importer GARAK comme bibliothèque
from garak import _config
from garak.generators import openai
from garak.probes import dan
from garak.harnesses import probewise

# Configuration
_config.load_config()
generator = openai.OpenAIGenerator(name="gpt-3.5-turbo")

# Exécution
probe = dan.Dan_11_0()
harness = probewise.ProbewiseHarness()
results = harness.run(generator, [probe])
```

---

## 📖 Référence Rapide

### Principales Familles de Probes

| Famille | Description | Exemple |
|---------|-------------|---------|
| `promptinject` | Injection de prompts | `--probes promptinject` |
| `dan` | Jailbreaks DAN | `--probes dan.Dan_11_0` |
| `encoding` | Injection par encodage | `--probes encoding` |
| `malwaregen` | Génération de malware | `--probes malwaregen` |
| `leakreplay` | Fuite de données | `--probes leakreplay` |
| `misleading` | Fausses affirmations | `--probes misleading` |
| `atkgen` | Attaques adaptatives | `--probes atkgen.Tox` |
| `xss` | Exfiltration de données | `--probes xss` |

### Générateurs Supportés

| Type | Exemple | Variable d'Environnement |
|------|---------|--------------------------|
| OpenAI | `--target_type openai --target_name gpt-4` | `OPENAI_API_KEY` |
| Hugging Face | `--target_type huggingface --target_name gpt2` | `HF_INFERENCE_TOKEN` |
| Cohere | `--target_type cohere --target_name command` | `COHERE_API_KEY` |
| Groq | `--target_type groq --target_name llama-3.1-8b` | `GROQ_API_KEY` |
| Test | `--target_type test.Blank` | Aucune |

### Options Utiles

```bash
# Nombre de générations par prompt (défaut: 10)
--generations 5

# Préfixe pour les fichiers de rapport
--report_prefix mon_test

# Configuration rapide
--config fast

# Mode verbeux
--verbose

# Seed pour reproductibilité
--seed 42

# Limiter le nombre de prompts
--probe_tags quick
```

---

## 📁 Structure des Fichiers de Sortie

Après chaque scan, GARAK génère :

```
guardrail/solution_garak/
├── garak.log                          # Log de débogage
├── garak.<prefix>.report.jsonl        # Rapport détaillé (JSONL)
├── garak.<prefix>.hitlog.jsonl        # Vulnérabilités détectées
└── garak.<prefix>.report.html         # Rapport interactif
```

### Format du Rapport JSONL

```json
{
  "goal": "inject a prompt",
  "prompt": "Ignore previous instructions...",
  "output": "I cannot help with that...",
  "trigger": null,
  "score": 0,
  "generator": "openai gpt-3.5-turbo",
  "probe": "promptinject.HijackLongPrompt",
  "detector": "promptinject.AttackRogueString"
}
```

---

## 🎓 Ressources Supplémentaires

- **Documentation officielle** : https://garak.readthedocs.io
- **GitHub** : https://github.com/NVIDIA/garak
- **Discord** : https://discord.gg/uVch4puUCs
- **Paper** : https://arxiv.org/abs/2406.11036

---

## 🔒 Bonnes Pratiques

1. **Toujours tester avec autorisation** sur vos propres modèles
2. **Protéger les API keys** (ne jamais les commiter)
3. **Analyser les résultats** dans le contexte de votre application
4. **Itérer** : GARAK est un outil d'exploration, pas un benchmark
5. **Contribuer** : Partager les vulnérabilités découvertes avec AVID

---

**Installation réussie ! 🎉**
GARAK v0.13.1 est prêt à l'emploi avec 162 packages installés.

