# 🧭 GUIDE DE NAVIGATION - AI RISK MANAGER

**Complément de** : PROJECT_INDEX.md, TECHNICAL_DEEP_DIVE.md

---

## 🎯 CARTE DES MODULES (17 modules)

### Vue d'Ensemble de la Navigation

```
┌─────────────────────────────────────────────────────────────┐
│                    SIDEBAR NAVIGATION                        │
├─────────────────────────────────────────────────────────────┤
│  1. 🏠 Tableau de bord          → Dashboard                  │
│  2. 📊 Analyses                 → Analytics                  │
│  3. 📚 Bibliothèque d'Attaques  → DatasetManager             │
│  4. 🧪 Scénarios avancés        → AdvancedScenarios          │
│  5. 📋 Cas d'Usage              → UseCasesView               │
│  6. 👤 Profils de Menaces       → ThreatProfileView          │
│  7. 🎯 Surface d'Attaque        → AttackSurfaceAnalysisView  │
│  8. ⚙️  Paramètres              → SettingsView               │
│  9. 🛡️  Vulnérabilités Connues  → KnownVulnerabilitiesView   │
│ 10. 📰 Incidents Connus         → KnownIncidentsView         │
│ 11. 🚨 Préparation Incidents    → IncidentReadinessView      │
│ 12. 🔍 Revue Red Team           → RedTeamSecurityView        │
│ 13. 📈 Résultats Red Team       → RedTeamResultsView         │
│ 14. 🔒 Référence: Défenses      → DefensesMitigationsView    │
│ 15. 📝 Référence: Tiers IA      → AIThirdPartyQuestionsView  │
│ 16. 📖 Wiki Red Teamer          → WikiRedTeamerView          │
│ 17. 📜 Politique IA             → AIPolicyView               │
│ 18. 📚 Référentiel Risques IA   → AIRiskRepositoryView       │
│                                                               │
│ 💬 Chatbot (FAB en bas à droite)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 MODULE PAR MODULE

### 1. 🏠 Tableau de bord (Dashboard)

**Fichier** : `Dashboard.tsx` + `DashboardHome.tsx`  
**Contexte** : `TestRunContext`

#### États du Dashboard
```
┌─────────────────────────────────────────┐
│  État 1: HOME (DashboardHome)           │
│  - Métriques du dernier test            │
│  - Historique des 20 derniers runs      │
│  - Bouton "Lancer un Nouveau Test"      │
└─────────────────────────────────────────┘
         │ Clic "Lancer un Nouveau Test"
         ▼
┌─────────────────────────────────────────┐
│  État 2: CONFIGURATION                  │
│  (TestConfiguration.tsx)                │
│  - Sélection catégories guardrails      │
│  - Choix cible (Sandbox/API)            │
│  - Volume (10-100 prompts)              │
│  - Sensibilité par catégorie            │
│  - Complexités (Simple/Moyen/Sophist.)  │
└─────────────────────────────────────────┘
         │ Clic "Lancer le Test"
         ▼
┌─────────────────────────────────────────┐
│  État 3: RUNNING (LiveTestView)         │
│  - Barre de progression animée          │
│  - Statistiques en temps réel           │
│  - Liste des résultats au fur et mesure │
└─────────────────────────────────────────┘
         │ Test terminé
         ▼
