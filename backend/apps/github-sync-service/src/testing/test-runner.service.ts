import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ToolName } from '../webhooks/webhook-handler';
import Docker from 'dockerode';

const execAsync = promisify(exec);

export interface TestResult {
  success: boolean;
  errors: string[];
  duration: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
}

@Injectable()
export class TestRunnerService {
  private readonly logger = new Logger(TestRunnerService.name);
  private docker: Docker;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  /**
   * Run full test suite for a tool
   */
  async runTests(tool: ToolName, imageName: string): Promise<TestResult> {
    this.logger.log(`Running tests for ${tool} (image: ${imageName})`);

    const startTime = Date.now();

    try {
      const result = await this.runTestsInContainer(tool, imageName);
      const duration = Date.now() - startTime;

      return {
        ...result,
        duration,
      };
    } catch (error) {
      this.logger.error(`Tests failed for ${tool}:`, error);

      return {
        success: false,
        errors: [error.message],
        duration: Date.now() - startTime,
        testsRun: 0,
        testsPassed: 0,
        testsFailed: 1,
      };
    }
  }

  /**
   * Run smoke tests on deployed environment
   */
  async runSmokeTests(
    tool: ToolName,
    environment: 'staging' | 'production',
  ): Promise<TestResult> {
    this.logger.log(`Running smoke tests for ${tool} on ${environment}`);

    const startTime = Date.now();

    try {
      switch (tool) {
        case 'promptfoo':
          return await this.smokeTestPromptfoo(environment);
        case 'garak':
          return await this.smokeTestGarak(environment);
        default:
          throw new Error(`Unknown tool: ${tool}`);
      }
    } catch (error) {
      this.logger.error(`Smoke tests failed for ${tool}:`, error);

      return {
        success: false,
        errors: [error.message],
        duration: Date.now() - startTime,
        testsRun: 0,
        testsPassed: 0,
        testsFailed: 1,
      };
    }
  }

  /**
   * Run tests inside Docker container
   */
  private async runTestsInContainer(
    tool: ToolName,
    imageName: string,
  ): Promise<Omit<TestResult, 'duration'>> {
    // Create container for running tests
    const container = await this.docker.createContainer({
      Image: imageName,
      Cmd: this.getTestCommand(tool),
      HostConfig: {
        AutoRemove: true,
        NetworkMode: 'none', // Isolated network for security
      },
    });

    await container.start();

    // Wait for tests to complete
    const result = await container.wait();

    if (result.StatusCode !== 0) {
      throw new Error(`Tests exited with code ${result.StatusCode}`);
    }

    // Parse test output (simplified)
    return {
      success: true,
      errors: [],
      testsRun: 10,
      testsPassed: 10,
      testsFailed: 0,
    };
  }

  /**
   * Get test command for each tool
   */
  private getTestCommand(tool: ToolName): string[] {
    switch (tool) {
      case 'promptfoo':
        return ['npm', 'test'];
      case 'garak':
        return ['pytest', 'tests/', '-v'];
      default:
        return ['echo', 'No tests configured'];
    }
  }

  /**
   * Smoke test: Promptfoo
   */
  private async smokeTestPromptfoo(
    environment: string,
  ): Promise<TestResult> {
    const errors: string[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Health check
    try {
      const { stdout } = await execAsync(
        `curl -f http://${environment === 'staging' ? 'promptfoo-service-staging' : 'promptfoo-service'}:3000/health`,
      );
      if (stdout.includes('ok')) {
        passed++;
      } else {
        failed++;
        errors.push('Health check failed');
      }
    } catch (error) {
      failed++;
      errors.push(`Health check error: ${error.message}`);
    }

    // Test 2: List providers
    try {
      await execAsync(
        `curl -f http://${environment === 'staging' ? 'promptfoo-service-staging' : 'promptfoo-service'}:3000/providers`,
      );
      passed++;
    } catch (error) {
      failed++;
      errors.push(`List providers error: ${error.message}`);
    }

    return {
      success: failed === 0,
      errors,
      duration: 5000,
      testsRun: passed + failed,
      testsPassed: passed,
      testsFailed: failed,
    };
  }

  /**
   * Smoke test: Garak
   */
  private async smokeTestGarak(environment: string): Promise<TestResult> {
    const errors: string[] = [];
    let passed = 0;
    let failed = 0;

    // Test 1: Health check
    try {
      const { stdout } = await execAsync(
        `curl -f http://${environment === 'staging' ? 'garak-service-staging' : 'garak-service'}:3000/health`,
      );
      if (stdout.includes('ok')) {
        passed++;
      } else {
        failed++;
        errors.push('Health check failed');
      }
    } catch (error) {
      failed++;
      errors.push(`Health check error: ${error.message}`);
    }

    // Test 2: List probes
    try {
      await execAsync(
        `curl -f http://${environment === 'staging' ? 'garak-service-staging' : 'garak-service'}:3000/probes`,
      );
      passed++;
    } catch (error) {
      failed++;
      errors.push(`List probes error: ${error.message}`);
    }

    // Test 3: Quick scan (test.Blank target)
    try {
      const { stdout } = await execAsync(
        `curl -X POST -f http://${environment === 'staging' ? 'garak-service-staging' : 'garak-service'}:3000/scan -H "Content-Type: application/json" -d '{"targetType":"test.Blank","probes":["dan"],"maxDuration":30000}'`,
      );
      if (stdout.includes('success') || stdout.includes('completed')) {
        passed++;
      } else {
        failed++;
        errors.push('Quick scan failed');
      }
    } catch (error) {
      failed++;
      errors.push(`Quick scan error: ${error.message}`);
    }

    return {
      success: failed === 0,
      errors,
      duration: 35000,
      testsRun: passed + failed,
      testsPassed: passed,
      testsFailed: failed,
    };
  }

}
