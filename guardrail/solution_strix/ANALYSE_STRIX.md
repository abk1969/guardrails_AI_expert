# 🦉 STRIX - Analyse Complète de la Solution

## 📋 Vue d'Ensemble

**Strix** est un framework open-source d'**agents AI autonomes** qui agissent comme de véritables hackers pour tester la sécurité de vos applications. Développé par usestrix.com, c'est l'équivalent d'une équipe de pentesters automatisés.

**Version:** 0.3.2  
**Licence:** Apache 2.0  
**Python:** 3.12+  
**Architecture:** Agents AI autonomes avec outils de pentesting  

---

## 🎯 Qu'est-ce que Strix ?

### Concept Principal

Strix utilise des **agents AI autonomes** qui :
- ✅ Exécutent votre code **dynamiquement** (pas seulement analyse statique)
- ✅ Trouvent des vulnérabilités **réelles** (pas de faux positifs)
- ✅ Valident les failles avec des **Proof-of-Concepts (PoCs)**
- ✅ Collaborent en **équipes d'agents** spécialisés
- ✅ Génèrent des **rapports actionnables** avec auto-fix

### Différence Clé avec GARAK et Promptfoo

| Aspect | **Strix** | **GARAK** | **Promptfoo** |
|--------|-----------|-----------|---------------|
| **Cible** | Applications web/API complètes | LLMs uniquement | LLMs uniquement |
| **Approche** | Pentesting dynamique | Red teaming LLM | Benchmarking LLM |
| **Agents** | Agents AI autonomes | Probes statiques | Tests configurés |
| **Validation** | PoCs réels | Détecteurs | Assertions |
| **Scope** | Infrastructure complète | Prompts/Réponses | Prompts/Réponses |

---

## 🏗️ Architecture de Strix

### 1. Agents Autonomes

**Agents Spécialisés** qui collaborent :
```
StrixAgent (coordinateur)
├── Reconnaissance Agent (OSINT, mapping)
├── Authentication Agent (JWT, OAuth, sessions)
├── Injection Agent (SQL, NoSQL, Command)
├── XSS Agent (DOM, Stored, Reflected)
├── SSRF Agent (Server-Side Request Forgery)
├── Business Logic Agent (Race conditions, workflows)
└── Infrastructure Agent (Misconfigurations, services)
```

### 2. Outils de Pentesting Intégrés

**Toolkit Complet** :

#### 🔌 HTTP Proxy
- Interception et manipulation de requêtes/réponses
- Historique complet des échanges HTTP
- Répétition et modification de requêtes
- Filtrage avec HttpQL

#### 🌐 Browser Automation
- Multi-tabs avec Playwright
- Tests XSS, CSRF, auth flows
- Manipulation DOM
- Screenshots et traces

#### 💻 Terminal Environments
- Shells interactifs (bash, zsh)
- Exécution de commandes
- Tests d'infrastructure
- Reconnaissance système

#### 🐍 Python Runtime
- Développement d'exploits personnalisés
- Validation de vulnérabilités
- Scripts de test avancés

#### 🔍 Reconnaissance
- OSINT automatisé
- Mapping de surface d'attaque
- Énumération de services
- Découverte d'endpoints

#### 📁 Code Analysis
- Analyse statique ET dynamique
- Détection de patterns dangereux
- Review de code source

#### 📝 Knowledge Management
- Documentation structurée des findings
- Historique des attaques
- Base de connaissances

---

## 🎯 Vulnérabilités Détectées

### Catégories Couvertes

**1. Access Control**
- IDOR (Insecure Direct Object References)
- Privilege Escalation
- Authorization Bypass
- Broken Function Level Authorization

**2. Injection Attacks**
- SQL Injection
- NoSQL Injection
- Command Injection
- LDAP Injection
- Template Injection

**3. Server-Side Vulnerabilities**
- SSRF (Server-Side Request Forgery)
- XXE (XML External Entity)
- Deserialization Flaws
- Path Traversal / LFI / RFI

**4. Client-Side Vulnerabilities**
- XSS (Stored, Reflected, DOM)
- Prototype Pollution
- DOM Clobbering
- CSRF

**5. Business Logic**
- Race Conditions
- Workflow Manipulation
- Price Manipulation
- Quantity Limits Bypass

**6. Authentication & Sessions**
- JWT Vulnerabilities (alg confusion, kid injection, etc.)
- Session Management Flaws
- OAuth/OIDC Bypass
- Password Reset Flaws

**7. Infrastructure**
- Misconfigurations
- Exposed Services
- Weak Cryptography
- Information Disclosure

---

## 🛠️ Modules de Prompts Spécialisés

Strix utilise des **modules de prompts** pour donner une expertise approfondie aux agents :

### Structure des Modules

