# 🦉 Installation et Configuration de Strix

## 📋 Prérequis

### Système Requis

- ✅ **Docker** (en cours d'exécution)
- ✅ **Python 3.12+**
- ✅ **pipx** (recommandé) ou pip
- ✅ **Clé API LLM** (OpenAI, Anthropic, ou modèle local)

### Vérification des Prérequis

```bash
# Vérifier Docker
docker --version
docker ps  # Doit fonctionner sans erreur

# Vérifier Python
python --version  # Doit être >= 3.12

# Vérifier pipx (ou installer)
pipx --version
# Si absent: python -m pip install --user pipx
```

---

## 🚀 Installation

### Méthode 1: Installation avec pipx (Recommandé)

```bash
# Installation
pipx install strix-agent

# Vérification
strix --version
```

### Méthode 2: Installation avec pip

```bash
# Installation
pip install strix-agent

# Vérification
strix --version
```

### Méthode 3: Installation depuis le Code Source

```bash
cd guardrail/solution_strix/strix

# Avec Poetry (recommandé)
poetry install
poetry run strix --version

# Avec pip
pip install -e .
strix --version
```

---

## ⚙️ Configuration

### 1. Configuration des Clés API

#### Option A: Variables d'Environnement

```bash
# OpenAI (recommandé)
export STRIX_LLM="openai/gpt-4"
export LLM_API_KEY="sk-..."

# Anthropic Claude
export STRIX_LLM="anthropic/claude-3-5-sonnet-20241022"
export LLM_API_KEY="sk-ant-..."

# Groq (rapide et gratuit)
export STRIX_LLM="groq/llama-3.1-70b-versatile"
export LLM_API_KEY="gsk_..."

# Modèle local (Ollama)
export STRIX_LLM="ollama/llama3.1"
export LLM_API_BASE="http://localhost:11434"
```

#### Option B: Fichier .env

```bash
cd guardrail/solution_strix

# Créer .env
cat > .env << 'EOF'
# Configuration Strix
STRIX_LLM=openai/gpt-4
LLM_API_KEY=sk-...

# Optionnel: API de recherche
PERPLEXITY_API_KEY=pplx-...

# Optionnel: Base URL personnalisée
# LLM_API_BASE=http://localhost:11434
EOF

# Charger les variables
source .env
```

### 2. Modèles LLM Supportés

Strix utilise **LiteLLM** qui supporte 100+ providers :

| Provider | Modèle Recommandé | Configuration |
|----------|-------------------|---------------|
| **OpenAI** | `gpt-4`, `gpt-4-turbo` | `openai/gpt-4` |
| **Anthropic** | `claude-3-5-sonnet` | `anthropic/claude-3-5-sonnet-20241022` |
| **Groq** | `llama-3.1-70b` | `groq/llama-3.1-70b-versatile` |
| **Ollama** | `llama3.1`, `mistral` | `ollama/llama3.1` |
| **Azure OpenAI** | `gpt-4` | `azure/gpt-4` |
| **Mistral** | `mistral-large` | `mistral/mistral-large-latest` |

**Documentation complète:** https://docs.litellm.ai/docs/providers

---

## 🧪 Premier Test

### Test de Démonstration

```bash
# Test simple sur un répertoire local
strix --target ./

# Avec instructions spécifiques
strix --target ./ --instruction "Focus on authentication vulnerabilities"
```

### Test sur Application EBIOS

```bash
# Test de votre application
strix --target https://ebios-rm-ai-assistant-1065555617003.us-west1.run.app/ \
      --instruction "Test authentication, authorization, and LLM integration security"
```

---

## 📊 Résultats et Rapports

### Localisation des Résultats

```bash
# Les résultats sont sauvegardés dans:
agent_runs/<run-name>/

# Structure:
agent_runs/
└── run_20241104_215334/
    ├── report.html          # Rapport interactif
    ├── findings.json        # Vulnérabilités en JSON
    ├── poc/                 # Proof-of-Concepts
    │   ├── sql_injection.py
    │   └── xss_payload.html
    └── logs/                # Logs détaillés
        └── agent.log
```

### Consulter les Résultats

```bash
# Ouvrir le rapport HTML
open agent_runs/run_*/report.html

# Lire les findings
cat agent_runs/run_*/findings.json | jq
```

---

## 🔧 Configuration Avancée

### 1. Mode Headless (Non-Interactif)

```bash
# Pour CI/CD et automatisation
strix -n --target https://your-app.com

# Exit code:
# 0 = Pas de vulnérabilités
# Non-zéro = Vulnérabilités détectées
```

### 2. Multi-Cibles

```bash
# Test de plusieurs environnements
strix -t https://dev.your-app.com \
      -t https://staging.your-app.com \
      -t https://prod.your-app.com
```

### 3. White-Box Testing

```bash
# Source code + application déployée
strix -t https://github.com/org/repo \
      -t https://your-app.com
```

### 4. Tests avec Credentials

```bash
strix --target https://your-app.com \
      --instruction "Use credentials: admin@example.com / password123. Test privilege escalation and IDOR."
```

---

## 🐳 Configuration Docker

### Vérifier Docker

```bash
# Docker doit être en cours d'exécution
docker ps

# Tester l'accès
docker run hello-world
```

### Image Sandbox

Au premier lancement, Strix télécharge l'image Docker sandbox :

```bash
# L'image est téléchargée automatiquement
# Taille: ~500 MB
# Temps: 2-5 minutes (selon connexion)
```

### Problèmes Docker Courants

#### Erreur: "Cannot connect to Docker daemon"

```bash
# Windows: Démarrer Docker Desktop
# Linux: Démarrer le service Docker
sudo systemctl start docker

# Vérifier
docker ps
```

#### Erreur: "Permission denied"

```bash
# Linux: Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
newgrp docker

# Vérifier
docker ps
```

---

## 🔄 Intégration CI/CD

### GitHub Actions

Créer `.github/workflows/strix-security.yml` :

```yaml
name: Strix Security Scan

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install Strix
        run: pipx install strix-agent

      - name: Run Strix Security Scan
        env:
          STRIX_LLM: ${{ secrets.STRIX_LLM }}
          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
        run: |
          strix -n -t ./ --instruction "Focus on critical vulnerabilities"

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: strix-security-report
          path: agent_runs/
```

**Configuration des Secrets:**
1. Aller dans Settings → Secrets and variables → Actions
2. Ajouter `STRIX_LLM` (ex: `openai/gpt-4`)
3. Ajouter `LLM_API_KEY` (votre clé API)

### GitLab CI

Créer `.gitlab-ci.yml` :

```yaml
strix-security:
  image: python:3.12
  services:
    - docker:dind
  variables:
    DOCKER_HOST: tcp://docker:2375
  before_script:
    - pip install pipx
    - pipx install strix-agent
  script:
    - strix -n -t ./ --instruction "Security assessment"
  artifacts:
    paths:
      - agent_runs/
    when: always
```

---

## 🛠️ Dépannage

### Problème: "Python version too old"

```bash
# Installer Python 3.12
# Windows: https://www.python.org/downloads/
# Linux (Ubuntu):
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.12 python3.12-venv

# Vérifier
python3.12 --version
```

### Problème: "Docker not found"

```bash
# Windows: Installer Docker Desktop
# https://www.docker.com/products/docker-desktop/

# Linux:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
```

### Problème: "LLM API key invalid"

```bash
# Vérifier la clé
echo $LLM_API_KEY

# Tester avec curl (OpenAI)
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $LLM_API_KEY"
```

### Problème: "Out of memory"

```bash
# Augmenter la mémoire Docker
# Docker Desktop → Settings → Resources → Memory
# Recommandé: 4 GB minimum, 8 GB idéal
```

---

## 📚 Ressources

### Documentation

- **Site officiel:** https://usestrix.com
- **GitHub:** https://github.com/usestrix/strix
- **Discord:** https://discord.gg/J48Fzuh7
- **PyPI:** https://pypi.org/project/strix-agent/

### Exemples

```bash
# Voir les exemples dans le repo
cd guardrail/solution_strix/strix
cat README.md
```

---

## ✅ Checklist d'Installation

- [ ] Docker installé et en cours d'exécution
- [ ] Python 3.12+ installé
- [ ] pipx installé
- [ ] Strix installé (`pipx install strix-agent`)
- [ ] Clé API LLM configurée
- [ ] Variables d'environnement définies
- [ ] Premier test exécuté avec succès
- [ ] Rapport HTML généré et consulté

---

## 🚀 Prochaines Étapes

### 1. Test Rapide (5 minutes)

```bash
# Test de démonstration
strix --target ./ --instruction "Quick security check"
```

### 2. Test de Votre Application (15 minutes)

```bash
# Test EBIOS RM AI Assistant
strix --target https://ebios-rm-ai-assistant-1065555617003.us-west1.run.app/ \
      --instruction "Full security assessment focusing on authentication and LLM integration"
```

### 3. Intégration CI/CD (30 minutes)

- Créer workflow GitHub Actions
- Configurer les secrets
- Tester sur une PR

---

**Installation terminée ! Vous êtes prêt à utiliser Strix pour tester la sécurité de vos applications. 🦉**

