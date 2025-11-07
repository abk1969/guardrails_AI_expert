import { Injectable, Logger, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PromptfooGateway } from './promptfoo.gateway';
import { PrismaService } from '@app/database';
import { TestRunStatus, TestStatus } from '@prisma/client';

const execAsync = promisify(exec);

@Injectable()
export class PromptfooService {
  private readonly logger = new Logger(PromptfooService.name);
  private readonly promptfooDir = join(
    process.cwd(),
    'guardrail',
    'solution_promptfoo',
    'ai-risk-guardrails-tests',
  );

  constructor(
    @Inject(forwardRef(() => PromptfooGateway))
    private readonly gateway: PromptfooGateway,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Lance l'exécution de tests Promptfoo
   */
  async runTests(
    yamlContent: string,
    userId?: string,
    organizationId?: string,
    targetId?: string,
  ): Promise<{ testRunId: string; estimatedDuration: string }> {
    const configPath = join(this.promptfooDir, `promptfooconfig-${Date.now()}.yaml`);

    this.logger.log(`Création du fichier de configuration: ${configPath}`);

    try {
      // 1. Vérifier que le répertoire existe
      await this.ensurePromptfooDirectoryExists();

      // 2. Écrire le fichier YAML
      await fs.writeFile(configPath, yamlContent, 'utf-8');
      this.logger.log(`✅ Fichier YAML créé: ${configPath}`);

      // 3. Créer un TestRun dans la base de données (si auth activée)
      let testRun;
      if (userId && organizationId && targetId) {
        testRun = await this.prisma.testRun.create({
          data: {
            createdById: userId,
            organizationId,
            targetId,
            status: TestRunStatus.QUEUED,
            configuration: { yamlContent },
            totalTests: 0, // Sera mis à jour après parsing
            metadata: { configPath, source: 'promptfoo' },
          },
        });
        this.logger.log(`✅ TestRun créé dans la base: ${testRun.id}`);
      }

      const testRunId = testRun?.id || `run-${Date.now()}`;

      // 4. Lancer Promptfoo en background
      this.runPromptfooAsync(configPath, testRunId);

      return {
        testRunId,
        estimatedDuration: '5-30 minutes',
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la création du test:`, error);
      throw new Error(`Échec de la création du fichier de configuration: ${error.message}`);
    }
  }

  /**
   * Lance Promptfoo en arrière-plan (ne bloque pas la réponse HTTP)
   */
  private async runPromptfooAsync(configPath: string, testRunId: string): Promise<void> {
    this.logger.log(`🚀 Lancement de Promptfoo (run ID: ${testRunId})...`);

    // Émettre événement de démarrage
    this.gateway.emitTestStarted(testRunId);
    this.gateway.emitLog(testRunId, '🚀 Démarrage de l\'exécution Promptfoo...');

    // Mettre à jour le statut en RUNNING si c'est un TestRun en base
    const isDbTestRun = !testRunId.startsWith('run-');
    if (isDbTestRun) {
      try {
        await this.prisma.testRun.update({
          where: { id: testRunId },
          data: { status: TestRunStatus.RUNNING },
        });
      } catch (error) {
        this.logger.warn(`Impossible de mettre à jour le TestRun ${testRunId}:`, error);
      }
    }

    // Lancer en background sans attendre
    setTimeout(async () => {
      try {
        // Simuler progression pendant l'exécution (en production, parser les logs Promptfoo)
        this.simulateProgress(testRunId);

        // Exécuter Promptfoo avec output JSON
        const { stdout, stderr } = await execAsync(
          `cd "${this.promptfooDir}" && npx promptfoo@latest eval -c "${configPath}" --output json`,
          {
            timeout: 3600000, // 1 heure max
          },
        );

        this.logger.log(`✅ Tests Promptfoo terminés (${testRunId})`);
        this.logger.debug(`STDOUT: ${stdout}`);

        if (stderr) {
          this.logger.warn(`STDERR: ${stderr}`);
        }

        // Parser et sauvegarder les résultats
        await this.parseAndSaveResults(testRunId, stdout);

        // Émettre événement de complétion
        this.gateway.emitTestCompleted(testRunId, { stdout, stderr });
        this.gateway.emitLog(testRunId, '✅ Tests terminés avec succès!');
      } catch (error) {
        this.logger.error(`❌ Erreur Promptfoo (${testRunId}):`, error);

        // Mettre à jour le statut en FAILED
        if (isDbTestRun) {
          try {
            await this.prisma.testRun.update({
              where: { id: testRunId },
              data: {
                status: TestRunStatus.FAILED,
                completedAt: new Date(),
              },
            });
          } catch (dbError) {
            this.logger.error(`Erreur lors de la mise à jour du statut FAILED:`, dbError);
          }
        }

        this.gateway.emitTestFailed(testRunId, error.message);
        this.gateway.emitLog(testRunId, `❌ Erreur: ${error.message}`);
      }
    }, 0);
  }

  /**
   * Simule la progression pour donner un feedback visuel
   * TODO: Parser les logs Promptfoo en temps réel pour progression réelle
   */
  private simulateProgress(testRunId: string): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5;
      if (progress >= 95) {
        progress = 95;
        clearInterval(interval);
      }

      const messages = [
        'Chargement de la configuration...',
        'Génération des prompts adversariaux...',
        'Exécution des tests de sécurité...',
        'Analyse des réponses du modèle...',
        'Évaluation des guardrails...',
        'Calcul des scores...',
      ];

      const message = messages[Math.floor(Math.random() * messages.length)];
      this.gateway.emitProgress(testRunId, Math.floor(progress), message);
    }, 3000); // Mise à jour toutes les 3 secondes
  }

  /**
   * Récupère le statut d'une exécution de tests
   */
  async getTestStatus(testRunId: string): Promise<{
    status: 'queued' | 'running' | 'completed' | 'failed';
    progress?: number;
  }> {
    // Récupérer le TestRun depuis la base de données
    const testRun = await this.prisma.testRun.findUnique({
      where: { id: testRunId },
      select: {
        status: true,
        progress: true,
      },
    });

    if (!testRun) {
      throw new NotFoundException(`Test run ${testRunId} not found`);
    }

    // Mapper le statut Prisma vers le format de réponse
    const statusMap: Record<TestRunStatus, 'queued' | 'running' | 'completed' | 'failed'> = {
      [TestRunStatus.PENDING]: 'queued',
      [TestRunStatus.QUEUED]: 'queued',
      [TestRunStatus.RUNNING]: 'running',
      [TestRunStatus.COMPLETED]: 'completed',
      [TestRunStatus.FAILED]: 'failed',
      [TestRunStatus.CANCELLED]: 'failed',
    };

    return {
      status: statusMap[testRun.status],
      progress: testRun.progress ?? 0,
    };
  }

  /**
   * Parse les résultats JSON de Promptfoo et les sauvegarde en base
   */
  private async parseAndSaveResults(testRunId: string, jsonOutput: string): Promise<void> {
    const isDbTestRun = !testRunId.startsWith('run-');

    if (!isDbTestRun) {
      this.logger.log(`TestRun ${testRunId} n'est pas en base, skip sauvegarde`);
      return;
    }

    try {
      // Parser le JSON de Promptfoo
      // Format attendu: { results: [...], stats: { ... } }
      const parsedOutput = JSON.parse(jsonOutput);
      const results = parsedOutput.results || parsedOutput;

      if (!Array.isArray(results)) {
        throw new Error('Format JSON invalide: results doit être un tableau');
      }

      this.logger.log(`Parsing de ${results.length} résultats Promptfoo...`);

      let passedCount = 0;
      let failedCount = 0;

      // Créer les TestResult records
      for (const result of results) {
        const passed = result.pass || result.success || result.score >= 0.7;
        if (passed) passedCount++;
        else failedCount++;

        await this.prisma.testResult.create({
          data: {
            testRunId,
            promptId: result.id || result.promptId || `prompt-${Date.now()}`,
            promptText: result.prompt || result.input || '',
            promptCategory: result.category || result.vars?.category || 'Sécurité',
            promptComplexity: result.complexity || result.vars?.complexity || 'Moyen',
            response: result.output || result.response || '',
            responseTime: result.latencyMs || result.duration || null,
            status: passed ? TestStatus.PASSED : TestStatus.FAILED,
            score: result.score || (passed ? 1.0 : 0.0),
            explanation: result.reason || result.gradingResult?.reason || null,
            evaluationChain: result.gradingResults || result.evaluationChain || [],
            remediation: result.remediation || null,
            metadata: {
              provider: result.provider,
              plugin: result.plugin,
              tags: result.tags,
            },
          },
        });
      }

      // Mettre à jour le TestRun avec les statistiques finales
      await this.prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: TestRunStatus.COMPLETED,
          totalTests: results.length,
          passedTests: passedCount,
          failedTests: failedCount,
          progress: 100,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `✅ Résultats sauvegardés: ${passedCount} passés, ${failedCount} échoués`,
      );
    } catch (error) {
      this.logger.error(`Erreur lors du parsing des résultats:`, error);
      throw error;
    }
  }

  /**
   * Récupère les résultats d'un test run depuis la base de données
   */
  async getTestResults(testRunId: string): Promise<any> {
    try {
      const testRun = await this.prisma.testRun.findUnique({
        where: { id: testRunId },
        include: {
          results: true,
          target: {
            select: {
              name: true,
              componentType: true,
            },
          },
        },
      });

      if (!testRun) {
        throw new Error(`TestRun ${testRunId} introuvable`);
      }

      // Calculer les statistiques par catégorie
      const categoryStats: Record<string, { passed: number; failed: number }> = {};
      const pluginStats: Record<string, number> = {};

      testRun.results.forEach((result) => {
        // Stats par catégorie
        if (!categoryStats[result.promptCategory]) {
          categoryStats[result.promptCategory] = { passed: 0, failed: 0 };
        }
        if (result.status === TestStatus.PASSED) {
          categoryStats[result.promptCategory].passed++;
        } else {
          categoryStats[result.promptCategory].failed++;
        }

        // Stats par plugin
        const plugin = (result.metadata as any)?.plugin || 'unknown';
        pluginStats[plugin] = (pluginStats[plugin] || 0) + 1;
      });

      return {
        testRunId: testRun.id,
        status: testRun.status,
        target: testRun.target,
        duration: testRun.completedAt
          ? `${Math.round((testRun.completedAt.getTime() - testRun.startedAt.getTime()) / 1000)} sec`
          : 'En cours',
        summary: {
          totalTests: testRun.totalTests,
          passed: testRun.passedTests,
          failed: testRun.failedTests,
          successRate: testRun.totalTests > 0
            ? Math.round((testRun.passedTests / testRun.totalTests) * 100)
            : 0,
          averageScore:
            testRun.results.length > 0
              ? testRun.results.reduce((sum, r) => sum + r.score, 0) / testRun.results.length
              : 0,
          criticalFailures: testRun.results.filter((r) => r.score < 0.3).length,
        },
        categoryStats,
        pluginStats,
        results: testRun.results.map((r) => ({
          id: r.id,
          prompt: r.promptText,
          response: r.response,
          score: r.score,
          passed: r.status === TestStatus.PASSED,
          plugin: (r.metadata as any)?.plugin || 'unknown',
          category: r.promptCategory,
          complexity: r.promptComplexity,
          explanation: r.explanation,
          responseTime: r.responseTime,
        })),
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération des résultats:`, error);
      throw error;
    }
  }

  /**
   * S'assure que le répertoire Promptfoo existe
   */
  private async ensurePromptfooDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.promptfooDir);
      this.logger.debug(`✅ Répertoire Promptfoo trouvé: ${this.promptfooDir}`);
    } catch (error) {
      this.logger.error(
        `❌ Répertoire Promptfoo introuvable: ${this.promptfooDir}`,
      );
      throw new Error(
        `Le répertoire Promptfoo n'existe pas: ${this.promptfooDir}. ` +
          `Assurez-vous que guardrail/solution_promptfoo/ai-risk-guardrails-tests existe.`,
      );
    }
  }

  /**
   * Valide une configuration YAML sans l'exécuter (dry-run)
   * Utilisé par le mode Guidé pour vérifier la config avant lancement
   */
  async validateYAML(yamlContent: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Vérifications de base sur le YAML
      if (!yamlContent || yamlContent.trim().length === 0) {
        errors.push('Configuration YAML vide');
        return { valid: false, errors, warnings };
      }

      // Vérifier les sections requises
      const requiredSections = ['prompts:', 'targets:', 'redteam:'];
      for (const section of requiredSections) {
        if (!yamlContent.includes(section)) {
          errors.push(`Section manquante: ${section}`);
        }
      }

      // Vérifier que numTests est défini et raisonnable
      const numTestsMatch = yamlContent.match(/numTests:\s*(\d+)/);
      if (numTestsMatch) {
        const numTests = parseInt(numTestsMatch[1], 10);
        if (numTests > 50) {
          warnings.push(`Nombre de tests élevé (${numTests}) - Durée d'exécution prolongée`);
        }
        if (numTests > 100) {
          errors.push(`Nombre de tests trop élevé (${numTests}) - Maximum recommandé: 100`);
        }
      } else {
        warnings.push('numTests non spécifié - valeur par défaut sera utilisée');
      }

      // Vérifier qu'au moins un plugin est défini
      if (!yamlContent.includes('plugins:')) {
        errors.push('Aucun plugin défini dans la section redteam');
      }

      // Vérifier que le répertoire Promptfoo existe
      try {
        await this.ensurePromptfooDirectoryExists();
      } catch (error) {
        errors.push(error.message);
      }

      const valid = errors.length === 0;

      this.logger.log(`Validation YAML: ${valid ? 'Succès' : 'Échec'} (${errors.length} erreurs, ${warnings.length} warnings)`);

      return { valid, errors, warnings };
    } catch (error) {
      this.logger.error('Erreur lors de la validation YAML:', error);
      errors.push(`Erreur de validation: ${error.message}`);
      return { valid: false, errors, warnings };
    }
  }
}
