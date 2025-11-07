import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsNumber, Min, Max, IsUrl } from 'class-validator';

export enum AttackMode {
  LIGHT = 'light',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive',
}

export class AgentConfigDto {
  @ApiProperty({ example: 'https://example.com', description: 'Target URL to test' })
  @IsUrl()
  targetUrl: string;

  @ApiProperty({
    enum: AttackMode,
    example: AttackMode.MODERATE,
    description: 'Attack mode: light (reconnaissance), moderate (standard tests), aggressive (advanced tests)',
  })
  @IsEnum(AttackMode)
  attackMode: AttackMode;

  @ApiProperty({ example: true, description: 'Run in headless mode (no browser UI)' })
  @IsBoolean()
  headless: boolean;

  @ApiProperty({ example: 50, description: 'Maximum number of steps for the agent' })
  @IsNumber()
  @Min(10)
  @Max(200)
  maxSteps: number;

  @ApiProperty({ example: 300, description: 'Timeout in seconds' })
  @IsNumber()
  @Min(60)
  @Max(1800)
  timeout: number;
}
