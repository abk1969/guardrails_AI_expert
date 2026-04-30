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
 * 12 database tools + 13 static data tools + 3 DSGAI tools + 4 PSSI IA v3 tools = 32 total.
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

  // ============================================================
  // PSSI IA v3 — Politique de Sécurité des SIA, version consolidée (4)
  // Source : data_ai_risk/PSSI_IA_v3_CONSOLIDE.pdf (172 exigences SIA-001 à SIA-172)
  // ============================================================
  {
    name: 'search_pssi_sia',
    description: "Rechercher dans les 172 exigences PSSI IA v3 (SIA-001 à SIA-172). Couvre gouvernance, tiering, cycle de vie (7 phases), données, supply chain, agentique, code assisté, HITL, GPAI publics, incidents, conformité, formation, souveraineté, sanctions, amélioration continue. Aligné AI Act, ISO 42001/27001/27090, OWASP AISVS/LLM/Agentic, MITRE ATLAS, NIST AI RMF, CLUSIF.",
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texte de recherche libre dans ruleText, testableControl, raci, référentiels' },
        chapterNumber: { type: 'string', description: "Numéro de chapitre PSSI (ex: '7' pour 'Exigences de sécurité par phase du cycle de vie')" },
        referentialKeyword: { type: 'string', description: "Mot-clé de référentiel (ex: 'ISO 42001', 'OWASP AISVS', 'MITRE ATLAS', 'AI Act', 'NIST AI RMF', 'CLUSIF')" },
        tier: { type: 'string', description: "Filtre tier applicable (ex: 'Tous tiers', 'L2', 'L3', 'haut risque')" },
        limit: { type: 'number', description: 'Nombre maximum de résultats (défaut: 50)' },
      },
    },
  },
  {
    name: 'get_pssi_sia_by_id',
    description: "Obtenir une exigence PSSI IA v3 par son identifiant exact (ex: SIA-001, SIA-172). Retourne ruleText, sourcesReferentials, testableControl, tier, raci, reviewFrequency, chapitre, et — si renseignés — associatedThreat, associatedRisk, implementationGuide, testingGuide, riskScenarios.",
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: "Identifiant de l'exigence (ex: SIA-001) — case-insensitive" },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_pssi_chapters',
    description: "Lister les chapitres de la PSSI IA v3 avec leurs titres et le nombre d'exigences SIA par chapitre.",
    parameters: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_pssi_statistics',
    description: "Statistiques PSSI IA v3 : total d'exigences, distribution par chapitre, distribution par tier applicable, référentiels les plus cités.",
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];
