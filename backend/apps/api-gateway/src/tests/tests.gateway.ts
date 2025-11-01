import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtAuthGuard } from '@app/auth/guards/ws-jwt-auth.guard';

/**
 * WebSocket Gateway pour les mises à jour en temps réel des tests
 *
 * Événements émis par le serveur:
 * - test-run:progress - Mise à jour de progression
 * - test-run:result - Nouveau résultat de test
 * - test-run:completed - Test terminé
 * - test-run:error - Erreur durant l'exécution
 *
 * Événements reçus du client:
 * - test-run:subscribe - S'abonner aux updates d'un test
 * - test-run:unsubscribe - Se désabonner
 */
@WebSocketGateway({
  namespace: '/tests',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5080',
    credentials: true,
  },
})
@UseGuards(WsJwtAuthGuard)
export class TestsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TestsGateway.name);

  /**
   * Gestion de la connexion d'un client
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connecté: ${client.id}`);

    // Récupérer les infos utilisateur depuis le JWT
    const user = client.handshake.auth.user || client.handshake.headers.user;
    if (user) {
      // Rejoindre automatiquement une room organization-specific
      client.join(`org:${user.organizationId}`);
      this.logger.log(`Client ${client.id} a rejoint l'organisation ${user.organizationId}`);
    }
  }

  /**
   * Gestion de la déconnexion d'un client
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`);
  }

  /**
   * S'abonner aux mises à jour d'un test run spécifique
   */
  @SubscribeMessage('test-run:subscribe')
  handleSubscribe(
    @MessageBody() data: { testRunId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `test-run:${data.testRunId}`;
    client.join(roomName);
    this.logger.log(`Client ${client.id} s'est abonné au test ${data.testRunId}`);

    return {
      event: 'test-run:subscribed',
      data: { testRunId: data.testRunId, success: true },
    };
  }

  /**
   * Se désabonner des mises à jour d'un test run
   */
  @SubscribeMessage('test-run:unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { testRunId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = `test-run:${data.testRunId}`;
    client.leave(roomName);
    this.logger.log(`Client ${client.id} s'est désabonné du test ${data.testRunId}`);

    return {
      event: 'test-run:unsubscribed',
      data: { testRunId: data.testRunId, success: true },
    };
  }

  /**
   * Émettre une mise à jour de progression pour un test run
   * Appelé par le TestsService lors de l'exécution des tests
   */
  emitProgress(testRunId: string, data: {
    progress: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    blockedTests: number;
  }) {
    const roomName = `test-run:${testRunId}`;
    this.server.to(roomName).emit('test-run:progress', {
      testRunId,
      ...data,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(`Progression émise pour ${testRunId}: ${data.progress}%`);
  }

  /**
   * Émettre un nouveau résultat de test
   */
  emitTestResult(testRunId: string, result: any) {
    const roomName = `test-run:${testRunId}`;
    this.server.to(roomName).emit('test-run:result', {
      testRunId,
      result,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(`Résultat émis pour ${testRunId}`);
  }

  /**
   * Émettre la completion d'un test run
   */
  emitCompletion(testRunId: string, data: {
    status: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    blockedTests: number;
    duration: number;
  }) {
    const roomName = `test-run:${testRunId}`;
    this.server.to(roomName).emit('test-run:completed', {
      testRunId,
      ...data,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Test ${testRunId} terminé: ${data.status}`);
  }

  /**
   * Émettre une erreur
   */
  emitError(testRunId: string, error: {
    message: string;
    code?: string;
    details?: any;
  }) {
    const roomName = `test-run:${testRunId}`;
    this.server.to(roomName).emit('test-run:error', {
      testRunId,
      error,
      timestamp: new Date().toISOString(),
    });

    this.logger.error(`Erreur pour ${testRunId}: ${error.message}`);
  }

  /**
   * Diffuser une notification à tous les clients d'une organisation
   */
  emitToOrganization(organizationId: string, event: string, data: any) {
    const roomName = `org:${organizationId}`;
    this.server.to(roomName).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(`Notification émise à l'organisation ${organizationId}: ${event}`);
  }
}
