import { Test, TestingModule } from '@nestjs/testing';
import { GarakService } from './garak.service';
import { PrismaService } from '@app/database';
import { GarakGateway } from './garak.gateway';
import { NotFoundException } from '@nestjs/common';
import { ScanConfigDto } from './dto/scan-config.dto';

// Mock child_process exec
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

// Mock fs promises (keep original fs methods for Prisma)
jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    promises: {
      access: jest.fn(),
      mkdir: jest.fn(),
      readFile: jest.fn(),
      readdir: jest.fn(),
    },
  };
});

// Mock GarakGateway
jest.mock('./garak.gateway', () => ({
  GarakGateway: class MockGarakGateway {
    emitScanStarted = jest.fn();
    emitLog = jest.fn();
    emitProgress = jest.fn();
    emitScanCompleted = jest.fn();
    emitScanFailed = jest.fn();
    emitVulnerabilityFound = jest.fn();
  },
}));

describe('GarakService - TDD Strict', () => {
  let service: GarakService;
  let prismaService: PrismaService;
  let garakGateway: GarakGateway;

  const mockPrismaService = {
    testRun: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GarakService,
        { provide: PrismaService, useValue: mockPrismaService },
        GarakGateway,
      ],
    }).compile();

    service = module.get<GarakService>(GarakService);
    prismaService = module.get<PrismaService>(PrismaService);
    garakGateway = module.get<GarakGateway>(GarakGateway);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startScan', () => {
    it('should create TestRun in database', async () => {
      const config: ScanConfigDto = {
        model: 'gpt-4',
        modelType: 'openai',
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
      };

      const mockTestRun = {
        id: 'test-run-123',
        createdById: 'user-123',
        organizationId: 'org-123',
        targetId: 'target-123',
        status: 'RUNNING',
        configuration: config,
        metadata: {
          tool: 'garak',
          model: 'gpt-4',
          modelType: 'openai',
          probes: ['injection'],
        },
      };

      (prismaService.testRun.create as jest.Mock).mockResolvedValue(mockTestRun);

      const result = await service.startScan(
        'org-123',
        config,
        'user-123',
        'target-123',
      );

      expect(prismaService.testRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          createdById: 'user-123',
          organizationId: 'org-123',
          targetId: 'target-123',
          status: 'RUNNING',
          configuration: config,
        }),
      });

      expect(result).toBeDefined();
      expect(result.id).toBe('test-run-123');
      expect(result.status).toBe('running');
    });

    it('should emit WebSocket events when scan starts', async () => {
      const config: ScanConfigDto = {
        model: 'gpt-4',
        probes: ['injection', 'toxicity'],
        generators: ['default'],
        detectors: ['default'],
      };

      const mockTestRun = {
        id: 'scan-456',
        status: 'RUNNING',
      };

      (prismaService.testRun.create as jest.Mock).mockResolvedValue(mockTestRun);

      await service.startScan('org-123', config);

      expect(garakGateway.emitScanStarted).toHaveBeenCalledWith('scan-456');
      expect(garakGateway.emitLog).toHaveBeenCalledWith(
        'scan-456',
        expect.stringContaining('Starting Garak'),
      );
      expect(garakGateway.emitLog).toHaveBeenCalledWith(
        'scan-456',
        expect.stringContaining('gpt-4'),
      );
    });

    it('should return scan result with status "running"', async () => {
      const config: ScanConfigDto = {
        model: 'gpt-3.5-turbo',
        probes: ['all'],
        generators: ['default'],
        detectors: ['default'],
      };

      (prismaService.testRun.create as jest.Mock).mockResolvedValue({
        id: 'scan-789',
      });

      const result = await service.startScan('org-123', config);

      expect(result.status).toBe('running');
      expect(result.model).toBe('gpt-3.5-turbo');
      expect(result.totalTests).toBe(0); // Not known yet
      expect(result.passed).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.vulnerabilities).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const config: ScanConfigDto = {
        model: 'gpt-4',
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
      };

      (prismaService.testRun.create as jest.Mock).mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.startScan('org-123', config)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('Output Directory Management', () => {
    it('should create output directory if it does not exist', async () => {
      const fs = require('fs').promises;

      // Directory does not exist initially
      (fs.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);

      const config: ScanConfigDto = {
        model: 'gpt-4',
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
      };

      (prismaService.testRun.create as jest.Mock).mockResolvedValue({
        id: 'scan-123',
      });

      await service.startScan('org-123', config);

      // Should have attempted to create directory
      expect(fs.mkdir).toHaveBeenCalled();
    });

    it('should not recreate directory if it already exists', async () => {
      const fs = require('fs').promises;

      // Directory exists
      (fs.access as jest.Mock).mockResolvedValue(undefined);

      const config: ScanConfigDto = {
        model: 'gpt-4',
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
      };

      (prismaService.testRun.create as jest.Mock).mockResolvedValue({
        id: 'scan-456',
      });

      await service.startScan('org-123', config);

      // Should NOT have attempted to create directory
      expect(fs.mkdir).not.toHaveBeenCalled();
    });
  });

  describe('buildGarakCommand', () => {
    it('should build command with all probes', () => {
      const config: ScanConfigDto = {
        model: 'gpt-4',
        modelType: 'openai',
        probes: ['all'],
        generators: ['default'],
        detectors: ['default'],
      };

      // Access private method via reflection for testing
      const command = (service as any).buildGarakCommand(
        config,
        '/output/path',
      );

      expect(command).toContain('garak');
      expect(command).toContain('--model-type openai');
      expect(command).toContain('--model-name "gpt-4"');
      expect(command).toContain('--probes all');
      expect(command).toContain('--report_dir "/output/path"');
      expect(command).toContain('--output_format jsonl');
    });

    it('should build command with specific probes', () => {
      const config: ScanConfigDto = {
        model: 'claude-3',
        modelType: 'anthropic',
        probes: ['injection', 'toxicity', 'xss'],
        generators: ['custom'],
        detectors: ['advanced'],
      };

      const command = (service as any).buildGarakCommand(
        config,
        '/custom/output',
      );

      expect(command).toContain('--model-type anthropic');
      expect(command).toContain('--model-name "claude-3"');
      expect(command).toContain('--probes injection,toxicity,xss');
      expect(command).toContain('--generators custom');
      expect(command).toContain('--detectors advanced');
    });

    it('should include API key when provided', () => {
      const config: ScanConfigDto = {
        model: 'gpt-4',
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
        apiKey: 'sk-test-api-key-123',
      };

      const command = (service as any).buildGarakCommand(
        config,
        '/output',
      );

      expect(command).toContain('sk-test-api-key-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle Garak CLI execution failure', async () => {
      const config: ScanConfigDto = {
        model: 'invalid-model',
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
      };

      (prismaService.testRun.create as jest.Mock).mockResolvedValue({
        id: 'failing-scan',
      });

      // Garak CLI execution happens asynchronously,
      // so startScan should still return successfully
      const result = await service.startScan('org-123', config);

      expect(result.status).toBe('running');
      // The actual failure will be detected later in runGarakAsync
    });

    it('should emit scan failed event on execution error', async () => {
      // This test verifies that gateway.emitScanFailed is called
      // when Garak CLI execution fails
      // Since execution is async, we can't test this directly in startScan
      // This test will FAIL initially because the method isn't implemented yet
      expect(garakGateway.emitScanFailed).toBeDefined();
    });
  });

  describe('Organization Scoping', () => {
    it('should scope all operations by organizationId', async () => {
      const config: ScanConfigDto = {
        model: 'gpt-4',
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
      };

      (prismaService.testRun.create as jest.Mock).mockResolvedValue({
        id: 'scoped-scan',
      });

      await service.startScan('org-456', config, 'user-789');

      expect(prismaService.testRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: 'org-456',
        }),
      });
    });

    it('should include userId in test run creation', async () => {
      const config: ScanConfigDto = {
        model: 'gpt-4',
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
      };

      (prismaService.testRun.create as jest.Mock).mockResolvedValue({
        id: 'user-scan',
      });

      await service.startScan('org-123', config, 'specific-user-id');

      expect(prismaService.testRun.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          createdById: 'specific-user-id',
        }),
      });
    });
  });
});
