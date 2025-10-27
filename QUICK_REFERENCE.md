# ⚡ RÉFÉRENCE RAPIDE - AI RISK MANAGER

**Guide ultra-synthétique pour accès rapide**

---

## 🎯 EN 30 SECONDES

**AI Risk Manager** est une SPA 100% client-side pour tester, gérer et gouverner la sécurité des systèmes IA.

- **15 000+ lignes de code** (TypeScript + React)
- **46 composants** | **16 contexts** | **17 modules**
- **2245 risques IA** | **195 prompts d'attaque** | **120+ règles de politique**
- **OWASP LLM Top 10 (2025)** + **Agentic AI Top 15**

---

## 📚 DOCUMENTATION (8 fichiers)

| Fichier | Quand l'utiliser |
|---------|------------------|
| **INDEX_COMPLET.md** | 🔑 **COMMENCEZ ICI** - Point d'entrée principal |
| **PROJECT_INDEX.md** | Localiser fichiers/composants |
| **TECHNICAL_DEEP_DIVE.md** | Comprendre architecture/patterns |
| **NAVIGATION_GUIDE.md** | Naviguer dans les 17 modules |
| **PROJECT_METRICS.md** | Obtenir statistiques/métriques |
| **VISUAL_INDEX.md** | Visualiser architecture/flux |
| **DOCUMENTATION_README.md** | Guide de la documentation |
| **DASHBOARD_PROJET.md** | Vue d'ensemble visuelle |

---

## 🗂️ STRUCTURE DU PROJET

```
guardrails_AI_expert/
├─ components/     # 46 composants React
├─ contexts/       # 16 Context Providers
├─ services/       # 4 services (Gemini, TestRunner, Sandbox, Agentic)
├─ data/           # Données (constants, types, policy, risks)
├─ hooks/          # useAllContexts (MCP Client)
├─ App.tsx         # Root component (16 nested providers)
├─ types.ts        # 571 lignes de types
└─ constants.ts    # 1082+ lignes de config
```

---

## 🧩 COMPOSANTS (46)

| Catégorie | Nombre | Exemples |
|-----------|--------|----------|
| Vues principales | 20 | Dashboard, Analytics, DatasetManager |
| UI | 6 | Card, Button, Modal, ProgressBar |
| Chatbot | 5 | Chatbot, ChatbotFab, ChatWindow |
| Policy | 3 | PolicyDashboard, PolicyChapter |
| Repository | 7 | CausalTaxonomy, RiskDatabase |
| Wiki | 2 | WikiChecklist, WikiToolsTable |
| Modaux | 3 | ResultDetailModal, UseCaseFormModal |

---

## 🔄 CONTEXTS (16)

| Context | Données | localStorage |
|---------|---------|--------------|
| TestRunContext | Config, prompts, résultats | ✅ |
| DatasetContext | 195 prompts d'attaque | ✅ |
| UseCaseContext | 30 cas d'usage | ✅ |
| ThreatProfileContext | 100+ profils de menaces | ✅ |
| AIPolicyContext | 120+ règles de politique | ✅ |
| AIRiskRepositoryContext | 2245 risques IA | ❌ |
| ... | 10 autres contexts | ✅ |

**Total localStorage** : ~1.7 MB

---

## 🛠️ SERVICES (4)

| Service | Rôle | API |
|---------|------|-----|
| geminiService | Génération prompts de test | ✅ Gemini |
| testRunnerService | Simulation exécution tests | ❌ |
| sandboxService | Évaluation locale | ❌ |
| agenticService | Assistant IA (MCP Server) | ✅ Gemini |

---

## 📊 MODULES (17)

| # | Module | Fonctionnalité |
|---|--------|----------------|
| 1 | Dashboard | Tests guardrails (4 états) |
| 2 | Analytics | Graphiques & tendances |
| 3 | Dataset Manager | 195 prompts d'attaque |
| 4 | Scénarios Avancés | 5 sections d'attaques |
| 5 | Cas d'Usage | 30 scénarios avec scoring |
| 6 | Profils de Menaces | 3 profils, 100+ entrées |
| 7 | Surface d'Attaque | Vecteurs, impacts |
| 8 | Paramètres | Configuration scoring |
| 9 | Vulnérabilités | CVE, OWASP mapping |
| 10 | Incidents | Historique incidents |
| 11 | Préparation Incidents | Questionnaire 40+ questions |
| 12 | Revue Red Team | 50+ questions |
| 13 | Résultats Red Team | 4 sections |
| 14 | Défenses | Matrice, OWASP Top 10/15 |
| 15 | Tiers IA | Questionnaire fournisseurs |
| 16 | Wiki Red Teamer | 5 sections, checklists |
| 17 | Politique IA | 5 chapitres, 120+ règles |
| 18 | Référentiel Risques IA | 9 onglets, 2245 risques |
| 💬 | Chatbot | MCP, drag & resize |

