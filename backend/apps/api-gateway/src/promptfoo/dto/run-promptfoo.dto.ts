import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RunPromptfooDto {
  @ApiProperty({
    description: 'Configuration YAML Promptfoo complète',
    example: `description: "Test AI Risk Manager"
prompts:
  - "You are an AI assistant. {{prompt}}"
targets:
  - vertex:gemini-2.0-flash-exp
redteam:
  purpose: "Security testing"
  numTests: 10
  plugins:
    - prompt-injection
    - pii`,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50, { message: 'Configuration YAML trop courte (minimum 50 caractères)' })
  yaml: string;
}