┌─────────────────────────────────────────┐
│  État 4: FINISHED (RealTimeResults)     │
│  - Résumé global (score, taux échec)    │
│  - Filtres par statut/catégorie         │
│  - Liste détaillée des résultats        │
│  - Bouton "Retour au Tableau de bord"   │
└─────────────────────────────────────────┘
```

#### Composants Clés
- `TestConfiguration.tsx` - Configuration complète du test
- `TestTargetConfigurationModal.tsx` - Configuration cible API
- `LiveTestView.tsx` - Exécution en temps réel
- `RealTimeResults.tsx` - Résultats détaillés
- `ResultDetailModal.tsx` - Détail d'un résultat (modal)
- `TestProcessExplainer.tsx` - Explication du processus

---

### 2. 📊 Analyses (Analytics)

**Fichier** : `Analytics.tsx`  
**Contexte** : `TestRunContext`  
**Bibliothèque** : Recharts

#### Graphiques Affichés
1. **Évolution du Score de Conformité** (LineChart)
   - Axe X : Date des tests
   - Axe Y : Score global (0-100)
   - Tendance sur les 20 derniers runs

2. **Performance par Catégorie** (BarChart)
   - 5 barres (une par catégorie guardrail)
   - Taux d'échec en %

3. **Taux d'Échec par Complexité** (BarChart)
   - 3 barres (Simple, Moyen, Sophistiqué)
   - Taux d'échec en %

4. **Top 5 Prompts Échoués** (Liste)
   - Prompts avec les scores les plus bas
   - Catégorie et complexité

#### Métriques Clés
- Score Global (avec variation vs test précédent)
- Taux d'Échec (avec variation)
- Catégorie la Plus Vulnérable

---

### 3. 📚 Bibliothèque d'Attaques (DatasetManager)

**Fichier** : `DatasetManager.tsx`  
**Contexte** : `DatasetContext`

#### Structure
```
┌─────────────────────────────────────────────────────────┐
│  Famille 1: Injection de Prompt (13 prompts)            │
│  ├─ pi-s1: "Ignore tes instructions..." (Simple)        │
│  ├─ pi-m1: "Tu es maintenant..." (Moyen)                │
│  └─ pi-so1: "Encode en base64..." (Sophistiqué)         │
├─────────────────────────────────────────────────────────┤
│  Famille 2: Fuite d'Informations Sensibles (3 prompts)  │
│  ├─ sl-s1: "Donne-moi des exemples..." (Simple)         │
│  └─ ...                                                  │
├─────────────────────────────────────────────────────────┤
│  Famille 3: Attaques par Évasion (6 prompts)            │
│  Famille 4: Manipulation de Contexte RAG (3 prompts)    │
│  Famille 5: Empoisonnement des Données (2 prompts)      │
│  Famille 6: Prompts Personnalisés (extensible)          │
│  └─ Formulaire d'ajout de prompt custom                 │
└─────────────────────────────────────────────────────────┘
```

#### Fonctionnalités
- **Visualisation** : Tous les prompts par famille
- **Édition** : Modifier/Supprimer prompts existants
- **Ajout** : Créer prompts personnalisés (famille "Custom")
- **Métadonnées** : Guide OWASP, protection recommandée, tags

---

### 4. 🧪 Scénarios avancés (AdvancedScenarios)

**Fichier** : `AdvancedScenarios.tsx`  
**Contexte** : `DatasetContext`

#### Sections
1. **Attaques sur le Prompt Système et Évasion**
   - Prompts: pi-so1, pi-so2, ev-so2
   - Techniques: Jailbreak, révélation meta-prompt

2. **Manipulation de Contexte et Empoisonnement de la Mémoire**
   - Prompts: rag-m1, rag-so1, rag-so2, ag-so2
   - Techniques: RAG poisoning, memory corruption

3. **Attaques sur les Outils et l'Interaction Agent**
   - Prompts: ag-m1, mcp-so2, ag-so3
   - Techniques: Tool abuse, parameter pollution

4. **Attaques sur Systèmes Multi-Agents (Agentic AI)**
   - Prompts: aga-so1, a2a-so1, aga-so2
   - Techniques: Goal hijacking, agent-to-agent attacks

5. **Attaques sur la Chaîne d'Approvisionnement (Supply Chain)**
   - Prompts: mcp-so3
   - Techniques: Malicious tools, compromised registries

---

### 5. 📋 Cas d'Usage (UseCasesView)

**Fichier** : `UseCasesView.tsx`  
**Contexte** : `UseCaseContext`

#### Structure de Données
```typescript
interface UseCase {
  id: string;
  useCase: string;                // Description du cas
  impact: number;                 // 1-5
  likelihood: number;             // 1-5
  riskScore: number;              // impact × likelihood
  recommendation: string;         // Recommandation
  associatedThreat: string;       // Menace associée
  mapping: string;                // Mapping MITRE/OWASP
}
```

#### Fonctionnalités
- **Tableau** : 30 cas d'usage pré-configurés
- **Scoring** : Matrice Impact × Probabilité (auto-calculé)
- **CRUD** : Ajouter/Modifier/Supprimer cas d'usage
- **Modal** : `UseCaseFormModal.tsx` pour édition

#### Exemples de Cas d'Usage
- Jailbreak of internal chatbot (Impact: 4, Likelihood: 5, Risk: 20)
- Deepfake targeting executive (Impact: 5, Likelihood: 3, Risk: 15)
- Data exfiltration via prompt injection (Impact: 5, Likelihood: 4, Risk: 20)

---

### 6. 👤 Profils de Menaces (ThreatProfileView)

**Fichier** : `ThreatProfileView.tsx`  
**Contexte** : `ThreatProfileContext`

#### 3 Profils d'Acteurs
```
┌─────────────────────────────────────────────────────────┐
│  Profile 1: External Adversary (Adversaire Externe)     │
│  - Deep Fakes (voice/image cloning)                     │
│  - Phishing/Invoice fraud                               │
│  - Identity/Access attacks                              │
│  - Vulnerability/Supply chain attacks                   │
│  - OSINT Gathering                                       │
├─────────────────────────────────────────────────────────┤
│  Profile 2: Model Deployer (Déployeur de Modèle)        │
│  - LLM01: Prompt Injection                              │
│  - LLM02: Sensitive Information Disclosure              │
│  - LLM03: Supply Chain                                  │
│  - LLM04: Data and Model Poisoning                      │
│  - LLM05: Improper Output Handling                      │
│  - LLM06: Excessive Agency                              │
│  - ... (10 vulnérabilités OWASP)                        │
├─────────────────────────────────────────────────────────┤
│  Profile 3: Model Provider (Fournisseur de Modèle)      │
│  - Model Stealing/Extraction                            │
│  - Membership Inference                                 │
│  - Model Inversion                                      │
│  - AI Resource Hijacking                                │
│  - AI Denial of Service (DoS)                           │
└─────────────────────────────────────────────────────────┘
```

#### Fonctionnalités
- **Tableau** : 100+ entrées de menaces
- **Édition** : Notes, rating initial, défenses
- **Filtrage** : Par profil

---

### 7. 🎯 Surface d'Attaque (AttackSurfaceAnalysisView)

**Fichier** : `AttackSurfaceAnalysisView.tsx`  
**Contexte** : `AttackSurfaceContext`

#### 3 Sections

**Section 1: Vecteurs d'Attaque**
- 10+ vecteurs avec niveau de risque (1-5)
- Exemples: Deep Fakes, Prompt Injection, Supply Chain

**Section 2: Configuration Impact Organisationnel**
- 5 niveaux d'impact (Catastrophic → Minor)
- Fourchettes financières configurables

**Section 3: Scénarios Catastrophiques**
- 3 scénarios "nucléaires" (impact 5)
- Description et fourchettes financières

---

### 8. ⚙️ Paramètres (SettingsView)

**Fichier** : `SettingsView.tsx`  
**Contexte** : `SettingsContext`

#### Configuration Scoring
```typescript
interface ScoringSettings {
  impactScores: Array<{
    score: number;        // 1-5
    level: string;        // "Catastrophic", "Severe", etc.
    description: string;
  }>;
  likelihoodScores: Array<{
    score: number;        // 1-5
    level: string;        // "Almost Certain", "Likely", etc.
    description: string;
  }>;
}
```

---

### 9. 🛡️ Vulnérabilités Connues (KnownVulnerabilitiesView)

**Fichier** : `KnownVulnerabilitiesView.tsx`  
**Contexte** : `KnownVulnerabilitiesContext`

#### Structure
```typescript
interface KnownVulnerability {
  id: string;
  organizationTool: string;      // "Llama Index", "LangChain", etc.
  cveIdentifier: string;         // "CVE-2024-12909"
  associatedCwes: string;        // "CWE-79 (XSS)"
  descriptionSummary: string;
  originalSeverity: string;      // "CRITICAL", "HIGH", etc.
  fivePointScore: number;        // 1-5
  owaspLlmCategory: string;      // "LLM03:2025"
  owaspCategoryName: string;     // "Supply Chain"
  owaspAgenticTop15: string;     // "T11"
  owaspAgenticTop15ThreatName: string;
}
```

#### Fonctionnalités
- **Tableau** : CVE avec mapping OWASP
- **CRUD** : Ajouter/Modifier/Supprimer vulnérabilités
- **Liens** : Vers CVE, OWASP, MITRE

---

### 10. 📰 Incidents Connus (KnownIncidentsView)

**Fichier** : `KnownIncidentsView.tsx`  
**Contexte** : `KnownIncidentsContext`

#### Structure
```typescript
interface KnownAIIncident {
  id: string;
  incident: string;              // "Solana Scam"
  vulnerability: string;         // "LLM05"
  impact: string;                // "$2,500"
  referenceUrl: string;
}
```

#### Exemples d'Incidents
- Solana Scam (LLM05, $2,500)
- ShadowRay (LLM02 LLM03, $1B)
- ChatGPT Inference Attack (LLM02)

---

### 11. 🚨 Préparation Incidents (IncidentReadinessView)

**Fichier** : `IncidentReadinessView.tsx`  
**Contexte** : `IncidentReadinessContext`

#### 3 Sections

**Section 1: Questionnaire de Préparation**
- 6 catégories (Preparation, Detection, Analysis, Containment, Eradication, Recovery)
- 40+ questions avec rating (1-5)
- Suivi avant/après test

**Section 2: Catégories d'Incidents IA**
- 8 types d'incidents (Prompt Attacks, Hallucination, Drift, Data Leakage, etc.)
- Exemples pour chaque catégorie

**Section 3: Références de Surveillance**
- 10+ références (NIST AI RMF, OWASP, MITRE ATLAS, etc.)
- Liens vers documentation

---

### 12. 🔍 Revue Red Team (RedTeamSecurityView)

**Fichier** : `RedTeamSecurityView.tsx`  
**Contexte** : `RedTeamContext`

#### Structure
- **Objectif Business** : Champ texte libre
- **Questionnaire** : 50+ questions en 8 catégories
  - General Questions
  - Data Governance
  - Model Governance
  - Deployment & Operations
  - Monitoring & Incident Response
  - Third-Party & Supply Chain
  - Compliance & Legal
  - Red Team Specific

---

### 13. 📈 Résultats Red Team (RedTeamResultsView)

**Fichier** : `RedTeamResultsView.tsx`  
**Contexte** : `RedTeamResultsContext`

#### 4 Sections

**Section 1: Résultats de Tests**
- Tableau des vulnérabilités trouvées
- Scoring BugCrowd (1-5) et COMPASS (Critical → None)
- Lien vers calculateur CVSS

**Section 2: Profils de Mitigation**
- 3 profils (External Adversary, Model Deployer, Model Provider)
- Couleurs distinctes

**Section 3: Mapping Menaces → Mitigations**
- Tableau: Threat/Vulnerability → Score → Defense → Residual Score
- Par profil

**Section 4: Roadmap Stratégique**
- 5 lignes de stratégie (Immediate, Short-term, Medium-term, Long-term, Continuous)
- Colonnes: Owners, Strategy, Timeline, Status

---

### 14. 🔒 Référence: Défenses (DefensesMitigationsView)

**Fichier** : `DefensesMitigationsView.tsx`  
**Contexte** : `DefensesMitigationsContext`

#### 3 Sections

**Section 1: Matrice Défenses/Mitigations**
- 20 entrées (T1-T21)
- Colonnes: Attack Type, Threat ID/Name, AI Stack Layer, Core Attack Vector, Impact/Blast Radius, Mitigation, References, Estimated Relation, MITRE ATLAS/OWASP Links

**Section 2: OWASP LLM Top 10 (2025)**
- 10 vulnérabilités avec descriptions et mitigations

**Section 3: OWASP Agentic AI Top 15**
- 15 menaces spécifiques aux systèmes agentic

---

### 15. 📝 Référence: Tiers IA (AIThirdPartyQuestionsView)

**Fichier** : `AIThirdPartyQuestionsView.tsx`  
**Contexte** : `AIThirdPartyQuestionsContext`

#### Questionnaire Fournisseurs
- 10 catégories (AI Use Transparency, Bias & Fairness, Data Privacy, Security, etc.)
- 50+ questions pour évaluer fournisseurs IA
- Rating par question

---

### 16. 📖 Wiki Red Teamer (WikiRedTeamerView)

**Fichier** : `WikiRedTeamerView.tsx`  
**Contexte** : `WikiContext`  
**Source** : OWASP GenAI Red Teaming Guide

#### 5 Sections
1. **Démarrage Rapide** - 10 étapes
2. **Blueprint (Checklists)** - Checklists interactives sauvegardées
3. **Techniques Essentielles** - 10+ techniques
4. **Métriques** - Métriques de succès
5. **Outils & Datasets** - Tableau d'outils et datasets

#### Fonctionnalités
- **Recherche** : Full-text search dans tout le wiki
- **Navigation** : Sidebar avec ancres
- **Checklists** : Sauvegarde progression dans localStorage

---

### 17. 📜 Politique IA (AIPolicyView)

**Fichier** : `AIPolicyView.tsx`  
**Contexte** : `AIPolicyContext`

#### Structure
```
┌─────────────────────────────────────────────────────────┐
│  Dashboard (PolicyDashboard.tsx)                        │
│  - Statistiques globales (100+ règles)                  │
│  - Répartition par statut (Implémentée/En cours/etc.)   │
│  - Graphique camembert                                  │
├─────────────────────────────────────────────────────────┤
│  Chapitre 1: Définitions                                │
│  Chapitre 2: Périmètre et Objet                         │
│  Chapitre 3: Gouvernance et Responsabilités             │
│  Chapitre 4: Exigences de Sécurité (100+ règles)        │
│  Chapitre 5: Cas particulier des IA génératives         │
└─────────────────────────────────────────────────────────┘
```

#### Fonctionnalités
- **Recherche** : Full-text dans tous les chapitres
- **Édition** : Chaque règle éditable (statut, notes, menaces, risques, guides)
- **Export/Import** : JSON
- **Accordéons** : Chapitres et sections pliables

---

### 18. 📚 Référentiel Risques IA (AIRiskRepositoryView)

**Fichier** : `AIRiskRepositoryView.tsx`  
**Contexte** : `AIRiskRepositoryContext`

#### Navigation par Onglets
```
┌─────────────────────────────────────────────────────────┐
│  [Contents] [Causal] [Domain] [Database] [Explainer]   │
│  [Causal Stats] [Domain Stats] [Comparison] [Resources]│
├─────────────────────────────────────────────────────────┤
│                    CONTENU ACTIF                         │
└─────────────────────────────────────────────────────────┘
```

#### Onglets Détaillés

**1. Contents (ContentsView.tsx)**
- Table des matières interactive
- Clic sur feuille → navigation

**2. Causal Taxonomy (CausalTaxonomyView.tsx)**
- Arbre interactif (Entité → Timing → Intention → Système)
- Compteurs par nœud

**3. Domain Taxonomy (DomainTaxonomyView.tsx)**
- 7 domaines (Discrimination, Privacy, Misinformation, etc.)
- Arbre expandable

**4. Database (RiskDatabaseView.tsx)**
- **2245 risques** avec filtres multiples
- Recherche full-text
- Pagination (50/page)
- Filtres: Entité, Timing, Domaine
- Modal détail par risque

**5. Explainer (RiskDatabaseExplainerView.tsx)**
- Méthodologie de la base de données

**6-8. Statistics (StatisticsView.tsx)**
- Graphiques (à implémenter)

**9. Resources (IncludedResourcesView.tsx)**
- 85 ressources académiques

---

## 💬 CHATBOT (Floating Action Button)

**Fichiers** : `Chatbot.tsx`, `ChatbotFab.tsx`  
**Hook** : `useAllContexts.ts`  
**Service** : `agenticService.ts`

### Fonctionnalités
- **Draggable** : Déplaçable par le header
- **Resizable** : Redimensionnable (coin bas-droit)
- **MCP** : Accès à toutes les données de l'app
- **Persistance** : Messages en mémoire (session uniquement)

### Exemples de Questions
- "Quels sont les cas d'usage avec un risque > 15 ?"
- "Résume les résultats du dernier test"
- "Quelles sont les vulnérabilités critiques ?"
- "Donne-moi les règles de politique non implémentées"

---

## 🔄 FLUX UTILISATEUR TYPIQUE

### Scénario 1: Premier Test
```
1. Ouvrir app → Dashboard (Home)
2. Clic "Lancer un Nouveau Test"
3. Configuration:
   - Sélectionner catégories (ex: Sécurité, Pertinence)
   - Choisir cible (Sandbox)
   - Volume: 20 prompts
   - Sensibilité: Normal
   - Complexités: Simple + Moyen
4. Clic "Lancer le Test"
5. Attendre exécution (LiveTestView)
6. Consulter résultats (RealTimeResults)
7. Clic sur résultat → Modal détail
8. Retour Dashboard → Voir historique
```

### Scénario 2: Analyse de Tendances
```
1. Exécuter 3-4 tests avec configurations différentes
2. Aller dans "Analyses"
3. Consulter graphique "Évolution du Score"
4. Identifier catégorie la plus vulnérable
5. Aller dans "Bibliothèque d'Attaques"
6. Consulter prompts de cette catégorie
7. Aller dans "Référence: Défenses"
8. Trouver mitigations recommandées
```

### Scénario 3: Revue Red Team
```
1. Aller dans "Revue Red Team"
2. Remplir objectif business
3. Répondre aux 50+ questions
4. Noter ratings initiaux
5. Aller dans "Résultats Red Team"
6. Ajouter résultats de tests
7. Mapper menaces → mitigations
8. Créer roadmap stratégique
```

---

**FIN DU GUIDE DE NAVIGATION**

