import { Module } from '@nestjs/common';
import { StrixController } from './strix.controller';
import { StrixService } from './strix.service';
import { StrixGateway } from './strix.gateway';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [DatabaseModule],
  controllers: [StrixController],
  providers: [StrixService, StrixGateway],
  exports: [StrixService, StrixGateway],
})
export class StrixModule {}
