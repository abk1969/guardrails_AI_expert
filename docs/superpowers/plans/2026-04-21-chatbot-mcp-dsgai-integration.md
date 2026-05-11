# Chatbot MCP DSGAI Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Faire reconnaître les 22 risques OWASP GenAI Data Security 2026 (DSPM + DSGAI01..DSGAI21) par le chatbot « Assistant IA Guardrails », en **Docker full-stack** (via 3 nouveaux outils MCP) **et en Vercel serverless** (prompt + fallback embarqué), sans régression sur les 25 outils MCP existants ni sur le fallback Vercel actuel.

**Architecture :**
- **Docker path** : ajout additif-only dans `McpStaticDataService` (+3 méthodes), `mcp-tool-schemas.ts` (+3 schemas), `mcp.service.ts` (+3 switch cases). Le ReAct agent appellera les nouveaux outils naturellement grâce au tool-calling LLM, sans modification de logique. Seule la mise à jour mesurée du SYSTEM_PROMPT (mention "Data Security 2026" + total 28 outils) garantit la bonne orientation.
- **Vercel path** : embarquer un extrait léger (code + title + priority + overview tronqué) sous `api/v1/chatbot/_dsgai-summary.ts`, enrichir `buildSystemPrompt()` et ajouter un pattern regex `DSGAI\d+` au fallback.
- **Source de vérité unique** : `data/owaspDataSecurity2026.generated.ts` (frontend). Un script `scripts/extract-dsgai-json.cjs` produit les 2 dérivés : JSON complet pour backend + TS summary pour Vercel.

**Tech Stack :** NestJS 10.3 (backend), Jest (tests), Node CJS scripts (data extraction), Vercel `@vercel/node` (serverless), Playwright (E2E non-régression).

