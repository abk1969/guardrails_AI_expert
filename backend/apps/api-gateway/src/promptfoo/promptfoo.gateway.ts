import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WS_CORS_CONFIG, WS_TRANSPORT_OPTIONS } from '../shared/constants';

@WebSocketGateway({
  namespace: '/promptfoo',
  cors: WS_CORS_CONFIG,
  ...WS_TRANSPORT_OPTIONS,
})
export class PromptfooGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PromptfooGateway.name);
  private connectedClients = new Map<string, Socket>();

  /**
   * Gestion de la connexion d'un client
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  /**
   * Gestion de la deconnexion d'un client
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * Abonnement a un test run specifique
   */
  @SubscribeMessage('promptfoo:subscribe')
  handleSubscribe(
    @MessageBody() data: { testRunId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `promptfoo:${data.testRunId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    return { success: true, room };
  }

  /**
   * Desabonnement d'un test run
   */
  @SubscribeMessage('promptfoo:unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { testRunId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `promptfoo:${data.testRunId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
    return { success: true };
  }

  // --- Legacy event names for backward compatibility ---

  /**
   * Legacy subscribe handler (old event name)
   */
  @SubscribeMessage('subscribe-test')
  handleLegacySubscribe(
    @MessageBody() data: { testRunId: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.handleSubscribe(data, client);
  }

  /**
   * Legacy unsubscribe handler (old event name)
   */
  @SubscribeMessage('unsubscribe-test')
  handleLegacyUnsubscribe(
    @MessageBody() data: { testRunId: string },
    @ConnectedSocket() client: Socket,
  ) {
    return this.handleUnsubscribe(data, client);
  }

  // --- Emit methods ---

  /**
   * Emet un evenement de demarrage de test.
   * Emits to both new and legacy room names.
   */
  emitTestStarted(testRunId: string) {
    const payload = {
      testRunId,
      timestamp: new Date().toISOString(),
    };
    this.server.to(`promptfoo:${testRunId}`).emit('promptfoo:started', payload);
    // Legacy event for backward compatibility
    this.server.to(`test-${testRunId}`).emit('test-started', payload);
    this.logger.log(`Event promptfoo:started emitted for ${testRunId}`);
  }

  /**
   * Emet une mise a jour de progression
   */
  emitProgress(testRunId: string, progress: number, message: string) {
    const payload = {
      testRunId,
      progress,
      message,
      timestamp: new Date().toISOString(),
    };
    this.server.to(`promptfoo:${testRunId}`).emit('promptfoo:progress', payload);
    this.server.to(`test-${testRunId}`).emit('test-progress', payload);
    this.logger.debug(`Progress ${progress}% for ${testRunId}: ${message}`);
  }

  /**
   * Emet un log en temps reel
   */
  emitLog(testRunId: string, log: string) {
    const payload = {
      testRunId,
      log,
      timestamp: new Date().toISOString(),
    };
    this.server.to(`promptfoo:${testRunId}`).emit('promptfoo:log', payload);
    this.server.to(`test-${testRunId}`).emit('test-log', payload);
  }

  /**
   * Emet un evenement de fin de test (succes)
   */
  emitTestCompleted(testRunId: string, results: any) {
    const payload = {
      testRunId,
      results,
      timestamp: new Date().toISOString(),
    };
    this.server.to(`promptfoo:${testRunId}`).emit('promptfoo:completed', payload);
    this.server.to(`test-${testRunId}`).emit('test-completed', payload);
    this.logger.log(`Event promptfoo:completed emitted for ${testRunId}`);
  }

  /**
   * Emet un evenement de fin de test (echec)
   */
  emitTestFailed(testRunId: string, error: string) {
    const payload = {
      testRunId,
      error,
      timestamp: new Date().toISOString(),
    };
    this.server.to(`promptfoo:${testRunId}`).emit('promptfoo:failed', payload);
    this.server.to(`test-${testRunId}`).emit('test-failed', payload);
    this.logger.error(`Event promptfoo:failed emitted for ${testRunId}: ${error}`);
  }
}