---

## 📈 DONNÉES

| Type | Quantité | Source |
|------|----------|--------|
| Risques IA | 2245 | MIT AI Risk Repository v3.0 |
| Prompts d'attaque | 195 | 6 familles (Injection, RAG, etc.) |
| Règles de politique | 120+ | 5 chapitres |
| Profils de menaces | 100+ | 3 acteurs (External, Deployer, Provider) |
| Cas d'usage | 30 | Matrice risque (Impact × Likelihood) |
| Ressources | 85 | Références académiques |

---

## 🔐 SÉCURITÉ

| Framework | Couverture |
|-----------|-----------|
| OWASP LLM Top 10 (2025) | ✅ 100% |
| OWASP Agentic AI Top 15 | ✅ 100% |
| MITRE ATLAS | 🟡 Partielle |
| AI Act (EU) 2024 | ✅ Conforme |
| RGPD | ✅ Privacy by Design |

**Principes** :
- ✅ 100% client-side (no backend)
- ✅ Aucune donnée externe (sauf Gemini API)
- ✅ Ephemeral state (tests en mémoire)
- 🟡 localStorage non chiffré

---

## 🚀 STACK TECHNIQUE

| Technologie | Version |
|-------------|---------|
| React | 19.1.1 |
| TypeScript | 5.8.2 |
| Vite | 6.2.0 |
| Tailwind CSS | Latest |
| Recharts | 3.2.0 |
| Lucide React | 0.543.0 |
| @google/genai | 1.19.0 |

**Bundle** : ~1 MB (~280 KB gzip)

---

## ⚡ COMMANDES

