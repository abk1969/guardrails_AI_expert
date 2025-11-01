# 🔗 PLAN: COMPASS Cross-Module Navigation Implementation

**Date:** 2025-10-31
**Status:** ⏳ Pending User Approval
**Complexity:** 🟠 Moderate (Multi-module integration)

---

## 📋 Executive Summary

**Objective:** Make the "Modules associés" (Associated Modules) buttons in COMPASS use case modal clickable and functional by:
1. Parsing relationship data from Excel sheets
2. Populating `relatedSheets` arrays in COMPASS use cases
3. Implementing cross-module navigation with filtering
4. Connecting existing isolated modules into an integrated system

**Current State:**
- ❌ All `relatedSheets` arrays are empty (`vulnerabilities: [], incidents: [], defenses: [], questions: []`)
- ❌ Modal buttons show "0 liées" for all modules
- ❌ Buttons have no onClick handlers
- ✅ Excel data already parsed in `owasp-compass-analysis.json`
- ✅ Existing modules have working contexts and views
- ✅ All 4 target modules exist: KnownVulnerabilitiesView, KnownIncidentsView, DefensesMitigationsView, AIThirdPartyQuestionsView

**Target State:**
- ✅ Use cases linked to related vulnerabilities, incidents, defenses, and questions
- ✅ Clickable buttons navigate to corresponding modules with filters applied
- ✅ Modules highlight/filter content based on navigation context
- ✅ Bidirectional navigation (from COMPASS to modules, and back)
- ✅ Rich, interactive, intelligent navigation experience

---

## 🔍 Analysis: Current Data Structure

### Excel Sheets Structure

#### 1. **3a Orient Known AI Vulnerabilities** (36 rows)
**Columns:**
- Organization/Tool
- CVE Identifier
- CWE
- Description
- Severity (CRITICAL/HIGH/MEDIUM/LOW)
- 5-point score
- OWASP LLM Category (LLM01-LLM10)
- Category Name
- OWASP Agentic Top 15 (T1-T15)
- Attack Type

**Sample Data:**
```
InvokeAI | CVE-2024-10821 | CWE-79 | DoS via improper multipart request boundary handling... | HIGH | 4 | LLM10:2025 | Unbounded Consumption | T4 | Resource Overload
```

**Linkage Pattern:** Can link to use cases via:
- OWASP Category (LLM01-LLM10, T1-T15)
- Attack Type keywords
- MITRE/ATLAS techniques

#### 2. **3b Orient Known AI Incidents** (45 rows)
**Columns:**
- Incident Name
- OWASP Category (LLM01-LLM10)
- Impact Cost
- Reference URL

**Sample Data:**
```
ShadowRay | LLM02 LLM03 | 1000000000 | Link
Chat GPT Inference Attack | LLM02 | | Link
Google Map Deaths | LLM09 | | Link
```

**Linkage Pattern:** Can link to use cases via:
- OWASP Category (LLM01-LLM10)
- Incident type keywords

#### 3. **6a Reference Defenses & Mitigations** (40 rows)
**Columns:**
- Key Controls / Mitigation Strategies
- Key Detection Mechanisms

**Sample Data:**
```
Secure data sourcing/provenance, data validation/sanitization, outlier detection in training... | Monitoring training data statistics, benchmarking model performance drift...
```

**Linkage Pattern:** Can link to use cases via:
- Attack type keywords (prompt injection, poisoning, leakage, etc.)
- Defense strategy themes
- OWASP categories implicitly

#### 4. **6c Reference Third Party Questions** (54 rows)
**Columns:**
- Category
- Question
- Response
- Rating

**Sample Data:**
```
AI Use Transparency | What AI/ML capabilities are embedded in your product? | |
Bias & Fairness | Have your AI models been tested for potential bias? | |
Data Access & Security | Will the solution provider have access to clear text data? | |
```

**Linkage Pattern:** Can link to use cases via:
- Category keywords (Security, Privacy, Transparency, Bias, etc.)
- Question theme matching use case threat type

### COMPASS Use Cases Structure (31 use cases)

**Relevant Fields for Linkage:**
- `title`: "Jailbreak of internal chatbot"
- `associatedThreat`: "Model control bypass via prompt manipulation"
- `attackMapping.mitre`: "T1566.001"
- `attackMapping.atlas`: "T1647 – Prompt Injection (ATLAS)"
- `oodaPhase`: observe/orient/decide/act
- `relatedSheets`: { vulnerabilities: [], incidents: [], defenses: [], questions: [] } **← NEEDS POPULATION**

