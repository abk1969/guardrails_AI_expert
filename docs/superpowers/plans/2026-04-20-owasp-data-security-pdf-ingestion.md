# OWASP GenAI Data Security 2026 PDF Ingestion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Intégrer le PDF OWASP GenAI Data Security Risks and Mitigations 2026 v1.0 (22 keyItems : DSPM + 21 DSGAI) dans `data/pdfReferences.ts` et enrichir le module COMPASS + Wiki Red Teamer.

**Architecture:** Script CJS rejouable parse le texte extrait du PDF → génère `data/owaspDataSecurity2026.generated.ts` → importé dans `pdfReferences.ts` (8ᵉ entrée, nouvelle catégorie `data-security`). Mapping explicite COMPASS ↔ DSGAI dans `data/compassPDFMapping.ts`. Nouveau composant `CompassOWASPReferences.tsx` pour la section globale + modification `CompassUseCaseModal` pour le panneau détail.

**Tech Stack:** TypeScript 5.8, React 19.1, Node.js CJS scripts, pdftotext (`/mingw64/bin/pdftotext`), Lucide icons.

**Pré-requis déjà en place :**
- Fichier source : `data_ai_risk/OWASP-GenAI-Data-Security-Risks-and-Mitigations-2026-v1.0.pdf`
- Texte extrait : `data_ai_risk/extracted/OWASP-GenAI-Data-Security-2026-v1.0.txt` (3 897 lignes, déjà produit par `pdftotext -layout`)
- Spec : `docs/superpowers/specs/2026-04-20-owasp-data-security-pdf-ingestion-design.md`

---

## File Structure

| Action | Fichier | Responsabilité |
|--------|---------|----------------|
| Modify | `data/pdfReferences.ts` | Types (PDFCategory, documentMeta, detailedSections) + entrée #8 |
| Modify | `types/compass.ts` | Ajout `relatedPDFs?` sur `CompassUseCase` |
| Create | `scripts/parse-owasp-data-security-pdf.cjs` | Parse le .txt → génère le .generated.ts |
| Create | `data/owaspDataSecurity2026.generated.ts` | Auto-généré : 22 ReferenceItem |
| Create | `data/compassPDFMapping.ts` | Mapping manuel CompassUseCase.id → PDF refs |
| Create | `components/compass/CompassOWASPReferences.tsx` | Section globale en tête du module COMPASS |
| Modify | `components/compass/CompassUseCasesView.tsx` | Intègre le nouveau composant |
| Modify | `components/compass/CompassUseCaseModal.tsx` | Panneau « Références OWASP liées » |
| Modify | `data/wikiContent.tsx` | Section DSGAI (21 accordions) |

---

## Task 1: Étendre les types dans pdfReferences.ts

**Files:**
- Modify: `data/pdfReferences.ts` (lignes 1-23, zone des types)

- [ ] **Step 1: Lire le fichier actuel pour confirmer les lignes à modifier**

Run: lire `data/pdfReferences.ts` lignes 1-23

Expected: voir l'interface `PDFReference` et `ReferenceItem` actuels sans `documentMeta` ni `detailedSections`.

- [ ] **Step 2: Remplacer les types**

Remplacer les lignes 1-21 par :

```typescript
// Structured reference data extracted from OWASP PDF documents
// Source: data_ai_risk/ directory - OWASP GenAI Security Project publications
// License: CC BY-SA 4.0

export type PDFCategory =
  | 'agentic-security'
  | 'mcp-security'
  | 'red-teaming'
  | 'incident-response'
  | 'governance'
  | 'data-security';

export interface PDFReference {
  id: string;
  title: string;
  source: string;
  category: PDFCategory;
  summary: string;
  keyItems: ReferenceItem[];
  url?: string;
  documentMeta?: {
    version?: string;
    publicationDate?: string;
    pages?: number;
    authors?: string[];
    license?: string;
  };
}

export interface ReferenceItem {
  id: string;
  code?: string;
  title: string;
  description: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  detailedSections?: {
    overview?: string;
    attackVectors?: string[];
    examples?: string[];
    impacts?: string[];
    mitigations?: string[];
    mitigationTiers?: {
      tier1?: string[];
      tier2?: string[];
      tier3?: string[];
    };
    knownCVEs?: string[];
    references?: string[];
    editorialNotes?: string[];
    relatedOwaspLLM?: string[];
  };
}
```

- [ ] **Step 3: Vérifier que les 7 entrées existantes compilent toujours**

Run: `npx tsc --noEmit 2>&1 | grep -i "pdfReferences\|ReferenceItem\|PDFReference"`
Expected: aucune erreur sur ces types. Les 7 entrées existantes utilisent uniquement `id`, `title`, `source`, `category` (comme string littéral), `summary`, `keyItems`, `url` — tous rétrocompatibles.

- [ ] **Step 4: Commit**

```bash
git add data/pdfReferences.ts
git commit -m "refactor(pdfReferences): add PDFCategory type, documentMeta, detailedSections

Rétrocompatible — aucune des 7 entrées existantes n'est modifiée.
Prépare l'ajout de l'entrée genai-data-security-2026 (22 keyItems).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Étendre CompassUseCase avec relatedPDFs

**Files:**
- Modify: `types/compass.ts` (interface `CompassUseCase`, lignes 19-49)

- [ ] **Step 1: Ajouter le champ optionnel `relatedPDFs?`**

Dans `types/compass.ts`, entre la ligne `oodaPhase: OODAPhase;` et `createdAt?: string;` (fin de l'interface `CompassUseCase`), ajouter :

```typescript
  relatedPDFs?: Array<{
    pdfId: string;
    itemIds?: string[];
    relevance?: BilingualText;
  }>;
```

Le bloc complet devient :

```typescript
export interface CompassUseCase {
  id: string;
  title: BilingualText;
  description: BilingualText;
  impact: 1 | 2 | 3 | 4 | 5;
  likelihood: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendation: BilingualText;
  associatedThreat: BilingualText;
  attackMapping: {
    mitre?: string;
    atlas?: string;
    description?: BilingualText;
  };
  relatedSheets: {
    vulnerabilities: string[];
    incidents: string[];
    defenses: string[];
    questions: string[];
    threatProfiles: string[];
    attackSurfaces: string[];
    incidentReadiness: string[];
    redTeamSecurity: string[];
    redTeamResults: string[];
    useCases: string[];
  };
  oodaPhase: OODAPhase;
  relatedPDFs?: Array<{
    pdfId: string;
    itemIds?: string[];
    relevance?: BilingualText;
  }>;
  createdAt?: string;
  updatedAt?: string;
}
```

- [ ] **Step 2: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 erreur. Les 31 use-cases dans `compassContent.ts` restent valides (champ optionnel).

- [ ] **Step 3: Commit**

```bash
git add types/compass.ts
git commit -m "feat(compass): add optional relatedPDFs field to CompassUseCase

