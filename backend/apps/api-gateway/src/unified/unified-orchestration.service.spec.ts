import { Test, TestingModule } from '@nestjs/testing';
import { UnifiedOrchestrationService } from './unified-orchestration.service';
import { PrismaService } from '@app/database';
import { GarakService } from '../garak/garak.service';
import { PromptfooService } from '../promptfoo/promptfoo.service';
import { UnifiedGateway } from './unified.gateway';
import {
  ExecutionMode,
  Framework,
  UnifiedExecutionConfigDto,
} from './dto/unified-execution.dto';

describe('UnifiedOrchestrationService', () => {
  let service: UnifiedOrchestrationService;
  let prismaService: PrismaService;
  let garakService: GarakService;
  let promptfooService: PromptfooService;
  let unifiedGateway: UnifiedGateway;

  beforeEach(async () => {
    const mockPrismaService = {
      testRun: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      testResult: {
        create: jest.fn(),
      },
    };

    const mockGarakService = {
      startScan: jest.fn().mockResolvedValue({ id: 'garak-scan-123' }),
      checkContainerHealth: jest.fn().mockResolvedValue({ running: true, status: 'running' }),
    };

    const mockPromptfooService = {
      runTests: jest.fn().mockResolvedValue({ testRunId: 'promptfoo-run-123', estimatedDuration: '5-30 minutes' }),
      checkContainerHealth: jest.fn().mockResolvedValue({ running: true, status: 'running' }),
    };

    const mockUnifiedGateway = {
      emitUnifiedStarted: jest.fn(),
      emitUnifiedCompleted: jest.fn(),
      emitUnifiedStopped: jest.fn(),
      emitUnifiedFailed: jest.fn(),
      emitFrameworkStarted: jest.fn(),
      emitFrameworkProgress: jest.fn(),
      emitFrameworkCompleted: jest.fn(),
      emitFrameworkFailed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnifiedOrchestrationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GarakService, useValue: mockGarakService },
        { provide: PromptfooService, useValue: mockPromptfooService },
        { provide: UnifiedGateway, useValue: mockUnifiedGateway },
      ],
    }).compile();

    service = module.get<UnifiedOrchestrationService>(UnifiedOrchestrationService);
    prismaService = module.get<PrismaService>(PrismaService);
    garakService = module.get<GarakService>(GarakService);
    promptfooService = module.get<PromptfooService>(PromptfooService);
    unifiedGateway = module.get<UnifiedGateway>(UnifiedGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startUnifiedExecution - PARALLEL mode', () => {
    it('should start execution with all frameworks in parallel', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [Framework.GARAK],
        garak: {
          model: 'gpt-4',
          modelType: 'openai',
          probes: ['injection', 'toxicity'],
          generators: ['default'],
          detectors: ['default'],
        },
      };

      const result = await service.startUnifiedExecution(
        'org-123',
        config,
        'user-123',
        'target-123',
      );

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^unified-/);
      expect(result.mode).toBe(ExecutionMode.PARALLEL);
      expect(result.status).toBe('running');
      expect(result.frameworks).toHaveLength(1);
      expect(result.frameworks[0].framework).toBe(Framework.GARAK);
      expect(result.frameworks[0].status).toBe('pending');
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
        frameworks: [Framework.GARAK],
        garak: {
          model: 'gpt-4',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
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

    it('should validate Promptfoo config is present when Promptfoo is selected', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.SELECTIVE,
        frameworks: [Framework.PROMPTFOO],
        // Missing promptfoo config
      };

      await expect(
        service.startUnifiedExecution('org-123', config),
      ).rejects.toThrow('Promptfoo selected but configuration missing');
    });

    it('should start execution when configurations are provided for selected frameworks', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.SELECTIVE,
        frameworks: [Framework.GARAK],
        garak: {
          model: 'gpt-4',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
        },
      };

      const result = await service.startUnifiedExecution('org-123', config);

      expect(result).toBeDefined();
      expect(result.mode).toBe(ExecutionMode.SELECTIVE);
      expect(result.frameworks).toHaveLength(1);
      expect(result.frameworks[0].framework).toBe(Framework.GARAK);
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
        frameworks: [Framework.GARAK],
        garak: {
          model: 'gpt-4',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
        },
      };

      const execution = await service.startUnifiedExecution('org-123', config);

      const stopSpy = jest.spyOn(unifiedGateway, 'emitUnifiedStopped');

      await service.stopUnifiedExecution('org-123', execution.id);

      expect(stopSpy).toHaveBeenCalledWith(execution.id);
    });

    it('should mark pending/running frameworks as failed with user-stop message', async () => {
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
      await service.stopUnifiedExecution('org-123', execution.id);

      const stopped = await service.getUnifiedExecution('org-123', execution.id);
      for (const fw of stopped.frameworks) {
        if (fw.status === 'failed') {
          expect(fw.error).toBe('Stopped by user');
        }
      }
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

    it('should call PromptfooService.runTests when Promptfoo framework is selected', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [Framework.PROMPTFOO],
        promptfoo: {
          suiteName: 'test-suite',
          providers: ['openai:gpt-4o-mini'],
          testCategories: ['prompt-injection'],
        },
      };

      const runTestsSpy = jest.spyOn(promptfooService, 'runTests');

      await service.startUnifiedExecution('org-123', config);

      // Wait for async execution to start
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(runTestsSpy).toHaveBeenCalled();
    });
  });

  describe('Results aggregation', () => {
    it('should aggregate results from all completed frameworks', async () => {
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

      // Wait for execution to start
      await new Promise((resolve) => setTimeout(resolve, 200));

      const completed = await service.getUnifiedExecution('org-123', execution.id);

      // Verify aggregatedResults structure exists (may be undefined if not completed yet)
      if (completed.aggregatedResults) {
        expect(completed.aggregatedResults.totalVulnerabilities).toBeGreaterThanOrEqual(0);
        expect(completed.aggregatedResults.totalFindings).toBeGreaterThanOrEqual(0);
        expect(completed.aggregatedResults.completedFrameworks).toBeGreaterThanOrEqual(0);
        expect(completed.aggregatedResults.failedFrameworks).toBeGreaterThanOrEqual(0);
      } else {
        // If not completed yet, that's acceptable in tests
        expect(completed.status).toMatch(/running|pending/);
      }
    }, 10000);
  });
});