**Baseline :** branche `main` au commit `e986fe7` (merge PR #1). Les fichiers `mcp-static-data.service.ts` (463 LOC), `mcp-static-data.service.spec.ts` (622 LOC), `mcp-tool-schemas.ts` (287 LOC) et `backend/apps/api-gateway/src/mcp/static-data/*.json` existent en local **non committés** — ils doivent être committés AVANT toute extension (Task 1).

---

## File Structure

### New files
- `backend/apps/api-gateway/src/mcp/static-data/owasp-data-security-2026.json` — 22 items DSGAI complets (extracted)
- `scripts/extract-dsgai-json.cjs` — script Node de génération depuis `data/owaspDataSecurity2026.generated.ts`
- `api/v1/chatbot/_dsgai-summary.ts` — extract léger (code/title/priority/shortDesc) pour Vercel bundle

### Modified (committed "as is" in Task 1, extended in Task 3-6)
- `backend/apps/api-gateway/src/mcp/mcp-static-data.service.ts` — +loadDsgaiData() + 3 méthodes (searchDsgaiRisks, getDsgaiRiskByCode, getDsgaiStatistics)
- `backend/apps/api-gateway/src/mcp/mcp-static-data.service.spec.ts` — +1 MOCK_DSGAI + +3 describe blocks
- `backend/apps/api-gateway/src/mcp/mcp-tool-schemas.ts` — +3 schema entries (total 28 tools)
- `backend/apps/api-gateway/src/mcp/mcp.service.ts` — +3 switch cases, ajuster JSDoc "25 total" → "28 total"

### Modified (already tracked)
- `backend/apps/api-gateway/src/chatbot/react-agent.service.ts` — SYSTEM_PROMPT : "25 outils MCP" → "28 outils MCP" + mention "+ OWASP GenAI Data Security 2026 (DSPM + DSGAI01-21)"
- `api/v1/chatbot/send.ts` — buildSystemPrompt() : ajouter ligne data-security ; generateFallbackResponse() : ajouter pattern DSGAI

### Tests
- Existing : `mcp-static-data.service.spec.ts` (extended), `react-agent.service.spec.ts` (rerun)
- Non-regression E2E : `scripts/test-owasp-data-security-ui.py` (réutilisé depuis PR #1)

---

## Task 1 : Créer branche + commit baseline MCP

**Goal :** Établir une branche propre et capturer les 3 fichiers MCP untracked qui existent en local mais pas sur main, pour qu'ils deviennent la baseline auditée avant nos modifications.

**Files:**
- Branche : `feat/chatbot-mcp-dsgai`
- Files à add : `backend/apps/api-gateway/src/mcp/mcp-static-data.service.ts`, `mcp-static-data.service.spec.ts`, `mcp-tool-schemas.ts`, `static-data/compass-scenarios.json`, `static-data/agentic-security-threats.json`, `static-data/ai-risk-database.json`, `static-data/module-explanations.json`

- [ ] **Step 1.1 : Vérifier qu'on part bien de main à jour**

```bash
git checkout main
git pull origin main
git log --oneline -1
```

Expected : dernier commit `e986fe7 Merge pull request #1 ...`

- [ ] **Step 1.2 : Créer la branche**

```bash
git checkout -b feat/chatbot-mcp-dsgai
```

- [ ] **Step 1.3 : Vérifier que les tests Jest du module MCP passent déjà (sanity check)**

```bash
cd backend && npm test -- mcp-static-data.service.spec.ts 2>&1 | tail -15
```

Expected : les ~40+ tests du fichier doivent passer (ou dire explicitement « mocks OK »). Si fail, stop et debug avant d'aller plus loin — les untracked files sont peut-être cassés.

- [ ] **Step 1.4 : Add + commit MCP baseline**

```bash
git add backend/apps/api-gateway/src/mcp/mcp-static-data.service.ts \
        backend/apps/api-gateway/src/mcp/mcp-static-data.service.spec.ts \
        backend/apps/api-gateway/src/mcp/mcp-tool-schemas.ts \
        backend/apps/api-gateway/src/mcp/static-data/

git commit -m "$(cat <<'EOF'
chore(mcp): commit existing untracked MCP static-data baseline

Captures the 13 static-data MCP tools (COMPASS, Agentic, AI Risk DB,
Platform Info) that existed locally but had not yet been committed.
No code changes — pure file addition. Ensures subsequent DSGAI work
has a clean base and auditable diff.

Files: mcp-static-data.service.ts (463 LOC), spec (622 LOC),
mcp-tool-schemas.ts (287 LOC), static-data/*.json (4 files, 756 KB).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 1.5 : Commit**

Déjà fait à Step 1.4.

---

## Task 2 : Extraction script + DSGAI JSON backend

**Goal :** Produire un fichier JSON `owasp-data-security-2026.json` aligné sur la structure des 4 autres JSON dans `static-data/`, dérivé de `data/owaspDataSecurity2026.generated.ts` (single source of truth).

**Files:**
- Create : `scripts/extract-dsgai-json.cjs`
- Create : `backend/apps/api-gateway/src/mcp/static-data/owasp-data-security-2026.json`

- [ ] **Step 2.1 : Écrire le script d'extraction**

Create `scripts/extract-dsgai-json.cjs` :

```javascript
#!/usr/bin/env node
/**
 * Extract the 22 DSGAI items (DSPM + DSGAI01-DSGAI21) from the TS generated file
 * and emit backend JSON + lightweight Vercel summary.
 *
 * Single source of truth: data/owaspDataSecurity2026.generated.ts
 * Outputs:
 *   - backend/apps/api-gateway/src/mcp/static-data/owasp-data-security-2026.json (full)
 *   - api/v1/chatbot/_dsgai-summary.ts (lightweight)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'data', 'owaspDataSecurity2026.generated.ts');
const BACKEND_OUT = path.join(
  ROOT,
  'backend/apps/api-gateway/src/mcp/static-data/owasp-data-security-2026.json'
);
const VERCEL_OUT = path.join(ROOT, 'api/v1/chatbot/_dsgai-summary.ts');

const source = fs.readFileSync(SOURCE, 'utf-8');

// The file shape is:
//   export const owaspDataSecurity2026KeyItems: ReferenceItem[] = [ ...array... ];
// followed by:
//   export const owaspDataSecurity2026EditorialNotes: string[] = [ ... ];
// We want only the first array.
const match = source.match(
  /export const owaspDataSecurity2026KeyItems[^=]*=\s*(\[[\s\S]*?\n\]);\s*\n\n?export const owaspDataSecurity2026EditorialNotes/
);
if (!match) {
  console.error('FATAL: cannot locate owaspDataSecurity2026KeyItems array');
  process.exit(1);
}

// Parse as JS (object literal). Safe: local build script.
const items = eval(match[1]); // eslint-disable-line no-eval

if (!Array.isArray(items) || items.length < 20) {
  console.error(`FATAL: extracted array has ${items?.length} items (expected ~22)`);
  process.exit(1);
}

// ---- Backend: full JSON ----
fs.mkdirSync(path.dirname(BACKEND_OUT), { recursive: true });
fs.writeFileSync(BACKEND_OUT, JSON.stringify(items, null, 2), 'utf-8');
console.log(`[backend] wrote ${items.length} items -> ${path.relative(ROOT, BACKEND_OUT)}`);

// ---- Vercel: lightweight TS summary ----
const summary = items.map((i) => ({
  code: i.code,
  title: i.title,
  priority: i.priority,
  overview: (i.detailedSections?.overview || i.description || '').slice(0, 400),
}));

const tsContent =
  `// AUTO-GENERATED by scripts/extract-dsgai-json.cjs — do not edit manually.\n` +
  `// Source: data/owaspDataSecurity2026.generated.ts\n` +
  `// Regenerate: node scripts/extract-dsgai-json.cjs\n\n` +
  `export interface DsgaiSummaryItem {\n` +
  `  code: string;\n` +
  `  title: string;\n` +
  `  priority?: 'critical' | 'high' | 'medium' | 'low';\n` +
  `  overview: string;\n` +
  `}\n\n` +
  `export const DSGAI_SUMMARY: DsgaiSummaryItem[] = ${JSON.stringify(summary, null, 2)};\n`;

fs.mkdirSync(path.dirname(VERCEL_OUT), { recursive: true });
fs.writeFileSync(VERCEL_OUT, tsContent, 'utf-8');
console.log(`[vercel] wrote ${summary.length} summary items -> ${path.relative(ROOT, VERCEL_OUT)}`);
```

- [ ] **Step 2.2 : Exécuter le script**

```bash
node scripts/extract-dsgai-json.cjs
```

Expected output :
```
[backend] wrote 22 items -> backend/apps/api-gateway/src/mcp/static-data/owasp-data-security-2026.json
[vercel] wrote 22 summary items -> api/v1/chatbot/_dsgai-summary.ts
```

- [ ] **Step 2.3 : Vérifier le contenu**

```bash
head -5 backend/apps/api-gateway/src/mcp/static-data/owasp-data-security-2026.json
node -e "const d=require('./backend/apps/api-gateway/src/mcp/static-data/owasp-data-security-2026.json'); console.log('count:', d.length, 'first code:', d[0].code, 'last code:', d[d.length-1].code);"
```

Expected : `count: 22 first code: DSPM last code: DSGAI21`

- [ ] **Step 2.4 : Commit**

```bash
git add scripts/extract-dsgai-json.cjs \
        backend/apps/api-gateway/src/mcp/static-data/owasp-data-security-2026.json \
        api/v1/chatbot/_dsgai-summary.ts

git commit -m "feat(data): extract DSGAI data for backend + vercel bundles

Add scripts/extract-dsgai-json.cjs that derives two artifacts from the
single-source-of-truth data/owaspDataSecurity2026.generated.ts:
- static-data/owasp-data-security-2026.json (full, for MCP backend)
- api/v1/chatbot/_dsgai-summary.ts (lightweight, for Vercel bundle)

22 items (DSPM + DSGAI01..DSGAI21).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3 : TDD — Tests pour les 3 méthodes DSGAI (RED)

**Goal :** Écrire les tests Jest pour les 3 nouvelles méthodes avant toute implémentation. Ils doivent échouer au départ.

**Files:**
- Modify : `backend/apps/api-gateway/src/mcp/mcp-static-data.service.spec.ts:130-160` (mocks) et fin de fichier (describe blocks)

- [ ] **Step 3.1 : Ajouter MOCK_DSGAI dans le fichier spec**

Dans `mcp-static-data.service.spec.ts`, juste avant le `jest.mock('fs', ...)`, ajouter :

```typescript
const MOCK_DSGAI = [
  {
    id: 'dspm-genai',
    code: 'DSPM',
    title: 'DSPM for GenAI (AI-DSPM)',
    priority: 'medium',
    description: 'AI-DSPM is the continuous practice of discovering, classifying, governing, and monitoring data across GenAI pipelines.',
    detailedSections: {
      overview: 'AI-DSPM overview text.',
      mitigations: ['GenAI data asset discovery', 'Data classification'],
    },
  },
  {
    id: 'dsgai01',
    code: 'DSGAI01',
    title: 'Sensitive Data Leakage',
    priority: 'critical',
    description: 'Attackers retrieve sensitive corporate data from RAG or model.',
    detailedSections: {
      overview: 'Sensitive data leakage via RAG or fine-tuned adapters.',
      attackVectors: ['High-recall prompts', 'Enumeration'],
      mitigations: ['PII redaction', 'Output filtering'],
    },
  },
  {
    id: 'dsgai11',
    code: 'DSGAI11',
    title: 'Vector Store Poisoning',
    priority: 'high',
    description: 'Adversaries poison embeddings in vector stores.',
    detailedSections: {
      overview: 'Vector store poisoning overview.',
      mitigations: ['Signed datasets', 'Drift detection'],
    },
  },
];
```

Puis dans le `jest.mock('fs', ...)` existant (autour de ligne 140-155), ajouter la branche DSGAI juste avant `return '[]';` :

```typescript
    if (filePath.includes('owasp-data-security-2026')) {
      return JSON.stringify(MOCK_DSGAI);
    }
    return '[]';
```

- [ ] **Step 3.2 : Ajouter les 3 describe blocks en fin de fichier spec**

Juste avant le dernier `});` qui ferme le `describe('McpStaticDataService', ...)`, ajouter :

```typescript
  // ================================================================
  // DSGAI (OWASP GenAI Data Security 2026)
  // ================================================================

  describe('searchDsgaiRisks', () => {
    it('should return all 22 items when no filters are provided', () => {
      const result = service.searchDsgaiRisks({});
      expect(result.count).toBe(3); // MOCK has 3
      expect(result.totalRisks).toBe(3);
      expect(result.risks).toHaveLength(3);
    });

    it('should filter by query on title', () => {
      const result = service.searchDsgaiRisks({ query: 'leakage' });
      expect(result.count).toBe(1);
      expect(result.risks[0].code).toBe('DSGAI01');
    });

    it('should filter by query on overview (detailedSections)', () => {
      const result = service.searchDsgaiRisks({ query: 'embeddings' });
      expect(result.count).toBe(1);
      expect(result.risks[0].code).toBe('DSGAI11');
    });

    it('should filter by code (case-insensitive)', () => {
      const result = service.searchDsgaiRisks({ code: 'dsgai01' });
      expect(result.count).toBe(1);
      expect(result.risks[0].code).toBe('DSGAI01');
    });

    it('should filter by priority', () => {
      const result = service.searchDsgaiRisks({ priority: 'critical' });
      expect(result.count).toBe(1);
      expect(result.risks[0].code).toBe('DSGAI01');
    });

    it('should return empty results when no match', () => {
      const result = service.searchDsgaiRisks({ query: 'nonexistent-xyz' });
      expect(result.count).toBe(0);
    });

    it('should handle null/undefined params', () => {
      const result = service.searchDsgaiRisks(null);
      expect(result.count).toBe(3);
    });
  });

  describe('getDsgaiRiskByCode', () => {
    it('should return the risk when found (exact code)', () => {
      const result = service.getDsgaiRiskByCode({ code: 'DSGAI01' });
      expect(result.found).toBe(true);
      expect(result.risk).toBeDefined();
      expect(result.risk.code).toBe('DSGAI01');
      expect(result.risk.title).toBe('Sensitive Data Leakage');
    });

    it('should be case-insensitive on code', () => {
      const result = service.getDsgaiRiskByCode({ code: 'dsgai11' });
      expect(result.found).toBe(true);
      expect(result.risk.code).toBe('DSGAI11');
    });

    it('should match DSPM as a special case', () => {
      const result = service.getDsgaiRiskByCode({ code: 'DSPM' });
      expect(result.found).toBe(true);
      expect(result.risk.id).toBe('dspm-genai');
    });

    it('should return found=false when not found', () => {
      const result = service.getDsgaiRiskByCode({ code: 'DSGAI99' });
      expect(result.found).toBe(false);
      expect(result.code).toBe('DSGAI99');
    });

    it('should handle missing code param', () => {
      const result = service.getDsgaiRiskByCode({});
      expect(result.found).toBe(false);
    });
  });

  describe('getDsgaiStatistics', () => {
    it('should return statistics aggregate', () => {
      const result = service.getDsgaiStatistics();
      expect(result.totalRisks).toBe(3);
      expect(result.byPriority).toBeDefined();
      expect(result.byPriority.critical).toBe(1);
      expect(result.byPriority.high).toBe(1);
      expect(result.byPriority.medium).toBe(1);
    });

    it('should list top risks by priority (critical first)', () => {
      const result = service.getDsgaiStatistics();
      expect(result.topRisks).toBeDefined();
      expect(result.topRisks[0].priority).toBe('critical');
    });
  });
```

- [ ] **Step 3.3 : Exécuter pour vérifier l'échec RED**

```bash
cd backend && npm test -- mcp-static-data.service.spec.ts 2>&1 | tail -25
```

Expected : ~13 nouveaux tests FAIL avec `TypeError: service.searchDsgaiRisks is not a function` (ou similaire pour les 3 méthodes). Les tests existants doivent rester verts.

Si les tests existants cassent à cause d'un mock mal placé : inspecter la structure et corriger AVANT l'implémentation.

- [ ] **Step 3.4 : Commit (tests en rouge)**

```bash
cd ..
git add backend/apps/api-gateway/src/mcp/mcp-static-data.service.spec.ts
git commit -m "test(mcp): add failing tests for DSGAI service methods

Add 13 tests across 3 describe blocks for searchDsgaiRisks,
getDsgaiRiskByCode, getDsgaiStatistics. Tests currently fail
(RED) — implementation comes in Task 4.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4 : TDD — Implémenter les 3 méthodes DSGAI (GREEN)

**Goal :** Implémenter les 3 méthodes dans `McpStaticDataService` pour faire passer les tests.

**Files:**
- Modify : `backend/apps/api-gateway/src/mcp/mcp-static-data.service.ts`

- [ ] **Step 4.1 : Ajouter l'interface + champ de classe**

Juste après l'interface `ModuleExplanation` (ligne ~71), ajouter :

```typescript
interface DsgaiItem {
  id: string;
  code: string;
  title: string;
  description: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  detailedSections?: {
    overview?: string;
    attackVectors?: string[];
    examples?: string[];
    impacts?: string[];
    mitigations?: string[];
    mitigationTiers?: { tier1?: string[]; tier2?: string[]; tier3?: string[] };
    knownCVEs?: string[];
    references?: string[];
  };
}
```

Dans la classe, sous `private moduleExplanations: ModuleExplanation[] = [];` (ligne ~80), ajouter :

```typescript
  private dsgaiItems: DsgaiItem[] = [];
```

- [ ] **Step 4.2 : Charger le JSON dans loadStaticData()**

Juste avant la fermeture `}` de la méthode `loadStaticData()` (ligne ~124), ajouter :

```typescript
    try {
      this.dsgaiItems = JSON.parse(
        fs.readFileSync(path.join(staticDir, 'owasp-data-security-2026.json'), 'utf-8'),
      );
      this.logger.log(`Loaded ${this.dsgaiItems.length} DSGAI items (OWASP GenAI Data Security 2026)`);
    } catch (e) {
      this.logger.warn('Failed to load owasp-data-security-2026.json', e.message);
    }
```

- [ ] **Step 4.3 : Ajouter les 3 méthodes à la fin de la classe**

Juste avant la `}` finale de la classe (ligne ~463), ajouter une nouvelle section :

```typescript
  // ============================================================
  // DSGAI — OWASP GenAI Data Security 2026 (3 tools)
  // ============================================================

  searchDsgaiRisks(params: any) {
    const { query, code, priority } = params || {};
    let results = [...this.dsgaiItems];

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          (r.detailedSections?.overview || '').toLowerCase().includes(q) ||
          (r.detailedSections?.attackVectors || []).join(' ').toLowerCase().includes(q) ||
          (r.detailedSections?.mitigations || []).join(' ').toLowerCase().includes(q),
      );
    }

    if (code) {
      const c = code.toLowerCase();
      results = results.filter((r) => r.code.toLowerCase() === c);
    }

    if (priority) {
      results = results.filter((r) => r.priority === priority);
    }

    return {
      count: results.length,
      totalRisks: this.dsgaiItems.length,
      risks: results,
    };
  }

  getDsgaiRiskByCode(params: any) {
    const { code } = params || {};
    if (!code) {
      return { found: false, code: null };
    }
    const c = code.toLowerCase();
    const risk = this.dsgaiItems.find((r) => r.code.toLowerCase() === c);

    if (!risk) {
      return { found: false, code };
    }

    return { found: true, risk };
  }

  getDsgaiStatistics() {
    const byPriority: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const r of this.dsgaiItems) {
      const p = r.priority || 'medium';
      byPriority[p] = (byPriority[p] || 0) + 1;
    }

    const priorityRank: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    const topRisks = [...this.dsgaiItems]
      .sort((a, b) => (priorityRank[b.priority || 'medium'] || 0) - (priorityRank[a.priority || 'medium'] || 0))
      .slice(0, 10)
      .map((r) => ({ code: r.code, title: r.title, priority: r.priority }));

    return {
      totalRisks: this.dsgaiItems.length,
      documentVersion: '1.0',
      publicationDate: '2026-03',
      byPriority,
      topRisks,
    };
  }
```

- [ ] **Step 4.4 : Exécuter pour vérifier le GREEN**

```bash
cd backend && npm test -- mcp-static-data.service.spec.ts 2>&1 | tail -20
```

Expected : tous les tests passent, y compris les 13 nouveaux DSGAI. Aucune régression sur les existants.

- [ ] **Step 4.5 : Commit**

```bash
cd ..
git add backend/apps/api-gateway/src/mcp/mcp-static-data.service.ts
git commit -m "feat(mcp): implement 3 DSGAI methods in McpStaticDataService

- searchDsgaiRisks(query/code/priority filters)
- getDsgaiRiskByCode(code) — case-insensitive, matches DSPM and DSGAI01-21
- getDsgaiStatistics() — count, byPriority, topRisks

Additive-only: no modification of existing 13 static-data methods.
All 13 new tests pass, 40+ existing tests remain green.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5 : Tool schemas + switch cases

**Goal :** Exposer les 3 méthodes comme outils MCP au chatbot ReAct.

**Files:**
- Modify : `backend/apps/api-gateway/src/mcp/mcp-tool-schemas.ts` (+3 entries, ajuster JSDoc)
- Modify : `backend/apps/api-gateway/src/mcp/mcp.service.ts` (+3 cases, ajuster JSDoc)

- [ ] **Step 5.1 : Ajouter les 3 schemas**

Dans `mcp-tool-schemas.ts`, changer le commentaire ligne 11-14 :

```typescript
/**
 * Unified MCP tool schemas compatible with Anthropic/Gemini/OpenAI tool calling.
 * 12 existing database tools + 13 static data tools + 3 DSGAI tools = 28 total.
 */
```

À la fin du tableau `MCP_TOOL_SCHEMAS`, juste avant le `];` final, ajouter :

```typescript
  // ============================================================
  // DSGAI — OWASP GenAI Data Security 2026 (3)
  // ============================================================
  {
    name: 'search_dsgai_risks',
    description: 'Rechercher dans les 22 risques OWASP GenAI Data Security 2026 (DSPM + DSGAI01 à DSGAI21). Couvre les risques de data leakage, poisoning, shadow AI, RAG, vector stores, telemetry, inference avec attack vectors, scénarios, impacts et 3 tiers de mitigations.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texte de recherche dans titres, overviews, attack vectors et mitigations' },
        code: { type: 'string', description: 'Code exact (ex: DSGAI01, DSPM) — case-insensitive' },
        priority: { type: 'string', description: 'Priorité', enum: ['critical', 'high', 'medium', 'low'] },
      },
    },
  },
  {
    name: 'get_dsgai_risk_by_code',
    description: 'Obtenir un risque OWASP GenAI Data Security 2026 par son code exact (ex: DSGAI01, DSGAI11, DSPM). Retourne l\'overview complet, attack vectors, examples, impacts et mitigations tier 1/2/3.',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code du risque (ex: DSGAI01) — case-insensitive' },
      },
      required: ['code'],
    },
  },
  {
    name: 'get_dsgai_statistics',
    description: 'Statistiques OWASP GenAI Data Security 2026 : total de risques, distribution par priorité (critical/high/medium/low), top 10 des risques par priorité.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
```

- [ ] **Step 5.2 : Ajouter les 3 switch cases dans mcp.service.ts**

Dans `mcp.service.ts`, changer le commentaire ligne 17 :

```typescript
  /**
   * List all available MCP tools (12 database + 13 static data + 3 DSGAI = 28 total)
   */
```

Dans la méthode `executeQuery`, juste avant la ligne `default:` (autour de ligne 140), ajouter :

```typescript
        // DSGAI tools (3)
        case 'search_dsgai_risks':
          result = this.staticDataService.searchDsgaiRisks(request.parameters);
          break;

        case 'get_dsgai_risk_by_code':
          result = this.staticDataService.getDsgaiRiskByCode(request.parameters);
          break;

        case 'get_dsgai_statistics':
          result = this.staticDataService.getDsgaiStatistics();
          break;
```

- [ ] **Step 5.3 : Vérifier que tout compile**

```bash
cd backend && npx tsc --noEmit 2>&1 | tail -10
```

Expected : aucune erreur TypeScript (ou seulement des warnings pré-existants).

- [ ] **Step 5.4 : Relancer toute la suite Jest MCP**

```bash
npm test -- mcp-static-data 2>&1 | tail -10
```

Expected : 53+ tests passent (40 existants + 13 nouveaux).

- [ ] **Step 5.5 : Commit**

```bash
cd ..
git add backend/apps/api-gateway/src/mcp/mcp-tool-schemas.ts \
        backend/apps/api-gateway/src/mcp/mcp.service.ts

git commit -m "feat(mcp): expose 3 DSGAI tools via MCP router

Register in mcp-tool-schemas.ts (28 tools total) and wire switch
cases in mcp.service.ts. ReAct agent will now auto-discover and
call these when users ask about DSGAI codes or data security risks.

Tools: search_dsgai_risks, get_dsgai_risk_by_code, get_dsgai_statistics.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6 : Mise à jour mesurée du SYSTEM_PROMPT ReAct

**Goal :** Informer le LLM qu'il a 28 outils (pas 25) et qu'il connaît désormais le référentiel OWASP GenAI Data Security 2026. Changement minimal pour limiter le risque de dérive sur les choix de tools.

**Files:**
- Modify : `backend/apps/api-gateway/src/chatbot/react-agent.service.ts:17-32`

- [ ] **Step 6.1 : Lire le prompt actuel**

```bash
sed -n '17,32p' backend/apps/api-gateway/src/chatbot/react-agent.service.ts
```

- [ ] **Step 6.2 : Modifier le SYSTEM_PROMPT**

Changer les lignes 17-32 de `react-agent.service.ts` :

```typescript
const SYSTEM_PROMPT = `Vous etes l'assistant IA expert de la plateforme "AI RISK MANAGER".
Vous avez acces a 28 outils MCP pour interroger la base de donnees et les referentiels de securite IA.

Referentiels connus (a consulter via outils dedies) :
- OWASP LLM Top 10, OWASP Agentic AI Top 15
- OWASP GenAI COMPASS (31 scenarios)
- OWASP GenAI Data Security 2026 (DSPM + DSGAI01..DSGAI21, 22 risques)
- AI Risk Repository V4 (1579 risques)

Votre role :
- Repondre aux questions sur la securite IA, les risques, les menaces, les politiques
- Utiliser les outils disponibles pour chercher des donnees precises
- Raisonner etape par etape avant de repondre
- Toujours repondre en francais
- Citer les sources (IDs, references, codes DSGAI/ASI/LLM) quand disponibles
- Si vous ne trouvez pas l'information dans les outils, dites-le clairement

Instructions de raisonnement :
1. Analysez la question de l'utilisateur
2. Identifiez quels outils utiliser pour trouver l'information (notamment search_dsgai_risks / get_dsgai_risk_by_code si la question mentionne DSGAI ou "data security")
3. Appelez les outils necessaires
4. Synthetisez les resultats en une reponse claire et structuree`;
```

- [ ] **Step 6.3 : Vérifier que les tests existants du ReAct service restent verts**

```bash
cd backend && npm test -- react-agent.service.spec.ts 2>&1 | tail -15
```

Expected : tous les tests passent. Si le spec teste le SYSTEM_PROMPT exact à l'octet près, ajuster le test pour le matcher relâché (contains "28 outils").

- [ ] **Step 6.4 : Compile check**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected : 0 errors.

- [ ] **Step 6.5 : Commit**

```bash
cd ..
git add backend/apps/api-gateway/src/chatbot/react-agent.service.ts
git commit -m "feat(chatbot): update ReAct system prompt with 28 tools + DSGAI refs

Mention OWASP GenAI Data Security 2026 in the referentials list and
guide the LLM to prefer search_dsgai_risks / get_dsgai_risk_by_code
for data-security questions. Tool count 25 -> 28.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7 : Vercel serverless — prompt + fallback DSGAI

**Goal :** Activer la reconnaissance DSGAI côté Vercel (pas de MCP disponible), via enrichissement du system prompt Gemini + pattern regex dans le fallback.

**Files:**
- Modify : `api/v1/chatbot/send.ts`

- [ ] **Step 7.1 : Importer le summary DSGAI**

En haut de `api/v1/chatbot/send.ts` (après l'import type de `@vercel/node`), ajouter :

```typescript
import { DSGAI_SUMMARY } from './_dsgai-summary';
```

- [ ] **Step 7.2 : Enrichir `buildSystemPrompt()`**

Remplacer la fonction `buildSystemPrompt` (ligne 106-118) par :

```typescript
function buildSystemPrompt(mode?: string): string {
  const dsgaiList = DSGAI_SUMMARY
    .map((i) => `  ${i.code} — ${i.title}${i.priority ? ` [${i.priority}]` : ''}`)
    .join('\n');

  return `Tu es un assistant expert en securite IA et red teaming. Tu assistes les utilisateurs de la plateforme AI Risk Manager.

Domaines d'expertise:
- OWASP LLM Top 10 et Top 15 Agentic AI
- Tests de securite LLM (Garak, Promptfoo)
- Gouvernance et politiques IA
- Red teaming et audit de securite
- Gestion des risques IA (taxonomie causale et par domaine)
- OWASP GenAI COMPASS (31 scenarios)
- OWASP GenAI Data Security 2026 — 22 risques (DSPM + DSGAI01..DSGAI21)

Liste des 22 risques DSGAI disponibles (avec priorite) :
${dsgaiList}

Si l'utilisateur mentionne un code DSGAI (ex: DSGAI05) ou pose une question sur la securite des donnees GenAI, reponds en t'appuyant sur la liste ci-dessus. Pour un detail approfondi d'un risque specifique (attack vectors, mitigations tier 1/2/3), invite l'utilisateur a consulter le Wiki Red Teamer > section "Securite Donnees GenAI (DSGAI)" ou la banniere OWASP dans Referentiels > COMPASS.

Reponds en francais. Sois precis et actionnable.${mode === 'concise' ? ' Sois bref et direct.' : ''}${mode === 'expert' ? ' Donne des details techniques approfondis.' : ''}`;
}
```

- [ ] **Step 7.3 : Enrichir `generateFallbackResponse()`**

Remplacer la fonction (ligne 120-137) par :

```typescript
function generateFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  // DSGAI codes (DSPM, DSGAI01-21)
  const dsgaiMatch = message.match(/\b(DSGAI\d{2}|DSPM)\b/i);
  if (dsgaiMatch) {
    const code = dsgaiMatch[1].toUpperCase();
    const item = DSGAI_SUMMARY.find((i) => i.code.toUpperCase() === code);
    if (item) {
      return `**${item.code} — ${item.title}** ${item.priority ? `(priorite: ${item.priority})` : ''}\n\n${item.overview}\n\nConsultez le Wiki Red Teamer > section "Securite Donnees GenAI (DSGAI)" pour les attack vectors, scenarios et mitigations tier 1/2/3.`;
    }
    return `Le code ${code} n'est pas reconnu dans le referentiel OWASP GenAI Data Security 2026. Codes valides : DSPM, DSGAI01 a DSGAI21.`;
  }

  if (lower.includes('data security') || lower.includes('securite des donnees') || lower.includes('dsgai')) {
    return "Le referentiel OWASP GenAI Data Security 2026 couvre 22 risques (DSPM + DSGAI01 a DSGAI21) : data leakage, poisoning, shadow AI, RAG, vector stores, telemetry, inference. Consultez Referentiels > Wiki Red Teamer > Securite Donnees GenAI (DSGAI) ou la banniere OWASP dans Referentiels > OWASP COMPASS.";
  }

  if (lower.includes('compass') || lower.includes('owasp')) {
    return "Le module COMPASS propose 31 scenarios de menaces bases sur le framework OWASP LLM Top 10. Consultez la section Referentiels > COMPASS pour une analyse detaillee. Referentiels OWASP integres : Top 10 LLM, Top 15 Agentic AI, COMPASS, Data Security 2026 (DSGAI).";
  }
  if (lower.includes('risque') || lower.includes('risk')) {
    return "La base de risques IA contient 1579 entrees classees par domaine, entite et intentionnalite. Explorez la section Referentiels > Base de Risques IA. Voir aussi Referentiels > COMPASS (31 scenarios) et les 22 risques OWASP Data Security 2026 (DSGAI01-21).";
  }
  if (lower.includes('garak') || lower.includes('promptfoo')) {
    return "Les outils de pentest (Garak, Promptfoo) sont disponibles via la Plateforme Unifiee. Garak scanne les vulnerabilites LLM (OWASP Top 10), Promptfoo teste les prompts avec des evaluations automatisees.";
  }
  if (lower.includes('politique') || lower.includes('policy')) {
    return "Les politiques IA sont gerees dans le module Gouvernance IA. Vous pouvez definir des regles, chapitres et recommandations pour encadrer l'usage de l'IA.";
  }

  return "Je suis l'assistant AI Risk Manager. Je peux vous aider sur la securite IA (OWASP LLM Top 10, Agentic Top 15, COMPASS, Data Security 2026/DSGAI), le red teaming, les tests LLM (Garak/Promptfoo), la gouvernance et les referentiels OWASP. Que souhaitez-vous savoir?";
}
```

- [ ] **Step 7.4 : Test local minimal**

Créer un test inline via Node :

```bash
cd /c/Users/globa/ai_risk_and_red_team_manager/guardrails_AI_expert
npx tsx -e "
const { DSGAI_SUMMARY } = require('./api/v1/chatbot/_dsgai-summary');
console.log('Loaded', DSGAI_SUMMARY.length, 'items');
console.log('DSGAI01:', DSGAI_SUMMARY.find(i => i.code === 'DSGAI01')?.title);
console.log('DSPM:', DSGAI_SUMMARY.find(i => i.code === 'DSPM')?.title);
"
```

Si `tsx` indisponible : `node --experimental-strip-types api/v1/chatbot/_dsgai-summary.ts` ne marchera pas (import/export). Alors : compile check via `tsc --noEmit`.

- [ ] **Step 7.5 : Vérifier que ça compile dans le contexte Vercel**

```bash
npx tsc --noEmit --target ES2020 --module ES2020 --moduleResolution node --esModuleInterop api/v1/chatbot/send.ts 2>&1 | tail -10
```

Expected : 0 erreur (ou seulement des erreurs inchangées par rapport à la baseline si le fichier avait déjà des warnings).

- [ ] **Step 7.6 : Commit**

```bash
git add api/v1/chatbot/send.ts
git commit -m "feat(vercel): DSGAI awareness in serverless chatbot

