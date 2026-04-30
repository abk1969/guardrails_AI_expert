import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReactAgentService } from './react-agent.service';
import { ChatbotSendDto, ChatbotSendResponseDto } from './dto/chatbot.dto';
import { randomUUID } from 'crypto';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  private readonly logger = new Logger(ChatbotController.name);

  constructor(private readonly reactAgentService: ReactAgentService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a message to the agentic chatbot' })
  @ApiResponse({ status: 200, type: ChatbotSendResponseDto })
  async sendMessage(
    @Body() dto: ChatbotSendDto,
    @CurrentUser() user: any,
  ): Promise<ChatbotSendResponseDto> {
    const sessionId = randomUUID();
    const provider = dto.llmConfig?.provider ?? 'gemini (server default)';
    this.logger.log(
      `New chatbot session: ${sessionId}, provider: ${provider}`,
    );

    // Process asynchronously - don't await (results stream via WebSocket)
    this.reactAgentService
      .processMessage(dto, sessionId, user.organizationId)
      .catch((err) =>
        this.logger.error(`Session ${sessionId} failed:`, err),
      );

    return { sessionId };
  }
}
