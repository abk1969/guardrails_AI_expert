import { IsArray, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum GuardrailCategory {
  SECURITY_PRIVACY = 'Sécurité et Confidentialité',
  RELEVANCE_RESPONSE = 'Pertinence et Réponse',
  LINGUISTIC_QUALITY = 'Qualité Linguistique',
  CONTENT_VALIDATION = 'Validation de Contenu',
  LOGICAL_VALIDATION = 'Validation Logique',
}

export enum PromptComplexity {
  SIMPLE = 'Simple',
  MOYEN = 'Moyen',
  SOPHISTIQUE = 'Sophistiqué',
}

export class GeneratePromptsDto {
  @ApiProperty({
    description: 'List of guardrail categories to test',
    enum: GuardrailCategory,
    isArray: true,
    example: [GuardrailCategory.SECURITY_PRIVACY],
  })
  @IsArray()
  @IsEnum(GuardrailCategory, { each: true })
  categories: GuardrailCategory[];

  @ApiProperty({
    description: 'Number of prompts to generate',
    minimum: 1,
    maximum: 1000,
    example: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(1000)
  count: number;

  @ApiProperty({
    description: 'Complexity levels for the prompts',
    enum: PromptComplexity,
    isArray: true,
    example: [PromptComplexity.SIMPLE, PromptComplexity.MOYEN],
  })
  @IsArray()
  @IsEnum(PromptComplexity, { each: true })
  complexities: PromptComplexity[];
}
