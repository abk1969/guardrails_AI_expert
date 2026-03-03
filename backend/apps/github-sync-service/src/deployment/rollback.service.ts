import { Injectable, Logger } from '@nestjs/common';
import * as Docker from 'dockerode';

type ToolName = 'promptfoo' | 'garak';

interface RollbackHistory {
  tool: ToolName;
  currentVersion: string;
  previousVersion: string;
  timestamp: Date;
}

@Injectable()
export class RollbackService {
  private readonly logger = new Logger(RollbackService.name);
  private readonly docker: Docker;
  private readonly rollbackHistory: Map<ToolName, RollbackHistory[]> = new Map();

  constructor() {
    this.docker = new Docker({
      socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock',
    });
  }

  async rollback(tool: ToolName): Promise<{ success: boolean; message: string; version?: string }> {
    this.logger.warn(`Initiating rollback for ${tool}...`);

    try {
      // Get current active color
      const currentColor = await this.getCurrentColor(tool);
      const targetColor = currentColor === 'blue' ? 'green' : 'blue';

      this.logger.log(`Current color: ${currentColor}, rolling back to: ${targetColor}`);

      // Get previous container
      const serviceName = `${tool}-service`;
      const previousContainer = await this.docker.getContainer(`${serviceName}-${targetColor}`);

      // Check if previous container exists
      const inspect = await previousContainer.inspect();
      if (!inspect) {
        throw new Error(`Previous container ${serviceName}-${targetColor} not found`);
      }

      // Start previous container if not running
      if (!inspect.State.Running) {
        this.logger.log(`Starting previous container ${serviceName}-${targetColor}...`);
        await previousContainer.start();

        // Wait for health check
        await this.waitForHealthy(previousContainer, 60000);
      }

      // Update environment variable to switch color
      process.env.COLOR = targetColor;

      // Stop current container
      const currentContainer = await this.docker.getContainer(`${serviceName}-${currentColor}`);
      this.logger.log(`Stopping current container ${serviceName}-${currentColor}...`);
      await currentContainer.stop();

      // Record rollback
      const previousVersion = inspect.Config.Labels['version'] || 'unknown';
      this.recordRollback(tool, 'current', previousVersion);

      this.logger.log(`✅ Rollback successful for ${tool} to version ${previousVersion}`);

      return {
        success: true,
        message: `Rolled back ${tool} to previous version (${targetColor} container)`,
        version: previousVersion,
      };
    } catch (error) {
      this.logger.error(`❌ Rollback failed for ${tool}: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Rollback failed: ${error.message}`,
      };
    }
  }

  private async getCurrentColor(tool: ToolName): Promise<'blue' | 'green'> {
    // Check environment variable first
    const envColor = process.env.COLOR;
    if (envColor === 'blue' || envColor === 'green') {
      return envColor;
    }

    // Fallback: check which container is running
    const serviceName = `${tool}-service`;
    const containers = await this.docker.listContainers();

    for (const container of containers) {
      if (container.Names.some(name => name.includes(`${serviceName}-blue`))) {
        return 'blue';
      }
      if (container.Names.some(name => name.includes(`${serviceName}-green`))) {
        return 'green';
      }
    }

    return 'blue'; // Default
  }

  private async waitForHealthy(container: Docker.Container, timeout: number): Promise<boolean> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const inspect = await container.inspect();

      if (inspect.State.Health?.Status === 'healthy') {
        return true;
      }

      if (inspect.State.Health?.Status === 'unhealthy') {
        throw new Error('Container became unhealthy');
      }

      await this.sleep(2000);
    }

    throw new Error('Health check timeout');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private recordRollback(tool: ToolName, currentVersion: string, previousVersion: string): void {
    if (!this.rollbackHistory.has(tool)) {
      this.rollbackHistory.set(tool, []);
    }

    this.rollbackHistory.get(tool)!.push({
      tool,
      currentVersion,
      previousVersion,
      timestamp: new Date(),
    });

    // Keep only last 10 rollback records
    const history = this.rollbackHistory.get(tool)!;
    if (history.length > 10) {
      history.shift();
    }
  }

  getRollbackHistory(tool?: ToolName): RollbackHistory[] {
    if (tool) {
      return this.rollbackHistory.get(tool) || [];
    }

    // Return all history
    const allHistory: RollbackHistory[] = [];
    this.rollbackHistory.forEach(history => {
      allHistory.push(...history);
    });

    return allHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}
