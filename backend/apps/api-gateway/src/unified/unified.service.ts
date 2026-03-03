import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { UnifiedMetricsDto, ComparativeMetricsDto, ActivityDto } from './dto/unified-metrics.dto';

@Injectable()
export class UnifiedService {
  private readonly logger = new Logger(UnifiedService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregate metrics from both security tools (Promptfoo + Garak),
   * including comparative analysis between the two.
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

      // Get critical findings (score < 0.3)
      const criticalFindings = await this.prisma.testResult.count({
        where: {
          score: { lt: 0.3 },
          status: 'FAILED',
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
      };

      // Build comparative metrics between Garak and Promptfoo
      const comparativeMetrics = await this.buildComparativeMetrics();

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
        comparativeMetrics,
        recentActivity,
      };
    } catch (error) {
      this.logger.error('Failed to get aggregated metrics', error);
      throw error;
    }
  }

  /**
   * Build comparative metrics between Garak and Promptfoo from the database.
   */
  private async buildComparativeMetrics(): Promise<ComparativeMetricsDto> {
    // Get all test runs grouped by tool
    const allRuns = await this.prisma.testRun.findMany({
      select: {
        metadata: true,
        totalTests: true,
        passedTests: true,
        failedTests: true,
      },
    });

    let garakScans = 0;
    let garakTotalTests = 0;
    let garakVulnerabilities = 0;
    let promptfooRuns = 0;
    let promptfooTotalTests = 0;
    let promptfooFailures = 0;

    for (const run of allRuns) {
      const tool = this.detectToolFromMetadata(run.metadata);
      if (tool === 'garak') {
        garakScans++;
        garakTotalTests += run.totalTests;
        garakVulnerabilities += run.failedTests;
      } else {
        promptfooRuns++;
        promptfooTotalTests += run.totalTests;
        promptfooFailures += run.failedTests;
      }
    }

    return {
      garakVulnerabilities,
      promptfooFailures,
      garakScans,
      promptfooRuns,
      garakVulnerabilityRate: garakTotalTests > 0 ? garakVulnerabilities / garakTotalTests : 0,
      promptfooFailureRate: promptfooTotalTests > 0 ? promptfooFailures / promptfooTotalTests : 0,
    };
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
      // Check both 'tool' and 'source' keys since Promptfoo uses 'source' and Garak uses 'tool'
      return metadata?.tool === toolName || metadata?.source === toolName;
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
   * Detect which tool was used based on metadata.
   * Checks both 'tool' (Garak) and 'source' (Promptfoo) keys.
   */
  private detectToolFromMetadata(metadata: any): 'promptfoo' | 'garak' {
    const meta = metadata as Record<string, any>;
    if (meta?.tool === 'garak' || meta?.source === 'garak') {
      return 'garak';
    }
    if (meta?.tool === 'promptfoo' || meta?.source === 'promptfoo') {
      return 'promptfoo';
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
