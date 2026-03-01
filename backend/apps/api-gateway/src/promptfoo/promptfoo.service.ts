import { Injectable, Logger, Inject, forwardRef, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PromptfooGateway } from './promptfoo.gateway';
import { PrismaService } from '@app/database';
import { TestRunStatus, TestStatus } from '@prisma/client';
import { execAsync, execFileAsync, ensureDirectory } from '../shared/security-tool.utils';
import { DEV_DEFAULTS } from '../shared/constants';

// Container name for Promptfoo runner
const PROMPTFOO_CONTAINER = 'airiskmgr-promptfoo-runner';

@Injectable()
export class PromptfooService {
  private readonly logger = new Logger(PromptfooService.name);
  private readonly localConfigDir = join(process.cwd(), 'promptfoo-configs');
  private readonly containerConfigDir = '/app/configs';
  private readonly containerOutputDir = '/app/output';

  constructor(
    @Inject(forwardRef(() => PromptfooGateway))
    private readonly gateway: PromptfooGateway,
    private readonly prisma: PrismaService,
  ) {
    this.ensureLocalConfigDir();
  }

  private async ensureLocalConfigDir(): Promise<void> {
    await ensureDirectory(this.localConfigDir, this.logger);
  }

  /**
   * Lance l'exécution de tests Promptfoo via Docker container
   */
  async runTests(
    yamlContent: string,
    userId?: string,
    organizationId?: string,
    targetId?: string,
  ): Promise<{ testRunId: string; estimatedDuration: string }> {
    const timestamp = Date.now();
    const configFileName = `promptfooconfig-${timestamp}.yaml`;
    const localConfigPath = join(this.localConfigDir, configFileName);
    const containerConfigPath = `${this.containerConfigDir}/${configFileName}`;

    this.logger.log(`Creating Promptfoo configuration: ${configFileName}`);

    try {
      // 1. Write YAML config locally
      await fs.writeFile(localConfigPath, yamlContent, 'utf-8');
      this.logger.log(`✅ YAML config written locally: ${localConfigPath}`);

      // 2. Copy config to container using docker cp
      await this.copyConfigToContainer(localConfigPath, containerConfigPath);
      this.logger.log(`✅ Config copied to container: ${containerConfigPath}`);

      // 3. Create TestRun in database (if auth enabled)
      let testRun;

      try {
        testRun = await this.prisma.testRun.create({
          data: {
            createdById: userId || DEV_DEFAULTS.USER_ID,
            organizationId: organizationId || DEV_DEFAULTS.ORGANIZATION_ID,
            targetId: targetId || DEV_DEFAULTS.TARGET_ID,
            status: TestRunStatus.QUEUED,
            configuration: { yamlContent },
            totalTests: 0,
            metadata: { configPath: containerConfigPath, source: 'promptfoo' },
          },
        });
        this.logger.log(`✅ TestRun created in database: ${testRun.id}`);
      } catch (dbError) {
        this.logger.warn('Database unavailable, running in memory-only mode');
      }

      const testRunId = testRun?.id || `run-${timestamp}`;

      // 4. Launch Promptfoo in background via docker exec
      this.runPromptfooInDocker(containerConfigPath, testRunId);

      return {
        testRunId,
        estimatedDuration: '5-30 minutes',
      };
    } catch (error) {
      this.logger.error(`Error creating test:`, error);
      throw new Error(`Failed to create configuration: ${error.message}`);
    }
  }

  /**
   * Copy config file to Promptfoo container
   */
  private async copyConfigToContainer(localPath: string, containerPath: string): Promise<void> {
    const copyCommand = `docker cp "${localPath}" ${PROMPTFOO_CONTAINER}:${containerPath}`;
    this.logger.debug(`Executing: ${copyCommand}`);

    try {
      await execAsync(copyCommand, { timeout: 30000 });
    } catch (error) {
      this.logger.error('Failed to copy config to container:', error);
      throw new Error(`Failed to copy config to container: ${error.message}`);
    }
  }

