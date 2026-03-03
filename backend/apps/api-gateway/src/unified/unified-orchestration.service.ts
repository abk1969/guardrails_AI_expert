import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@app/database';
import {
  UnifiedExecutionConfigDto,
  UnifiedExecutionDto,
  FrameworkExecutionStatusDto,
  ExecutionMode,
  Framework,
} from './dto/unified-execution.dto';
import { GarakService } from '../garak/garak.service';
import { PromptfooService } from '../promptfoo/promptfoo.service';
import { UnifiedGateway } from './unified.gateway';
import { DEV_DEFAULTS } from '../shared/constants';

/** Polling interval for checking framework completion (ms) */
const POLL_INTERVAL_MS = 5000;
/** Maximum polling duration before timeout (ms) */
const MAX_POLL_DURATION_MS = 3600000; // 1 hour

@Injectable()
export class UnifiedOrchestrationService {
  private readonly logger = new Logger(UnifiedOrchestrationService.name);
  private readonly executions: Map<string, UnifiedExecutionDto> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => GarakService))
    private readonly garakService: GarakService,
    @Inject(forwardRef(() => PromptfooService))
    private readonly promptfooService: PromptfooService,
    @Inject(forwardRef(() => UnifiedGateway))
    private readonly gateway: UnifiedGateway,
  ) {}

  /**
   * Start unified execution across multiple frameworks
   */
  async startUnifiedExecution(
    organizationId: string,
    config: UnifiedExecutionConfigDto,
    userId: string = DEV_DEFAULTS.USER_ID,
    targetId: string = DEV_DEFAULTS.TARGET_ID,
  ): Promise<UnifiedExecutionDto> {
    this.logger.log(`Starting unified execution for organization ${organizationId}`);
    this.logger.debug(`Config: ${JSON.stringify(config)}`);

    // Generate unified execution ID
    const unifiedId = `unified-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Initialize framework statuses
    const frameworkStatuses: FrameworkExecutionStatusDto[] = config.frameworks.map((fw) => ({
      framework: fw,
      status: 'pending' as const,
      progress: 0,
    }));

    // Create unified execution record
    const execution: UnifiedExecutionDto = {
      id: unifiedId,
      mode: config.mode,
      status: 'running',
      frameworks: frameworkStatuses,
      startTime: new Date().toISOString(),
      duration: 0,
    };

    // Store in memory
    this.executions.set(unifiedId, execution);

    // Emit WebSocket event
    this.gateway.emitUnifiedStarted(unifiedId, config.mode, config.frameworks);

    // Validate configuration for SELECTIVE mode BEFORE starting execution
    if (config.mode === ExecutionMode.SELECTIVE) {
      this.validateSelectiveConfig(config);
    }

    // Execute based on mode (defer to next tick to ensure 'pending' status is returned first)
    setImmediate(() => {
      const executeMethod =
        config.mode === ExecutionMode.SEQUENTIAL
          ? this.executeSequential.bind(this)
          : this.executeParallel.bind(this); // PARALLEL and SELECTIVE both run in parallel

      executeMethod(unifiedId, organizationId, config, userId, targetId).catch((error) => {
        this.logger.error(`Unified execution ${unifiedId} failed`, error);
        this.handleExecutionFailure(unifiedId, error);
      });
    });

    return execution;
  }

  /**
   * Execute all frameworks in parallel
   */
  private async executeParallel(
    unifiedId: string,
    organizationId: string,
    config: UnifiedExecutionConfigDto,
    userId: string,
    targetId: string,
  ): Promise<void> {
    const execution = this.executions.get(unifiedId);
    if (!execution) return;

    this.logger.log(`Executing ${config.frameworks.length} frameworks in parallel`);

    // Start all frameworks simultaneously
    const promises = config.frameworks.map((framework) =>
      this.executeFramework(unifiedId, organizationId, framework, config, userId, targetId),
    );

    // Wait for all to complete
    const results = await Promise.allSettled(promises);

    this.finalizeExecution(unifiedId, results);
  }

  /**
   * Execute frameworks sequentially (one after another)
   */
  private async executeSequential(
    unifiedId: string,
    organizationId: string,
    config: UnifiedExecutionConfigDto,
    userId: string,
    targetId: string,
  ): Promise<void> {
    const execution = this.executions.get(unifiedId);
    if (!execution) return;

    this.logger.log(`Executing ${config.frameworks.length} frameworks sequentially`);

    const results: PromiseSettledResult<void>[] = [];

    for (const framework of config.frameworks) {
      try {
        await this.executeFramework(unifiedId, organizationId, framework, config, userId, targetId);
        results.push({ status: 'fulfilled', value: undefined });
      } catch (error) {
        this.logger.error(`Framework ${framework} failed in sequential execution`, error);
        results.push({ status: 'rejected', reason: error });
      }
    }

    this.finalizeExecution(unifiedId, results);
  }

  /**
   * Finalize a unified execution: compute status, aggregate results, emit completion.
   */
  private finalizeExecution(
    unifiedId: string,
    results: PromiseSettledResult<void>[],
  ): void {
    const execution = this.executions.get(unifiedId);
    if (!execution) return;

    const failedCount = results.filter((r) => r.status === 'rejected').length;
    if (failedCount === 0) {
      execution.status = 'completed';
    } else if (failedCount === results.length) {
      execution.status = 'failed';
    } else {
      execution.status = 'partial';
    }

    execution.endTime = new Date().toISOString();
    execution.duration = Math.floor(
      (new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000,
    );

    // Aggregate results with comparative analysis
    execution.aggregatedResults = this.aggregateResults(execution);

    this.gateway.emitUnifiedCompleted(unifiedId, execution);
  }

  /**
   * Validate selective mode configuration (synchronous validation)
   */
  private validateSelectiveConfig(config: UnifiedExecutionConfigDto): void {
    for (const framework of config.frameworks) {
      if (framework === Framework.PROMPTFOO && !config.promptfoo) {
        throw new Error('Promptfoo selected but configuration missing');
      }
      if (framework === Framework.GARAK && !config.garak) {
        throw new Error('Garak selected but configuration missing');
      }
    }
  }

  /**
   * Execute a single framework
   */
  private async executeFramework(
    unifiedId: string,
    organizationId: string,
    framework: Framework,
    config: UnifiedExecutionConfigDto,
    userId: string,
    targetId: string,
  ): Promise<void> {
    const execution = this.executions.get(unifiedId);
    if (!execution) return;

    // Find framework status
    const fwStatus = execution.frameworks.find((f) => f.framework === framework);
    if (!fwStatus) return;

    fwStatus.status = 'running';
    fwStatus.startTime = new Date().toISOString();
    this.gateway.emitFrameworkStarted(unifiedId, framework);

    try {
      if (framework === Framework.GARAK && config.garak) {
        await this.executeGarak(unifiedId, organizationId, config, fwStatus, userId, targetId);
      } else if (framework === Framework.PROMPTFOO && config.promptfoo) {
        await this.executePromptfoo(unifiedId, config, fwStatus, userId, organizationId, targetId);
      }
    } catch (error) {
      this.logger.error(`Framework ${framework} execution failed`, error);
      fwStatus.status = 'failed';
      fwStatus.error = error.message;
      fwStatus.endTime = new Date().toISOString();
      this.gateway.emitFrameworkFailed(unifiedId, framework, error.message);
      throw error;
    }
  }

  /**
   * Execute Garak scan and poll for completion
   */
  private async executeGarak(
    unifiedId: string,
    organizationId: string,
    config: UnifiedExecutionConfigDto,
    fwStatus: FrameworkExecutionStatusDto,
    userId: string,
    targetId: string,
  ): Promise<void> {
    const result = await this.garakService.startScan(
      organizationId,
      {
        model: config.garak!.model,
        modelType: config.garak!.modelType,
        probes: config.garak!.probes,
        generators: config.garak!.generators,
        detectors: config.garak!.detectors,
      },
      userId,
      targetId,
    );

    fwStatus.executionId = result.id;
    fwStatus.status = 'running';

    // Poll the database for completion
    await this.pollTestRunCompletion(unifiedId, result.id, fwStatus, Framework.GARAK);
  }

  /**
   * Execute Promptfoo tests and poll for completion
   */
  private async executePromptfoo(
    unifiedId: string,
    config: UnifiedExecutionConfigDto,
    fwStatus: FrameworkExecutionStatusDto,
    userId: string,
    organizationId: string,
    targetId: string,
  ): Promise<void> {
    // Build a minimal YAML from the promptfoo config DTO
    const promptfooConfig = config.promptfoo!;
    const yamlContent = this.buildPromptfooYaml(promptfooConfig);

    const result = await this.promptfooService.runTests(
      yamlContent,
      userId,
      organizationId,
      targetId,
    );

    fwStatus.executionId = result.testRunId;
    fwStatus.status = 'running';

    // Poll the database for completion
    await this.pollTestRunCompletion(unifiedId, result.testRunId, fwStatus, Framework.PROMPTFOO);
  }

  /**
   * Build a minimal Promptfoo YAML config from the DTO fields.
   * If the DTO includes a raw yamlContent field, use it directly.
   */
  private buildPromptfooYaml(config: any): string {
    // If raw YAML is provided, use it directly
    if (config.yamlContent) {
      return config.yamlContent;
    }

    // Build minimal YAML from structured config
    const lines: string[] = [];
    lines.push(`description: "${config.suiteName || 'Unified Test Suite'}"`);
    lines.push('prompts:');
    lines.push('  - "You are an AI assistant. {{prompt}}"');

    if (config.providers && config.providers.length > 0) {
      lines.push('providers:');
      for (const provider of config.providers) {
        lines.push(`  - ${provider}`);
      }
    }

    if (config.testCategories && config.testCategories.length > 0) {
      lines.push('redteam:');
      lines.push(`  purpose: "Unified security testing"`);
      lines.push('  numTests: 10');
      lines.push('  plugins:');
      for (const category of config.testCategories) {
        lines.push(`    - ${category}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Poll the database for a test run's completion status.
   * Replaces the old time-based fake polling with real DB status checks.
   */
  private async pollTestRunCompletion(
    unifiedId: string,
    testRunId: string,
    fwStatus: FrameworkExecutionStatusDto,
    framework: Framework,
  ): Promise<void> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const elapsed = Date.now() - startTime;

          // Timeout check
          if (elapsed > MAX_POLL_DURATION_MS) {
            clearInterval(interval);
            fwStatus.status = 'failed';
            fwStatus.error = 'Execution timed out';
            fwStatus.endTime = new Date().toISOString();
            this.gateway.emitFrameworkFailed(unifiedId, framework, 'Execution timed out');
            reject(new Error(`${framework} execution timed out after ${MAX_POLL_DURATION_MS / 1000}s`));
            return;
          }

          // Check actual DB status
          const testRun = await this.prisma.testRun.findUnique({
            where: { id: testRunId },
            select: {
              status: true,
              progress: true,
              totalTests: true,
              passedTests: true,
              failedTests: true,
            },
          });

          if (!testRun) {
            // TestRun not in DB -- might be a memory-only run, use time-based progress
            const timeProgress = Math.min(95, Math.floor((elapsed / 120000) * 100));
            fwStatus.progress = timeProgress;
            this.gateway.emitFrameworkProgress(unifiedId, framework, timeProgress);
            return;
          }

          // Update progress from DB
          fwStatus.progress = testRun.progress ?? 0;
          this.gateway.emitFrameworkProgress(unifiedId, framework, fwStatus.progress);

          if (testRun.status === 'COMPLETED') {
            clearInterval(interval);
            fwStatus.status = 'completed';
            fwStatus.endTime = new Date().toISOString();
            fwStatus.results = {
              totalTests: testRun.totalTests,
              passed: testRun.passedTests,
              failed: testRun.failedTests,
              vulnerabilities: testRun.failedTests,
            };
            this.gateway.emitFrameworkCompleted(unifiedId, framework, fwStatus.results);
            resolve();
          } else if (testRun.status === 'FAILED' || testRun.status === 'CANCELLED') {
            clearInterval(interval);
            fwStatus.status = 'failed';
            fwStatus.endTime = new Date().toISOString();
            fwStatus.error = `${framework} execution failed`;
            this.gateway.emitFrameworkFailed(unifiedId, framework, fwStatus.error);
            reject(new Error(fwStatus.error));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, POLL_INTERVAL_MS);
    });
  }

  /**
   * Aggregate results from all frameworks, including comparative analysis.
   */
  private aggregateResults(execution: UnifiedExecutionDto): any {
    const aggregated: Record<string, any> = {
      totalVulnerabilities: 0,
      totalFindings: 0,
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      byFramework: {} as Record<string, any>,
      completedFrameworks: 0,
      failedFrameworks: 0,
    };

    for (const fw of execution.frameworks) {
      if (fw.status === 'completed' && fw.results) {
        aggregated.completedFrameworks++;
        aggregated.byFramework[fw.framework] = fw.results;

        const tests = fw.results.totalTests || 0;
        const passed = fw.results.passed || 0;
        const failed = fw.results.failed || 0;
        const vulns = fw.results.vulnerabilities || 0;

        aggregated.totalTests += tests;
        aggregated.totalPassed += passed;
        aggregated.totalFailed += failed;
        aggregated.totalVulnerabilities += vulns;
        aggregated.totalFindings += failed;
      } else if (fw.status === 'failed') {
        aggregated.failedFrameworks++;
      }
    }

    // Comparative analysis (only when both frameworks completed)
    const garakResult = aggregated.byFramework[Framework.GARAK];
    const promptfooResult = aggregated.byFramework[Framework.PROMPTFOO];

    if (garakResult && promptfooResult) {
      const garakRate = garakResult.totalTests > 0
        ? ((garakResult.passed / garakResult.totalTests) * 100).toFixed(1)
        : 'N/A';
      const promptfooRate = promptfooResult.totalTests > 0
        ? ((promptfooResult.passed / promptfooResult.totalTests) * 100).toFixed(1)
        : 'N/A';

      aggregated.comparative = {
        garakPassRate: garakRate,
        promptfooPassRate: promptfooRate,
        garakVulnerabilities: garakResult.vulnerabilities || garakResult.failed || 0,
        promptfooFailures: promptfooResult.failed || 0,
        overallPassRate: aggregated.totalTests > 0
          ? ((aggregated.totalPassed / aggregated.totalTests) * 100).toFixed(1)
          : 'N/A',
        summary: `Garak found ${garakResult.vulnerabilities || garakResult.failed || 0} vulnerabilities. ` +
          `Promptfoo detected ${promptfooResult.failed || 0} test failures.`,
      };
    }

    return aggregated;
  }

  /**
   * Handle execution failure
   */
  private handleExecutionFailure(unifiedId: string, error: Error): void {
    const execution = this.executions.get(unifiedId);
    if (!execution) return;

    execution.status = 'failed';
    execution.endTime = new Date().toISOString();
    execution.duration = Math.floor(
      (new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000,
    );

    this.gateway.emitUnifiedFailed(unifiedId, error.message);
  }

  /**
   * Get unified execution status
   */
  async getUnifiedExecution(organizationId: string, id: string): Promise<UnifiedExecutionDto> {
    const execution = this.executions.get(id);

    if (!execution) {
      throw new NotFoundException(`Unified execution ${id} not found`);
    }

    return execution;
  }

  /**
   * Stop unified execution (stop all running frameworks)
   */
  async stopUnifiedExecution(organizationId: string, id: string): Promise<void> {
    const execution = this.executions.get(id);

    if (!execution) {
      throw new NotFoundException(`Unified execution ${id} not found`);
    }

    this.logger.log(`Stopping unified execution ${id}`);

    execution.status = 'completed';
    execution.endTime = new Date().toISOString();
    execution.duration = Math.floor(
      (new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000,
    );

    // Mark any still-running frameworks as stopped
    for (const fw of execution.frameworks) {
      if (fw.status === 'running' || fw.status === 'pending') {
        fw.status = 'failed';
        fw.error = 'Stopped by user';
        fw.endTime = new Date().toISOString();
      }
    }

    this.gateway.emitUnifiedStopped(id);
  }
}