Permet de lier un use-case COMPASS à des références PDF OWASP
(pdfId + itemIds spécifiques + relevance optionnelle).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Créer le script de parsing du PDF

**Files:**
- Create: `scripts/parse-owasp-data-security-pdf.cjs`
- Input: `data_ai_risk/extracted/OWASP-GenAI-Data-Security-2026-v1.0.txt` (existant)
- Output: `data/owaspDataSecurity2026.generated.ts` (créé en Task 4)

- [ ] **Step 1: Créer le script avec parsing et validation**

Créer `scripts/parse-owasp-data-security-pdf.cjs` avec le contenu suivant :

```javascript
// Parser for OWASP GenAI Data Security Risks and Mitigations 2026 v1.0
// Extracts DSPM + 21 DSGAI entries from the layout-extracted PDF text
// and generates data/owaspDataSecurity2026.generated.ts
//
// Run: node scripts/parse-owasp-data-security-pdf.cjs

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_TXT = path.join(ROOT, 'data_ai_risk', 'extracted', 'OWASP-GenAI-Data-Security-2026-v1.0.txt');
const OUTPUT_TS = path.join(ROOT, 'data', 'owaspDataSecurity2026.generated.ts');

// ── 1. Read input ─────────────────────────────────────────────
if (!fs.existsSync(INPUT_TXT)) {
  console.error(`FAIL: input file not found: ${INPUT_TXT}`);
  console.error('Run first: /mingw64/bin/pdftotext -layout data_ai_risk/OWASP-GenAI-Data-Security-Risks-and-Mitigations-2026-v1.0.pdf data_ai_risk/extracted/OWASP-GenAI-Data-Security-2026-v1.0.txt');
  process.exit(1);
}
const raw = fs.readFileSync(INPUT_TXT, 'utf-8');

// ── 2. Pre-clean: strip page markers, normalize bullets ──────
const lines = raw
  .split(/\r?\n/)
  .filter(l => !/^genai\.owasp\.org\s+Page\s+\d+$/i.test(l.trim()))
  .filter(l => !/^\s*Page\s+\d+\s*$/.test(l));

// The PDF uses U+FFFD / bullet char � for list markers — normalize to •
const BULLET_RE = /[\u2022\u25CF\u00B7\uFFFD\u25AA]\s*/g;

// ── 3. Section recognizers ────────────────────────────────────
const SECTION_MAP = {
  'How the attack unfolds': 'overview',
  'Attacker Capabilities': 'attackVectors',
  'Illustrative scenario': 'examples',
  'Impact': 'impacts',
  'Mitigations': 'mitigations',
  'Tier 1 (foundational)': 'tier1',
  'Tier 2 (hardening)': 'tier2',
  'Tier 3 (advanced)': 'tier3',
  'Known CVEs / exploits': 'knownCVEs',
  'Known CVEs / Exploits': 'knownCVEs',
  'References': 'references',
};

// DSGAI header can span 2 lines; handle "DSGAI01 -- Title" or "DSGAI01 --" followed by next line
function detectHeader(lineA, lineB) {
  const joined = `${lineA.trim()} ${lineB ? lineB.trim() : ''}`.trim();
  const m = joined.match(/^(DSGAI\d{2})\s+--\s+(.+?)(?:\s{2,}\d+)?$/);
  if (m) return { code: m[1], title: m[2].trim() };
  return null;
}

// ── 4. Parse ──────────────────────────────────────────────────
const risks = [];
let current = null;
let section = null;
let buffer = [];

function flushBuffer() {
  if (!current || !section || buffer.length === 0) { buffer = []; return; }
  const joined = buffer.join(' ').replace(/\s+/g, ' ').trim();
  if (!joined) { buffer = []; return; }

  const putSingle = (key, val) => {
    current.detailedSections[key] = ((current.detailedSections[key] || '') + ' ' + val).trim();
  };
  const splitBullets = (txt) => txt
    .split(BULLET_RE)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const tiers = ['tier1', 'tier2', 'tier3'];
  const lists = ['attackVectors', 'examples', 'impacts', 'mitigations', 'knownCVEs', 'references'];

  if (section === 'overview') {
    putSingle('overview', joined);
  } else if (lists.includes(section)) {
    const items = splitBullets(joined);
    current.detailedSections[section] = [...(current.detailedSections[section] || []), ...items];
  } else if (tiers.includes(section)) {
    const items = splitBullets(joined);
    current.detailedSections.mitigationTiers = current.detailedSections.mitigationTiers || {};
    current.detailedSections.mitigationTiers[section] = [
      ...(current.detailedSections.mitigationTiers[section] || []),
      ...items,
    ];
  }
  buffer = [];
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  if (!trimmed) { buffer.push(''); continue; }

  const header = detectHeader(line, lines[i + 1]);
  if (header) {
    flushBuffer();
    current = {
      id: header.code.toLowerCase(),
      code: header.code,
      title: header.title,
      detailedSections: {},
    };
    risks.push(current);
    section = null;
    // Skip continuation line if we consumed it
    if (!trimmed.match(/^DSGAI\d{2}\s+--\s+.+/)) i++;
    continue;
  }

  if (SECTION_MAP[trimmed]) {
    flushBuffer();
    section = SECTION_MAP[trimmed];
    continue;
  }

  if (current && section) buffer.push(trimmed);
}
flushBuffer();

// ── 5. Add DSPM synthetic entry (manually extracted from pages 9-12) ──
// The DSPM section precedes DSGAI01 and covers 13 capability categories.
const dspm = {
  id: 'dspm-genai',
  code: 'DSPM',
  title: 'DSPM for GenAI (AI-DSPM)',
  detailedSections: {
    overview: 'AI-DSPM (Data Security Posture Management) for GenAI is the continuous practice of discovering, classifying, governing, and monitoring data across GenAI pipelines and runtimes, so you can see where sensitive data exists, understand how it flows/derives (e.g., into embeddings or logs), and enforce controls that prevent exposure, tampering, and non-compliance.',
    mitigations: [
      '1) GenAI data asset discovery & inventory — training/fine-tune datasets, prompt templates, agent memory, RAG sources, vector DB collections, tool integrations, logs/traces.',
      '2) Data classification, labeling & policy binding — extend classic classification to prompts, embeddings, tool payloads, observability events; labels must propagate to derivatives.',
      '3) Data flow mapping, lineage & GenAI BOM (DBOM via CycloneDX ML-BOM ECMA-424 v1.7).',
      '4) Access governance & entitlement posture (including agents) — RBAC/ABAC, short-lived credentials, per-agent scoped permissions, Just-in-Time (JIT) data access.',
      '5) Prompt, RAG, and output-layer DLP controls — input/output PII scanning, retrieval-time redaction, per-document ACL enforcement, no-train/no-retain policies.',
      '6) Vector store & embedding security posture — encryption, tenant scoping, top-k controls, monitoring for unusual nearest-neighbor queries.',
      '7) Data integrity, poisoning & tamper detection — ingestion validation, drift detection, signed datasets, human review gates.',
      '8) Observability, telemetry & log-retention posture — least-logging defaults, tokenization/redaction in logs, short TTL, approval workflows.',
      '9) Third-party, plugin/tool, and connector governance — risk-rate every integration, inventory data shared.',
      '10) Lifecycle management, erasure & compliance readiness — delete/expire embeddings/indexes/caches tied to deleted sources, support DSR.',
      '11) Training governance & privacy-enhancing fine-tuning — PII redaction, synthetic data, Differential Privacy (DP-SGD), consent mapping (RTBF).',
      '12) Resilience posture for GenAI data dependencies — backups, replication, restore drills, rate limits.',
      '13) Human and Shadow AI controls — HITL labeling pipelines, unsanctioned GenAI SaaS detection.',
    ],
    references: [
      'https://owaspai.org/docs/1_general_controls/#data-minimize',
      'CycloneDX ML-BOM ECMA-424 v1.7',
    ],
  },
};

risks.unshift(dspm);

// ── 6. Priority heuristics (overridable by manual review) ────
const PRIORITY = {
  'DSPM':    'medium',
  'DSGAI01': 'critical',
  'DSGAI02': 'critical',
  'DSGAI03': 'high',
  'DSGAI04': 'critical',
  'DSGAI05': 'high',
  'DSGAI06': 'critical',
  'DSGAI07': 'high',
  'DSGAI08': 'medium',
  'DSGAI09': 'high',
  'DSGAI10': 'medium',
  'DSGAI11': 'critical',
  'DSGAI12': 'high',
  'DSGAI13': 'critical',
  'DSGAI14': 'medium',
  'DSGAI15': 'high',
  'DSGAI16': 'high',
  'DSGAI17': 'medium',
  'DSGAI18': 'high',
  'DSGAI19': 'medium',
  'DSGAI20': 'high',
  'DSGAI21': 'critical',
};

risks.forEach(r => {
  r.priority = PRIORITY[r.code] || 'medium';
  // Generate short `description` from overview (first 240 chars, sentence-bounded)
  const ov = r.detailedSections.overview || '';
  const desc = ov.length > 240 ? ov.slice(0, 240).replace(/\s+\S*$/, '') + '…' : ov;
  r.description = desc || r.title;
});

// ── 7. Editorial notes (cross-reference anomalies detected) ───
const editorialNotes = [
  'The published taxonomy contains exactly 21 DSGAI (DSGAI01–DSGAI21). Cross-references to DSGAI22–DSGAI26 appear in the source text (lines referencing "DSGAI25", "DSGAI26") but are orphan references from an earlier draft numbering — no such risks exist in the final document.',
  'Line 3803 cross-reference "see DSGAI13 (Synthetic Data, Anonymization & Transformation Pitfalls)" is mislabeled in the source PDF: DSGAI13 is actually "Vector Store Platform Data Security" and Synthetic Data corresponds to DSGAI10.',
];

// ── 8. Validation ─────────────────────────────────────────────
const dsgaiCount = risks.filter(r => r.code.startsWith('DSGAI')).length;
if (dsgaiCount !== 21) {
  console.error(`FAIL: expected 21 DSGAI, got ${dsgaiCount}`);
  console.error('Codes found:', risks.map(r => r.code).join(', '));
  process.exit(1);
}

const codes = risks.map(r => r.code);
if (new Set(codes).size !== codes.length) {
  console.error('FAIL: duplicate codes detected:', codes);
  process.exit(1);
}

for (const r of risks) {
  if (!r.title || r.title.length < 3) {
    console.error(`FAIL: ${r.code} missing title (got: "${r.title}")`);
    process.exit(1);
  }
  if (!r.detailedSections.overview || r.detailedSections.overview.length < 50) {
    console.error(`FAIL: ${r.code} overview too short (${r.detailedSections.overview?.length || 0} chars)`);
    process.exit(1);
  }
}

// ── 9. Emit TypeScript ────────────────────────────────────────
const header = `// AUTO-GENERATED — do not edit manually.
// Source: data_ai_risk/OWASP-GenAI-Data-Security-Risks-and-Mitigations-2026-v1.0.pdf
// Regenerate: node scripts/parse-owasp-data-security-pdf.cjs
// Generated: ${new Date().toISOString()}
// License: CC BY-SA 4.0 (OWASP GenAI Security Project)

