import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@app/auth/decorators/public.decorator';
import { SystemService } from './system.service';
import { SystemHealthDto } from './dto/system-health.dto';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Public()
  @Get('health')
  @ApiOperation({
    summary: 'Check system dependencies health',
    description:
      'Verifies that all required dependencies for the unified pentest platform are installed and functioning: Python 3.9+, pipx, Garak, Node.js 18+, Promptfoo, and Docker.',
  })
  @ApiResponse({
    status: 200,
    description: 'System health check completed successfully',
    type: SystemHealthDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Health check failed due to internal error',
  })
  async getHealth(): Promise<SystemHealthDto> {
    return this.systemService.getSystemHealth();
  }
}
