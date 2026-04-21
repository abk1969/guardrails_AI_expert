import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LLMProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  MISTRAL = 'mistral',
  CLAUDE = 'claude',
  DEEPSEEK = 'deepseek',
  QWEN = 'qwen',
  XAI_GROK = 'xai-grok',
  GROQ = 'groq',
  OLLAMA = 'ollama',
  LM_STUDIO = 'lm-studio',
}

export class LLMConfigurationDto {
  @ApiProperty({
    enum: LLMProvider,
    description: 'LLM provider type',
    example: 'gemini',
  })
  @IsEnum(LLMProvider)
  provider: LLMProvider;

  @ApiPropertyOptional({
    description: 'API key for cloud providers (not required for local providers)',
    example: 'AIza...',
  })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({
    description: 'Model identifier',
    example: 'gemini-3-flash-preview',
  })
  @IsString()
  model: string;

  @ApiPropertyOptional({
    description: 'Base URL for local providers (Ollama, LM Studio)',
    example: 'http://localhost:11434',
  })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({
    description: 'Temperature parameter (0-2)',
    example: 0.7,
    minimum: 0,
    maximum: 2,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Maximum tokens to generate',
    example: 4096,
  })
  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @ApiPropertyOptional({
    description: 'Top P sampling parameter',
    example: 0.9,
  })
  @IsOptional()
  @IsNumber()
  topP?: number;

  @ApiPropertyOptional({
    description: 'Top K sampling parameter',
    example: 40,
  })
  @IsOptional()
  @IsNumber()
  topK?: number;
}
