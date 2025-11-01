import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional } from 'class-validator';

export class McpRequestDto {
  @ApiProperty({
    description: 'MCP tool name to execute',
    example: 'search_ai_policies',
  })
  @IsString()
  tool: string;

  @ApiProperty({
    description: 'Tool parameters',
    example: { query: 'injection de prompt', limit: 10 },
  })
  @IsObject()
  @IsOptional()
  parameters?: Record<string, any>;
}

export class McpResponseDto {
  @ApiProperty({ description: 'Tool execution result' })
  result: any;

  @ApiProperty({ description: 'Tool name that was executed' })
  tool: string;

  @ApiProperty({ description: 'Execution timestamp' })
  timestamp: string;
}
