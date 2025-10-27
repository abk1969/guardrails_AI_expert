# 🎨 INDEX VISUEL - AI RISK MANAGER

**Diagrammes et visualisations de l'architecture du projet**

---

## 🏗️ ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NAVIGATEUR (CLIENT)                          │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    APPLICATION REACT                         │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │              App.tsx (Root Component)                 │  │   │
│  │  │                                                        │  │   │
│  │  │  ┌──────────────────────────────────────────────┐   │  │   │
│  │  │  │   16 Context Providers (Nested)              │   │  │   │
│  │  │  │   ├─ AIPolicyProvider                        │   │  │   │
│  │  │  │   │  ├─ AIRiskRepositoryProvider             │   │  │   │
│  │  │  │   │  │  ├─ WikiProvider                      │   │  │   │
│  │  │  │   │  │  │  ├─ DatasetProvider                │   │  │   │
│  │  │  │   │  │  │  │  ├─ TestRunProvider             │   │  │   │
│  │  │  │   │  │  │  │  │  └─ ... (11 more)            │   │  │   │
│  │  │  └──────────────────────────────────────────────┘   │  │   │
│  │  │                                                        │  │   │
│  │  │  ┌──────────────────────────────────────────────┐   │  │   │
│  │  │  │   Sidebar (17 navigation items)              │   │  │   │
│  │  │  └──────────────────────────────────────────────┘   │  │   │
│  │  │                                                        │  │   │
│  │  │  ┌──────────────────────────────────────────────┐   │  │   │
│  │  │  │   Active View Component                      │   │  │   │
│  │  │  │   (Dashboard, Analytics, etc.)               │   │  │   │
│  │  │  └──────────────────────────────────────────────┘   │  │   │
│  │  │                                                        │  │   │
│  │  │  ┌──────────────────────────────────────────────┐   │  │   │
│  │  │  │   Chatbot (Floating, Draggable)              │   │  │   │
│  │  │  └──────────────────────────────────────────────┘   │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │              Services Layer                           │  │   │
│  │  │  ├─ geminiService (Gemini API)                       │  │   │
│  │  │  ├─ testRunnerService (Simulation)                   │  │   │
│  │  │  ├─ sandboxService (Local Eval)                      │  │   │
│  │  │  └─ agenticService (MCP Server)                      │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │              Data Layer                               │  │   │
│  │  │  ├─ constants.ts (1082+ lines)                       │  │   │
│  │  │  ├─ types.ts (571 lines)                             │  │   │
│  │  │  ├─ aiPolicyContent.ts (1400+ lines)                 │  │   │
│  │  │  ├─ aiRiskRepositoryContent.ts                       │  │   │
│  │  │  └─ wikiContent.tsx                                  │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  │                                                               │   │
│  │  ┌──────────────────────────────────────────────────────┐  │   │
│  │  │              Persistence Layer                        │  │   │
│  │  │              localStorage (16 keys)                   │  │   │
│  │  └──────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                │ HTTPS
                                ▼
                    ┌───────────────────────┐
                    │   Google Gemini API   │
                    │  (gemini-2.0-flash)   │
                    └───────────────────────┘
```

---

## 🔄 FLUX DE DONNÉES - TEST EXECUTION

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX D'EXÉCUTION DE TEST                      │
└─────────────────────────────────────────────────────────────────┘

1. CONFIGURATION
   ┌──────────────────────────────────┐
   │  TestConfiguration.tsx           │
   │  ├─ Sélection catégories         │
   │  ├─ Choix cible (Sandbox/API)    │
   │  ├─ Volume (10-100)              │
   │  ├─ Sensibilité (T/N/S)          │
   │  └─ Complexités (S/M/So)         │
   └──────────────────────────────────┘
                │
                ▼
2. GÉNÉRATION PROMPTS
   ┌──────────────────────────────────┐
   │  geminiService.ts                │
   │  ├─ Appel Gemini API             │
   │  ├─ Few-shot prompting           │
   │  ├─ Structured output (JSON)     │
   │  └─ Fallback: mockGenerate       │
   └──────────────────────────────────┘
                │
                ▼
3. EXÉCUTION
   ┌──────────────────────────────────┐
   │  testRunnerService.ts            │
   │  ├─ Mode Sandbox OU Mock API     │
   │  ├─ Calcul probabilité échec     │
   │  ├─ Création chaîne évaluation   │
   │  └─ Callbacks progression        │
   └──────────────────────────────────┘
                │
                ▼
4. RÉSULTATS EN TEMPS RÉEL
   ┌──────────────────────────────────┐
   │  LiveTestView.tsx                │
   │  ├─ Barre progression animée     │
   │  ├─ Statistiques live            │
   │  └─ Liste résultats              │
   └──────────────────────────────────┘
                │
                ▼
5. ANALYSE RÉSULTATS
   ┌──────────────────────────────────┐
   │  RealTimeResults.tsx             │
   │  ├─ Résumé global                │
   │  ├─ Filtres                      │
   │  └─ Détails par résultat         │
   └──────────────────────────────────┘
                │
                ▼
6. PERSISTENCE
   ┌──────────────────────────────────┐
   │  localStorage                    │
   │  Key: llmGuardrailTestHistory    │
   │  Max: 20 derniers runs           │
   └──────────────────────────────────┘
                │
                ▼
7. ANALYTICS
   ┌──────────────────────────────────┐
   │  Analytics.tsx                   │
   │  ├─ Graphiques Recharts          │
   │  ├─ Tendances                    │
   │  └─ Comparaisons                 │
   └──────────────────────────────────┘
```

