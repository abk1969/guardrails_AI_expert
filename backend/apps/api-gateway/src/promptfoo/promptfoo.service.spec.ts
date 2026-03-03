import { Test, TestingModule } from '@nestjs/testing';
import { PromptfooService } from './promptfoo.service';
import { PrismaService } from '@app/database';
import { PromptfooGateway } from './promptfoo.gateway';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TestRunStatus, TestStatus } from '@prisma/client';

// Mock security-tool.utils (used by the service for execAsync, execFileAsync, ensureDirectory)
jest.mock('../shared/security-tool.utils', () => ({
  execAsync: jest.fn().mockResolvedValue({ stdout: 'running', stderr: '' }),
  execFileAsync: jest.fn().mockResolvedValue({ stdout: '', stderr: '' }),
  ensureDirectory: jest.fn().mockResolvedValue(undefined),
}));

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
      unlink: jest.fn().mockResolvedValue(undefined),
    },
  };
});

import { execAsync } from '../shared/security-tool.utils';

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
      findMany: jest.fn(),
      count: jest.fn(),
    },
    testResult: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
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

    // Default: container is running
    (execAsync as jest.Mock).mockResolvedValue({ stdout: 'running', stderr: '' });

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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkContainerHealth', () => {
    it('should return running when container is up', async () => {
      (execAsync as jest.Mock).mockResolvedValue({ stdout: 'running', stderr: '' });

      const result = await service.checkContainerHealth();

      expect(result.running).toBe(true);
      expect(result.status).toBe('running');
    });

    it('should return not running when container is stopped', async () => {
      (execAsync as jest.Mock).mockResolvedValue({ stdout: 'exited', stderr: '' });

      const result = await service.checkContainerHealth();

      expect(result.running).toBe(false);
      expect(result.status).toBe('exited');
    });

    it('should return not found when docker inspect fails', async () => {
      (execAsync as jest.Mock).mockRejectedValue(new Error('No such container'));

      const result = await service.checkContainerHealth();

      expect(result.running).toBe(false);
      expect(result.status).toBe('not_found');
      expect(result.error).toContain('not found');
    });
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

      // prompts: is an error, redteam: is a warning in the new implementation
      expect(result.errors).toContain('Section manquante: prompts:');
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('redteam'),
        ]),
      );
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
      expect(result.warnings[0]).toContain('Nombre de tests');
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
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('150'),
          expect.stringContaining('100'),
        ]),
      );
    });

    it('should add container error when container not running', async () => {
      (execAsync as jest.Mock).mockRejectedValue(new Error('No such container'));

      const validYaml = `
prompts:
  - "Test"
targets:
  - openai:gpt-4
redteam:
  numTests: 10
  plugins:
    - harmful:hate
`;

      const result = await service.validateYAML(validYaml);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('not found'),
        ]),
      );
    });

    it('should detect tabs in YAML', async () => {
      const yamlWithTabs = "prompts:\n\t- \"Test\"";

      const result = await service.validateYAML(yamlWithTabs);

      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('tabulation'),
        ]),
      );
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
      // First call = health check (returns 'running'), subsequent calls = docker cp
      (execAsync as jest.Mock)
        .mockResolvedValueOnce({ stdout: 'running', stderr: '' })
        .mockResolvedValue({ stdout: '', stderr: '' });

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

    it('should generate run ID when DB is unavailable', async () => {
      // Health check passes, docker cp passes
      (execAsync as jest.Mock)
        .mockResolvedValueOnce({ stdout: 'running', stderr: '' })
        .mockResolvedValue({ stdout: '', stderr: '' });
      // DB create fails (simulates DB unavailable)
      mockPrismaService.testRun.create.mockRejectedValue(new Error('DB unavailable'));

      const yamlContent = 'prompts:\n  - "test"';
      const result = await service.runTests(yamlContent);

      expect(result.testRunId).toMatch(/^run-\d+$/);
    });

    it('should emit WebSocket events when test starts', async () => {
      const mockTestRun = {
        id: 'test-run-ws',
        status: TestRunStatus.QUEUED,
        createdAt: new Date(),
      };

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);
      (execAsync as jest.Mock)
        .mockResolvedValueOnce({ stdout: 'running', stderr: '' })
        .mockResolvedValue({ stdout: '', stderr: '' });

      const yamlContent = 'prompts:\n  - "test"';
      await service.runTests(yamlContent, 'user-123', 'org-123', 'target-123');

      // Give async execution a chance
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockGateway.emitTestStarted).toHaveBeenCalledWith('test-run-ws');
    });

    it('should reject if container is not running', async () => {
      (execAsync as jest.Mock).mockRejectedValue(new Error('No such container'));

      const yamlContent = 'prompts:\n  - "test"';

      await expect(
        service.runTests(yamlContent, 'user-123', 'org-123', 'target-123'),
      ).rejects.toThrow(BadRequestException);
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
      };

      const mockResults = [
        {
          id: 'result-1',
          promptText: 'Test prompt 1',
          response: 'Response 1',
          score: 0.9,
          status: TestStatus.PASSED,
          promptCategory: 'Security',
          promptComplexity: 'Medium',
          explanation: 'Test passed',
          responseTime: 123,
          metadata: { plugin: 'harmful:hate' },
          createdAt: new Date(),
        },
        {
          id: 'result-2',
          promptText: 'Test prompt 2',
          response: 'Response 2',
          score: 0.2,
          status: TestStatus.FAILED,
          promptCategory: 'Security',
          promptComplexity: 'High',
          explanation: 'Test failed',
          responseTime: 456,
          metadata: { plugin: 'harmful:insults' },
          createdAt: new Date(),
        },
      ];

      mockPrismaService.testRun.findUnique.mockResolvedValue(mockTestRun);
      mockPrismaService.testResult.findMany.mockResolvedValue(mockResults);
      mockPrismaService.testResult.count.mockResolvedValue(2);

      const result = await service.getTestResults('test-run-results');

      expect(result.testRunId).toBe('test-run-results');
      expect(result.status).toBe(TestRunStatus.COMPLETED);
      expect(result.summary.totalTests).toBe(10);
      expect(result.summary.passed).toBe(8);
      expect(result.summary.failed).toBe(2);
      expect(result.summary.successRate).toBe(80);
      expect(result.results).toHaveLength(2);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.totalResults).toBe(2);
    });

    it('should throw error if test run not found', async () => {
      mockPrismaService.testRun.findUnique.mockResolvedValue(null);

      await expect(service.getTestResults('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should support pagination', async () => {
      const mockTestRun = {
        id: 'test-run-paginated',
        status: TestRunStatus.COMPLETED,
        totalTests: 100,
        passedTests: 80,
        failedTests: 20,
        startedAt: new Date(),
        completedAt: new Date(),
        target: { name: 'Test API', componentType: 'API' },
      };

      mockPrismaService.testRun.findUnique.mockResolvedValue(mockTestRun);
      mockPrismaService.testResult.findMany.mockResolvedValue([]);
      mockPrismaService.testResult.count.mockResolvedValue(100);

      const result = await service.getTestResults('test-run-paginated', 2, 25);

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.pageSize).toBe(25);
      expect(result.pagination.totalResults).toBe(100);
      expect(result.pagination.totalPages).toBe(4);
    });
  });
});
