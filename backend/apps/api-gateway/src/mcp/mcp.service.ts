import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database/prisma.service';
import { McpRequestDto, McpResponseDto } from './dto/mcp.dto';
import { McpStaticDataService } from './mcp-static-data.service';
import { MCP_TOOL_SCHEMAS } from './mcp-tool-schemas';

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly staticDataService: McpStaticDataService,
  ) {}

  /**
   * List all available MCP tools (12 database + 13 static data + 3 DSGAI = 28 total)
   */
  async listTools() {
    return {
      tools: MCP_TOOL_SCHEMAS.map(({ name, description, parameters }) => ({
        name,
        description,
        parameters,
      })),
    };
  }

  /**
   * Execute MCP query based on tool name
   */
  async executeQuery(request: McpRequestDto, organizationId: string): Promise<McpResponseDto> {
    const startedAt = Date.now();
    const paramsSummary = (() => {
      try {
        const s = JSON.stringify(request.parameters || {});
        return s.length > 120 ? s.slice(0, 117) + '...' : s;
      } catch { return '{}'; }
    })();
    this.logger.log(`[MCP] -> tool=${request.tool} params=${paramsSummary}`);

    try {
      let result: any;

      switch (request.tool) {
        case 'search_ai_policies':
          result = await this.searchAIPolicies(request.parameters, organizationId);
          break;

        case 'get_policy_by_reference':
          result = await this.getPolicyByReference(request.parameters, organizationId);
          break;

        case 'search_test_results':
          result = await this.searchTestResults(request.parameters, organizationId);
          break;

        case 'get_test_statistics':
          result = await this.getTestStatistics(organizationId);
          break;

        case 'search_use_cases':
          result = await this.searchUseCases(request.parameters, organizationId);
          break;

        case 'search_threat_profiles':
          result = await this.searchThreatProfiles(request.parameters, organizationId);
          break;

        case 'search_vulnerabilities':
          result = await this.searchVulnerabilities(request.parameters, organizationId);
          break;

        case 'search_defenses':
          result = await this.searchDefenses(request.parameters);
          break;

        case 'get_owasp_categories':
          result = await this.getOwaspCategories();
          break;

        case 'search_prompt_templates':
          result = await this.searchPromptTemplates(request.parameters);
          break;

        case 'get_test_targets':
          result = await this.getTestTargets(organizationId);
          break;

        case 'analyze_risk_trends':
          result = await this.analyzeRiskTrends(organizationId);
          break;

        // Static data tools (13)
        case 'search_compass_scenarios':
          result = this.staticDataService.searchCompassScenarios(request.parameters);
          break;

        case 'get_compass_scenario_by_id':
          result = this.staticDataService.getCompassScenarioById(request.parameters);
          break;

        case 'get_compass_statistics':
          result = this.staticDataService.getCompassStatistics();
          break;

        case 'search_agentic_security_threats':
          result = this.staticDataService.searchAgenticSecurityThreats(request.parameters);
          break;

        case 'get_agentic_threat_by_id':
          result = this.staticDataService.getAgenticThreatById(request.parameters);
          break;

        case 'get_maestro_layers':
          result = this.staticDataService.getMaestroLayers();
          break;

        case 'search_ai_risk_database':
          result = this.staticDataService.searchAiRiskDatabase(request.parameters);
          break;

        case 'get_ai_risk_statistics':
          result = this.staticDataService.getAiRiskStatistics();
          break;

        case 'get_ai_risk_domain_taxonomy':
          result = this.staticDataService.getAiRiskDomainTaxonomy();
          break;

        case 'get_module_explanations':
          result = this.staticDataService.getModuleExplanations(request.parameters);
          break;

        case 'get_platform_overview':
          result = this.staticDataService.getPlatformOverview();
          break;

        case 'get_supported_llm_providers':
          result = this.staticDataService.getSupportedLlmProviders();
          break;

        case 'get_security_frameworks':
          result = this.staticDataService.getSecurityFrameworks();
          break;

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

        // PSSI IA v3 tools (4)
        case 'search_pssi_sia':
          result = this.staticDataService.searchPssiSia(request.parameters);
          break;

        case 'get_pssi_sia_by_id':
          result = this.staticDataService.getPssiSiaById(request.parameters);
          break;

        case 'list_pssi_chapters':
          result = this.staticDataService.listPssiChapters();
          break;

        case 'get_pssi_statistics':
          result = this.staticDataService.getPssiStatistics();
          break;

        default:
          throw new BadRequestException(`Unknown MCP tool: ${request.tool}`);
      }

      const duration = Date.now() - startedAt;
      const sizeBytes = (() => {
        try { return JSON.stringify(result).length; } catch { return -1; }
      })();
      this.logger.log(`[MCP] <- tool=${request.tool} ok duration=${duration}ms size=${sizeBytes}B`);

      return {
        result,
        tool: request.tool,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startedAt;
      this.logger.error(`[MCP] <- tool=${request.tool} FAIL duration=${duration}ms error=${error?.message || error}`);
      throw error;
    }
  }

  /**
   * Search AI Policies (SIA rules with GRC content)
   */
  private async searchAIPolicies(params: any, organizationId: string) {
    const { query, reference, status, limit = 50 } = params || {};

    const where: any = { organizationId };

    if (query) {
      where.OR = [
        { reference: { contains: query, mode: 'insensitive' } },
        { ruleText: { contains: query, mode: 'insensitive' } },
        { associatedThreat: { contains: query, mode: 'insensitive' } },
        { associatedRisk: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (reference) {
      where.reference = { contains: reference, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    const policies = await this.prisma.aIPolicy.findMany({
      where,
      take: limit,
      orderBy: { reference: 'asc' },
    });

    return {
      count: policies.length,
      policies: policies.map((p) => ({
        reference: p.reference,
        ruleText: p.ruleText,
        status: p.status,
        associatedThreat: p.associatedThreat,
        associatedRisk: p.associatedRisk,
        implementationGuide: p.implementationGuide,
        testingGuide: p.testingGuide,
        riskScenarios: p.riskScenarios,
        notes: p.notes,
      })),
    };
  }

  /**
   * Get specific policy by reference (e.g., SIA-01)
   */
  private async getPolicyByReference(params: any, organizationId: string) {
    const { reference } = params || {};

    if (!reference) {
      throw new BadRequestException('Reference parameter is required');
    }

    const policy = await this.prisma.aIPolicy.findFirst({
      where: {
        reference: { equals: reference, mode: 'insensitive' },
        organizationId,
      },
    });

    if (!policy) {
      return { found: false, reference };
    }

    return {
      found: true,
      policy: {
        reference: policy.reference,
        ruleText: policy.ruleText,
        status: policy.status,
        associatedThreat: policy.associatedThreat,
        associatedRisk: policy.associatedRisk,
        implementationGuide: policy.implementationGuide,
        testingGuide: policy.testingGuide,
        riskScenarios: policy.riskScenarios,
        notes: policy.notes,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
      },
    };
  }

  /**
   * Search test results
   */
  private async searchTestResults(params: any, organizationId: string) {
    const { status, category, limit = 100 } = params || {};

    const where: any = {
      testRun: { organizationId },
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.promptCategory = category;
    }

    const results = await this.prisma.testResult.findMany({
      where,
      take: limit,
      include: {
        testRun: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: results.length,
      results: results.map((r) => ({
        id: r.id,
        promptText: r.promptText,
        category: r.promptCategory,
        complexity: r.promptComplexity,
        status: r.status,
        score: r.score,
        response: r.response,
        evaluationChain: r.evaluationChain,
        remediation: r.remediation,
        testRun: r.testRun,
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * Get test statistics
   */
  private async getTestStatistics(organizationId: string) {
    const totalTests = await this.prisma.testResult.count({
      where: { testRun: { organizationId } },
    });

    const passedTests = await this.prisma.testResult.count({
      where: {
        testRun: { organizationId },
        status: 'PASSED',
      },
    });

    const failedTests = await this.prisma.testResult.count({
      where: {
        testRun: { organizationId },
        status: 'FAILED',
      },
    });

    const byCategory = await this.prisma.testResult.groupBy({
      by: ['promptCategory'],
      where: { testRun: { organizationId } },
      _count: true,
    });

    const recentRuns = await this.prisma.testRun.findMany({
      where: { organizationId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        totalTests: true,
        passedTests: true,
        failedTests: true,
        createdAt: true,
      },
    });

    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0,
      byCategory: byCategory.map((c) => ({
        category: c.promptCategory,
        count: c._count,
      })),
      recentRuns,
    };
  }

  /**
   * Search use cases and risk assessments
   */
  private async searchUseCases(params: any, organizationId: string) {
    const { query, minRisk, limit = 50 } = params || {};

    const where: any = { organizationId };

    if (query) {
      where.OR = [
        { useCase: { contains: query, mode: 'insensitive' } },
        { recommendation: { contains: query, mode: 'insensitive' } },
        { associatedThreat: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (minRisk) {
      where.riskScore = { gte: parseInt(minRisk) };
    }

    const useCases = await this.prisma.useCase.findMany({
      where,
      take: limit,
      orderBy: { riskScore: 'desc' },
    });

    return {
      count: useCases.length,
      useCases: useCases.map((uc) => ({
        id: uc.id,
        useCase: uc.useCase,
        impact: uc.impact,
        likelihood: uc.likelihood,
        riskScore: uc.riskScore,
        recommendation: uc.recommendation,
        associatedThreat: uc.associatedThreat,
        createdAt: uc.createdAt,
      })),
    };
  }

  /**
   * Search threat profiles
   */
  private async searchThreatProfiles(params: any, organizationId: string) {
    const { query, limit = 50 } = params || {};

    const where: any = { organizationId };

    if (query) {
      where.OR = [
        { threatName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const threats = await this.prisma.threatProfile.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: threats.length,
      threats,
    };
  }

  /**
   * Search known vulnerabilities
   */
  private async searchVulnerabilities(params: any, organizationId: string) {
    const { query, owaspCategory, minSeverity, limit = 50 } = params || {};

    const where: any = { organizationId };

    if (query) {
      where.OR = [
        { organizationTool: { contains: query, mode: 'insensitive' } },
        { cveIdentifier: { contains: query, mode: 'insensitive' } },
        { descriptionSummary: { contains: query, mode: 'insensitive' } },
        { owaspCategoryName: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (owaspCategory) {
      where.owaspLlmCategory = { contains: owaspCategory, mode: 'insensitive' };
    }

    if (minSeverity) {
      where.fivePointScore = { gte: parseFloat(minSeverity) };
    }

    const vulnerabilities = await this.prisma.knownVulnerability.findMany({
      where,
      take: limit,
      orderBy: { fivePointScore: 'desc' },
    });

    return {
      count: vulnerabilities.length,
      vulnerabilities: vulnerabilities.map((v) => ({
        id: v.id,
        organizationTool: v.organizationTool,
        cveIdentifier: v.cveIdentifier,
        descriptionSummary: v.descriptionSummary,
        originalSeverity: v.originalSeverity,
        fivePointScore: v.fivePointScore,
        owaspLlmCategory: v.owaspLlmCategory,
        owaspCategoryName: v.owaspCategoryName,
        createdAt: v.createdAt,
      })),
    };
  }

  /**
   * Search defenses and mitigations (from static data)
   */
  private async searchDefenses(params: any) {
    // This would typically query a defenses table or return static reference data
    // For now, returning structured OWASP defense categories
    return {
      categories: [
        {
          id: 'LLM01',
          name: 'Prompt Injection',
          defenses: [
            'Validation stricte des entrées',
            'Séparation des instructions système et utilisateur',
            'Détection de patterns malveillants',
            'Limitation des privilèges du LLM',
          ],
        },
        {
          id: 'LLM02',
          name: 'Insecure Output Handling',
          defenses: [
            'Encodage des sorties',
            'Validation des réponses',
            'Sanitization des données',
          ],
        },
        {
          id: 'LLM03',
          name: 'Training Data Poisoning',
          defenses: [
            'Validation des sources de données',
            'Sandboxing de l\'entraînement',
            'Monitoring des performances du modèle',
          ],
        },
      ],
    };
  }

  /**
   * Get OWASP categories
   */
  private async getOwaspCategories() {
    return {
      llmTop10: [
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
      agenticAI: [
        { id: 'AAI01', name: 'Prompt Injection' },
        { id: 'AAI02', name: 'Insecure Tool Calling' },
        { id: 'AAI03', name: 'Excessive Autonomy' },
        { id: 'AAI04', name: 'Memory Poisoning' },
      ],
    };
  }

  /**
   * Search prompt templates
   */
  private async searchPromptTemplates(params: any) {
    const { category, complexity, attackFamily, limit = 50 } = params || {};

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (complexity) {
      where.complexity = complexity;
    }

    if (attackFamily) {
      where.attackFamily = attackFamily;
    }

    const templates = await this.prisma.promptTemplate.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      count: templates.length,
      templates: templates.map((t) => ({
        id: t.id,
        text: t.text,
        category: t.category,
        complexity: t.complexity,
        attackFamily: t.attackFamily,
        attackTags: t.attackTags,
        guide: t.guide,
        protection: t.protection,
      })),
    };
  }

  /**
   * Get test targets
   */
  private async getTestTargets(organizationId: string) {
    const targets = await this.prisma.testTarget.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        componentType: true,
        apiUrl: true,
        createdAt: true,
      },
    });

    return {
      count: targets.length,
      targets,
    };
  }

  /**
   * Analyze risk trends over time
   */
  private async analyzeRiskTrends(organizationId: string) {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const testsByDay = await this.prisma.testRun.groupBy({
      by: ['createdAt'],
      where: {
        organizationId,
        createdAt: { gte: last30Days },
      },
      _count: true,
      _avg: {
        passedTests: true,
        totalTests: true,
      },
    });

    const useCasesByRisk = await this.prisma.useCase.groupBy({
      by: ['riskScore'],
      where: { organizationId },
      _count: true,
    });

    return {
      testTrends: testsByDay,
      riskDistribution: useCasesByRisk.map((r) => ({
        riskLevel: r.riskScore,
        count: r._count,
      })),
    };
  }
}