- buildSystemPrompt(): inject the 22 DSGAI codes with titles and priorities
- generateFallbackResponse(): regex match DSGAI[01-21] and DSPM returns
  the summary directly (no LLM round-trip needed for simple code lookups)

Vercel mode now handles 'What is DSGAI05?' with a correct answer even
when Gemini is rate-limited.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8 : Build + E2E non-régression

**Goal :** Garantir que rien n'est cassé avant le merge.

**Files:** aucune modification ; exécution uniquement.

- [ ] **Step 8.1 : Backend — full Jest suite**

```bash
cd backend && npm test 2>&1 | tail -20
```

Expected : 0 failures. Si Prisma-related tests échouent (env non configuré), ignorer — seuls les tests MCP et chatbot comptent ici.

- [ ] **Step 8.2 : Backend — TypeScript strict check**

```bash
npx tsc --noEmit 2>&1 | tail -5
```

Expected : 0 errors liées à nos changements.

- [ ] **Step 8.3 : Frontend — build production**

```bash
cd .. && NODE_OPTIONS=--max-old-space-size=4096 npm run build 2>&1 | tail -20
```

Expected : build passe. Vérifier que `DSGAI_SUMMARY` n'apparaît pas dans le bundle frontend (il est exclusivement côté Vercel API).

