import { Test, TestingModule } from '@nestjs/testing';

// ── Mock data ────────────────────────────────────────────────────────
const MOCK_COMPASS_SCENARIOS = [
  {
    id: 'COMPASS-UC-0001',
    title: { fr: 'Jailbreak de chatbot interne', en: 'Jailbreak of internal chatbot' },
    description: { fr: 'Contournement du modèle via manipulation de prompt', en: 'Model control bypass via prompt manipulation' },
    impact: 4,
    likelihood: 5,
    riskScore: 20,
    riskLevel: 'critical',
    recommendation: { fr: 'Mitigation immédiate requise', en: 'Immediate mitigation required' },
    associatedThreat: { fr: 'Injection de prompt', en: 'Prompt injection' },
    attackMapping: { mitre: 'T1059', atlas: 'AML.T0051', description: { fr: 'Injection', en: 'Injection' } },
    oodaPhase: 'Observe',
    relatedCVEs: ['CVE-2024-0001'],
    relatedIncidents: ['INC-001'],
  },
  {
    id: 'COMPASS-UC-0002',
    title: { fr: 'Fuite de données sensibles', en: 'Sensitive data leakage' },
    description: { fr: 'Exfiltration de données via le modèle LLM', en: 'Data exfiltration via LLM model' },
    impact: 5,
    likelihood: 3,
    riskScore: 15,
    riskLevel: 'high',
    recommendation: { fr: 'Contrôles DLP nécessaires', en: 'DLP controls needed' },
    associatedThreat: { fr: 'Fuite de données', en: 'Data leakage' },
    attackMapping: { mitre: 'T1041', description: { fr: 'Exfiltration', en: 'Exfiltration' } },
    oodaPhase: 'Orient',
    relatedCVEs: [],
    relatedIncidents: [],
  },
  {
    id: 'COMPASS-UC-0003',
    title: { fr: 'Déni de service du modèle', en: 'Model denial of service' },
    description: { fr: 'Surcharge du modèle via requêtes massives', en: 'Model overload via massive requests' },
    impact: 3,
    likelihood: 4,
    riskScore: 12,
    riskLevel: 'moderate',
    recommendation: { fr: 'Rate limiting requis', en: 'Rate limiting required' },
    associatedThreat: { fr: 'Déni de service', en: 'Denial of service' },
    attackMapping: {},
    oodaPhase: 'Decide',
    relatedCVEs: [],
    relatedIncidents: [],
  },
];

const MOCK_AGENTIC_DATA = {
  metadata: { totalThreats: 3, totalCategories: 2, version: '2026' },
  maestroLayers: [
    { index: 1, name: 'Foundation Models', description: 'Base layer' },
    { index: 2, name: 'Agent Frameworks', description: 'Orchestration layer' },
  ],
  threats: [
    {
      id: 'AST-001',
      category: 'Foundation Models',
      categoryIcon: 'brain',
      categoryIndex: 1,
      threatName: 'Injection de prompt',
      threatNameEn: 'Prompt Injection',
      owaspCode: 'ASI01',
      riskDescription: 'Manipulation du modèle via injection de prompt',
      attackMechanism: 'Insertion de directives malveillantes',
      impactAndExamples: 'Contournement des guardrails',
      mitigations: ['Validation des entrées', 'Filtrage'],
      maestroLayer: 'Foundation Models',
      grcPriority: 'critical',
      mitreAtlasRef: 'AML.T0051',
    },
    {
      id: 'AST-002',
      category: 'Agent Frameworks',
      categoryIcon: 'cog',
      categoryIndex: 2,
      threatName: 'Abus des outils',
      threatNameEn: 'Tool Abuse',
      owaspCode: 'ASI02',
      riskDescription: 'Utilisation non autorisée des outils par un agent',
      attackMechanism: 'Appels directs aux outils sans vérification',
      impactAndExamples: 'Exécution de code malveillant',
      mitigations: ['Least privilege', 'Sandboxing'],
      maestroLayer: 'Agent Frameworks',
      grcPriority: 'high',
      mitreAtlasRef: null,
    },
    {
      id: 'AST-003',
      category: 'Foundation Models',
      categoryIcon: 'brain',
      categoryIndex: 1,
      threatName: 'Fuite de données',
      threatNameEn: 'Data Leakage',
      owaspCode: 'ASI08',
      riskDescription: 'Exfiltration de données sensibles via le modèle',
      attackMechanism: 'Extraction de données training',
      impactAndExamples: 'Perte de confidentialité',
      mitigations: ['DLP', 'Output filtering'],
      maestroLayer: 'Foundation Models',
      grcPriority: 'critical',
      mitreAtlasRef: 'AML.T0024',
    },
  ],
};

