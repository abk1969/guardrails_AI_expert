export interface McpToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
}

/**
 * Unified MCP tool schemas compatible with Anthropic/Gemini/OpenAI tool calling.
 * 12 existing database tools + 13 new static data tools = 25 total.
 */
export const MCP_TOOL_SCHEMAS: McpToolSchema[] = [
  // ============================================================
  // EXISTING DATABASE TOOLS (12)
  // ============================================================
  {
    name: 'search_ai_policies',
    description: 'Rechercher dans les politiques IA (règles SIA CLUSIF). Retourne les politiques correspondant aux critères.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texte de recherche libre dans les politiques' },
        reference: { type: 'string', description: 'Référence spécifique (ex: SIA-01)' },
        status: { type: 'string', description: 'Statut de la politique' },
        limit: { type: 'number', description: 'Nombre maximum de résultats (défaut: 50)' },
      },
    },
  },
  {
    name: 'get_policy_by_reference',
    description: 'Obtenir une politique IA par sa référence exacte (ex: SIA-01).',
    parameters: {
      type: 'object',
      properties: {
        reference: { type: 'string', description: 'Référence de la politique (ex: SIA-01)' },
      },
      required: ['reference'],
    },
  },
  {
    name: 'search_test_results',
    description: 'Rechercher dans les résultats de tests guardrails LLM.',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Statut du test (PASSED, FAILED)' },
        category: { type: 'string', description: 'Catégorie du prompt testé' },
        limit: { type: 'number', description: 'Nombre maximum de résultats (défaut: 100)' },
      },
    },
  },
  {
    name: 'get_test_statistics',
    description: 'Obtenir les statistiques globales des tests : total, réussis, échoués, taux de réussite, par catégorie.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_use_cases',
    description: 'Rechercher dans les cas d\'usage et évaluations de risques stockés en base.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texte de recherche' },
        minRisk: { type: 'string', description: 'Score de risque minimum' },
        limit: { type: 'number', description: 'Nombre maximum de résultats (défaut: 50)' },
      },
    },
  },
  {
    name: 'search_threat_profiles',
    description: 'Rechercher dans les profils de menaces stockés en base de données.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texte de recherche dans les menaces' },
        limit: { type: 'number', description: 'Nombre maximum de résultats (défaut: 50)' },
      },
    },
  },
  {
    name: 'search_vulnerabilities',
    description: 'Rechercher dans les vulnérabilités connues (CVE, OWASP).',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texte de recherche (CVE, description)' },
        owaspCategory: { type: 'string', description: 'Catégorie OWASP LLM' },
        minSeverity: { type: 'string', description: 'Score de sévérité minimum (1-5)' },
        limit: { type: 'number', description: 'Nombre maximum de résultats (défaut: 50)' },
      },
    },
  },
  {
    name: 'search_defenses',
    description: 'Rechercher dans les défenses et mitigations par catégorie OWASP.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_owasp_categories',
    description: 'Obtenir les catégories OWASP LLM Top 10 et Agentic AI.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_prompt_templates',
    description: 'Rechercher dans les templates de prompts d\'attaque.',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Catégorie du prompt' },
        complexity: { type: 'string', description: 'Niveau de complexité' },
        attackFamily: { type: 'string', description: 'Famille d\'attaque' },
        limit: { type: 'number', description: 'Nombre maximum de résultats (défaut: 50)' },
      },
    },
  },
  {
    name: 'get_test_targets',
    description: 'Obtenir les cibles de test configurées pour l\'organisation.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'analyze_risk_trends',
    description: 'Analyser les tendances de risques au fil du temps (30 derniers jours).',
    parameters: {
      type: 'object',
      properties: {},
    },
  },

  // ============================================================
  // NEW STATIC DATA TOOLS (13)
  // ============================================================
  {
    name: 'search_compass_scenarios',
    description: 'Rechercher dans les 31 scénarios OWASP COMPASS. Chaque scénario contient un titre, description, score de risque (impact x probabilité), niveau de risque, menace associée, et mapping MITRE ATT&CK/ATLAS.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texte de recherche dans les titres, descriptions et menaces' },
        riskLevel: { type: 'string', description: 'Niveau de risque', enum: ['critical', 'high', 'moderate', 'low'] },
        minRiskScore: { type: 'number', description: 'Score de risque minimum (1-25)' },
        oodaPhase: { type: 'string', description: 'Phase OODA', enum: ['observe', 'orient', 'decide', 'act'] },
      },
    },
  },
  {
    name: 'get_compass_scenario_by_id',
    description: 'Obtenir un scénario COMPASS par son identifiant (ex: COMPASS-UC-0001).',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Identifiant du scénario (ex: COMPASS-UC-0001)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_compass_statistics',
    description: 'Obtenir les statistiques des scénarios COMPASS : distribution par niveau de risque, score moyen, phases OODA.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_agentic_security_threats',
    description: 'Rechercher dans les 29 menaces de sécurité agentique. Couvre 9 catégories (Logique & Objectifs, Outils & Exécution, Mémoire & Contexte, etc.) avec descriptions, mécanismes d\'attaque, impacts et mitigations.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texte de recherche dans les menaces agentiques' },
        category: { type: 'string', description: 'Catégorie de menace (ex: Logique & Objectifs, Outils & Execution)' },
        grcPriority: { type: 'string', description: 'Priorité GRC', enum: ['CRITIQUE', 'HAUTE', 'MOYENNE'] },
      },
    },
  },
  {
    name: 'get_agentic_threat_by_id',
    description: 'Obtenir une menace agentique par son identifiant (ex: AST-001).',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Identifiant de la menace (ex: AST-001)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_maestro_layers',
    description: 'Obtenir les 7 couches du framework MAESTRO pour la sécurité agentique (Foundation Models, Data Operations, Agent Frameworks, etc.).',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'search_ai_risk_database',
    description: 'Rechercher dans la base de 1579 risques IA (AI Risk Repository V4). Permet de filtrer par catégorie de domaine, entité causale, intentionnalité et timing.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texte de recherche dans les titres et descriptions de risques' },
        domainCategory: { type: 'string', description: 'Catégorie de domaine', enum: [
          'Discrimination et Toxicité',
          'Vie Privée et Sécurité',
          'Désinformation',
          'Acteurs Malveillants et Utilisation Abusive',
          'Interaction Humain-Ordinateur',
          'Socioéconomique et Environnemental',
          'Sécurité du Système IA, Défaillances et Limitations',
          'Non classifié'
        ]},
        entity: { type: 'string', description: 'Entité causale', enum: ['IA', 'Humain', 'Autre', 'Non codé'] },
        intentionality: { type: 'string', description: 'Intentionnalité', enum: ['Intentionnel', 'Non intentionnel', 'Autre', 'Non codé'] },
        limit: { type: 'number', description: 'Nombre maximum de résultats (défaut: 20)' },
      },
    },
  },
  {
    name: 'get_ai_risk_statistics',
    description: 'Obtenir les statistiques du AI Risk Repository : total des risques, répartition par domaine, entité, intentionnalité et timing.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_ai_risk_domain_taxonomy',
    description: 'Obtenir la taxonomie complète des domaines de risques IA avec sous-catégories et comptages.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_module_explanations',
    description: 'Obtenir les descriptions détaillées des 8 modules de la plateforme AI Risk Manager (Applications, Mode Débutant, Mode Expert, etc.).',
    parameters: {
      type: 'object',
      properties: {
        moduleId: { type: 'string', description: 'Identifiant du module', enum: [
          'applications', 'beginner-mode', 'expert-mode', 'unified-platform',
          'governance', 'red-team', 'references', 'settings'
        ]},
      },
    },
  },
  {
    name: 'get_platform_overview',
    description: 'Obtenir une vue d\'ensemble complète de la plateforme AI Risk Manager : architecture, modules, outils de pentest, stack technique.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_supported_llm_providers',
    description: 'Obtenir la liste des 10 fournisseurs LLM supportés avec leurs modèles et configurations.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_security_frameworks',
    description: 'Obtenir les frameworks de sécurité IA référencés : OWASP LLM Top 10, OWASP Agentic AI Top 15, MITRE ATT&CK, MITRE ATLAS, NIST AI RMF, EU AI Act.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];
