import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ReactAgentService } from './react-agent.service';
import { ChatbotGateway } from './chatbot.gateway';
import { McpModule } from '../mcp/mcp.module';
import { LLMModule } from '../llm/llm.module';

@Module({
  imports: [McpModule, LLMModule],
  controllers: [ChatbotController],
  providers: [ReactAgentService, ChatbotGateway],
  exports: [ReactAgentService],
})
export class ChatbotModule {}