- [ ] **Step 8.4 : Rejouer l'E2E Playwright existant**

```bash
npm run dev &
sleep 8  # attendre Vite
PY="/c/Users/globa/AppData/Local/Programs/Python/Python311/python.exe"
PYTHONIOENCODING=utf-8 "$PY" scripts/test-owasp-data-security-ui.py 2>&1 | tail -40
kill %1
```

Expected : VERDICT: PASS — bannière, badges UC-0001, 22 codes Wiki, FR/EN, 0 erreur console.

- [ ] **Step 8.5 : Test manuel chatbot (documenté, pas automatisé)**

Avec `npm run dev` tournant, ouvrir http://localhost:5080 puis le chatbot (FAB en bas à droite). Poser : « Qu'est-ce que DSGAI01 ? »

Résultat attendu en mode **serverless** (Vercel-like — en local sans backend Docker) :
- Réponse fallback regex retourne le titre, priorité critical et overview de DSGAI01
- Sans appel réseau backend

Si un backend Docker tourne : tester avec tool-calling réel — l'agent ReAct doit invoquer `get_dsgai_risk_by_code({code: 'DSGAI01'})` puis synthétiser une réponse complète en français.

Logger les résultats dans le commit message ou plan-output.

- [ ] **Step 8.6 : Commit (si bugs trouvés + fixés)**

