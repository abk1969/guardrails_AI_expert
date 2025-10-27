# 📊 INDEX COMPLET DU PROJET - AI RISK MANAGER

**Date de génération** : 2025-01-XX  
**Version** : 3.0  
**Auteur** : Abbas BENTERKI / Globacom3000

---

## 🎯 VUE D'ENSEMBLE

### Identité du Projet
- **Nom** : AI Risk Manager (guardrails_AI_expert)
- **Type** : Single-Page Application (SPA) 100% client-side
- **Objectif** : Plateforme complète de test, gestion et gouvernance de la sécurité des systèmes d'IA
- **Langue** : Français (UI et contenu)
- **Licence** : Propriétaire (Copyright © 2025 Globacom3000)

### Technologies Principales
- **Framework** : React 19.1.1 + TypeScript 5.8.2
- **Build Tool** : Vite 6.2.0
- **Styling** : Tailwind CSS (utility-first)
- **Icônes** : Lucide React 0.543.0
- **Graphiques** : Recharts 3.2.0
- **IA SDK** : @google/genai 1.19.0 (Gemini API)
- **État** : React Context API (16 providers)

### Architecture Clé
```
100% Client-Side → No Backend Server
Privacy by Design → No External Data Transmission (sauf Gemini API)
Ephemeral State → Test results in memory only
Local Persistence → Configuration in localStorage
```

---

## 📁 STRUCTURE DU PROJET

### Arborescence Racine
```
guardrails_AI_expert/
├── components/          # 29 composants React + 4 sous-dossiers
├── contexts/           # 16 Context Providers
├── services/           # 4 services métier
├── data/              # 3 fichiers de données statiques
├── data_ai_risk/      # Données Excel + 12 fichiers JSON extraits
├── hooks/             # 1 custom hook (useAllContexts)
├── backend/           # Architecture NestJS (non utilisée en prod)
├── scripts/           # 1 script d'extraction Excel
├── types.ts           # 571 lignes de définitions TypeScript
├── constants.ts       # 1082+ lignes de configuration
├── App.tsx            # Composant racine avec 16 providers imbriqués
├── index.tsx          # Point d'entrée React
├── index.html         # Template HTML
├── vite.config.ts     # Configuration Vite
├── tsconfig.json      # Configuration TypeScript
├── package.json       # Dépendances npm
└── 10+ fichiers README/documentation
```

---

## 🧩 COMPOSANTS (29 fichiers)

### Composants Principaux (20 vues)
| Fichier | Description | Contexte utilisé |
|---------|-------------|------------------|
| `Dashboard.tsx` | Orchestrateur principal (Home/Config/Live/Results) | TestRunContext |
| `DashboardHome.tsx` | Tableau de bord avec métriques et historique | TestRunContext |
| `Analytics.tsx` | Graphiques et analyses de tendances | TestRunContext |
| `DatasetManager.tsx` | Gestion bibliothèque d'attaques (195 prompts) | DatasetContext |
| `AdvancedScenarios.tsx` | Scénarios d'attaque sophistiqués | DatasetContext |
| `LiveTestView.tsx` | Exécution de tests en temps réel | TestRunContext |
| `RealTimeResults.tsx` | Résultats détaillés avec filtres | TestRunContext |
| `TestConfiguration.tsx` | Configuration des tests (cibles, volume, sensibilité) | TestRunContext, DatasetContext |
| `UseCasesView.tsx` | Gestion des 30 cas d'usage | UseCaseContext |
| `ThreatProfileView.tsx` | Profils de menaces (3 profils, 100+ entrées) | ThreatProfileContext |
| `AttackSurfaceAnalysisView.tsx` | Analyse surface d'attaque | AttackSurfaceContext |
| `KnownVulnerabilitiesView.tsx` | Vulnérabilités connues (CVE, OWASP) | KnownVulnerabilitiesContext |
| `KnownIncidentsView.tsx` | Incidents IA historiques | KnownIncidentsContext |
| `IncidentReadinessView.tsx` | Préparation aux incidents (questionnaire) | IncidentReadinessContext |
| `RedTeamSecurityView.tsx` | Revue Red Team (questionnaire) | RedTeamContext |
| `RedTeamResultsView.tsx` | Résultats Red Team + roadmap | RedTeamResultsContext |
| `DefensesMitigationsView.tsx` | Matrice défenses/mitigations (20 entrées) | DefensesMitigationsContext |
| `AIThirdPartyQuestionsView.tsx` | Questionnaire fournisseurs IA | AIThirdPartyQuestionsContext |
| `WikiRedTeamerView.tsx` | Wiki OWASP GenAI Red Teaming | WikiContext |
| `AIPolicyView.tsx` | Politique IA (5 chapitres, 100+ règles) | AIPolicyContext |
| `AIRiskRepositoryView.tsx` | Référentiel risques IA (2245 entrées) | AIRiskRepositoryContext |

