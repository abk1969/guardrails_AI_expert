import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface CompassScenario {
  id: string;
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  impact: number;
  likelihood: number;
  riskScore: number;
  riskLevel: string;
  recommendation: { fr: string; en: string };
  associatedThreat: { fr: string; en: string };
  attackMapping: { mitre?: string; atlas?: string; description?: { fr: string; en: string } };
  oodaPhase: string;
  relatedCVEs: string[];
  relatedIncidents: string[];
}

interface AgenticThreat {
  id: string;
  category: string;
  categoryIcon: string;
  categoryIndex: number;
  threatName: string;
  threatNameEn: string;
  owaspCode: string;
  riskDescription: string;
  attackMechanism: string;
  impactAndExamples: string;
  mitigations: string[];
  maestroLayer: string;
  grcPriority: string;
  mitreAtlasRef: string | null;
}

interface AgenticSecurityData {
  metadata: any;
  maestroLayers: any[];
  threats: AgenticThreat[];
}

interface RiskEntry {
  id: string;
  title: string;
  desc: string;
  cat: string;
  dom: string;
  sub: string;
  ent: string;
  int: string;
  tim: string;
}

interface RiskDatabase {
  metadata: any;
  statistics: any;
  domainTaxonomy: any[];
  topRiskCategories: any[];
  totalSearchableRisks: number;
  risks: RiskEntry[];
}

interface ModuleExplanation {
  moduleId: string;
  title: string;
  description: string;
  workflow: string;
  keyFeatures: string[];
}

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

interface PssiRule {
  id: string;
  chapterNumber: string;
  chapterTitle: string;
  ruleText: string;
  sourcesReferentials: string;
  testableControl: string;
  tier: string;
  raci: string;
  reviewFrequency: string;
  associatedThreat?: string;
  associatedRisk?: string;
  implementationGuide?: string;
  testingGuide?: string;
  riskScenarios?: any[];
}

interface PssiData {
  meta: { version: string; source: string; extractedAt: string; totalRules: number; totalChapters: number };
  chapters: { number: string; title: string; ruleIds: string[] }[];
  rules: PssiRule[];
}

@Injectable()
export class McpStaticDataService {
  private readonly logger = new Logger(McpStaticDataService.name);

  private compassScenarios: CompassScenario[] = [];
  private agenticSecurityData: AgenticSecurityData;
  private riskDatabase: RiskDatabase;
  private moduleExplanations: ModuleExplanation[] = [];
  private dsgaiItems: DsgaiItem[] = [];
  private pssiData: PssiData | null = null;

  constructor() {
    this.loadStaticData();
  }

