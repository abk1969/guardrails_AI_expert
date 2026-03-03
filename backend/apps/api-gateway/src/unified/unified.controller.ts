import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '@app/auth/decorators/public.decorator';
import { UnifiedService } from './unified.service';
import { UnifiedMetricsDto } from './dto/unified-metrics.dto';

@ApiTags('Unified Platform')
@Controller('unified')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnifiedController {
  constructor(private readonly unifiedService: UnifiedService) {}

  @Public()
  @Get('metrics')
  @ApiOperation({
    summary: 'Get unified metrics from all security tools',
    description: 'Aggregates metrics from Promptfoo and Garak tools',
  })
  @ApiResponse({
    status: 200,
    description: 'Unified metrics retrieved successfully',
    type: UnifiedMetricsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMetrics(): Promise<UnifiedMetricsDto> {
    return this.unifiedService.getAggregatedMetrics();
  }
}