  /**
   * Run Promptfoo in Docker container (non-blocking)
   */
  private async runPromptfooInDocker(containerConfigPath: string, testRunId: string): Promise<void> {
    this.logger.log(`🚀 Launching Promptfoo in Docker (run ID: ${testRunId})...`);

    // Emit start event
    this.gateway.emitTestStarted(testRunId);
    this.gateway.emitLog(testRunId, '🚀 Starting Promptfoo execution in container...');

    // Update status to RUNNING
    const isDbTestRun = !testRunId.startsWith('run-');
    if (isDbTestRun) {
      try {
        await this.prisma.testRun.update({
          where: { id: testRunId },
          data: { status: TestRunStatus.RUNNING },
        });
      } catch (error) {
        this.logger.warn(`Could not update TestRun ${testRunId}:`, error);
      }
    }

    // Run in background
    setTimeout(async () => {
      try {
        // Simulate progress
        this.simulateProgress(testRunId);

        // Build docker exec command
        const outputFile = `${this.containerOutputDir}/results-${testRunId}.json`;
        const dockerArgs = [
          'exec',
          PROMPTFOO_CONTAINER,
          'npx', 'promptfoo@latest', 'eval',
          '-c', containerConfigPath,
          '--output', outputFile,
          '--no-progress-bar',
        ];

        this.logger.log(`Executing: docker ${dockerArgs.join(' ')}`);
        this.gateway.emitLog(testRunId, `Executing Promptfoo in container...`);
        this.gateway.emitProgress(testRunId, 20, 'Running tests...');

        // Execute via docker exec
        const { stdout, stderr } = await execFileAsync('docker', dockerArgs, {
          timeout: 3600000, // 1 hour max
          maxBuffer: 10 * 1024 * 1024, // 10MB
        });

        this.logger.log(`✅ Promptfoo tests completed (${testRunId})`);
        this.logger.debug(`STDOUT: ${stdout.substring(0, 500)}`);

        if (stderr) {
          this.logger.warn(`STDERR: ${stderr}`);
        }

        // Copy results from container
        this.gateway.emitProgress(testRunId, 85, 'Copying results...');
        const localOutputPath = join(this.localConfigDir, `results-${testRunId}.json`);

        try {
          await execAsync(`docker cp ${PROMPTFOO_CONTAINER}:${outputFile} "${localOutputPath}"`, { timeout: 30000 });
          const resultsContent = await fs.readFile(localOutputPath, 'utf-8');
          await this.parseAndSaveResults(testRunId, resultsContent);
        } catch (copyError) {
          this.logger.warn('Could not copy results file, parsing stdout instead');
          await this.parseAndSaveResults(testRunId, stdout);
        }

        // Emit completion event
        this.gateway.emitProgress(testRunId, 100, 'Completed!');
        this.gateway.emitTestCompleted(testRunId, { stdout, stderr });
        this.gateway.emitLog(testRunId, '✅ Tests completed successfully!');
      } catch (error) {
        this.logger.error(`❌ Promptfoo error (${testRunId}):`, error);

        // Update status to FAILED
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
            this.logger.error(`Error updating FAILED status:`, dbError);
          }
        }

        this.gateway.emitTestFailed(testRunId, error.message);
        this.gateway.emitLog(testRunId, `❌ Error: ${error.message}`);
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
   * Check if Promptfoo container is running
   */
  private async checkContainerRunning(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `docker inspect --format='{{.State.Running}}' ${PROMPTFOO_CONTAINER}`,
        { timeout: 5000 }
      );
      return stdout.trim() === 'true';
    } catch (error) {
      return false;
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
      // Basic YAML validations
      if (!yamlContent || yamlContent.trim().length === 0) {
        errors.push('Configuration YAML vide');
        return { valid: false, errors, warnings };
      }

      // Check for simple YAML structure (prompts-only mode for basic tests)
      const hasPrompts = yamlContent.includes('prompts:');
      const hasTargets = yamlContent.includes('targets:') || yamlContent.includes('providers:');
      const hasRedteam = yamlContent.includes('redteam:');

      // Minimal validation - at least prompts required
      if (!hasPrompts) {
        errors.push('Section manquante: prompts:');
      }

      // Warn about missing sections but don't fail
      if (!hasTargets) {
        warnings.push('Section providers/targets manquante - tests simplifiés');
      }

      if (!hasRedteam) {
        warnings.push('Section redteam manquante - mode de test basique');
      }

      // Check numTests if defined
      const numTestsMatch = yamlContent.match(/numTests:\s*(\d+)/);
      if (numTestsMatch) {
        const numTests = parseInt(numTestsMatch[1], 10);
        if (numTests > 50) {
          warnings.push(`Nombre de tests élevé (${numTests}) - Durée d'exécution prolongée`);
        }
        if (numTests > 100) {
          errors.push(`Nombre de tests trop élevé (${numTests}) - Maximum recommandé: 100`);
        }
      }

      // Check if container is running
      const containerRunning = await this.checkContainerRunning();
      if (!containerRunning) {
        errors.push(`Container ${PROMPTFOO_CONTAINER} n'est pas en cours d'exécution. Démarrez-le avec: docker-compose up -d promptfoo-runner`);
      }

      const valid = errors.length === 0;

      this.logger.log(`YAML Validation: ${valid ? 'Success' : 'Failed'} (${errors.length} errors, ${warnings.length} warnings)`);

      return { valid, errors, warnings };
    } catch (error) {
      this.logger.error('Error validating YAML:', error);
      errors.push(`Erreur de validation: ${error.message}`);
      return { valid: false, errors, warnings };
    }
  }
}
