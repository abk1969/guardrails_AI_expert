import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PromptfooService } from './promptfoo.service';
import { RunPromptfooDto } from './dto/run-promptfoo.dto';

@ApiTags('promptfoo')
@Controller('promptfoo')
export class PromptfooController {
  private readonly logger = new Logger(PromptfooController.name);

  constructor(private readonly promptfooService: PromptfooService) {}

  /**
   * Lance l'exécution de tests Promptfoo avec la configuration YAML fournie
   *
   * ⚠️ TEMPORAIRE: Auth JWT désactivée pour faciliter les tests en développement
   * TODO: Réactiver @UseGuards(JwtAuthGuard) en production
   */
  @Post('run')
  // @UseGuards(JwtAuthGuard)  // ⚠️ Désactivé temporairement
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Lance des tests Promptfoo' })
  @ApiResponse({ status: 201, description: 'Tests lancés avec succès' })
  @ApiResponse({ status: 400, description: 'Configuration YAML invalide' })
  @ApiResponse({ status: 500, description: 'Erreur lors de l\'exécution' })
  async runPromptfooTests(@Body() dto: RunPromptfooDto) {
    this.logger.log('Démarrage des tests Promptfoo...');

    try {
      const result = await this.promptfooService.runTests(dto.yaml);
      return {
        success: true,
        message: 'Tests lancés avec succès',
        testRunId: result.testRunId,
        estimatedDuration: result.estimatedDuration,
      };
    } catch (error) {
      this.logger.error('Erreur lors du lancement des tests:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Échec du lancement des tests',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Vérifie le statut d'une exécution de tests
   *
   * ⚠️ TEMPORAIRE: Auth JWT désactivée pour faciliter les tests en développement
   */
  @Get('status/:testRunId')
  // @UseGuards(JwtAuthGuard)  // ⚠️ Désactivé temporairement
  // @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifie le statut des tests' })
  async getTestStatus(@Param('testRunId') testRunId: string) {
    try {
      const status = await this.promptfooService.getTestStatus(testRunId);
      return {
        success: true,
        status,
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération du statut:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération du statut',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère les résultats détaillés d'une exécution de tests
   */
  @Get('results/:testRunId')
  @ApiOperation({ summary: 'Récupère les résultats détaillés' })
  @ApiResponse({ status: 200, description: 'Résultats récupérés avec succès' })
  @ApiResponse({ status: 404, description: 'TestRun introuvable' })
  async getTestResults(@Param('testRunId') testRunId: string) {
    try {
      const results = await this.promptfooService.getTestResults(testRunId);
      return {
        success: true,
        results,
      };
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des résultats:', error);
      const status = error.message.includes('introuvable')
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la récupération des résultats',
          error: error.message,
        },
        status,
      );
    }
  }

  /**
   * Exécute un dry-run (validation sans exécution réelle)
   * Utilisé par le mode Guidé pour valider la configuration
   */
  @Post('dry-run')
  @ApiOperation({ summary: 'Valide la configuration YAML sans exécuter' })
  @ApiResponse({ status: 200, description: 'Validation réussie' })
  @ApiResponse({ status: 400, description: 'Configuration invalide' })
  async dryRun(@Body() dto: RunPromptfooDto) {
    this.logger.log('Dry-run: validation de la configuration...');

    try {
      const validation = await this.promptfooService.validateYAML(dto.yaml);
      return {
        success: validation.valid,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    } catch (error) {
      this.logger.error('Erreur lors du dry-run:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la validation',
          error: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
