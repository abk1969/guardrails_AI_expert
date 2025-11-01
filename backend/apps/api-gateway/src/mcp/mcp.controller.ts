import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@app/auth/decorators/current-user.decorator';
import { McpService } from './mcp.service';
import { McpRequestDto, McpResponseDto } from './dto/mcp.dto';

@ApiTags('mcp')
@Controller({ path: 'mcp', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute MCP tool query' })
  @ApiResponse({
    status: 200,
    description: 'MCP query executed successfully',
    type: McpResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid MCP request' })
  async executeMcpQuery(
    @Body() request: McpRequestDto,
    @CurrentUser() user: any,
  ): Promise<McpResponseDto> {
    return this.mcpService.executeQuery(request, user.organizationId);
  }

  @Post('tools/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List available MCP tools' })
  @ApiResponse({
    status: 200,
    description: 'List of available MCP tools',
  })
  async listTools(): Promise<{ tools: Array<{ name: string; description: string }> }> {
    return this.mcpService.listTools();
  }
}
