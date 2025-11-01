import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';
import { GeneratePromptsDto } from './dto/generate-prompts.dto';
import { ChatDto } from './dto/chat.dto';

@ApiTags('gemini')
@Controller('gemini')
export class GeminiController {
  private readonly logger = new Logger(GeminiController.name);

  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate-prompts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate test prompts using Gemini AI',
    description: 'Generates adversarial prompts to test LLM guardrails based on specified categories and complexity levels',
  })
  @ApiResponse({
    status: 200,
    description: 'Prompts generated successfully',
    schema: {
      type: 'object',
      properties: {
        prompts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              text: { type: 'string' },
              category: { type: 'string' },
              complexity: { type: 'string' },
              templateId: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async generatePrompts(@Body() dto: GeneratePromptsDto) {
    this.logger.log(`Received request to generate ${dto.count} prompts`);

    try {
      const prompts = await this.geminiService.generatePrompts(dto);
      return { prompts };
    } catch (error) {
      this.logger.error('Error in generatePrompts controller', error);
      throw error;
    }
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat with Gemini AI',
    description: 'Send a message to Gemini AI and receive a response with optional context',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat response received',
    schema: {
      type: 'object',
      properties: {
        response: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async chat(@Body() dto: ChatDto) {
    this.logger.log('Received chat request');

    try {
      const response = await this.geminiService.chat(dto);
      return { response };
    } catch (error) {
      this.logger.error('Error in chat controller', error);
      throw error;
    }
  }
}
