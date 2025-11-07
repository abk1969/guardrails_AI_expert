import { Test, TestingModule } from '@nestjs/testing';
import { StrixService } from './strix.service';
import { PrismaService } from '@app/database';
import { StrixGateway } from './strix.gateway';
import { NotFoundException } from '@nestjs/common';
import { AgentConfigDto, AttackMode } from './dto/agent-config.dto';
import { ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

// Mock fs promises (keep original fs methods for Prisma compatibility)
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    promises: {
      access: jest.fn(),
      mkdir: jest.fn(),
      readFile: jest.fn(),
      readdir: jest.fn(),
      writeFile: jest.fn(),
    },
  };
});

// Mock child_process spawn
jest.mock('child_process', () => {
  const actual = jest.requireActual('child_process');
  return {
    ...actual,
    spawn: jest.fn(),
  };
});

describe('StrixService', () => {
  let service: StrixService;
  let prismaService: PrismaService;
  let gateway: StrixGateway;

  const mockPrismaService = {
    testRun: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    testResult: {
      create: jest.fn(),
    },
  };

  const mockGateway = {
    emitExecutionStarted: jest.fn(),
    emitExecutionCompleted: jest.fn(),
    emitExecutionFailed: jest.fn(),
    emitExecutionPaused: jest.fn(),
    emitExecutionResumed: jest.fn(),
    emitExecutionStopped: jest.fn(),
    emitProgress: jest.fn(),
    emitLog: jest.fn(),
    emitFindingDiscovered: jest.fn(),
  };

  const mockConfig: AgentConfigDto = {
    targetUrl: 'https://example.com',
    attackMode: AttackMode.MODERATE,
    maxSteps: 10,
    timeout: 300,
    headless: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrixService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StrixGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<StrixService>(StrixService);
    prismaService = module.get<PrismaService>(PrismaService);
    gateway = module.get<StrixGateway>(StrixGateway);
  });

  describe('startExecution', () => {
    it('should create TestRun in database and start agent execution', async () => {
      const mockTestRun = {
        id: 'test-run-123',
        createdAt: new Date(),
        organizationId: 'org-123',
        targetId: 'target-123',
        status: 'RUNNING',
      };

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);

      const result = await service.startExecution('org-123', mockConfig, 'user-123', 'target-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-run-123');
      expect(result.status).toBe('running');
      expect(result.totalSteps).toBe(10);
      expect(result.findings).toEqual([]);
      expect(result.logs.length).toBeGreaterThan(0);
      expect(mockPrismaService.testRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          createdById: 'user-123',
          organizationId: 'org-123',
          targetId: 'target-123',
          status: 'RUNNING',
          totalTests: 10,
        }),
      });
      expect(mockGateway.emitExecutionStarted).toHaveBeenCalledWith('test-run-123');
    });

    it('should handle database failure gracefully and use memory-only mode', async () => {
      mockPrismaService.testRun.create.mockRejectedValue(new Error('Database connection failed'));

      const result = await service.startExecution('org-123', mockConfig);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^strix-/);
      expect(result.status).toBe('running');
      expect(mockGateway.emitExecutionStarted).toHaveBeenCalled();
    });

    it('should emit WebSocket events when execution starts', async () => {
      const mockTestRun = {
        id: 'test-run-456',
        createdAt: new Date(),
        organizationId: 'org-123',
        status: 'RUNNING',
      };

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);

      await service.startExecution('org-123', mockConfig);

      expect(mockGateway.emitExecutionStarted).toHaveBeenCalledWith('test-run-456');
    });

    it('should initialize execution with correct configuration metadata', async () => {
      const mockTestRun = {
        id: 'test-run-789',
        createdAt: new Date(),
        organizationId: 'org-123',
        status: 'RUNNING',
      };

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);

      const result = await service.startExecution('org-123', mockConfig);

      expect(mockPrismaService.testRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            tool: 'strix',
            targetUrl: 'https://example.com',
            attackMode: AttackMode.MODERATE,
            headless: true,
            maxSteps: 10,
            timeout: 300,
          }),
        }),
      });
    });
  });

  describe('getExecution', () => {
    it('should return execution from memory if available', async () => {
      const mockTestRun = {
        id: 'test-run-memory',
        createdAt: new Date(),
        organizationId: 'org-123',
        status: 'RUNNING',
      };

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);

      // Start execution to populate memory
      await service.startExecution('org-123', mockConfig);

      // Get execution from memory
      const result = await service.getExecution('org-123', 'test-run-memory');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-run-memory');
      expect(mockPrismaService.testRun.findFirst).not.toHaveBeenCalled();
    });

    it('should load execution from database if not in memory', async () => {
      const mockTestRun = {
        id: 'test-run-db',
        createdAt: new Date(),
        organizationId: 'org-123',
        status: 'COMPLETED',
        metadata: {
          maxSteps: 20,
        },
        results: [],
      };

      mockPrismaService.testRun.findFirst.mockResolvedValue(mockTestRun);

      const result = await service.getExecution('org-123', 'test-run-db');

      expect(result).toBeDefined();
      expect(result.id).toBe('test-run-db');
      expect(result.totalSteps).toBe(20);
      expect(mockPrismaService.testRun.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'test-run-db',
          organizationId: 'org-123',
        },
        include: {
          results: true,
        },
      });
    });

    it('should throw NotFoundException if execution not found', async () => {
      mockPrismaService.testRun.findFirst.mockResolvedValue(null);

      await expect(service.getExecution('org-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getExecution('org-123', 'non-existent')).rejects.toThrow(
        'Execution non-existent not found',
      );
    });
  });

  describe('pauseExecution', () => {
    it('should pause running execution using SIGSTOP', async () => {
      const mockTestRun = {
        id: 'test-run-pause',
        createdAt: new Date(),
        organizationId: 'org-123',
        status: 'RUNNING',
      };

      // Mock process
      const mockProcess = new EventEmitter() as ChildProcess;
      mockProcess.kill = jest.fn();

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);

      // Start execution
      await service.startExecution('org-123', mockConfig);

      // Manually inject process for testing (access private Map)
      (service as any).processes.set('test-run-pause', mockProcess);

      // Pause execution
      await service.pauseExecution('org-123', 'test-run-pause');

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGSTOP');
      expect(mockGateway.emitExecutionPaused).toHaveBeenCalledWith('test-run-pause');
      expect(mockPrismaService.testRun.update).toHaveBeenCalledWith({
        where: { id: 'test-run-pause' },
        data: { status: 'RUNNING' },
      });
    });

    it('should throw NotFoundException if execution not found for pause', async () => {
      await expect(service.pauseExecution('org-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if process not found for pause', async () => {
      const mockTestRun = {
        id: 'test-run-no-process',
        createdAt: new Date(),
        organizationId: 'org-123',
        status: 'RUNNING',
      };

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);

      // Start execution (without process)
      await service.startExecution('org-123', mockConfig);

      // Try to pause (no process available)
      await expect(service.pauseExecution('org-123', 'test-run-no-process')).rejects.toThrow(
        'Process for execution test-run-no-process not found',
      );
    });
  });

  describe('resumeExecution', () => {
    it('should resume paused execution using SIGCONT', async () => {
      const mockTestRun = {
        id: 'test-run-resume',
        createdAt: new Date(),
        organizationId: 'org-123',
        status: 'RUNNING',
      };

      // Mock process
      const mockProcess = new EventEmitter() as ChildProcess;
      mockProcess.kill = jest.fn();

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);

      // Start execution
      await service.startExecution('org-123', mockConfig);

      // Manually inject process
      (service as any).processes.set('test-run-resume', mockProcess);

      // Resume execution
      await service.resumeExecution('org-123', 'test-run-resume');

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGCONT');
      expect(mockGateway.emitExecutionResumed).toHaveBeenCalledWith('test-run-resume');
      expect(mockPrismaService.testRun.update).toHaveBeenCalledWith({
        where: { id: 'test-run-resume' },
        data: { status: 'RUNNING' },
      });
    });

    it('should throw NotFoundException if execution not found for resume', async () => {
      await expect(service.resumeExecution('org-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('stopExecution', () => {
    it('should stop execution using SIGTERM', async () => {
      const mockTestRun = {
        id: 'test-run-stop',
        createdAt: new Date(),
        organizationId: 'org-123',
        status: 'RUNNING',
      };

      // Mock process
      const mockProcess = new EventEmitter() as ChildProcess;
      mockProcess.kill = jest.fn();

      mockPrismaService.testRun.create.mockResolvedValue(mockTestRun);

      // Start execution
      await service.startExecution('org-123', mockConfig);

      // Manually inject process
      (service as any).processes.set('test-run-stop', mockProcess);

      // Stop execution
      await service.stopExecution('org-123', 'test-run-stop');

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
      expect(mockGateway.emitExecutionStopped).toHaveBeenCalledWith('test-run-stop');
      expect(mockPrismaService.testRun.update).toHaveBeenCalledWith({
        where: { id: 'test-run-stop' },
        data: { status: 'COMPLETED' },
      });
    });

    it('should throw NotFoundException if execution not found for stop', async () => {
      await expect(service.stopExecution('org-123', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('buildStrixCommand', () => {
    it('should build Strix CLI command with all parameters', () => {
      const outputDir = '/tmp/strix-output';

      // Access private method via type assertion
      const command = (service as any).buildStrixCommand(mockConfig, outputDir);

      // buildStrixCommand returns string[], so join to check content
      const commandStr = command.join(' ');

      expect(commandStr).toContain('--target');
      expect(commandStr).toContain('https://example.com');
      expect(commandStr).toContain('--mode');
      expect(commandStr).toContain('moderate');
      expect(commandStr).toContain('--max-steps');
      expect(commandStr).toContain('10');
      expect(commandStr).toContain('--timeout');
      expect(commandStr).toContain('300');
      expect(commandStr).toContain('--headless');
      expect(commandStr).toContain('--output');
      expect(commandStr).toContain(outputDir);
      expect(commandStr).toContain('--format');
      expect(commandStr).toContain('json');
      expect(commandStr).toContain('--verbose');
    });

    it('should build command without headless flag when headless is false', () => {
      const configWithoutHeadless: AgentConfigDto = {
        ...mockConfig,
        headless: false,
      };

      const outputDir = '/tmp/strix-output';
      const command = (service as any).buildStrixCommand(configWithoutHeadless, outputDir);
      const commandStr = command.join(' ');

      expect(commandStr).not.toContain('--headless');
    });

    it('should include API key in command when provided', () => {
      const configWithApiKey = {
        ...mockConfig,
        apiKey: 'sk-test-api-key-12345',
      };

      const outputDir = '/tmp/strix-output';
      const command = (service as any).buildStrixCommand(configWithApiKey, outputDir);
      const commandStr = command.join(' ');

      expect(commandStr).toContain('--api-key');
      expect(commandStr).toContain('sk-test-api-key-12345');
    });

    it('should omit API key from command when not provided', () => {
      const outputDir = '/tmp/strix-output';
      const command = (service as any).buildStrixCommand(mockConfig, outputDir);
      const commandStr = command.join(' ');

      expect(commandStr).not.toContain('--api-key');
    });
  });
});
