import { ApiProperty } from '@nestjs/swagger';

export class FindingDto {
  @ApiProperty({
    enum: ['vulnerability', 'info', 'success'],
    example: 'vulnerability',
    description: 'Type of finding',
  })
  type: 'vulnerability' | 'info' | 'success';

  @ApiProperty({ example: 'XSS Vulnerability Detected', description: 'Title of the finding' })
  title: string;

  @ApiProperty({
    example: 'Detected reflected XSS in search parameter',
    description: 'Description of the finding',
  })
  description: string;

  @ApiProperty({
    enum: ['critical', 'high', 'moderate', 'low', 'info'],
    example: 'high',
    description: 'Severity level',
  })
  severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';

  @ApiProperty({ example: '2025-11-05T10:30:00Z', description: 'Timestamp of finding' })
  timestamp: string;
}

export class LogEntryDto {
  @ApiProperty({ example: '10:30:45', description: 'Timestamp of log entry' })
  timestamp: string;

  @ApiProperty({ enum: ['info', 'warning', 'error'], example: 'info', description: 'Log level' })
  level: 'info' | 'warning' | 'error';

  @ApiProperty({ example: 'Starting reconnaissance phase', description: 'Log message' })
  message: string;
}

export class AgentExecutionDto {
  @ApiProperty({ example: 'exec-123-456', description: 'Unique execution ID' })
  id: string;

  @ApiProperty({
    enum: ['running', 'paused', 'completed', 'failed'],
    example: 'running',
    description: 'Status of execution',
  })
  status: 'running' | 'paused' | 'completed' | 'failed';

  @ApiProperty({ example: 10, description: 'Current step number' })
  currentStep: number;

  @ApiProperty({ example: 50, description: 'Total number of steps' })
  totalSteps: number;

  @ApiProperty({ example: '2025-11-05T10:00:00Z', description: 'Start time of execution' })
  startTime: string;

  @ApiProperty({ example: 1800, description: 'Duration in seconds' })
  duration: number;

  @ApiProperty({ type: [FindingDto], description: 'List of findings discovered' })
  findings: FindingDto[];

  @ApiProperty({ type: [LogEntryDto], description: 'Execution logs' })
  logs: LogEntryDto[];
}
