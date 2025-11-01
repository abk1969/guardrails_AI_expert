import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { TestRunStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(organizationId: string) {
    const [totalTestRuns, completedRuns, totalTests, recentRuns] = await Promise.all([
      this.prisma.testRun.count({
        where: { organizationId, deletedAt: null },
      }),
      this.prisma.testRun.count({
        where: {
          organizationId,
          status: TestRunStatus.COMPLETED,
          deletedAt: null,
        },
      }),
      this.prisma.testResult.count(),
      this.prisma.testRun.findMany({
        where: { organizationId, deletedAt: null },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          totalTests: true,
          passedTests: true,
          failedTests: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalTestRuns,
      completedRuns,
      totalTests,
      recentRuns,
    };
  }
}
