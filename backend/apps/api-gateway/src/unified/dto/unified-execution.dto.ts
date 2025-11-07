import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsArray, IsOptional, IsString, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Execution mode for unified testing
 */
export enum ExecutionMode {
  PARALLEL = 'parallel',     // Run all frameworks simultaneously
  SEQUENTIAL = 'sequential', // Run frameworks one after another
  SELECTIVE = 'selective',   // Run only selected frameworks
}

/**
 * Framework selection
 */
export enum Framework {
  PROMPTFOO = 'promptfoo',
  GARAK = 'garak',
  STRIX = 'strix',
}

/**
 * Promptfoo-specific configuration
 */
export class PromptfooConfigDto {
  @ApiProperty({ example: 'my-test-suite', description: 'Promptfoo test suite name' })
  @IsString()
  suiteName: string;

  @ApiProperty({ example: '/path/to/promptfooconfig.yaml', description: 'Path to Promptfoo config file' })
  @IsOptional()
  @IsString()
  configPath?: string;

  @ApiProperty({ type: [String], example: ['provider-1', 'provider-2'], description: 'Providers to test' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  providers?: string[];

  @ApiProperty({ type: [String], example: ['prompt-injection', 'pii-leak'], description: 'Test categories' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  testCategories?: string[];
}

/**
 * Garak-specific configuration
 */
export class GarakConfigDto {
  @ApiProperty({ example: 'gpt-4', description: 'LLM model to scan' })
  @IsString()
  model: string;

  @ApiProperty({ example: 'openai', description: 'Model type' })
  @IsOptional()
  @IsString()
  modelType?: string;

  @ApiProperty({ type: [String], example: ['injection', 'toxicity'], description: 'Probe types' })
  @IsArray()
  @IsString({ each: true })
  probes: string[];

  @ApiProperty({ type: [String], example: ['default'], description: 'Generators to use' })
  @IsArray()
  @IsString({ each: true })
  generators: string[];

  @ApiProperty({ type: [String], example: ['default'], description: 'Detectors to use' })
  @IsArray()
  @IsString({ each: true })
  detectors: string[];
}

/**
 * Strix attack mode enum
 */
export enum AttackMode {
  LIGHT = 'light',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
}

/**
 * Strix-specific configuration
 */
export class StrixConfigDto {
  @ApiProperty({ example: 'https://example.com/api/chat', description: 'Target URL to test' })
  @IsString()
  targetUrl: string;

  @ApiProperty({ enum: AttackMode, example: AttackMode.MODERATE, description: 'Attack intensity' })
  @IsEnum(AttackMode)
  attackMode: AttackMode;

  @ApiProperty({ example: 50, description: 'Maximum number of agent steps' })
  maxSteps: number;

  @ApiProperty({ example: 3600, description: 'Timeout in seconds' })
  timeout: number;

  @ApiProperty({ example: true, description: 'Run in headless mode' })
  headless: boolean;
}

/**
 * Unified execution configuration
 */
export class UnifiedExecutionConfigDto {
  @ApiProperty({
    enum: ExecutionMode,
    example: ExecutionMode.PARALLEL,
    description: 'Execution mode (parallel, sequential, selective)'
  })
  @IsEnum(ExecutionMode)
  mode: ExecutionMode;

  @ApiProperty({
    type: [String],
    enum: Framework,
    example: [Framework.PROMPTFOO, Framework.GARAK, Framework.STRIX],
    description: 'Frameworks to execute'
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Framework, { each: true })
  frameworks: Framework[];

  @ApiProperty({ type: PromptfooConfigDto, required: false, description: 'Promptfoo configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PromptfooConfigDto)
  promptfoo?: PromptfooConfigDto;

  @ApiProperty({ type: GarakConfigDto, required: false, description: 'Garak configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => GarakConfigDto)
  garak?: GarakConfigDto;

  @ApiProperty({ type: StrixConfigDto, required: false, description: 'Strix configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => StrixConfigDto)
  strix?: StrixConfigDto;
}

/**
 * Framework execution status
 */
export class FrameworkExecutionStatusDto {
  @ApiProperty({ enum: Framework, example: Framework.GARAK, description: 'Framework name' })
  framework: Framework;

  @ApiProperty({ enum: ['pending', 'running', 'completed', 'failed'], example: 'running', description: 'Execution status' })
  status: 'pending' | 'running' | 'completed' | 'failed';

  @ApiProperty({ example: 'exec-123-456', description: 'Framework-specific execution ID' })
  executionId?: string;

  @ApiProperty({ example: 45, description: 'Progress percentage (0-100)' })
  progress: number;

  @ApiProperty({ example: '2025-01-07T13:30:00Z', description: 'Start time' })
  startTime?: string;

  @ApiProperty({ example: '2025-01-07T13:45:00Z', description: 'End time' })
  endTime?: string;

  @ApiProperty({ example: 'Scan failed: timeout', description: 'Error message if failed' })
  error?: string;

  @ApiProperty({ example: { vulnerabilities: 5, findings: 12 }, description: 'Framework-specific results summary' })
  results?: any;
}

/**
 * Unified execution response
 */
export class UnifiedExecutionDto {
  @ApiProperty({ example: 'unified-exec-123-456', description: 'Unified execution ID' })
  id: string;

  @ApiProperty({ enum: ExecutionMode, example: ExecutionMode.PARALLEL, description: 'Execution mode' })
  mode: ExecutionMode;

  @ApiProperty({
    enum: ['pending', 'running', 'completed', 'failed', 'partial'],
    example: 'running',
    description: 'Overall execution status'
  })
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';

  @ApiProperty({ type: [FrameworkExecutionStatusDto], description: 'Individual framework execution statuses' })
  frameworks: FrameworkExecutionStatusDto[];

  @ApiProperty({ example: '2025-01-07T13:30:00Z', description: 'Start time' })
  startTime: string;

  @ApiProperty({ example: '2025-01-07T14:00:00Z', description: 'End time' })
  endTime?: string;

  @ApiProperty({ example: 1800, description: 'Total duration in seconds' })
  duration: number;

  @ApiProperty({ example: { totalVulnerabilities: 15, totalFindings: 45 }, description: 'Aggregated results' })
  aggregatedResults?: any;
}
