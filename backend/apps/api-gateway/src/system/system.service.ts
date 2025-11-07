import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { SystemHealthDto, ToolCheckDto } from './dto/system-health.dto';

const execAsync = promisify(exec);

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  /**
   * Check Python version
   */
  private async checkPython(): Promise<ToolCheckDto> {
    try {
      const { stdout } = await execAsync('python --version');
      const versionMatch = stdout.match(/Python (\d+\.\d+\.\d+)/);

      if (!versionMatch) {
        return {
          version: 'unknown',
          ok: false,
          required: true,
          error: 'Could not parse Python version',
        };
      }

      const version = versionMatch[1];
      const [major, minor] = version.split('.').map(Number);

      const ok = major >= 3 && minor >= 9;

      return {
        version,
        ok,
        required: true,
        error: ok ? undefined : 'Python 3.9+ required',
      };
    } catch (error) {
      this.logger.error('Python check failed:', error.message);
      return {
        version: 'not found',
        ok: false,
        required: true,
        error: 'Python not found in PATH',
      };
    }
  }

  /**
   * Check pipx
   */
  private async checkPipx(): Promise<ToolCheckDto> {
    try {
      const { stdout } = await execAsync('pipx --version');
      const version = stdout.trim();

      return {
        version,
        ok: true,
        required: true,
      };
    } catch (error) {
      this.logger.error('pipx check failed:', error.message);
      return {
        version: 'not found',
        ok: false,
        required: true,
        error: 'pipx not found. Install with: python -m pip install --user pipx',
      };
    }
  }

  /**
   * Check Garak
   */
  private async checkGarak(): Promise<ToolCheckDto> {
    try {
      const { stdout, stderr } = await execAsync('garak --version');
      const output = stdout || stderr;
      const version = output.trim() || 'installed';

      return {
        version,
        ok: true,
        required: true,
      };
    } catch (error) {
      this.logger.error('Garak check failed:', error.message);
      return {
        version: 'not found',
        ok: false,
        required: true,
        error: 'Garak not found. Install with: pipx install garak',
      };
    }
  }

  /**
   * Check Strix
   */
  private async checkStrix(): Promise<ToolCheckDto> {
    try {
      const { stdout, stderr } = await execAsync('strix --version');
      const output = stdout || stderr;
      const version = output.trim() || 'installed';

      return {
        version,
        ok: true,
        required: true,
      };
    } catch (error) {
      this.logger.error('Strix check failed:', error.message);
      return {
        version: 'not found',
        ok: false,
        required: true,
        error: 'Strix not found. Install with: pipx install strix-agent',
      };
    }
  }

  /**
   * Check Node.js version
   */
  private async checkNode(): Promise<ToolCheckDto> {
    try {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim().replace('v', '');
      const [major] = version.split('.').map(Number);

      const ok = major >= 18;

      return {
        version,
        ok,
        required: true,
        error: ok ? undefined : 'Node.js 18+ required',
      };
    } catch (error) {
      this.logger.error('Node.js check failed:', error.message);
      return {
        version: 'not found',
        ok: false,
        required: true,
        error: 'Node.js not found in PATH',
      };
    }
  }

  /**
   * Check Promptfoo
   */
  private async checkPromptfoo(): Promise<ToolCheckDto> {
    try {
      // Promptfoo is run via npx, just check if npx is available
      const { stdout } = await execAsync('npx promptfoo@latest --version', {
        timeout: 10000,
      });
      const version = stdout.trim();

      return {
        version,
        ok: true,
        required: true,
      };
    } catch (error) {
      this.logger.error('Promptfoo check failed:', error.message);
      return {
        version: 'not found',
        ok: false,
        required: true,
        error: 'Promptfoo not available via npx. Ensure Node.js and npm are installed.',
      };
    }
  }

  /**
   * Check Docker
   */
  private async checkDocker(): Promise<ToolCheckDto> {
    try {
      // Check Docker CLI
      const { stdout } = await execAsync('docker --version');
      const versionMatch = stdout.match(/Docker version ([\d.]+)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';

      // Check if Docker daemon is running
      try {
        await execAsync('docker ps', { timeout: 5000 });

        return {
          version,
          ok: true,
          required: true,
        };
      } catch (daemonError) {
        return {
          version,
          ok: false,
          required: true,
          error: 'Docker daemon is not running. Please start Docker.',
        };
      }
    } catch (error) {
      this.logger.error('Docker check failed:', error.message);
      return {
        version: 'not found',
        ok: false,
        required: true,
        error: 'Docker not found. Docker is REQUIRED for isolated execution.',
      };
    }
  }

  /**
   * Get overall system health
   */
  async getSystemHealth(): Promise<SystemHealthDto> {
    this.logger.log('Performing system health check...');

    try {
      // Run all checks in parallel
      const [python, pipx, garak, strix, node, promptfoo, docker] =
        await Promise.all([
          this.checkPython(),
          this.checkPipx(),
          this.checkGarak(),
          this.checkStrix(),
          this.checkNode(),
          this.checkPromptfoo(),
          this.checkDocker(),
        ]);

      // Collect missing dependencies
      const missingDependencies: string[] = [];
      const checks = { python, pipx, garak, strix, node, promptfoo, docker };

      for (const [tool, check] of Object.entries(checks)) {
        if (!check.ok) {
          missingDependencies.push(tool);
        }
      }

      // Determine overall status
      let status: 'healthy' | 'degraded' | 'unhealthy';

      if (missingDependencies.length === 0) {
        status = 'healthy';
      } else if (missingDependencies.includes('docker')) {
        // Docker is REQUIRED - unhealthy if missing
        status = 'unhealthy';
      } else if (missingDependencies.length >= 3) {
        status = 'unhealthy';
      } else {
        status = 'degraded';
      }

      // Generate recommendations
      let recommendations = '';
      if (missingDependencies.length > 0) {
        recommendations =
          'Run the installation script to install missing dependencies:\n';
        if (process.platform === 'win32') {
          recommendations += '  .\\backend\\scripts\\install-pentest-tools.ps1';
        } else {
          recommendations += '  ./backend/scripts/install-pentest-tools.sh';
        }
      }

      const result: SystemHealthDto = {
        status,
        python,
        pipx,
        garak,
        strix,
        node,
        promptfoo,
        docker,
        timestamp: new Date().toISOString(),
        missingDependencies:
          missingDependencies.length > 0 ? missingDependencies : undefined,
        recommendations: recommendations || undefined,
      };

      this.logger.log(`System health check completed: ${status}`);
      if (missingDependencies.length > 0) {
        this.logger.warn(`Missing dependencies: ${missingDependencies.join(', ')}`);
      }

      return result;
    } catch (error) {
      this.logger.error('System health check failed:', error);
      throw error;
    }
  }
}