---

## 🎯 Linkage Strategy

### Phase 1: Text-Based Matching (Primary Strategy)

#### A. **Vulnerabilities Linkage**
Link use cases to vulnerabilities based on:
1. **OWASP Category Matching**:
   - Extract OWASP category from use case description/threat
   - Match to vulnerability's "OWASP LLM Category" column
   - Example: Use case about "prompt injection" → vulnerabilities tagged "LLM01" or "T11"

2. **Attack Type Keyword Matching**:
   - Use case associated threat contains "prompt injection" → match vulnerabilities with "Prompt Injection" attack type
   - Use case about "data poisoning" → match "Training Data Poisoning"

3. **MITRE/ATLAS Technique Matching**:
   - Use case with ATLAS "T1647" → match vulnerabilities referencing "T11" (Prompt Injection)

**Expected Result:** Each use case linked to 0-5 relevant CVEs

#### B. **Incidents Linkage**
Link use cases to incidents based on:
1. **OWASP Category Matching**:
   - Use case threat category → incident's OWASP Category column
   - Example: "LLM02" incidents → use cases about "sensitive data exposure"

2. **Incident Type Keywords**:
   - Use case about "deepfake" → "Deep Fake Fraud" incident
   - Use case about "jailbreak" → "Chat GPT Inference Attack" incident

**Expected Result:** Each use case linked to 1-3 relevant real-world incidents

#### C. **Defenses Linkage**
Link use cases to defense strategies based on:
1. **Attack Vector Matching**:
   - Use case about "prompt injection" → defenses mentioning "input sanitization", "prompt validation"
   - Use case about "data poisoning" → defenses mentioning "data validation", "outlier detection"

2. **OWASP Category Implicit Matching**:
   - Use defensive strategies in order (row 2 = LLM01, row 3 = LLM02, etc.) as proxy

**Expected Result:** Each use case linked to 1-3 relevant defense strategies

#### D. **Third Party Questions Linkage**
Link use cases to questions based on:
1. **Category Theme Matching**:
   - Use case about "data privacy" → questions in "Data Access & Security" category
   - Use case about "bias" → questions in "Bias & Fairness" category
   - Use case about "transparency" → questions in "AI Use Transparency"

2. **Keyword Matching**:
   - Use case threat contains "PII" → questions about "data access", "privacy"

**Expected Result:** Each use case linked to 2-8 relevant vendor questions

### Phase 2: Manual Review & Enhancement (Post-Implementation)

After automated linkage:
- Review each use case's links
- Add/remove links based on domain expertise
- Store overrides in localStorage for persistence

---

## 🏗️ Implementation Architecture

### 1. **Data Layer**

#### New Script: `scripts/link-compass-relationships.cjs`
```javascript
// Parses Excel data and generates relationship mappings
// Inputs:
//   - data_ai_risk/owasp-compass-analysis.json (existing)
//   - data/compassContent.ts (existing use cases)
// Outputs:
//   - data/compassRelationships.ts (new file with linkage data)
```

**Key Functions:**
```javascript
function linkUseCaseToVulnerabilities(useCase, vulnerabilities) {
  // Returns array of vulnerability IDs (CVE numbers)
}

function linkUseCaseToIncidents(useCase, incidents) {
  // Returns array of incident IDs
}

function linkUseCaseToDefenses(useCase, defenses) {
  // Returns array of defense strategy indices
}

function linkUseCaseToQuestions(useCase, questions) {
  // Returns array of question IDs
}
```

#### Updated File: `data/compassContent.ts`
- Regenerate with populated `relatedSheets` arrays
- Use generated relationship data from new script

### 2. **Navigation Layer**

#### New Context: `contexts/NavigationContext.tsx`
```typescript
interface NavigationState {
  // Tracks navigation source for back-navigation
  navigationSource: string | null; // 'compass-use-case' | null
  sourceId: string | null; // use case ID

  // Filter parameters passed to target module
  filterParams: {
    highlightIds?: string[]; // IDs to highlight in target view
    category?: string;
    searchTerm?: string;
  } | null;

  // Navigation functions
  navigateToModule: (moduleId: string, sourceModule: string, sourceId: string, filterParams: any) => void;
  clearNavigation: () => void;
}
```

**Purpose:** Centralized navigation state that all modules can read and write to

