# 📚 INDEX COMPLET DU PROJET - AI RISK MANAGER

**Version** : 3.0  
**Date** : 2025-01-XX  
**Auteur** : AI Risk Manager Team  
**Licence** : CC BY-SA 4.0 (OWASP Content)

---

## 🎯 POINT D'ENTRÉE DE LA DOCUMENTATION

Ce fichier est le **point d'entrée principal** de toute la documentation du projet AI Risk Manager. Il référence tous les autres documents d'indexation et fournit une vue d'ensemble complète.

---

## 📖 DOCUMENTS D'INDEXATION

### 1. 📋 PROJECT_INDEX.md
**Contenu** : Index complet du projet  
**Sections** :
- Vue d'ensemble du projet
- Stack technologique
- Structure des fichiers (29 composants + 4 sous-dossiers)
- 16 Context Providers avec clés localStorage
- 4 Services avec descriptions détaillées
- Fichiers de données (constants.ts, types.ts, etc.)
- Inventaire complet des composants (46 total)
- Fonctionnalités des 17 modules
- Diagrammes de flux de données
- Métriques (15 000+ lignes de code)

**Utilisation** : Consulter pour comprendre la structure globale du projet et localiser les fichiers.

---

### 2. 🔬 TECHNICAL_DEEP_DIVE.md
**Contenu** : Analyse technique approfondie  
**Sections** :
- Architecture détaillée avec diagrammes
- Patterns de gestion d'état (Context API, 16 providers imbriqués)
- Flux d'exécution des tests avec exemples de code
- Implémentation MCP (Model Context Protocol)
- Architecture du Référentiel Risques IA (2245 entrées)
- Composants UI avancés (chatbot draggable/resizable)
- Sécurité et bonnes pratiques
- Structure localStorage et tailles (~1.7MB total)

**Utilisation** : Consulter pour comprendre les détails d'implémentation et les patterns architecturaux.

---

### 3. 🧭 NAVIGATION_GUIDE.md
**Contenu** : Guide de navigation des modules  
**Sections** :
- Carte des 17 modules avec navigation
- Description détaillée de chaque module :
  - Dashboard (4 états : Home, Configuration, Running, Finished)
  - Analytics (4 graphiques Recharts)
  - Bibliothèque d'Attaques (195 prompts, 6 familles)
  - Scénarios Avancés (5 sections)
  - Cas d'Usage (30 scénarios, matrice risque)
  - Profils de Menaces (3 profils, 100+ entrées)
  - Surface d'Attaque (vecteurs, impacts, scénarios)
  - Paramètres (scoring configuration)
  - Vulnérabilités Connues (CVE, OWASP mapping)
  - Incidents Connus (incidents historiques)
  - Préparation Incidents (questionnaire 40+ questions)
  - Revue Red Team (50+ questions)
  - Résultats Red Team (4 sections)
  - Défenses (matrice, OWASP Top 10/15)
  - Tiers IA (questionnaire fournisseurs)
  - Wiki Red Teamer (5 sections, checklists)
  - Politique IA (5 chapitres, 120+ règles)
  - Référentiel Risques IA (9 onglets, 2245 risques)
- Chatbot (MCP, drag & resize)
- Flux utilisateur typiques (3 scénarios)

**Utilisation** : Consulter pour naviguer dans l'application et comprendre les fonctionnalités de chaque module.

---

### 4. 📊 PROJECT_METRICS.md
**Contenu** : Métriques et statistiques du projet  
**Sections** :
- Métriques globales (taille, fichiers, composants)
- Composants React (46 total, répartition par catégorie)
- Contexts (16 providers, localStorage, données gérées)
- Services (4 fichiers, appels API)
- Fichiers de données (tailles, lignes)
- Contenu du projet :
  - Bibliothèque d'Attaques (195 prompts)
  - Cas d'Usage (30 scénarios)
  - Profils de Menaces (100+ entrées)
  - Politique IA (120+ règles)
  - Référentiel Risques IA (2245 risques)
