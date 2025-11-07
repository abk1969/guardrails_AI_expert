import { Injectable, Logger, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { AgentConfigDto } from './dto/agent-config.dto';
import { AgentExecutionDto, FindingDto, LogEntryDto } from './dto/agent-execution.dto';
import { StrixGateway } from './strix.gateway';
import { spawn, ChildProcess } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class StrixService {
  private readonly logger = new Logger(StrixService.name);
  private readonly executions: Map<string, AgentExecutionDto> = new Map();
  private readonly processes: Map<string, ChildProcess> = new Map();
  private readonly strixOutputDir = join(process.cwd(), 'strix-output');

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => StrixGateway))
    private readonly gateway: StrixGateway,
  ) {
    this.ensureStrixOutputDir();
  }

  /**
   * Ensure Strix output directory exists
   */
  private async ensureStrixOutputDir(): Promise<void> {
    try {
      await fs.mkdir(this.strixOutputDir, { recursive: true });
      this.logger.log(`Strix output directory: ${this.strixOutputDir}`);
    } catch (error) {
      this.logger.error('Failed to create Strix output directory', error);
    }
  }

  /**
   * Build Strix CLI command
   */
  private buildStrixCommand(config: AgentConfigDto, outputDir: string): string[] {
    const args: string[] = [];

    // Target URL
    args.push('--target', config.targetUrl);

    // Attack mode
    args.push('--mode', config.attackMode);

    // Max steps
    args.push('--max-steps', config.maxSteps.toString());

    // Timeout
    args.push('--timeout', config.timeout.toString());

    // Headless mode
    if (config.headless) {
      args.push('--headless');
    }

    // Output directory
    args.push('--output', outputDir);

    // JSON output format
    args.push('--format', 'json');

    // Verbose logging
    args.push('--verbose');

    return args;
  }

  /**
   * Start a Strix agent execution
   * This creates a test run and starts the autonomous agent
   */
  async startExecution(
    organizationId: string,
    config: AgentConfigDto,
    userId: string = 'e6cf191e-5d9e-45f2-8d15-a0efbe05f9e8',
    targetId: string = '33faa86b-0bad-45e9-b372-0d174de49cc8',
  ): Promise<AgentExecutionDto> {
    this.logger.log(`Starting Strix agent for organization ${organizationId}`);
    this.logger.debug(`Agent config: ${JSON.stringify(config)}`);

    try {
      // Create a test run entry in the database (graceful fallback if DB unavailable)
      let testRun;
      try {
        testRun = await this.prisma.testRun.create({
          data: {
            createdById: userId,
            organizationId,
            targetId,
            status: 'RUNNING',
            totalTests: config.maxSteps,
            configuration: JSON.parse(JSON.stringify(config)),
            metadata: {
              tool: 'strix',
              targetUrl: config.targetUrl,
              attackMode: config.attackMode,
              headless: config.headless,
              maxSteps: config.maxSteps,
              timeout: config.timeout,
            },
          },
        });
      } catch (dbError) {
        this.logger.warn('Database unavailable, running in memory-only mode');
        // Fallback: use temporary ID
        testRun = {
          id: `strix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          organizationId,
          targetId,
          status: 'RUNNING',
        } as any;
      }

      // Initialize execution state
      const execution: AgentExecutionDto = {
        id: testRun.id,
        status: 'running',
        currentStep: 0,
        totalSteps: config.maxSteps,
        startTime: new Date().toISOString(),
        duration: 0,
        findings: [],
        logs: [
          {
            timestamp: this.formatTime(new Date()),
            level: 'info',
            message: `Strix agent started in ${config.attackMode} mode`,
          },
          {
            timestamp: this.formatTime(new Date()),
            level: 'info',
            message: `Target: ${config.targetUrl}`,
          },
        ],
      };

      // Store in memory for real-time updates
      this.executions.set(testRun.id, execution);

      // Emit WebSocket event
      this.gateway.emitExecutionStarted(testRun.id);

      // Start REAL Strix agent execution (not simulation)
      this.runStrixAgent(testRun.id, config).catch((error) => {
        this.logger.error(`Strix execution ${testRun.id} failed`, error);
        execution.status = 'failed';
        execution.logs.push({
          timestamp: this.formatTime(new Date()),
          level: 'error',
          message: `Execution failed: ${error.message}`,
        });
        this.gateway.emitExecutionFailed(testRun.id, error.message);
      });

      return execution;
    } catch (error) {
      this.logger.error('Failed to start Strix agent', error);
      throw error;
    }
  }

  /**
   * Get agent execution status
   */
  async getExecution(organizationId: string, id: string): Promise<AgentExecutionDto> {
    const execution = this.executions.get(id);

    if (!execution) {
      // Try to load from database
      const testRun = await this.prisma.testRun.findFirst({
        where: {
          id,
          organizationId,
        },
        include: {
          results: true,
        },
      });

      if (!testRun) {
        throw new NotFoundException(`Execution ${id} not found`);
      }

      // Reconstruct execution state from database
      return this.reconstructExecutionFromTestRun(testRun);
    }

    return execution;
  }

  /**
   * Run Strix agent using spawn for process control
   */
  private async runStrixAgent(executionId: string, config: AgentConfigDto): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const outputDir = join(this.strixOutputDir, executionId);
    await fs.mkdir(outputDir, { recursive: true });

    const args = this.buildStrixCommand(config, outputDir);
    this.logger.log(`Running Strix: strix ${args.join(' ')}`);

    // Spawn Strix process
    const strixProcess = spawn('strix', args, {
      cwd: process.cwd(),
      env: { ...process.env },
    });

    // Store process reference for control (pause/resume/stop)
    this.processes.set(executionId, strixProcess);

    this.gateway.emitProgress(executionId, 0, config.maxSteps, 'Initializing Strix agent...');

    // Handle stdout - real-time output parsing
    strixProcess.stdout.on('data', (data: Buffer) => {
      const output = data.toString();
      this.logger.debug(`Strix stdout: ${output}`);

      // Emit log
      this.gateway.emitLog(executionId, output);

      // Parse output for progress and findings
      this.parseStrixOutput(executionId, output, execution);
    });

    // Handle stderr - errors and warnings
    strixProcess.stderr.on('data', (data: Buffer) => {
      const error = data.toString();
      this.logger.warn(`Strix stderr: ${error}`);

      execution.logs.push({
        timestamp: this.formatTime(new Date()),
        level: 'warning',
        message: error.trim(),
      });
    });

    // Handle process exit
    strixProcess.on('close', async (code) => {
      this.logger.log(`Strix process exited with code ${code}`);
      this.processes.delete(executionId);

      if (code === 0) {
        // Success - parse final results
        await this.parseAndSaveResults(executionId, outputDir);

        execution.status = 'completed';
        execution.duration = Math.floor(
          (new Date().getTime() - new Date(execution.startTime).getTime()) / 1000,
        );

        this.gateway.emitExecutionCompleted(executionId, {
          status: execution.status,
          currentStep: execution.currentStep,
          totalSteps: execution.totalSteps,
          duration: execution.duration,
          findings: execution.findings,
        });

        await this.prisma.testRun.update({
          where: { id: executionId },
          data: { status: 'COMPLETED' },
        });
      } else {
        // Failure
        execution.status = 'failed';
        this.gateway.emitExecutionFailed(
          executionId,
          `Strix process exited with code ${code}`,
        );

        await this.prisma.testRun.update({
          where: { id: executionId },
          data: { status: 'FAILED' },
        });
      }
    });

    // Handle process errors
    strixProcess.on('error', (error) => {
      this.logger.error('Strix process error', error);
      execution.status = 'failed';
      execution.logs.push({
        timestamp: this.formatTime(new Date()),
        level: 'error',
        message: `Process error: ${error.message}`,
      });
      this.gateway.emitExecutionFailed(executionId, error.message);
    });
  }

  /**
   * Parse Strix real-time output for progress and findings
   */
  private parseStrixOutput(
    executionId: string,
    output: string,
    execution: AgentExecutionDto,
  ): void {
    const lines = output.split('\n').filter((line) => line.trim());

    for (const line of lines) {
      // Try to parse as JSON (Strix outputs JSON lines)
      try {
        const parsed = JSON.parse(line);

        // Progress update
        if (parsed.type === 'progress') {
          execution.currentStep = parsed.step || execution.currentStep + 1;
          this.gateway.emitProgress(
            executionId,
            execution.currentStep,
            execution.totalSteps,
            parsed.message || 'Processing...',
          );
        }

        // Finding discovered
        if (parsed.type === 'finding') {
          const finding: FindingDto = {
            type: parsed.finding_type || 'info',
            title: parsed.title || 'Finding Discovered',
            description: parsed.description || '',
            severity: this.determineSeverity(parsed),
            timestamp: new Date().toISOString(),
          };

          execution.findings.push(finding);
          this.gateway.emitFindingDiscovered(executionId, finding);

          // Log finding
          execution.logs.push({
            timestamp: this.formatTime(new Date()),
            level: finding.severity === 'critical' || finding.severity === 'high' ? 'warning' : 'info',
            message: `${finding.type.toUpperCase()}: ${finding.title}`,
          });
        }
      } catch (parseError) {
        // Not JSON - treat as log message
        execution.logs.push({
          timestamp: this.formatTime(new Date()),
          level: 'info',
          message: line.trim(),
        });
      }
    }
  }

  /**
   * Parse and save final Strix results from JSON output file
   */
  private async parseAndSaveResults(executionId: string, outputDir: string): Promise<void> {
    try {
      const reportFiles = await fs.readdir(outputDir);
      const jsonFile = reportFiles.find((file) => file.endsWith('.json'));

      if (!jsonFile) {
        this.logger.warn(`No JSON report found in ${outputDir}`);
        return;
      }

      const reportPath = join(outputDir, jsonFile);
      const reportContent = await fs.readFile(reportPath, 'utf-8');
      const report = JSON.parse(reportContent);

      this.logger.log(`Parsed Strix report: ${report.findings?.length || 0} findings`);

      // Save findings to database
      if (report.findings && Array.isArray(report.findings)) {
        for (const finding of report.findings) {
          await this.prisma.testResult.create({
            data: {
              testRunId: executionId,
              promptId: `strix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              promptText: finding.context || 'Strix agent finding',
              promptCategory: finding.type || 'UNKNOWN',
              promptComplexity: 'SOPHISTIQUE',
              response: finding.description || '',
              score: this.severityToScore(finding.severity),
              status: finding.type === 'vulnerability' ? 'FAILED' : 'PASSED',
              evaluationChain: {
                steps: [
                  {
                    name: 'Strix Agent',
                    description: finding.title,
                    result: finding.type === 'vulnerability' ? 'fail' : 'pass',
                    timestamp: finding.timestamp || new Date().toISOString(),
                  },
                ],
              },
              metadata: {
                type: finding.type,
                severity: finding.severity,
                tool: 'strix',
              },
            },
          });
        }
      }
    } catch (error) {
      this.logger.error('Failed to parse Strix results', error);
    }
  }

  /**
   * Determine severity from Strix finding data
   */
  private determineSeverity(data: any): 'critical' | 'high' | 'moderate' | 'low' | 'info' {
    if (data.severity) {
      const severity = data.severity.toLowerCase();
      if (['critical', 'high', 'moderate', 'low', 'info'].includes(severity)) {
        return severity as 'critical' | 'high' | 'moderate' | 'low' | 'info';
      }
    }

    // Fallback based on finding type
    if (data.finding_type === 'vulnerability') {
      return 'high';
    }

    return 'info';
  }

  /**
   * Pause agent execution using SIGSTOP
   */
  async pauseExecution(organizationId: string, id: string): Promise<void> {
    const execution = this.executions.get(id);
    const process = this.processes.get(id);

    if (!execution) {
      throw new NotFoundException(`Execution ${id} not found`);
    }

    if (!process) {
      throw new NotFoundException(`Process for execution ${id} not found`);
    }

    // Send SIGSTOP to pause process
    process.kill('SIGSTOP');

    execution.status = 'paused';
    execution.logs.push({
      timestamp: this.formatTime(new Date()),
      level: 'warning',
      message: 'Execution paused by user (SIGSTOP)',
    });

    this.gateway.emitExecutionPaused(id);

    await this.prisma.testRun.update({
      where: { id },
      data: { status: 'RUNNING' }, // Keep as RUNNING in DB
    });
  }

  /**
   * Resume agent execution using SIGCONT
   */
  async resumeExecution(organizationId: string, id: string): Promise<void> {
    const execution = this.executions.get(id);
    const process = this.processes.get(id);

    if (!execution) {
      throw new NotFoundException(`Execution ${id} not found`);
    }

    if (!process) {
      throw new NotFoundException(`Process for execution ${id} not found`);
    }

    // Send SIGCONT to resume process
    process.kill('SIGCONT');

    execution.status = 'running';
    execution.logs.push({
      timestamp: this.formatTime(new Date()),
      level: 'info',
      message: 'Execution resumed (SIGCONT)',
    });

    this.gateway.emitExecutionResumed(id);

    await this.prisma.testRun.update({
      where: { id },
      data: { status: 'RUNNING' },
    });
  }

  /**
   * Stop agent execution using SIGTERM/SIGKILL
   */
  async stopExecution(organizationId: string, id: string): Promise<void> {
    const execution = this.executions.get(id);
    const process = this.processes.get(id);

    if (!execution) {
      throw new NotFoundException(`Execution ${id} not found`);
    }

    if (!process) {
      throw new NotFoundException(`Process for execution ${id} not found`);
    }

    // Send SIGTERM first (graceful)
    process.kill('SIGTERM');

    // If process doesn't exit in 5 seconds, force kill
    setTimeout(() => {
      if (this.processes.has(id)) {
        this.logger.warn(`Force killing Strix process ${id}`);
        process.kill('SIGKILL');
      }
    }, 5000);

    execution.status = 'completed';
    execution.logs.push({
      timestamp: this.formatTime(new Date()),
      level: 'info',
      message: 'Execution stopped by user (SIGTERM)',
    });

    this.gateway.emitExecutionStopped(id);

    await this.prisma.testRun.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }


  /**
   * Convert severity to numeric score
   */
  private severityToScore(severity: string): number {
    const scoreMap: Record<string, number> = {
      critical: 0.1,
      high: 0.3,
      moderate: 0.5,
      low: 0.7,
      info: 1.0,
    };
    return scoreMap[severity] || 0.5;
  }

  /**
   * Format time as HH:MM:SS
   */
  private formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0];
  }

  /**
   * Reconstruct execution state from database
   */
  private reconstructExecutionFromTestRun(testRun: any): AgentExecutionDto {
    const metadata = testRun.metadata as Record<string, any>;

    return {
      id: testRun.id,
      status: testRun.status,
      currentStep: testRun.results?.length || 0,
      totalSteps: metadata.maxSteps || 50,
      startTime: testRun.createdAt.toISOString(),
      duration: Math.floor((new Date().getTime() - testRun.createdAt.getTime()) / 1000),
      findings: testRun.results?.map((result: any) => ({
        type: result.metadata?.type || 'info',
        title: result.metadata?.title || 'Finding',
        description: result.response || '',
        severity: result.metadata?.severity || 'info',
        timestamp: result.createdAt.toISOString(),
      })) || [],
      logs: [
        {
          timestamp: this.formatTime(testRun.createdAt),
          level: 'info',
          message: `Execution loaded from database (${testRun.status})`,
        },
      ],
    };
  }
}