#### Updated Component: `App.tsx`
- Wrap app in `NavigationProvider`
- Pass navigation state to all module views via props or context

### 3. **UI Layer**

#### A. Updated Modal: `components/compass/CompassUseCaseModal.tsx`

**Changes:**
```typescript
import { useNavigation } from '../contexts/NavigationContext';

// Inside component
const { navigateToModule } = useNavigation();

// Make buttons functional
<button
  className="..."
  onClick={() => {
    navigateToModule(
      'known-vulnerabilities', // target module ID
      'compass-use-cases', // source module
      useCase.id, // source use case ID
      {
        highlightIds: useCase.relatedSheets.vulnerabilities,
        category: useCase.attackMapping.mitre
      }
    );
    onClose(); // Close modal
  }}
  disabled={useCase.relatedSheets.vulnerabilities.length === 0}
>
  <Bug className="..." />
  <div>
    <div>Vulnérabilités</div>
    <div>{useCase.relatedSheets.vulnerabilities.length} liées</div>
  </div>
  <ExternalLink className="..." />
</button>

// Repeat for incidents, defenses, questions
```

#### B. Updated Views: Module Components

**KnownVulnerabilitiesView.tsx:**
```typescript
import { useNavigation } from '../contexts/NavigationContext';

function KnownVulnerabilitiesView() {
  const { filterParams, navigationSource, clearNavigation } = useNavigation();

  // Apply filters from navigation
  const filteredVulns = useMemo(() => {
    let filtered = vulnerabilities;

    if (filterParams?.highlightIds) {
      // Prioritize highlighted vulnerabilities
      filtered = filtered.sort((a, b) => {
        const aHighlighted = filterParams.highlightIds.includes(a.cveIdentifier);
        const bHighlighted = filterParams.highlightIds.includes(b.cveIdentifier);
        return aHighlighted === bHighlighted ? 0 : aHighlighted ? -1 : 1;
      });
    }

    return filtered;
  }, [vulnerabilities, filterParams]);

  // Show navigation breadcrumb if navigated from COMPASS
  {navigationSource && (
    <div className="mb-4 p-3 bg-cyan-900/30 border border-cyan-600 rounded-lg">
      <button onClick={clearNavigation} className="text-cyan-400">
        ← Retour à {navigationSource}
      </button>
      <p className="text-sm text-gray-400 mt-1">
        Affichage des {filterParams?.highlightIds?.length || 0} vulnérabilités liées
      </p>
    </div>
  )}

  // Highlight rows that match filterParams.highlightIds
  <VulnerabilityRow
    vulnerability={vuln}
    isHighlighted={filterParams?.highlightIds?.includes(vuln.cveIdentifier)}
  />
}
```

**Similar updates for:**
- `KnownIncidentsView.tsx`
- `DefensesMitigationsView.tsx`
- `AIThirdPartyQuestionsView.tsx`

### 4. **Styling Layer**

**Add highlight styles:**
```typescript
// In VulnerabilityRow component
<tr className={`
  ${isHighlighted ? 'bg-cyan-900/40 border-l-4 border-cyan-400 ring-2 ring-cyan-500/50' : ''}
  hover:bg-gray-800 transition-colors
`}>
```

---

## 📦 Implementation Steps

### ✅ STEP 1: Create Relationship Parsing Script
**File:** `scripts/link-compass-relationships.cjs`
- Parse Excel sheets
- Implement matching algorithms
- Generate relationship mappings
- Output TypeScript-ready data

**Deliverables:**
- Working script that can be run with `node scripts/link-compass-relationships.cjs`
- Console output showing linkage statistics (e.g., "Use Case 1: 3 vulns, 2 incidents, 1 defense, 5 questions")

### ✅ STEP 2: Update COMPASS Data with Relationships
- Run script to generate relationships
- Update `data/compassContent.ts` with populated `relatedSheets` arrays
- Verify all 31 use cases have at least some links

**Deliverables:**
- Updated `compassContent.ts` with populated relationships
- Verification script showing coverage (e.g., "28/31 use cases have vulnerability links")

### ✅ STEP 3: Create Navigation Context
**File:** `contexts/NavigationContext.tsx`
- Create context with navigation state
- Implement navigation functions
- Add provider wrapper

**Deliverables:**
- Working NavigationContext with full TypeScript types
- Test that context can be consumed in components

