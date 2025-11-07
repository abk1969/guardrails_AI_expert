import { Module } from '@nestjs/common';
import { GarakController } from './garak.controller';
import { GarakService } from './garak.service';
import { GarakGateway } from './garak.gateway';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  controllers: [GarakController],
  providers: [GarakService, GarakGateway],
  exports: [GarakService, GarakGateway],
})
export class GarakModule {}
