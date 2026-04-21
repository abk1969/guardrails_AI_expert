import { Module } from '@nestjs/common';
import { LLMController } from './llm.controller';
import { LLMService } from './llm.service';
import { LLMChatService } from './llm-chat.service';

@Module({
  controllers: [LLMController],
  providers: [LLMService, LLMChatService],
  exports: [LLMService, LLMChatService],
})
export class LLMModule {}
