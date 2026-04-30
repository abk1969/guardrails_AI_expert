#!/usr/bin/env node
/*
 * scripts/generate-pssi-v3-artifacts.cjs
 *
 * Consume data_ai_risk/extracted/pssi-ia-v3.json (produced by
 * scripts/parse-pssi-ia-v3-pdf.cjs) and emit :
 *
 *   1. data/pssiIaV3.generated.ts
 *      → AIPolicyChapter[] compatible with the existing frontend Policy view.
 *      → 172 rules, grouped by chapter. Enrichment fields
 *        (associatedThreat, associatedRisk, implementationGuide, testingGuide,
 *        riskScenarios) are left empty at generation time and populated
 *        rule-by-rule after user validation.
 *
 *   2. backend/apps/api-gateway/src/mcp/static-data/pssi-ia-v3.json
 *      → Flat structure consumed by the 4 new MCP tools
 *        (search_pssi_sia, get_pssi_sia_by_id, list_pssi_chapters,
 *        get_pssi_statistics).
 *
 * No content is invented. Fields come straight from the parsed PDF.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT = path.resolve(__dirname, '..');
const INPUT_JSON = path.join(REPO_ROOT, 'data_ai_risk', 'extracted', 'pssi-ia-v3.json');
const ENRICHMENTS_JSON = path.join(REPO_ROOT, 'data_ai_risk', 'extracted', 'pssi-ia-v3-enrichments.json');
const OUT_TS = path.join(REPO_ROOT, 'data', 'pssiIaV3.generated.ts');
const OUT_MCP_JSON = path.join(
  REPO_ROOT,
  'backend',
  'apps',
  'api-gateway',
  'src',
  'mcp',
  'static-data',
  'pssi-ia-v3.json'
);

// ---------------------------------------------------------------------------

function esc(str) {
  // Escape a string for inclusion inside a TS single-quoted literal.
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '\\n');
}

function formatRuleTs(rule, enrichment) {
  const lines = [];
  lines.push('          {');
  lines.push("            type: 'rule',");
  lines.push('            rule: {');
  lines.push(`              id: '${rule.id}',`);
  lines.push(`              reference: '${rule.id}',`);
  lines.push(`              ruleText: '${esc(rule.ruleText)}',`);
  if (rule.testableControl) lines.push(`              implementationDetails: '${esc(rule.testableControl)}',`);
  lines.push(`              status: AIPolicyRuleStatus.NOT_IMPLEMENTED,`);
  lines.push(`              notes: '',`);
  if (rule.sourcesReferentials) lines.push(`              sourcesReferentials: '${esc(rule.sourcesReferentials)}',`);
  if (rule.testableControl) lines.push(`              testableControl: '${esc(rule.testableControl)}',`);
  if (rule.tier) lines.push(`              tier: '${esc(rule.tier)}',`);
  if (rule.raci) lines.push(`              raci: '${esc(rule.raci)}',`);
  if (rule.reviewFrequency) lines.push(`              reviewFrequency: '${esc(rule.reviewFrequency)}',`);
  if (rule.chapterNumber) lines.push(`              chapterNumber: '${rule.chapterNumber}',`);
  if (rule.chapterTitle) lines.push(`              chapterTitle: '${esc(rule.chapterTitle)}',`);
  // Enrichment fields, merged from pssi-ia-v3-enrichments.json when available.
  if (enrichment) {
    if (enrichment.associatedThreat) {
      lines.push(`              associatedThreat: ${JSON.stringify(enrichment.associatedThreat)},`);
    }
    if (enrichment.associatedRisk) {
      lines.push(`              associatedRisk: ${JSON.stringify(enrichment.associatedRisk)},`);
    }
    if (enrichment.implementationGuide) {
      lines.push(`              implementationGuide: ${JSON.stringify(enrichment.implementationGuide)},`);
    }
    if (enrichment.testingGuide) {
      lines.push(`              testingGuide: ${JSON.stringify(enrichment.testingGuide)},`);
    }
    if (Array.isArray(enrichment.riskScenarios) && enrichment.riskScenarios.length > 0) {
      lines.push(`              riskScenarios: ${JSON.stringify(enrichment.riskScenarios)},`);
    }
  }
  lines.push('            },');
  lines.push('          },');
  return lines.join('\n');
}

function chapterSlug(num, title) {
  const safe = (title || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `chapter-${num}-${safe}`;
}

function buildChaptersTs(data, enrichments) {
  const chunks = [];
  for (const ch of data.chapters) {
    const chapterRules = data.rules.filter((r) => r.chapterNumber === ch.number);
    if (chapterRules.length === 0) continue; // Skip empty chapters (e.g. intro)
    chunks.push('  {');
    chunks.push(`    id: '${chapterSlug(ch.number, ch.title)}',`);
    chunks.push(`    title: '${esc(ch.number + '. ' + ch.title)}',`);
    chunks.push(`    sections: [`);
    chunks.push(`      {`);
    chunks.push(`        id: '${chapterSlug(ch.number, ch.title)}-exigences',`);
    chunks.push(`        title: 'Exigences (${chapterRules.length} SIA)',`);
    chunks.push(`        content: [`);
    for (const r of chapterRules) {
      chunks.push(formatRuleTs(r, enrichments[r.id]));
    }
    chunks.push('        ],');
    chunks.push('      },');
    chunks.push('    ],');
    chunks.push('  },');
  }
  return chunks.join('\n');
}

function buildTs(data, enrichments) {
  const enrichedCount = Object.keys(enrichments).filter((k) => !k.startsWith('_')).length;
  const contentHash = crypto.createHash('sha256').update(JSON.stringify(enrichments) + JSON.stringify(data.rules)).digest('hex').slice(0, 8);
  const versionTag = `${data.meta.version}+${contentHash}`;
  return [
    '// AUTO-GENERATED from data_ai_risk/PSSI_IA_v3_CONSOLIDE.pdf',
    `// Source : scripts/generate-pssi-v3-artifacts.cjs (do not edit manually)`,
    `// Extracted at : ${data.meta.extractedAt}`,
    `// Total rules : ${data.meta.totalRules}`,
    `// Enriched rules : ${enrichedCount} / ${data.meta.totalRules}`,
    `// Content hash : ${contentHash}`,
    "import { AIPolicyChapter, AIPolicyRuleStatus } from '../types/policy';",
    '',
    `export const PSSI_IA_V3_VERSION = '${versionTag}';`,
    `export const PSSI_IA_V3_TOTAL_RULES = ${data.meta.totalRules};`,
    `export const PSSI_IA_V3_ENRICHED_COUNT = ${enrichedCount};`,
    '',
    'export const PSSI_IA_V3_POLICY: AIPolicyChapter[] = [',
    buildChaptersTs(data, enrichments),
    '];',
    '',
    'export default PSSI_IA_V3_POLICY;',
    '',
  ].join('\n');
}

function buildMcpJson(data, enrichments) {
  return {
    meta: {
      version: data.meta.version,
      source: data.meta.source,
      extractedAt: data.meta.extractedAt,
      totalRules: data.meta.totalRules,
      totalChapters: data.chapters.filter((c) => c.rules.length > 0).length,
      enrichedRules: Object.keys(enrichments).filter((k) => !k.startsWith('_')).length,
    },
    chapters: data.chapters
      .filter((c) => c.rules.length > 0)
      .map((c) => ({
        number: c.number,
        title: c.title,
        ruleIds: c.rules,
      })),
    rules: data.rules.map((r) => {
      const e = enrichments[r.id] || {};
      return {
        id: r.id,
        chapterNumber: r.chapterNumber,
        chapterTitle: r.chapterTitle,
        ruleText: r.ruleText,
        sourcesReferentials: r.sourcesReferentials || '',
        testableControl: r.testableControl || '',
        tier: r.tier || '',
        raci: r.raci || '',
        reviewFrequency: r.reviewFrequency || '',
        associatedThreat: e.associatedThreat || '',
        associatedRisk: e.associatedRisk || '',
        implementationGuide: e.implementationGuide || '',
        testingGuide: e.testingGuide || '',
        riskScenarios: Array.isArray(e.riskScenarios) ? e.riskScenarios : [],
      };
    }),
  };
}

// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(INPUT_JSON)) {
    console.error(`Missing input : ${INPUT_JSON}`);
    console.error('Run scripts/parse-pssi-ia-v3-pdf.cjs first.');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(INPUT_JSON, 'utf8'));

  let enrichments = {};
  if (fs.existsSync(ENRICHMENTS_JSON)) {
    enrichments = JSON.parse(fs.readFileSync(ENRICHMENTS_JSON, 'utf8'));
  }

  const tsContent = buildTs(data, enrichments);
  fs.mkdirSync(path.dirname(OUT_TS), { recursive: true });
  fs.writeFileSync(OUT_TS, tsContent, 'utf8');

  const mcpJson = buildMcpJson(data, enrichments);
  fs.mkdirSync(path.dirname(OUT_MCP_JSON), { recursive: true });
  fs.writeFileSync(OUT_MCP_JSON, JSON.stringify(mcpJson, null, 2), 'utf8');

  const enrichedCount = Object.keys(enrichments).filter((k) => !k.startsWith('_')).length;
  console.log(`Wrote ${path.relative(REPO_ROOT, OUT_TS)}  (${tsContent.split('\n').length} lines)`);
  console.log(`Wrote ${path.relative(REPO_ROOT, OUT_MCP_JSON)}  (${mcpJson.rules.length} rules)`);
  console.log(`Enriched rules : ${enrichedCount} / ${data.meta.totalRules}`);
}

main();
