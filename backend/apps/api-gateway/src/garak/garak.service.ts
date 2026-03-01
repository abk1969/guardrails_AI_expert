import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ScanConfigDto } from './dto/scan-config.dto';
import { ScanResultDto, VulnerabilityDto } from './dto/scan-result.dto';
import { GarakGateway } from './garak.gateway';
import { execAsync, execFileAsync, severityToScore, ensureDirectory } from '../shared/security-tool.utils';

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
   * Build Garak CLI command for Docker execution
   * @returns Array of command arguments for docker exec
   */
  private buildGarakCommand(config: ScanConfigDto, outputDir: string): string[] {
    // Build docker exec command to run Garak in isolated container
    const dockerArgs: string[] = [];

    // Pass environment variables for API keys if provided
    if (config.apiKey) {
      // Determine which env var to use based on model type
      const modelType = config.modelType || 'openai';
      if (modelType === 'openai') {
        dockerArgs.push('-e', `OPENAI_API_KEY=${config.apiKey}`);
      } else if (modelType === 'google' || modelType === 'gemini') {
        dockerArgs.push('-e', `GEMINI_API_KEY=${config.apiKey}`);
      } else if (modelType === 'anthropic') {
        dockerArgs.push('-e', `ANTHROPIC_API_KEY=${config.apiKey}`);
      } else {
        // Generic API key
        dockerArgs.push('-e', `API_KEY=${config.apiKey}`);
      }
    }

    // Container name
    dockerArgs.push('airiskmgr-garak-runner');

    // Garak command
    dockerArgs.push('garak');

    // Model/Generator configuration - Garak uses generators, not model-type/model-name
    // Map modelType to Garak generator format
    const modelType = config.modelType || 'openai';
    let generatorSpec = '';

    switch (modelType.toLowerCase()) {
      case 'openai':
        generatorSpec = `openai.OpenAIGenerator`;
        break;
      case 'google':
      case 'gemini':
        generatorSpec = `google.GeminiGenerator`;
        break;
      case 'anthropic':
        generatorSpec = `anthropic.AnthropicGenerator`;
        break;
      case 'huggingface':
        generatorSpec = `huggingface.InferenceAPI`;
        break;
      default:
        generatorSpec = `litellm.LiteLLMGenerator`;
    }

    // Use --model_type and --model_name (not --model-type and --model-name)
    dockerArgs.push('--model_type', generatorSpec);
    dockerArgs.push('--model_name', config.model);

    // Probes
    if (config.probes.includes('all')) {
      dockerArgs.push('--probes', 'all');
    } else {
      dockerArgs.push('--probes', config.probes.join(','));
    }

    // Detectors (optional)
    if (config.detectors && config.detectors.length > 0) {
      if (config.detectors.includes('all')) {
        dockerArgs.push('--detectors', 'all');
      } else {
        dockerArgs.push('--detectors', config.detectors.join(','));
      }
    }

    // Output configuration (use container's output directory with prefix)
    dockerArgs.push('--report_prefix', '/app/output/garak-scan');

    this.logger.debug(`Built Garak Docker command: docker exec ${dockerArgs.join(' ')}`);
    return dockerArgs;
  }

  /**
   * Start a Garak LLM vulnerability scan
   */
  async startScan(
    organizationId: string,
    config: ScanConfigDto,
    userId: string = 'dev-user-id',
    targetId: string = 'dev-target-id',
  ): Promise<ScanResultDto> {
    this.logger.log(`Starting REAL Garak scan for organization ${organizationId}`);
    this.logger.debug(`Scan config: ${JSON.stringify(config)}`);

    try {
      // Ensure output directory exists
      await this.ensureGarakOutputDir();

      // Create test run in database
      const testRun = await this.prisma.testRun.create({
        data: {
          createdById: userId,
          organizationId,
          targetId,
          status: 'RUNNING',
          totalTests: 0, // Will be updated after scan completes
          configuration: JSON.parse(JSON.stringify(config)),
          metadata: {
            tool: 'garak',
            model: config.model,
            modelType: config.modelType || 'openai',
            probes: config.probes,
            generators: config.generators,
            detectors: config.detectors,
          },
        },
      });

      const scanId = testRun.id;
      const outputPath = join(this.garakOutputDir, scanId);

      // Emit started event
      this.gateway.emitScanStarted(scanId);
      this.gateway.emitLog(scanId, '🚀 Starting Garak LLM vulnerability scan...');
      this.gateway.emitLog(scanId, `Model: ${config.model}`);
      this.gateway.emitLog(scanId, `Probes: ${config.probes.join(', ')}`);

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
   * Run Garak CLI asynchronously in Docker container
   */
  private async runGarakAsync(
    scanId: string,
    config: ScanConfigDto,
    outputPath: string,
  ): Promise<void> {
    this.logger.log(`🚀 Launching Garak CLI in Docker (scan ID: ${scanId})...`);

    try {
      // Build command arguments
      const commandArgs = this.buildGarakCommand(config, outputPath);
      this.gateway.emitLog(scanId, `Executing: docker exec ${commandArgs.join(' ')}`);
      this.gateway.emitProgress(scanId, 10, 'Initializing Garak scanner...');

      // Update status to RUNNING
      await this.prisma.testRun.update({
        where: { id: scanId },
        data: { status: 'RUNNING' },
      });

      // Execute Garak CLI in Docker container (timeout: 1 hour, max buffer: 10MB)
      this.gateway.emitProgress(scanId, 20, 'Running Garak probes...');

      const { stdout, stderr } = await execFileAsync('docker', ['exec', ...commandArgs], {
        timeout: 3600000, // 1 hour
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      this.logger.log(`✅ Garak scan completed (${scanId})`);
      this.logger.debug(`STDOUT: ${stdout.substring(0, 500)}...`);

      if (stderr) {
        this.logger.warn(`STDERR: ${stderr}`);
        this.gateway.emitLog(scanId, `⚠️ Warnings: ${stderr}`);
      }

      // Copy results from container to host
      this.gateway.emitProgress(scanId, 85, 'Copying results from container...');
      await this.copyResultsFromContainer(scanId, outputPath);

      // Parse and save results
      this.gateway.emitProgress(scanId, 90, 'Parsing results...');
      await this.parseAndSaveResults(scanId, outputPath);

      // Emit completion
      this.gateway.emitProgress(scanId, 100, 'Scan completed!');
      this.gateway.emitScanCompleted(scanId, {
        stdout: stdout.substring(0, 1000),
        stderr: stderr ? stderr.substring(0, 1000) : undefined,
        totalTests: 0, // Will be filled by parseAndSaveResults
        passed: 0,
        failed: 0,
      });
      this.gateway.emitLog(scanId, '✅ Garak scan completed successfully!');
    } catch (error) {
      this.logger.error(`❌ Garak scan failed (${scanId}):`, error);

      // Update status to FAILED
      await this.prisma.testRun.update({
        where: { id: scanId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });

      this.gateway.emitScanFailed(scanId, error.message);
      this.gateway.emitLog(scanId, `❌ Error: ${error.message}`);
    }
  }

  /**
   * Copy Garak results from container to host
   */
  private async copyResultsFromContainer(scanId: string, hostOutputPath: string): Promise<void> {
    try {
      // Ensure host output directory exists
      await fs.mkdir(hostOutputPath, { recursive: true });

      // Copy results from container's /app/output to host
      const copyCommand = `docker cp airiskmgr-garak-runner:/app/output/. "${hostOutputPath}"`;
      this.logger.log(`Copying results: ${copyCommand}`);

      await execAsync(copyCommand, { timeout: 60000 }); // 1 minute timeout
      this.logger.log(`✅ Results copied from container to ${hostOutputPath}`);
    } catch (error) {
      this.logger.error(`Failed to copy results from container:`, error);
      throw new Error(`Failed to copy Garak results: ${error.message}`);
    }
  }

  /**
   * Parse Garak JSONL results and save to database
   */
  private async parseAndSaveResults(
    scanId: string,
    outputPath: string,
  ): Promise<void> {
    try {
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
        this.logger.error(`No JSONL report found in ${outputPath}`);
        throw new Error('No Garak report file found');
      }

      const reportFile = join(outputPath, reportFiles[0]);
      this.logger.log(`Reading Garak report: ${reportFile}`);

      const content = await fs.readFile(reportFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());

      this.logger.log(`Parsing ${lines.length} result lines from Garak...`);
      this.gateway.emitLog(scanId, `Processing ${lines.length} test results...`);

      let passedCount = 0;
      let failedCount = 0;
      const vulnerabilities: VulnerabilityDto[] = [];

      for (const line of lines) {
        try {
          const result = JSON.parse(line);

          // Garak JSONL format: { probe: string, detector: string, status: number, ... }
          // status: 0 = fail (vulnerability found), 1 = pass (no vulnerability)
          const failed = result.status === 0 || result.passed === false;

          if (failed) {
            failedCount++;

            // Extract vulnerability information
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
          this.logger.error(`Failed to parse line: ${line}`, parseError);
          this.gateway.emitLog(scanId, `⚠️ Failed to parse result line`);
        }
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
        `✅ Garak results saved: ${passedCount} passed, ${failedCount} failed, ${vulnerabilities.length} vulnerabilities`,
      );
      this.gateway.emitLog(
        scanId,
        `📊 Final stats: ${passedCount} passed, ${failedCount} failed`,
      );
    } catch (error) {
      this.logger.error('Error parsing Garak results:', error);
      throw error;
    }
  }

  /**
   * Determine vulnerability severity from Garak result
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

}
