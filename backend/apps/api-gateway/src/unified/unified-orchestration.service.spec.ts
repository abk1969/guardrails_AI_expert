import { Test, TestingModule } from '@nestjs/testing';
import { UnifiedOrchestrationService } from './unified-orchestration.service';
import { PrismaService } from '@app/database';
import { GarakService } from '../garak/garak.service';
import { StrixService } from '../strix/strix.service';
import { UnifiedGateway } from './unified.gateway';
import {
  ExecutionMode,
  Framework,
  UnifiedExecutionConfigDto,
  AttackMode,
} from './dto/unified-execution.dto';

describe('UnifiedOrchestrationService - TDD Strict', () => {
  let service: UnifiedOrchestrationService;
  let prismaService: PrismaService;
  let garakService: GarakService;
  let strixService: StrixService;
  let unifiedGateway: UnifiedGateway;

  beforeEach(async () => {
    // Create minimal mocks to break circular dependencies
    const mockPrismaService = {
      unifiedExecution: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      frameworkExecution: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockGarakService = {
      startScan: jest.fn().mockResolvedValue({ scanId: 'garak-scan-123' }),
      stopScan: jest.fn().mockResolvedValue(undefined),
      getScanStatus: jest.fn().mockResolvedValue({ status: 'running' }),
    };

    const mockStrixService = {
      startExecution: jest.fn().mockResolvedValue({ executionId: 'strix-exec-123' }),
      stopExecution: jest.fn().mockResolvedValue(undefined),
      getExecutionStatus: jest.fn().mockResolvedValue({ status: 'running' }),
    };

    const mockUnifiedGateway = {
      emitUnifiedStarted: jest.fn(),
      emitUnifiedProgress: jest.fn(),
      emitUnifiedCompleted: jest.fn(),
      emitUnifiedStopped: jest.fn(),
      emitUnifiedError: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnifiedOrchestrationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GarakService, useValue: mockGarakService },
        { provide: StrixService, useValue: mockStrixService },
        { provide: UnifiedGateway, useValue: mockUnifiedGateway },
      ],
    }).compile();

    service = module.get<UnifiedOrchestrationService>(UnifiedOrchestrationService);
    prismaService = module.get<PrismaService>(PrismaService);
    garakService = module.get<GarakService>(GarakService);
    strixService = module.get<StrixService>(StrixService);
    unifiedGateway = module.get<UnifiedGateway>(UnifiedGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startUnifiedExecution - PARALLEL mode', () => {
    it('should start execution with all frameworks in parallel', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [Framework.GARAK, Framework.STRIX],
        garak: {
          model: 'gpt-4',
          modelType: 'openai',
          probes: ['injection', 'toxicity'],
          generators: ['default'],
          detectors: ['default'],
        },
        strix: {
          targetUrl: 'https://example.com',
          attackMode: AttackMode.MODERATE,
          maxSteps: 50,
          timeout: 300,
          headless: true,
        },
      };

      const result = await service.startUnifiedExecution(
        'org-123',
        config,
        'user-123',
        'target-123',
      );

      // Assertions - ces tests DOIVENT ÉCHOUER si pas d'implémentation réelle
      expect(result).toBeDefined();
      expect(result.id).toMatch(/^unified-/);
      expect(result.mode).toBe(ExecutionMode.PARALLEL);
      expect(result.status).toBe('running');
      expect(result.frameworks).toHaveLength(2);
      expect(result.frameworks[0].framework).toBe(Framework.GARAK);
      expect(result.frameworks[1].framework).toBe(Framework.STRIX);
      expect(result.frameworks[0].status).toBe('pending');
      expect(result.frameworks[1].status).toBe('pending');
    });

    it('should emit WebSocket event when starting parallel execution', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [Framework.GARAK],
        garak: {
          model: 'gpt-4',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
        },
      };

      const emitSpy = jest.spyOn(unifiedGateway, 'emitUnifiedStarted');

      await service.startUnifiedExecution('org-123', config);

      expect(emitSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^unified-/),
        ExecutionMode.PARALLEL,
        [Framework.GARAK],
      );
    });
  });

  describe('startUnifiedExecution - SEQUENTIAL mode', () => {
    it('should start execution with frameworks running one after another', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.SEQUENTIAL,
        frameworks: [Framework.GARAK, Framework.STRIX],
        garak: {
          model: 'gpt-4',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
        },
        strix: {
          targetUrl: 'https://example.com',
          attackMode: AttackMode.LIGHT,
          maxSteps: 20,
          timeout: 120,
          headless: true,
        },
      };

      const result = await service.startUnifiedExecution('org-123', config);

      expect(result).toBeDefined();
      expect(result.mode).toBe(ExecutionMode.SEQUENTIAL);
      expect(result.status).toBe('running');
    });
  });

  describe('startUnifiedExecution - SELECTIVE mode', () => {
    it('should validate that configurations exist for selected frameworks', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.SELECTIVE,
        frameworks: [Framework.GARAK],
        // Missing garak config - should throw error
      };

      await expect(
        service.startUnifiedExecution('org-123', config),
      ).rejects.toThrow('Garak selected but configuration missing');
    });

    it('should start execution when configurations are provided for selected frameworks', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.SELECTIVE,
        frameworks: [Framework.STRIX],
        strix: {
          targetUrl: 'https://example.com',
          attackMode: AttackMode.AGGRESSIVE,
          maxSteps: 100,
          timeout: 600,
          headless: true,
        },
      };

      const result = await service.startUnifiedExecution('org-123', config);

      expect(result).toBeDefined();
      expect(result.mode).toBe(ExecutionMode.SELECTIVE);
      expect(result.frameworks).toHaveLength(1);
      expect(result.frameworks[0].framework).toBe(Framework.STRIX);
    });
  });

  describe('getUnifiedExecution', () => {
    it('should retrieve execution status by ID', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [Framework.GARAK],
        garak: {
          model: 'gpt-4',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
        },
      };

      const execution = await service.startUnifiedExecution('org-123', config);

      const retrieved = await service.getUnifiedExecution('org-123', execution.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(execution.id);
      expect(retrieved.mode).toBe(ExecutionMode.PARALLEL);
    });

    it('should throw NotFoundException when execution does not exist', async () => {
      await expect(
        service.getUnifiedExecution('org-123', 'non-existent-id'),
      ).rejects.toThrow('Unified execution non-existent-id not found');
    });
  });

  describe('stopUnifiedExecution', () => {
    it('should stop all running frameworks', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [Framework.GARAK, Framework.STRIX],
        garak: {
          model: 'gpt-4',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
        },
        strix: {
          targetUrl: 'https://example.com',
          attackMode: AttackMode.MODERATE,
          maxSteps: 50,
          timeout: 300,
          headless: true,
        },
      };

      const execution = await service.startUnifiedExecution('org-123', config);

      const stopSpy = jest.spyOn(unifiedGateway, 'emitUnifiedStopped');

      await service.stopUnifiedExecution('org-123', execution.id);

      expect(stopSpy).toHaveBeenCalledWith(execution.id);
    });

    it('should throw NotFoundException when stopping non-existent execution', async () => {
      await expect(
        service.stopUnifiedExecution('org-123', 'non-existent-id'),
      ).rejects.toThrow('Unified execution non-existent-id not found');
    });
  });

  describe('Framework execution management', () => {
    it('should call GarakService.startScan when Garak framework is selected', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [Framework.GARAK],
        garak: {
          model: 'gpt-4',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
        },
      };

      const startScanSpy = jest.spyOn(garakService, 'startScan');

      await service.startUnifiedExecution('org-123', config);

      // Wait for async execution to start
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(startScanSpy).toHaveBeenCalled();
    });

    it('should call StrixService.startExecution when Strix framework is selected', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [Framework.STRIX],
        strix: {
          targetUrl: 'https://example.com',
          attackMode: AttackMode.MODERATE,
          maxSteps: 50,
          timeout: 300,
          headless: true,
        },
      };

      const startExecutionSpy = jest.spyOn(strixService, 'startExecution');

      await service.startUnifiedExecution('org-123', config);

      // Wait for async execution to start
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(startExecutionSpy).toHaveBeenCalled();
    });
  });

  describe('Results aggregation', () => {
    it('should aggregate results from all completed frameworks', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [Framework.GARAK, Framework.STRIX],
        garak: {
          model: 'gpt-4',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
        },
        strix: {
          targetUrl: 'https://example.com',
          attackMode: AttackMode.MODERATE,
          maxSteps: 50,
          timeout: 300,
          headless: true,
        },
      };

      const execution = await service.startUnifiedExecution('org-123', config);

      // Simulate completion by waiting
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const completed = await service.getUnifiedExecution('org-123', execution.id);

      expect(completed.aggregatedResults).toBeDefined();
      expect(completed.aggregatedResults?.totalVulnerabilities).toBeGreaterThanOrEqual(0);
      expect(completed.aggregatedResults?.totalFindings).toBeGreaterThanOrEqual(0);
      expect(completed.aggregatedResults?.completedFrameworks).toBeGreaterThanOrEqual(0);
      expect(completed.aggregatedResults?.failedFrameworks).toBeGreaterThanOrEqual(0);
    });
  });
});