### ✅ STEP 4: Update App.tsx Integration
- Import NavigationProvider
- Wrap application in provider (inside existing providers)
- Ensure navigation state available to all modules

**Deliverables:**
- App.tsx with NavigationProvider added
- No runtime errors on app load

### ✅ STEP 5: Make COMPASS Modal Buttons Clickable
**File:** `components/compass/CompassUseCaseModal.tsx`
- Import useNavigation hook
- Add onClick handlers to all 4 buttons
- Implement navigation logic with proper parameters
- Close modal after navigation
- Disable buttons when no related items

**Deliverables:**
- Clickable buttons that navigate to correct modules
- Proper disabled state when count is 0
- Modal closes on navigation

### ✅ STEP 6: Update KnownVulnerabilitiesView
**File:** `components/KnownVulnerabilitiesView.tsx`
- Consume navigation context
- Apply filters to highlight related vulnerabilities
- Add back-navigation breadcrumb
- Highlight matching rows

**Deliverables:**
- View responds to navigation from COMPASS
- Highlighted vulnerabilities appear at top
- Back button returns to COMPASS with modal still open (bonus feature)

### ✅ STEP 7: Update KnownIncidentsView
**File:** `components/KnownIncidentsView.tsx`
- Same as Step 6 for incidents

**Deliverables:**
- Working navigation from COMPASS to incidents
- Highlighted incident rows

### ✅ STEP 8: Update DefensesMitigationsView
**File:** `components/DefensesMitigationsView.tsx`
- Same as Step 6 for defenses

**Deliverables:**
- Working navigation from COMPASS to defenses
- Highlighted defense strategies

### ✅ STEP 9: Update AIThirdPartyQuestionsView
**File:** `components/AIThirdPartyQuestionsView.tsx`
- Same as Step 6 for questions

**Deliverables:**
- Working navigation from COMPASS to questions
- Highlighted question rows

### ✅ STEP 10: Test Full Navigation Flow
- Test each use case's module buttons
- Verify correct items highlighted in each module
- Test back navigation
- Test disabled buttons for use cases with no links
- Test multiple navigation flows (use case A → vulns → back → use case B → incidents)

**Deliverables:**
- All 4 module navigation paths working
- No console errors
- Smooth UX with proper animations/transitions

### ✅ STEP 11: Update CLAUDE.md Documentation
- Document navigation system architecture
- Add linkage strategy explanation
- Document NavigationContext usage
- Add troubleshooting section

**Deliverables:**
- Updated CLAUDE.md with navigation section
- Code examples for future developers

---

## 🔗 Relationship Mapping Examples

### Example 1: Use Case "Jailbreak of internal chatbot"

**Associated Threat:** "Model control bypass via prompt manipulation"
**MITRE/ATLAS:** T1566.001, T1647 (Prompt Injection)

**Expected Links:**
- **Vulnerabilities:**
  - CVE-2024-xxxxx (Prompt Injection vulnerabilities)
  - Any CVE with OWASP category LLM01 (Prompt Injection)
  - ~2-4 CVEs expected

- **Incidents:**
  - "Chat GPT Inference Attack" (LLM02)
  - Any jailbreak-related incidents
  - ~1-2 incidents expected

- **Defenses:**
  - Row 6: "Strict input sanitization/parsing, context separation..."
  - Row with prompt validation strategies
  - ~1-2 defense rows expected

- **Questions:**
  - "Data Access & Security" category questions
  - Questions about input validation
  - ~3-5 questions expected

### Example 2: Use Case "Deepfake targeting executive"

**Associated Threat:** "Executive impersonation and reputational harm"
**MITRE:** T1586.002 (Identity Theft)

**Expected Links:**
- **Vulnerabilities:**
  - CVEs related to model misuse (T4 - OWASP Agentic)
  - ~0-2 CVEs (may be less relevant)

- **Incidents:**
  - "Deep Fake Fraud" incident
  - ~1 incident expected

- **Defenses:**
  - Watermarking outputs strategies
  - Identity verification controls
  - ~1-2 defense rows

- **Questions:**
  - "AI Use Transparency" category
  - Questions about deepfake detection
  - ~2-4 questions expected

---

## 🎨 UI/UX Enhancements

### Modal Button States

**State 1: Has Related Items (Active)**
```typescript
className="flex items-center gap-2 p-3 bg-gray-900/50 border border-gray-700 rounded-lg
hover:border-cyan-600 hover:bg-cyan-900/20 transition-all cursor-pointer text-left group
transform hover:scale-[1.02]"
```

