# 📊 MÉTRIQUES ET STATISTIQUES DU PROJET

**Date de génération** : 2025-01-XX  
**Projet** : AI Risk Manager (guardrails_AI_expert)

---

## 📈 MÉTRIQUES GLOBALES

### Taille du Projet

| Métrique | Valeur | Détails |
|----------|--------|---------|
| **Lignes de code totales** | ~15 000+ | Estimation (TS + TSX + CSS) |
| **Fichiers TypeScript** | 75+ | .ts + .tsx |
| **Fichiers de configuration** | 10+ | JSON, MD, config files |
| **Fichiers de documentation** | 14 | README, guides, architecture |
| **Fichiers de données** | 15+ | JSON, TS data files |

### Composants React

| Catégorie | Nombre | Fichiers |
|-----------|--------|----------|
| **Vues principales** | 20 | Dashboard, Analytics, DatasetManager, etc. |
| **Composants UI** | 6 | Card, Button, Modal, ProgressBar, Tooltip, Accordion |
| **Composants Chatbot** | 5 | Chatbot, ChatbotFab, ChatWindow, MessageBubble, CSS |
| **Composants Policy** | 3 | PolicyDashboard, PolicyChapter, PolicyRule |
| **Composants Repository** | 7 | CausalTaxonomy, DomainTaxonomy, RiskDatabase, etc. |
| **Composants Wiki** | 2 | WikiChecklist, WikiToolsTable |
| **Composants Modaux** | 3 | ResultDetailModal, TestTargetConfigModal, UseCaseFormModal |
| **TOTAL** | **46** | |

### Contexts (State Management)

| Context | Lignes estimées | LocalStorage | Données gérées |
|---------|-----------------|--------------|----------------|
| TestRunContext | ~150 | ✅ | Configuration, prompts, résultats |
| DatasetContext | ~100 | ✅ | 195 templates de prompts |
| UseCaseContext | ~80 | ✅ | 30 cas d'usage |
| ThreatProfileContext | ~80 | ✅ | 100+ profils de menaces |
| AttackSurfaceContext | ~100 | ✅ | Vecteurs, impacts, scénarios |
| SettingsContext | ~60 | ✅ | Configuration scoring |
| KnownVulnerabilitiesContext | ~80 | ✅ | CVE, OWASP |
| KnownIncidentsContext | ~80 | ✅ | Incidents historiques |
| IncidentReadinessContext | ~120 | ✅ | Questions, catégories, références |
| RedTeamContext | ~80 | ✅ | Questions Red Team |
| RedTeamResultsContext | ~120 | ✅ | Résultats, mitigations, roadmap |
| DefensesMitigationsContext | ~100 | ✅ | Matrice défenses, OWASP |
| AIThirdPartyQuestionsContext | ~80 | ✅ | Questionnaire fournisseurs |
| WikiContext | ~60 | ✅ | Checklists |
| AIPolicyContext | ~120 | ✅ | 5 chapitres, 100+ règles |
| AIRiskRepositoryContext | ~150 | ❌ | 2245 risques (read-only) |
| **TOTAL** | **~1540 lignes** | **15/16** | |

### Services

| Service | Lignes | Appels API | Rôle |
|---------|--------|------------|------|
| geminiService.ts | ~150 | ✅ Gemini | Génération prompts de test |
| testRunnerService.ts | ~200 | ❌ | Simulation exécution tests |
| sandboxService.ts | ~100 | ❌ | Évaluation locale |
| agenticService.ts | ~80 | ✅ Gemini | Assistant IA (MCP Server) |
| **TOTAL** | **~530 lignes** | **2/4** | |

### Fichiers de Données

