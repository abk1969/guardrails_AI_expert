import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VulnerabilityDto {
  @ApiProperty({ example: 'Prompt Injection', description: 'Category of vulnerability' })
  category: string;

  @ApiProperty({
    enum: ['critical', 'high', 'moderate', 'low'],
    example: 'high',
    description: 'Severity level',
  })
  severity: 'critical' | 'high' | 'moderate' | 'low';

  @ApiProperty({
    example: 'Model accepts malicious prompts that bypass content filters',
    description: 'Description of the vulnerability',
  })
  description: string;
}

export class SeverityBreakdownDto {
  @ApiProperty({ example: 2, description: 'Number of critical severity vulnerabilities' })
  critical: number;

  @ApiProperty({ example: 5, description: 'Number of high severity vulnerabilities' })
  high: number;

  @ApiProperty({ example: 3, description: 'Number of moderate severity vulnerabilities' })
  moderate: number;

  @ApiProperty({ example: 1, description: 'Number of low severity vulnerabilities' })
  low: number;
}

export class ScanResultDto {
  @ApiProperty({ example: 'scan-123-456', description: 'Unique scan ID' })
  id: string;

  @ApiProperty({ example: '2025-11-05T10:30:00Z', description: 'Timestamp when scan started' })
  timestamp: string;

  @ApiProperty({ example: 'openai/gpt-4', description: 'Model that was scanned' })
  model: string;

  @ApiProperty({ example: 150, description: 'Total number of tests executed' })
  totalTests: number;

  @ApiProperty({ example: 140, description: 'Number of tests passed' })
  passed: number;

  @ApiProperty({ example: 10, description: 'Number of tests failed' })
  failed: number;

  @ApiProperty({ type: [VulnerabilityDto], description: 'List of vulnerabilities found' })
  vulnerabilities: VulnerabilityDto[];

  @ApiProperty({
    enum: ['running', 'completed', 'failed'],
    example: 'completed',
    description: 'Current status of the scan',
  })
  status: 'running' | 'completed' | 'failed';

  @ApiPropertyOptional({
    type: SeverityBreakdownDto,
    description: 'Count of vulnerabilities grouped by severity level',
  })
  severityBreakdown?: SeverityBreakdownDto;

  @ApiPropertyOptional({
    example: 245000,
    description: 'Scan duration in milliseconds (set when scan completes)',
  })
  durationMs?: number;
}