import type { ReferenceItem } from './pdfReferences';

export const owaspDataSecurity2026KeyItems: ReferenceItem[] = ${JSON.stringify(risks, null, 2)};

export const owaspDataSecurity2026EditorialNotes: string[] = ${JSON.stringify(editorialNotes, null, 2)};
`;

fs.writeFileSync(OUTPUT_TS, header, 'utf-8');

console.log(`✓ Wrote ${risks.length} keyItems to ${path.relative(ROOT, OUTPUT_TS)}`);
console.log(`  - DSPM: ${risks.some(r => r.code === 'DSPM') ? 'yes' : 'no'}`);
console.log(`  - DSGAI count: ${dsgaiCount}`);
console.log(`  - Total size: ${Math.round(header.length / 1024)} KB`);
console.log(`  - Priority breakdown: critical=${risks.filter(r => r.priority === 'critical').length}, high=${risks.filter(r => r.priority === 'high').length}, medium=${risks.filter(r => r.priority === 'medium').length}`);
```

- [ ] **Step 2: Commit le script (avant exécution)**

```bash
git add scripts/parse-owasp-data-security-pdf.cjs
git commit -m "feat(scripts): add parser for OWASP GenAI Data Security 2026 PDF

Parses data_ai_risk/extracted/*.txt and generates data/owaspDataSecurity2026.generated.ts
containing 22 ReferenceItem (DSPM + 21 DSGAI). Fails with exit != 0 if DSGAI count
!= 21 or validation fails.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Exécuter le script et vérifier le fichier généré

**Files:**
- Create (via script): `data/owaspDataSecurity2026.generated.ts`

- [ ] **Step 1: Exécuter le script**

Run: `node scripts/parse-owasp-data-security-pdf.cjs`
Expected output:
```
✓ Wrote 22 keyItems to data/owaspDataSecurity2026.generated.ts
  - DSPM: yes
  - DSGAI count: 21
  - Total size: ~NN KB
  - Priority breakdown: critical=7, high=9, medium=6