| Fichier | Lignes | Taille estimée | Contenu |
|---------|--------|----------------|---------|
| constants.ts | 1082+ | ~100KB | Configuration globale |
| types.ts | 571 | ~50KB | Définitions TypeScript |
| aiPolicyContent.ts | 1400+ | ~150KB | Politique IA (5 chapitres) |
| aiRiskRepositoryContent.ts | ~300 | ~30KB | Taxonomies + import JSON |
| wikiContent.tsx | ~500 | ~50KB | Wiki OWASP |
| aiRiskDatabaseParsed.json | ~50000 | ~5MB | 2245 risques IA |
| **TOTAL** | **~53853 lignes** | **~5.4MB** | |

---

## 📚 CONTENU DU PROJET

### Bibliothèque d'Attaques

| Famille d'Attaque | Nombre de Prompts | Complexités |
|-------------------|-------------------|-------------|
| Injection de Prompt | 13 | Simple (5), Moyen (4), Sophistiqué (4) |
| Fuite d'Informations | 3 | Simple (1), Moyen (1), Sophistiqué (1) |
| Attaques par Évasion | 6 | Simple (2), Moyen (2), Sophistiqué (2) |
| Manipulation RAG | 3 | Moyen (1), Sophistiqué (2) |
| Empoisonnement Données | 2 | Moyen (1), Sophistiqué (1) |
| Prompts Personnalisés | Extensible | Variable |
| **TOTAL** | **195+** | |

### Cas d'Usage

| Niveau de Risque | Nombre | Exemples |
|------------------|--------|----------|
| Critique (16-25) | 8 | Jailbreak chatbot, Deepfake executive |
| Élevé (11-15) | 12 | Data exfiltration, Model poisoning |
| Moyen (6-10) | 7 | Bias in recommendations, Hallucinations |
| Faible (1-5) | 3 | Minor output errors |
| **TOTAL** | **30** | |

### Profils de Menaces

| Profil | Nombre d'Entrées | Catégories |
|--------|------------------|------------|
| External Adversary | 35+ | Deep Fakes, Phishing, OSINT |
| Model Deployer | 45+ | OWASP LLM Top 10, Agentic Top 15 |
| Model Provider | 25+ | Model Stealing, Inference, DoS |
| **TOTAL** | **100+** | |

### Politique IA

| Chapitre | Sections | Règles | Statuts |
|----------|----------|--------|---------|
| 1. Définitions | 3 | 0 | - |
| 2. Périmètre et Objet | 2 | 5 | Éditable |
| 3. Gouvernance | 4 | 15 | Éditable |
| 4. Exigences de Sécurité | 8 | 80+ | Éditable |
| 5. IA Génératives | 5 | 20+ | Éditable |
| **TOTAL** | **22** | **120+** | 4 statuts possibles |

### Référentiel Risques IA

| Taxonomie | Niveaux | Entrées | Source |
|-----------|---------|---------|--------|
| Causale | 4 | 2245 | MIT AI Risk Repository |
| Domaine | 2 | 7 domaines | MIT AI Risk Repository |
| Ressources | - | 85 | Références académiques |
| **TOTAL** | | **2245 risques** | Version 3.0 (26/03/2025) |

---

## 🔧 TECHNOLOGIES & DÉPENDANCES

### Dépendances de Production

| Package | Version | Utilisation |
|---------|---------|-------------|
| react | 19.1.1 | Framework UI |
| react-dom | 19.1.1 | Rendu DOM |
| @google/genai | 1.19.0 | Gemini API |
| lucide-react | 0.543.0 | Icônes |
| recharts | 3.2.0 | Graphiques |
| **TOTAL** | **5 packages** | |

### Dépendances de Développement

| Package | Version | Utilisation |
|---------|---------|-------------|
| typescript | 5.8.2 | Langage |
| vite | 6.2.0 | Build tool |
| @vitejs/plugin-react | 5.0.0 | Plugin Vite |
| @types/node | 22.14.0 | Types Node.js |
| xlsx | 0.18.5 | Extraction Excel |
| **TOTAL** | **5 packages** | |

### Taille du Bundle (Estimée)

