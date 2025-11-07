import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ExecutionMode, Framework } from './dto/unified-execution.dto';

@WebSocketGateway({
  namespace: 'unified',
  cors: {
    origin: '*',
    credentials: true,
  },
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
   * Emit unified execution started event
   */
  emitUnifiedStarted(
    unifiedId: string,
    mode: ExecutionMode,
    frameworks: Framework[],
  ): void {
    this.server.emit(`unified:started:${unifiedId}`, {
      unifiedId,
      mode,
      frameworks,
      timestamp: new Date().toISOString(),
      message: `Unified execution started in ${mode} mode with ${frameworks.length} frameworks`,
    });
    this.logger.log(`Emitted unified:started:${unifiedId} (${mode} mode, ${frameworks.length} frameworks)`);
  }

  /**
   * Emit framework started event
   */
  emitFrameworkStarted(unifiedId: string, framework: Framework): void {
    this.server.emit(`unified:framework:started:${unifiedId}`, {
      unifiedId,
      framework,
      timestamp: new Date().toISOString(),
      message: `Framework ${framework} started`,
    });
    this.logger.log(`Emitted unified:framework:started:${unifiedId} (${framework})`);
  }

  /**
   * Emit framework progress update
   */
  emitFrameworkProgress(
    unifiedId: string,
    framework: Framework,
    progress: number,
  ): void {
    this.server.emit(`unified:framework:progress:${unifiedId}`, {
      unifiedId,
      framework,
      progress,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(
      `Emitted unified:framework:progress:${unifiedId} (${framework}: ${progress}%)`,
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
    this.server.emit(`unified:framework:completed:${unifiedId}`, {
      unifiedId,
      framework,
      results,
      timestamp: new Date().toISOString(),
      message: `Framework ${framework} completed`,
    });
    this.logger.log(`Emitted unified:framework:completed:${unifiedId} (${framework})`);
  }

  /**
   * Emit framework failed event
   */
  emitFrameworkFailed(
    unifiedId: string,
    framework: Framework,
    error: string,
  ): void {
    this.server.emit(`unified:framework:failed:${unifiedId}`, {
      unifiedId,
      framework,
      error,
      timestamp: new Date().toISOString(),
      message: `Framework ${framework} failed: ${error}`,
    });
    this.logger.error(`Emitted unified:framework:failed:${unifiedId} (${framework}: ${error})`);
  }

  /**
   * Emit unified execution completed event
   */
  emitUnifiedCompleted(unifiedId: string, execution: any): void {
    this.server.emit(`unified:completed:${unifiedId}`, {
      unifiedId,
      execution,
      timestamp: new Date().toISOString(),
      message: 'Unified execution completed',
    });
    this.logger.log(`Emitted unified:completed:${unifiedId}`);
  }

  /**
   * Emit unified execution failed event
   */
  emitUnifiedFailed(unifiedId: string, error: string): void {
    this.server.emit(`unified:failed:${unifiedId}`, {
      unifiedId,
      error,
      timestamp: new Date().toISOString(),
      message: `Unified execution failed: ${error}`,
    });
    this.logger.error(`Emitted unified:failed:${unifiedId} - ${error}`);
  }

  /**
   * Emit unified execution stopped event
   */
  emitUnifiedStopped(unifiedId: string): void {
    this.server.emit(`unified:stopped:${unifiedId}`, {
      unifiedId,
      timestamp: new Date().toISOString(),
      message: 'Unified execution stopped by user',
    });
    this.logger.log(`Emitted unified:stopped:${unifiedId}`);
  }
}
