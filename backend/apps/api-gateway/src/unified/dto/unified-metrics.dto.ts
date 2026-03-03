import { ApiProperty } from '@nestjs/swagger';

export class ActivityDto {
  @ApiProperty({ example: 'act-123', description: 'Activity ID' })
  id: string;

  @ApiProperty({ enum: ['promptfoo', 'garak'], description: 'Security tool that generated this activity' })
  tool: 'promptfoo' | 'garak';

  @ApiProperty({ example: 'Scan completed with 3 vulnerabilities found', description: 'Activity description' })
  action: string;

  @ApiProperty({ example: '2025-11-05T10:30:00Z', description: 'Timestamp of the activity' })
  timestamp: string;

  @ApiProperty({
    enum: ['critical', 'high', 'moderate', 'low', 'info'],
    description: 'Severity level of the activity',
  })
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
}

export class ToolsStatusDto {
  @ApiProperty({ enum: ['running', 'idle', 'error'], example: 'idle', description: 'Promptfoo tool status' })
  promptfoo: 'running' | 'idle' | 'error';

  @ApiProperty({ enum: ['running', 'idle', 'error'], example: 'idle', description: 'Garak tool status' })
  garak: 'running' | 'idle' | 'error';
}

/**
 * Comparative metrics between Garak and Promptfoo
 */
export class ComparativeMetricsDto {
  @ApiProperty({ example: 5, description: 'Vulnerabilities found by Garak' })
  garakVulnerabilities: number;

  @ApiProperty({ example: 8, description: 'Test failures found by Promptfoo' })
  promptfooFailures: number;

  @ApiProperty({ example: 12, description: 'Total Garak scans executed' })
  garakScans: number;

  @ApiProperty({ example: 25, description: 'Total Promptfoo test runs executed' })
  promptfooRuns: number;

  @ApiProperty({ example: 0.42, description: 'Garak vulnerability rate (failed/total)' })
  garakVulnerabilityRate: number;

  @ApiProperty({ example: 0.32, description: 'Promptfoo failure rate (failed/total)' })
  promptfooFailureRate: number;
}

export class UnifiedMetricsDto {
  @ApiProperty({ example: 150, description: 'Total number of tests executed across all tools' })
  totalTests: number;

  @ApiProperty({ example: 12, description: 'Number of vulnerabilities found' })
  vulnerabilitiesFound: number;

  @ApiProperty({ example: 3, description: 'Number of critical findings' })
  criticalFindings: number;

  @ApiProperty({ example: '2025-11-05T10:30:00Z', description: 'Timestamp of last scan' })
  lastScanTime: string;

  @ApiProperty({ type: ToolsStatusDto, description: 'Status of each tool' })
  toolsStatus: ToolsStatusDto;

  @ApiProperty({ type: ComparativeMetricsDto, description: 'Comparative metrics between Garak and Promptfoo' })
  comparativeMetrics: ComparativeMetricsDto;

  @ApiProperty({ type: [ActivityDto], description: 'Recent activity from all tools' })
  recentActivity: ActivityDto[];
}
