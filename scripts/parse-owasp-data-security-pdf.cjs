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

// The PDF uses U+FFFD / bullet char for list markers — normalize to •
const BULLET_RE = /[\u2022\u25CF\u00B7\uFFFD\u25AA]\s*/g;

// ── 3. Section recognizers ────────────────────────────────────
const SECTION_MAP = {
  'How the attack unfolds': 'overview',
  'How the violation materializes': 'overview',   // DSGAI08 variant
  'Attacker Capabilities': 'attackVectors',
  'Attacker capabilities': 'attackVectors',        // lowercase variant
  'Illustrative scenario': 'examples',
  'Impact': 'impacts',
  'Mitigations': 'mitigations',
  'Tier 1 (foundational)': 'tier1',
  'Tier 1 (Foundational)': 'tier1',               // capitalised variant
  'Tier 2 (hardening)': 'tier2',
  'Tier 2 (Hardening)': 'tier2',                  // capitalised variant
  'Tier 3 (advanced)': 'tier3',
  'Tier 3 (Advanced)': 'tier3',                   // capitalised variant
  'Known CVEs / exploits': 'knownCVEs',
  'Known CVEs / Exploits': 'knownCVEs',
  'References': 'references',
};

// DSGAI header can span 2 lines; handle "DSGAI01 -- Title" or title wrapping to next line.
// lineA MUST begin (after optional form-feed \f) with "DSGAIxx --" without leading spaces.
// This rejects:
//   - lines where lineA is empty and the header is on lineB (would double-count)
//   - Table-of-Contents lines that are deeply indented (17+ leading spaces)
function detectHeader(lineA, lineB) {
  // Strip optional leading form-feed only; do NOT fully trim so we can detect indentation
  const stripped = lineA.replace(/^\f/, '');
  // Reject if the line has leading whitespace (TOC entries) or doesn't start with DSGAI
  if (!/^DSGAI\d{2}\s+--/.test(stripped)) return null;
  const trimA = stripped.trim();
  const joined = `${trimA} ${lineB ? lineB.trim() : ''}`.trim();
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
    // Filter out layout-engine noise fragments (very short strings) while keeping genuinely short bullets like "Use TLS 1.3".
    .filter(s => s.length > 7);

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
    // If the title came as a single line, no continuation was consumed — skip ahead only when the title wraps across two lines.
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

// ── 4b. Warn on missing mitigations (non-fatal) ─────────────────
for (const r of risks) {
  if (r.code === 'DSPM') continue;
  const hasFlat = Array.isArray(r.detailedSections.mitigations) && r.detailedSections.mitigations.length > 0;
  const hasTiers = r.detailedSections.mitigationTiers && Object.values(r.detailedSections.mitigationTiers).some(t => Array.isArray(t) && t.length > 0);
  if (!hasFlat && !hasTiers) {
    console.warn(`WARN: ${r.code} has no flat mitigations and no tiered mitigations`);
  }
}

// ── 6. Priority heuristics ─────────────────────────────────────
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
  if (!(r.code in PRIORITY)) {
    console.warn(`WARN: no priority mapping for ${r.code}, defaulting to medium`);
  }
  r.priority = PRIORITY[r.code] || 'medium';
  const ov = r.detailedSections.overview || '';
  const desc = ov.length > 240 ? ov.slice(0, 240).replace(/\s+\S*$/, '') + '…' : ov;
  r.description = desc || r.title;
});

// ── 7. Editorial notes ─────────────────────────────────────────
const editorialNotes = [
  'The published taxonomy contains exactly 21 DSGAI (DSGAI01–DSGAI21). Cross-references to DSGAI22–DSGAI26 appear in the source text (lines referencing "DSGAI25", "DSGAI26") but are orphan references from an earlier draft numbering — no such risks exist in the final document.',
  'Line 3803 cross-reference "see DSGAI13 (Synthetic Data, Anonymization & Transformation Pitfalls)" is mislabeled in the source PDF: DSGAI13 is actually "Vector Store Platform Data Security" and Synthetic Data corresponds to DSGAI10.',
];

// ── 8. Validation ──────────────────────────────────────────────
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

// ── 9. Emit TypeScript ─────────────────────────────────────────
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
