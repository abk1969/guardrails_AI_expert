import { ApiProperty } from '@nestjs/swagger';

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

export class ScanResultDto {
  @ApiProperty({ example: 'scan-123-456', description: 'Unique scan ID' })
  id: string;

  @ApiProperty({ example: '2025-11-05T10:30:00Z', description: 'Timestamp of scan' })
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
    description: 'Status of the scan',
  })
  status: 'running' | 'completed' | 'failed';
}
