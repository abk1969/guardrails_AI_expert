import { TestConfiguration, TestResult } from '../types';

/**
 * Service d'intégration avec Promptfoo pour exécution de tests réels
 *
 * ⚠️ IMPORTANT: Ce service nécessite Node.js et doit être exécuté côté serveur.
 *
 * Pour exécuter des tests réels avec Promptfoo:
 * 1. Utilisez le mode "backend" dans TestRunContext
 * 2. Le backend gèrera l'exécution de Promptfoo via des processus Node.js
 *
 * Ce stub frontal est fourni uniquement pour compatibilité.
 */
export class PromptfooIntegrationService {

  /**
   * Lance des tests réels avec Promptfoo (stub frontend)
   *
   * ⚠️ Cette méthode ne peut pas fonctionner côté client car elle nécessite:
   * - Accès au système de fichiers (fs)
   * - Exécution de processus externes (child_process)
   * - Surveillance de fichiers (chokidar)
   *
   * ✅ Utilisez le mode "backend" à la place pour exécuter des tests réels.
   */
  async runRealTests(
    config: TestConfiguration,
    onProgress: (result: TestResult) => void,
    onLog?: (message: string) => void
  ): Promise<void> {
    const log = (msg: string) => {
      console.log(`[Promptfoo] ${msg}`);
      onLog?.(msg);
    };

    log('⚠️ Mode "real" détecté dans le frontend');
    log('❌ L\'exécution de Promptfoo nécessite Node.js (backend)');
    log('');
    log('✅ Solutions disponibles:');
    log('1. Utiliser le mode "backend" dans les paramètres de test');
    log('2. Utiliser le mode "simulation" pour des tests mock');
    log('');
    log('💡 Le mode "backend" offre:');
    log('   • Exécution réelle de Promptfoo via Node.js');
    log('   • WebSocket pour mises à jour en temps réel');
    log('   • Gestion complète des résultats');

    throw new Error(
      'Le mode "real" avec Promptfoo direct n\'est pas supporté côté client. ' +
      'Veuillez utiliser le mode "backend" pour exécuter des tests réels, ' +
      'ou le mode "simulation" pour des tests mock.'
    );
  }

  /**
   * Arrête les processus en cours
   */
  stop(): void {
    console.log('[Promptfoo] Aucun processus à arrêter (stub frontend)');
  }
}

/**
 * Instance singleton du service
 */
export const promptfooIntegrationService = new PromptfooIntegrationService();

/**
 * Export par défaut pour compatibilité
 */
export default promptfooIntegrationService;
