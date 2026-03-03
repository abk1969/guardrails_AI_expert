import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  ArrayMinSize,
  IsInt,
  Min,
  Max,
} from 'class-validator';

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

export enum GarakModelType {
  OPENAI = 'openai',
  GOOGLE = 'google',
  GEMINI = 'gemini',
  ANTHROPIC = 'anthropic',
  HUGGINGFACE = 'huggingface',
  LITELLM = 'litellm',
}

/**
 * Predefined scan presets with curated probe sets.
 */
export enum GarakScanPreset {
  QUICK = 'quick',
  STANDARD = 'standard',
  THOROUGH = 'thorough',
}

/**
 * Maps scan presets to their probe configurations.
 */
export const SCAN_PRESET_PROBES: Record<GarakScanPreset, GarakProbeType[]> = {
  [GarakScanPreset.QUICK]: [
    GarakProbeType.INJECTION,
    GarakProbeType.JAILBREAK,
    GarakProbeType.TOXICITY,
  ],
  [GarakScanPreset.STANDARD]: [
    GarakProbeType.INJECTION,
    GarakProbeType.JAILBREAK,
    GarakProbeType.TOXICITY,
    GarakProbeType.ENCODING,
    GarakProbeType.LEAKAGE,
    GarakProbeType.HALLUCINATION,
    GarakProbeType.MALICIOUS,
  ],
  [GarakScanPreset.THOROUGH]: [GarakProbeType.ALL],
};

export class ScanConfigDto {
  @ApiProperty({ example: 'gpt-4', description: 'LLM model to scan' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional({
    example: 'openai',
    enum: GarakModelType,
    description: 'Model type/provider (openai, google, anthropic, huggingface, litellm)',
  })
  @IsOptional()
  @IsString()
  modelType?: string;

  @ApiPropertyOptional({
    description: 'API key for the model provider. Passed as environment variable to the container.',
  })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({
    type: [String],
    enum: GarakProbeType,
    example: ['injection', 'toxicity'],
    description: 'Types of probes to run. Use "all" to run every available probe.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(GarakProbeType, { each: true })
  probes: string[];

  @ApiProperty({
    type: [String],
    example: ['default'],
    description: 'Generators to use for prompt generation',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  generators: string[];

  @ApiProperty({
    type: [String],
    example: ['default'],
    description: 'Detectors to use for vulnerability detection',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  detectors: string[];

  @ApiPropertyOptional({
    enum: GarakScanPreset,
    example: 'standard',
    description:
      'Scan preset that overrides probes with a curated set: quick (3 probes), standard (7 probes), thorough (all probes)',
  })
  @IsOptional()
  @IsEnum(GarakScanPreset)
  preset?: GarakScanPreset;

  @ApiPropertyOptional({
    example: 3600000,
    description: 'Scan timeout in milliseconds. Default: 3600000 (1 hour). Max: 7200000 (2 hours).',
  })
  @IsOptional()
  @IsInt()
  @Min(60000)
  @Max(7200000)
  timeoutMs?: number;
}