```bash
# Installation
npm install

# Développement (port 5080)
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

**Configuration** : Créer `.env` avec `GEMINI_API_KEY=your_key`

---

## 🎯 FLUX UTILISATEUR TYPIQUE

### Test Guardrails

```
1. Dashboard → "Lancer un Nouveau Test"
2. Configuration (catégories, volume, sensibilité)
3. Exécution (LiveTestView avec progression)
4. Résultats (RealTimeResults avec filtres)
5. Analytics (graphiques de tendances)
```

### Revue Red Team

```
1. Revue Red Team → Remplir questionnaire (50+ questions)
2. Résultats Red Team → Ajouter résultats de tests
3. Mapper menaces → mitigations
4. Créer roadmap stratégique
```

### Consultation Risques IA

```
1. Référentiel Risques IA → Onglet "Database"
2. Filtrer par entité/timing/domaine
3. Rechercher full-text
4. Consulter détail d'un risque (modal)
```

---

## 📊 MÉTRIQUES CLÉS

| Métrique | Valeur |
|----------|--------|
| Lignes de code | 15 000+ |
| Composants React | 46 |
| Context Providers | 16 |
| Modules fonctionnels | 17 |
| Risques IA indexés | 2245 |
| Prompts d'attaque | 195 |
| Règles de politique | 120+ |
| Bundle size (gzip) | ~280 KB |
| First Contentful Paint | ~1.5s |
| Time to Interactive | ~2.5s |

---

## ✅ POINTS FORTS

- ✅ **Privacy by Design** (100% client-side)
- ✅ **Couverture complète** (2245 risques, 195 prompts)
- ✅ **Conformité** (OWASP, MITRE, AI Act, RGPD)
- ✅ **UX moderne** (chatbot IA, graphiques, drag & drop)
- ✅ **Extensibilité** (contexts modulaires, CRUD complet)
- ✅ **Performance** (~280 KB gzip, TTI < 3s)

---

## 🟡 POINTS D'AMÉLIORATION

- 🟡 **Tests** (aucun test unitaire/e2e)
- 🟡 **Performance** (pas de lazy loading, virtual scrolling)
- 🟡 **Sécurité** (localStorage non chiffré)
- 🟡 **Backend** (préparé mais non utilisé)
- 🟡 **Documentation** (manque JSDoc dans le code)

---

## 🔍 RECHERCHE RAPIDE

### Localiser un Fichier

| Type | Dossier |
|------|---------|
| Composant React | `/components/` |
| Context Provider | `/contexts/` |
| Service | `/services/` |
| Données | `/data/` |
| Hook | `/hooks/` |
| Type | `types.ts` |
| Constante | `constants.ts` |

### Trouver une Fonctionnalité

| Fonctionnalité | Fichier |
|----------------|---------|
| Tests guardrails | `Dashboard.tsx` |
| Graphiques | `Analytics.tsx` |
| Prompts d'attaque | `DatasetManager.tsx` |
| Risques IA | `AIRiskRepositoryView.tsx` |
| Politique IA | `AIPolicyView.tsx` |
| Chatbot | `Chatbot.tsx` |
| MCP Client | `useAllContexts.ts` |
| MCP Server | `agenticService.ts` |

---

## 📞 CONTACT

- **GitHub** : [abk1969/guardrails_AI_expert](https://github.com/abk1969/guardrails_AI_expert)
- **Email** : globacom3000@gmail.com
- **Licence** : CC BY-SA 4.0 (OWASP Content)

---

## 🎓 GLOSSAIRE EXPRESS

| Terme | Définition |
|-------|------------|
| **Guardrail** | Mécanisme de sécurité pour LLM |
| **Prompt Injection** | Attaque via manipulation du prompt |
| **RAG** | Retrieval-Augmented Generation |
| **MCP** | Model Context Protocol (chatbot) |
| **Agentic AI** | Système IA autonome |
| **Red Teaming** | Simulation d'attaques |
| **OWASP** | Open Web Application Security Project |
| **MITRE ATLAS** | Adversarial Threat Landscape for AI |

---

## 🚀 DÉMARRAGE RAPIDE

### 1️⃣ Installation (2 min)

```bash
git clone https://github.com/abk1969/guardrails_AI_expert.git
cd guardrails_AI_expert
npm install
```

### 2️⃣ Configuration (1 min)

```bash
# Créer .env
echo "GEMINI_API_KEY=your_key_here" > .env
```

### 3️⃣ Lancement (1 min)

```bash
npm run dev
# Ouvrir http://localhost:5080
```

### 4️⃣ Premier Test (5 min)

1. Cliquer "Lancer un Nouveau Test"
2. Sélectionner catégories (ex: Sécurité, Pertinence)
3. Choisir cible "Sandbox"
4. Volume: 20 prompts
5. Cliquer "Lancer le Test"
6. Consulter résultats

**Total** : ~10 minutes pour être opérationnel ! 🚀

---

## 📖 PARCOURS RECOMMANDÉS

### 🆕 Nouveau Développeur (2-3h)

1. Lire `INDEX_COMPLET.md` (20 min)
2. Consulter `PROJECT_INDEX.md` (30 min)
3. Visualiser `VISUAL_INDEX.md` (20 min)
4. Approfondir `TECHNICAL_DEEP_DIVE.md` (1h)
5. Naviguer `NAVIGATION_GUIDE.md` (30 min)

### 🏗️ Architecte (1-2h)

1. Lire `INDEX_COMPLET.md` (15 min)
2. Analyser `TECHNICAL_DEEP_DIVE.md` (45 min)
3. Visualiser `VISUAL_INDEX.md` (20 min)
4. Évaluer `PROJECT_METRICS.md` (30 min)

### 📊 Product Owner (1h)

1. Lire `INDEX_COMPLET.md` (15 min)
2. Consulter `NAVIGATION_GUIDE.md` (30 min)
3. Analyser `PROJECT_METRICS.md` (15 min)

### 🔐 Auditeur Sécurité (1-2h)

1. Lire `INDEX_COMPLET.md` (15 min)
2. Analyser `TECHNICAL_DEEP_DIVE.md` (section 7) (30 min)
3. Visualiser `VISUAL_INDEX.md` (flux sécurité) (15 min)
4. Vérifier `PROJECT_METRICS.md` (sécurité) (30 min)

---

## ✅ CHECKLIST EXPRESS

### Pour Commencer
- [ ] Lire `QUICK_REFERENCE.md` (ce fichier) - 5 min
- [ ] Lire `INDEX_COMPLET.md` - 15 min
- [ ] Installer dépendances - 2 min
- [ ] Configurer `.env` - 1 min
- [ ] Lancer `npm run dev` - 1 min

### Pour Développer
- [ ] Consulter `PROJECT_INDEX.md` (structure)
- [ ] Lire `TECHNICAL_DEEP_DIVE.md` (patterns)
- [ ] Vérifier `CLAUDE.md` (conventions)
- [ ] Utiliser `NAVIGATION_GUIDE.md` (modules)

### Pour Déployer
- [ ] Exécuter `npm run build`
- [ ] Vérifier bundle dans `/dist`
- [ ] Tester avec `npm run preview`
- [ ] Déployer sur Vercel/Netlify

---

**FIN DE LA RÉFÉRENCE RAPIDE**

**Temps de lecture** : ~5 minutes  
**Dernière mise à jour** : 2025-01-XX  
**Version** : 1.0

**Pour plus de détails, consultez `INDEX_COMPLET.md` ! 📚**

