import { lookupReferentiel, ReferentielEntry } from '../data/referentielUrls';

export type RefKind = 'sia' | 'compass' | 'agentic' | 'dsgai' | 'owasp-llm' | 'owasp-aisvs' | 'mitre-atlas' | 'referentiel' | 'url';

export interface MatchedRef {
  kind: RefKind;
  raw: string;
  start: number;
  end: number;
  href?: string;
  navTo?: string;
  anchor?: string;
  meta?: ReferentielEntry;
}

interface PatternConfig {
  kind: RefKind;
  regex: RegExp;
  build: (match: RegExpExecArray) => Omit<MatchedRef, 'kind' | 'start' | 'end' | 'raw'>;
}

const PATTERNS: PatternConfig[] = [
  {
    kind: 'sia',
    regex: /\bSIA-\d{3}\b/g,
    build: m => ({ navTo: 'ai-policy', anchor: m[0] }),
  },
  {
    kind: 'compass',
    regex: /\b(?:COMPASS-)?UC-\d{4}\b/g,
    build: m => ({ navTo: 'compass-use-cases', anchor: m[0].startsWith('COMPASS-') ? m[0] : `COMPASS-${m[0]}` }),
  },
  {
    kind: 'agentic',
    regex: /\bAST-\d{3}\b/g,
    build: m => ({ navTo: 'agentic-security', anchor: m[0] }),
  },
  {
    kind: 'dsgai',
    regex: /\b(?:DSGAI|dsgai)[\s-]?\d{2}\b|\bDSPM-?GenAI\b/gi,
    build: m => ({ navTo: 'wiki-red-teamer', anchor: m[0].toLowerCase().replace(/\s+/g, '') }),
  },
  {
    kind: 'owasp-llm',
    regex: /\bLLM(?:0[1-9]|10)\b/g,
    build: m => ({ href: `https://genai.owasp.org/llmrisk/${m[0].toLowerCase()}/` }),
  },
  {
    kind: 'owasp-aisvs',
    regex: /\bAISVS\s+(?:Ch\.|C)\s*\d+(?:\.\d+)*\b/g,
    build: () => ({ href: 'https://github.com/OWASP/AISVS' }),
  },
  {
    kind: 'mitre-atlas',
    regex: /\bAML\.(?:T|TA)\d{4,5}\b|\b(?<!\w)T\d{4}(?!\w)\b/g,
    build: m => ({ href: `https://atlas.mitre.org/techniques/${m[0]}` }),
  },
  {
    kind: 'referentiel',
    regex: /\b(?:AI Act|RGPD|GDPR|DORA|NIS2)\s+art\.\s*\d+(?:\(\d+\))?/gi,
    build: m => {
      const meta = lookupReferentiel(m[0]);
      return { meta: meta || undefined, href: meta?.url };
    },
  },
  {
    kind: 'referentiel',
    regex: /\bISO(?:\/IEC)?\s*\d{4,5}(?::\d{4})?\b/g,
    build: m => {
      const meta = lookupReferentiel(m[0]);
      return { meta: meta || undefined, href: meta?.url };
    },
  },
  {
    kind: 'referentiel',
    regex: /\b(?:Code (?:travail|pénal|monétaire|santé|civil)\s+(?:art\.\s*)?(?:L|R)\.\d+(?:-\d+)?)\b/gi,
    build: m => {
      const meta = lookupReferentiel(m[0]);
      return { meta: meta || undefined, href: meta?.url };
    },
  },
  {
    kind: 'referentiel',
    regex: /\bSchrems\s+II\b/gi,
    build: m => {
      const meta = lookupReferentiel(m[0]);
      return { meta: meta || undefined, href: meta?.url };
    },
  },
  {
    kind: 'referentiel',
    regex: /\b(?:NIST\s+(?:AI\s+RMF|SP\s+\d{3}-\d+(?:r\d+)?))\b/g,
    build: m => {
      const meta = lookupReferentiel(m[0]);
      return { meta: meta || undefined, href: meta?.url };
    },
  },
  {
    kind: 'referentiel',
    regex: /\b(?:ANSSI\s+R\d+|SecNumCloud|HDS)\b/g,
    build: m => {
      const meta = lookupReferentiel(m[0]);
      return { meta: meta || undefined, href: meta?.url };
    },
  },
];

export function findReferences(text: string): MatchedRef[] {
  const matches: MatchedRef[] = [];
  for (const cfg of PATTERNS) {
    cfg.regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = cfg.regex.exec(text)) !== null) {
      const built = cfg.build(m);
      matches.push({
        kind: cfg.kind,
        raw: m[0],
        start: m.index,
        end: m.index + m[0].length,
        ...built,
      });
    }
  }
  matches.sort((a, b) => a.start - b.start || b.end - a.end);
  const filtered: MatchedRef[] = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }
  return filtered;
}
