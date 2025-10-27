/**
 * MCP Client Service
 *
 * This service acts as an MCP (Model Context Protocol) client that queries
 * the application data through the MCP server backend.
 *
 * The chatbot uses this service to retrieve context from all application data
 * before generating responses with Gemini API.
 */

interface McpTool {
  name: string;
  description: string;
}

interface McpRequest {
  tool: string;
  parameters?: Record<string, any>;
}

interface McpResponse {
  result: any;
  tool: string;
  timestamp: string;
}

const MCP_BASE_URL = import.meta.env.VITE_MCP_API_URL || 'http://localhost:3001/api/v1/mcp';

// For development: Use mock mode if backend is not available
const USE_MOCK_MODE = import.meta.env.VITE_MCP_MOCK_MODE === 'true';

/**
 * List all available MCP tools
 */
export const listMcpTools = async (): Promise<McpTool[]> => {
  if (USE_MOCK_MODE) {
    return mockListTools();
  }

  try {
    const response = await fetch(`${MCP_BASE_URL}/tools/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.tools;
  } catch (error) {
    console.error('Error listing MCP tools, falling back to mock:', error);
    return mockListTools();
  }
};

/**
 * Execute an MCP query
 */
export const executeMcpQuery = async (request: McpRequest): Promise<any> => {
  if (USE_MOCK_MODE) {
    return mockExecuteQuery(request);
  }

  try {
    const response = await fetch(`${MCP_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth token if needed
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: McpResponse = await response.json();
    return data.result;
  } catch (error) {
    console.error(`Error executing MCP query ${request.tool}, falling back to mock:`, error);
    return mockExecuteQuery(request);
  }
};

/**
 * High-level MCP query functions for common chatbot needs
 */

export const mcpClient = {
  /**
   * Search AI policies (SIA rules)
   */
  searchPolicies: async (query?: string, reference?: string): Promise<any> => {
    return executeMcpQuery({
      tool: 'search_ai_policies',
      parameters: { query, reference, limit: 20 },
    });
  },

  /**
   * Get specific policy by reference (e.g., SIA-01)
   */
  getPolicy: async (reference: string): Promise<any> => {
    return executeMcpQuery({
      tool: 'get_policy_by_reference',
      parameters: { reference },
    });
  },

  /**
   * Search test results
   */
  searchTestResults: async (status?: string, category?: string): Promise<any> => {
    return executeMcpQuery({
      tool: 'search_test_results',
      parameters: { status, category, limit: 50 },
    });
  },

  /**
   * Get test statistics
   */
  getTestStatistics: async (): Promise<any> => {
    return executeMcpQuery({
      tool: 'get_test_statistics',
    });
  },

  /**
   * Search use cases
   */
  searchUseCases: async (query?: string, minRisk?: number): Promise<any> => {
    return executeMcpQuery({
      tool: 'search_use_cases',
      parameters: { query, minRisk, limit: 20 },
    });
  },

  /**
   * Search vulnerabilities
   */
  searchVulnerabilities: async (query?: string, owaspCategory?: string): Promise<any> => {
    return executeMcpQuery({
      tool: 'search_vulnerabilities',
      parameters: { query, owaspCategory, limit: 20 },
    });
  },

  /**
   * Get OWASP categories
   */
  getOwaspCategories: async (): Promise<any> => {
    return executeMcpQuery({
      tool: 'get_owasp_categories',
    });
  },

  /**
   * Search prompt templates
   */
  searchPromptTemplates: async (category?: string, complexity?: string): Promise<any> => {
    return executeMcpQuery({
      tool: 'search_prompt_templates',
      parameters: { category, complexity, limit: 20 },
    });
  },

  /**
   * Get test targets
   */
  getTestTargets: async (): Promise<any> => {
    return executeMcpQuery({
      tool: 'get_test_targets',
    });
  },

  /**
   * Analyze risk trends
   */
  analyzeRiskTrends: async (): Promise<any> => {
    return executeMcpQuery({
      tool: 'analyze_risk_trends',
    });
  },

  /**
   * Intelligent query router - analyzes user question and fetches relevant context
   */
  getRelevantContext: async (userQuestion: string): Promise<string> => {
    const questionLower = userQuestion.toLowerCase();
    const contexts: string[] = [];

    try {
      // Check if question is about policies/rules
      if (questionLower.includes('sia') ||
          questionLower.includes('politique') ||
          questionLower.includes('règle') ||
          questionLower.includes('regle')) {

        // Extract SIA reference if present
        const siaMatch = questionLower.match(/sia-?\s*(\d+)/);
        if (siaMatch) {
          const ref = `SIA-${siaMatch[1].padStart(2, '0')}`;
          const policy = await mcpClient.getPolicy(ref);
          if (policy.found) {
            contexts.push(`Politique ${ref}:\n${JSON.stringify(policy.policy, null, 2)}`);
          }
        } else {
          // Search policies
          const keywords = extractKeywords(questionLower);
          const policies = await mcpClient.searchPolicies(keywords.join(' '));
          if (policies.count > 0) {
            contexts.push(`Politiques trouvées (${policies.count}):\n${JSON.stringify(policies.policies.slice(0, 3), null, 2)}`);
          }
        }
      }

      // Check if question is about tests/results
      if (questionLower.includes('test') ||
          questionLower.includes('résultat') ||
          questionLower.includes('resultat') ||
          questionLower.includes('guardrail')) {
        const stats = await mcpClient.getTestStatistics();
        contexts.push(`Statistiques de tests:\n${JSON.stringify(stats, null, 2)}`);
      }

      // Check if question is about vulnerabilities/CVE
      if (questionLower.includes('vulnérabilité') ||
          questionLower.includes('vulnerabilite') ||
          questionLower.includes('cve') ||
          questionLower.includes('owasp')) {
        const keywords = extractKeywords(questionLower);
        const vulns = await mcpClient.searchVulnerabilities(keywords.join(' '));
        if (vulns.count > 0) {
          contexts.push(`Vulnérabilités trouvées (${vulns.count}):\n${JSON.stringify(vulns.vulnerabilities.slice(0, 5), null, 2)}`);
        }
      }

      // Check if question is about use cases/risks
      if (questionLower.includes('cas d\'usage') ||
          questionLower.includes('risque') ||
          questionLower.includes('impact')) {
        const keywords = extractKeywords(questionLower);
        const useCases = await mcpClient.searchUseCases(keywords.join(' '));
        if (useCases.count > 0) {
          contexts.push(`Cas d'usage trouvés (${useCases.count}):\n${JSON.stringify(useCases.useCases.slice(0, 3), null, 2)}`);
        }
      }

      // Check if question is about OWASP categories
      if (questionLower.includes('owasp') || questionLower.includes('catégorie')) {
        const categories = await mcpClient.getOwaspCategories();
        contexts.push(`Catégories OWASP:\n${JSON.stringify(categories, null, 2)}`);
      }

      return contexts.length > 0
        ? contexts.join('\n\n---\n\n')
        : '';
    } catch (error) {
      console.error('Error fetching MCP context:', error);
      return '';
    }
  },
};

/**
 * Extract keywords from user question
 */
function extractKeywords(text: string): string[] {
  const stopWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'est', 'sont', 'dans', 'pour', 'sur', 'avec'];
  return text
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5);
}

