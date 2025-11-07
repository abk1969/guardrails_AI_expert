import { Injectable, Logger } from '@nestjs/common';
import { spawn, ChildProcess } from 'child_process';

/**
 * Docker Executor Service
 * Executes commands inside isolated Docker containers for security testing tools
 * Supports: Garak, Strix, Promptfoo
 */
@Injectable()
export class DockerExecutorService {
  private readonly logger = new Logger(DockerExecutorService.name);

  /**
   * Execute command in Docker container using docker exec
   * @param containerName - Name of the Docker container (e.g., 'airiskmgr-garak-runner')
   * @param command - Command to execute (e.g., ['garak', '--help'])
   * @param options - Execution options
   * @returns ChildProcess for interactive control
   */
  executeInContainer(
    containerName: string,
    command: string[],
    options: {
      workingDir?: string;
      env?: Record<string, string>;
      user?: string;
    } = {},
  ): ChildProcess {
    this.logger.log(`Executing in container ${containerName}: ${command.join(' ')}`);

    // Build docker exec command
    const dockerArgs: string[] = ['exec'];

    // Add working directory if specified
    if (options.workingDir) {
      dockerArgs.push('-w', options.workingDir);
    }

    // Add user if specified
    if (options.user) {
      dockerArgs.push('-u', options.user);
    }

    // Add environment variables
    if (options.env) {
      Object.entries(options.env).forEach(([key, value]) => {
        dockerArgs.push('-e', `${key}=${value}`);
      });
    }

    // Interactive mode for process control
    dockerArgs.push('-i');

    // Add container name
    dockerArgs.push(containerName);

    // Add command
    dockerArgs.push(...command);

    this.logger.debug(`Docker command: docker ${dockerArgs.join(' ')}`);

    // Spawn docker exec process
    const process = spawn('docker', dockerArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Log process events
    process.on('error', (error) => {
      this.logger.error(`Docker exec error for ${containerName}:`, error);
    });

    process.on('exit', (code, signal) => {
      this.logger.log(
        `Docker exec for ${containerName} exited with code ${code}, signal ${signal}`,
      );
    });

    return process;
  }

  /**
   * Check if Docker is available
   */
  async isDockerAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const process = spawn('docker', ['--version']);

      process.on('close', (code) => {
        resolve(code === 0);
      });

      process.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Check if container is running
   */
  async isContainerRunning(containerName: string): Promise<boolean> {
    return new Promise((resolve) => {
      const process = spawn('docker', [
        'inspect',
        '-f',
        '{{.State.Running}}',
        containerName,
      ]);

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          resolve(false);
        } else {
          resolve(output.trim() === 'true');
        }
      });

      process.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Send signal to process running in container
   */
  async sendSignalToContainer(
    containerName: string,
    pid: number,
    signal: string,
  ): Promise<void> {
    this.logger.log(`Sending signal ${signal} to PID ${pid} in ${containerName}`);

    return new Promise((resolve, reject) => {
      const process = spawn('docker', [
        'exec',
        containerName,
        'kill',
        `-${signal}`,
        pid.toString(),
      ]);

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to send signal ${signal} to PID ${pid}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Copy file from container to host
   */
  async copyFromContainer(
    containerName: string,
    containerPath: string,
    hostPath: string,
  ): Promise<void> {
    this.logger.log(`Copying ${containerPath} from ${containerName} to ${hostPath}`);

    return new Promise((resolve, reject) => {
      const process = spawn('docker', [
        'cp',
        `${containerName}:${containerPath}`,
        hostPath,
      ]);

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to copy file from container`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Copy file from host to container
   */
  async copyToContainer(
    hostPath: string,
    containerName: string,
    containerPath: string,
  ): Promise<void> {
    this.logger.log(`Copying ${hostPath} to ${containerName}:${containerPath}`);

    return new Promise((resolve, reject) => {
      const process = spawn('docker', [
        'cp',
        hostPath,
        `${containerName}:${containerPath}`,
      ]);

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to copy file to container`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Get container logs
   */
  async getContainerLogs(
    containerName: string,
    tail: number = 100,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('docker', [
        'logs',
        '--tail',
        tail.toString(),
        containerName,
      ]);

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Failed to get logs from ${containerName}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }
}
