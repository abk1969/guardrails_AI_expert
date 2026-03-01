import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '@app/auth/decorators/public.decorator';
import { GarakService } from './garak.service';
import { ScanConfigDto } from './dto/scan-config.dto';
import { ScanResultDto } from './dto/scan-result.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { DEV_DEFAULTS } from '../shared/constants';

@ApiTags('Garak LLM Scanner')
@Controller('garak')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GarakController {
  constructor(private readonly garakService: GarakService) {}

  @Public()
  @Post('scan')
  @ApiOperation({
    summary: 'Start a Garak LLM vulnerability scan',
    description: 'Initiates a security scan using Garak probes to detect LLM vulnerabilities',
  })
  @ApiResponse({
    status: 201,
    description: 'Scan started successfully',
    type: ScanResultDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid scan configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async startScan(
    @CurrentUser() user: User,
    @Body() config: ScanConfigDto,
  ): Promise<ScanResultDto> {
    const organizationId = user?.organizationId || DEV_DEFAULTS.ORGANIZATION_ID;
    const userId = user?.id || DEV_DEFAULTS.USER_ID;
    const targetId = DEV_DEFAULTS.TARGET_ID;
    return this.garakService.startScan(organizationId, config, userId, targetId);
  }
}
