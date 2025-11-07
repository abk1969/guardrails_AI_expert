import { ApiProperty } from '@nestjs/swagger';

export class ActivityDto {
  @ApiProperty({ example: 'act-123' })
  id: string;

  @ApiProperty({ enum: ['promptfoo', 'garak', 'strix'] })
  tool: 'promptfoo' | 'garak' | 'strix';

  @ApiProperty({ example: 'Scan completed with 3 vulnerabilities found' })
  action: string;

  @ApiProperty({ example: '2025-11-05T10:30:00Z' })
  timestamp: string;

  @ApiProperty({ enum: ['critical', 'high', 'moderate', 'low', 'info'] })
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
}

export class ToolsStatusDto {
  @ApiProperty({ enum: ['running', 'idle', 'error'], example: 'idle' })
  promptfoo: 'running' | 'idle' | 'error';

  @ApiProperty({ enum: ['running', 'idle', 'error'], example: 'idle' })
  garak: 'running' | 'idle' | 'error';

  @ApiProperty({ enum: ['running', 'idle', 'error'], example: 'idle' })
  strix: 'running' | 'idle' | 'error';
}

export class UnifiedMetricsDto {
  @ApiProperty({ example: 150, description: 'Total number of tests executed' })
  totalTests: number;

  @ApiProperty({ example: 12, description: 'Number of vulnerabilities found' })
  vulnerabilitiesFound: number;

  @ApiProperty({ example: 3, description: 'Number of critical findings' })
  criticalFindings: number;

  @ApiProperty({ example: '2025-11-05T10:30:00Z', description: 'Timestamp of last scan' })
  lastScanTime: string;

  @ApiProperty({ type: ToolsStatusDto, description: 'Status of each tool' })
  toolsStatus: ToolsStatusDto;

  @ApiProperty({ type: [ActivityDto], description: 'Recent activity from all tools' })
  recentActivity: ActivityDto[];
}
