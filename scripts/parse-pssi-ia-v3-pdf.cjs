#!/usr/bin/env node
/*
 * scripts/parse-pssi-ia-v3-pdf.cjs
 *
 * Parse data_ai_risk/PSSI_IA_v3_CONSOLIDE.txt (produced from the PDF via
 * `pdftotext -layout -enc UTF-8`) and emit data_ai_risk/extracted/pssi-ia-v3.json.
 *
 * Output shape :
 * {
 *   meta: { version: '3.0', extractedAt, totalRules, totalChapters },
 *   chapters: [{ id, number, title, rules: string[] (SIA-XXX ids) }],
 *   rules: [
 *     {
 *       id: 'SIA-001',
 *       chapterNumber: '2',
 *       ruleText, sourcesReferentials, testableControl, tier, raci, reviewFrequency
 *     }
 *   ]
 * }
 *
 * The parser is driven by two rules :
 * 1. A SIA block starts at a line matching `^\s*Identifiant\s+SIA-\d+\s*$`.
 * 2. Inside a block, right-column content (starting at the X position of the
 *    SIA-XXX identifier) is grouped into 6 value blocks separated by lines
 *    where the right column is empty. The 6 blocks map in order to :
 *    Exigence, Référentiels sources, Contrôle testable/preuve, Tier applicable,
 *    Rôle RACI, Fréquence de revue.
 *
 * Page headers/footers are stripped before parsing.
 * No content is fabricated. If a field is missing in a block, it stays empty.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const INPUT_TXT = path.join(REPO_ROOT, 'data_ai_risk', 'PSSI_IA_v3_CONSOLIDE.txt');
const OUTPUT_JSON = path.join(REPO_ROOT, 'data_ai_risk', 'extracted', 'pssi-ia-v3.json');

const FIELD_ORDER = [
  'ruleText',
  'sourcesReferentials',
  'testableControl',
  'tier',
  'raci',
  'reviewFrequency',
];

// ---------------------------------------------------------------------------
// Pre-cleaning
// ---------------------------------------------------------------------------

const PAGE_HEADER_RE = /^\s*CONFIDENTIEL\s+—\s+Diffusion\s+interne\s*\|\s*Page\s+\d+\s*\/\s*\d+\s*$/;
const PAGE_FOOTER_RE = /^\s*PSSI\s+IA\s+v3\.0\s+—\s+Document\s+consolidé\s*$/;

function stripPageDecoration(lines) {
  return lines.filter((l) => !PAGE_HEADER_RE.test(l) && !PAGE_FOOTER_RE.test(l));
}

// ---------------------------------------------------------------------------
// Block detection
// ---------------------------------------------------------------------------

const IDENT_RE = /^(\s*Identifiant\s+)(SIA-\d{3})\s*$/;
const CHAPTER_RE = /^(\d+)\.\s+(.+?)\s*$/;
const SECTION_RE = /^(\d+)\.(\d+)\.\s+(.+?)\s*$/;

function findBlocks(lines) {
  const blocks = [];
  let currentChapter = { number: '0', title: 'Préambule' };
  let currentChapterRules = [];

  const chapters = [];
  let lastBlockStart = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track chapter / section transitions
    const chMatch = line.match(CHAPTER_RE);
    if (chMatch && !line.match(SECTION_RE) && chMatch[1].length <= 2) {
      // Only real top-level chapters (1. 2. … not 7.1.)
      const num = chMatch[1];
      const title = chMatch[2].trim();
      // Skip noise : table of content mentions etc.
      if (title.length > 3 && title.length < 120 && !title.includes('...')) {
        if (currentChapterRules.length > 0 || chapters.length === 0) {
          chapters.push({
            number: currentChapter.number,
            title: currentChapter.title,
            rules: currentChapterRules.slice(),
          });
        }
        currentChapter = { number: num, title };
        currentChapterRules = [];
      }
    }

    const m = line.match(IDENT_RE);
    if (m) {
      // Start of a SIA block
      const id = m[2];
      // Right-column X = index of the SIA-XXX substring
      const rightX = line.indexOf(m[2]);
      if (lastBlockStart !== -1) {
        blocks[blocks.length - 1].endLine = i - 1;
      }
      blocks.push({
        id,
        chapterNumber: currentChapter.number,
        chapterTitle: currentChapter.title,
        startLine: i,
        endLine: lines.length - 1,
        rightX,
      });
      currentChapterRules.push(id);
      lastBlockStart = i;
    }
  }
  // Close last chapter
  chapters.push({
    number: currentChapter.number,
    title: currentChapter.title,
    rules: currentChapterRules.slice(),
  });
  return { blocks, chapters };
}

// ---------------------------------------------------------------------------
// Field extraction for a single SIA block
// ---------------------------------------------------------------------------

function extractFields(lines, block) {
  const { startLine, endLine, rightX } = block;
  // Slice block content, skip the Identifiant line itself
  const bodyLines = lines.slice(startLine + 1, endLine + 1);

  // For each line, split at rightX (with ±2 tolerance)
  // A "right content" is any non-empty text starting at or after rightX (allowing some flex).
  const FLEX = 3; // characters of tolerance around rightX

  const rightChunks = [];
  let currentChunk = [];

  const flush = () => {
    const joined = currentChunk
      .map((s) => s.trim())
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (joined) rightChunks.push(joined);
    else if (rightChunks.length > 0) rightChunks.push('');
    currentChunk = [];
  };

  for (const raw of bodyLines) {
    if (raw.length === 0) {
      // Hard break between paragraphs
      if (currentChunk.length > 0) flush();
      else if (rightChunks.length > 0 && rightChunks[rightChunks.length - 1] !== '') rightChunks.push('');
      continue;
    }

    // Detect right content : anything starting at column >= rightX - FLEX
    const firstNonSpace = raw.search(/\S/);
    if (firstNonSpace === -1) {
      if (currentChunk.length > 0) flush();
      continue;
    }

    if (firstNonSpace >= rightX - FLEX) {
      // Pure right content
      currentChunk.push(raw.slice(rightX - FLEX >= 0 ? rightX - FLEX : 0).trim());
    } else {
      // Label line : may have right content after rightX too
      const rightPart = raw.length > rightX ? raw.slice(rightX).trim() : '';
      if (rightPart) {
        currentChunk.push(rightPart);
      } else {
        // Pure label line → acts as a separator
        if (currentChunk.length > 0) flush();
      }
    }
  }
  if (currentChunk.length > 0) flush();

  // Each flush() pushes one fully-assembled value group to rightChunks.
  // Empty entries (pushed when a flush had no content) are group separators
  // we ignore here, because flushes are already value-bounded.
  const groups = rightChunks.filter((c) => c !== '');

  // Map first N groups to FIELD_ORDER
  const fields = {};
  FIELD_ORDER.forEach((key, idx) => {
    fields[key] = groups[idx] || '';
  });

  return { ...fields, _groupCount: groups.length, _extraGroups: groups.slice(FIELD_ORDER.length) };
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

function main() {
  if (!fs.existsSync(INPUT_TXT)) {
    console.error(`Input not found: ${INPUT_TXT}`);
    console.error(`Run: pdftotext -layout -enc UTF-8 data_ai_risk/PSSI_IA_v3_CONSOLIDE.pdf data_ai_risk/PSSI_IA_v3_CONSOLIDE.txt`);
    process.exit(1);
  }

  const raw = fs.readFileSync(INPUT_TXT, 'utf8');
  let lines = raw.split(/\r?\n/);
  lines = stripPageDecoration(lines);

  const { blocks, chapters } = findBlocks(lines);

  const rules = blocks.map((block) => {
    const extracted = extractFields(lines, block);
    return {
      id: block.id,
      chapterNumber: block.chapterNumber,
      chapterTitle: block.chapterTitle,
      ruleText: extracted.ruleText,
      sourcesReferentials: extracted.sourcesReferentials,
      testableControl: extracted.testableControl,
      tier: extracted.tier,
      raci: extracted.raci,
      reviewFrequency: extracted.reviewFrequency,
      _extractionMeta: {
        groupCount: extracted._groupCount,
        extraGroups: extracted._extraGroups,
      },
    };
  });

  const out = {
    meta: {
      version: '3.0',
      extractedAt: new Date().toISOString(),
      source: 'data_ai_risk/PSSI_IA_v3_CONSOLIDE.pdf',
      totalRules: rules.length,
      totalChapters: chapters.length,
    },
    chapters,
    rules,
  };

  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(out, null, 2), 'utf8');

  console.log(`Wrote ${rules.length} rules to ${path.relative(REPO_ROOT, OUTPUT_JSON)}`);
  console.log(`Chapters: ${chapters.length}`);
  // Sanity reports
  const missing = rules.filter((r) => !r.ruleText);
  const lowGroups = rules.filter((r) => r._extractionMeta.groupCount < 6);
  console.log(`Rules with empty ruleText : ${missing.length}`);
  console.log(`Rules with < 6 groups     : ${lowGroups.length}`);
  if (lowGroups.length > 0) {
    console.log('Examples:');
    lowGroups.slice(0, 5).forEach((r) => {
      console.log(`  ${r.id} (${r._extractionMeta.groupCount} groups): ${r.ruleText.slice(0, 80)}`);
    });
  }
}

main();
