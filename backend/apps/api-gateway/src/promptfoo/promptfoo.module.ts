import { Module } from '@nestjs/common';
import { PromptfooController } from './promptfoo.controller';
import { PromptfooService } from './promptfoo.service';
import { PromptfooGateway } from './promptfoo.gateway';

@Module({
  controllers: [PromptfooController],
  providers: [PromptfooService, PromptfooGateway],
  exports: [PromptfooService, PromptfooGateway],
})
export class PromptfooModule {}