**State 2: No Related Items (Disabled)**
```typescript
className="flex items-center gap-2 p-3 bg-gray-900/30 border border-gray-800 rounded-lg
text-gray-600 cursor-not-allowed text-left opacity-50"
```

### Highlighted Row Styling

```typescript
<tr className={`
  transition-all duration-300
  ${isHighlighted
    ? 'bg-gradient-to-r from-cyan-900/40 to-transparent border-l-4 border-cyan-400 ring-2 ring-cyan-500/30 animate-pulse-subtle'
    : 'hover:bg-gray-800/50'
  }
`}>
```

### Back Navigation Breadcrumb

```tsx
<div className="mb-4 p-4 bg-gradient-to-r from-cyan-900/30 to-transparent border-l-4 border-cyan-400 rounded-lg flex items-center justify-between">
  <div className="flex items-center gap-3">
    <button
      onClick={clearNavigation}
      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Retour à OWASP COMPASS</span>
    </button>
    <div className="h-6 w-px bg-cyan-600" />
    <p className="text-sm text-gray-300">
      {filterParams?.highlightIds?.length || 0} élément(s) lié(s) au cas d'usage
    </p>
  </div>
  <button
    onClick={clearNavigation}
    className="text-gray-500 hover:text-gray-300"
  >
    <X className="w-5 h-5" />
  </button>
</div>
```

---

## ⚠️ Risks & Mitigation

### Risk 1: Over-Linking (Too Many False Positives)
**Mitigation:**
- Use strict keyword matching (avoid partial matches)
- Require multiple criteria matches for linkage
- Implement relevance scoring (link only top 5 matches)
- Allow manual override in UI

### Risk 2: Under-Linking (Missing Obvious Relationships)
**Mitigation:**
- Use broad initial matching, then filter
- Manual review of use cases with 0 links
- Add manual link addition UI (future enhancement)

### Risk 3: Performance Issues (Large Datasets)
**Mitigation:**
- Pre-compute relationships at build time (script-generated)
- Store in static TypeScript file
- No runtime computation needed
- Use memoization in UI components

### Risk 4: Navigation State Conflicts
**Mitigation:**
- Clear navigation state on manual module switch
- Use single source of truth (NavigationContext)
- Proper cleanup on unmount

---

## 📊 Success Metrics

### Quantitative Metrics
- ✅ 100% of use cases have at least 1 link to any module
- ✅ Average 3+ links per use case across all modules
- ✅ 0 console errors during navigation
- ✅ Navigation completes in <100ms

### Qualitative Metrics
- ✅ User clicks "Vulnérabilités" button → sees relevant CVEs highlighted
- ✅ User can navigate back to original use case
- ✅ Disabled buttons clearly indicate no links available
- ✅ Highlighted items visually stand out but not overwhelming

### Coverage Targets
- **Vulnerabilities:** 25+ use cases linked (80%+)
- **Incidents:** 20+ use cases linked (65%+)
- **Defenses:** 30+ use cases linked (97%+)
- **Questions:** 31 use cases linked (100%)

---

## 🔮 Future Enhancements (Out of Scope)

1. **Bidirectional Linking:**
   - From vulnerability view → show related use cases
   - From incident view → show related use cases

2. **Manual Link Management:**
   - UI to add/remove links
   - Persist custom links in localStorage

3. **Advanced Filtering:**
   - Filter by risk level + vulnerability severity
   - Combined filters (e.g., "Critical use cases + High severity CVEs")

4. **Relationship Visualization:**
   - Graph view showing connections between use cases and modules
   - Network diagram with D3.js

5. **Export Functionality:**
   - Export use case report with all related items
   - PDF generation with full context

---

## ✅ Approval Checklist

Before starting implementation, confirm:
- [ ] User approves linkage strategy (text-based keyword matching)
- [ ] User approves navigation pattern (context-based filtering with highlights)
- [ ] User approves UI enhancements (breadcrumbs, highlights, disabled states)
- [ ] User approves implementation steps order
- [ ] User confirms no additional requirements

**Next Step:** Wait for user approval before proceeding to STEP 1 implementation.

---

## 📝 Notes

- All text matching will be case-insensitive
- French and English keywords both supported
- Relationship data persisted in Git (not localStorage) for consistency
- Navigation state is ephemeral (cleared on page refresh)
- No backend API calls required - 100% client-side navigation