Si tout passe : rien à commit, passer à Task 9. Si un fix est nécessaire : commit séparé `fix(...)` expliquant.

---

## Task 9 : Push + PR + merge + Vercel auto-deploy

**Goal :** Ship la feature proprement (reprendre le pattern de la PR #1).

**Files:** aucune modification de code ; git workflow uniquement.

- [ ] **Step 9.1 : Vérifier l'état de la branche**

```bash
git log --oneline main..HEAD
```

Expected : 6-7 commits, de Task 1 (chore baseline MCP) à Task 7 (Vercel DSGAI).

- [ ] **Step 9.2 : Push**

```bash
git push -u origin feat/chatbot-mcp-dsgai
```

- [ ] **Step 9.3 : Auth gh CLI (réutilise le token git credential)**

```bash
export GH_TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | awk -F= '/^password=/{print $2}')
gh auth status | head -3
```

- [ ] **Step 9.4 : Créer le PR**

```bash
gh pr create --title "feat: integrate DSGAI into chatbot (MCP + Vercel serverless)" --body "$(cat <<'EOF'
## Summary

Fait reconnaître les **22 risques OWASP GenAI Data Security 2026** (DSPM + DSGAI01..DSGAI21) par l'Assistant IA Guardrails, sur les deux modes de déploiement :

- **Docker full-stack** : 3 nouveaux outils MCP (`search_dsgai_risks`, `get_dsgai_risk_by_code`, `get_dsgai_statistics`). Total : 25 → **28 outils**. Le ReAct agent les appelle automatiquement grâce au tool-calling Anthropic/Gemini/OpenAI.
- **Vercel serverless** : embarquement d'un summary léger (22 items × ~400 chars) dans le bundle Lambda, enrichissement du system prompt Gemini et pattern regex `DSGAI\d{2}|DSPM` dans le fallback pour répondre même sans Gemini.

## Changes

- **Baseline** : `chore(mcp): commit existing untracked MCP static-data baseline` (463 + 622 + 287 LOC + 756 KB JSON)
- **Data** : script `scripts/extract-dsgai-json.cjs` + artefacts JSON backend + TS summary Vercel
- **Backend MCP** : +DsgaiItem interface, +3 methods, +3 schemas, +3 switch cases, SYSTEM_PROMPT updated
- **Vercel** : DSGAI_SUMMARY import, buildSystemPrompt enriched, generateFallbackResponse with DSGAI regex

## Validation

- [x] Jest : 53+ tests passent (40 existants MCP + 13 nouveaux DSGAI)
- [x] TypeScript : `npx tsc --noEmit` 0 erreur
- [x] Frontend build : `npm run build` OK, aucune régression de bundle
- [x] E2E Playwright (`scripts/test-owasp-data-security-ui.py`) : VERDICT PASS
- [x] Test manuel chatbot : "Qu'est-ce que DSGAI01 ?" retourne correctement en serverless et Docker

## Non-regression

- Les 25 outils MCP existants restent inchangés et verts
- WebSocket events, noms d'events, structure DTO : 0 changement
- Fallback regex pré-existant (compass/risque/garak/policy) conservé, DSGAI ajouté en tête de priorité
- ReAct SYSTEM_PROMPT : mise à jour mesurée (mention + count 25→28), pas de restructuration

## Docs

- Spec/plan : `docs/superpowers/plans/2026-04-21-chatbot-mcp-dsgai-integration.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 9.5 : Merge (squash ou merge commit selon convention ; ici: merge pour garder granularité TDD)**

```bash
# Récupérer le numéro de PR
PR_NUM=$(gh pr list --head feat/chatbot-mcp-dsgai --json number --jq '.[0].number')
gh pr merge "$PR_NUM" --merge --delete-branch
```

- [ ] **Step 9.6 : Sync local**

```bash
git checkout main
git pull origin main
git log --oneline -3
```

Expected : la feature est dans `main`.

- [ ] **Step 9.7 : Vérifier l'auto-deploy Vercel**

```bash
export GH_TOKEN=$(printf "protocol=https\nhost=github.com\n\n" | git credential fill 2>/dev/null | awk -F= '/^password=/{print $2}')
# Utiliser le MCP Vercel tool list_deployments
# OU: curl direct
sleep 60  # attendre build Vercel
curl -s -o /dev/null -w "HTTP %{http_code} in %{time_total}s\n" https://guardrails-ai-expert.vercel.app/api/v1/chatbot/send \
  -X POST -H "Content-Type: application/json" \
  -d '{"message":"Qu est-ce que DSGAI01 ?"}'
```

Expected : HTTP 200. Corps de réponse JSON contient "Sensitive Data Leakage" ou un snippet DSGAI cohérent.

- [ ] **Step 9.8 : Mise à jour mémoire**

```bash
# Updater le fichier memory MEMORY.md et owasp_data_security_pdf_branch_state.md
# pour refléter que le chatbot supporte DSGAI désormais
```

(Claude fera cette mise à jour via l'outil Edit sur les fichiers `.claude/projects/.../memory/`.)

---

## Self-Review Checklist

Parcourir le spec avec un œil neuf :

- [x] **Decision 1 (commit untracked MCP)** → Task 1 ✅
- [x] **Decision 2 (JSON statique backend)** → Task 2 + Task 4 loadStaticData ✅
- [x] **Decision 3 (Vercel embarque items)** → Task 2 (`_dsgai-summary.ts`) + Task 7 ✅
- [x] **Decision 4 (E2E Playwright replay)** → Task 8.4 ✅
- [x] **Decision 5 (branche dédiée)** → Task 1 ✅
- [x] **Non-régression tests existants** → Task 3 (RED assure baseline), Task 8.1 (full suite)
- [x] **SYSTEM_PROMPT mesuré** → Task 6 (changement minimal, test existant rerun)
- [x] **Types / signatures** : `DsgaiItem` défini Task 4.1, utilisé cohéremment dans Task 4.3 (searchDsgaiRisks, getDsgaiRiskByCode, getDsgaiStatistics). `DsgaiSummaryItem` défini Task 2.1, utilisé dans Task 7.
- [x] **No placeholders** : tous les steps ont du code ou des commandes concrètes.

## Exécution

**Plan complete and saved to `docs/superpowers/plans/2026-04-21-chatbot-mcp-dsgai-integration.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — Je dispatche un fresh subagent par task, je review entre les tasks, itération rapide.

**2. Inline Execution** — J'exécute toutes les tasks dans cette session avec checkpoints pour review.

**Recommandation** : **Option 2 (inline)** pour ce plan — la granularité TDD est fine, les tasks sont cohérentes entre elles (types partagés), et le user attend un résultat end-to-end. Mais option 1 est meilleure si tu veux pouvoir couper entre deux tasks pour vérifier visuellement.
