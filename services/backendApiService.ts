import io, { Socket } from 'socket.io-client';
import { TestConfiguration, TestResult, TestRunStatus } from '../types';

/**
 * Service d'intégration avec le backend NestJS
 *
 * Gère:
 * - Authentification JWT
 * - Appels REST API
 * - Connexion WebSocket pour temps réel
 */
class BackendApiService {
  private baseURL: string;
  private socket: Socket | null = null;
  private accessToken: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  }

  /**
   * Configure le token JWT pour les requêtes
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Récupère les headers avec authentification
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  /**
   * Crée un nouveau test run sur le backend
   */
  async createTestRun(config: TestConfiguration): Promise<{
    testRunId: string;
    status: TestRunStatus;
  }> {
    const response = await fetch(`${this.baseURL}/api/v1/tests/run`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        categories: config.categories,
        targetId: config.target.id,
        volume: config.volume,
        categorySensitivities: Object.entries(config.categorySensitivities).map(([category, sensitivity]) => ({
          category,
          sensitivity,
        })),
        complexities: config.complexities,
        description: `Test créé depuis le frontend - ${new Date().toLocaleString()}`,
        configuration: {
          customPlugins: config.customPlugins,
          sandboxConfig: config.sandboxConfig,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création du test');
    }

    const data = await response.json();
    return {
      testRunId: data.id,
      status: data.status,
    };
  }

  /**
   * Récupère les détails d'un test run
   */
  async getTestRun(testRunId: string) {
    const response = await fetch(`${this.baseURL}/api/v1/tests/runs/${testRunId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du test');
    }

    return response.json();
  }

  /**
   * Récupère les résultats d'un test run
   */
  async getTestResults(testRunId: string, page: number = 1): Promise<{
    results: TestResult[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const response = await fetch(
      `${this.baseURL}/api/v1/tests/runs/${testRunId}/results?page=${page}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des résultats');
    }

    return response.json();
  }

  /**
   * Annule un test en cours
   */
  async cancelTestRun(testRunId: string) {
    const response = await fetch(`${this.baseURL}/api/v1/tests/runs/${testRunId}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'annulation du test');
    }

    return response.json();
  }

  /**
   * Relance les tests échoués
   */
  async retryFailedTests(testRunId: string) {
    const response = await fetch(`${this.baseURL}/api/v1/tests/runs/${testRunId}/retry`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la relance des tests');
    }

    return response.json();
  }

  /**
   * Récupère la liste des targets disponibles
   */
  async getTestTargets() {
    const response = await fetch(`${this.baseURL}/api/v1/tests/targets`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des targets');
    }

    return response.json();
  }

  /**
   * Récupère l'historique des tests
   */
  async getTestHistory(page: number = 1, limit: number = 20) {
    const response = await fetch(
      `${this.baseURL}/api/v1/tests/runs?limit=${limit}&offset=${(page - 1) * limit}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'historique');
    }

    return response.json();
  }

  // ============== WEBSOCKET REAL-TIME UPDATES ==============

  /**
   * Établit une connexion WebSocket pour le temps réel
   */
  connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(`${this.baseURL}/tests`, {
        auth: {
          token: this.accessToken,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('[WebSocket] Connecté au backend');
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('[WebSocket] Erreur de connexion:', error);
        reject(error);
      });

      this.socket.on('error', (error) => {
        console.error('[WebSocket] Erreur:', error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[WebSocket] Déconnecté:', reason);
      });
    });
  }

  /**
   * S'abonne aux mises à jour d'un test run spécifique
   */
  subscribeToTestRun(
    testRunId: string,
    callbacks: {
      onProgress?: (data: any) => void;
      onResult?: (result: TestResult) => void;
      onCompleted?: (data: any) => void;
      onError?: (error: any) => void;
    }
  ) {
    if (!this.socket) {
      throw new Error('WebSocket non connecté. Appelez connectWebSocket() d\'abord.');
    }

    // S'abonner au test run
    this.socket.emit('test-run:subscribe', { testRunId });

    // Enregistrer les callbacks
    if (callbacks.onProgress) {
      this.socket.on('test-run:progress', callbacks.onProgress);
    }

    if (callbacks.onResult) {
      this.socket.on('test-run:result', callbacks.onResult);
    }

    if (callbacks.onCompleted) {
      this.socket.on('test-run:completed', callbacks.onCompleted);
    }

    if (callbacks.onError) {
      this.socket.on('test-run:error', callbacks.onError);
    }

    return () => {
      // Cleanup function pour se désabonner
      this.socket?.emit('test-run:unsubscribe', { testRunId });
      this.socket?.off('test-run:progress');
      this.socket?.off('test-run:result');
      this.socket?.off('test-run:completed');
      this.socket?.off('test-run:error');
    };
  }

  /**
   * Déconnecte le WebSocket
   */
  disconnectWebSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Vérifie si le WebSocket est connecté
   */
  isWebSocketConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton
export const backendApiService = new BackendApiService();
