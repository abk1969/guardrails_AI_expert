import { Test, TestingModule } from '@nestjs/testing';
import { PromptfooService } from './promptfoo.service';
import { PrismaService } from '@app/database';
import { PromptfooGateway } from './promptfoo.gateway';
import { NotFoundException } from '@nestjs/common';
import { TestRunStatus } from '@prisma/client';

// Mock fs promises
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    promises: {
      access: jest.fn(),
      mkdir: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
  };
});

// Mock child_process exec
jest.mock('child_process', () => {
  const actual = jest.requireActual('child_process');
  return {
    ...actual,
    exec: jest.fn(),
  };
});

describe('PromptfooService', () => {
  let service: PromptfooService;
  let prismaService: PrismaService;
  let gateway: PromptfooGateway;

  const mockPrismaService = {
    testRun: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    testResult: {
      create: jest.fn(),
    },
  };

  const mockGateway = {
    emitTestStarted: jest.fn(),
    emitTestCompleted: jest.fn(),
    emitTestFailed: jest.fn(),
    emitProgress: jest.fn(),
    emitLog: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptfooService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PromptfooGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<PromptfooService>(PromptfooService);
    prismaService = module.get<PrismaService>(PrismaService);
    gateway = module.get<PromptfooGateway>(PromptfooGateway);
  });

  describe('getTestStatus', () => {
    it('should return real status from database for QUEUED test run', async () => {
      const mockTestRun = {
        id: 'test-run-123',
        status: TestRunStatus.QUEUED,
        progress: 0,
        createdAt: new Date(),
      };

      mockPrismaService.testRun.findUnique.mockResolvedValue(mockTestRun);

      const result = await service.getTestStatus('test-run-123');

      expect(result).toEqual({
        status: 'queued',
        progress: 0,
      });
      expect(mockPrismaService.testRun.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-run-123' },
        select: {
          status: true,
          progress: true,
        },
      });
    });

    it('should return real status from database for RUNNING test run', async () => {
      const mockTestRun = {
        id: 'test-run-456',
        status: TestRunStatus.RUNNING,
        progress: 65,
        createdAt: new Date(),
      };

      mockPrismaService.testRun.findUnique.mockResolvedValue(mockTestRun);

      const result = await service.getTestStatus('test-run-456');

      expect(result).toEqual({
        status: 'running',
        progress: 65,
      });
    });

    it('should return real status from database for COMPLETED test run', async () => {
      const mockTestRun = {
        id: 'test-run-789',
        status: TestRunStatus.COMPLETED,
        progress: 100,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      mockPrismaService.testRun.findUnique.mockResolvedValue(mockTestRun);

      const result = await service.getTestStatus('test-run-789');

      expect(result).toEqual({
        status: 'completed',
        progress: 100,
      });
    });

    it('should return real status from database for FAILED test run', async () => {
      const mockTestRun = {
        id: 'test-run-failed',
        status: TestRunStatus.FAILED,
        progress: 45,
        createdAt: new Date(),
        completedAt: new Date(),
      };

      mockPrismaService.testRun.findUnique.mockResolvedValue(mockTestRun);

      const result = await service.getTestStatus('test-run-failed');

      expect(result).toEqual({
        status: 'failed',
        progress: 45,
      });
    });

    it('should throw NotFoundException if test run does not exist', async () => {
      mockPrismaService.testRun.findUnique.mockResolvedValue(null);

      await expect(service.getTestStatus('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.getTestStatus('non-existent')).rejects.toThrow(
        'Test run non-existent not found',
      );
    });

    it('should default progress to 0 if not set in database', async () => {
      const mockTestRun = {
        id: 'test-run-no-progress',
        status: TestRunStatus.QUEUED,
        progress: null, // Progress not set
        createdAt: new Date(),
      };

      mockPrismaService.testRun.findUnique.mockResolvedValue(mockTestRun);

      const result = await service.getTestStatus('test-run-no-progress');

      expect(result.progress).toBe(0);
    });

    it('should map QUEUED status correctly', async () => {
      const mockTestRun = {
        id: 'test-queued',
        status: 'QUEUED', // String enum value
        progress: 0,
      };

      mockPrismaService.testRun.findUnique.mockResolvedValue(mockTestRun);

      const result = await service.getTestStatus('test-queued');

      expect(result.status).toBe('queued');
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaService.testRun.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.getTestStatus('test-run-db-error')).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('validateYAML', () => {
    it('should validate correct YAML configuration', async () => {
      const validYaml = `
prompts:
  - "Test prompt 1"
targets:
  - openai:gpt-4
redteam:
  numTests: 10
  plugins:
    - harmful:hate
`;

      const result = await service.validateYAML(validYaml);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required sections', async () => {
      const invalidYaml = `
targets:
  - openai:gpt-4
`;

      const result = await service.validateYAML(invalidYaml);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section manquante: prompts:');
      expect(result.errors).toContain('Section manquante: redteam:');
    });

    it('should reject empty YAML', async () => {
      const result = await service.validateYAML('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Configuration YAML vide');
    });

    it('should warn on high numTests values', async () => {
      const yamlWithHighTests = `
prompts:
  - "Test"
targets:
  - openai:gpt-4
redteam:
  numTests: 75
  plugins:
    - harmful:hate
`;

      const result = await service.validateYAML(yamlWithHighTests);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Nombre de tests élevé');
    });

    it('should error on excessive numTests values', async () => {
      const yamlWithExcessiveTests = `
prompts:
  - "Test"
targets:
  - openai:gpt-4
redteam:
  numTests: 150
  plugins:
    - harmful:hate
`;

      const result = await service.validateYAML(yamlWithExcessiveTests);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Nombre de tests trop élevé (150) - Maximum recommandé: 100',
      );
    });

    it('should detect missing plugins section', async () => {
      const yamlWithoutPlugins = `
prompts:
  - "Test"
targets:
  - openai:gpt-4
redteam:
  numTests: 10
`;

      const result = await service.validateYAML(yamlWithoutPlugins);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Aucun plugin défini dans la section redteam');
    });
  });

  describe('runTests', () => {
    it('should create test run in database when auth params provided', async () => {
      const mockTestRun = {
        id: 'test-run-create',
        status: TestRunStatus.QUEUED,
        createdAt: new Date(),
      };

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);

      const yamlContent = 'prompts:\n  - "test"';
      const result = await service.runTests(yamlContent, 'user-123', 'org-123', 'target-123');

      expect(result.testRunId).toBe('test-run-create');
      expect(mockPrismaService.testRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          createdById: 'user-123',
          organizationId: 'org-123',
          targetId: 'target-123',
          status: TestRunStatus.QUEUED,
        }),
      });
    });

    it('should generate run ID when auth params not provided', async () => {
      const yamlContent = 'prompts:\n  - "test"';
      const result = await service.runTests(yamlContent);

      expect(result.testRunId).toMatch(/^run-\d+$/);
      expect(mockPrismaService.testRun.create).not.toHaveBeenCalled();
    });

    it('should emit WebSocket events when test starts', async () => {
      const mockTestRun = {
        id: 'test-run-ws',
        status: TestRunStatus.QUEUED,
        createdAt: new Date(),
      };

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);

      const yamlContent = 'prompts:\n  - "test"';

      // Wait a bit for async execution
      await service.runTests(yamlContent, 'user-123', 'org-123', 'target-123');

      // Give setTimeout(0) a chance to execute
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockGateway.emitTestStarted).toHaveBeenCalledWith('test-run-ws');
    });
  });

  describe('getTestResults', () => {
    it('should return test results with statistics from database', async () => {
      const mockTestRun = {
        id: 'test-run-results',
        status: TestRunStatus.COMPLETED,
        totalTests: 10,
        passedTests: 8,
        failedTests: 2,
        startedAt: new Date('2025-01-07T10:00:00Z'),
        completedAt: new Date('2025-01-07T10:05:00Z'),
        target: {
          name: 'My API',
          componentType: 'API',
        },
        results: [
          {
            id: 'result-1',
            promptText: 'Test prompt 1',
            response: 'Response 1',
            score: 0.9,
            status: 'PASSED',
            promptCategory: 'Security',
            promptComplexity: 'Medium',
            explanation: 'Test passed',
            responseTime: 123,
            metadata: { plugin: 'harmful:hate' },
          },
          {
            id: 'result-2',
            promptText: 'Test prompt 2',
            response: 'Response 2',
            score: 0.2,
            status: 'FAILED',
            promptCategory: 'Security',
            promptComplexity: 'High',
            explanation: 'Test failed',
            responseTime: 456,
            metadata: { plugin: 'harmful:insults' },
          },
        ],
      };

      mockPrismaService.testRun.findUnique.mockResolvedValue(mockTestRun);

      const result = await service.getTestResults('test-run-results');

      expect(result.testRunId).toBe('test-run-results');
      expect(result.status).toBe(TestRunStatus.COMPLETED);
      expect(result.summary.totalTests).toBe(10);
      expect(result.summary.passed).toBe(8);
      expect(result.summary.failed).toBe(2);
      expect(result.summary.successRate).toBe(80);
      expect(result.results).toHaveLength(2);
    });

    it('should throw error if test run not found', async () => {
      mockPrismaService.testRun.findUnique.mockResolvedValue(null);

      await expect(service.getTestResults('non-existent')).rejects.toThrow(
        'TestRun non-existent introuvable',
      );
    });
  });
});