---

## 🤖 ARCHITECTURE MCP (MODEL CONTEXT PROTOCOL)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHATBOT MCP ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

USER INPUT
    │
    ▼
┌──────────────────────────────────┐
│  Chatbot.tsx                     │
│  ├─ User message                 │
│  ├─ Loading state                │
│  └─ Display response             │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│  MCP CLIENT                      │
│  useAllContexts.ts               │
│  ├─ Collect all contexts         │
│  ├─ Create snapshot              │
│  └─ Return JSON object           │
└──────────────────────────────────┘
    │
    │ Snapshot includes:
    │ ├─ useCases (30)
    │ ├─ threatProfiles (100+)
    │ ├─ attackSurface
    │ ├─ scoringSettings
    │ ├─ knownVulnerabilities
    │ ├─ knownIncidents
    │ ├─ incidentReadiness
    │ ├─ redTeamReview
    │ ├─ redTeamResults
    │ ├─ defensesAndMitigations
    │ ├─ aiThirdPartyQuestions
    │ ├─ aiPolicy (120+ rules)
    │ └─ attackLibrary (195 prompts)
    │
    ▼
┌──────────────────────────────────┐
│  MCP SERVER                      │
│  agenticService.ts               │
│  ├─ Receive user prompt          │
│  ├─ Receive app context          │
│  ├─ Build full prompt            │
│  └─ Call Gemini API              │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│  GEMINI API                      │
│  gemini-2.0-flash-exp            │
│  ├─ Process prompt + context     │
│  ├─ Generate response            │
│  └─ Return text                  │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│  Chatbot.tsx                     │
│  ├─ Display bot message          │
│  └─ Ready for next input         │
└──────────────────────────────────┘
```

---

## 📊 HIÉRARCHIE DES COMPOSANTS

```
App.tsx
├─ Sidebar
│  └─ 17 NavItems
│
├─ Active View (one of):
│  ├─ Dashboard
│  │  ├─ DashboardHome
│  │  │  ├─ DashboardSummaryCard
│  │  │  ├─ TestProcessExplainer
│  │  │  └─ RecentRunsCard
│  │  ├─ TestConfiguration
│  │  │  └─ TestTargetConfigurationModal
│  │  ├─ LiveTestView
│  │  └─ RealTimeResults
│  │     └─ ResultDetailModal
│  │
│  ├─ Analytics
│  │  ├─ LineChart (Recharts)
│  │  ├─ BarChart (Recharts)
│  │  └─ Top Failed Prompts List
│  │
│  ├─ DatasetManager
│  │  ├─ PromptItem (×195)
│  │  └─ AddPromptForm
│  │
│  ├─ AdvancedScenarios
│  │  └─ ScenarioSection (×5)
│  │
│  ├─ UseCasesView
│  │  └─ UseCaseFormModal
│  │
│  ├─ ThreatProfileView
│  │  └─ Table (100+ rows)
│  │
│  ├─ AttackSurfaceAnalysisView
│  │  ├─ Attack Vectors Table
│  │  ├─ Impact Config Table
│  │  └─ Nuclear Scenarios Table
│  │
│  ├─ SettingsView
│  │  ├─ Impact Scores Table
│  │  └─ Likelihood Scores Table
│  │
│  ├─ KnownVulnerabilitiesView
│  │  └─ Vulnerabilities Table
│  │
│  ├─ KnownIncidentsView
│  │  ├─ Incidents Table
│  │  └─ Resource Links Table
│  │
│  ├─ IncidentReadinessView
│  │  ├─ Questions Table
│  │  ├─ Categories Table
│  │  └─ Monitoring References Table
│  │
│  ├─ RedTeamSecurityView
│  │  ├─ Business Objective Input
│  │  └─ Questions Table (50+)
│  │
│  ├─ RedTeamResultsView
│  │  ├─ Results Table
│  │  ├─ Mitigation Profiles
│  │  ├─ Mitigation Mappings Table
│  │  └─ Strategy Roadmap Table
│  │
│  ├─ DefensesMitigationsView
│  │  ├─ Defenses Matrix Table (20 rows)
│  │  ├─ OWASP LLM Top 10 Accordion
│  │  └─ OWASP Agentic Top 15 Accordion
│  │
│  ├─ AIThirdPartyQuestionsView
│  │  └─ Questions Table (50+)
│  │
│  ├─ WikiRedTeamerView
│  │  ├─ Sidebar Navigation
│  │  ├─ QuickStartContent
│  │  ├─ BlueprintContent
│  │  │  └─ WikiChecklist
│  │  ├─ TechniquesContent
│  │  ├─ MetricsContent
│  │  └─ ToolsAndDatasetsContent
│  │     └─ WikiToolsTable
│  │
│  ├─ AIPolicyView
│  │  ├─ PolicyDashboard
│  │  │  ├─ Stats Cards
│  │  │  └─ PieChart (Recharts)
│  │  └─ PolicyChapter (×5)
│  │     ├─ Accordion
│  │     └─ PolicyRule (×120+)
│  │
│  └─ AIRiskRepositoryView
│     ├─ Tab Navigation (9 tabs)
│     ├─ ContentsView
│     ├─ CausalTaxonomyView
│     │  └─ TaxonomyNode (recursive)
│     ├─ DomainTaxonomyView
│     │  └─ TaxonomyNode (recursive)
│     ├─ RiskDatabaseView
│     │  ├─ Search Input
│     │  ├─ Filters Panel
│     │  ├─ Statistics Summary
│     │  ├─ Risks List (paginated)
│     │  └─ Risk Detail Modal
│     ├─ RiskDatabaseExplainerView
│     ├─ StatisticsView
│     └─ IncludedResourcesView
│
└─ Chatbot (Floating)
   ├─ ChatbotFab (when closed)
   └─ Chatbot (when open)
      ├─ Header (draggable)
      ├─ MessageList
      │  └─ MessageBubble (×N)
      ├─ Input Form
      └─ Resize Handle
