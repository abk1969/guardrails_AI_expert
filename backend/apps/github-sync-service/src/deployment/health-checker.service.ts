import { Injectable, Logger } from '@nestjs/common';
import Docker from 'dockerode';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HealthCheckerService {
  private readonly logger = new Logger(HealthCheckerService.name);
  private docker: Docker;

  constructor(private httpService: HttpService) {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  /**
   * Wait for container to be healthy
   * @param containerId - Docker container ID
   * @param timeout - Timeout in milliseconds
   * @returns true if container becomes healthy within timeout
   */
  async waitForHealthy(
    containerId: string,
    timeout: number = 60000,
  ): Promise<boolean> {
    const start = Date.now();
    const container = this.docker.getContainer(containerId);

    while (Date.now() - start < timeout) {
      try {
        const inspect = await container.inspect();

        // Check Docker health check status (if configured)
        if (inspect.State.Health) {
          if (inspect.State.Health.Status === 'healthy') {
            this.logger.log(`Container ${containerId} is healthy`);
            return true;
          }

          if (inspect.State.Health.Status === 'unhealthy') {
            this.logger.error(`Container ${containerId} is unhealthy`);
            return false;
          }
        }

        // Check if container is running
        if (!inspect.State.Running) {
          this.logger.error(`Container ${containerId} is not running`);
          return false;
        }

        // If no health check configured, try HTTP endpoint
        const port = await this.getContainerPort(container);
        if (port) {
          const isHealthy = await this.checkHttpHealth(port);
          if (isHealthy) {
            this.logger.log(`Container ${containerId} HTTP health check passed`);
            return true;
          }
        }
      } catch (error) {
        this.logger.warn(`Health check error for ${containerId}:`, error.message);
      }

      // Wait 2 seconds before next check
      await this.sleep(2000);
    }

    this.logger.error(`Container ${containerId} health check timeout`);
    return false;
  }

  /**
   * Get container's exposed port on host
   */
  private async getContainerPort(
    container: Docker.Container,
  ): Promise<number | null> {
    try {
      const inspect = await container.inspect();
      const ports = inspect.NetworkSettings.Ports;

      if (ports && ports['3000/tcp']) {
        const hostPort = ports['3000/tcp'][0]?.HostPort;
        return hostPort ? parseInt(hostPort, 10) : null;
      }
    } catch (error) {
      this.logger.warn('Failed to get container port:', error.message);
    }

    return null;
  }

  /**
   * Check HTTP health endpoint
   */
  private async checkHttpHealth(port: number): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://localhost:${port}/health`, {
          timeout: 5000,
        }),
      );

      return response.status === 200 && response.data.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