### Composants Modaux/Utilitaires (9 fichiers)
- `ResultDetailModal.tsx` - Détails d'un résultat de test
- `TestTargetConfigurationModal.tsx` - Configuration cible API
- `UseCaseFormModal.tsx` - Formulaire cas d'usage
- `TestProcessExplainer.tsx` - Explication du processus de test
- `Sidebar.tsx` - Navigation latérale (17 items)

### Sous-dossiers Composants

#### `/components/ui` (6 composants réutilisables)
- `Card.tsx` - Conteneur stylisé
- `Button.tsx` - Bouton avec variants (primary, secondary, danger)
- `Modal.tsx` - Fenêtre modale
- `ProgressBar.tsx` - Barre de progression
- `Tooltip.tsx` - Info-bulle
- `Accordion.tsx` - Accordéon pliable

#### `/components/chatbot` (5 fichiers)
- `Chatbot.tsx` - Chatbot principal (draggable, resizable)
- `ChatbotFab.tsx` - Bouton flottant
- `ChatWindow.tsx` - Fenêtre de chat (alternative)
- `MessageBubble.tsx` - Bulles de messages
- `Chatbot.css` - Styles spécifiques

#### `/components/policy` (3 fichiers)
- `PolicyDashboard.tsx` - Dashboard politique IA
- `PolicyChapter.tsx` - Chapitre de politique
- `PolicyRule.tsx` - Règle de politique éditable

#### `/components/repository` (7 fichiers)
- `ContentsView.tsx` - Table des matières
- `CausalTaxonomyView.tsx` - Taxonomie causale (arbre interactif)
- `DomainTaxonomyView.tsx` - Taxonomie domaine (7 domaines)
- `RiskDatabaseView.tsx` - Base de données (2245 risques, filtres, pagination)
- `RiskDatabaseExplainerView.tsx` - Explication méthodologie
- `StatisticsView.tsx` - Statistiques (à enrichir)
- `IncludedResourcesView.tsx` - Ressources (85 entrées)

#### `/components/wiki` (2 fichiers)
- `WikiChecklist.tsx` - Checklists interactives
- `WikiToolsTable.tsx` - Tableau outils et datasets

---

## 🔄 CONTEXTS (16 providers)

