import { Module, forwardRef } from '@nestjs/common';
import { UnifiedController } from './unified.controller';
import { UnifiedService } from './unified.service';
import { UnifiedOrchestrationController } from './unified-orchestration.controller';
import { UnifiedOrchestrationService } from './unified-orchestration.service';
import { UnifiedGateway } from './unified.gateway';
import { DatabaseModule } from '@app/database';
import { GarakModule } from '../garak/garak.module';
import { StrixModule } from '../strix/strix.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => GarakModule),
    forwardRef(() => StrixModule),
  ],
  controllers: [UnifiedController, UnifiedOrchestrationController],
  providers: [UnifiedService, UnifiedOrchestrationService, UnifiedGateway],
  exports: [UnifiedService, UnifiedOrchestrationService, UnifiedGateway],
})
export class UnifiedModule {}