const MOCK_RISK_DATABASE = {
  metadata: { totalEntries: 3, version: 'v4', lastUpdated: '2026-01-15' },
  statistics: { totalEntries: 3, byCausalCategory: { Security: 2, Fairness: 1 } },
  domainTaxonomy: [
    { name: 'Technical', count: 2 },
    { name: 'Ethics', count: 1 },
  ],
  topRiskCategories: [
    { name: 'Security', count: 2 },
    { name: 'Fairness', count: 1 },
  ],
  totalSearchableRisks: 3,
  risks: [
    { id: 'RISK-001', title: 'Bias in AI', desc: 'Systematic bias in model outputs', cat: 'Fairness', dom: 'Ethics', sub: 'Discrimination', ent: 'Human', int: 'Unintentional', tim: 'Pre-deployment' },
    { id: 'RISK-002', title: 'Model theft', desc: 'Unauthorized extraction of model', cat: 'Security', dom: 'Technical', sub: 'IP Protection', ent: 'AI', int: 'Intentional', tim: 'Post-deployment' },
    { id: 'RISK-003', title: 'Prompt injection attack', desc: 'Malicious prompt manipulation', cat: 'Security', dom: 'Technical', sub: 'Adversarial', ent: 'AI', int: 'Intentional', tim: 'Post-deployment' },
  ],
};

const MOCK_MODULE_EXPLANATIONS = [
  { moduleId: 'applications', title: 'Applications à Tester', description: 'Profils applicatifs', workflow: 'Configurer les cibles', keyFeatures: ['Gestion des profils', 'Configuration des APIs'] },
  { moduleId: 'compass-use-cases', title: 'COMPASS', description: 'Évaluation des scénarios de risque', workflow: 'Analyse OODA', keyFeatures: ['31 scénarios', 'Scoring'] },
  { moduleId: 'beginner-mode', title: 'Mode Débutant', description: 'Assistant guidé', workflow: 'Wizard interactif', keyFeatures: ['Promptfoo Wizard', 'Configurations guidées'] },
  { moduleId: 'expert-mode', title: 'Mode Expert', description: 'Configuration avancée', workflow: 'YAML + exécution', keyFeatures: ['YAML config', 'Datasets', 'Exécution'] },
  { moduleId: 'unified-platform', title: 'Plateforme Unifiée', description: 'Hub de sécurité', workflow: 'Orchestration', keyFeatures: ['Garak', 'Promptfoo'] },
  { moduleId: 'governance', title: 'Gouvernance IA', description: 'Politique de sécurité IA', workflow: 'GRC', keyFeatures: ['Politique SIA', 'Conformité'] },
  { moduleId: 'red-team', title: 'Red Team & Audit', description: 'Tests de sécurité offensifs', workflow: 'Audit & revue', keyFeatures: ['Revue de sécurité', 'Résultats'] },
  { moduleId: 'settings', title: 'Paramètres', description: 'Configuration globale', workflow: 'Setup', keyFeatures: ['LLM config', 'Préférences'] },
];