- Technologies & dépendances (10 packages)
- Taille du bundle (~1MB, ~280KB gzip)
- Statistiques de développement (complexité, couverture)
- Design System (palette, composants)
- Sécurité & conformité (OWASP, MITRE, AI Act, RGPD)
- Performance (métriques, optimisations)
- Évolution du projet (versions, roadmap)
- Résumé exécutif (points forts, améliorations, métriques clés)

**Utilisation** : Consulter pour obtenir des statistiques précises et évaluer la taille/complexité du projet.

---

### 5. 🎨 VISUAL_INDEX.md
**Contenu** : Diagrammes et visualisations  
**Sections** :
- Architecture globale (diagramme ASCII)
- Flux de données - Test Execution (7 étapes)
- Architecture MCP (Model Context Protocol)
- Hiérarchie des composants (arbre complet)
- Structure des fichiers (arborescence)
- Flux de sécurité (5 principes)

**Utilisation** : Consulter pour visualiser l'architecture et les flux de données.

---

### 6. 📘 CLAUDE.md
**Contenu** : Guide pour Claude Code (claude.ai/code)  
**Sections** :
- Vue d'ensemble du projet
- Commandes de développement (dev, build, preview)
- Configuration environnement (Gemini API)
- Architecture (philosophie, structure, state management)
- Flux d'exécution des tests
- Définitions de types clés
- Détails d'implémentation critiques
- Navigation des modules
- Styling (Tailwind CSS)
- Configuration TypeScript
- Notes importantes

**Utilisation** : Consulter pour comprendre les conventions du projet et les instructions pour l'IA.

---

## 🗺️ CARTE DE NAVIGATION RAPIDE

### Par Objectif

#### 🎯 Je veux comprendre le projet globalement
→ Lire **PROJECT_INDEX.md** (sections 1-3)  
→ Consulter **VISUAL_INDEX.md** (Architecture globale)

#### 🔧 Je veux développer une nouvelle fonctionnalité
→ Lire **TECHNICAL_DEEP_DIVE.md** (sections 2-3)  
→ Consulter **CLAUDE.md** (sections 4-6)  
→ Vérifier **PROJECT_METRICS.md** (Design System)

#### 🧭 Je veux naviguer dans l'application
→ Lire **NAVIGATION_GUIDE.md** (sections 1-2)  
→ Consulter **VISUAL_INDEX.md** (Hiérarchie des composants)

#### 📊 Je veux des statistiques
→ Lire **PROJECT_METRICS.md** (toutes sections)

#### 🎨 Je veux visualiser l'architecture
→ Lire **VISUAL_INDEX.md** (tous diagrammes)

#### 🔐 Je veux comprendre la sécurité
→ Lire **TECHNICAL_DEEP_DIVE.md** (section 7)  
→ Consulter **VISUAL_INDEX.md** (Flux de sécurité)  
→ Vérifier **PROJECT_METRICS.md** (Sécurité & Conformité)

#### 🧪 Je veux comprendre les tests
→ Lire **TECHNICAL_DEEP_DIVE.md** (section 3)  
→ Consulter **VISUAL_INDEX.md** (Flux de données - Test Execution)  
→ Vérifier **NAVIGATION_GUIDE.md** (Module Dashboard)

#### 🤖 Je veux comprendre le chatbot
→ Lire **TECHNICAL_DEEP_DIVE.md** (section 4)  
→ Consulter **VISUAL_INDEX.md** (Architecture MCP)  
→ Vérifier **NAVIGATION_GUIDE.md** (Chatbot)

---

## 📂 STRUCTURE DES FICHIERS DE DOCUMENTATION