```

Si le script échoue : lire le message d'erreur. Les causes probables :
- Encodage des bullets différent → ajuster la regex `BULLET_RE` dans le script
- Titre multi-ligne non capturé → ajuster `detectHeader`

- [ ] **Step 2: Vérifier le fichier généré**

Run: `node -e "const d=require('./data/owaspDataSecurity2026.generated.ts'.replace('.ts','')); console.log(d);"` → NE FONCTIONNERA PAS (fichier TS).

À la place : ouvrir `data/owaspDataSecurity2026.generated.ts`, vérifier :
- Première ligne : commentaire `AUTO-GENERATED`
- Export `owaspDataSecurity2026KeyItems` avec 22 entrées
- Codes présents (vérif via grep) :

Run: `grep -oE '"code": "DSGAI[0-9]+"' data/owaspDataSecurity2026.generated.ts | sort -u | wc -l`
Expected: `21`

Run: `grep -oE '"code": "DSPM"' data/owaspDataSecurity2026.generated.ts | wc -l`
Expected: `1`

- [ ] **Step 3: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 erreur (l'import `ReferenceItem` doit résoudre correctement).

- [ ] **Step 4: Commit**

```bash
git add data/owaspDataSecurity2026.generated.ts
git commit -m "feat(data): generate owaspDataSecurity2026.generated.ts

22 keyItems (DSPM + 21 DSGAI) extracted from
OWASP-GenAI-Data-Security-Risks-and-Mitigations-2026-v1.0.pdf.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Ajouter l'entrée #8 dans pdfReferences.ts

**Files:**
- Modify: `data/pdfReferences.ts` (fin du tableau `pdfReferences`, juste avant `];`)

- [ ] **Step 1: Ajouter l'import en haut du fichier**

Au-dessus de `export const pdfReferences: PDFReference[] = [` (après les imports/types), ajouter :

```typescript
import { owaspDataSecurity2026KeyItems, owaspDataSecurity2026EditorialNotes } from './owaspDataSecurity2026.generated';
```

Note : l'import doit suivre l'ordre Java/TS standard. Si le fichier ne contient pas d'imports actuels, ajouter juste après la première ligne de commentaires.

- [ ] **Step 2: Ajouter l'entrée #8 dans le tableau**

Juste avant `];` fermant `pdfReferences`, ajouter (avec la virgule précédente si besoin) :

```typescript
  // ─────────────────────────────────────────────────────────
  // 8. OWASP GenAI Data Security Risks and Mitigations 2026 v1.0
  // ─────────────────────────────────────────────────────────
  {
    id: 'genai-data-security-2026',
    title: 'OWASP GenAI Data Security Risks and Mitigations 2026 v1.0',
    source: 'OWASP-GenAI-Data-Security-Risks-and-Mitigations-2026-v1.0.pdf',
    category: 'data-security',
    url: 'https://genai.owasp.org',
    documentMeta: {
      version: '1.0',
      publicationDate: '2026-03',
      pages: 103,
      license: 'CC BY-SA 4.0',
      authors: [
        'Scott Clinton (OWASP GenAI Co-founder)',
        'Kyriakos "Rock" Lambros (Zenity)',
        'Emmanuel Guilherme Junior (Data Security Initiative Lead)',
      ],
    },
    summary: 'Évolution du LLM and GenAI Data Security Best Practices Guide (février 2025). Couvre la sécurité des données dans les systèmes LLM, GenAI et Agentic AI à travers 21 risques DSGAI (leakage, poisoning, shadow AI, RAG, vector stores, telemetry, inference, etc.) organisés par flux de données. Introduit DSPM for GenAI (13 capability categories) pour la gestion posturale des données. Chaque risque est structuré avec attack vectors, illustrative scenarios, impacts et 3 tiers de mitigations (Foundational/Hardening/Advanced, Buy/Build). Licence CC BY-SA 4.0. Content extracted and adapted from OWASP GenAI Data Security Risks and Mitigations 2026 v1.0 under CC BY-SA 4.0.',
    keyItems: owaspDataSecurity2026KeyItems.map(item => ({
      ...item,
      detailedSections: item.detailedSections
        ? {
            ...item.detailedSections,
            // Attache les notes éditoriales seulement au premier item (DSPM) pour éviter duplication
            editorialNotes:
              item.code === 'DSPM'
                ? owaspDataSecurity2026EditorialNotes
                : item.detailedSections.editorialNotes,
          }
        : item.detailedSections,
    })),
  },
```

- [ ] **Step 3: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 erreur. Si erreur sur `category: 'data-security'` : vérifier que le type `PDFCategory` de la Task 1 inclut bien `'data-security'`.

- [ ] **Step 4: Vérifier visuellement la structure**

Run: `grep -c "^  {" data/pdfReferences.ts`
Expected: `8` (7 existantes + la nouvelle).

Run: `grep -E "id: '(owasp-agentic-top10|securing-agentic-guide|mcp-server-security|mcp-third-party-cheatsheet|vendor-eval-red-teaming|compass-runbook|genai-ir-guide|genai-data-security-2026)'" data/pdfReferences.ts | wc -l`
Expected: `8`.

- [ ] **Step 5: Commit**