| Composant | Taille | Compression |
|-----------|--------|-------------|
| Vendor (React, Recharts, etc.) | ~500KB | ~150KB gzip |
| Application code | ~300KB | ~80KB gzip |
| Data (constants, policy, etc.) | ~200KB | ~50KB gzip |
| **TOTAL** | **~1MB** | **~280KB gzip** |

---

## 📊 STATISTIQUES DE DÉVELOPPEMENT

### Complexité du Code

| Métrique | Valeur | Commentaire |
|----------|--------|-------------|
| Profondeur max imbrication | 16 | Context Providers dans App.tsx |
| Nombre de types/interfaces | 80+ | types.ts |
| Nombre d'enums | 8 | GuardrailCategory, AttackFamily, etc. |
| Nombre de constants | 30+ | constants.ts |
| Hooks personnalisés | 17 | 16 useContext + 1 useAllContexts |

### Couverture Fonctionnelle

| Module | Fonctionnalités | Statut |
|--------|-----------------|--------|
| Tests Guardrails | Configuration, Exécution, Résultats | ✅ Complet |
| Analytics | Graphiques, Tendances | ✅ Complet |
| Dataset Manager | CRUD Prompts | ✅ Complet |
| Cas d'Usage | CRUD, Scoring | ✅ Complet |
| Profils de Menaces | CRUD | ✅ Complet |
| Surface d'Attaque | Configuration | ✅ Complet |
| Vulnérabilités | CRUD, Mapping OWASP | ✅ Complet |
| Incidents | CRUD, Ressources | ✅ Complet |
| Préparation Incidents | Questionnaire | ✅ Complet |
| Red Team | Questionnaire, Résultats | ✅ Complet |
| Défenses | Matrice, OWASP | ✅ Complet |
| Tiers IA | Questionnaire | ✅ Complet |
| Wiki | Checklists, Recherche | ✅ Complet |
| Politique IA | CRUD Règles, Export/Import | ✅ Complet |
| Référentiel Risques | Taxonomies, Base de données | 🟡 Partiel (Stats à enrichir) |
| Chatbot | MCP, Drag & Resize | ✅ Complet |

---

## 🎨 DESIGN SYSTEM

### Palette de Couleurs

| Couleur | Hex | Utilisation |
|---------|-----|-------------|
| Background Principal | #111827 (gray-900) | Fond de page |
| Background Secondaire | #1f2937 (gray-800) | Cartes, modales |
| Bordures | #374151 (gray-700) | Séparateurs |
| Texte Principal | #e5e7eb (gray-200) | Texte normal |
| Texte Secondaire | #9ca3af (gray-400) | Labels, descriptions |
| Accent Principal | #06b6d4 (cyan-500) | Boutons, liens |
| Accent Hover | #22d3ee (cyan-400) | Hover states |
| Succès | #10b981 (green-500) | Tests passés |
| Erreur | #ef4444 (red-500) | Tests échoués |
| Avertissement | #f59e0b (amber-500) | Alertes |

### Composants UI

| Composant | Variants | Props |
|-----------|----------|-------|
| Button | primary, secondary, danger | isLoading, disabled |
| Card | - | className |
| Modal | - | isOpen, onClose, title, footer |
| ProgressBar | - | value (0-100) |
| Tooltip | - | content, children |
| Accordion | - | title, defaultOpen |

---

## 🔐 SÉCURITÉ & CONFORMITÉ

### Frameworks de Référence

| Framework | Version | Couverture |
|-----------|---------|------------|
| OWASP LLM Top 10 | 2025 | ✅ Complet (10 vulnérabilités) |
| OWASP Agentic AI Top 15 | 2025 | ✅ Complet (15 menaces) |
| MITRE ATLAS | - | 🟡 Partiel (mappings) |
| AI Act (EU) | 2024 | ✅ Politique IA conforme |
| RGPD | - | ✅ Privacy by Design |

