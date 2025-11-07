import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { UnifiedOrchestrationService } from './unified-orchestration.service';
import {
  UnifiedExecutionConfigDto,
  UnifiedExecutionDto,
} from './dto/unified-execution.dto';

@ApiTags('Unified Orchestration')
@Controller('unified/orchestration')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UnifiedOrchestrationController {
  constructor(
    private readonly orchestrationService: UnifiedOrchestrationService,
  ) {}

  /**
   * Start unified execution across multiple frameworks
   */
  @Post('start')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Start unified execution',
    description:
      'Start a unified execution across Promptfoo, Garak, and Strix frameworks in parallel, sequential, or selective mode',
  })
  @ApiResponse({
    status: 202,
    description: 'Unified execution started successfully',
    type: UnifiedExecutionDto,
  })
  async startExecution(
    @CurrentUser()
    user: {
      id: string;
      role: any;
      email: string;
      organizationId: string;
    },
    @Body() config: UnifiedExecutionConfigDto,
  ): Promise<UnifiedExecutionDto> {
    return this.orchestrationService.startUnifiedExecution(
      user.organizationId,
      config,
      user.id,
      '33faa86b-0bad-45e9-b372-0d174de49cc8', // Default target ID
    );
  }

  /**
   * Get unified execution status
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get unified execution status',
    description: 'Get the status of a unified execution by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Unified execution status',
    type: UnifiedExecutionDto,
  })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async getExecution(
    @CurrentUser()
    user: {
      id: string;
      role: any;
      email: string;
      organizationId: string;
    },
    @Param('id') id: string,
  ): Promise<UnifiedExecutionDto> {
    return this.orchestrationService.getUnifiedExecution(user.organizationId, id);
  }

  /**
   * Stop unified execution
   */
  @Post(':id/stop')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Stop unified execution',
    description: 'Stop a running unified execution and all its framework executions',
  })
  @ApiResponse({ status: 204, description: 'Execution stopped successfully' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  async stopExecution(
    @CurrentUser()
    user: {
      id: string;
      role: any;
      email: string;
      organizationId: string;
    },
    @Param('id') id: string,
  ): Promise<void> {
    await this.orchestrationService.stopUnifiedExecution(user.organizationId, id);
  }
}