```
guardrails_AI_expert/
├─ 📄 INDEX_COMPLET.md              ← VOUS ÊTES ICI (point d'entrée)
├─ 📄 PROJECT_INDEX.md              (Index complet du projet)
├─ 📄 TECHNICAL_DEEP_DIVE.md        (Analyse technique approfondie)
├─ 📄 NAVIGATION_GUIDE.md           (Guide de navigation des modules)
├─ 📄 PROJECT_METRICS.md            (Métriques et statistiques)
├─ 📄 VISUAL_INDEX.md               (Diagrammes et visualisations)
├─ 📄 CLAUDE.md                     (Guide pour Claude Code)
├─ 📄 README.md                     (README original du projet)
└─ 📄 ARCHITECTURE.md               (Architecture détaillée - si existe)
```

---

## 🚀 DÉMARRAGE RAPIDE

### Pour les Développeurs

1. **Lire** : PROJECT_INDEX.md (sections 1-3)
2. **Consulter** : CLAUDE.md (commandes de développement)
3. **Installer** : `npm install`
4. **Configurer** : Créer `.env` avec `GEMINI_API_KEY=your_key`
5. **Lancer** : `npm run dev`
6. **Naviguer** : http://localhost:5080

### Pour les Architectes

1. **Lire** : TECHNICAL_DEEP_DIVE.md (toutes sections)
2. **Visualiser** : VISUAL_INDEX.md (tous diagrammes)
3. **Analyser** : PROJECT_METRICS.md (métriques clés)

### Pour les Product Owners

1. **Lire** : NAVIGATION_GUIDE.md (tous modules)
2. **Consulter** : PROJECT_METRICS.md (résumé exécutif)
3. **Vérifier** : PROJECT_METRICS.md (roadmap future)

### Pour les Auditeurs Sécurité

1. **Lire** : TECHNICAL_DEEP_DIVE.md (section 7)
2. **Consulter** : VISUAL_INDEX.md (flux de sécurité)
3. **Vérifier** : PROJECT_METRICS.md (sécurité & conformité)

---

## 📊 RÉSUMÉ EXÉCUTIF

### Identité du Projet
- **Nom** : AI Risk Manager (guardrails_AI_expert)
- **Type** : Single-Page Application (SPA) 100% client-side
- **Objectif** : Tester, gérer et gouverner la sécurité des systèmes IA
- **Frameworks** : OWASP LLM Top 10 (2025), OWASP Agentic AI Top 15, MITRE ATLAS

### Chiffres Clés
- **15 000+ lignes de code** (TypeScript + TSX)
- **46 composants React** (20 vues + 26 sous-composants)
- **16 Context Providers** (state management)
- **17 modules fonctionnels** (Dashboard, Analytics, etc.)
- **2245 risques IA** indexés (MIT AI Risk Repository v3.0)
- **195 prompts d'attaque** (6 familles)
- **120+ règles de politique IA** (5 chapitres)
- **100+ profils de menaces** (3 acteurs)
- **~280KB bundle gzip** (optimisé)

### Technologies
- **React 19.1.1** + **TypeScript 5.8.2**
- **Vite 6.2.0** (build tool)
- **Tailwind CSS** (styling)
- **Recharts 3.2.0** (graphiques)
- **@google/genai 1.19.0** (Gemini API)

### Points Forts
- ✅ **Privacy by Design** (100% client-side, no backend)
- ✅ **Couverture complète** (18 modules, 2245 risques)
- ✅ **Conformité** (OWASP, MITRE, AI Act, RGPD)
- ✅ **UX moderne** (chatbot IA, graphiques, recherche)
- ✅ **Extensibilité** (contexts modulaires, CRUD complet)

### Points d'Amélioration
- 🟡 **Tests** (aucun test unitaire/e2e)
- 🟡 **Performance** (pas de lazy loading, virtual scrolling)
- 🟡 **Sécurité** (localStorage non chiffré)
- 🟡 **Backend** (préparé mais non utilisé)
- 🟡 **Documentation** (manque JSDoc dans le code)

---