```bash
git add data/pdfReferences.ts
git commit -m "feat(pdfReferences): add OWASP GenAI Data Security 2026 v1.0 entry

Entry #8 with 22 keyItems (DSPM + 21 DSGAI), new category 'data-security',
full documentMeta (version, authors, license CC BY-SA 4.0), editorial notes
on orphan DSGAI22-26 references.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Créer compassPDFMapping.ts

**Files:**
- Create: `data/compassPDFMapping.ts`

- [ ] **Step 1: Lire les 31 CompassUseCase pour identifier les priorités**

Run: `grep -E '"id": "COMPASS-UC-' data/compassContent.ts | head -40`
Run: `grep -E '"riskLevel": "critical"' data/compassContent.ts | head -10`

Identifier au minimum les 7 use-cases `critical` pour garantir leur couverture dans le mapping.

- [ ] **Step 2: Créer le fichier avec le mapping initial**

```typescript
// Mapping explicite entre CompassUseCase.id et les références PDF OWASP.
// Généré initialement par heuristiques mots-clés, puis révisable manuellement.
// Source du mapping : spec docs/superpowers/specs/2026-04-20-owasp-data-security-pdf-ingestion-design.md §6.

import type { BilingualText } from '../types/compass';

export interface PDFLink {
  pdfId: string;
  itemIds?: string[];
  relevance?: BilingualText;
}

/**
 * Mapping CompassUseCase.id → PDFLink[]
 * Chaque use-case peut pointer vers plusieurs PDF + items spécifiques.
 * Ne pas supprimer les mappings existants sans revue.
 */
export const compassPDFMapping: Record<string, PDFLink[]> = {
  // CRITICAL use cases — couverture prioritaire
  'COMPASS-UC-0001': [
    // Jailbreak of internal chatbot — prompt manipulation
    { pdfId: 'genai-data-security-2026', itemIds: ['dsgai01', 'dsgai11', 'dsgai15'] },
    { pdfId: 'owasp-agentic-top10', itemIds: ['asi01'] },
  ],
  // Les autres use-cases critical/high seront enrichis par itération.
  // Le composant UI gère gracieusement l'absence de mapping (pas de panneau affiché).
};

/**
 * Helper : récupère les PDFLink pour un use-case donné.
 * Renvoie [] si aucun mapping défini.
 */
export function getPDFLinksForUseCase(useCaseId: string): PDFLink[] {
  return compassPDFMapping[useCaseId] || [];
}
```

- [ ] **Step 3: Compléter le mapping pour les 7 use-cases `critical`**

Lire les 7 use-cases critical depuis `data/compassContent.ts` (grep sur `"riskLevel": "critical"` puis remonter jusqu'à l'id). Pour chacun, identifier les DSGAI pertinents via les règles mots-clés :

| Pattern détecté | DSGAI à lier |
|---|---|
| `jailbreak`, `bypass`, `prompt injection`, `control bypass` | `dsgai01`, `dsgai11`, `dsgai15` |
| `data leak`, `exfil`, `PII`, `sensitive data` | `dsgai01`, `dsgai14` |
| `agent`, `autonomous`, `delegation`, `credential` | `dsgai02`, `dsgai06` |
| `RAG`, `retrieval`, `vector` | `dsgai13`, `dsgai15` |
| `poisoning`, `tampering`, `supply chain` | `dsgai04`, `dsgai05`, `dsgai21` |
| `shadow`, `unsanctioned`, `SaaS`, `productivity tools` | `dsgai03`, `dsgai16` |
| `model extraction`, `IP theft`, `distillation` | `dsgai20` |
| `biometric`, `multimodal`, `voice`, `image` | `dsgai09` |
| `compliance`, `GDPR`, `HIPAA`, `regulatory` | `dsgai07`, `dsgai08` |
| `inference`, `reconstruction`, `membership` | `dsgai18` |

Ajouter les entrées dans `compassPDFMapping` (entre `COMPASS-UC-0001` et `// Les autres use-cases ...`). Exemple pour un use-case de type "data exfiltration" :

```typescript
  'COMPASS-UC-XXXX': [
    { pdfId: 'genai-data-security-2026', itemIds: ['dsgai01', 'dsgai14'] },
  ],
```

Minimum requis : **les 7 use-cases `critical` ont au moins un mapping vers le nouveau PDF** (`genai-data-security-2026`).

- [ ] **Step 4: Vérifier TypeScript et cohérence des IDs**

Run: `npx tsc --noEmit`
Expected: 0 erreur.

Run: `grep -oE "'dsgai[0-9]+'" data/compassPDFMapping.ts | sort -u`
Expected: tous les IDs matchent les codes générés (dsgai01..dsgai21).

- [ ] **Step 5: Commit**

```bash
git add data/compassPDFMapping.ts
git commit -m "feat(compass): add compassPDFMapping linking use-cases to OWASP PDFs

Mapping explicite (révisable) entre CompassUseCase.id et les références
PDF/items. Couvre les 7 use-cases critical avec lien vers DSGAI pertinents.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Créer le composant CompassOWASPReferences

**Files:**
- Create: `components/compass/CompassOWASPReferences.tsx`

- [ ] **Step 1: Lire les composants UI existants pour suivre les patterns**

Run: `cat components/ui/Card.tsx | head -30`
Run: `cat components/ui/Accordion.tsx | head -30 2>/dev/null || ls components/ui/`

Identifier :
- Import de `Card` (default export)
- Existence d'un `Accordion` dans `components/ui/`
- Le hook `useLanguage` et la structure `BilingualText`

- [ ] **Step 2: Créer le composant**

```tsx
import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import { pdfReferences, type PDFReference } from '../../data/pdfReferences';
import { useLanguage } from '../../contexts/LanguageContext';

const RELEVANT_CATEGORIES = ['data-security', 'governance', 'agentic-security'] as const;

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

const CATEGORY_LABELS: Record<string, { fr: string; en: string }> = {
  'data-security': { fr: 'Sécurité des Données', en: 'Data Security' },
  'governance': { fr: 'Gouvernance', en: 'Governance' },
  'agentic-security': { fr: 'Sécurité Agentique', en: 'Agentic Security' },
};