// ── Mock fs ──────────────────────────────────────────────────────────
jest.mock('fs', () => ({
  readFileSync: jest.fn((filePath: string) => {
    if (filePath.includes('compass-scenarios')) {
      return JSON.stringify(MOCK_COMPASS_SCENARIOS);
    }
    if (filePath.includes('agentic-security')) {
      return JSON.stringify(MOCK_AGENTIC_DATA);
    }
    if (filePath.includes('ai-risk-database')) {
      return JSON.stringify(MOCK_RISK_DATABASE);
    }
    if (filePath.includes('module-explanations')) {
      return JSON.stringify(MOCK_MODULE_EXPLANATIONS);
    }
    return '[]';
  }),
}));

jest.mock('path', () => ({
  join: jest.fn((...args: string[]) => args.join('/')),
}));

import { McpStaticDataService } from './mcp-static-data.service';

describe('McpStaticDataService', () => {
  let service: McpStaticDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McpStaticDataService],
    }).compile();

    service = module.get<McpStaticDataService>(McpStaticDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ================================================================
  // COMPASS SCENARIOS
  // ================================================================

  describe('searchCompassScenarios', () => {
    it('should return all scenarios when no filters are provided', () => {
      const result = service.searchCompassScenarios({});
      expect(result.count).toBe(3);
      expect(result.totalScenarios).toBe(3);
      expect(result.scenarios).toHaveLength(3);
    });

    it('should filter by query on title (FR)', () => {
      const result = service.searchCompassScenarios({ query: 'jailbreak' });
      expect(result.count).toBe(1);
      expect(result.scenarios[0].id).toBe('COMPASS-UC-0001');
    });

    it('should filter by query on title (EN)', () => {
      const result = service.searchCompassScenarios({ query: 'denial' });
      expect(result.count).toBe(1);
      expect(result.scenarios[0].id).toBe('COMPASS-UC-0003');
    });

    it('should filter by query on associatedThreat', () => {
      const result = service.searchCompassScenarios({ query: 'injection' });
      expect(result.count).toBe(1);
      expect(result.scenarios[0].id).toBe('COMPASS-UC-0001');
    });

    it('should filter by riskLevel critical', () => {
      const result = service.searchCompassScenarios({ riskLevel: 'critical' });
      expect(result.count).toBe(1);
      expect(result.scenarios[0].riskLevel).toBe('critical');
    });

    it('should filter by riskLevel high', () => {
      const result = service.searchCompassScenarios({ riskLevel: 'high' });
      expect(result.count).toBe(1);
      expect(result.scenarios[0].id).toBe('COMPASS-UC-0002');
    });

    it('should filter by minRiskScore as number', () => {
      const result = service.searchCompassScenarios({ minRiskScore: 15 });
      expect(result.count).toBe(2);
      expect(result.scenarios.every((s) => s.riskScore >= 15)).toBe(true);
    });

    it('should filter by minRiskScore as string', () => {
      const result = service.searchCompassScenarios({ minRiskScore: '20' });
      expect(result.count).toBe(1);
      expect(result.scenarios[0].riskScore).toBe(20);
    });

    it('should filter by oodaPhase', () => {
      const result = service.searchCompassScenarios({ oodaPhase: 'Observe' });
      expect(result.count).toBe(1);
      expect(result.scenarios[0].id).toBe('COMPASS-UC-0001');
    });

    it('should combine multiple filters', () => {
      const result = service.searchCompassScenarios({
        riskLevel: 'critical',
        oodaPhase: 'Observe',
      });
      expect(result.count).toBe(1);
      expect(result.scenarios[0].id).toBe('COMPASS-UC-0001');
    });

    it('should return empty results when no match', () => {
      const result = service.searchCompassScenarios({ query: 'nonexistent' });
      expect(result.count).toBe(0);
      expect(result.scenarios).toHaveLength(0);
      expect(result.totalScenarios).toBe(3);
    });

    it('should handle null/undefined params', () => {
      const result = service.searchCompassScenarios(null);
      expect(result.count).toBe(3);
    });
  });

  describe('getCompassScenarioById', () => {
    it('should return a scenario when found', () => {
      const result = service.getCompassScenarioById({ id: 'COMPASS-UC-0001' });
      expect(result.found).toBe(true);
      expect(result.scenario).toBeDefined();
      expect(result.scenario.id).toBe('COMPASS-UC-0001');
      expect(result.scenario.riskScore).toBe(20);
    });

    it('should return found:false for unknown ID', () => {
      const result = service.getCompassScenarioById({ id: 'COMPASS-UC-9999' });
      expect(result.found).toBe(false);
      expect(result.id).toBe('COMPASS-UC-9999');
    });

    it('should handle null params', () => {
      const result = service.getCompassScenarioById(null);
      expect(result.found).toBe(false);
    });
  });

  describe('getCompassStatistics', () => {
    it('should return statistics with correct totalScenarios', () => {
      const result = service.getCompassStatistics();
      expect(result.totalScenarios).toBe(3);
    });

    it('should compute averageRiskScore correctly', () => {
      const result = service.getCompassStatistics();
      const expected = +((20 + 15 + 12) / 3).toFixed(1);
      expect(result.averageRiskScore).toBe(expected);
    });

    it('should count riskLevel distribution', () => {
      const result = service.getCompassStatistics();
      expect(result.byRiskLevel).toEqual({
        critical: 1,
        high: 1,
        moderate: 1,
      });
    });

    it('should count oodaPhase distribution', () => {
      const result = service.getCompassStatistics();
      expect(result.byOodaPhase).toEqual({
        Observe: 1,
        Orient: 1,
        Decide: 1,
      });
    });

    it('should return highestRiskScenarios sorted desc', () => {
      const result = service.getCompassStatistics();
      expect(result.highestRiskScenarios.length).toBeLessThanOrEqual(5);
      expect(result.highestRiskScenarios[0].riskScore).toBe(20);
      expect(result.highestRiskScenarios[1].riskScore).toBe(15);
    });
  });

  // ================================================================
  // AGENTIC SECURITY
  // ================================================================

  describe('searchAgenticSecurityThreats', () => {
    it('should return all threats when no filters', () => {
      const result = service.searchAgenticSecurityThreats({});
      expect(result.count).toBe(3);
      expect(result.totalThreats).toBe(3);
    });

    it('should filter by query on threatName', () => {
      const result = service.searchAgenticSecurityThreats({ query: 'injection' });
      expect(result.count).toBe(1);
      expect(result.threats[0].id).toBe('AST-001');
    });

    it('should filter by query on threatNameEn', () => {
      const result = service.searchAgenticSecurityThreats({ query: 'tool abuse' });
      expect(result.count).toBe(1);
      expect(result.threats[0].id).toBe('AST-002');
    });

    it('should filter by category', () => {
      const result = service.searchAgenticSecurityThreats({ category: 'Foundation' });
      expect(result.count).toBe(2);
      expect(result.threats.every((t) => t.category === 'Foundation Models')).toBe(true);
    });

    it('should filter by grcPriority', () => {
      const result = service.searchAgenticSecurityThreats({ grcPriority: 'critical' });
      expect(result.count).toBe(2);
    });

    it('should combine query + category', () => {
      const result = service.searchAgenticSecurityThreats({
        query: 'injection',
        category: 'Foundation',
      });
      expect(result.count).toBe(1);
      expect(result.threats[0].id).toBe('AST-001');
    });

    it('should return empty for no match', () => {
      const result = service.searchAgenticSecurityThreats({ query: 'zzzzz' });
      expect(result.count).toBe(0);
    });

    it('should handle null params', () => {
      const result = service.searchAgenticSecurityThreats(null);
      expect(result.count).toBe(3);
    });
  });

  describe('getAgenticThreatById', () => {
    it('should find a threat by ID', () => {
      const result = service.getAgenticThreatById({ id: 'AST-002' });
      expect(result.found).toBe(true);
      expect(result.threat.threatNameEn).toBe('Tool Abuse');
    });

    it('should return found:false for unknown ID', () => {
      const result = service.getAgenticThreatById({ id: 'AST-999' });
      expect(result.found).toBe(false);
      expect(result.id).toBe('AST-999');
    });
  });

  describe('getMaestroLayers', () => {
    it('should return all layers', () => {
      const result = service.getMaestroLayers();
      expect(result.count).toBe(2);
      expect(result.layers).toHaveLength(2);
      expect(result.layers[0].name).toBe('Foundation Models');
    });
  });

  // ================================================================
  // AI RISK DATABASE
  // ================================================================

  describe('searchAiRiskDatabase', () => {
    it('should return all risks when no filters', () => {
      const result = service.searchAiRiskDatabase({});
      expect(result.count).toBe(3);
      expect(result.totalMatches).toBe(3);
      expect(result.totalInDatabase).toBe(3);
    });

    it('should filter by query on title', () => {
      const result = service.searchAiRiskDatabase({ query: 'bias' });
      expect(result.count).toBe(1);
      expect(result.risks[0].id).toBe('RISK-001');
    });

    it('should filter by query on description', () => {
      const result = service.searchAiRiskDatabase({ query: 'manipulation' });
      expect(result.count).toBe(1);
      expect(result.risks[0].id).toBe('RISK-003');
    });

    it('should filter by query on category', () => {
      const result = service.searchAiRiskDatabase({ query: 'security' });
      expect(result.count).toBe(2);
    });

    it('should filter by domainCategory', () => {
      const result = service.searchAiRiskDatabase({ domainCategory: 'Technical' });
      expect(result.count).toBe(2);
      expect(result.risks.every((r) => r.domainCategory === 'Technical')).toBe(true);
    });

    it('should filter by entity', () => {
      const result = service.searchAiRiskDatabase({ entity: 'Human' });
      expect(result.count).toBe(1);
      expect(result.risks[0].entity).toBe('Human');
    });

    it('should filter by intentionality', () => {
      const result = service.searchAiRiskDatabase({ intentionality: 'Intentional' });
      expect(result.count).toBe(2);
    });

    it('should respect limit parameter', () => {
      const result = service.searchAiRiskDatabase({ limit: 1 });
      expect(result.count).toBe(1);
      expect(result.totalMatches).toBe(3);
    });

    it('should cap limit at 100', () => {
      const result = service.searchAiRiskDatabase({ limit: 200 });
      expect(result.count).toBeLessThanOrEqual(100);
    });

    it('should map risk fields correctly', () => {
      const result = service.searchAiRiskDatabase({ query: 'bias' });
      const risk = result.risks[0];
      expect(risk).toEqual({
        id: 'RISK-001',
        title: 'Bias in AI',
        description: 'Systematic bias in model outputs',
        riskCategory: 'Fairness',
        domainCategory: 'Ethics',
        domainSubcategory: 'Discrimination',
        entity: 'Human',
        intentionality: 'Unintentional',
        timing: 'Pre-deployment',
      });
    });

    it('should handle null params', () => {
      const result = service.searchAiRiskDatabase(null);
      expect(result.count).toBe(3);
    });
  });

  describe('getAiRiskStatistics', () => {
    it('should return metadata', () => {
      const result = service.getAiRiskStatistics();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.version).toBe('v4');
    });

    it('should return statistics', () => {
      const result = service.getAiRiskStatistics();
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalEntries).toBe(3);
    });

    it('should return topRiskCategories (max 20)', () => {
      const result = service.getAiRiskStatistics();
      expect(result.topRiskCategories).toBeDefined();
      expect(result.topRiskCategories.length).toBeLessThanOrEqual(20);
    });
  });

  describe('getAiRiskDomainTaxonomy', () => {
    it('should return domain taxonomy', () => {
      const result = service.getAiRiskDomainTaxonomy();
      expect(result.domains).toHaveLength(2);
      expect(result.domains[0].name).toBe('Technical');
    });
  });

  // ================================================================
  // MODULE EXPLANATIONS & PLATFORM INFO
  // ================================================================

  describe('getModuleExplanations', () => {
    it('should return all modules when no moduleId', () => {
      const result = service.getModuleExplanations({});
      expect(result.count).toBe(8);
      expect(result.modules).toHaveLength(8);
    });

    it('should return a specific module by moduleId', () => {
      const result = service.getModuleExplanations({ moduleId: 'compass-use-cases' });
      expect(result.found).toBe(true);
      expect(result.module.title).toBe('COMPASS');
    });

    it('should return found:false for unknown moduleId', () => {
      const result = service.getModuleExplanations({ moduleId: 'nonexistent' });
      expect(result.found).toBe(false);
      expect(result.moduleId).toBe('nonexistent');
    });

    it('should handle null params', () => {
      const result = service.getModuleExplanations(null);
      expect(result.count).toBe(8);
    });
  });

  describe('getPlatformOverview', () => {
    it('should return platform name and description', () => {
      const result = service.getPlatformOverview();
      expect(result.name).toBe('AI Risk Manager');
      expect(result.description).toContain('Plateforme complète');
    });

    it('should list 8 modules', () => {
      const result = service.getPlatformOverview();
      expect(result.modules).toHaveLength(8);
    });

    it('should list 2 pentest tools', () => {
      const result = service.getPlatformOverview();
      expect(result.pentestTools).toHaveLength(2);
      expect(result.pentestTools.map((t) => t.name)).toEqual(['Garak', 'Promptfoo']);
    });

    it('should include dataStats from loaded data', () => {
      const result = service.getPlatformOverview();
      expect(result.dataStats.compassScenarios).toBe(3);
      expect(result.dataStats.agenticThreats).toBe(3);
      expect(result.dataStats.aiRisks).toBe(3);
    });

    it('should include security frameworks list', () => {
      const result = service.getPlatformOverview();
      expect(result.securityFrameworks).toContain('OWASP LLM Top 10');
    });
  });

  describe('getSupportedLlmProviders', () => {
    it('should return 10 providers', () => {
      const result = service.getSupportedLlmProviders();
      expect(result.count).toBe(10);
      expect(result.providers).toHaveLength(10);
    });

    it('should include provider IDs', () => {
      const result = service.getSupportedLlmProviders();
      const ids = result.providers.map((p) => p.id);
      expect(ids).toContain('gemini');
      expect(ids).toContain('openai');
      expect(ids).toContain('claude');
      expect(ids).toContain('ollama');
    });

    it('should have null configKey for local providers', () => {
      const result = service.getSupportedLlmProviders();
      const ollama = result.providers.find((p) => p.id === 'ollama');
      expect(ollama.configKey).toBeNull();
    });

    it('should include sharedConfig', () => {
      const result = service.getSupportedLlmProviders();
      expect(result.sharedConfig.parameters).toContain('temperature');
      expect(result.sharedConfig.sharedAcross).toContain('Chatbot');
    });
  });

  describe('getSecurityFrameworks', () => {
    it('should return multiple frameworks', () => {
      const result = service.getSecurityFrameworks();
      expect(result.frameworks.length).toBeGreaterThanOrEqual(4);
    });

    it('should include OWASP LLM Top 10 with 10 categories', () => {
      const result = service.getSecurityFrameworks();
      const llmTop10 = result.frameworks.find((f) => f.id === 'owasp-llm-top10');
      expect(llmTop10).toBeDefined();
      expect(llmTop10.categories).toHaveLength(10);
      expect(llmTop10.categories[0].id).toBe('LLM01');
    });

    it('should include OWASP Agentic AI Top 15 with 15 categories', () => {
      const result = service.getSecurityFrameworks();
      const agentic = result.frameworks.find((f) => f.id === 'owasp-agentic-top15');
      expect(agentic).toBeDefined();
      expect(agentic.categories).toHaveLength(15);
    });

    it('should include MITRE ATT&CK and ATLAS', () => {
      const result = service.getSecurityFrameworks();
      const ids = result.frameworks.map((f) => f.id);
      expect(ids).toContain('mitre-attack');
      expect(ids).toContain('mitre-atlas');
    });
  });
});
