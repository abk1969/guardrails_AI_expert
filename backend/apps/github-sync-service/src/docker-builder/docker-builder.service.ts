import { Injectable, Logger } from '@nestjs/common';
import * as Docker from 'dockerode';
import { DockerfileGenerator } from './dockerfile-generator';
import { ImageRegistryService } from './image-registry.service';

type ToolName = 'promptfoo' | 'garak';

interface BuildResult {
  success: boolean;
  imageName: string;
  imageId?: string;
  buildLogs?: string[];
  error?: string;
}

@Injectable()
export class DockerBuilderService {
  private readonly logger = new Logger(DockerBuilderService.name);
  private readonly docker: Docker;

  constructor(
    private readonly dockerfileGenerator: DockerfileGenerator,
    private readonly imageRegistry: ImageRegistryService,
  ) {
    this.docker = new Docker({
      socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock',
    });
  }

  async buildImage(
    tool: ToolName,
    repositoryPath: string,
    version: string,
  ): Promise<BuildResult> {
    this.logger.log(`Building Docker image for ${tool} v${version}...`);

    try {
      // Generate Dockerfile
      const dockerfile = await this.dockerfileGenerator.generate(tool, repositoryPath);

      // Build image
      const imageName = `airiskmgr/${tool}-service:${version}`;
      const buildStream = await this.docker.buildImage(
        {
          context: repositoryPath,
          src: ['Dockerfile', '.'],
        },
        {
          t: imageName,
          labels: {
            'tool': tool,
            'version': version,
            'built-at': new Date().toISOString(),
          },
          buildargs: {
            VERSION: version,
          },
        },
      );

      // Collect build logs
      const buildLogs: string[] = [];
      await new Promise((resolve, reject) => {
        this.docker.modem.followProgress(
          buildStream,
          (err, output) => {
            if (err) {
              reject(err);
            } else {
              resolve(output);
            }
          },
          (event) => {
            if (event.stream) {
              buildLogs.push(event.stream.trim());
              this.logger.debug(event.stream.trim());
            }
            if (event.error) {
              this.logger.error(event.error);
            }
          },
        );
      });

      // Get image ID
      const image = this.docker.getImage(imageName);
      const inspect = await image.inspect();

      this.logger.log(`✅ Successfully built ${imageName} (ID: ${inspect.Id.substring(0, 12)})`);

      return {
        success: true,
        imageName,
        imageId: inspect.Id,
        buildLogs,
      };
    } catch (error) {
      this.logger.error(`❌ Failed to build image for ${tool}: ${error.message}`, error.stack);
      return {
        success: false,
        imageName: `airiskmgr/${tool}-service:${version}`,
        error: error.message,
      };
    }
  }

  async tagImage(imageName: string, newTag: string): Promise<void> {
    this.logger.log(`Tagging image ${imageName} as ${newTag}...`);

    const image = this.docker.getImage(imageName);
    await image.tag({ repo: newTag.split(':')[0], tag: newTag.split(':')[1] });

    this.logger.log(`✅ Tagged ${imageName} as ${newTag}`);
  }

  async pushImage(imageName: string): Promise<void> {
    this.logger.log(`Pushing image ${imageName} to registry...`);

    await this.imageRegistry.push(imageName);

    this.logger.log(`✅ Pushed ${imageName} to registry`);
  }

  async removeOldImages(tool: ToolName, keepCount: number = 5): Promise<void> {
    this.logger.log(`Cleaning up old images for ${tool}, keeping last ${keepCount}...`);

    try {
      const images = await this.docker.listImages({
        filters: { label: [`tool=${tool}`] },
      });

      // Sort by creation date (newest first)
      images.sort((a, b) => b.Created - a.Created);

      // Remove old images (keep only last `keepCount`)
      const imagesToRemove = images.slice(keepCount);

      for (const imageInfo of imagesToRemove) {
        try {
          const image = this.docker.getImage(imageInfo.Id);
          await image.remove({ force: false });
          this.logger.log(`Removed old image ${imageInfo.Id.substring(0, 12)}`);
        } catch (error) {
          this.logger.warn(`Failed to remove image ${imageInfo.Id}: ${error.message}`);
        }
      }

      this.logger.log(`✅ Cleanup complete for ${tool}`);
    } catch (error) {
      this.logger.error(`Failed to cleanup old images for ${tool}: ${error.message}`);
    }
  }

  async getImageSize(imageName: string): Promise<number> {
    const image = this.docker.getImage(imageName);
    const inspect = await image.inspect();
    return inspect.Size;
  }

  async listImages(tool?: ToolName): Promise<Array<{ id: string; tags: string[]; size: number; created: Date }>> {
    const filters = tool ? { label: [`tool=${tool}`] } : {};
    const images = await this.docker.listImages({ filters });

    return images.map(image => ({
      id: image.Id.substring(0, 12),
      tags: image.RepoTags || [],
      size: image.Size,
      created: new Date(image.Created * 1000),
    }));
  }
}
