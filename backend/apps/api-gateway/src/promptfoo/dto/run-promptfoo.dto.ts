import { IsString, IsNotEmpty, MinLength, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Custom validator: checks that YAML content contains required Promptfoo sections.
 */
@ValidatorConstraint({ name: 'yamlStructureValidator', async: false })
export class YamlStructureValidator implements ValidatorConstraintInterface {
  validate(yaml: string, _args: ValidationArguments): boolean {
    if (!yaml || typeof yaml !== 'string') return false;

    // Must contain at least a prompts section
    return yaml.includes('prompts:');
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Configuration YAML invalide: section "prompts:" requise';
  }
}

/**
 * Custom validator: checks that YAML does not contain tabs (YAML requires spaces).
 */
@ValidatorConstraint({ name: 'yamlNoTabsValidator', async: false })
export class YamlNoTabsValidator implements ValidatorConstraintInterface {
  validate(yaml: string, _args: ValidationArguments): boolean {
    if (!yaml || typeof yaml !== 'string') return true;
    return !yaml.includes('\t');
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Configuration YAML invalide: les tabulations ne sont pas autorisees, utilisez des espaces';
  }
}

export class RunPromptfooDto {
  @ApiProperty({
    description: 'Configuration YAML Promptfoo complete. Doit contenir au minimum une section "prompts:".',
    example: `description: "Test AI Risk Manager"
prompts:
  - "You are an AI assistant. {{prompt}}"
providers:
  - openai:gpt-4o-mini
redteam:
  purpose: "Security testing"
  numTests: 10
  plugins:
    - prompt-injection
    - pii`,
    minLength: 50,
  })
  @IsString()
  @IsNotEmpty({ message: 'Configuration YAML requise' })
  @MinLength(50, { message: 'Configuration YAML trop courte (minimum 50 caracteres)' })
  @Validate(YamlStructureValidator)
  @Validate(YamlNoTabsValidator)
  yaml: string;
}
