import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '@app/auth/decorators/public.decorator';
import { StrixService } from './strix.service';
import { AgentConfigDto } from './dto/agent-config.dto';
import { AgentExecutionDto } from './dto/agent-execution.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { DEV_DEFAULTS } from '../shared/constants';

@ApiTags('Strix Agentic AI Testing')
@Controller('strix')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StrixController {
  constructor(private readonly strixService: StrixService) {}

  @Public()
  @Post('execute')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start Strix agent execution',
    description: 'Initiates an autonomous Strix agent to test an AI system',
  })
  @ApiResponse({
    status: 201,
    description: 'Agent execution started successfully',
    type: AgentExecutionDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid agent configuration' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async startExecution(
    @CurrentUser() user: User,
    @Body() config: AgentConfigDto,
  ): Promise<AgentExecutionDto> {
    const organizationId = user?.organizationId || DEV_DEFAULTS.ORGANIZATION_ID;
    const userId = user?.id || DEV_DEFAULTS.USER_ID;
    const targetId = DEV_DEFAULTS.TARGET_ID;

    return this.strixService.startExecution(organizationId, config, userId, targetId);
  }

  @Public()
  @Get('execution/:id')
  @ApiOperation({
    summary: 'Get agent execution status',
    description: 'Retrieve the current status and results of an agent execution',
  })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiResponse({
    status: 200,
    description: 'Execution status retrieved successfully',
    type: AgentExecutionDto,
  })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getExecution(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<AgentExecutionDto> {
    const organizationId = user?.organizationId || DEV_DEFAULTS.ORGANIZATION_ID;
    return this.strixService.getExecution(organizationId, id);
  }

  @Post('execution/:id/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pause agent execution',
    description: 'Pauses a running agent execution',
  })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiResponse({ status: 200, description: 'Execution paused successfully' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async pauseExecution(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.strixService.pauseExecution(user.organizationId, id);
    return { message: 'Execution paused successfully' };
  }

  @Post('execution/:id/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resume agent execution',
    description: 'Resumes a paused agent execution',
  })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiResponse({ status: 200, description: 'Execution resumed successfully' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resumeExecution(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.strixService.resumeExecution(user.organizationId, id);
    return { message: 'Execution resumed successfully' };
  }

  @Post('execution/:id/stop')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stop agent execution',
    description: 'Stops a running or paused agent execution',
  })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiResponse({ status: 200, description: 'Execution stopped successfully' })
  @ApiResponse({ status: 404, description: 'Execution not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async stopExecution(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.strixService.stopExecution(user.organizationId, id);
    return { message: 'Execution stopped successfully' };
  }
}