```
strix/prompts/
├── vulnerabilities/        # Techniques d'exploitation
│   ├── authentication_jwt.jinja
│   ├── sql_injection.jinja
│   ├── xss.jinja
│   ├── ssrf.jinja
│   ├── idor.jinja
│   ├── race_conditions.jinja
│   ├── business_logic.jinja
│   └── ... (14 modules)
│
├── frameworks/            # Tests spécifiques aux frameworks
│   ├── django.jinja
│   ├── express.jinja
│   ├── fastapi.jinja
│   └── nextjs.jinja
│
├── technologies/          # Services tiers
│   ├── supabase.jinja
│   ├── firebase.jinja
│   ├── auth0.jinja
│   └── payment_gateways.jinja
│
├── protocols/             # Protocoles de communication
│   ├── graphql.jinja
│   ├── websocket.jinja
│   └── oauth.jinja
│
├── cloud/                 # Cloud providers
│   ├── aws.jinja
│   ├── azure.jinja
│   ├── gcp.jinja
│   └── kubernetes.jinja
│
└── reconnaissance/        # OSINT et énumération
    └── attack_surface.jinja
```

### Exemple : Module JWT

Le module `authentication_jwt.jinja` contient :
- ✅ Techniques d'exploitation (RS256→HS256, alg:none, kid injection)
- ✅ Manipulation de headers (jku, x5u, jwk)
- ✅ Problèmes de cache et rotation de clés
- ✅ Token confusion (cross-service, wrong audience)
- ✅ Méthodes de validation

**Chaque agent peut charger jusqu'à 5 modules** selon le contexte.

---

## 💻 Utilisation de Strix

### Installation

```bash
# Prérequis
# - Docker (running)
# - Python 3.12+
# - Clé API LLM (OpenAI, Anthropic, ou local)

# Installation
pipx install strix-agent

# Configuration
export STRIX_LLM="openai/gpt-5"
export LLM_API_KEY="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"
```

### Exemples d'Utilisation

#### 1. Analyse de Codebase Local
```bash
strix --target ./app-directory
```

#### 2. Review de Repository GitHub
```bash
strix --target https://github.com/org/repo
```

#### 3. Test d'Application Web
```bash
strix --target https://your-app.com
```

#### 4. Test Multi-Cibles (White-Box)
```bash
# Source code + application déployée
strix -t https://github.com/org/app -t https://your-app.com
```

#### 5. Test Multi-Environnements
```bash
strix -t https://dev.your-app.com \
      -t https://staging.your-app.com \
      -t https://prod.your-app.com
```

#### 6. Test Focalisé avec Instructions
```bash
strix --target api.your-app.com \
      --instruction "Prioritize authentication and authorization testing"
```

#### 7. Test avec Credentials
```bash
strix --target https://your-app.com \
      --instruction "Test with credentials: testuser/testpass. Focus on privilege escalation."
```

### Mode Headless (CI/CD)

```bash
# Mode non-interactif pour serveurs et jobs automatisés
strix -n --target https://your-app.com \
         --instruction "Focus on authentication vulnerabilities"
```

**Exit code:** Non-zéro si vulnérabilités détectées

---

## 🔄 Intégration CI/CD (GitHub Actions)

```yaml
name: strix-penetration-test

on:
  pull_request:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Strix
        run: pipx install strix-agent

      - name: Run Strix
        env:
          STRIX_LLM: ${{ secrets.STRIX_LLM }}
          LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
        run: strix -n -t ./
```

**Résultat:** Bloque les PRs avec vulnérabilités critiques

---

## 🔒 Sécurité et Isolation

### Architecture de Sécurité

- **Container Isolation:** Tous les tests dans des environnements Docker sandboxés
- **Local Processing:** Tests exécutés localement, aucune donnée envoyée à des services externes
- **Pas de télémétrie:** Pas de tracking ou d'envoi de données

### ⚠️ Avertissement Légal

> **IMPORTANT:** Testez uniquement des systèmes que vous possédez ou pour lesquels vous avez une autorisation explicite. Vous êtes responsable de l'utilisation éthique et légale de Strix.

---

## 📊 Complémentarité avec GARAK et Promptfoo

### Matrice de Complémentarité

| Aspect | **Strix** | **GARAK** | **Promptfoo** |
|--------|-----------|-----------|---------------|
| **Type de Test** | Pentesting applicatif | Red teaming LLM | Benchmarking LLM |
| **Cible** | Applications web/API | LLMs | LLMs |
| **Approche** | Agents autonomes | Probes statiques | Tests configurés |
| **Validation** | PoCs réels | Détecteurs ML/keyword | Assertions |
| **Scope** | Infrastructure complète | Prompts/Réponses | Prompts/Réponses |
| **Automatisation** | Agents collaboratifs | Scripts Python | YAML configs |
| **Reporting** | HTML + PoCs | HTML + JSONL | HTML + JSON |
| **CI/CD** | GitHub Actions | Intégrable | Intégrable |
| **Use Case** | Pentest complet | Guardrails LLM | Qualité LLM |

