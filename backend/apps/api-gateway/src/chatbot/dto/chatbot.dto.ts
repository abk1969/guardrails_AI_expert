import { IsString, IsArray, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsString()
  role: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content: string;
}

export class LLMConfigDto {
  @ApiProperty({ example: 'claude' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'claude-sonnet-4-20250514' })
  @IsString()
  model: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional()
  @IsOptional()
  maxTokens?: number;
}

export class ChatbotSendDto {
  @ApiProperty({ description: 'User message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Conversation history', type: [ChatMessageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  conversationHistory?: ChatMessageDto[];

  @ApiPropertyOptional({ description: 'LLM configuration (if omitted, backend uses its own GEMINI_API_KEY from env)' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LLMConfigDto)
  llmConfig?: LLMConfigDto;
}

export class ChatbotSendResponseDto {
  @ApiProperty({ description: 'Session ID for WebSocket subscription' })
  sessionId: string;
}
