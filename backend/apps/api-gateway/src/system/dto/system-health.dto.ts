import { ApiProperty } from '@nestjs/swagger';

export class ToolCheckDto {
  @ApiProperty({ example: '3.11.0', description: 'Version of the tool' })
  version: string;

  @ApiProperty({ example: true, description: 'Whether the tool is available and functioning' })
  ok: boolean;

  @ApiProperty({ example: false, description: 'Whether this tool is required for the platform', required: false })
  required?: boolean;

  @ApiProperty({ example: 'Tool not found in PATH', description: 'Error message if check failed', required: false })
  error?: string;
}

export class SystemHealthDto {
  @ApiProperty({
    enum: ['healthy', 'degraded', 'unhealthy'],
    example: 'healthy',
    description: 'Overall system health status',
  })
  status: 'healthy' | 'degraded' | 'unhealthy';

  @ApiProperty({ type: ToolCheckDto, description: 'Python 3.9+ check' })
  python: ToolCheckDto;

  @ApiProperty({ type: ToolCheckDto, description: 'pipx check' })
  pipx: ToolCheckDto;

  @ApiProperty({ type: ToolCheckDto, description: 'Garak LLM scanner check' })
  garak: ToolCheckDto;

  @ApiProperty({ type: ToolCheckDto, description: 'Strix agent check' })
  strix: ToolCheckDto;

  @ApiProperty({ type: ToolCheckDto, description: 'Node.js 18+ check' })
  node: ToolCheckDto;

  @ApiProperty({ type: ToolCheckDto, description: 'Promptfoo check' })
  promptfoo: ToolCheckDto;

  @ApiProperty({ type: ToolCheckDto, description: 'Docker check (REQUIRED)' })
  docker: ToolCheckDto;

  @ApiProperty({ type: String, description: 'ISO timestamp of the health check' })
  timestamp: string;

  @ApiProperty({ type: [String], description: 'List of missing dependencies', required: false })
  missingDependencies?: string[];

  @ApiProperty({ type: String, description: 'Recommendations for fixing issues', required: false })
  recommendations?: string;
}