/**
 * Mock implementations for offline/development mode
 */

function mockListTools(): McpTool[] {
  return [
    { name: 'search_ai_policies', description: 'Rechercher dans les politiques IA (règles SIA CLUSIF)' },
    { name: 'get_policy_by_reference', description: 'Obtenir une politique IA par sa référence (ex: SIA-01)' },
    { name: 'search_test_results', description: 'Rechercher dans les résultats de tests guardrails' },
    { name: 'get_test_statistics', description: 'Obtenir les statistiques globales des tests' },
    { name: 'search_use_cases', description: 'Rechercher dans les cas d\'usage et évaluations de risques' },
    { name: 'search_vulnerabilities', description: 'Rechercher dans les vulnérabilités connues (CVE, OWASP)' },
    { name: 'get_owasp_categories', description: 'Obtenir les catégories OWASP LLM Top 10 et Agentic AI' },
  ];
}

function mockExecuteQuery(request: McpRequest): any {
  console.warn(`Mock MCP query: ${request.tool}`, request.parameters);

  switch (request.tool) {
    case 'search_ai_policies':
      return {
        count: 2,
        policies: [
          {
            reference: 'SIA-01',
            ruleText: 'Exemple de politique mock',
            status: 'IMPLEMENTED',
            associatedThreat: 'OWASP LLM01 - Prompt Injection',
          },
        ],
      };

    case 'get_test_statistics':
      return {
        total: 150,
        passed: 120,
        failed: 30,
        passRate: '80.00',
        byCategory: [
          { category: 'SECURITY_PRIVACY', count: 50 },
          { category: 'CONTENT_QUALITY', count: 100 },
        ],
      };

    case 'get_owasp_categories':
      return {
        llmTop10: [
          { id: 'LLM01', name: 'Prompt Injection' },
          { id: 'LLM02', name: 'Insecure Output Handling' },
        ],
      };

    default:
      return { message: 'Mock data not available for this tool' };
  }
}

export default mcpClient;
