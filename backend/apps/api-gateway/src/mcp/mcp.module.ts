import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { McpStaticDataService } from './mcp-static-data.service';

@Module({
  controllers: [McpController],
  providers: [McpService, McpStaticDataService],
  exports: [McpService, McpStaticDataService],
})
export class McpModule {}
