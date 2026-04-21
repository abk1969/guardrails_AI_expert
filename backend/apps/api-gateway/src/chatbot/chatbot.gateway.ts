import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WS_CORS_CONFIG, WS_TRANSPORT_OPTIONS } from '../shared/constants';

@WebSocketGateway({
  namespace: '/chatbot',
  cors: WS_CORS_CONFIG,
  ...WS_TRANSPORT_OPTIONS,
})
export class ChatbotGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatbotGateway.name);

  afterInit(server: Server) {
    this.logger.log('Chatbot WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Chatbot client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chatbot client disconnected: ${client.id}`);
  }

  emitThinking(sessionId: string, thought: string): void {
    this.server.emit(`chatbot:thinking:${sessionId}`, {
      thought,
      timestamp: new Date().toISOString(),
    });
  }

  emitToolCall(
    sessionId: string,
    toolName: string,
    parameters: any,
    toolCallId: string,
  ): void {
    this.server.emit(`chatbot:tool_call:${sessionId}`, {
      toolName,
      parameters,
      toolCallId,
      timestamp: new Date().toISOString(),
    });
  }

  emitToolResult(
    sessionId: string,
    toolName: string,
    toolCallId: string,
    result: any,
  ): void {
    this.server.emit(`chatbot:tool_result:${sessionId}`, {
      toolName,
      toolCallId,
      result,
      timestamp: new Date().toISOString(),
    });
  }

  emitComplete(
    sessionId: string,
    answer: string,
    toolsUsed: string[],
    iterations: number,
  ): void {
    this.server.emit(`chatbot:complete:${sessionId}`, {
      answer,
      toolsUsed,
      iterations,
      timestamp: new Date().toISOString(),
    });
  }

  emitError(sessionId: string, error: string): void {
    this.server.emit(`chatbot:error:${sessionId}`, {
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
