import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ScanConfigDto, SCAN_PRESET_PROBES } from './dto/scan-config.dto';
import { ScanResultDto, SeverityBreakdownDto, VulnerabilityDto } from './dto/scan-result.dto';
import { GarakGateway } from './garak.gateway';
import { execAsync, execFileAsync, ensureDirectory } from '../shared/security-tool.utils';

const CONTAINER_NAME = 'airiskmgr-garak-runner';
const DEFAULT_TIMEOUT_MS = 3600000; // 1 hour
const MAX_BUFFER_BYTES = 10 * 1024 * 1024; // 10MB
const COPY_TIMEOUT_MS = 60000; // 1 minute
const HEALTH_CHECK_TIMEOUT_MS = 10000; // 10 seconds
const MAX_RETRIES = 2;

@Injectable()
export class GarakService {
  private readonly logger = new Logger(GarakService.name);
  private readonly garakOutputDir = join(process.cwd(), 'garak-outputs');

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => GarakGateway))
    private readonly gateway: GarakGateway,
  ) {}

  private async ensureGarakOutputDir(): Promise<void> {
    await ensureDirectory(this.garakOutputDir, this.logger);
  }

  /**
   * Check if the Garak Docker container is running and healthy.
   * @throws Error if container is not available
   */
  async checkContainerHealth(): Promise<{ running: boolean; status: string }> {
    try {
      const { stdout } = await execAsync(
        `docker inspect --format="{{.State.Status}}" ${CONTAINER_NAME}`,
        { timeout: HEALTH_CHECK_TIMEOUT_MS },
      );
      const status = stdout.trim().replace(/"/g, '');
      const running = status === 'running';

      if (!running) {
        this.logger.warn(`Garak container status: ${status} (expected: running)`);
      }

      return { running, status };
    } catch (error) {
      this.logger.error(`Garak container health check failed: ${error.message}`);
      return { running: false, status: 'not_found' };
    }
  }

  /**
   * Build Garak CLI command for Docker execution.
   * @returns Array of command arguments for docker exec
   */
  private buildGarakCommand(config: ScanConfigDto, outputDir: string): string[] {
    const dockerArgs: string[] = [];

    // Pass environment variables for API keys if provided
    if (config.apiKey) {
      const modelType = config.modelType || 'openai';
      if (modelType === 'openai') {
        dockerArgs.push('-e', `OPENAI_API_KEY=${config.apiKey}`);
      } else if (modelType === 'google' || modelType === 'gemini') {
        dockerArgs.push('-e', `GEMINI_API_KEY=${config.apiKey}`);
      } else if (modelType === 'anthropic') {
        dockerArgs.push('-e', `ANTHROPIC_API_KEY=${config.apiKey}`);
      } else {
        dockerArgs.push('-e', `API_KEY=${config.apiKey}`);
      }
    }

    // Container name
    dockerArgs.push(CONTAINER_NAME);

    // Garak command
    dockerArgs.push('garak');

    // Model/Generator configuration
    const modelType = config.modelType || 'openai';
    let generatorSpec = '';

    switch (modelType.toLowerCase()) {
      case 'openai':
        generatorSpec = 'openai.OpenAIGenerator';
        break;
      case 'google':
      case 'gemini':
        generatorSpec = 'google.GeminiGenerator';
        break;
      case 'anthropic':
        generatorSpec = 'anthropic.AnthropicGenerator';
        break;
      case 'huggingface':
        generatorSpec = 'huggingface.InferenceAPI';
        break;
      default:
        generatorSpec = 'litellm.LiteLLMGenerator';
    }

    dockerArgs.push('--model_type', generatorSpec);
    dockerArgs.push('--model_name', config.model);

    // Resolve probes: preset overrides explicit probes
    const resolvedProbes = config.preset
      ? SCAN_PRESET_PROBES[config.preset]
      : config.probes;

    if (resolvedProbes.includes('all')) {
      dockerArgs.push('--probes', 'all');
    } else {
      dockerArgs.push('--probes', resolvedProbes.join(','));
    }

    // Detectors (optional)
    if (config.detectors && config.detectors.length > 0) {
      if (config.detectors.includes('all')) {
        dockerArgs.push('--detectors', 'all');
      } else {
        dockerArgs.push('--detectors', config.detectors.join(','));
      }
    }

    // Output configuration
    dockerArgs.push('--report_prefix', '/app/output/garak-scan');

    this.logger.debug(`Built Garak Docker command: docker exec ${dockerArgs.join(' ')}`);
    return dockerArgs;
  }

  /**
   * Start a Garak LLM vulnerability scan.
   */
  async startScan(
    organizationId: string,
    config: ScanConfigDto,
    userId: string = 'dev-user-id',
    targetId: string = 'dev-target-id',
  ): Promise<ScanResultDto> {
    this.logger.log(`Starting Garak scan for organization ${organizationId}`);
    this.logger.debug(`Scan config: ${JSON.stringify(config)}`);

    try {
      // Ensure output directory exists
      await this.ensureGarakOutputDir();

      // Check container health before starting
      const health = await this.checkContainerHealth();
      if (!health.running) {
        throw new Error(
          `Garak container is not running (status: ${health.status}). ` +
          `Start it with: docker-compose up -d garak`,
        );
      }

      // Create test run in database
      const testRun = await this.prisma.testRun.create({
        data: {
          createdById: userId,
          organizationId,
          targetId,
          status: 'RUNNING',
          totalTests: 0,
          configuration: JSON.parse(JSON.stringify(config)),
          metadata: {
            tool: 'garak',
            model: config.model,
            modelType: config.modelType || 'openai',
            probes: config.probes,
            preset: config.preset || null,
            generators: config.generators,
            detectors: config.detectors,
            startedAt: new Date().toISOString(),
          },
        },
      });

      const scanId = testRun.id;
      const outputPath = join(this.garakOutputDir, scanId);

      // Emit started event
      this.gateway.emitScanStarted(scanId);
      this.gateway.emitLog(scanId, 'Starting Garak LLM vulnerability scan...');
      this.gateway.emitLog(scanId, `Model: ${config.model}`);
      this.gateway.emitLog(
        scanId,
        `Probes: ${config.preset ? `preset "${config.preset}"` : config.probes.join(', ')}`,
      );

      // Run Garak asynchronously (non-blocking)
      this.runGarakAsync(scanId, config, outputPath);

      // Return immediately with scan ID
      return {
        id: scanId,
        timestamp: new Date().toISOString(),
        model: config.model,
        totalTests: 0,
        passed: 0,
        failed: 0,
        vulnerabilities: [],
        status: 'running',
      };
    } catch (error) {
      this.logger.error('Failed to start Garak scan:', error);
      throw error;
    }
  }

  /**
   * Determine if an error is transient (worth retrying).
   */
  private isTransientError(error: any): boolean {
    const message = (error.message || '').toLowerCase();
    return (
      message.includes('connection refused') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('is not running') ||
      message.includes('no such container') ||
      message.includes('container is restarting')
    );
  }

  /**
   * Run Garak CLI asynchronously in Docker container with retry logic.
   */
  private async runGarakAsync(
    scanId: string,
    config: ScanConfigDto,
    outputPath: string,
  ): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Launching Garak CLI in Docker (scan ID: ${scanId})...`);

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
      try {
        if (attempt > 1) {
          this.logger.log(`Retry attempt ${attempt - 1}/${MAX_RETRIES} for scan ${scanId}`);
          this.gateway.emitLog(scanId, `Retry attempt ${attempt - 1}/${MAX_RETRIES}...`);
          // Brief delay before retry
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        // Build command arguments
        const commandArgs = this.buildGarakCommand(config, outputPath);
        this.gateway.emitLog(scanId, `Executing: docker exec ${commandArgs.join(' ')}`);
        this.gateway.emitProgress(scanId, 10, 'Initializing Garak scanner...');

        // Update status to RUNNING
        await this.prisma.testRun.update({
          where: { id: scanId },
          data: { status: 'RUNNING' },
        });

        // Execute Garak CLI in Docker container
        this.gateway.emitProgress(scanId, 20, 'Running Garak probes...');

        const timeout = config.timeoutMs || DEFAULT_TIMEOUT_MS;
        const { stdout, stderr } = await execFileAsync('docker', ['exec', ...commandArgs], {
          timeout,
          maxBuffer: MAX_BUFFER_BYTES,
        });

        this.logger.log(`Garak scan completed (${scanId})`);
        this.logger.debug(`STDOUT: ${stdout.substring(0, 500)}...`);

        if (stderr) {
          this.logger.warn(`STDERR: ${stderr}`);
          this.gateway.emitLog(scanId, `Warnings: ${stderr}`);
        }

        // Copy results from container to host
        this.gateway.emitProgress(scanId, 85, 'Copying results from container...');
        await this.copyResultsFromContainer(scanId, outputPath);

        // Parse and save results
        this.gateway.emitProgress(scanId, 90, 'Parsing results...');
        const { passedCount, failedCount, vulnerabilities } =
          await this.parseAndSaveResults(scanId, outputPath);

        const durationMs = Date.now() - startTime;
        const severityBreakdown = this.computeSeverityBreakdown(vulnerabilities);

        // Emit completion
        this.gateway.emitProgress(scanId, 100, 'Scan completed!');
        this.gateway.emitScanCompleted(scanId, {
          stdout: stdout.substring(0, 1000),
          stderr: stderr ? stderr.substring(0, 1000) : undefined,
          totalTests: passedCount + failedCount,
          passed: passedCount,
          failed: failedCount,
          durationMs,
          severityBreakdown,
        });
        this.gateway.emitLog(scanId, 'Garak scan completed successfully!');

        // Cleanup temporary files
        await this.cleanupScanFiles(scanId, outputPath);

        return; // Success - exit retry loop
      } catch (error) {
        lastError = error;
        this.logger.error(`Garak scan attempt ${attempt} failed (${scanId}):`, error);

        // Only retry on transient errors
        if (attempt <= MAX_RETRIES && this.isTransientError(error)) {
          this.gateway.emitLog(
            scanId,
            `Transient error (${error.message}), will retry...`,
          );
          continue;
        }

        // Non-transient error or out of retries - fail permanently
        break;
      }
    }

    // All attempts exhausted - mark as failed
    const durationMs = Date.now() - startTime;
    this.logger.error(`Garak scan failed after all attempts (${scanId}):`, lastError);

    await this.prisma.testRun.update({
      where: { id: scanId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        metadata: {
          tool: 'garak',
          error: lastError?.message,
          durationMs,
        },
      },
    });

    this.gateway.emitScanFailed(scanId, lastError?.message || 'Unknown error');
    this.gateway.emitLog(scanId, `Error: ${lastError?.message}`);

    // Cleanup even on failure
    await this.cleanupScanFiles(scanId, join(this.garakOutputDir, scanId));
  }

  /**
   * Copy Garak results from container to host.
   */
  private async copyResultsFromContainer(scanId: string, hostOutputPath: string): Promise<void> {
    try {
      await fs.mkdir(hostOutputPath, { recursive: true });

      const copyCommand = `docker cp ${CONTAINER_NAME}:/app/output/. "${hostOutputPath}"`;
      this.logger.log(`Copying results: ${copyCommand}`);

      await execAsync(copyCommand, { timeout: COPY_TIMEOUT_MS });
      this.logger.log(`Results copied from container to ${hostOutputPath}`);
    } catch (error) {
      this.logger.error(`Failed to copy results from container:`, error);
      throw new Error(`Failed to copy Garak results: ${error.message}`);
    }
  }

  /**
   * Parse Garak JSONL results and save to database.
   * Returns parsed counts for the caller.
   */
  private async parseAndSaveResults(
    scanId: string,
    outputPath: string,
  ): Promise<{ passedCount: number; failedCount: number; vulnerabilities: VulnerabilityDto[] }> {
    this.logger.log(`Parsing Garak results for scan ${scanId}...`);

    // Find JSONL report file in output directory
    let reportFiles: string[] = [];
    try {
      const files = await fs.readdir(outputPath);
      reportFiles = files.filter((f) => f.endsWith('.jsonl'));
    } catch (error) {
      this.logger.error(`Output directory not found: ${outputPath}`, error);
      throw new Error(`Garak output directory not found: ${outputPath}`);
    }

    if (reportFiles.length === 0) {
      this.logger.warn(`No JSONL report found in ${outputPath}, treating as 0 results`);
      await this.prisma.testRun.update({
        where: { id: scanId },
        data: {
          status: 'COMPLETED',
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          progress: 100,
          completedAt: new Date(),
        },
      });
      return { passedCount: 0, failedCount: 0, vulnerabilities: [] };
    }

    const reportFile = join(outputPath, reportFiles[0]);
    this.logger.log(`Reading Garak report: ${reportFile}`);

    const content = await fs.readFile(reportFile, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());

    this.logger.log(`Parsing ${lines.length} result lines from Garak...`);
    this.gateway.emitLog(scanId, `Processing ${lines.length} test results...`);

    let passedCount = 0;
    let failedCount = 0;
    let parseErrorCount = 0;
    const vulnerabilities: VulnerabilityDto[] = [];

    for (const line of lines) {
      try {
        const result = JSON.parse(line);

        // Garak JSONL format: { probe: string, detector: string, status: number, ... }
        // status: 0 = fail (vulnerability found), 1 = pass (no vulnerability)
        const failed = result.status === 0 || result.passed === false;

        if (failed) {
          failedCount++;

          const vuln: VulnerabilityDto = {
            category: result.probe || result.attack_type || 'Unknown',
            severity: this.determineSeverity(result),
            description:
              result.msg ||
              result.description ||
              `Vulnerability detected by ${result.detector || 'Garak'}`,
          };

          vulnerabilities.push(vuln);

          // Emit vulnerability found event
          this.gateway.emitVulnerabilityFound(scanId, vuln);

          // Save to database
          await this.prisma.testResult.create({
            data: {
              testRunId: scanId,
              promptId: `garak-${result.probe || 'test'}-${Date.now()}`,
              promptText: result.input || result.prompt || 'N/A',
              promptCategory: result.probe || 'Security',
              promptComplexity: 'MOYEN',
              response: result.output || result.response || 'N/A',
              score: 0.0,
              status: 'FAILED',
              evaluationChain: {
                steps: [
                  {
                    name: 'Garak Probe',
                    description: `Probe: ${result.probe}, Detector: ${result.detector}`,
                    result: 'fail',
                    timestamp: new Date().toISOString(),
                  },
                ],
              },
              metadata: {
                probe: result.probe,
                detector: result.detector,
                severity: vuln.severity,
                garakResult: result,
              },
            },
          });
        } else {
          passedCount++;
        }
      } catch (parseError) {
        parseErrorCount++;
        if (parseErrorCount <= 5) {
          this.logger.warn(`Failed to parse JSONL line (${parseErrorCount}): ${line.substring(0, 100)}`);
        }
      }
    }

    if (parseErrorCount > 0) {
      this.gateway.emitLog(scanId, `${parseErrorCount} result lines could not be parsed`);
    }

    // Update test run with final statistics
    await this.prisma.testRun.update({
      where: { id: scanId },
      data: {
        status: 'COMPLETED',
        totalTests: passedCount + failedCount,
        passedTests: passedCount,
        failedTests: failedCount,
        progress: 100,
        completedAt: new Date(),
      },
    });

    this.logger.log(
      `Garak results saved: ${passedCount} passed, ${failedCount} failed, ${vulnerabilities.length} vulnerabilities`,
    );
    this.gateway.emitLog(
      scanId,
      `Final stats: ${passedCount} passed, ${failedCount} failed`,
    );

    return { passedCount, failedCount, vulnerabilities };
  }

  /**
   * Compute severity breakdown from a list of vulnerabilities.
   */
  private computeSeverityBreakdown(vulnerabilities: VulnerabilityDto[]): SeverityBreakdownDto {
    const breakdown: SeverityBreakdownDto = { critical: 0, high: 0, moderate: 0, low: 0 };
    for (const vuln of vulnerabilities) {
      if (vuln.severity in breakdown) {
        breakdown[vuln.severity]++;
      }
    }
    return breakdown;
  }

  /**
   * Determine vulnerability severity from Garak result.
   */
  private determineSeverity(result: any): 'critical' | 'high' | 'moderate' | 'low' {
    // If Garak provides severity directly
    if (result.severity) {
      const severity = result.severity.toLowerCase();
      if (['critical', 'high', 'moderate', 'low'].includes(severity)) {
        return severity as 'critical' | 'high' | 'moderate' | 'low';
      }
    }

    // Map probe type to severity
    const probe = (result.probe || result.attack_type || '').toLowerCase();

    const criticalProbes = ['injection', 'jailbreak', 'malicious', 'encoding'];
    const highProbes = ['toxicity', 'leakage', 'dan'];

    if (criticalProbes.some((p) => probe.includes(p))) {
      return 'critical';
    }

    if (highProbes.some((p) => probe.includes(p))) {
      return 'high';
    }

    return 'moderate';
  }

  /**
   * Cleanup temporary scan output files from host.
   */
  private async cleanupScanFiles(scanId: string, outputPath: string): Promise<void> {
    try {
      await fs.rm(outputPath, { recursive: true, force: true });
      this.logger.debug(`Cleaned up scan output files: ${outputPath}`);
    } catch (error) {
      // Non-critical: log but don't throw
      this.logger.warn(`Failed to cleanup scan files for ${scanId}: ${error.message}`);
    }
  }
}
