import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ai-risk-manager-api-gateway',
    };
  }

  @Get('/')
  getRoot() {
    return {
      message: 'AI Risk Manager API Gateway',
      version: '1.0.0',
      docs: '/api/docs',
    };
  }
}
