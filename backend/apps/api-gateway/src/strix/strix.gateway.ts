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
  namespace: '/strix',
  cors: WS_CORS_CONFIG,
  ...WS_TRANSPORT_OPTIONS,
})
export class StrixGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(StrixGateway.name);

  afterInit(server: Server) {
    this.logger.log('Strix WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Strix client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Strix client disconnected: ${client.id}`);
  }

  /**
   * Emit execution started event
   */
  emitExecutionStarted(executionId: string): void {
    this.server.emit(`strix:started:${executionId}`, {
      executionId,
      timestamp: new Date().toISOString(),
      message: 'Strix agent execution started',
    });
    this.logger.debug(`Emitted strix:started:${executionId}`);
  }

  /**
   * Emit progress update
   */
  emitProgress(
    executionId: string,
    currentStep: number,
    totalSteps: number,
    message: string,
  ): void {
    const progress = Math.floor((currentStep / totalSteps) * 100);
    this.server.emit(`strix:progress:${executionId}`, {
      executionId,
      currentStep,
      totalSteps,
      progress,
      message,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(
      `Emitted strix:progress:${executionId} - ${currentStep}/${totalSteps} (${progress}%)`,
    );
  }

  /**
   * Emit log message
   */
  emitLog(executionId: string, log: string): void {
    this.server.emit(`strix:log:${executionId}`, {
      executionId,
      log,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit finding discovered
   */
  emitFindingDiscovered(
    executionId: string,
    finding: {
      type: string;
      title: string;
      description: string;
      severity: string;
      timestamp: string;
    },
  ): void {
    this.server.emit(`strix:finding:${executionId}`, {
      executionId,
      finding,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(
      `Emitted strix:finding:${executionId} - ${finding.title} (${finding.severity})`,
    );
  }

  /**
   * Emit execution paused event
   */
  emitExecutionPaused(executionId: string): void {
    this.server.emit(`strix:paused:${executionId}`, {
      executionId,
      timestamp: new Date().toISOString(),
      message: 'Strix agent execution paused',
    });
    this.logger.log(`Emitted strix:paused:${executionId}`);
  }

  /**
   * Emit execution resumed event
   */
  emitExecutionResumed(executionId: string): void {
    this.server.emit(`strix:resumed:${executionId}`, {
      executionId,
      timestamp: new Date().toISOString(),
      message: 'Strix agent execution resumed',
    });
    this.logger.log(`Emitted strix:resumed:${executionId}`);
  }

  /**
   * Emit execution stopped event
   */
  emitExecutionStopped(executionId: string): void {
    this.server.emit(`strix:stopped:${executionId}`, {
      executionId,
      timestamp: new Date().toISOString(),
      message: 'Strix agent execution stopped by user',
    });
    this.logger.log(`Emitted strix:stopped:${executionId}`);
  }

  /**
   * Emit execution completed event
   */
  emitExecutionCompleted(
    executionId: string,
    execution: {
      status: string;
      currentStep: number;
      totalSteps: number;
      duration: number;
      findings: any[];
    },
  ): void {
    this.server.emit(`strix:completed:${executionId}`, {
      executionId,
      execution,
      timestamp: new Date().toISOString(),
      message: 'Strix agent execution completed successfully',
    });
    this.logger.log(
      `Emitted strix:completed:${executionId} - ${execution.findings.length} findings`,
    );
  }

  /**
   * Emit execution failed event
   */
  emitExecutionFailed(executionId: string, error: string): void {
    this.server.emit(`strix:failed:${executionId}`, {
      executionId,
      error,
      timestamp: new Date().toISOString(),
      message: 'Strix agent execution failed',
    });
    this.logger.error(`Emitted strix:failed:${executionId} - ${error}`);
  }
}
