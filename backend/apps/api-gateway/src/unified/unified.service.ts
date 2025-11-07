import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { UnifiedMetricsDto, ActivityDto } from './dto/unified-metrics.dto';

@Injectable()
export class UnifiedService {
  private readonly logger = new Logger(UnifiedService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate metrics from all three security tools
   * - Promptfoo: LLM prompt testing
   * - Garak: LLM vulnerability scanning
   * - Strix: Agentic AI testing
   */
  async getAggregatedMetrics(): Promise<UnifiedMetricsDto> {
    try {
      // Get total test count from TestRun table
      const totalTests = await this.prisma.testRun.count();

      // Get vulnerabilities count from TestResult table
      const vulnerabilitiesCount = await this.prisma.testResult.count({
        where: {
          status: 'FAILED',
        },
      });

      // Get critical findings (score < 0.3 or status = FAILED with high severity)
      const criticalFindings = await this.prisma.testResult.count({
        where: {
          OR: [
            { score: { lt: 0.3 } },
            { status: 'FAILED' },
          ],
        },
      });

      // Get last scan time from most recent TestRun
      const lastRun = await this.prisma.testRun.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      // Get tool status from recent test runs (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentRuns = await this.prisma.testRun.findMany({
        where: {
          createdAt: { gte: fiveMinutesAgo },
        },
        select: {
          status: true,
          metadata: true,
        },
      });

      // Determine tool status based on recent runs
      const toolsStatus = {
        promptfoo: this.determineToolStatus(recentRuns, 'promptfoo'),
        garak: this.determineToolStatus(recentRuns, 'garak'),
        strix: this.determineToolStatus(recentRuns, 'strix'),
      };

      // Get recent activity (last 10 test runs)
      const recentTestRuns = await this.prisma.testRun.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          results: {
            select: { status: true, score: true },
          },
        },
      });

      const recentActivity: ActivityDto[] = recentTestRuns.map((run) => {
        const failedCount = run.results.filter((r) => r.status === 'FAILED').length;
        const tool = this.detectToolFromMetadata(run.metadata);
        const severity = this.determineSeverity(failedCount, run.results.length);

        return {
          id: run.id,
          tool,
          action: `Test run completed: ${failedCount} failures out of ${run.results.length} tests`,
          timestamp: run.createdAt.toISOString(),
          severity,
        };
      });

      return {
        totalTests,
        vulnerabilitiesFound: vulnerabilitiesCount,
        criticalFindings,
        lastScanTime: lastRun?.createdAt.toISOString() || '',
        toolsStatus,
        recentActivity,
      };
    } catch (error) {
      this.logger.error('Failed to get aggregated metrics', error);
      throw error;
    }
  }

  /**
   * Determine tool status from recent runs
   */
  private determineToolStatus(
    recentRuns: Array<{ status: string; metadata: any }>,
    toolName: string,
  ): 'running' | 'idle' | 'error' {
    const toolRuns = recentRuns.filter((run) => {
      const metadata = run.metadata as Record<string, any>;
      return metadata?.tool === toolName;
    });

    if (toolRuns.length === 0) {
      return 'idle';
    }

    const hasRunning = toolRuns.some((run) => run.status === 'RUNNING');
    if (hasRunning) {
      return 'running';
    }

    const hasFailed = toolRuns.some((run) => run.status === 'FAILED');
    if (hasFailed) {
      return 'error';
    }

    return 'idle';
  }

  /**
   * Detect which tool was used based on metadata
   */
  private detectToolFromMetadata(metadata: any): 'promptfoo' | 'garak' | 'strix' {
    const meta = metadata as Record<string, any>;
    if (meta?.tool) {
      return meta.tool;
    }

    // Default to promptfoo if not specified
    return 'promptfoo';
  }

  /**
   * Determine severity based on failure rate
   */
  private determineSeverity(
    failedCount: number,
    totalCount: number,
  ): 'critical' | 'high' | 'moderate' | 'low' | 'info' {
    if (totalCount === 0) {
      return 'info';
    }

    const failureRate = failedCount / totalCount;

    if (failureRate >= 0.8) {
      return 'critical';
    } else if (failureRate >= 0.5) {
      return 'high';
    } else if (failureRate >= 0.2) {
      return 'moderate';
    } else if (failureRate > 0) {
      return 'low';
    } else {
      return 'info';
    }
  }
}
