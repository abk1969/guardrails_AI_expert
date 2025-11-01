import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { TestRunStatus, TestStatus } from '@prisma/client';
import { CreateTestRunDto } from './dto/create-test-run.dto';
import { TestRunResponseDto } from './dto/test-run-response.dto';
import { TestResultsResponseDto } from './dto/test-results.dto';
import { TestsGateway } from './tests.gateway';

@Injectable()
export class TestsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TestsGateway))
    private testsGateway: TestsGateway,
  ) {}

  async createTestRun(
    dto: CreateTestRunDto,
    userId: string,
    organizationId: string,
  ): Promise<TestRunResponseDto> {
    const testRun = await this.prisma.testRun.create({
      data: {
        organizationId,
        createdById: userId,
        targetId: dto.targetId,
        status: TestRunStatus.PENDING,
        totalTests: dto.volume || 0,
        passedTests: 0,
        failedTests: 0,
        blockedTests: 0,
        configuration: {
          categories: dto.categories,
          volume: dto.volume,
          complexities: dto.complexities,
          categorySensitivities: dto.categorySensitivities,
          description: dto.description,
        } as any,
        metadata: {},
        startedAt: new Date(),
      },
    });

    return testRun;
  }

  async getTestRuns(
    organizationId: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const skip = (page - 1) * pageSize;

    const [testRuns, total] = await Promise.all([
      this.prisma.testRun.findMany({
        where: { organizationId, deletedAt: null },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          target: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.testRun.count({
        where: { organizationId, deletedAt: null },
      }),
    ]);

    return {
      testRuns,
      total,
      page,
      pageSize,
    };
  }

  async getTestRunById(
    testRunId: string,
    organizationId: string,
  ): Promise<TestRunResponseDto> {
    const testRun = await this.prisma.testRun.findFirst({
      where: {
        id: testRunId,
        organizationId,
        deletedAt: null,
      },
    });

    if (!testRun) {
      throw new NotFoundException('Test run not found');
    }

    return testRun;
  }

  async getTestResults(
    testRunId: string,
    organizationId: string,
    page: number = 1,
    pageSize: number = 50,
  ): Promise<TestResultsResponseDto> {
    // Verify test run exists and belongs to organization
    const testRun = await this.getTestRunById(testRunId, organizationId);

    const skip = (page - 1) * pageSize;

    const [results, total] = await Promise.all([
      this.prisma.testResult.findMany({
        where: { testRunId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.testResult.count({
        where: { testRunId },
      }),
    ]);

    return {
      results,
      total,
      page,
      pageSize,
    };
  }

  async cancelTestRun(
    testRunId: string,
    organizationId: string,
  ): Promise<TestRunResponseDto> {
    const testRun = await this.getTestRunById(testRunId, organizationId);

    if (testRun.status === TestRunStatus.COMPLETED || testRun.status === TestRunStatus.CANCELLED) {
      throw new Error('Cannot cancel a completed or already cancelled test run');
    }

    const updated = await this.prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: TestRunStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    return updated;
  }

  async retryFailedTests(
    testRunId: string,
    organizationId: string,
  ): Promise<TestRunResponseDto> {
    const testRun = await this.getTestRunById(testRunId, organizationId);

    // Create new test run with failed tests configuration
    const failedResults = await this.prisma.testResult.findMany({
      where: {
        testRunId,
        status: TestStatus.FAILED,
      },
    });

    const newTestRun = await this.prisma.testRun.create({
      data: {
        organizationId,
        createdById: testRun.createdById,
        targetId: testRun.targetId,
        status: TestRunStatus.PENDING,
        totalTests: failedResults.length,
        passedTests: 0,
        failedTests: 0,
        blockedTests: 0,
        configuration: {
          ...testRun.configuration,
          retryOf: testRunId,
        },
        metadata: {
          originalTestRunId: testRunId,
          retryAttempt: (testRun.metadata?.retryAttempt || 0) + 1,
        },
        startedAt: new Date(),
      },
    });

    return newTestRun;
  }

  async getTestTargets(organizationId: string) {
    return this.prisma.testTarget.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createTestTarget(organizationId: string, data: any) {
    return this.prisma.testTarget.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async getPromptTemplates(
    category?: string,
    complexity?: string,
  ) {
    return this.prisma.promptTemplate.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(complexity && { complexity: complexity as any }),
        isActive: true,
      },
      orderBy: { category: 'asc' },
    });
  }

  /**
   * Émet la progression d'un test run via WebSocket
   */
  async emitTestProgress(testRunId: string) {
    const testRun = await this.prisma.testRun.findUnique({
      where: { id: testRunId },
    });

    if (testRun) {
      const progress = testRun.totalTests > 0
        ? Math.round(((testRun.passedTests + testRun.failedTests + testRun.blockedTests) / testRun.totalTests) * 100)
        : 0;

      this.testsGateway.emitProgress(testRunId, {
        progress,
        totalTests: testRun.totalTests,
        passedTests: testRun.passedTests,
        failedTests: testRun.failedTests,
        blockedTests: testRun.blockedTests,
      });
    }
  }

  /**
   * Ajoute un résultat de test et émet via WebSocket
   */
  async addTestResult(testRunId: string, resultData: any) {
    const result = await this.prisma.testResult.create({
      data: {
        testRunId,
        ...resultData,
      },
    });

    // Mettre à jour les compteurs du test run
    const testRun = await this.prisma.testRun.findUnique({
      where: { id: testRunId },
    });

    if (testRun) {
      const updates: any = {};
      if (result.status === TestStatus.PASSED) {
        updates.passedTests = testRun.passedTests + 1;
      } else if (result.status === TestStatus.FAILED) {
        updates.failedTests = testRun.failedTests + 1;
      } else if (result.status === TestStatus.SKIPPED) {
        updates.blockedTests = testRun.blockedTests + 1;
      }

      await this.prisma.testRun.update({
        where: { id: testRunId },
        data: updates,
      });

      // Émettre le résultat via WebSocket
      this.testsGateway.emitTestResult(testRunId, result);

      // Émettre la progression mise à jour
      await this.emitTestProgress(testRunId);
    }

    return result;
  }

  /**
   * Marque un test run comme terminé et émet via WebSocket
   */
  async completeTestRun(testRunId: string) {
    const testRun = await this.prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: TestRunStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    const duration = testRun.completedAt && testRun.startedAt
      ? Math.round((testRun.completedAt.getTime() - testRun.startedAt.getTime()) / 1000)
      : 0;

    this.testsGateway.emitCompletion(testRunId, {
      status: testRun.status,
      totalTests: testRun.totalTests,
      passedTests: testRun.passedTests,
      failedTests: testRun.failedTests,
      blockedTests: testRun.blockedTests,
      duration,
    });

    return testRun;
  }

  /**
   * Émet une erreur via WebSocket
   */
  emitTestError(testRunId: string, error: Error) {
    this.testsGateway.emitError(testRunId, {
      message: error.message,
      code: 'TEST_EXECUTION_ERROR',
      details: error.stack,
    });
  }
}
