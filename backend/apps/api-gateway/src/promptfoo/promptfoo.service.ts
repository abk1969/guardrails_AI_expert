import { Injectable, Logger, Inject, forwardRef, NotFoundException, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PromptfooGateway } from './promptfoo.gateway';
import { PrismaService } from '@app/database';
import { TestRunStatus, TestStatus } from '@prisma/client';
import { execAsync, execFileAsync, ensureDirectory } from '../shared/security-tool.utils';
import { DEV_DEFAULTS } from '../shared/constants';

// Container name for Promptfoo runner
const PROMPTFOO_CONTAINER = 'airiskmgr-promptfoo-runner';

// Max retries for transient Docker errors
const MAX_RETRIES = 2;

// Transient error patterns that warrant a retry
const TRANSIENT_ERROR_PATTERNS = [
  'connection reset',
  'broken pipe',
  'ECONNRESET',
  'ECONNREFUSED',
  'OCI runtime',
  'container is restarting',
];

@Injectable()
export class PromptfooService {
  private readonly logger = new Logger(PromptfooService.name);
  private readonly localConfigDir = join(process.cwd(), 'promptfoo-configs');
  private readonly containerConfigDir = '/app/configs';
  private readonly containerOutputDir = '/app/output';
  // Track active progress intervals so we can stop them
  private readonly activeProgressIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    @Inject(forwardRef(() => PromptfooGateway))
    private readonly gateway: PromptfooGateway,
    private readonly prisma: PrismaService,
  ) {
    this.ensureLocalConfigDir();
  }

  private async ensureLocalConfigDir(): Promise<void> {
    await ensureDirectory(this.localConfigDir, this.logger);
  }

  /**
   * Check if the Promptfoo container is running and healthy.
   * Returns detailed status for diagnostics.
   */
  async checkContainerHealth(): Promise<{
    running: boolean;
    status: string;
    error?: string;
  }> {
    try {
      const { stdout } = await execAsync(
        `docker inspect --format="{{.State.Status}}" ${PROMPTFOO_CONTAINER}`,
        { timeout: 5000 },
      );
      const status = stdout.trim();
      const running = status === 'running';
      return { running, status };
    } catch (error) {
      return {
        running: false,
        status: 'not_found',
        error: `Container ${PROMPTFOO_CONTAINER} not found. Start it with: docker-compose up -d promptfoo-runner`,
      };
    }
  }

  /**
   * Lance l'execution de tests Promptfoo via Docker container
   */
  async runTests(
    yamlContent: string,
    userId?: string,
    organizationId?: string,
    targetId?: string,
  ): Promise<{ testRunId: string; estimatedDuration: string }> {
    // 0. Pre-flight: check container health
    const health = await this.checkContainerHealth();
    if (!health.running) {
      throw new BadRequestException(
        health.error || `Container ${PROMPTFOO_CONTAINER} is not running (status: ${health.status})`,
      );
    }

    const timestamp = Date.now();
    const configFileName = `promptfooconfig-${timestamp}.yaml`;
    const localConfigPath = join(this.localConfigDir, configFileName);
    const containerConfigPath = `${this.containerConfigDir}/${configFileName}`;

    this.logger.log(`Creating Promptfoo configuration: ${configFileName}`);

    try {
      // 1. Write YAML config locally
      await fs.writeFile(localConfigPath, yamlContent, 'utf-8');
      this.logger.log(`YAML config written locally: ${localConfigPath}`);

      // 2. Copy config to container using docker cp
      await this.copyConfigToContainer(localConfigPath, containerConfigPath);
      this.logger.log(`Config copied to container: ${containerConfigPath}`);

      // 3. Create TestRun in database (if auth enabled)
      let testRun;

      try {
        testRun = await this.prisma.testRun.create({
          data: {
            createdById: userId || DEV_DEFAULTS.USER_ID,
            organizationId: organizationId || DEV_DEFAULTS.ORGANIZATION_ID,
            targetId: targetId || DEV_DEFAULTS.TARGET_ID,
            status: TestRunStatus.QUEUED,
            configuration: { yamlContent },
            totalTests: 0,
            metadata: { configPath: containerConfigPath, source: 'promptfoo' },
          },
        });
        this.logger.log(`TestRun created in database: ${testRun.id}`);
      } catch (dbError) {
        this.logger.warn('Database unavailable, running in memory-only mode');
      }

      const testRunId = testRun?.id || `run-${timestamp}`;

      // 4. Launch Promptfoo in background via docker exec
      this.runPromptfooInDocker(containerConfigPath, testRunId, localConfigPath);

      return {
        testRunId,
        estimatedDuration: '5-30 minutes',
      };
    } catch (error) {
      // Clean up local config on failure
      await this.cleanupFile(localConfigPath);
      this.logger.error(`Error creating test:`, error);
      throw new Error(`Failed to create configuration: ${error.message}`);
    }
  }

  /**
   * Copy config file to Promptfoo container
   */
  private async copyConfigToContainer(localPath: string, containerPath: string): Promise<void> {
    const copyCommand = `docker cp "${localPath}" ${PROMPTFOO_CONTAINER}:${containerPath}`;
    this.logger.debug(`Executing: ${copyCommand}`);

    try {
      await execAsync(copyCommand, { timeout: 30000 });
    } catch (error) {
      this.logger.error('Failed to copy config to container:', error);
      throw new Error(`Failed to copy config to container: ${error.message}`);
    }
  }

  /**
   * Run Promptfoo in Docker container (non-blocking).
   * Includes retry logic for transient Docker errors.
   */
  private async runPromptfooInDocker(
    containerConfigPath: string,
    testRunId: string,
    localConfigPath: string,
  ): Promise<void> {
    this.logger.log(`Launching Promptfoo in Docker (run ID: ${testRunId})...`);

    // Emit start event
    this.gateway.emitTestStarted(testRunId);
    this.gateway.emitLog(testRunId, 'Starting Promptfoo execution in container...');

    // Update status to RUNNING
    const isDbTestRun = !testRunId.startsWith('run-');
    if (isDbTestRun) {
      try {
        await this.prisma.testRun.update({
          where: { id: testRunId },
          data: { status: TestRunStatus.RUNNING },
        });
      } catch (error) {
        this.logger.warn(`Could not update TestRun ${testRunId}:`, error);
      }
    }

    // Run in background
    setTimeout(async () => {
      const outputFile = `${this.containerOutputDir}/results-${testRunId}.json`;
      let lastError: Error | null = null;

      try {
        // Start progress tracking based on Docker output monitoring
        this.startProgressTracking(testRunId);

        // Build docker exec command
        const dockerArgs = [
          'exec',
          PROMPTFOO_CONTAINER,
          'npx', 'promptfoo@latest', 'eval',
          '-c', containerConfigPath,
          '--output', outputFile,
          '--no-progress-bar',
        ];

        this.logger.log(`Executing: docker ${dockerArgs.join(' ')}`);
        this.gateway.emitLog(testRunId, 'Executing Promptfoo in container...');
        this.gateway.emitProgress(testRunId, 10, 'Running tests...');

        // Execute with retry logic
        let stdout = '';
        let stderr = '';
        for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
          try {
            const result = await execFileAsync('docker', dockerArgs, {
              timeout: 3600000, // 1 hour max
              maxBuffer: 10 * 1024 * 1024, // 10MB
            });
            stdout = result.stdout;
            stderr = result.stderr;
            lastError = null;
            break; // Success, exit retry loop
          } catch (execError) {
            lastError = execError;
            const isTransient = this.isTransientError(execError);

            if (isTransient && attempt <= MAX_RETRIES) {
              this.logger.warn(
                `Transient Docker error (attempt ${attempt}/${MAX_RETRIES + 1}), retrying in 5s...`,
                execError.message,
              );
              this.gateway.emitLog(
                testRunId,
                `Transient error, retrying (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`,
              );
              await this.delay(5000);
            } else {
              // Non-transient error or max retries exhausted
              throw execError;
            }
          }
        }

        // Stop simulated progress
        this.stopProgressTracking(testRunId);

        this.logger.log(`Promptfoo tests completed (${testRunId})`);
        this.logger.debug(`STDOUT: ${stdout.substring(0, 500)}`);

        if (stderr) {
          this.logger.warn(`STDERR: ${stderr}`);
        }

        // Copy results from container
        this.gateway.emitProgress(testRunId, 85, 'Copying results...');
        const localOutputPath = join(this.localConfigDir, `results-${testRunId}.json`);

        try {
          await execAsync(
            `docker cp ${PROMPTFOO_CONTAINER}:${outputFile} "${localOutputPath}"`,
            { timeout: 30000 },
          );
          const resultsContent = await fs.readFile(localOutputPath, 'utf-8');
          await this.parseAndSaveResults(testRunId, resultsContent);
          // Clean up local results file
          await this.cleanupFile(localOutputPath);
        } catch (copyError) {
          this.logger.warn('Could not copy results file, parsing stdout instead');
          await this.parseAndSaveResults(testRunId, stdout);
        }

        // Emit completion event
        this.gateway.emitProgress(testRunId, 100, 'Completed!');
        this.gateway.emitTestCompleted(testRunId, { stdout, stderr });
        this.gateway.emitLog(testRunId, 'Tests completed successfully!');
      } catch (error) {
        this.stopProgressTracking(testRunId);
        this.logger.error(`Promptfoo error (${testRunId}):`, error);

        // Update status to FAILED
        if (isDbTestRun) {
          try {
            await this.prisma.testRun.update({
              where: { id: testRunId },
              data: {
                status: TestRunStatus.FAILED,
                completedAt: new Date(),
              },
            });
          } catch (dbError) {
            this.logger.error(`Error updating FAILED status:`, dbError);
          }
        }

        this.gateway.emitTestFailed(testRunId, error.message);
        this.gateway.emitLog(testRunId, `Error: ${error.message}`);
      } finally {
        // Clean up the local YAML config file
        await this.cleanupFile(localConfigPath);
        // Clean up config inside container
        this.cleanupContainerFile(containerConfigPath);
        // Clean up output inside container
        this.cleanupContainerFile(`${this.containerOutputDir}/results-${testRunId}.json`);
      }
    }, 0);
  }

  /**
   * Determine if a Docker error is transient and worth retrying.
   */
  private isTransientError(error: any): boolean {
    const message = (error?.message || '').toLowerCase();
    return TRANSIENT_ERROR_PATTERNS.some((pattern) => message.includes(pattern.toLowerCase()));
  }

  /**
   * Start real-ish progress tracking by periodically checking Docker container
   * for output file existence and size, replacing the old fake simulation.
   */
  private startProgressTracking(testRunId: string): void {
    let progress = 5;
    const interval = setInterval(async () => {
      try {
        // Check if the container is still running the command by looking at output file
        const { stdout } = await execAsync(
          `docker exec ${PROMPTFOO_CONTAINER} sh -c "test -f ${this.containerOutputDir}/results-${testRunId}.json && stat -c%s ${this.containerOutputDir}/results-${testRunId}.json 2>/dev/null || echo 0"`,
          { timeout: 5000 },
        ).catch(() => ({ stdout: '0' }));

        const fileSize = parseInt(stdout.trim(), 10) || 0;

        if (fileSize > 0) {
          // Output file exists and has content -- nearly done
          progress = Math.max(progress, 80);
        } else {
          // Still running, increment slowly
          progress = Math.min(progress + 3 + Math.random() * 4, 78);
        }

        this.gateway.emitProgress(testRunId, Math.floor(progress), 'Running tests...');
      } catch {
        // Progress check failed, just increment slowly
        progress = Math.min(progress + 2, 78);
        this.gateway.emitProgress(testRunId, Math.floor(progress), 'Running tests...');
      }
    }, 5000);

    this.activeProgressIntervals.set(testRunId, interval);
  }

  /**
   * Stop progress tracking for a test run.
   */
  private stopProgressTracking(testRunId: string): void {
    const interval = this.activeProgressIntervals.get(testRunId);
    if (interval) {
      clearInterval(interval);
      this.activeProgressIntervals.delete(testRunId);
    }
  }

  /**
   * Clean up a local file, logging but not throwing on failure.
   */
  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.logger.debug(`Cleaned up file: ${filePath}`);
    } catch {
      // File may not exist, that's fine
    }
  }

  /**
   * Clean up a file inside the container.
   */
  private cleanupContainerFile(containerPath: string): void {
    execAsync(`docker exec ${PROMPTFOO_CONTAINER} rm -f "${containerPath}"`, {
      timeout: 5000,
    }).catch(() => {
      // Best-effort cleanup
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Recupere le statut d'une execution de tests
   */
  async getTestStatus(testRunId: string): Promise<{
    status: 'queued' | 'running' | 'completed' | 'failed';
    progress?: number;
  }> {
    const testRun = await this.prisma.testRun.findUnique({
      where: { id: testRunId },
      select: {
        status: true,
        progress: true,
      },
    });

    if (!testRun) {
      throw new NotFoundException(`Test run ${testRunId} not found`);
    }

    const statusMap: Record<TestRunStatus, 'queued' | 'running' | 'completed' | 'failed'> = {
      [TestRunStatus.PENDING]: 'queued',
      [TestRunStatus.QUEUED]: 'queued',
      [TestRunStatus.RUNNING]: 'running',
      [TestRunStatus.COMPLETED]: 'completed',
      [TestRunStatus.FAILED]: 'failed',
      [TestRunStatus.CANCELLED]: 'failed',
    };

    return {
      status: statusMap[testRun.status],
      progress: testRun.progress ?? 0,
    };
  }

  /**
   * Parse les resultats JSON de Promptfoo et les sauvegarde en base.
   * Handles multiple Promptfoo output formats robustly.
   */
  private async parseAndSaveResults(testRunId: string, jsonOutput: string): Promise<void> {
    const isDbTestRun = !testRunId.startsWith('run-');

    if (!isDbTestRun) {
      this.logger.log(`TestRun ${testRunId} is not in DB, skipping save`);
      return;
    }

    try {
      // Strip any non-JSON prefix (e.g., log lines before JSON output)
      const jsonStart = jsonOutput.indexOf('{');
      const jsonArrayStart = jsonOutput.indexOf('[');
      let cleanJson = jsonOutput;

      if (jsonStart === -1 && jsonArrayStart === -1) {
        throw new Error('No JSON content found in output');
      }

      const startIdx =
        jsonStart === -1
          ? jsonArrayStart
          : jsonArrayStart === -1
            ? jsonStart
            : Math.min(jsonStart, jsonArrayStart);
      cleanJson = jsonOutput.substring(startIdx);

      const parsedOutput = JSON.parse(cleanJson);

      // Promptfoo can output in different formats:
      // 1. { results: { results: [...] } } (full eval output)
      // 2. { results: [...] }
      // 3. [...] (direct array)
      let results: any[];
      if (Array.isArray(parsedOutput)) {
        results = parsedOutput;
      } else if (parsedOutput.results?.results && Array.isArray(parsedOutput.results.results)) {
        results = parsedOutput.results.results;
      } else if (Array.isArray(parsedOutput.results)) {
        results = parsedOutput.results;
      } else {
        this.logger.warn('Unexpected JSON format, attempting to extract results from top-level object');
        results = [parsedOutput];
      }

      this.logger.log(`Parsing ${results.length} Promptfoo results...`);

      let passedCount = 0;
      let failedCount = 0;

      for (const result of results) {
        const passed = result.pass ?? result.success ?? (result.score != null ? result.score >= 0.7 : false);
        if (passed) passedCount++;
        else failedCount++;

        await this.prisma.testResult.create({
          data: {
            testRunId,
            promptId: result.id || result.promptId || `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            promptText: result.prompt || result.input || result.vars?.prompt || '',
            promptCategory: result.category || result.vars?.category || 'Security',
            promptComplexity: result.complexity || result.vars?.complexity || 'Medium',
            response: typeof result.output === 'string' ? result.output : JSON.stringify(result.output || result.response || ''),
            responseTime: result.latencyMs || result.duration || null,
            status: passed ? TestStatus.PASSED : TestStatus.FAILED,
            score: result.score ?? (passed ? 1.0 : 0.0),
            explanation: result.reason || result.gradingResult?.reason || null,
            evaluationChain: result.gradingResults || result.evaluationChain || [],
            remediation: result.remediation || null,
            metadata: {
              provider: result.provider?.id || result.provider,
              plugin: result.plugin,
              tags: result.tags,
            },
          },
        });
      }

      // Update TestRun with final statistics
      await this.prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: TestRunStatus.COMPLETED,
          totalTests: results.length,
          passedTests: passedCount,
          failedTests: failedCount,
          progress: 100,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `Results saved: ${passedCount} passed, ${failedCount} failed`,
      );
    } catch (error) {
      this.logger.error(`Error parsing results:`, error);

      // Mark as FAILED with partial info rather than leaving in RUNNING state
      if (isDbTestRun) {
        try {
          await this.prisma.testRun.update({
            where: { id: testRunId },
            data: {
              status: TestRunStatus.FAILED,
              completedAt: new Date(),
              metadata: {
                parseError: error.message,
                source: 'promptfoo',
              },
            },
          });
        } catch (dbError) {
          this.logger.error('Could not update TestRun to FAILED after parse error:', dbError);
        }
      }

      throw error;
    }
  }

  /**
   * Recupere les resultats d'un test run depuis la base de donnees.
   * Supports pagination for large result sets.
   */
  async getTestResults(
    testRunId: string,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<any> {
    const testRun = await this.prisma.testRun.findUnique({
      where: { id: testRunId },
      include: {
        target: {
          select: {
            name: true,
            componentType: true,
          },
        },
      },
    });

    if (!testRun) {
      throw new NotFoundException(`TestRun ${testRunId} not found`);
    }

    // Fetch paginated results
    const skip = (page - 1) * pageSize;
    const [results, totalResults] = await Promise.all([
      this.prisma.testResult.findMany({
        where: { testRunId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.testResult.count({ where: { testRunId } }),
    ]);

    // Calculate stats from all results (not just current page)
    const allResults = await this.prisma.testResult.findMany({
      where: { testRunId },
      select: {
        status: true,
        score: true,
        promptCategory: true,
        metadata: true,
      },
    });

    const categoryStats: Record<string, { passed: number; failed: number }> = {};
    const pluginStats: Record<string, number> = {};

    allResults.forEach((result) => {
      if (!categoryStats[result.promptCategory]) {
        categoryStats[result.promptCategory] = { passed: 0, failed: 0 };
      }
      if (result.status === TestStatus.PASSED) {
        categoryStats[result.promptCategory].passed++;
      } else {
        categoryStats[result.promptCategory].failed++;
      }

      const plugin = (result.metadata as any)?.plugin || 'unknown';
      pluginStats[plugin] = (pluginStats[plugin] || 0) + 1;
    });

    return {
      testRunId: testRun.id,
      status: testRun.status,
      target: testRun.target,
      duration: testRun.completedAt
        ? `${Math.round((testRun.completedAt.getTime() - testRun.startedAt.getTime()) / 1000)} sec`
        : 'In progress',
      summary: {
        totalTests: testRun.totalTests,
        passed: testRun.passedTests,
        failed: testRun.failedTests,
        successRate: testRun.totalTests > 0
          ? Math.round((testRun.passedTests / testRun.totalTests) * 100)
          : 0,
        averageScore:
          allResults.length > 0
            ? allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
            : 0,
        criticalFailures: allResults.filter((r) => r.score < 0.3).length,
      },
      categoryStats,
      pluginStats,
      pagination: {
        page,
        pageSize,
        totalResults,
        totalPages: Math.ceil(totalResults / pageSize),
      },
      results: results.map((r) => ({
        id: r.id,
        prompt: r.promptText,
        response: r.response,
        score: r.score,
        passed: r.status === TestStatus.PASSED,
        plugin: (r.metadata as any)?.plugin || 'unknown',
        category: r.promptCategory,
        complexity: r.promptComplexity,
        explanation: r.explanation,
        responseTime: r.responseTime,
      })),
    };
  }

  /**
   * List recent test runs with pagination.
   */
  async listTestRuns(
    page: number = 1,
    pageSize: number = 20,
    organizationId?: string,
  ): Promise<any> {
    const where = organizationId ? { organizationId } : {};
    const skip = (page - 1) * pageSize;

    const [testRuns, total] = await Promise.all([
      this.prisma.testRun.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          totalTests: true,
          passedTests: true,
          failedTests: true,
          progress: true,
          createdAt: true,
          completedAt: true,
          metadata: true,
        },
      }),
      this.prisma.testRun.count({ where }),
    ]);

    // Filter to only promptfoo test runs
    const promptfooRuns = testRuns.filter(
      (run) => (run.metadata as any)?.source === 'promptfoo',
    );

    return {
      testRuns: promptfooRuns,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Valide une configuration YAML sans l'executer (dry-run).
   */
  async validateYAML(yamlContent: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic YAML validations
      if (!yamlContent || yamlContent.trim().length === 0) {
        errors.push('Configuration YAML vide');
        return { valid: false, errors, warnings };
      }

      // Check for required YAML structure
      const hasPrompts = yamlContent.includes('prompts:');
      const hasTargets = yamlContent.includes('targets:') || yamlContent.includes('providers:');
      const hasRedteam = yamlContent.includes('redteam:');

      if (!hasPrompts) {
        errors.push('Section manquante: prompts:');
      }

      if (!hasTargets) {
        warnings.push('Section providers/targets manquante - tests simplifies');
      }

      if (!hasRedteam) {
        warnings.push('Section redteam manquante - mode de test basique');
      }

      // Validate numTests bounds
      const numTestsMatch = yamlContent.match(/numTests:\s*(\d+)/);
      if (numTestsMatch) {
        const numTests = parseInt(numTestsMatch[1], 10);
        if (numTests > 50) {
          warnings.push(`Nombre de tests eleve (${numTests}) - Duree d'execution prolongee`);
        }
        if (numTests > 100) {
          errors.push(`Nombre de tests trop eleve (${numTests}) - Maximum recommande: 100`);
        }
      }

      // Check basic YAML syntax (indentation, colons)
      const lines = yamlContent.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Check for tabs (YAML should use spaces)
        if (line.includes('\t')) {
          errors.push(`Ligne ${i + 1}: tabulation detectee - utilisez des espaces`);
          break; // One error is enough
        }
      }

      // Check if container is running
      const health = await this.checkContainerHealth();
      if (!health.running) {
        errors.push(
          health.error ||
            `Container ${PROMPTFOO_CONTAINER} n'est pas en cours d'execution. Demarrez-le avec: docker-compose up -d promptfoo-runner`,
        );
      }

      const valid = errors.length === 0;

      this.logger.log(
        `YAML Validation: ${valid ? 'Success' : 'Failed'} (${errors.length} errors, ${warnings.length} warnings)`,
      );

      return { valid, errors, warnings };
    } catch (error) {
      this.logger.error('Error validating YAML:', error);
      errors.push(`Erreur de validation: ${error.message}`);
      return { valid: false, errors, warnings };
    }
  }
}