## 🔗 LIENS UTILES

### Documentation Externe
- [OWASP LLM Top 10 (2025)](https://genai.owasp.org/llm-top-10/)
- [OWASP Agentic AI Top 15](https://genai.owasp.org/agentic-ai-top-15/)
- [MITRE ATLAS](https://atlas.mitre.org/)
- [MIT AI Risk Repository](https://airisk.mit.edu/)
- [AI Act (EU)](https://artificialintelligenceact.eu/)
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)

### Ressources Internes
- [Gemini API Documentation](https://ai.google.dev/docs)
- [React 19 Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Recharts Documentation](https://recharts.org/)

---

## 📝 NOTES DE VERSION

### Version 3.0 (2025-03)
- ✅ Intégration Référentiel Risques IA (2245 entrées)
- ✅ 9 onglets de navigation (Causal, Domain, Database, etc.)
- ✅ Filtres avancés et recherche full-text
- ✅ Statistiques et ressources académiques (85)

### Version 2.0 (2025-Q1)
- ✅ Ajout modules Red Team (Revue, Résultats)
- ✅ Politique IA (5 chapitres, 120+ règles)
- ✅ Chatbot IA avec MCP (Model Context Protocol)
- ✅ Wiki Red Teamer (OWASP GenAI Red Teaming Guide)

### Version 1.0 (2024-Q4)
- ✅ Version initiale (tests guardrails)
- ✅ Dashboard, Analytics, Dataset Manager
- ✅ Cas d'Usage, Profils de Menaces
- ✅ Vulnérabilités et Incidents Connus

---

## 🎓 GLOSSAIRE

| Terme | Définition |
|-------|------------|
| **Guardrail** | Mécanisme de sécurité pour contrôler les entrées/sorties d'un LLM |
| **Prompt Injection** | Attaque visant à manipuler le comportement d'un LLM via le prompt |
| **RAG** | Retrieval-Augmented Generation (génération augmentée par récupération) |
| **MCP** | Model Context Protocol (protocole de contexte pour chatbot) |
| **Agentic AI** | Système IA autonome capable d'actions et de décisions |
| **Red Teaming** | Simulation d'attaques pour tester la sécurité |
| **OWASP** | Open Web Application Security Project |
| **MITRE ATLAS** | Adversarial Threat Landscape for AI Systems |
| **CVE** | Common Vulnerabilities and Exposures |
| **CWE** | Common Weakness Enumeration |

---

## 📞 CONTACT & SUPPORT

Pour toute question ou contribution :
- **GitHub** : [abk1969/guardrails_AI_expert](https://github.com/abk1969/guardrails_AI_expert)
- **Email** : globacom3000@gmail.com
- **Licence** : CC BY-SA 4.0 (OWASP Content)

---

## ✅ CHECKLIST D'UTILISATION

### Pour Commencer
- [ ] Lire INDEX_COMPLET.md (ce fichier)
- [ ] Consulter PROJECT_INDEX.md (vue d'ensemble)
- [ ] Installer les dépendances (`npm install`)
- [ ] Configurer `.env` avec Gemini API key
- [ ] Lancer le serveur de dev (`npm run dev`)

### Pour Développer
- [ ] Lire TECHNICAL_DEEP_DIVE.md
- [ ] Consulter CLAUDE.md (conventions)
- [ ] Vérifier types.ts (définitions)
- [ ] Créer/modifier composants dans `/components`
- [ ] Créer/modifier contexts dans `/contexts`
- [ ] Tester localement

### Pour Déployer
- [ ] Exécuter `npm run build`
- [ ] Vérifier le bundle dans `/dist`
- [ ] Tester avec `npm run preview`
- [ ] Déployer sur Vercel/Netlify/autre

---

**FIN DE L'INDEX COMPLET**

**Dernière mise à jour** : 2025-01-XX  
**Version de la documentation** : 1.0  
**Statut** : ✅ Complet

