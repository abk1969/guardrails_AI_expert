import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';

export enum GarakProbeType {
  ALL = 'all',
  ENCODING = 'encoding',
  INJECTION = 'injection',
  TOXICITY = 'toxicity',
  JAILBREAK = 'jailbreak',
  HALLUCINATION = 'hallucination',
  LEAKAGE = 'leakage',
  MALICIOUS = 'malicious',
}

export class ScanConfigDto {
  @ApiProperty({ example: 'gpt-4', description: 'LLM model to scan' })
  @IsString()
  model: string;

  @ApiProperty({
    example: 'openai',
    description: 'Model type (openai, huggingface, etc.)',
    required: false,
  })
  @IsOptional()
  @IsString()
  modelType?: string;

  @ApiProperty({ required: false, description: 'API key for the model (optional)' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({
    type: [String],
    enum: GarakProbeType,
    example: ['injection', 'toxicity'],
    description: 'Types of probes to run',
  })
  @IsArray()
  @IsEnum(GarakProbeType, { each: true })
  probes: string[];

  @ApiProperty({
    type: [String],
    example: ['default'],
    description: 'Generators to use',
  })
  @IsArray()
  @IsString({ each: true })
  generators: string[];

  @ApiProperty({
    type: [String],
    example: ['default'],
    description: 'Detectors to use',
  })
  @IsArray()
  @IsString({ each: true })
  detectors: string[];
}
