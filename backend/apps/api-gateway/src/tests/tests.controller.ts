import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Sse,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Observable } from 'rxjs';

import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@app/auth/guards/roles.guard';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';

import { TestsService } from './tests.service';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { TestRunResponseDto } from './dto/test-run-response.dto';
import { TestResultsResponseDto } from './dto/test-results.dto';
import { Role } from '@prisma/client';

@ApiTags('tests')
@Controller({ path: 'tests', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post('run')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 tests per minute
  @Roles(Role.TESTER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start a new test run' })
  @ApiResponse({
    status: 201,
    description: 'Test run created successfully',
    type: TestRunResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async createTestRun(
    @Body() createTestRunDto: CreateTestRunDto,
    @CurrentUser() user: any,
  ): Promise<TestRunResponseDto> {
    return this.testsService.createTestRun(createTestRunDto, user.id, user.organizationId);
  }

  @Get('runs')
  @Roles(Role.TESTER, Role.ADMIN, Role.ANALYST, Role.VIEWER)
  @ApiOperation({ summary: 'Get all test runs for organization' })
  @ApiResponse({ status: 200, description: 'List of test runs' })
  async getTestRuns(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    return this.testsService.getTestRuns(user.organizationId, page, pageSize);
  }

  @Get('runs/:id')
  @Roles(Role.TESTER, Role.ADMIN, Role.ANALYST, Role.VIEWER)
  @ApiOperation({ summary: 'Get test run by ID' })
  @ApiResponse({ status: 200, description: 'Test run details', type: TestRunResponseDto })
  @ApiResponse({ status: 404, description: 'Test run not found' })
  async getTestRun(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<TestRunResponseDto> {
    return this.testsService.getTestRunById(id, user.organizationId);
  }

  @Get('runs/:id/results')
  @Roles(Role.TESTER, Role.ADMIN, Role.ANALYST, Role.VIEWER)
  @ApiOperation({ summary: 'Get test results for a run' })
  @ApiResponse({ status: 200, description: 'Test results' })
  async getTestResults(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 50,
  ) {
    return this.testsService.getTestResults(id, user.organizationId, page, pageSize);
  }

  @Post('runs/:id/cancel')
  @Roles(Role.TESTER, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a running test' })
  @ApiResponse({ status: 200, description: 'Test cancelled successfully' })
  async cancelTestRun(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.testsService.cancelTestRun(id, user.organizationId);
    return { message: 'Test run cancelled successfully' };
  }

  @Post('runs/:id/retry')
  @Roles(Role.TESTER, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Retry failed tests in a run' })
  @ApiResponse({ status: 201, description: 'Retry test created', type: TestRunResponseDto })
  async retryFailedTests(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<TestRunResponseDto> {
    return this.testsService.retryFailedTests(id, user.organizationId);
  }

  @Get('targets')
  @Roles(Role.TESTER, Role.ADMIN, Role.VIEWER)
  @ApiOperation({ summary: 'Get all test targets for organization' })
  async getTestTargets(@CurrentUser() user: any) {
    return this.testsService.getTestTargets(user.organizationId);
  }

  @Post('targets')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new test target' })
  async createTestTarget(@Body() dto: any, @CurrentUser() user: any) {
    return this.testsService.createTestTarget(user.organizationId, dto);
  }

  @Get('prompt-templates')
  @Roles(Role.TESTER, Role.ADMIN, Role.VIEWER)
  @ApiOperation({ summary: 'Get available prompt templates' })
  async getPromptTemplates(
    @Query('category') category?: string,
    @Query('complexity') complexity?: string,
  ) {
    return this.testsService.getPromptTemplates(category, complexity);
  }
}