| Context | Fichier | Données gérées | LocalStorage Key |
|---------|---------|----------------|------------------|
| TestRunContext | `TestRunContext.tsx` | Configuration, prompts, résultats, état test | `llmGuardrailTestHistory` |
| DatasetContext | `DatasetContext.tsx` | 195 templates de prompts d'attaque | `llmGuardrailDataset` |
| UseCaseContext | `UseCaseContext.tsx` | 30 cas d'usage avec scoring | `llmGuardrailUseCases` |
| ThreatProfileContext | `ThreatProfileContext.tsx` | 3 profils de menaces (100+ entrées) | `llmGuardrailThreatProfiles` |
| AttackSurfaceContext | `AttackSurfaceContext.tsx` | Vecteurs, impacts, scénarios nucléaires | `llmGuardrailAttackSurface` |
| SettingsContext | `SettingsContext.tsx` | Configuration scoring (impact/likelihood) | `llmGuardrailScoringSettings` |
| KnownVulnerabilitiesContext | `KnownVulnerabilitiesContext.tsx` | Vulnérabilités CVE/OWASP | `llmGuardrailKnownVulnerabilities` |
| KnownIncidentsContext | `KnownIncidentsContext.tsx` | Incidents IA + ressources | `llmGuardrailKnownIncidents` |
| IncidentReadinessContext | `IncidentReadinessContext.tsx` | Questions, catégories, références | `llmGuardrailIncidentReadiness` |
| RedTeamContext | `RedTeamContext.tsx` | Questions Red Team + objectif business | `llmGuardrailRedTeam` |
| RedTeamResultsContext | `RedTeamResultsContext.tsx` | Résultats, mitigations, roadmap | `llmGuardrailRedTeamResults` |
| DefensesMitigationsContext | `DefensesMitigationsContext.tsx` | Matrice défenses, OWASP Top 10/15 | `llmGuardrailDefensesMitigations` |
| AIThirdPartyQuestionsContext | `AIThirdPartyQuestionsContext.tsx` | Questionnaire fournisseurs | `llmGuardrailAIThirdPartyQuestions` |
| WikiContext | `WikiContext.tsx` | État checklists Wiki | `llmGuardrailWikiChecklists` |
| AIPolicyContext | `AIPolicyContext.tsx` | 5 chapitres, 100+ règles | `llmGuardrailAIPolicy` |
| AIRiskRepositoryContext | `AIRiskRepositoryContext.tsx` | 2245 risques, taxonomies, filtres | Aucun (read-only) |

### Hiérarchie des Providers (App.tsx)
```tsx
<AIPolicyProvider>
  <AIRiskRepositoryProvider>
    <WikiProvider>
      <DatasetProvider>
        <TestRunProvider>
          <SettingsProvider>
            <UseCaseProvider>
              <ThreatProfileProvider>
                <AttackSurfaceProvider>
                  <KnownVulnerabilitiesProvider>
                    <KnownIncidentsProvider>
                      <IncidentReadinessProvider>
                        <RedTeamProvider>
                          <RedTeamResultsProvider>
                            <DefensesMitigationsProvider>
                              <AIThirdPartyQuestionsProvider>
                                {/* Application */}
                              </AIThirdPartyQuestionsProvider>
                            </DefensesMitigationsProvider>
                          </RedTeamResultsProvider>
                        </RedTeamProvider>
                      </IncidentReadinessProvider>
                    </KnownIncidentsProvider>
                  </KnownVulnerabilitiesProvider>
                </AttackSurfaceProvider>
              </ThreatProfileProvider>
            </UseCaseProvider>
          </SettingsProvider>
        </TestRunProvider>
      </DatasetProvider>
    </WikiProvider>
  </AIRiskRepositoryProvider>
</AIPolicyProvider>
```

---

## ⚙️ SERVICES (4 fichiers)

### `geminiService.ts`
**Rôle** : Génération de prompts de test via Gemini API  
**Fonctions** :
- `generateTestPrompts()` - Appel Gemini 2.5 Flash avec structured output
- `mockGenerateTestPrompts()` - Fallback offline
**Modèle** : `gemini-2.0-flash-exp`  
**Technique** : Few-shot prompting (5 exemples max)

### `testRunnerService.ts`
**Rôle** : Simulation d'exécution de tests  
**Fonctions** :
- `mockTestRunner()` - Simule tests avec callbacks de progression
- `calculateFailureProbability()` - Calcul risque (complexité × sensibilité)
- `createEvaluationStep()` - Crée étapes d'évaluation timestampées
**Chaîne d'évaluation** : 6 étapes (Pre-LLM, API Call, Post-LLM, etc.)

### `sandboxService.ts`
**Rôle** : Évaluation locale sans API externe  
**Fonctions** :
- `evaluatePromptInSandbox()` - Évaluation basée sur tags
**Logique** : Matching tags de vulnérabilité (Simple/Moyenne/Complexe)

