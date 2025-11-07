import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ScanConfigDto } from './dto/scan-config.dto';
import { ScanResultDto, VulnerabilityDto } from './dto/scan-result.dto';
import { GarakGateway } from './garak.gateway';

const execAsync = promisify(exec);

@Injectable()
export class GarakService {
  private readonly logger = new Logger(GarakService.name);
  private readonly garakOutputDir = join(process.cwd(), 'garak-outputs');

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => GarakGateway))
    private readonly gateway: GarakGateway,
  ) {}

  /**
   * Ensure Garak output directory exists
   */
  private async ensureGarakOutputDir(): Promise<void> {
    try {
      await fs.access(this.garakOutputDir);
      this.logger.debug(`Garak output directory exists: ${this.garakOutputDir}`);
    } catch {
      this.logger.log(`Creating Garak output directory: ${this.garakOutputDir}`);
      await fs.mkdir(this.garakOutputDir, { recursive: true });
    }
  }

  /**
   * Build Garak CLI command
   */
  private buildGarakCommand(config: ScanConfigDto, outputDir: string): string {
    const parts: string[] = ['garak'];

    // Model configuration
    const modelType = config.modelType || 'openai';
    parts.push(`--model-type ${modelType}`);
    parts.push(`--model-name "${config.model}"`);

    // API Key (if provided)
    if (config.apiKey) {
      parts.push(`--api-key ${config.apiKey}`);
    }

    // Probes
    if (config.probes.includes('all')) {
      parts.push('--probes all');
    } else {
      parts.push(`--probes ${config.probes.join(',')}`);
    }

    // Detectors (optional)
    if (config.detectors && config.detectors.length > 0) {
      if (config.detectors.includes('all')) {
        parts.push('--detectors all');
      } else {
        parts.push(`--detectors ${config.detectors.join(',')}`);
      }
    }

    // Generators (optional)
    if (config.generators && config.generators.length > 0) {
      parts.push(`--generators ${config.generators.join(',')}`);
    }

    // Output configuration
    parts.push(`--report_dir "${outputDir}"`);
    parts.push('--output_format jsonl');

    const command = parts.join(' ');
    this.logger.debug(`Built Garak command: ${command}`);
    return command;
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
   * Run Garak CLI asynchronously
   */
  private async runGarakAsync(
    scanId: string,
    config: ScanConfigDto,
    outputPath: string,
  ): Promise<void> {
    this.logger.log(`🚀 Launching Garak CLI (scan ID: ${scanId})...`);

    try {
      // Build command
      const command = this.buildGarakCommand(config, outputPath);
      this.gateway.emitLog(scanId, `Executing: ${command}`);
      this.gateway.emitProgress(scanId, 10, 'Initializing Garak scanner...');

      // Update status to RUNNING
      await this.prisma.testRun.update({
        where: { id: scanId },
        data: { status: 'RUNNING' },
      });

      // Execute Garak CLI (timeout: 1 hour, max buffer: 10MB)
      this.gateway.emitProgress(scanId, 20, 'Running Garak probes...');

      const { stdout, stderr } = await execAsync(command, {
        timeout: 3600000, // 1 hour
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      this.logger.log(`✅ Garak scan completed (${scanId})`);
      this.logger.debug(`STDOUT: ${stdout.substring(0, 500)}...`);

      if (stderr) {
        this.logger.warn(`STDERR: ${stderr}`);
        this.gateway.emitLog(scanId, `⚠️ Warnings: ${stderr}`);
      }

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

  /**
   * Convert severity to numeric score (0-1 scale)
   */
  private severityToScore(severity: string): number {
    const scoreMap: Record<string, number> = {
      critical: 0.1,
      high: 0.3,
      moderate: 0.5,
      low: 0.7,
    };
    return scoreMap[severity] || 0.5;
  }
}
