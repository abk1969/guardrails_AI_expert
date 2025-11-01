import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

/**
 * WebSocket JWT Authentication Guard
 *
 * Extrait et valide le JWT depuis le handshake WebSocket
 * Supporte deux méthodes d'authentification:
 * 1. Header Authorization: Bearer <token>
 * 2. Query param: ?token=<token>
 */
@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get WebSocket client
    const client: Socket = context.switchToWs().getClient<Socket>();

    try {
      // Extract token from handshake
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        this.disconnectClient(client, 'No authentication token provided');
        return false;
      }

      // Verify and decode token
      const payload = this.jwtService.verify(token);

      // Attach user info to socket for later use
      client.handshake.auth = {
        ...client.handshake.auth,
        user: {
          id: payload.sub,
          email: payload.email,
          organizationId: payload.organizationId,
          roles: payload.roles,
        },
      };

      return true;
    } catch (error) {
      this.disconnectClient(client, `Authentication failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Extrait le token depuis le handshake WebSocket
   */
  private extractTokenFromHandshake(client: Socket): string | null {
    // 1. Try Authorization header: "Bearer <token>"
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 2. Try auth object from client (socket.io auth option)
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token;
    }

    // 3. Try query parameter: ?token=<token>
    if (client.handshake.query?.token) {
      return Array.isArray(client.handshake.query.token)
        ? client.handshake.query.token[0]
        : client.handshake.query.token;
    }

    return null;
  }

  /**
   * Déconnecte le client avec un message d'erreur
   */
  private disconnectClient(client: Socket, reason: string): void {
    client.emit('error', {
      message: reason,
      code: 'AUTHENTICATION_FAILED',
    });
    client.disconnect();
  }
}
