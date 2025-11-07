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
import { StrixService } from '../strix/strix.service';
import { UnifiedGateway } from './unified.gateway';

@Injectable()
export class UnifiedOrchestrationService {
  private readonly logger = new Logger(UnifiedOrchestrationService.name);
  private readonly executions: Map<string, UnifiedExecutionDto> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => GarakService))
    private readonly garakService: GarakService,
    @Inject(forwardRef(() => StrixService))
    private readonly strixService: StrixService,
    @Inject(forwardRef(() => UnifiedGateway))
    private readonly gateway: UnifiedGateway,
  ) {}

  /**
   * Start unified execution across multiple frameworks
   */
  async startUnifiedExecution(
    organizationId: string,
    config: UnifiedExecutionConfigDto,
    userId: string = 'e6cf191e-5d9e-45f2-8d15-a0efbe05f9e8',
    targetId: string = '33faa86b-0bad-45e9-b372-0d174de49cc8',
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
      if (config.mode === ExecutionMode.PARALLEL) {
        this.executeParallel(unifiedId, organizationId, config, userId, targetId).catch((error) => {
          this.logger.error(`Unified execution ${unifiedId} failed`, error);
          this.handleExecutionFailure(unifiedId, error);
        });
      } else if (config.mode === ExecutionMode.SEQUENTIAL) {
        this.executeSequential(unifiedId, organizationId, config, userId, targetId).catch((error) => {
          this.logger.error(`Unified execution ${unifiedId} failed`, error);
          this.handleExecutionFailure(unifiedId, error);
        });
      } else if (config.mode === ExecutionMode.SELECTIVE) {
        this.executeSelective(unifiedId, organizationId, config, userId, targetId).catch((error) => {
          this.logger.error(`Unified execution ${unifiedId} failed`, error);
          this.handleExecutionFailure(unifiedId, error);
        });
      }
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

    // Calculate final status
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

    // Aggregate results
    execution.aggregatedResults = this.aggregateResults(execution);

    this.gateway.emitUnifiedCompleted(unifiedId, execution);
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

    let allSucceeded = true;

    // Execute frameworks one by one
    for (const framework of config.frameworks) {
      try {
        await this.executeFramework(unifiedId, organizationId, framework, config, userId, targetId);
      } catch (error) {
        this.logger.error(`Framework ${framework} failed in sequential execution`, error);
        allSucceeded = false;
        // Continue with next framework (don't stop on failure)
      }
    }

    execution.status = allSucceeded ? 'completed' : 'partial';
    execution.endTime = new Date().toISOString();
    execution.duration = Math.floor(
      (new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000,
    );

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
      if (framework === Framework.STRIX && !config.strix) {
        throw new Error('Strix selected but configuration missing');
      }
    }
  }

  /**
   * Execute only selected frameworks (same as parallel but with validation)
   */
  private async executeSelective(
    unifiedId: string,
    organizationId: string,
    config: UnifiedExecutionConfigDto,
    userId: string,
    targetId: string,
  ): Promise<void> {
    // Validation is done synchronously in startUnifiedExecution
    // Execute in parallel (same as parallel mode)
    await this.executeParallel(unifiedId, organizationId, config, userId, targetId);
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
        // Start Garak scan
        const result = await this.garakService.startScan(
          organizationId,
          {
            model: config.garak.model,
            modelType: config.garak.modelType,
            probes: config.garak.probes,
            generators: config.garak.generators,
            detectors: config.garak.detectors,
          },
          userId,
          targetId,
        );

        fwStatus.executionId = result.id;
        fwStatus.status = 'running';

        // Poll for completion (in production, use WebSocket events)
        await this.pollGarakCompletion(unifiedId, result.id, fwStatus);
      } else if (framework === Framework.STRIX && config.strix) {
        // Start Strix agent
        const result = await this.strixService.startExecution(
          organizationId,
          {
            targetUrl: config.strix.targetUrl,
            attackMode: config.strix.attackMode,
            maxSteps: config.strix.maxSteps,
            timeout: config.strix.timeout,
            headless: config.strix.headless,
          },
          userId,
          targetId,
        );

        fwStatus.executionId = result.id;
        fwStatus.status = 'running';

        // Poll for completion (in production, use WebSocket events)
        await this.pollStrixCompletion(unifiedId, result.id, fwStatus);
      } else if (framework === Framework.PROMPTFOO && config.promptfoo) {
        // Promptfoo integration (to be implemented in later phase)
        this.logger.warn('Promptfoo integration not yet implemented');
        fwStatus.status = 'failed';
        fwStatus.error = 'Not implemented yet';
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
   * Poll Garak scan for completion (temporary - will be replaced by WebSocket listeners)
   */
  private async pollGarakCompletion(
    unifiedId: string,
    scanId: string,
    fwStatus: FrameworkExecutionStatusDto,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          // In production, this will use WebSocket events instead of polling
          // For now, we simulate completion after timeout
          const elapsed = Date.now() - new Date(fwStatus.startTime!).getTime();
          const progress = Math.min(100, Math.floor((elapsed / 60000) * 100)); // 1 minute max

          fwStatus.progress = progress;
          this.gateway.emitFrameworkProgress(unifiedId, Framework.GARAK, progress);

          if (progress >= 100) {
            fwStatus.status = 'completed';
            fwStatus.endTime = new Date().toISOString();
            fwStatus.results = { vulnerabilities: 5, scans: 100 }; // Placeholder
            this.gateway.emitFrameworkCompleted(unifiedId, Framework.GARAK, fwStatus.results);
            clearInterval(interval);
            resolve();
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 2000);
    });
  }

  /**
   * Poll Strix execution for completion (temporary - will be replaced by WebSocket listeners)
   */
  private async pollStrixCompletion(
    unifiedId: string,
    executionId: string,
    fwStatus: FrameworkExecutionStatusDto,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          // In production, this will use WebSocket events instead of polling
          const elapsed = Date.now() - new Date(fwStatus.startTime!).getTime();
          const progress = Math.min(100, Math.floor((elapsed / 90000) * 100)); // 1.5 minutes max

          fwStatus.progress = progress;
          this.gateway.emitFrameworkProgress(unifiedId, Framework.STRIX, progress);

          if (progress >= 100) {
            fwStatus.status = 'completed';
            fwStatus.endTime = new Date().toISOString();
            fwStatus.results = { findings: 12, steps: 50 }; // Placeholder
            this.gateway.emitFrameworkCompleted(unifiedId, Framework.STRIX, fwStatus.results);
            clearInterval(interval);
            resolve();
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 2000);
    });
  }

  /**
   * Aggregate results from all frameworks
   */
  private aggregateResults(execution: UnifiedExecutionDto): any {
    const aggregated = {
      totalVulnerabilities: 0,
      totalFindings: 0,
      byFramework: {},
      completedFrameworks: 0,
      failedFrameworks: 0,
    };

    for (const fw of execution.frameworks) {
      if (fw.status === 'completed' && fw.results) {
        aggregated.completedFrameworks++;
        aggregated.byFramework[fw.framework] = fw.results;

        // Sum up vulnerabilities/findings
        if (fw.results.vulnerabilities) {
          aggregated.totalVulnerabilities += fw.results.vulnerabilities;
        }
        if (fw.results.findings) {
          aggregated.totalFindings += fw.results.findings;
        }
      } else if (fw.status === 'failed') {
        aggregated.failedFrameworks++;
      }
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

    // Stop all running frameworks
    for (const fw of execution.frameworks) {
      if (fw.status === 'running' && fw.executionId) {
        try {
          if (fw.framework === Framework.STRIX) {
            await this.strixService.stopExecution(organizationId, fw.executionId);
          }
          // Garak doesn't support stop (execAsync)
        } catch (error) {
          this.logger.error(`Failed to stop ${fw.framework}`, error);
        }
      }
    }

    execution.status = 'completed';
    execution.endTime = new Date().toISOString();
    execution.duration = Math.floor(
      (new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()) / 1000,
    );

    this.gateway.emitUnifiedStopped(id);
  }
}
