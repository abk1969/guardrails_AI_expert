import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'garak',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class GarakGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GarakGateway.name);

  afterInit(server: Server) {
    this.logger.log('Garak WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Garak client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Garak client disconnected: ${client.id}`);
  }

  /**
   * Emit scan started event
   */
  emitScanStarted(scanId: string): void {
    this.server.emit(`garak:started:${scanId}`, {
      scanId,
      timestamp: new Date().toISOString(),
      message: 'Garak scan started',
    });
    this.logger.debug(`Emitted garak:started:${scanId}`);
  }

  /**
   * Emit progress update
   */
  emitProgress(scanId: string, progress: number, message: string): void {
    this.server.emit(`garak:progress:${scanId}`, {
      scanId,
      progress,
      message,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Emitted garak:progress:${scanId} - ${progress}%`);
  }

  /**
   * Emit log message
   */
  emitLog(scanId: string, log: string): void {
    this.server.emit(`garak:log:${scanId}`, {
      scanId,
      log,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit vulnerability found
   */
  emitVulnerabilityFound(
    scanId: string,
    vulnerability: {
      category: string;
      severity: string;
      description: string;
    },
  ): void {
    this.server.emit(`garak:vulnerability:${scanId}`, {
      scanId,
      vulnerability,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(
      `Emitted garak:vulnerability:${scanId} - ${vulnerability.category} (${vulnerability.severity})`,
    );
  }

  /**
   * Emit scan completed event
   */
  emitScanCompleted(
    scanId: string,
    results: {
      stdout?: string;
      stderr?: string;
      totalTests: number;
      passed: number;
      failed: number;
    },
  ): void {
    this.server.emit(`garak:completed:${scanId}`, {
      scanId,
      results,
      timestamp: new Date().toISOString(),
      message: 'Garak scan completed successfully',
    });
    this.logger.log(`Emitted garak:completed:${scanId}`);
  }

  /**
   * Emit scan failed event
   */
  emitScanFailed(scanId: string, error: string): void {
    this.server.emit(`garak:failed:${scanId}`, {
      scanId,
      error,
      timestamp: new Date().toISOString(),
      message: 'Garak scan failed',
    });
    this.logger.error(`Emitted garak:failed:${scanId} - ${error}`);
  }
}
