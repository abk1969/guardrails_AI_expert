import { Injectable, Logger } from '@nestjs/common';
import Docker from 'dockerode';
import { HealthCheckerService } from './health-checker.service';
import { VersionManagerService } from '../version-manager/version-manager.service';
import { ToolName } from '../webhooks/webhook-handler';

@Injectable()
export class BlueGreenDeployerService {
  private readonly logger = new Logger(BlueGreenDeployerService.name);
  private docker: Docker;

  constructor(
    private healthChecker: HealthCheckerService,
    private versionManager: VersionManagerService,
  ) {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  /**
   * Deploy to staging environment
   */
  async deployToStaging(tool: ToolName, newImage: string): Promise<void> {
    const serviceName = `${tool}-service`;

    this.logger.log(`Deploying ${tool} to staging with image ${newImage}`);

    // Stop and remove existing staging container
    await this.removeContainerByName(`${serviceName}-staging`);

    // Create and start staging container
    const container = await this.docker.createContainer({
      name: `${serviceName}-staging`,
      Image: newImage,
      Labels: {
        service: serviceName,
        env: 'staging',
        tool: tool,
      },
      ExposedPorts: {
        '3000/tcp': {},
      },
      HostConfig: {
        PortBindings: {
          '3000/tcp': [{ HostPort: '0' }], // Dynamic port
        },
        RestartPolicy: {
          Name: 'no', // Don't restart staging containers
        },
        NetworkMode: 'tools-network',
      },
      Env: [
        'NODE_ENV=staging',
        `SERVICE_NAME=${tool}`,
      ],
    });

    await container.start();

    // Wait for container to be healthy
    const isHealthy = await this.healthChecker.waitForHealthy(
      container.id,
      60000, // 1 minute timeout
    );

    if (!isHealthy) {
      await container.stop();
      await container.remove();
      throw new Error('Staging container failed health check');
    }

    this.logger.log(`✅ Staging deployment successful for ${tool}`);
  }

  /**
   * Deploy to production using blue-green strategy
   */
  async deployToProduction(tool: ToolName, newImage: string): Promise<void> {
    const serviceName = `${tool}-service`;

    this.logger.log(`Starting blue-green deployment for ${tool}`);

    // 1. Identify current color (blue or green)
    const currentContainers = await this.docker.listContainers({
      filters: {
        label: [`service=${serviceName}`, 'env=production'],
      },
    });

    const currentColor =
      currentContainers.length > 0 &&
      currentContainers[0].Labels['color']
        ? currentContainers[0].Labels['color']
        : 'blue';

    const newColor = currentColor === 'blue' ? 'green' : 'blue';

    this.logger.log(
      `Current color: ${currentColor}, deploying to: ${newColor}`,
    );

    // 2. Create new container with new image
    const newContainer = await this.docker.createContainer({
      name: `${serviceName}-${newColor}`,
      Image: newImage,
      Labels: {
        service: serviceName,
        env: 'production',
        color: newColor,
        tool: tool,
      },
      ExposedPorts: {
        '3000/tcp': {},
      },
      HostConfig: {
        PortBindings: {
          '3000/tcp': [{ HostPort: '0' }], // Dynamic port
        },
        RestartPolicy: {
          Name: 'always',
        },
        NetworkMode: 'tools-network',
      },
      Env: [
        'NODE_ENV=production',
        `SERVICE_NAME=${tool}`,
        `COLOR=${newColor}`,
      ],
    });

    await newContainer.start();

    // 3. Wait for new container to be healthy
    const isHealthy = await this.healthChecker.waitForHealthy(
      newContainer.id,
      60000, // 1 minute
    );

    if (!isHealthy) {
      this.logger.error('New container failed health check, cleaning up');
      await newContainer.stop();
      await newContainer.remove();
      throw new Error('New container failed health check');
    }

    // 4. Update load balancer (Nginx/Traefik) to point to new container
    await this.updateLoadBalancer(serviceName, newColor);

    // 5. Warm-up period (30 seconds)
    this.logger.log('Waiting 30 seconds for warm-up...');
    await this.sleep(30000);

    // 6. Check error rate
    const errorRate = await this.checkErrorRate(serviceName, newColor);
    if (errorRate > 5) {
      // More than 5% errors, rollback
      this.logger.error(
        `High error rate detected: ${errorRate}%, rolling back`,
      );

      // Switch load balancer back to old color
      await this.updateLoadBalancer(serviceName, currentColor);

      // Stop and remove new container
      await newContainer.stop();
      await newContainer.remove();

      throw new Error(`High error rate detected: ${errorRate}%`);
    }

    // 7. Success! Stop old containers
    this.logger.log('Deployment successful, removing old containers');

    for (const oldContainer of currentContainers) {
      const container = this.docker.getContainer(oldContainer.Id);
      try {
        await container.stop({ t: 30 }); // 30 seconds grace period
        await container.remove();
        this.logger.log(`Removed old container: ${oldContainer.Id}`);
      } catch (error) {
        this.logger.warn(
          `Failed to remove old container ${oldContainer.Id}:`,
          error,
        );
      }
    }

    this.logger.log(
      `✅ Blue-green deployment completed: ${tool} → ${newColor}`,
    );
  }

  /**
   * Rollback to previous version
   */
  async rollback(tool: ToolName): Promise<void> {
    const serviceName = `${tool}-service`;

    this.logger.log(`Rolling back ${tool} to previous version`);

    // 1. Get previous version from database
    const previousVersion = await this.versionManager.getPreviousVersion(tool);

    if (!previousVersion) {
      throw new Error(`No previous version found for ${tool}`);
    }

    this.logger.log(
      `Rolling back ${tool} to version ${previousVersion.version} (image: ${previousVersion.imageName})`,
    );

    // 2. Redeploy previous version
    await this.deployToProduction(tool, previousVersion.imageName);

    this.logger.log(`✅ Rollback completed for ${tool}`);
  }

  /**
   * Update load balancer configuration to point to new container
   */
  private async updateLoadBalancer(
    service: string,
    color: string,
  ): Promise<void> {
    // In production, this would update Nginx/Traefik configuration
    // For now, we log the action
    this.logger.log(
      `Updating load balancer: ${service} → ${color} containers`,
    );

    // Example: Update Nginx upstream configuration
    // Or use Traefik labels for automatic discovery
  }

  /**
   * Check error rate from Prometheus metrics
   */
  private async checkErrorRate(
    service: string,
    color: string,
  ): Promise<number> {
    // Query Prometheus for error rate
    // For now, return 0 (no errors)
    // In production, use actual Prometheus query

    // Example query:
    // rate(http_requests_total{service="promptfoo-service",color="green",status=~"5.."}[1m])
    // / rate(http_requests_total{service="promptfoo-service",color="green"}[1m]) * 100

    this.logger.debug(`Checking error rate for ${service} (${color})`);

    return 0; // Placeholder
  }

  /**
   * Remove container by name (if exists)
   */
  private async removeContainerByName(name: string): Promise<void> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      const container = containers.find((c) =>
        c.Names.some((n) => n === `/${name}`),
      );

      if (container) {
        const containerObj = this.docker.getContainer(container.Id);
        if (container.State === 'running') {
          await containerObj.stop();
        }
        await containerObj.remove();
        this.logger.debug(`Removed container: ${name}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to remove container ${name}:`, error.message);
    }
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
