import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ExecutionMode, Framework } from './dto/unified-execution.dto';
import { WS_CORS_CONFIG, WS_TRANSPORT_OPTIONS } from '../shared/constants';

@WebSocketGateway({
  namespace: '/unified',
  cors: WS_CORS_CONFIG,
  ...WS_TRANSPORT_OPTIONS,
})
export class UnifiedGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UnifiedGateway.name);

  afterInit(server: Server) {
    this.logger.log('Unified WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Unified client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Unified client disconnected: ${client.id}`);
  }

  /**
   * Subscribe to a specific unified execution's events
   */
  @SubscribeMessage('unified:subscribe')
  handleSubscribe(
    @MessageBody() data: { unifiedId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `unified:${data.unifiedId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    return { success: true, room };
  }

  /**
   * Unsubscribe from a unified execution
   */
  @SubscribeMessage('unified:unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { unifiedId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `unified:${data.unifiedId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
    return { success: true };
  }

  // --- Emit methods (room-based + broadcast for backward compat) ---

  /**
   * Emit unified execution started event
   */
  emitUnifiedStarted(
    unifiedId: string,
    mode: ExecutionMode,
    frameworks: Framework[],
  ): void {
    const payload = {
      unifiedId,
      mode,
      frameworks,
      timestamp: new Date().toISOString(),
      message: `Unified execution started in ${mode} mode with ${frameworks.length} frameworks`,
    };
    // Room-based emission
    this.server.to(`unified:${unifiedId}`).emit('unified:started', payload);
    // Broadcast for clients not subscribed to specific room
    this.server.emit(`unified:started:${unifiedId}`, payload);
    this.logger.log(`Emitted unified:started for ${unifiedId} (${mode} mode, ${frameworks.length} frameworks)`);
  }

  /**
   * Emit framework started event
   */
  emitFrameworkStarted(unifiedId: string, framework: Framework): void {
    const payload = {
      unifiedId,
      framework,
      timestamp: new Date().toISOString(),
      message: `Framework ${framework} started`,
    };
    this.server.to(`unified:${unifiedId}`).emit('unified:framework:started', payload);
    this.server.emit(`unified:framework:started:${unifiedId}`, payload);
    this.logger.log(`Emitted unified:framework:started for ${unifiedId} (${framework})`);
  }

  /**
   * Emit framework progress update
   */
  emitFrameworkProgress(
    unifiedId: string,
    framework: Framework,
    progress: number,
  ): void {
    const payload = {
      unifiedId,
      framework,
      progress,
      timestamp: new Date().toISOString(),
    };
    this.server.to(`unified:${unifiedId}`).emit('unified:framework:progress', payload);
    this.server.emit(`unified:framework:progress:${unifiedId}`, payload);
    this.logger.debug(
      `Emitted unified:framework:progress for ${unifiedId} (${framework}: ${progress}%)`,
    );
  }

  /**
   * Emit framework completed event
   */
  emitFrameworkCompleted(
    unifiedId: string,
    framework: Framework,
    results: any,
  ): void {
    const payload = {
      unifiedId,
      framework,
      results,
      timestamp: new Date().toISOString(),
      message: `Framework ${framework} completed`,
    };
    this.server.to(`unified:${unifiedId}`).emit('unified:framework:completed', payload);
    this.server.emit(`unified:framework:completed:${unifiedId}`, payload);
    this.logger.log(`Emitted unified:framework:completed for ${unifiedId} (${framework})`);
  }

  /**
   * Emit framework failed event
   */
  emitFrameworkFailed(
    unifiedId: string,
    framework: Framework,
    error: string,
  ): void {
    const payload = {
      unifiedId,
      framework,
      error,
      timestamp: new Date().toISOString(),
      message: `Framework ${framework} failed: ${error}`,
    };
    this.server.to(`unified:${unifiedId}`).emit('unified:framework:failed', payload);
    this.server.emit(`unified:framework:failed:${unifiedId}`, payload);
    this.logger.error(`Emitted unified:framework:failed for ${unifiedId} (${framework}: ${error})`);
  }

  /**
   * Emit unified execution completed event
   */
  emitUnifiedCompleted(unifiedId: string, execution: any): void {
    const payload = {
      unifiedId,
      execution,
      timestamp: new Date().toISOString(),
      message: 'Unified execution completed',
    };
    this.server.to(`unified:${unifiedId}`).emit('unified:completed', payload);
    this.server.emit(`unified:completed:${unifiedId}`, payload);
    this.logger.log(`Emitted unified:completed for ${unifiedId}`);
  }

  /**
   * Emit unified execution failed event
   */
  emitUnifiedFailed(unifiedId: string, error: string): void {
    const payload = {
      unifiedId,
      error,
      timestamp: new Date().toISOString(),
      message: `Unified execution failed: ${error}`,
    };
    this.server.to(`unified:${unifiedId}`).emit('unified:failed', payload);
    this.server.emit(`unified:failed:${unifiedId}`, payload);
    this.logger.error(`Emitted unified:failed for ${unifiedId} - ${error}`);
  }

  /**
   * Emit unified execution stopped event
   */
  emitUnifiedStopped(unifiedId: string): void {
    const payload = {
      unifiedId,
      timestamp: new Date().toISOString(),
      message: 'Unified execution stopped by user',
    };
    this.server.to(`unified:${unifiedId}`).emit('unified:stopped', payload);
    this.server.emit(`unified:stopped:${unifiedId}`, payload);
    this.logger.log(`Emitted unified:stopped for ${unifiedId}`);
  }
}