### Principes de Sécurité Implémentés

| Principe | Implémentation | Statut |
|----------|----------------|--------|
| Privacy by Design | 100% client-side, no backend | ✅ |
| Data Minimization | Aucune donnée envoyée sauf Gemini API | ✅ |
| Encryption in Transit | HTTPS pour Gemini API | ✅ |
| Encryption at Rest | LocalStorage (non chiffré) | 🟡 |
| Input Validation | Validation formulaires | ✅ |
| Output Sanitization | Pas de dangerouslySetInnerHTML | ✅ |
| Error Handling | Try-catch sur tous les appels API | ✅ |
| Audit Logging | Historique tests (localStorage) | 🟡 |

---

## 📈 PERFORMANCE

### Métriques Estimées

| Métrique | Valeur | Cible |
|----------|--------|-------|
| First Contentful Paint | ~1.5s | <2s |
| Time to Interactive | ~2.5s | <3s |
| Bundle Size (gzip) | ~280KB | <500KB |
| LocalStorage Usage | ~1.7MB | <5MB |
| Memory Usage | ~50MB | <100MB |

### Optimisations Implémentées

| Optimisation | Technique | Impact |
|--------------|-----------|--------|
| Code Splitting | Vite automatic | ✅ Moyen |
| Lazy Loading | React.lazy (non utilisé) | ❌ |
| Memoization | useMemo, useCallback | ✅ Élevé |
| Pagination | 50 items/page | ✅ Élevé |
| Debouncing | Recherche (non implémenté) | 🟡 |
| Virtual Scrolling | Non implémenté | ❌ |

---

## 🚀 ÉVOLUTION DU PROJET

### Historique des Versions

| Version | Date | Changements Majeurs |
|---------|------|---------------------|
| 1.0 | 2024-Q4 | Version initiale (tests guardrails) |
| 2.0 | 2025-Q1 | Ajout modules Red Team, Politique IA |
| 3.0 | 2025-03 | Intégration Référentiel Risques IA (2245 entrées) |

### Roadmap Future

| Fonctionnalité | Priorité | Statut |
|----------------|----------|--------|
| Backend NestJS | Moyenne | 🟡 Préparé (non utilisé) |
| Authentification | Moyenne | ❌ Non implémenté |
| Multi-utilisateurs | Faible | ❌ Non implémenté |
| Export PDF | Élevée | 🟡 Partiel (JSON uniquement) |
| Graphiques avancés (Stats) | Élevée | 🟡 À enrichir |
| Tests unitaires | Moyenne | ❌ Non implémenté |
| CI/CD | Moyenne | ❌ Non implémenté |
| Docker | Faible | 🟡 docker-compose.yml présent |

---

## 📊 RÉSUMÉ EXÉCUTIF

### Points Forts
- ✅ **Architecture 100% client-side** - Privacy by Design
- ✅ **Couverture complète** - 18 modules fonctionnels
- ✅ **Données riches** - 2245 risques, 195 prompts, 100+ règles
- ✅ **Conformité** - OWASP, MITRE, AI Act, RGPD
- ✅ **UX moderne** - Chatbot IA, graphiques, recherche
- ✅ **Extensibilité** - Contexts modulaires, CRUD complet

### Points d'Amélioration
- 🟡 **Tests** - Aucun test unitaire/e2e
- 🟡 **Performance** - Pas de lazy loading, virtual scrolling
- 🟡 **Sécurité** - LocalStorage non chiffré
- 🟡 **Backend** - Préparé mais non utilisé
- 🟡 **Documentation** - Manque JSDoc dans le code

### Métriques Clés
- **46 composants React**
- **16 Context Providers**
- **15 000+ lignes de code**
- **2245 risques IA indexés**
- **195 prompts d'attaque**
- **100+ règles de politique**
- **~280KB bundle gzip**

---

**FIN DES MÉTRIQUES DU PROJET**

