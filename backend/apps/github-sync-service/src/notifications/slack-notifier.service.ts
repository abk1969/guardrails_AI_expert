import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

type ToolName = 'promptfoo' | 'garak' | 'strix';

interface SlackMessage {
  text?: string;
  blocks?: Array<{
    type: string;
    text?: { type: string; text: string };
    fields?: Array<{ type: string; text: string }>;
  }>;
}

@Injectable()
export class SlackNotifierService {
  private readonly logger = new Logger(SlackNotifierService.name);
  private readonly webhookUrl: string;
  private readonly enabled: boolean;

  constructor(private readonly httpService: HttpService) {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.enabled = !!this.webhookUrl;
  }

  async notifyDeploymentStarted(tool: ToolName, version: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const message: SlackMessage = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚀 Deployment Started: ${tool} v${version}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Tool:*\n${tool}`,
            },
            {
              type: 'mrkdwn',
              text: `*Version:*\n${version}`,
            },
            {
              type: 'mrkdwn',
              text: `*Status:*\n⏳ In Progress`,
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };

    await this.sendMessage(message);
  }

  async notifyDeploymentSuccess(tool: ToolName, version: string, duration: number): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const message: SlackMessage = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `✅ Deployment Successful: ${tool} v${version}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Tool:*\n${tool}`,
            },
            {
              type: 'mrkdwn',
              text: `*Version:*\n${version}`,
            },
            {
              type: 'mrkdwn',
              text: `*Duration:*\n${this.formatDuration(duration)}`,
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };

    await this.sendMessage(message);
  }

  async notifyDeploymentFailure(tool: ToolName, version: string, error: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const message: SlackMessage = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `❌ Deployment Failed: ${tool} v${version}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Tool:*\n${tool}`,
            },
            {
              type: 'mrkdwn',
              text: `*Version:*\n${version}`,
            },
            {
              type: 'mrkdwn',
              text: `*Error:*\n\`\`\`${error}\`\`\``,
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };

    await this.sendMessage(message);
  }

  async notifyRollback(tool: ToolName, fromVersion: string, toVersion: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const message: SlackMessage = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `⚠️ Rollback Executed: ${tool}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Tool:*\n${tool}`,
            },
            {
              type: 'mrkdwn',
              text: `*From Version:*\n${fromVersion}`,
            },
            {
              type: 'mrkdwn',
              text: `*To Version:*\n${toVersion}`,
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };

    await this.sendMessage(message);
  }

  async notifyHealthCheckFailure(service: string, consecutive: number): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const message: SlackMessage = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 Health Check Failed: ${service}`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Service:*\n${service}`,
            },
            {
              type: 'mrkdwn',
              text: `*Consecutive Failures:*\n${consecutive}`,
            },
            {
              type: 'mrkdwn',
              text: `*Time:*\n${new Date().toISOString()}`,
            },
          ],
        },
      ],
    };

    await this.sendMessage(message);
  }

  private async sendMessage(message: SlackMessage): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(this.webhookUrl, message, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      this.logger.debug('Slack notification sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send Slack notification: ${error.message}`, error.stack);
      // Don't throw - notifications are non-critical
    }
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}