  private resolveStaticDir(): string {
    const candidates = [
      path.join(__dirname, 'static-data'),
      path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'apps', 'api-gateway', 'src', 'mcp', 'static-data'),
      path.resolve(process.cwd(), 'apps', 'api-gateway', 'src', 'mcp', 'static-data'),
      path.resolve(process.cwd(), 'backend', 'apps', 'api-gateway', 'src', 'mcp', 'static-data'),
    ];
    for (const c of candidates) {
      try {
        if (fs.existsSync(path.join(c, 'pssi-ia-v3.json'))) {
          this.logger.log(`Static-data dir resolved : ${c}`);
          return c;
        }
      } catch { /* try next */ }
    }
    this.logger.warn(`Static-data dir not found in any candidate ; defaulting to ${candidates[0]}`);
    return candidates[0];
  }

  private loadStaticData(): void {
    const staticDir = this.resolveStaticDir();

    try {
      this.compassScenarios = JSON.parse(
        fs.readFileSync(path.join(staticDir, 'compass-scenarios.json'), 'utf-8'),
      );
      this.logger.log(`Loaded ${this.compassScenarios.length} COMPASS scenarios`);
    } catch (e) {
      this.logger.warn('Failed to load compass-scenarios.json', e.message);
    }

    try {
      this.agenticSecurityData = JSON.parse(
        fs.readFileSync(path.join(staticDir, 'agentic-security-threats.json'), 'utf-8'),
      );
      this.logger.log(`Loaded ${this.agenticSecurityData.threats.length} agentic threats`);
    } catch (e) {
      this.logger.warn('Failed to load agentic-security-threats.json', e.message);
    }

    try {
      this.riskDatabase = JSON.parse(
        fs.readFileSync(path.join(staticDir, 'ai-risk-database.json'), 'utf-8'),
      );
      this.logger.log(`Loaded ${this.riskDatabase.totalSearchableRisks} risk entries`);
    } catch (e) {
      this.logger.warn('Failed to load ai-risk-database.json', e.message);
    }

    try {
      this.moduleExplanations = JSON.parse(
        fs.readFileSync(path.join(staticDir, 'module-explanations.json'), 'utf-8'),
      );
      this.logger.log(`Loaded ${this.moduleExplanations.length} module explanations`);
    } catch (e) {
      this.logger.warn('Failed to load module-explanations.json', e.message);
    }

    try {
      this.dsgaiItems = JSON.parse(
        fs.readFileSync(path.join(staticDir, 'owasp-data-security-2026.json'), 'utf-8'),
      );
      this.logger.log(`Loaded ${this.dsgaiItems.length} DSGAI items (OWASP GenAI Data Security 2026)`);
    } catch (e) {
      this.logger.warn('Failed to load owasp-data-security-2026.json', e.message);
    }

    try {
      this.pssiData = JSON.parse(
        fs.readFileSync(path.join(staticDir, 'pssi-ia-v3.json'), 'utf-8'),
      );
      this.logger.log(`Loaded ${this.pssiData.rules.length} PSSI IA v3 rules (${this.pssiData.chapters.length} chapters)`);
    } catch (e) {
      this.logger.warn('Failed to load pssi-ia-v3.json', e.message);
    }
  }

  // ============================================================
  // COMPASS SCENARIOS (3 tools)
  // ============================================================

  searchCompassScenarios(params: any) {
    const { query, riskLevel, minRiskScore, oodaPhase } = params || {};
    let results = [...this.compassScenarios];

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (s) =>
          s.title.fr.toLowerCase().includes(q) ||
          s.title.en.toLowerCase().includes(q) ||
          s.description.fr.toLowerCase().includes(q) ||
          s.description.en.toLowerCase().includes(q) ||
          s.associatedThreat.fr.toLowerCase().includes(q) ||
          s.associatedThreat.en.toLowerCase().includes(q),
      );
    }

    if (riskLevel) {
      results = results.filter((s) => s.riskLevel === riskLevel);
    }

    if (minRiskScore) {
      const min = typeof minRiskScore === 'number' ? minRiskScore : parseInt(minRiskScore);
      results = results.filter((s) => s.riskScore >= min);
    }

    if (oodaPhase) {
      results = results.filter((s) => s.oodaPhase === oodaPhase);
    }

    return {
      count: results.length,
      totalScenarios: this.compassScenarios.length,
      scenarios: results,
    };
  }

  getCompassScenarioById(params: any) {
    const { id } = params || {};
    const scenario = this.compassScenarios.find((s) => s.id === id);

    if (!scenario) {
      return { found: false, id };
    }

    return { found: true, scenario };
  }

  getCompassStatistics() {
    const byRiskLevel: Record<string, number> = {};
    const byOodaPhase: Record<string, number> = {};
    let totalRiskScore = 0;

    for (const s of this.compassScenarios) {
      byRiskLevel[s.riskLevel] = (byRiskLevel[s.riskLevel] || 0) + 1;
      byOodaPhase[s.oodaPhase] = (byOodaPhase[s.oodaPhase] || 0) + 1;
      totalRiskScore += s.riskScore;
    }

    return {
      totalScenarios: this.compassScenarios.length,
      averageRiskScore: +(totalRiskScore / this.compassScenarios.length).toFixed(1),
      byRiskLevel,
      byOodaPhase,
      highestRiskScenarios: this.compassScenarios
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 5)
        .map((s) => ({ id: s.id, title: s.title.fr, riskScore: s.riskScore, riskLevel: s.riskLevel })),
    };
  }

  // ============================================================
  // AGENTIC SECURITY (3 tools)
  // ============================================================

  searchAgenticSecurityThreats(params: any) {
    const { query, category, grcPriority } = params || {};
    let results = [...(this.agenticSecurityData?.threats || [])];

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (t) =>
          t.threatName.toLowerCase().includes(q) ||
          t.threatNameEn.toLowerCase().includes(q) ||
          t.riskDescription.toLowerCase().includes(q) ||
          t.attackMechanism.toLowerCase().includes(q) ||
          t.impactAndExamples.toLowerCase().includes(q),
      );
    }

    if (category) {
      const cat = category.toLowerCase();
      results = results.filter((t) => t.category.toLowerCase().includes(cat));
    }

    if (grcPriority) {
      results = results.filter((t) => t.grcPriority === grcPriority);
    }

    return {
      count: results.length,
      totalThreats: this.agenticSecurityData?.threats?.length || 0,
      threats: results,
    };
  }

  getAgenticThreatById(params: any) {
    const { id } = params || {};
    const threat = this.agenticSecurityData?.threats?.find((t) => t.id === id);

    if (!threat) {
      return { found: false, id };
    }

    return { found: true, threat };
  }

  getMaestroLayers() {
    return {
      count: this.agenticSecurityData?.maestroLayers?.length || 0,
      layers: this.agenticSecurityData?.maestroLayers || [],
    };
  }

  // ============================================================
  // AI RISK DATABASE (3 tools)
  // ============================================================

  searchAiRiskDatabase(params: any) {
    const { query, domainCategory, entity, intentionality, limit = 20 } = params || {};
    let results = [...(this.riskDatabase?.risks || [])];

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.desc.toLowerCase().includes(q) ||
          r.cat.toLowerCase().includes(q),
      );
    }

    if (domainCategory) {
      results = results.filter((r) => r.dom === domainCategory);
    }

    if (entity) {
      results = results.filter((r) => r.ent === entity);
    }

    if (intentionality) {
      results = results.filter((r) => r.int === intentionality);
    }

    const total = results.length;
    const maxLimit = Math.min(typeof limit === 'number' ? limit : parseInt(limit) || 20, 100);
    results = results.slice(0, maxLimit);

    return {
      count: results.length,
      totalMatches: total,
      totalInDatabase: this.riskDatabase?.totalSearchableRisks || 0,
      risks: results.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.desc,
        riskCategory: r.cat,
        domainCategory: r.dom,
        domainSubcategory: r.sub,
        entity: r.ent,
        intentionality: r.int,
        timing: r.tim,
      })),
    };
  }

  getAiRiskStatistics() {
    return {
      metadata: this.riskDatabase?.metadata,
      statistics: this.riskDatabase?.statistics,
      topRiskCategories: this.riskDatabase?.topRiskCategories?.slice(0, 20),
    };
  }

  getAiRiskDomainTaxonomy() {
    return {
      domains: this.riskDatabase?.domainTaxonomy || [],
    };
  }

  // ============================================================
  // MODULE EXPLANATIONS & PLATFORM INFO (4 tools)
  // ============================================================

  getModuleExplanations(params: any) {
    const { moduleId } = params || {};

    if (moduleId) {
      const mod = this.moduleExplanations.find((m) => m.moduleId === moduleId);
      if (!mod) {
        return { found: false, moduleId };
      }
      return { found: true, module: mod };
    }

    return {
      count: this.moduleExplanations.length,
      modules: this.moduleExplanations,
    };
  }

  getPlatformOverview() {
    return {
      name: 'AI Risk Manager',
      description:
        'Plateforme complète de test, gestion et gouvernance de la sécurité des systèmes IA. Architecture hybride : SPA React (standalone) + backend NestJS full-stack avec PostgreSQL, Redis, et outils de pentest conteneurisés.',
      modules: [
        { id: 'applications', name: 'Applications à Tester', section: 0 },
        { id: 'beginner-mode', name: 'Mode Débutant (Promptfoo Wizard)', section: '1a' },
        { id: 'expert-mode', name: 'Mode Expert', section: '1b' },
        { id: 'unified-platform', name: 'Plateforme Unifiée (Garak, Promptfoo)', section: '1c' },
        { id: 'governance', name: 'Gouvernance IA', section: 2 },
        { id: 'red-team', name: 'Red Team & Audit', section: 3 },
        { id: 'references', name: 'Référentiels', section: 4 },
        { id: 'settings', name: 'Paramètres', section: 5 },
      ],
      pentestTools: [
        { name: 'Garak', description: 'Scanner de vulnérabilités LLM Python', capabilities: ['Probe scanning', 'Multi-model support', 'Report generation'] },
        { name: 'Promptfoo', description: 'Framework de test Node.js', capabilities: ['YAML configuration', 'Multi-provider testing', 'Dataset management'] },
      ],
      techStack: {
        frontend: 'React 19.1, TypeScript 5.8, Vite 6.2, Tailwind CSS',
        backend: 'NestJS 10.3, Prisma (PostgreSQL 16), Redis 7, Bull Queue',
        security: 'Helmet, CORS, JWT, bcrypt, AES-256',
      },
      securityFrameworks: ['OWASP LLM Top 10', 'OWASP Agentic AI Top 15', 'MITRE ATT&CK', 'MITRE ATLAS', 'EU AI Act'],
      dataStats: {
        compassScenarios: this.compassScenarios.length,
        agenticThreats: this.agenticSecurityData?.threats?.length || 0,
        aiRisks: this.riskDatabase?.totalSearchableRisks || 0,
      },
    };
  }

  getSupportedLlmProviders() {
    return {
      count: 10,
      providers: [
        { id: 'gemini', name: 'Google Gemini', models: ['gemini-3-flash-preview', 'gemini-3.1-pro-preview'], configKey: 'GEMINI_API_KEY' },
        { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1', 'o3-mini'], configKey: 'OPENAI_API_KEY' },
        { id: 'claude', name: 'Anthropic Claude', models: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'], configKey: 'ANTHROPIC_API_KEY' },
        { id: 'mistral', name: 'Mistral AI', models: ['mistral-large', 'mistral-medium', 'mistral-small'], configKey: 'MISTRAL_API_KEY' },
        { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-reasoner'], configKey: 'DEEPSEEK_API_KEY' },
        { id: 'qwen', name: 'Alibaba Qwen', models: ['qwen-max', 'qwen-plus', 'qwen-turbo'], configKey: 'QWEN_API_KEY' },
        { id: 'xai', name: 'xAI Grok', models: ['grok-2', 'grok-beta'], configKey: 'XAI_API_KEY' },
        { id: 'groq', name: 'Groq', models: ['llama-3.3-70b', 'mixtral-8x7b'], configKey: 'GROQ_API_KEY' },
        { id: 'ollama', name: 'Ollama (local)', models: ['llama3', 'mistral', 'codellama'], configKey: null },
        { id: 'lmstudio', name: 'LM Studio (local)', models: ['Configurable'], configKey: null },
      ],
      sharedConfig: {
        parameters: ['temperature', 'maxTokens', 'topP', 'topK'],
        storageKey: 'llm-global-config',
        sharedAcross: ['Garak', 'Promptfoo', 'Chatbot'],
      },
    };
  }

  getSecurityFrameworks() {
    return {
      frameworks: [
        {
          id: 'owasp-llm-top10',
          name: 'OWASP LLM Top 10',
          version: '2025',
          categories: [
            { id: 'LLM01', name: 'Prompt Injection' },
            { id: 'LLM02', name: 'Insecure Output Handling' },
            { id: 'LLM03', name: 'Training Data Poisoning' },
            { id: 'LLM04', name: 'Model Denial of Service' },
            { id: 'LLM05', name: 'Supply Chain Vulnerabilities' },
            { id: 'LLM06', name: 'Sensitive Information Disclosure' },
            { id: 'LLM07', name: 'Insecure Plugin Design' },
            { id: 'LLM08', name: 'Excessive Agency' },
            { id: 'LLM09', name: 'Overreliance' },
            { id: 'LLM10', name: 'Model Theft' },
          ],
        },
        {
          id: 'owasp-agentic-top15',
          name: 'OWASP Agentic AI Top 15',
          version: '2026',
          categories: [
            { id: 'ASI01', name: 'Agent Goal Hijacking' },
            { id: 'ASI02', name: 'Insecure Tool Calling' },
            { id: 'ASI03', name: 'Excessive Autonomy' },
            { id: 'ASI04', name: 'Memory Poisoning' },
            { id: 'ASI05', name: 'Privilege Escalation' },
            { id: 'ASI06', name: 'Multi-Agent Manipulation' },
            { id: 'ASI07', name: 'Insecure Code Execution' },
            { id: 'ASI08', name: 'Data Leakage via Agent' },
            { id: 'ASI09', name: 'Supply Chain Compromise' },
            { id: 'ASI10', name: 'Rogue Agent Behavior' },
            { id: 'ASI11', name: 'Identity Spoofing' },
            { id: 'ASI12', name: 'Insufficient Monitoring' },
            { id: 'ASI13', name: 'Insecure MCP Integration' },
            { id: 'ASI14', name: 'Human Trust Exploitation' },
            { id: 'ASI15', name: 'Cascading Failure Propagation' },
          ],
        },
        {
          id: 'mitre-attack',
          name: 'MITRE ATT&CK',
          description: 'Framework de tactiques et techniques adverses pour la cybersécurité.',
        },
        {
          id: 'mitre-atlas',
          name: 'MITRE ATLAS',
          description: 'Adversarial Threat Landscape for AI Systems — extension d\'ATT&CK pour l\'IA.',
        },
        {
          id: 'nist-ai-rmf',
          name: 'NIST AI RMF',
          description: 'AI Risk Management Framework du National Institute of Standards and Technology.',
        },
        {
          id: 'eu-ai-act',
          name: 'EU AI Act',
          description: 'Règlement européen sur l\'intelligence artificielle. Classification par niveau de risque.',
        },
      ],
    };
  }

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

  // ============================================================
  // PSSI IA v3 — Politique de Sécurité des SIA, consolidée (4 tools)
  // ============================================================

  searchPssiSia(params: any) {
    const { query, chapterNumber, referentialKeyword, tier, limit } = params || {};
    let results = [...(this.pssiData?.rules || [])];

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (r) =>
          r.ruleText.toLowerCase().includes(q) ||
          r.testableControl.toLowerCase().includes(q) ||
          r.raci.toLowerCase().includes(q) ||
          r.sourcesReferentials.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q),
      );
    }

    if (chapterNumber) {
      results = results.filter((r) => r.chapterNumber === String(chapterNumber));
    }

    if (referentialKeyword) {
      const k = referentialKeyword.toLowerCase();
      results = results.filter((r) => r.sourcesReferentials.toLowerCase().includes(k));
    }

    if (tier) {
      const t = tier.toLowerCase();
      results = results.filter((r) => r.tier.toLowerCase().includes(t));
    }

    const cap = typeof limit === 'number' && limit > 0 ? limit : 50;
    return {
      count: results.length,
      totalRules: this.pssiData?.rules.length || 0,
      rules: results.slice(0, cap),
    };
  }

  getPssiSiaById(params: any) {
    const { id } = params || {};
    if (!id) return { found: false, id: null };
    const needle = String(id).toUpperCase().trim();
    const rule = this.pssiData?.rules.find((r) => r.id.toUpperCase() === needle);
    if (!rule) return { found: false, id };
    return { found: true, rule };
  }

  listPssiChapters() {
    return {
      version: this.pssiData?.meta.version || null,
      totalChapters: this.pssiData?.chapters.length || 0,
      totalRules: this.pssiData?.rules.length || 0,
      chapters: (this.pssiData?.chapters || []).map((c) => ({
        number: c.number,
        title: c.title,
        rulesCount: c.ruleIds.length,
        firstRuleId: c.ruleIds[0] || null,
        lastRuleId: c.ruleIds[c.ruleIds.length - 1] || null,
      })),
    };
  }

  getPssiStatistics() {
    const rules = this.pssiData?.rules || [];
    const byChapter: Record<string, number> = {};
    const byTier: Record<string, number> = {};
    const referentialCounts: Record<string, number> = {};
    const KNOWN_REFS = ['AI Act', 'ISO 42001', 'ISO 27001', 'ISO 27090', 'ISO 27701', 'OWASP AISVS', 'OWASP LLM', 'OWASP Agentic', 'MITRE ATLAS', 'NIST AI RMF', 'CLUSIF', 'RGPD', 'DORA', 'NIS2', 'CESIN', 'ANSSI'];

    for (const r of rules) {
      byChapter[r.chapterNumber] = (byChapter[r.chapterNumber] || 0) + 1;
      const t = r.tier || 'Non précisé';
      byTier[t] = (byTier[t] || 0) + 1;
      for (const ref of KNOWN_REFS) {
        if (r.sourcesReferentials.includes(ref)) {
          referentialCounts[ref] = (referentialCounts[ref] || 0) + 1;
        }
      }
    }

    const topReferentials = Object.entries(referentialCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    return {
      totalRules: rules.length,
      version: this.pssiData?.meta.version || null,
      source: this.pssiData?.meta.source || null,
      byChapter,
      byTier,
      topReferentials,
    };
  }
}
