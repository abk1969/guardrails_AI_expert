# 📋 PLAN DÉTAILLÉ - Refonte Module "Cas d'Usage" OWASP COMPASS

## 🎯 Objectif

Refonte complète du module "Cas d'Usage" basé sur le fichier Excel **OWASP GenAI COMPASS v.1** avec:
- ✅ Contenu bilingue (Français/Anglais)
- ✅ Interface moderne et interactive
- ✅ Navigation riche entre modules
- ✅ Intégration OODA Loop (Observe, Orient, Decide, Act)
- ✅ 30 cas d'usage avec scores de risque
- ✅ Liens vers 18 autres modules/feuilles Excel

---

## 📊 Analyse Complète Effectuée

### Fichier Source
- **Chemin**: `data_ai_risk/Copy of ⭕ OWASP GenAI  COMPASS v. 1.xlsx`
- **Feuilles**: 19 sheets analysées
- **Données extraites**: `data_ai_risk/owasp-compass-analysis.json`

### Feuille "Notes Uses Cases" (Focus Principal)
- **31 lignes** de données (30 cas d'usage + header)
- **7 colonnes**:
  1. Use Case (nom du scénario)
  2. Impact (1-5)
  3. Likelihood (1-5)
  4. Risk Score (calcul Impact × Likelihood)
  5. Recommendation (action recommandée)
  6. Associated Threat (menace associée)
  7. ATT&CK/ATLAS Mapping (techniques MITRE)

### Distribution des Risques
- **Risque Critique (20)**: 7 cas d'usage
- **Risque Élevé (15-16)**: 11 cas d'usage
- **Risque Modéré (8-12)**: 9 cas d'usage
- **Risque Faible (6-9)**: 3 cas d'usage

---

## 🏗️ ARCHITECTURE DÉTAILLÉE

### 1. Structure de Données TypeScript

```typescript
// types.ts - Extensions COMPASS

export interface CompassUseCase {
  id: string;
  title: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  impact: 1 | 2 | 3 | 4 | 5;
  likelihood: 1 | 2 | 3 | 4 | 5;
  riskScore: number; // impact × likelihood
  riskLevel: 'critical' | 'high' | 'moderate' | 'low';
  recommendation: {
    fr: string;
    en: string;
  };
  associatedThreat: {
    fr: string;
    en: string;
  };
  attackMapping: {
    mitre: string; // ATT&CK technique ID
    atlas?: string; // ATLAS technique ID
  };

  // Relations inter-modules
  relatedSheets: {
    vulnerabilities: string[]; // CVE IDs from "3a Orient Known AI Vulnerabilit"
    incidents: string[]; // Incident IDs from "3b Orient Known AI Incidents"
    defenses: string[]; // Defense IDs from "6a Reference Defenses & Mitigat"
    redTeamQuestions: string[]; // Question IDs from "3d Orient Red Team Security Rev"
  };

  // Métadonnées
  owaspLLMCategory?: string; // LLM01:2025 - LLM10:2025
  owaspAgenticCategory?: string; // T1 - T19
  profile: ('Profile 1' | 'Profile 2a' | 'Profile 2b' | 'Profile 2c' | 'Profile 3')[];
}

export interface OWASPSheet {
  id: string;
  name: string;
  title: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  oodaPhase: 'observe' | 'orient' | 'decide' | 'act' | 'reference';
  icon: string; // Lucide icon name
  dataCount: number; // Nombre d'entrées
  relatedUseCases: string[]; // Use Case IDs
}

export interface OODAProgress {
  observe: {
    profilesSelected: string[];
    attackSurfaceCompleted: boolean;
    completionPercentage: number;
  };
  orient: {
    vulnerabilitiesReviewed: number;
    incidentsReviewed: number;
    redTeamQuestionsAnswered: number;
    totalQuestions: number;
    completionPercentage: number;
  };
  decide: {
    vulnerabilitiesMapped: number;
    totalVulnerabilities: number;
    mitigationsSelected: number;
    residualRiskCalculated: boolean;
    completionPercentage: number;
  };
  act: {
    strategyDefined: boolean;
    ownersAssigned: number;
    totalTasks: number;
    tasksCompleted: number;
    completionPercentage: number;
  };
}
```

### 2. Mapping des 19 Feuilles → Modules Application

| # | Feuille Excel | Module Existant | Action |
|---|---------------|-----------------|--------|
| 1 | **0 Getting The Compass** | Nouveau: Guide utilisateur | Créer composant tutoriel |
| 2 | **1 About** | Nouveau: À propos COMPASS | Créer page informative |
| 3 | **1 FAQ** | Nouveau: FAQ COMPASS | Créer composant FAQ accordéon |
| 4 | **2 Observe Objective Dashboard** | Nouveau: Dashboard OODA | Créer dashboard circulaire |
| 5 | **2a Observe Objective Threat Pr** | Nouveau: Profils de menace | Créer sélecteur de profils |
| 6 | **2b Observe Attack Surface Analy** | Enrichir: Surface d'Attaque | Ajouter analyse quantitative |
| 7 | **3 Orient Summary** | Nouveau: Résumé Orient | Créer page consolidation |
| 8 | **3a Orient Known AI Vulnerabilit** | Enrichir: Vuln IA Connues | Ajouter CVEs COMPASS |
| 9 | **3b Orient Known AI Incidents** | Enrichir: Incidents IA Connus | Ajouter incidents COMPASS |
| 10 | **3c Orient AI Incident Response** | Nouveau: Préparation incidents | Créer checklist préparation |
| 11 | **3d Orient Red Team Security Rev** | Enrichir: Red Team Sec Review | Ajouter 50+ questions |
| 12 | **3e Orient AI Red Team Results** | Enrichir: Wiki Red Teamer | Ajouter scoring CVSS/BugCrowd |
| 13 | **4 Decide Red Team or Vuln vs Mi** | Nouveau: Décision vulnérabilités | Créer matrice décision |
| 14 | **5 Act Strategy & Roadmap** | Nouveau: Stratégie & Roadmap | Créer planificateur Gantt |
| 15 | **6 Reference AI Security Matrix** | Nouveau: Matrice Sécurité IA | Créer catalogue menaces |
| 16 | **6a Reference Defenses & Mitigat** | Enrichir: Référence: Défenses | Ajouter framework contrôles |
| 17 | **6b Reference Incident Monitorin** | Nouveau: Monitoring incidents | Créer guide monitoring |
| 18 | **6c Reference Third Party Questi** | Enrichir: Questions Tiers | Ajouter 50+ questions TPRM |
| 19 | **Notes Uses Cases** | **REFONTE COMPLÈTE** | Nouveau module moderne |

---

## 📐 PHASES D'IMPLÉMENTATION

### 🔹 PHASE 1: Préparation Données (Jour 1)

#### 1.1 Parser le JSON et Créer les Types
- ✅ Fichier `data_ai_risk/owasp-compass-analysis.json` déjà généré
- 📝 Créer interfaces TypeScript dans `types.ts`
- 📝 Créer fichier `data/compassContent.ts` avec données structurées

**Script de transformation**:
```bash
node scripts/transform-compass-data.cjs
```

#### 1.2 Traduction Automatique FR/EN
- Utiliser Gemini API (clé configurée dans `.env`)
- Traduire les 30 cas d'usage
- Traduire les menaces associées
- Traduire les recommandations
- Sauvegarder dans `data/compassUseCasesTranslated.ts`

**Script**:
```bash
node scripts/translate-compass-usecases.cjs
```

**Résultat attendu**: 30 cas d'usage avec contenu bilingue

---

### 🔹 PHASE 2: Context & État (Jour 2)

#### 2.1 Créer CompassContext
**Fichier**: `contexts/CompassContext.tsx`

**Fonctionnalités**:
- Chargement des 30 cas d'usage
- Chargement des 19 sheets mappés
- Gestion sélection utilisateur (use cases favoris)
- Gestion profils de menace sélectionnés
- Tracking progression OODA Loop
- Persistence localStorage

**Hooks exportés**:
```typescript
const {
  useCases,
  sheets,
  selectedUseCases,
  selectedProfiles,
  oodaProgress,
  selectUseCase,
  deselectUseCase,
  toggleProfile,
  updateOODAProgress,
  filterByRisk,
  filterByProfile,
  searchUseCases,
  getRelatedSheet,
  getUseCasesBySheet
} = useCompass();
```

#### 2.2 Ajouter Provider dans App.tsx
```typescript
<CompassProvider>
  {/* ... existing providers ... */}
</CompassProvider>
```

---

### 🔹 PHASE 3: Composants UI Réutilisables (Jour 3)

#### 3.1 Composants de Base

**`components/compass/RiskBadge.tsx`**
- Badge visuel pour risk score
- Couleurs: Rouge (20), Orange (15-16), Jaune (8-12), Vert (6-9)
- Taille S/M/L

**`components/compass/UseCaseCard.tsx`**
- Card cliquable pour use case
- Header: Titre + RiskBadge
- Body: Description courte + menace associée
- Footer: Techniques ATT&CK/ATLAS
- Actions: Voir détails, Ajouter favoris, Liens modules

**`components/compass/OODAProgressCircle.tsx`**
- Cercle divisé en 4 quadrants (Observe, Orient, Decide, Act)
- Progression % par quadrant
- Cliquable pour accéder à chaque phase
- Animations CSS

**`components/compass/SheetCard.tsx`**
- Card pour représenter une feuille Excel
- Badge phase OODA
- Nombre d'entrées
- Liens vers use cases associés

**`components/compass/ThreatProfileSelector.tsx`**
- Multi-select pour profils (Profile 1, 2a, 2b, 2c, 3)
- Icons distinctifs par profil
- Description tooltip

**`components/compass/RiskHeatMap.tsx`**
- Grille 5×5 (Impact × Likelihood)
- Points cliquables pour chaque use case
- Filtres dynamiques
- Export PNG/PDF

---

### 🔹 PHASE 4: Module Cas d'Usage Refactoré (Jour 4-5)

#### 4.1 Vue Principale
**Fichier**: `components/compass/UseCasesView.tsx`

**Layout**:
```
┌────────────────────────────────────────────────────────────┐
│  🎯 Cas d'Usage OWASP COMPASS (30 scénarios)              │
│  [FR] [EN]  🔍 Recherche...  [Filtres ▼]                  │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌───────────────────┐                   │
│  │ Dashboard   │  │  Filtres Actifs   │                   │
│  │ OODA Loop   │  │  • Risque: Tous   │                   │
│  │ (Circulaire)│  │  • Profil: 1, 2a  │                   │
│  └─────────────┘  └───────────────────┘                   │
│                                                            │
│  [🔴 Critiques (7)] [🟠 Élevés (11)] [🟡 Modérés (9)]   │
│  [🟢 Faibles (3)]  [⭐ Favoris (0)]                       │
│                                                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│  │ Use Case #1  │ │ Use Case #2  │ │ Use Case #3  │      │
│  │ 🔴 Score: 20 │ │ 🔴 Score: 20 │ │ 🔴 Score: 20 │      │
│  │ Impact: 5    │ │ Impact: 4    │ │ Impact: 4    │      │
│  │ Likelihood: 4│ │ Likelihood: 5│ │ Likelihood: 5│      │
│  │ [Détails]    │ │ [Détails]    │ │ [Détails]    │      │
│  └──────────────┘ └──────────────┘ └──────────────┘      │
│  ... (Grid de 30 cards avec pagination)                   │
└────────────────────────────────────────────────────────────┘
```

**Fonctionnalités**:
- Toggle langue FR/EN
- Recherche full-text
- Filtres multi-critères:
  - Risk score range (slider)
  - Profils de menace (multi-select)
  - Catégories OWASP (LLM01-10, T1-T19)
  - Techniques ATT&CK
- Tri: Risk score, Alphabétique, Impact, Likelihood
- Vues: Grid (cartes), List (tableau), Heatmap (matrice)
- Export: PDF, Excel, JSON

#### 4.2 Modal Détails Use Case
**Fichier**: `components/compass/UseCaseDetailModal.tsx`

**Sections**:
1. **En-tête**
   - Titre (FR/EN toggle)
   - Risk badge
   - Boutons: ⭐ Favori, 📤 Partager, 💾 Exporter

2. **Évaluation Risque**
   - Jauge Impact (1-5)
   - Jauge Likelihood (1-5)
   - Calcul Risk Score
   - Niveau de risque (texte explicatif)

3. **Description Complète**
   - Scénario détaillé
   - Menace associée
   - Vecteur d'attaque

4. **Recommandations**
   - Actions immédiates
   - Mitigations suggérées
   - Liens vers défenses (Tab 6a)

5. **Mappings Techniques**
   - MITRE ATT&CK (badges cliquables → MITRE.org)
   - ATLAS techniques
   - OWASP LLM Top 10:2025
   - OWASP Agentic Top 15

6. **Modules Associés** (Navigation Inter-Modules)
   - Vulnérabilités liées (Tab 3a)
   - Incidents similaires (Tab 3b)
   - Questions Red Team (Tab 3d)
   - Contrôles applicables (Tab 6a)
   - Questions tiers (Tab 6c)

7. **Timeline d'Action**
   - Checklist étapes OODA
   - Progression utilisateur
   - Prochaines actions

**Interactions**:
- Clic badge ATT&CK → Ouvre MITRE.org dans nouvel onglet
- Clic "Vulnérabilités liées" → Navigue vers module Vuln
- Clic "Incidents similaires" → Navigue vers module Incidents
- Clic "Appliquer mitigations" → Ouvre wizard décision (Tab 4)

#### 4.3 Vue Heat Map Interactive
**Fichier**: `components/compass/UseCasesHeatMap.tsx`

**Visualisation**:
- Grille 5×5 (axes Impact × Likelihood)
- 30 points représentant use cases
- Hover: Tooltip avec titre + risk score
- Click: Ouvre modal détails
- Zones colorées:
  - Rouge foncé: Impact 4-5, Likelihood 4-5 (Critical Zone)
  - Orange: Impact 3-5, Likelihood 3-5 (High Zone)
  - Jaune: Autres combinaisons (Medium Zone)
  - Vert: Impact 1-2, Likelihood 1-2 (Low Zone)

**Filtres**:
- Masquer/afficher par profil
- Masquer use cases traités
- Zoom sur zone critique

---

### 🔹 PHASE 5: Dashboard OODA Loop (Jour 6)

#### 5.1 Dashboard Principal
**Fichier**: `components/compass/OODADashboard.tsx`

**Layout**:
```
┌────────────────────────────────────────────────────────────┐
│  📊 OWASP COMPASS - Méthodologie OODA Loop                 │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐      │
│  │        Cercle OODA Interactif                   │      │
│  │                                                  │      │
│  │           OBSERVE (25% ✅)                       │      │
│  │        /                    \                    │      │
│  │   ACT                          ORIENT            │      │
│  │  (10% ⏳)                      (60% 🔄)          │      │
│  │        \                    /                    │      │
│  │           DECIDE (40% 🔄)                        │      │
│  │                                                  │      │
│  │  [Cliquer sur un quadrant pour accéder]         │      │
│  └─────────────────────────────────────────────────┘      │
│                                                            │
│  Progression Globale: 34% ████████░░░░░░░░░░              │
│                                                            │
│  📋 Actions Recommandées:                                  │
│  1. 🔴 Compléter Threat Profiles (Observe)                │
│  2. 🟠 Reviewer 15 CVEs critiques (Orient)                │
│  3. 🟡 Mapper 7 vulnérabilités (Decide)                   │
└────────────────────────────────────────────────────────────┘
```

**Interactions**:
- Clic quadrant OBSERVE → Navigue vers module Threat Profiles
- Clic quadrant ORIENT → Affiche sous-menu (CVEs, Incidents, Red Team, etc.)
- Clic quadrant DECIDE → Navigue vers matrice décision
- Clic quadrant ACT → Navigue vers planificateur roadmap

#### 5.2 Sous-Modules OODA

**OBSERVE** (Feuilles 2, 2a, 2b):
- `components/compass/ObserveObjectiveDashboard.tsx`
- `components/compass/ObserveThreatProfiles.tsx`
- `components/compass/ObserveAttackSurface.tsx`

**ORIENT** (Feuilles 3, 3a, 3b, 3c, 3d, 3e):
- `components/compass/OrientSummary.tsx`
- Enrichir modules existants (Vuln, Incidents, Red Team)

**DECIDE** (Feuille 4):
- `components/compass/DecideVulnVsMitigations.tsx`
- Matrice vulnérabilités × contrôles
- Calculateur risque résiduel

**ACT** (Feuille 5):
- `components/compass/ActStrategyRoadmap.tsx`
- Gantt chart / Kanban board
- Assignment propriétaires
- Tracking timeline

---

### 🔹 PHASE 6: Navigation Inter-Modules (Jour 7)

#### 6.1 Système de Liens Intelligents

**Fichier**: `utils/compassNavigation.ts`

```typescript
export function getRelatedModules(useCaseId: string): RelatedModule[] {
  const useCase = compassUseCases.find(uc => uc.id === useCaseId);

  return [
    {
      moduleId: 'vulnerabilities',
      label: { fr: 'Vulnérabilités liées', en: 'Related Vulnerabilities' },
      count: useCase.relatedSheets.vulnerabilities.length,
      icon: 'AlertTriangle',
      route: `/vulnerabilities?filter=${useCase.relatedSheets.vulnerabilities.join(',')}`
    },
    {
      moduleId: 'incidents',
      label: { fr: 'Incidents similaires', en: 'Similar Incidents' },
      count: useCase.relatedSheets.incidents.length,
      icon: 'AlertCircle',
      route: `/incidents?filter=${useCase.relatedSheets.incidents.join(',')}`
    },
    // ... autres modules
  ];
}
```

#### 6.2 Breadcrumb Navigation

**Composant**: `components/compass/CompassBreadcrumb.tsx`

Exemple de navigation:
```
OWASP COMPASS > OODA Loop > Orient > Vulnérabilités > CVE-2024-12909 > Use Case #1
```

Chaque niveau cliquable pour revenir en arrière.

#### 6.3 Widget "Modules Associés"

**Composant**: `components/compass/RelatedModulesWidget.tsx`

Affiche dans la sidebar ou en bas de page:
- Liste des modules liés au contexte actuel
- Nombre d'éléments associés
- Accès rapide

---

### 🔹 PHASE 7: Fonctionnalités Avancées (Jour 8-9)

#### 7.1 Moteur de Recherche Intelligent

**Fichier**: `services/compassSearchService.ts`

**Fonctionnalités**:
- Recherche full-text sur use cases (titre, description, menaces)
- Recherche par techniques ATT&CK
- Recherche par catégories OWASP
- Suggestions auto-complete
- Historique de recherche
- Recherche inter-modules (use cases + CVEs + incidents)

**Utilisation Gemini API**:
```typescript
async function intelligentSearch(query: string): Promise<SearchResults> {
  const context = getAllCompassData();
  const prompt = `
    Recherche intelligente dans base OWASP COMPASS.
    Query: "${query}"
    Contexte: 30 use cases, 50+ CVEs, 20+ incidents

    Retourne les résultats pertinents avec score de pertinence.
  `;

  const results = await geminiAPI(prompt, context);
  return parseResults(results);
}
```

#### 7.2 Générateur de Rapports

**Composant**: `components/compass/ReportGenerator.tsx`

**Types de rapports**:
1. **Executive Summary**
   - Vue d'ensemble risques (pie chart)
   - Top 5 use cases critiques
   - Recommandations prioritaires
   - Format: PDF, PowerPoint

2. **Technical Report**
   - Liste complète use cases avec détails
   - Mappings techniques
   - Matrice vulnérabilités × mitigations
   - Format: PDF, Excel

3. **Audit Package**
   - Réponses questionnaire red team
   - Progression OODA loop
   - Preuves de conformité
   - Format: ZIP (PDFs + Excel)

4. **Vendor Assessment**
   - Questions tiers (Tab 6c)
   - Réponses et scoring
   - Comparaison vendors
   - Format: Excel, PDF

**Templates**:
- Utiliser `jsPDF`, `xlsx` pour génération
- Templates personnalisables
- Branding organisation

#### 7.3 Simulateur de Menaces

**Composant**: `components/compass/ThreatSimulator.tsx`

**Fonctionnalité**:
- Sélectionner use case
- Visualiser attack tree (étapes attaque)
- Ajouter/retirer contrôles
- Voir impact sur risk score
- Générer script test red team

**Visualisation**:
- Flow diagram (Mermaid.js ou React Flow)
- Animation chemin attaque
- Checkpoints défense

#### 7.4 Collaboration & Partage

**Fonctionnalités**:
- Commentaires sur use cases
- @mentions équipe
- Assignation tâches
- Notifications
- Version history
- Export/import configuration

**Stockage**:
- localStorage pour données locales
- Optionnel: sync cloud chiffré (future feature)

---

### 🔹 PHASE 8: Intégration & Tests (Jour 10)

#### 8.1 Intégration Navigation
- Ajouter items COMPASS au sidebar principal
- Créer sous-menu avec 8+ modules
- Icons Lucide React
- Badges avec compteurs

#### 8.2 Migration Données Existantes
- Mapper use cases existants → structure COMPASS
- Enrichir avec données OWASP
- Conserver données utilisateur (favoris, notes)

#### 8.3 Tests Fonctionnels
- [ ] 30 use cases affichés correctement
- [ ] Filtres fonctionnent (risque, profil, OWASP)
- [ ] Recherche retourne résultats pertinents
- [ ] Navigation inter-modules fonctionne
- [ ] OODA dashboard affiche progression
- [ ] Heat map interactive
- [ ] Modal détails complet
- [ ] Export PDF/Excel fonctionnel
- [ ] Bilinguisme FR/EN complet

#### 8.4 Tests Performance
- [ ] Chargement 30 use cases < 1 seconde
- [ ] Recherche < 500ms
- [ ] Heat map smooth (60 FPS)
- [ ] Export PDF < 5 secondes
- [ ] localStorage < 5MB

---

## 🎨 DESIGN SYSTEM

### Palette Couleurs

**Risk Levels**:
- 🔴 Critical (20): `#dc2626` (red-600)
- 🟠 High (15-16): `#ea580c` (orange-600)
- 🟡 Moderate (8-12): `#ca8a04` (yellow-600)
- 🟢 Low (6-9): `#16a34a` (green-600)

**OODA Phases**:
- Observe: `#3b82f6` (blue-500)
- Orient: `#8b5cf6` (violet-500)
- Decide: `#f59e0b` (amber-500)
- Act: `#10b981` (emerald-500)

**Profiles**:
- Profile 1 (External): `#ef4444` (red-500) 🔴
- Profile 2a (Internal Existing): `#3b82f6` (blue-500) 🔵
- Profile 2b (CoPilot/Gemini): `#8b5cf6` (purple-500) 🟣
- Profile 2c (New GenAI): `#10b981` (green-500) 🟢
- Profile 3 (3rd Party): `#f97316` (orange-500) 🟠

### Typography
- Headings: `font-bold`
- Body: `font-normal`
- Code/Technical: `font-mono`
- Français: Standard
- English: Italic (pour différenciation)

### Icons (Lucide React)
- Use Case: `FileText`
- Risk: `AlertTriangle`
- Threat: `Crosshair`
- Mitigation: `Shield`
- OODA: `Compass`
- Navigation: `ChevronRight`
- Favorite: `Star`
- Export: `Download`
- Search: `Search`
- Filter: `Filter`

---

## 📦 LIVRABLES

### Code
1. ✅ `types.ts` - Extensions interfaces COMPASS
2. ✅ `data/compassContent.ts` - 30 use cases bilingues
3. ✅ `data/compassSheets.ts` - 19 sheets mappés
4. ✅ `contexts/CompassContext.tsx` - State management
5. ✅ `components/compass/` - 20+ composants
6. ✅ `services/compassService.ts` - Business logic
7. ✅ `utils/compassNavigation.ts` - Navigation helpers
8. ✅ `styles/compass.css` - Styles spécifiques (si nécessaire)

### Documentation
1. ✅ `COMPASS_USER_GUIDE.md` - Guide utilisateur FR/EN
2. ✅ `COMPASS_DEVELOPER_GUIDE.md` - Guide développeur
3. ✅ `COMPASS_MAPPING.md` - Mapping feuilles Excel → Modules
4. ✅ `COMPASS_API.md` - Documentation API Context

### Données
1. ✅ `data_ai_risk/owasp-compass-analysis.json` - Données brutes
2. ✅ `data/compassUseCases.ts` - 30 use cases structurés
3. ✅ `data/compassVulnerabilities.ts` - CVEs mappés
4. ✅ `data/compassIncidents.ts` - Incidents mappés
5. ✅ `data/compassMitigations.ts` - Contrôles mappés

---

## 🚀 LANCEMENT

### Commandes
```bash
# Transformation données Excel → TypeScript
npm run compass:transform-data

# Traduction FR/EN via Gemini
npm run compass:translate

# Build & test
npm run build
npm run test:compass

# Lancement dev
npm run dev
```

### URLs Modules
- `/compass` - Dashboard OODA principal
- `/compass/usecases` - Module Cas d'Usage (refactoré)
- `/compass/observe` - Phase Observe
- `/compass/orient` - Phase Orient
- `/compass/decide` - Phase Decide
- `/compass/act` - Phase Act
- `/compass/reference` - Matériaux de référence

---

## ✅ CRITÈRES DE SUCCÈS

1. **Fonctionnel**:
   - ✅ 30 use cases affichés avec données bilingues
   - ✅ Navigation fluide entre 19 modules
   - ✅ OODA Loop tracking fonctionnel
   - ✅ Filtres et recherche performants
   - ✅ Export rapports opérationnel

2. **UX/UI**:
   - ✅ Interface moderne (design system cohérent)
   - ✅ Interactions riches (hover, click, drag)
   - ✅ Animations smooth (CSS transitions)
   - ✅ Responsive (desktop, tablet)
   - ✅ Accessibilité (ARIA labels, keyboard nav)

3. **Performance**:
   - ✅ Temps chargement < 2 secondes
   - ✅ Recherche temps réel < 500ms
   - ✅ localStorage < 10MB
   - ✅ 60 FPS sur interactions

4. **Maintenance**:
   - ✅ Code TypeScript typé à 100%
   - ✅ Composants réutilisables
   - ✅ Documentation complète
   - ✅ Tests unitaires (optionnel)

---

## 📊 ESTIMATIONS

### Temps de Développement
- Phase 1 (Données): 1 jour
- Phase 2 (Context): 1 jour
- Phase 3 (Composants UI): 1 jour
- Phase 4 (Module Use Cases): 2 jours
- Phase 5 (Dashboard OODA): 1 jour
- Phase 6 (Navigation): 1 jour
- Phase 7 (Avancé): 2 jours
- Phase 8 (Intégration): 1 jour

**Total**: 10 jours de développement

### Lignes de Code (Estimation)
- TypeScript: ~5000 lignes
- React Components: ~3000 lignes
- Data files: ~2000 lignes
- Documentation: ~1000 lignes

**Total**: ~11 000 lignes

---

## 🎯 PROCHAINES ÉTAPES IMMÉDIATES

1. ✅ Valider ce plan avec vous
2. ⏳ Démarrer Phase 1: Transformation données
3. ⏳ Créer script traduction Gemini
4. ⏳ Implémenter types TypeScript
5. ⏳ Créer CompassContext
6. ⏳ Builder premiers composants UI

---

**Plan créé le**: 2025-10-27
**Statut**: ✅ PRÊT POUR IMPLÉMENTATION
**Approbation requise**: ✅ OUI - Attente validation utilisateur
