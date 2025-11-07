import { Controller, Post, Body, Headers, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhookHandler } from './webhooks/webhook-handler';
import { BlueGreenDeployerService } from './deployment/blue-green-deployer.service';
import { RollbackService } from './deployment/rollback.service';

interface GitHubWebhookPayload {
  ref: string;
  repository: {
    full_name: string;
    clone_url: string;
  };
  commits: Array<{
    id: string;
    message: string;
    timestamp: string;
    author: {
      name: string;
      email: string;
    };
  }>;
}

@ApiTags('GitHub Sync')
@Controller('github-sync')
export class GitHubSyncController {
  constructor(
    private readonly webhookHandler: WebhookHandler,
    private readonly blueGreenDeployer: BlueGreenDeployerService,
    private readonly rollbackService: RollbackService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'github-sync',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GitHub webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid signature' })
  async handleWebhook(
    @Body() payload: GitHubWebhookPayload,
    @Headers('x-hub-signature-256') signature: string,
  ) {
    return await this.webhookHandler.handlePushEvent(payload, signature);
  }

  @Post('rollback/:tool')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rollback to previous version' })
  @ApiResponse({ status: 200, description: 'Rollback successful' })
  async rollback(@Body() body: { tool: string }) {
    const tool = body.tool as 'promptfoo' | 'garak' | 'strix';
    return await this.rollbackService.rollback(tool);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get deployment status' })
  @ApiResponse({ status: 200, description: 'Current deployment status' })
  async getStatus() {
    return await this.blueGreenDeployer.getDeploymentStatus();
  }
}