```

---

## 🗂️ STRUCTURE DES FICHIERS

```
guardrails_AI_expert/
│
├─ 📁 components/
│  ├─ 📄 Dashboard.tsx
│  ├─ 📄 DashboardHome.tsx
│  ├─ 📄 Analytics.tsx
│  ├─ 📄 DatasetManager.tsx
│  ├─ 📄 AdvancedScenarios.tsx
│  ├─ 📄 UseCasesView.tsx
│  ├─ 📄 ThreatProfileView.tsx
│  ├─ 📄 AttackSurfaceAnalysisView.tsx
│  ├─ 📄 SettingsView.tsx
│  ├─ 📄 KnownVulnerabilitiesView.tsx
│  ├─ 📄 KnownIncidentsView.tsx
│  ├─ 📄 IncidentReadinessView.tsx
│  ├─ 📄 RedTeamSecurityView.tsx
│  ├─ 📄 RedTeamResultsView.tsx
│  ├─ 📄 DefensesMitigationsView.tsx
│  ├─ 📄 AIThirdPartyQuestionsView.tsx
│  ├─ 📄 WikiRedTeamerView.tsx
│  ├─ 📄 AIPolicyView.tsx
│  ├─ 📄 AIRiskRepositoryView.tsx
│  ├─ 📄 LiveTestView.tsx
│  ├─ 📄 RealTimeResults.tsx
│  ├─ 📄 TestConfiguration.tsx
│  ├─ 📄 TestProcessExplainer.tsx
│  ├─ 📄 ResultDetailModal.tsx
│  ├─ 📄 TestTargetConfigurationModal.tsx
│  ├─ 📄 UseCaseFormModal.tsx
│  ├─ 📄 Sidebar.tsx
│  │
│  ├─ 📁 ui/
│  │  ├─ 📄 Card.tsx
│  │  ├─ 📄 Button.tsx
│  │  ├─ 📄 Modal.tsx
│  │  ├─ 📄 ProgressBar.tsx
│  │  ├─ 📄 Tooltip.tsx
│  │  └─ 📄 Accordion.tsx
│  │
│  ├─ 📁 chatbot/
│  │  ├─ 📄 Chatbot.tsx
│  │  ├─ 📄 ChatbotFab.tsx
│  │  ├─ 📄 ChatWindow.tsx
│  │  ├─ 📄 MessageBubble.tsx
│  │  └─ 📄 Chatbot.css
│  │
│  ├─ 📁 policy/
│  │  ├─ 📄 PolicyDashboard.tsx
│  │  ├─ 📄 PolicyChapter.tsx
│  │  └─ 📄 PolicyRule.tsx
│  │
│  ├─ 📁 repository/
│  │  ├─ 📄 ContentsView.tsx
│  │  ├─ 📄 CausalTaxonomyView.tsx
│  │  ├─ 📄 DomainTaxonomyView.tsx
│  │  ├─ 📄 RiskDatabaseView.tsx
│  │  ├─ 📄 RiskDatabaseExplainerView.tsx
│  │  ├─ 📄 StatisticsView.tsx
│  │  └─ 📄 IncludedResourcesView.tsx
│  │
│  └─ 📁 wiki/
│     ├─ 📄 WikiChecklist.tsx
│     └─ 📄 WikiToolsTable.tsx
│
├─ 📁 contexts/
│  ├─ 📄 TestRunContext.tsx
│  ├─ 📄 DatasetContext.tsx
│  ├─ 📄 UseCaseContext.tsx
│  ├─ 📄 ThreatProfileContext.tsx
│  ├─ 📄 AttackSurfaceContext.tsx
│  ├─ 📄 SettingsContext.tsx
│  ├─ 📄 KnownVulnerabilitiesContext.tsx
│  ├─ 📄 KnownIncidentsContext.tsx
│  ├─ 📄 IncidentReadinessContext.tsx
│  ├─ 📄 RedTeamContext.tsx
│  ├─ 📄 RedTeamResultsContext.tsx
│  ├─ 📄 DefensesMitigationsContext.tsx
│  ├─ 📄 AIThirdPartyQuestionsContext.tsx
│  ├─ 📄 WikiContext.tsx
│  ├─ 📄 AIPolicyContext.tsx
│  └─ 📄 AIRiskRepositoryContext.tsx
│
├─ 📁 services/
│  ├─ 📄 geminiService.ts
│  ├─ 📄 testRunnerService.ts
│  ├─ 📄 sandboxService.ts
│  └─ 📄 agenticService.ts
│
├─ 📁 data/
│  ├─ 📄 aiPolicyContent.ts
│  ├─ 📄 aiRiskRepositoryContent.ts
│  ├─ 📄 wikiContent.tsx
│  ├─ 📄 aiRiskDatabaseParsed.json
│  └─ 📄 aiRiskRepositoryDataFull.ts
│
├─ 📁 hooks/
│  └─ 📄 useAllContexts.ts
│
├─ 📄 App.tsx
├─ 📄 index.tsx
├─ 📄 types.ts
├─ 📄 constants.ts
├─ 📄 vite.config.ts
├─ 📄 tsconfig.json
└─ 📄 package.json
```

---

## 🔐 FLUX DE SÉCURITÉ

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRINCIPES DE SÉCURITÉ                         │
└─────────────────────────────────────────────────────────────────┘

1. PRIVACY BY DESIGN
   ┌──────────────────────────────────┐
   │  100% Client-Side                │
   │  ├─ No Backend Server            │
   │  ├─ No Database                  │
   │  └─ No User Data Transmission    │
   └──────────────────────────────────┘

2. DATA MINIMIZATION
   ┌──────────────────────────────────┐
   │  External API Calls              │
   │  └─ Gemini API ONLY              │
   │     ├─ Prompt generation         │
   │     └─ Chatbot queries           │
   └──────────────────────────────────┘

3. EPHEMERAL STATE
   ┌──────────────────────────────────┐
   │  Test Results                    │
   │  ├─ Stored in Memory             │
   │  ├─ Cleared on Page Refresh      │
   │  └─ Never Sent to Server         │
   └──────────────────────────────────┘

4. LOCAL PERSISTENCE
   ┌──────────────────────────────────┐
   │  localStorage                    │
   │  ├─ Configuration Data Only      │
   │  ├─ User-Controlled              │
   │  └─ No Sensitive Data            │
   └──────────────────────────────────┘

5. API KEY SECURITY
   ┌──────────────────────────────────┐
   │  Gemini API Key                  │
   │  ├─ Stored in .env (not git)     │
   │  ├─ Injected by Vite             │
   │  └─ Never Leaves Browser         │
   └──────────────────────────────────┘
```

---

**FIN DE L'INDEX VISUEL**

