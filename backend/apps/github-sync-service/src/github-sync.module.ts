import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { GitHubSyncController } from './github-sync.controller';
import { GitHubSyncService } from './github-sync.service';
import { WebhookHandler } from './webhooks/webhook-handler';
import { SignatureValidator } from './webhooks/signature-validator';
import { VersionManagerService } from './version-manager/version-manager.service';
import { SemverParser } from './version-manager/semver-parser';
import { ChangelogGenerator } from './version-manager/changelog-generator';
import { DockerBuilderService } from './docker-builder/docker-builder.service';
import { DockerfileGenerator } from './docker-builder/dockerfile-generator';
import { ImageRegistryService } from './docker-builder/image-registry.service';
import { TestRunnerService } from './testing/test-runner.service';
import { BlueGreenDeployerService } from './deployment/blue-green-deployer.service';
import { RollbackService } from './deployment/rollback.service';
import { HealthCheckerService } from './deployment/health-checker.service';
import { SlackNotifierService } from './notifications/slack-notifier.service';
import { EmailNotifierService } from './notifications/email-notifier.service';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'github-sync',
    }),
  ],
  controllers: [GitHubSyncController],
  providers: [
    GitHubSyncService,
    WebhookHandler,
    SignatureValidator,
    VersionManagerService,
    SemverParser,
    ChangelogGenerator,
    DockerBuilderService,
    DockerfileGenerator,
    ImageRegistryService,
    TestRunnerService,
    BlueGreenDeployerService,
    RollbackService,
    HealthCheckerService,
    SlackNotifierService,
    EmailNotifierService,
  ],
  exports: [GitHubSyncService],
})
export class GitHubSyncModule {}
