import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '@app/auth';
import { AnalyticsService } from './analytics.service';

@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser('organizationId') organizationId: string) {
    return this.analyticsService.getDashboardStats(organizationId);
  }
}
