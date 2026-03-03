import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '@app/auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { DEV_DEFAULTS } from '../shared/constants';
import { PromptfooService } from './promptfoo.service';
import { RunPromptfooDto } from './dto/run-promptfoo.dto';

@ApiTags('promptfoo')
@Controller('promptfoo')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PromptfooController {
  private readonly logger = new Logger(PromptfooController.name);

  constructor(private readonly promptfooService: PromptfooService) {}

  /**
   * Lance l'execution de tests Promptfoo avec la configuration YAML fournie
   */
  @Public()
  @Post('run')
  @ApiOperation({ summary: 'Lance des tests Promptfoo' })
  @ApiResponse({ status: 201, description: 'Tests lances avec succes' })
  @ApiResponse({ status: 400, description: 'Configuration YAML invalide ou container non disponible' })
  @ApiResponse({ status: 401, description: 'Non autorise' })
  @ApiResponse({ status: 500, description: "Erreur lors de l'execution" })
  async runPromptfooTests(
    @CurrentUser() user: User,
    @Body() dto: RunPromptfooDto,
  ) {
    this.logger.log('Starting Promptfoo tests...');

    try {
      const userId = user?.id || DEV_DEFAULTS.USER_ID;
      const organizationId = (user as any)?.organizationId || DEV_DEFAULTS.ORGANIZATION_ID;

      const result = await this.promptfooService.runTests(
        dto.yaml,
        userId,
        organizationId,
      );
      return {
        success: true,
        message: 'Tests lances avec succes',
        testRunId: result.testRunId,
        estimatedDuration: result.estimatedDuration,
      };
    } catch (error) {
      this.logger.error('Error starting tests:', error);
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          success: false,
          message: 'Echec du lancement des tests',
          error: error.message,
        },
        status,
      );
    }
  }

  /**
   * Verifie le statut d'une execution de tests
   */
  @Public()
  @Get('status/:testRunId')
  @ApiOperation({ summary: 'Verifie le statut des tests' })
  @ApiParam({ name: 'testRunId', description: 'ID du test run' })
  @ApiResponse({ status: 200, description: 'Statut recupere' })
  @ApiResponse({ status: 404, description: 'TestRun introuvable' })
  async getTestStatus(@Param('testRunId') testRunId: string) {
    try {
      const status = await this.promptfooService.getTestStatus(testRunId);
      return {
        success: true,
        ...status,
      };
    } catch (error) {
      this.logger.error('Error getting test status:', error);
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la recuperation du statut',
          error: error.message,
        },
        status,
      );
    }
  }

  /**
   * Recupere les resultats detailles d'une execution de tests
   */
  @Public()
  @Get('results/:testRunId')
  @ApiOperation({ summary: 'Recupere les resultats detailles avec pagination' })
  @ApiParam({ name: 'testRunId', description: 'ID du test run' })
  @ApiQuery({ name: 'page', required: false, description: 'Numero de page (defaut: 1)', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Taille de page (defaut: 50, max: 200)', example: 50 })
  @ApiResponse({ status: 200, description: 'Resultats recuperes avec succes' })
  @ApiResponse({ status: 404, description: 'TestRun introuvable' })
  async getTestResults(
    @Param('testRunId') testRunId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 50,
  ) {
    try {
      // Clamp pageSize to reasonable bounds
      const clampedPageSize = Math.min(Math.max(1, pageSize), 200);
      const clampedPage = Math.max(1, page);

      const results = await this.promptfooService.getTestResults(
        testRunId,
        clampedPage,
        clampedPageSize,
      );
      return {
        success: true,
        ...results,
      };
    } catch (error) {
      this.logger.error('Error getting test results:', error);
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la recuperation des resultats',
          error: error.message,
        },
        status,
      );
    }
  }

  /**
   * Liste les test runs recents
   */
  @Public()
  @Get('runs')
  @ApiOperation({ summary: 'Liste les test runs Promptfoo recents' })
  @ApiQuery({ name: 'page', required: false, description: 'Numero de page (defaut: 1)' })
  @ApiQuery({ name: 'pageSize', required: false, description: 'Taille de page (defaut: 20, max: 100)' })
  @ApiResponse({ status: 200, description: 'Liste des test runs' })
  async listTestRuns(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
  ) {
    try {
      const clampedPageSize = Math.min(Math.max(1, pageSize), 100);
      const clampedPage = Math.max(1, page);
      const organizationId = (user as any)?.organizationId || DEV_DEFAULTS.ORGANIZATION_ID;

      const result = await this.promptfooService.listTestRuns(
        clampedPage,
        clampedPageSize,
        organizationId,
      );
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      this.logger.error('Error listing test runs:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Erreur lors de la recuperation des test runs',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verifie la sante du container Promptfoo
   */
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Verifie la sante du container Promptfoo' })
  @ApiResponse({ status: 200, description: 'Statut du container' })
  async checkHealth() {
    const health = await this.promptfooService.checkContainerHealth();
    return {
      success: true,
      container: health,
    };
  }

  /**
   * Execute un dry-run (validation sans execution reelle)
   */
  @Public()
  @Post('dry-run')
  @ApiOperation({ summary: 'Valide la configuration YAML sans executer' })
  @ApiResponse({ status: 200, description: 'Validation reussie' })
  @ApiResponse({ status: 400, description: 'Configuration invalide' })
  async dryRun(@Body() dto: RunPromptfooDto) {
    this.logger.log('Dry-run: validating configuration...');

    try {
      const validation = await this.promptfooService.validateYAML(dto.yaml);
      return {
        success: validation.valid,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    } catch (error) {
      this.logger.error('Error during dry-run:', error);
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
