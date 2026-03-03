import { Injectable, Logger } from '@nestjs/common';
import { SignatureValidator } from './signature-validator';
import { VersionManagerService } from '../version-manager/version-manager.service';
import { DockerBuilderService } from '../docker-builder/docker-builder.service';
import { TestRunnerService } from '../testing/test-runner.service';
import { BlueGreenDeployerService } from '../deployment/blue-green-deployer.service';
import { SlackNotifierService } from '../notifications/slack-notifier.service';
import * as path from 'path';
import * as fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitHubWebhookPayload {
  ref: string;
  repository: {
    full_name: string;
    clone_url: string;
    name: string;
  };
  commits: Array<{
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
    };
  }>;
  pusher: {
    name: string;
    email: string;
  };
}

export type ToolName = 'promptfoo' | 'garak';

@Injectable()
export class WebhookHandler {
  private readonly logger = new Logger(WebhookHandler.name);

  constructor(
    private signatureValidator: SignatureValidator,
    private versionManager: VersionManagerService,
    private dockerBuilder: DockerBuilderService,
    private testRunner: TestRunnerService,
    private deployer: BlueGreenDeployerService,
    private notifier: SlackNotifierService,
  ) {}

  /**
   * Handle GitHub push event (webhook)
   */
  async handlePushEvent(
    payload: GitHubWebhookPayload,
    signature: string,
  ): Promise<{ success: boolean; message: string }> {
    // 1. Validate webhook signature
    const isValid = this.signatureValidator.validate(
      JSON.stringify(payload),
      signature,
    );

    if (!isValid) {
      this.logger.error('Invalid webhook signature');
      return { success: false, message: 'Invalid signature' };
    }

    const { repository, ref, commits } = payload;

    // 2. Identify tool from repository name
    const tool = this.identifyTool(repository.full_name);
    if (!tool) {
      this.logger.warn(`Unknown repository: ${repository.full_name}`);
      return { success: false, message: 'Unknown repository' };
    }

    // 3. Check if this is a version tag
    const isVersionTag = ref.startsWith('refs/tags/');
    if (!isVersionTag) {
      this.logger.debug(`Skipping non-version push: ${ref}`);
      return { success: true, message: 'Not a version tag, skipped' };
    }

    const version = ref.replace('refs/tags/', '').replace('v', '');

    this.logger.log(`🚀 New version detected: ${tool} ${version}`);
    await this.notifier.send(`🚀 New version detected: ${tool} ${version}`);

    try {
      // 4. Clone repository
      this.logger.log(`Cloning ${tool} repository...`);
      const repoPath = await this.cloneRepository(
        repository.clone_url,
        version,
        tool,
      );

      // 5. Parse and validate version
      const parsedVersion = await this.versionManager.parseVersion(
        tool,
        repoPath,
      );

      // 6. Check if version is newer than current
      const currentVersion = await this.versionManager.getCurrentVersion(tool);
      if (currentVersion && !this.versionManager.isNewer(parsedVersion, currentVersion)) {
        this.logger.warn(
          `Version ${parsedVersion} is not newer than ${currentVersion}`,
        );
        await this.notifier.send(
          `⚠️ Version ${parsedVersion} is not newer than ${currentVersion}, skipping`,
        );
        return { success: false, message: 'Version not newer' };
      }

      // 7. Build Docker image
      await this.notifier.send(`🔨 Building ${tool} ${parsedVersion}...`);
      this.logger.log(`Building Docker image for ${tool} ${parsedVersion}...`);

      const imageName = await this.dockerBuilder.buildImage(
        tool,
        repoPath,
        parsedVersion,
      );

      // 8. Push to registry
      this.logger.log(`Pushing ${imageName} to registry...`);
      await this.dockerBuilder.pushToRegistry(imageName);

      // 9. Run automated tests
      await this.notifier.send(`🧪 Testing ${tool} ${parsedVersion}...`);
      this.logger.log(`Running tests for ${tool} ${parsedVersion}...`);

      const testResults = await this.testRunner.runTests(tool, imageName);

      if (!testResults.success) {
        throw new Error(
          `Tests failed for ${tool} ${parsedVersion}: ${testResults.errors.join(', ')}`,
        );
      }

      // 10. Deploy to staging
      await this.notifier.send(
        `🚢 Deploying ${tool} ${parsedVersion} to staging...`,
      );
      this.logger.log(`Deploying ${tool} ${parsedVersion} to staging...`);

      await this.deployer.deployToStaging(tool, imageName);

      // 11. Run smoke tests on staging
      this.logger.log(`Running smoke tests on staging...`);
      const smokeResults = await this.testRunner.runSmokeTests(tool, 'staging');

      if (!smokeResults.success) {
        throw new Error(
          `Smoke tests failed: ${smokeResults.errors.join(', ')}`,
        );
      }

      // 12. Deploy to production (blue-green)
      await this.notifier.send(
        `✅ Deploying ${tool} ${parsedVersion} to production...`,
      );
      this.logger.log(`Deploying ${tool} ${parsedVersion} to production...`);

      await this.deployer.deployToProduction(tool, imageName);

      // 13. Update version in database
      await this.versionManager.updateVersion(tool, parsedVersion, {
        commitSha: commits[0].id,
        author: commits[0].author.name,
        message: commits[0].message,
        deployedAt: new Date(),
      });

      // 14. Cleanup temporary files
      await fs.remove(repoPath);

      await this.notifier.send(
        `✅ ${tool} ${parsedVersion} deployed successfully!`,
      );
      this.logger.log(`✅ ${tool} ${parsedVersion} deployed successfully!`);

      return {
        success: true,
        message: `Deployed ${tool} ${parsedVersion}`,
      };
    } catch (error) {
      this.logger.error(`Deployment failed for ${tool} ${version}:`, error);

      // Rollback if deployment started
      try {
        await this.deployer.rollback(tool);
        await this.notifier.send(
          `❌ Deployment failed for ${tool} ${version}. Rolled back to previous version.`,
        );
      } catch (rollbackError) {
        this.logger.error('Rollback also failed:', rollbackError);
        await this.notifier.send(
          `🚨 CRITICAL: Deployment AND rollback failed for ${tool} ${version}. Manual intervention required!`,
        );
      }

      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Identify tool from repository full name
   */
  private identifyTool(fullName: string): ToolName | null {
    const lowerName = fullName.toLowerCase();

    if (lowerName.includes('promptfoo')) return 'promptfoo';
    if (lowerName.includes('garak')) return 'garak';

    return null;
  }

  /**
   * Clone repository with specific tag/version
   */
  private async cloneRepository(
    cloneUrl: string,
    version: string,
    tool: ToolName,
  ): Promise<string> {
    const repoPath = path.join('/tmp', 'repos', tool, `${Date.now()}`);

    await fs.ensureDir(repoPath);

    try {
      // Clone with depth 1 (shallow clone) for speed
      const { stdout, stderr } = await execAsync(
        `git clone --depth 1 --branch v${version} ${cloneUrl} ${repoPath}`,
        {
          env: {
            ...process.env,
            GIT_TERMINAL_PROMPT: '0', // Disable interactive prompts
          },
        },
      );

      this.logger.debug(`Git clone stdout: ${stdout}`);
      if (stderr) this.logger.debug(`Git clone stderr: ${stderr}`);

      return repoPath;
    } catch (error) {
      // Cleanup on error
      await fs.remove(repoPath);
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }
}
