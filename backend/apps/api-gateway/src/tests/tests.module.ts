import { Module } from '@nestjs/common';
import { AuthModule } from '@app/auth';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { TestsGateway } from './tests.gateway';

@Module({
  imports: [AuthModule],
  controllers: [TestsController],
  providers: [TestsService, TestsGateway],
  exports: [TestsService, TestsGateway],
})
export class TestsModule {}