### `agenticService.ts`
**Rôle** : "MCP Server" - Assistant IA conversationnel  
**Fonctions** :
- `runAgenticQuery()` - Interroge Gemini avec contexte complet app
**Modèle** : `gemini-2.0-flash-exp`  
**Contexte** : Snapshot complet de tous les contexts (via `useAllContexts`)

---

## 📊 DONNÉES

### `constants.ts` (1082+ lignes)
**Contenu** :
- `GUARDRAIL_CATEGORIES` (5 catégories)
- `ATTACK_FAMILIES` (6 familles)
- `COMPONENT_TYPE_TEMPLATES` (7 types d'IA)
- `INITIAL_TEST_TARGETS` (3 cibles pré-configurées)
- `ATTACK_LIBRARY` (195 prompts d'attaque détaillés)
- `REMEDIATION_SUGGESTIONS` (par catégorie)
- `INITIAL_USE_CASES` (30 cas d'usage)
- `INITIAL_THREAT_PROFILES` (100+ entrées, 3 profils)
- `INITIAL_ATTACK_SURFACE_VECTORS` (10+ vecteurs)
- `INITIAL_ORGANIZATIONAL_IMPACT_CONFIG` (5 niveaux)
- `INITIAL_NUCLEAR_DISASTER_SCENARIOS` (3 scénarios)
- `INITIAL_SCORING_SETTINGS` (impact/likelihood)
- `INITIAL_KNOWN_VULNERABILITIES` (CVE, OWASP)
- `INITIAL_KNOWN_INCIDENTS` (incidents historiques)
- `INITIAL_READINESS_QUESTIONS` (questionnaire préparation)
- `INITIAL_INCIDENT_CATEGORIES` (catégories incidents)
- `INITIAL_RED_TEAM_QUESTIONS` (questionnaire Red Team)
- `VULNERABILITY_REFERENCES` (OWASP LLM Top 10)
- `BUG_CROWD_SCORES` / `COMPASS_SCORES` (scoring)
- `INITIAL_DEFENSES_MITIGATIONS` (20 entrées)
- `OWASP_TOP_TEN_LLM_2025` (10 vulnérabilités)
- `OWASP_AGENTIC_TOP_15` (15 menaces)
- `INITIAL_AI_THIRD_PARTY_QUESTIONS` (questionnaire fournisseurs)
- `AI_POLICY_STATUS_OPTIONS` / `AI_POLICY_STATUS_COLORS`

### `data/aiPolicyContent.ts` (1400+ lignes)
**Contenu** : Politique IA complète (5 chapitres)
- Chapitre 1 : Définitions
- Chapitre 2 : Périmètre et Objet
- Chapitre 3 : Gouvernance et Responsabilités
- Chapitre 4 : Exigences de Sécurité (100+ règles)
- Chapitre 5 : Cas particulier des IA génératives

**Structure** : Chapitres → Sections → Règles éditables

### `data/aiRiskRepositoryContent.ts`
**Contenu** :
- Import de `aiRiskDatabaseParsed.json` (2245 risques)
- `CAUSAL_TAXONOMY_DATA` (taxonomie causale avec compteurs)
- `DOMAIN_TAXONOMY_DATA` (7 domaines)
- `DATABASE_EXPLAINER_CONTENT` (méthodologie)
- `RISK_DATABASE_EXAMPLES` (exemples)

### `data/wikiContent.tsx`
**Contenu** : Wiki OWASP GenAI Red Teaming
- Guide de démarrage rapide
- Blueprint (checklists interactives)
- Techniques essentielles
- Métriques
- Outils et datasets

### `data_ai_risk/extracted/` (12 fichiers JSON)
**Source** : Excel `AI Risk Repository V3_26_03_2025.xlsx`  
**Fichiers** :
- `ai_risk_database_v3.json` (2245 entrées) ⭐
- `causal_taxonomy_of_ai_risks_v3.json`
- `domain_taxonomy_of_ai_risks_v3.json`
- `ai_risk_database_explainer.json`
- `causal_taxonomy_statistics.json`
- `domain_taxonomy_statistics.json`
- `causal_x_domain_taxonomy_compar.json`
- `included_resources.json` (85 ressources)
- `resources_being_considered.json`
- `contents.json`
- `change_log.json`
- `_summary.json`

---

## 🔧 TYPES (types.ts - 571 lignes)

### Enums Principaux
- `GuardrailCategory` (5 valeurs)
- `AttackFamily` (6 valeurs)
- `PromptComplexity` (3 valeurs)
- `AIComponentType` (7 valeurs)
- `TestStatus` (4 valeurs)
- `AIPolicyRuleStatus` (4 valeurs)

### Interfaces Clés
- `PromptTemplate` - Template de prompt d'attaque
- `TestTarget` - Configuration cible API
- `TestConfiguration` - Configuration complète de test
- `TestPrompt` - Prompt généré pour test
- `TestResult` - Résultat avec évaluation chain
- `EvaluationStep` - Étape d'évaluation timestampée
- `HistoricalRun` - Run historique sauvegardé
- `UseCase` - Cas d'usage avec scoring
- `ThreatProfile` - Profil de menace
- `AttackSurfaceVector` - Vecteur d'attaque
- `KnownVulnerability` - Vulnérabilité CVE/OWASP
- `KnownAIIncident` - Incident IA historique
- `AIPolicyChapter` / `AIPolicyRule` - Politique IA
- `AIRiskEntry` - Entrée base de données risques
- `CausalTaxonomyNode` - Nœud taxonomie

---

## 🎨 STYLES

### Tailwind CSS
**Palette de couleurs** :
- Background : `gray-900` (principal), `gray-800` (cartes)
- Borders : `gray-700`
- Accent : `cyan-400`, `cyan-500`, `cyan-600`
- Text : `gray-200` (principal), `gray-400` (secondaire)

### CSS Personnalisés
- `LiveTestView.css` - Animations tests en temps réel
- `AIRiskRepository.css` - Styles taxonomie
- `WikiRedTeamer.css` - Styles wiki
- `Chatbot.css` - Styles chatbot (draggable, resizable)

---

## 🚀 SCRIPTS & CONFIGURATION

### Scripts npm
```json
"dev": "vite",           // Dev server sur port 5080
"build": "vite build",   // Build production
"preview": "vite preview" // Preview build
```

### Configuration Vite
- Port : 5080
- Host : 0.0.0.0
- Env vars : `GEMINI_API_KEY` injecté
- Alias : `@` → racine projet

### Configuration TypeScript
- Target : ES2022
- Module : ESNext
- JSX : react-jsx
- Decorators : Activés
- JSON import : Activé

---

## 📚 DOCUMENTATION (10+ fichiers)

- `README.md` - Documentation principale
- `README_TECHNICAL.md` - Documentation technique
- `README_ARCHITECTURE.md` - Architecture
- `README_AI_RISK_INTEGRATION.md` - Intégration référentiel risques
- `CLAUDE.md` - Guide pour Claude AI
- `AI_RISK_INTEGRATION_COMPLETE_GUIDE.md` - Guide complet intégration
- `AI_RISK_REPOSITORY_INTEGRATION_STATUS.md` - Statut intégration
- `ARCHITECTURE_FULLSTACK.md` - Architecture fullstack (backend)
- `MIGRATION_GUIDE.md` - Guide migration
- `README-AI-ACT.md` - Conformité AI Act
- `README-GDPR.md` - Conformité RGPD

---

## 🔐 SÉCURITÉ & CONFORMITÉ

### Frameworks de Référence
- **OWASP LLM Top 10 (2025)**
- **OWASP Agentic AI Top 15**
- **MITRE ATLAS**
- **AI Act (EU)**
- **RGPD**

### Principes de Sécurité
- Privacy by Design
- No backend server (100% client-side)
- API keys never leave browser
- Test results ephemeral (memory only)
- LocalStorage pour configuration uniquement

---

## 📈 MÉTRIQUES DU PROJET

- **Composants React** : 29 fichiers + 17 sous-composants = 46 total
- **Contexts** : 16 providers
- **Services** : 4 fichiers
- **Types** : 571 lignes
- **Constants** : 1082+ lignes
- **Prompts d'attaque** : 195 templates
- **Cas d'usage** : 30 scénarios
- **Profils de menaces** : 3 profils, 100+ entrées
- **Règles de politique** : 100+ règles éditables
- **Base de données risques** : 2245 entrées
- **Ressources** : 85 références académiques
- **Lignes de code estimées** : 15 000+ lignes

---

## 🎯 MODULES FONCTIONNELS (17 modules)

1. **Dashboard** - Configuration et lancement tests
2. **Analytics** - Analyses et graphiques
3. **Dataset Manager** - Bibliothèque d'attaques
4. **Scénarios Avancés** - Attaques sophistiquées
5. **Cas d'Usage** - Gestion scénarios
6. **Profils de Menaces** - 3 profils acteurs
7. **Surface d'Attaque** - Analyse vecteurs
8. **Paramètres** - Configuration scoring
9. **Vulnérabilités Connues** - CVE/OWASP
10. **Incidents Connus** - Historique incidents
11. **Préparation Incidents** - Questionnaire readiness
12. **Revue Red Team** - Questionnaire sécurité
13. **Résultats Red Team** - Résultats + roadmap
14. **Défenses/Mitigations** - Matrice défenses
15. **Questions Tiers IA** - Questionnaire fournisseurs
16. **Wiki Red Teamer** - Guide OWASP
17. **Politique IA** - 5 chapitres, 100+ règles
18. **Référentiel Risques IA** - 2245 risques, taxonomies

---

## 🔄 FLUX DE DONNÉES

### Test Execution Flow
```
1. Configuration (TestConfiguration.tsx)
   ↓
2. Génération Prompts (geminiService.ts)
   ↓
3. Exécution Tests (testRunnerService.ts)
   ↓
4. Évaluation (6-step chain)
   ↓
5. Résultats (RealTimeResults.tsx)
   ↓
6. Analytics (Analytics.tsx)
   ↓
7. LocalStorage (historique 20 derniers runs)
```

### MCP (Model Context Protocol) Flow
```
1. User Query (Chatbot.tsx)
   ↓
2. Collect Context (useAllContexts.ts) - MCP Client
   ↓
3. Send to Gemini (agenticService.ts) - MCP Server
   ↓
4. Response (MessageBubble.tsx)
```

---

## 🎨 DESIGN SYSTEM

### Composants UI Réutilisables
- Card, Button, Modal, ProgressBar, Tooltip, Accordion

### Patterns de Design
- Dark theme (gray-900 background)
- Cyan accents (#06b6d4)
- Lucide icons
- Responsive (mobile-first)
- Accessibility (ARIA labels)

---

## 🚧 BACKEND (Non utilisé en production)

### Architecture NestJS
- `/backend/apps/` - Microservices (API Gateway, Test Execution, Risk Management, AI Proxy)
- `/backend/libs/` - Bibliothèques partagées (Common, Database, Auth, Telemetry)
- `/backend/prisma/` - ORM (schema.prisma avec 20+ modèles)

**Note** : Le backend est préparé pour une future migration fullstack mais n'est pas utilisé actuellement.

---

## ✅ CHECKLIST COMPLÉTUDE

- [x] 29 composants React indexés
- [x] 16 contexts documentés
- [x] 4 services analysés
- [x] Types.ts (571 lignes) indexé
- [x] Constants.ts (1082+ lignes) indexé
- [x] 3 fichiers data/ indexés
- [x] 12 fichiers JSON extraits indexés
- [x] Configuration (vite, tsconfig, package.json) indexée
- [x] Documentation (10+ fichiers) listée
- [x] Architecture MCP documentée
- [x] Flux de données cartographié
- [x] Métriques calculées

---

**FIN DE L'INDEX - Projet entièrement indexé ✅**

