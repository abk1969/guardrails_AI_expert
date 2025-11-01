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

/**
 * Gateway WebSocket pour les mises à jour en temps réel des tests Promptfoo
 */
@WebSocketGateway({
  namespace: '/promptfoo',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5080',
    credentials: true,
  },
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
    this.logger.log(`Client connecté: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  /**
   * Gestion de la déconnexion d'un client
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  /**
   * Abonnement à un test run spécifique
   */
  @SubscribeMessage('subscribe-test')
  handleSubscribe(
    @MessageBody() data: { testRunId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `test-${data.testRunId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} abonné à ${room}`);
    return { success: true, room };
  }

  /**
   * Désabonnement d'un test run
   */
  @SubscribeMessage('unsubscribe-test')
  handleUnsubscribe(
    @MessageBody() data: { testRunId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `test-${data.testRunId}`;
    client.leave(room);
    this.logger.log(`Client ${client.id} désabonné de ${room}`);
    return { success: true };
  }

  /**
   * Émet un événement de démarrage de test
   */
  emitTestStarted(testRunId: string) {
    const room = `test-${testRunId}`;
    this.server.to(room).emit('test-started', {
      testRunId,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Événement test-started émis pour ${room}`);
  }

  /**
   * Émet une mise à jour de progression
   */
  emitProgress(testRunId: string, progress: number, message: string) {
    const room = `test-${testRunId}`;
    this.server.to(room).emit('test-progress', {
      testRunId,
      progress,
      message,
      timestamp: new Date().toISOString(),
    });
    this.logger.debug(`Progression ${progress}% pour ${room}: ${message}`);
  }

  /**
   * Émet un log en temps réel
   */
  emitLog(testRunId: string, log: string) {
    const room = `test-${testRunId}`;
    this.server.to(room).emit('test-log', {
      testRunId,
      log,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Émet un événement de fin de test (succès)
   */
  emitTestCompleted(testRunId: string, results: any) {
    const room = `test-${testRunId}`;
    this.server.to(room).emit('test-completed', {
      testRunId,
      results,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Événement test-completed émis pour ${room}`);
  }

  /**
   * Émet un événement de fin de test (échec)
   */
  emitTestFailed(testRunId: string, error: string) {
    const room = `test-${testRunId}`;
    this.server.to(room).emit('test-failed', {
      testRunId,
      error,
      timestamp: new Date().toISOString(),
    });
    this.logger.error(`Événement test-failed émis pour ${room}: ${error}`);
  }
}