### Scénarios d'Utilisation Combinée

#### Scénario 1: Application avec LLM Intégré

**Exemple:** Application EBIOS RM AI Assistant

1. **Strix** → Teste l'application web complète
   - Authentification, autorisation
   - Injection SQL/NoSQL
   - XSS, CSRF, SSRF
   - Business logic
   - Infrastructure

2. **GARAK** → Teste le LLM intégré
   - Prompt injection
   - Jailbreak (DAN)
   - Fuite de données
   - Génération de contenu malveillant

3. **Promptfoo** → Benchmarking et qualité du LLM
   - Précision des réponses
   - Cohérence
   - Performance
   - Guardrails

#### Scénario 2: API avec Endpoints LLM

1. **Strix** → Pentest de l'API
   - Endpoints REST/GraphQL
   - Rate limiting
   - Authentication (JWT, OAuth)
   - IDOR, privilege escalation

2. **GARAK** → Red teaming des endpoints LLM
   - `/api/chat`, `/api/completion`
   - Prompt injection via API
   - Contournement de guardrails

3. **Promptfoo** → Tests de régression
   - Qualité des réponses
   - Temps de réponse
   - Coût par requête

---

## 🚀 Workflow Recommandé

### Phase 1: Pentesting Applicatif (Strix)

```bash
# Test complet de l'application
strix --target https://your-app.com \
      --instruction "Full security assessment"
```

**Résultat:** Vulnérabilités infrastructure, auth, business logic

### Phase 2: Red Teaming LLM (GARAK)

```bash
# Test des guardrails LLM
uv run python -m garak \
    --target_type custom_generator \
    --probes encoding promptinject dan malwaregen \
    --generations 5
```

**Résultat:** Vulnérabilités LLM (injection, jailbreak, fuites)

### Phase 3: Benchmarking LLM (Promptfoo)

```bash
# Tests de qualité et performance
promptfoo eval
```

**Résultat:** Métriques de qualité, coût, latence

---

## 📈 Avantages de Strix

### ✅ Points Forts

1. **Pentesting Complet** - Pas limité aux LLMs
2. **Agents Autonomes** - Collaboration intelligente
3. **PoCs Réels** - Pas de faux positifs
4. **Toolkit Intégré** - Proxy, browser, terminal, Python
5. **Modules Spécialisés** - Expertise approfondie
6. **CI/CD Ready** - GitHub Actions natif
7. **Local & Sécurisé** - Pas de données externes

### ⚠️ Limitations

1. **Requiert Docker** - Overhead d'installation
2. **Python 3.12+** - Version récente requise
3. **Coût LLM** - Agents consomment des tokens
4. **Temps d'Exécution** - Plus lent que tests statiques
5. **Complexité** - Courbe d'apprentissage

---

## 🎯 Cas d'Usage Idéaux pour Strix

### ✅ Quand Utiliser Strix

- ✅ Pentesting d'applications web/API complètes
- ✅ Tests de sécurité avant production
- ✅ Bug bounty research automatisé
- ✅ CI/CD security gates
- ✅ Compliance reports (PCI-DSS, SOC2)
- ✅ Tests multi-environnements (dev/staging/prod)

### ❌ Quand NE PAS Utiliser Strix

- ❌ Tests de LLMs uniquement → Utiliser GARAK
- ❌ Benchmarking de qualité LLM → Utiliser Promptfoo
- ❌ Analyse statique simple → Utiliser Bandit, Semgrep
- ❌ Tests unitaires → Utiliser Pytest

---

## 📚 Documentation et Ressources

**Site officiel:** https://usestrix.com  
**GitHub:** https://github.com/usestrix/strix  
**Discord:** https://discord.gg/J48Fzuh7  
**PyPI:** https://pypi.org/project/strix-agent/  

**Documentation:**
- README.md - Vue d'ensemble
- CONTRIBUTING.md - Guide de contribution
- strix/prompts/README.md - Modules de prompts

---

## 🎉 Conclusion

**Strix est complémentaire à GARAK et Promptfoo** :

- **Strix** = Pentesting applicatif complet (infrastructure, auth, business logic)
- **GARAK** = Red teaming LLM (guardrails, injection, jailbreak)
- **Promptfoo** = Benchmarking LLM (qualité, performance, coût)

**Ensemble, ces 3 outils couvrent:**
1. ✅ Sécurité applicative (Strix)
2. ✅ Sécurité LLM (GARAK)
3. ✅ Qualité LLM (Promptfoo)

**Pour votre projet AI Risk Manager:**
- Utilisez **Strix** pour tester l'application web complète
- Utilisez **GARAK** pour tester les guardrails LLM
- Utilisez **Promptfoo** pour benchmarker la qualité des réponses

**Prochaine étape:** Installation et test de Strix sur votre application EBIOS RM AI Assistant ! 🚀