const CompassOWASPReferences: React.FC = () => {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [expandedPdfId, setExpandedPdfId] = useState<string | null>(null);

  const relevantRefs = pdfReferences.filter(r =>
    (RELEVANT_CATEGORIES as readonly string[]).includes(r.category)
  );

  if (relevantRefs.length === 0) return null;

  const t = {
    title: language === 'fr' ? 'Documents OWASP de référence' : 'OWASP Reference Documents',
    subtitle: language === 'fr'
      ? `${relevantRefs.length} documents liés à ce module COMPASS`
      : `${relevantRefs.length} documents related to this COMPASS module`,
    keyItemsLabel: language === 'fr' ? 'éléments clés' : 'key items',
    openSource: language === 'fr' ? 'Source OWASP' : 'OWASP source',
    viewDetails: language === 'fr' ? 'Voir le détail' : 'View details',
  };

  return (
    <Card className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blue-400" aria-hidden="true" />
          <div>
            <h3 className="font-semibold text-white">{t.title}</h3>
            <p className="text-sm text-gray-400">{t.subtitle}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-700 p-4 space-y-3">
          {relevantRefs.map(ref => (
            <PDFRefCard
              key={ref.id}
              pdf={ref}
              isExpanded={expandedPdfId === ref.id}
              onToggle={() => setExpandedPdfId(expandedPdfId === ref.id ? null : ref.id)}
              labels={t}
              language={language}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

interface PDFRefCardProps {
  pdf: PDFReference;
  isExpanded: boolean;
  onToggle: () => void;
  labels: { keyItemsLabel: string; openSource: string; viewDetails: string };
  language: 'fr' | 'en';
}

const PDFRefCard: React.FC<PDFRefCardProps> = ({ pdf, isExpanded, onToggle, labels, language }) => {
  const categoryLabel = CATEGORY_LABELS[pdf.category]?.[language] || pdf.category;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between p-3 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
              {categoryLabel}
            </span>
            {pdf.documentMeta?.version && (
              <span className="text-xs text-gray-500">v{pdf.documentMeta.version}</span>
            )}
          </div>
          <h4 className="font-medium text-white text-sm">{pdf.title}</h4>
          <p className="text-xs text-gray-400 mt-1">
            {pdf.keyItems.length} {labels.keyItemsLabel}
            {pdf.documentMeta?.pages && ` • ${pdf.documentMeta.pages} pages`}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" aria-hidden="true" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-700 p-3 space-y-2">
          <p className="text-xs text-gray-300 leading-relaxed">{pdf.summary}</p>

          {pdf.url && (
            <a
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
              {labels.openSource}
            </a>
          )}

          <ul className="space-y-1 mt-2">
            {pdf.keyItems.slice(0, 10).map(item => (
              <li key={item.id} className="flex items-start gap-2 text-xs">
                <span
                  className={`px-1.5 py-0.5 rounded border text-[10px] font-mono flex-shrink-0 ${
                    PRIORITY_COLORS[item.priority || 'medium']
                  }`}
                >
                  {item.code || item.id.toUpperCase()}
                </span>
                <span className="text-gray-300">{item.title}</span>
              </li>
            ))}
            {pdf.keyItems.length > 10 && (
              <li className="text-xs text-gray-500 italic pl-2">
                … +{pdf.keyItems.length - 10} autres
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompassOWASPReferences;
```

- [ ] **Step 3: Vérifier TypeScript**

Run: `npx tsc --noEmit`
Expected: 0 erreur. Si erreur sur `useLanguage` : vérifier le chemin d'import (`contexts/LanguageContext.tsx`).

- [ ] **Step 4: Commit**

```bash
git add components/compass/CompassOWASPReferences.tsx
git commit -m "feat(compass): add CompassOWASPReferences component

Bannière repliable listant tous les documents OWASP pertinents pour COMPASS
(categories: data-security, governance, agentic-security). Affiche metadata
(version, pages) et les 10 premiers keyItems par document avec code+priority.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Intégrer CompassOWASPReferences dans CompassUseCasesView

**Files:**
- Modify: `components/compass/CompassUseCasesView.tsx`

- [ ] **Step 1: Lire le fichier pour localiser la zone d'insertion**

Run: lire `components/compass/CompassUseCasesView.tsx` en entier.

Identifier :
- Les imports existants en haut
- L'endroit où `CompassFilters` est rendu (le nouveau composant doit se situer AVANT les filtres)

- [ ] **Step 2: Ajouter l'import**

En haut du fichier, après les autres imports de composants compass :

```tsx
import CompassOWASPReferences from './CompassOWASPReferences';
```

- [ ] **Step 3: Rendre le composant juste avant `CompassFilters`**

Dans le JSX, juste avant la ligne qui rend `<CompassFilters ... />`, ajouter :

```tsx
<CompassOWASPReferences />
```

Exemple de contexte :

```tsx
return (
  <div className="space-y-4">
    <h1>{/* titre existant */}</h1>
    <CompassOWASPReferences />   {/* ← NOUVEAU */}
    <CompassFilters ... />
    <CompassStatistics ... />
    {/* grid use cases */}
  </div>
);
```

- [ ] **Step 4: Vérifier TypeScript et rendu**

Run: `npx tsc --noEmit`
Expected: 0 erreur.

Run: `npm run dev` (si pas déjà lancé) puis http://localhost:5080 → Référentiels → OWASP COMPASS.
Expected: une bannière bleue « Documents OWASP de référence » visible en tête. Cliquer pour la déplier doit montrer 3+ PDFs (au moins le nouveau + compass-runbook + agentic-top10).

- [ ] **Step 5: Commit**

```bash
git add components/compass/CompassUseCasesView.tsx
git commit -m "feat(compass): integrate OWASP references banner at top of COMPASS view

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Enrichir CompassUseCaseModal avec le panneau « Références OWASP liées »

**Files:**
- Modify: `components/compass/CompassUseCaseModal.tsx`

- [ ] **Step 1: Lire le modal actuel**

Run: lire `components/compass/CompassUseCaseModal.tsx` en entier. Identifier la structure JSX et où insérer le panneau (idéalement après les sections existantes comme `relatedSheets` ou `attackMapping`).

- [ ] **Step 2: Ajouter les imports nécessaires**

En haut du fichier :

```tsx
import { pdfReferences } from '../../data/pdfReferences';
import { getPDFLinksForUseCase } from '../../data/compassPDFMapping';
import { BookOpen } from 'lucide-react';
```

- [ ] **Step 3: Calculer les références au début du composant**

Juste après les hooks du composant (avant le `return`) :

```tsx
const pdfLinks = getPDFLinksForUseCase(useCase.id);
const resolvedLinks = pdfLinks.map(link => {
  const pdf = pdfReferences.find(r => r.id === link.pdfId);
  if (!pdf) return null;
  const items = link.itemIds
    ? pdf.keyItems.filter(i => link.itemIds!.includes(i.id))
    : [];
  return { pdf, items, relevance: link.relevance };
}).filter(Boolean) as Array<{
  pdf: typeof pdfReferences[number];
  items: typeof pdfReferences[number]['keyItems'];
  relevance?: { fr: string; en: string };
}>;
```

- [ ] **Step 4: Ajouter la section JSX**

Dans le JSX, après les sections existantes (`relatedSheets`, `attackMapping`, etc.), avant la fin du modal, ajouter :

```tsx
{resolvedLinks.length > 0 && (
  <section className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
    <div className="flex items-center gap-2 mb-3">
      <BookOpen className="w-5 h-5 text-blue-400" aria-hidden="true" />
      <h3 className="font-semibold text-white">
        {language === 'fr' ? 'Références OWASP liées' : 'Related OWASP References'}
      </h3>
    </div>
    <div className="space-y-3">
      {resolvedLinks.map(({ pdf, items, relevance }) => (
        <div key={pdf.id} className="bg-gray-900/50 rounded p-3">
          <h4 className="text-sm font-medium text-blue-300 mb-2">{pdf.title}</h4>
          {relevance && (
            <p className="text-xs text-gray-400 italic mb-2">{relevance[language]}</p>
          )}
          <ul className="space-y-1.5">
            {items.map(item => (
              <li key={item.id} className="flex items-start gap-2 text-xs">
                <span
                  className={`px-1.5 py-0.5 rounded border text-[10px] font-mono flex-shrink-0 ${
                    item.priority === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    item.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                    item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                    'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {item.code || item.id.toUpperCase()}
                </span>
                <div className="flex-1">
                  <span className="text-gray-200 font-medium">{item.title}</span>
                  {item.detailedSections?.overview && (
                    <p className="text-gray-400 mt-0.5 text-[11px] leading-relaxed">
                      {item.detailedSections.overview.slice(0, 200)}
                      {item.detailedSections.overview.length > 200 ? '…' : ''}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </section>
)}
```

Remarque : `language` doit être disponible via `useLanguage()` dans ce composant. Si déjà importé, réutiliser. Sinon, ajouter `import { useLanguage } from '../../contexts/LanguageContext';` et `const { language } = useLanguage();`.

- [ ] **Step 5: Vérifier TypeScript et rendu**

Run: `npx tsc --noEmit`
Expected: 0 erreur.

Visuel : http://localhost:5080 → COMPASS → cliquer sur le use-case « Jailbreak of internal chatbot » (COMPASS-UC-0001, le seul mappé minimum) → vérifier que la section « Références OWASP liées » apparaît avec DSGAI01, DSGAI11, DSGAI15.

- [ ] **Step 6: Commit**

```bash
git add components/compass/CompassUseCaseModal.tsx
git commit -m "feat(compass): add 'Related OWASP References' panel in use case modal

Affiche les PDFLink résolus via getPDFLinksForUseCase(). Chaque item montre
code+priority badge + titre + 200 premiers caractères du detailedSections.overview.
Section masquée si le use-case n'a pas de mapping.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Intégrer la nouvelle référence dans le Wiki Red Teamer

**Files:**
- Modify: `data/wikiContent.tsx`

- [ ] **Step 1: Lire le pattern existant**

Run: lire `data/wikiContent.tsx` lignes 200-300 pour voir comment les 7 PDF existants sont résolus et rendus (pattern `const XXX_REF = pdfReferences.find(...)!;`).

- [ ] **Step 2: Ajouter la constante de résolution**

Après les 7 constantes existantes (vers ligne 207), ajouter :

```tsx
const DATA_SECURITY_REF = pdfReferences.find(r => r.id === 'genai-data-security-2026')!;
```

- [ ] **Step 3: Ajouter une section Wiki dédiée**

Suivant le pattern du rendu existant (grep pour `IR_GUIDE_REF` pour voir comment la 7ème section est rendue), ajouter une nouvelle section dans le JSX exporté du wiki.

Exemple de structure (à placer après la section IR_GUIDE dans le JSX) :

```tsx
{
  id: 'data-security-genai',
  title: {
    fr: 'Sécurité des Données GenAI (OWASP DSGAI)',
    en: 'GenAI Data Security (OWASP DSGAI)',
  },
  icon: <Database className="w-5 h-5" />,
  content: (
    <div className="space-y-4">
      <p className="text-sm text-gray-300">
        <Highlight text={DATA_SECURITY_REF.summary} highlight={searchQuery} />
      </p>

      {DATA_SECURITY_REF.documentMeta && (
        <div className="text-xs text-gray-400 flex flex-wrap gap-3">
          <span>Version {DATA_SECURITY_REF.documentMeta.version}</span>
          <span>{DATA_SECURITY_REF.documentMeta.pages} pages</span>
          <span>Licence {DATA_SECURITY_REF.documentMeta.license}</span>
        </div>
      )}

      <div className="space-y-2">
        {DATA_SECURITY_REF.keyItems.map(item => (
          <details key={item.id} className="bg-gray-800/50 rounded-lg border border-gray-700">
            <summary className="cursor-pointer p-3 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${priorityColors[item.priority || 'medium']}`}>
                {item.code || item.id.toUpperCase()}
              </span>
              <span className="text-sm font-medium text-white">
                <Highlight text={item.title} highlight={searchQuery} />
              </span>
            </summary>
            <div className="p-3 pt-0 text-xs text-gray-300 space-y-3">
              {item.detailedSections?.overview && (
                <div>
                  <div className="font-semibold text-gray-200 mb-1">Overview</div>
                  <p className="leading-relaxed">{item.detailedSections.overview}</p>
                </div>
              )}
              {item.detailedSections?.attackVectors && item.detailedSections.attackVectors.length > 0 && (
                <div>
                  <div className="font-semibold text-gray-200 mb-1">Attack Vectors</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {item.detailedSections.attackVectors.map((v, i) => <li key={i}>{v}</li>)}
                  </ul>
                </div>
              )}
              {item.detailedSections?.mitigationTiers && (
                <div>
                  <div className="font-semibold text-gray-200 mb-1">Mitigations tiered</div>
                  {(['tier1', 'tier2', 'tier3'] as const).map(tier =>
                    item.detailedSections?.mitigationTiers?.[tier]?.length ? (
                      <div key={tier} className="mt-2">
                        <div className="text-[11px] uppercase tracking-wide text-blue-400">
                          {tier === 'tier1' ? 'Tier 1 (Foundational)' : tier === 'tier2' ? 'Tier 2 (Hardening)' : 'Tier 3 (Advanced)'}
                        </div>
                        <ul className="list-disc pl-5 mt-1 space-y-0.5">
                          {item.detailedSections.mitigationTiers[tier]!.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </div>
                    ) : null
                  )}
                </div>
              )}
              {item.detailedSections?.knownCVEs && item.detailedSections.knownCVEs.length > 0 && (
                <div>
                  <div className="font-semibold text-gray-200 mb-1">Known CVEs / exploits</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {item.detailedSections.knownCVEs.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  ),
},
```

Note : l'icône `Database` doit déjà être importée (cf. ligne 6 du fichier). Si absente : ajouter à l'import lucide-react.

- [ ] **Step 4: Vérifier TypeScript et rendu**

Run: `npx tsc --noEmit`
Expected: 0 erreur.

Visuel : http://localhost:5080 → Référentiels → Wiki Red Teamer → naviguer à la nouvelle section « Sécurité des Données GenAI ». Vérifier les 22 accordions (DSPM + 21 DSGAI). Cliquer DSGAI01 → voir overview, attack vectors, tiers de mitigation, CVEs.

- [ ] **Step 5: Commit**

```bash
git add data/wikiContent.tsx
git commit -m "feat(wiki): add GenAI Data Security DSGAI section in Wiki Red Teamer

22 accordions (DSPM + 21 DSGAI) avec overview, attack vectors,
3 tiers de mitigations et CVEs. Affiche metadata documentMeta.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Validation finale & tests non-régression

**Files:** aucune modification — validation uniquement.

- [ ] **Step 1: TypeScript global**

Run: `npx tsc --noEmit`
Expected: 0 erreur sur l'ensemble du projet (frontend + types).

- [ ] **Step 2: Build production**

Run: `npm run build`
Expected: build successful. Pas de warning critique. Bundle size raisonnable (hausse attendue ~20-50 KB pour le fichier généré).

- [ ] **Step 3: Vérification visuelle globale (golden path)**

Run: `npm run dev` (si pas déjà)

Scénarios à tester à http://localhost:5080 :

1. **Section globale COMPASS** :
   - Naviguer : Référentiels → OWASP COMPASS
   - Vérifier : bannière « Documents OWASP de référence » visible en tête, repliable
   - Déplier : au moins 3 PDFs listés (le nouveau + compass-runbook + agentic-top10)

2. **Panneau modal COMPASS** :
   - Cliquer sur use-case COMPASS-UC-0001 (« Jailbreak of internal chatbot »)
   - Vérifier : section « Références OWASP liées » apparaît dans le modal
   - Vérifier : DSGAI01, DSGAI11, DSGAI15 listés avec badges priority

3. **Wiki Red Teamer** :
   - Naviguer : Référentiels → Wiki
   - Vérifier : nouvelle section « Sécurité des Données GenAI (OWASP DSGAI) »
   - Vérifier : 22 accordions (DSPM + DSGAI01 à DSGAI21)
   - Cliquer DSGAI01 : voir overview, attack vectors, tiers (Foundational/Hardening/Advanced), CVEs

4. **Bilingue FR/EN** :
   - Basculer la langue → pas de chaîne non-traduite visible dans les nouvelles sections UI (contenu PDF reste en EN, c'est attendu)

- [ ] **Step 4: Non-régression sur les 7 PDF existants**

Naviguer dans chaque section du Wiki contenant un PDF existant :
- OWASP Top 10 for Agentic Applications
- Securing Agentic Applications Guide
- MCP Server Security (2 docs)
- Vendor Evaluation Red Teaming
- COMPASS RunBook
- IR Guide

Vérifier : aucune régression, tous les `keyItems` s'affichent normalement.

- [ ] **Step 5: Mise à jour du CLAUDE.md (si nécessaire)**

Si la nouvelle catégorie `data-security` ou le nouveau fichier de mapping doit être documenté pour les futurs agents, ajouter une mention courte dans `CLAUDE.md` sous la section « Directory Structure » ou « Important Patterns ». Sinon, skip cette étape.

- [ ] **Step 6: Commit final de validation (tag optionnel)**

Si une modification mineure a été nécessaire (ex: correction d'un label) pendant la validation :

```bash
git add -A
git commit -m "chore(owasp-data-security): final validation adjustments

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

Sinon : aucun commit nécessaire. Le plan est terminé.

---

## Critères d'acceptation finaux

- [x] Spec committé : `docs/superpowers/specs/2026-04-20-owasp-data-security-pdf-ingestion-design.md`
- [ ] Script CJS exécuté sans erreur, 22 keyItems générés
- [ ] `data/pdfReferences.ts` contient 8 entrées, types étendus rétrocompatibles
- [ ] `types/compass.ts` déclare `relatedPDFs?` (aucun breaking change sur les 31 use-cases)
- [ ] `data/compassPDFMapping.ts` couvre les 7 use-cases `critical` du COMPASS
- [ ] Bannière « Documents OWASP de référence » visible en tête du module COMPASS
- [ ] Panneau « Références OWASP liées » visible dans le modal des use-cases mappés
- [ ] Wiki Red Teamer affiche la section DSGAI avec 22 accordions fonctionnels
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] `npm run build` réussit
- [ ] Aucune régression visuelle sur les 7 PDF existants

---

## Notes pour l'implémenteur

- **DRY** : ne pas dupliquer la logique de résolution `PDFLink → keyItem` — réutiliser `getPDFLinksForUseCase` partout.
- **YAGNI** : pas de sous-modal avec `detailedSections` complet dans le modal COMPASS (v1) — le Wiki suffit pour explorer le contenu intégral.
- **TDD** : la validation automatisée se fait via les assertions inline du script CJS + `tsc --noEmit`. Pas de framework de test frontend installé (Vitest prévu en Phase 3).
- **Bilingue** : le contenu extrait du PDF reste en anglais (fidélité au source CC BY-SA 4.0). Seuls les labels UI sont bilingues FR/EN.
- **Régénération** : si OWASP publie une v1.1, réexécuter `node scripts/parse-owasp-data-security-pdf.cjs` et réviser le mapping `compassPDFMapping.ts`.
- **Commits** : un commit par Task (≥1 commit). Tous les commits incluent le trailer `Co-Authored-By`.
