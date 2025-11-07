import { Injectable, Logger } from '@nestjs/common';
import * as Docker from 'dockerode';

@Injectable()
export class ImageRegistryService {
  private readonly logger = new Logger(ImageRegistryService.name);
  private readonly docker: Docker;
  private readonly registry: string;

  constructor() {
    this.docker = new Docker({
      socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock',
    });
    this.registry = process.env.DOCKER_REGISTRY || 'registry.gitlab.com';
  }

  async push(imageName: string): Promise<void> {
    this.logger.log(`Pushing image ${imageName} to registry ${this.registry}...`);

    try {
      const image = this.docker.getImage(imageName);

      // Tag for registry if not already tagged
      const registryImageName = this.getRegistryImageName(imageName);
      if (registryImageName !== imageName) {
        await image.tag({
          repo: registryImageName.split(':')[0],
          tag: registryImageName.split(':')[1] || 'latest',
        });
      }

      // Push to registry
      const pushStream = await image.push({
        tag: registryImageName.split(':')[1] || 'latest',
      });

      // Wait for push to complete
      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(
          pushStream,
          (err, output) => {
            if (err) {
              reject(err);
            } else {
              resolve(output);
            }
          },
          (event) => {
            if (event.status) {
              this.logger.debug(`${event.status}: ${event.progress || ''}`);
            }
            if (event.error) {
              this.logger.error(event.error);
            }
          },
        );
      });

      this.logger.log(`✅ Successfully pushed ${registryImageName}`);
    } catch (error) {
      this.logger.error(`❌ Failed to push image: ${error.message}`, error.stack);
      throw error;
    }
  }

  async pull(imageName: string): Promise<void> {
    this.logger.log(`Pulling image ${imageName} from registry...`);

    try {
      const registryImageName = this.getRegistryImageName(imageName);

      const pullStream = await this.docker.pull(registryImageName);

      // Wait for pull to complete
      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(
          pullStream,
          (err, output) => {
            if (err) {
              reject(err);
            } else {
              resolve(output);
            }
          },
          (event) => {
            if (event.status) {
              this.logger.debug(`${event.status}: ${event.progress || ''}`);
            }
          },
        );
      });

      this.logger.log(`✅ Successfully pulled ${registryImageName}`);
    } catch (error) {
      this.logger.error(`❌ Failed to pull image: ${error.message}`, error.stack);
      throw error;
    }
  }

  async listTags(repository: string): Promise<string[]> {
    // This would require registry API integration
    // For now, return local tags
    const images = await this.docker.listImages({
      filters: { reference: [repository] },
    });

    const tags: string[] = [];
    for (const image of images) {
      if (image.RepoTags) {
        tags.push(...image.RepoTags);
      }
    }

    return tags;
  }

  async deleteTag(imageName: string): Promise<void> {
    this.logger.log(`Deleting tag ${imageName} from registry...`);

    // This would require registry API integration
    // For now, just remove local image
    const image = this.docker.getImage(imageName);
    await image.remove({ force: false });

    this.logger.log(`✅ Deleted ${imageName}`);
  }

  private getRegistryImageName(imageName: string): string {
    // If image already has registry prefix, return as-is
    if (imageName.includes('/') && imageName.split('/').length >= 3) {
      return imageName;
    }

    // Add registry prefix
    return `${this.registry}/${imageName}`;
  }

  getRegistryUrl(): string {
    return this.registry;
  }
}
