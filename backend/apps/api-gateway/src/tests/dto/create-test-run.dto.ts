import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GuardrailCategory, PromptComplexity } from '@prisma/client';

export class CategorySensitivityDto {
  @ApiProperty({ enum: GuardrailCategory })
  @IsEnum(GuardrailCategory)
  category: GuardrailCategory;

  @ApiProperty({ enum: ['Tolérant', 'Normal', 'Strict'] })
  @IsEnum(['Tolérant', 'Normal', 'Strict'])
  sensitivity: 'Tolérant' | 'Normal' | 'Strict';
}

export class CreateTestRunDto {
  @ApiProperty({
    description: 'Guardrail categories to test',
    enum: GuardrailCategory,
    isArray: true,
    example: [GuardrailCategory.SECURITY_PRIVACY, GuardrailCategory.CONTENT_VALIDATION],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(GuardrailCategory, { each: true })
  categories: GuardrailCategory[];

  @ApiProperty({
    description: 'Test target UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({
    description: 'Number of test prompts to generate',
    minimum: 1,
    maximum: 1000,
    example: 50,
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  volume: number;

  @ApiProperty({
    description: 'Sensitivity level per category',
    type: [CategorySensitivityDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategorySensitivityDto)
  categorySensitivities: CategorySensitivityDto[];

  @ApiProperty({
    description: 'Prompt complexity levels',
    enum: PromptComplexity,
    isArray: true,
    example: [PromptComplexity.SIMPLE, PromptComplexity.MOYEN],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(PromptComplexity, { each: true })
  complexities: PromptComplexity[];

  @ApiProperty({
    description: 'Optional description for this test run',
    required: false,
  })
  @IsString()
  description?: string;
}
