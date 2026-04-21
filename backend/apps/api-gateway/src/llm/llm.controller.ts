import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LLMService } from './llm.service';
import { LLMConfigurationDto } from './dto/llm-configuration.dto';

@ApiTags('llm')
@Controller('llm')
export class LLMController {
  private readonly logger = new Logger(LLMController.name);

  constructor(private readonly llmService: LLMService) {}

  @Post('test-connection')
  @ApiOperation({
    summary: 'Test LLM connection',
    description: 'Tests the connection to a configured LLM provider with the provided credentials',
  })
  @ApiResponse({
    status: 200,
    description: 'Connection test result',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Connexion réussie à Gemini (gemini-3-flash-preview)' },
        model: { type: 'string', example: 'gemini-3-flash-preview' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid configuration',
  })
  async testConnection(@Body() config: LLMConfigurationDto) {
    this.logger.log(`Testing LLM connection: provider=${config.provider}, model=${config.model}`);

    const result = await this.llmService.testConnection(config);

    this.logger.log(
      `Connection test result: success=${result.success}, message=${result.message}`,
    );

    return result;
  }
}
