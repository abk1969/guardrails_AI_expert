import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '@app/auth/decorators/public.decorator';
import { GarakService } from './garak.service';
import { ScanConfigDto } from './dto/scan-config.dto';
import { ScanResultDto } from './dto/scan-result.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

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
    // Default organization ID for public/development mode
    const organizationId = user?.organizationId || '9b0b4913-3a4d-4511-9840-2d4ce87e53a9';
    return this.garakService.startScan(organizationId, config);
  }
}
