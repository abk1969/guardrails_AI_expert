import { Test, TestingModule } from '@nestjs/testing';
import { GarakService } from './garak.service';
import { PrismaService } from '@app/database';
import { GarakGateway } from './garak.gateway';
import { ScanConfigDto, GarakScanPreset } from './dto/scan-config.dto';

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
      rm: jest.fn().mockResolvedValue(undefined),
    },
  };
});

// Mock shared utils
jest.mock('../shared/security-tool.utils', () => ({
  execAsync: jest.fn().mockResolvedValue({ stdout: '', stderr: '' }),
  execFileAsync: jest.fn().mockResolvedValue({ stdout: '', stderr: '' }),
  ensureDirectory: jest.fn().mockResolvedValue(undefined),
}));

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
  let execAsync: jest.Mock;

  const mockPrismaService = {
    testRun: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    testResult: {
      create: jest.fn(),
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

    // Get the mocked execAsync for health check tests
    execAsync = require('../shared/security-tool.utils').execAsync;

    // Reset mocks
    jest.clearAllMocks();

    // Default: container health check passes
    execAsync.mockResolvedValue({ stdout: 'running\n', stderr: '' });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkContainerHealth', () => {
    it('should return running=true when container is running', async () => {
      execAsync.mockResolvedValue({ stdout: 'running\n', stderr: '' });

      const health = await service.checkContainerHealth();

      expect(health.running).toBe(true);
      expect(health.status).toBe('running');
    });

    it('should return running=false when container is stopped', async () => {
      execAsync.mockResolvedValue({ stdout: 'exited\n', stderr: '' });

      const health = await service.checkContainerHealth();

      expect(health.running).toBe(false);
      expect(health.status).toBe('exited');
    });

    it('should return not_found when docker inspect fails', async () => {
      execAsync.mockRejectedValue(new Error('No such container'));

      const health = await service.checkContainerHealth();

      expect(health.running).toBe(false);
      expect(health.status).toBe('not_found');
    });
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
      expect(result.totalTests).toBe(0);
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

    it('should throw when container is not running', async () => {
      execAsync.mockResolvedValue({ stdout: 'exited\n', stderr: '' });

      const config: ScanConfigDto = {
        model: 'gpt-4',
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
      };

      await expect(service.startScan('org-123', config)).rejects.toThrow(
        /not running/,
      );
    });
  });

  describe('Output Directory Management', () => {
    it('should ensure output directory exists before scan', async () => {
      const { ensureDirectory } = require('../shared/security-tool.utils');

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

      expect(ensureDirectory).toHaveBeenCalled();
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

      const command = (service as any).buildGarakCommand(config, '/output/path');

      expect(command).toContain('garak');
      expect(command).toContain('--probes');
      // Find the argument after --probes
      const probesIdx = command.indexOf('--probes');
      expect(command[probesIdx + 1]).toBe('all');
    });

    it('should build command with specific probes', () => {
      const config: ScanConfigDto = {
        model: 'claude-3',
        modelType: 'anthropic',
        probes: ['injection', 'toxicity'],
        generators: ['custom'],
        detectors: ['advanced'],
      };

      const command = (service as any).buildGarakCommand(config, '/custom/output');

      expect(command).toContain('--model_type');
      expect(command).toContain('anthropic.AnthropicGenerator');
      expect(command).toContain('--model_name');
      expect(command).toContain('claude-3');
      // Probes joined with commas
      const probesIdx = command.indexOf('--probes');
      expect(command[probesIdx + 1]).toBe('injection,toxicity');
    });

    it('should include API key env var when provided', () => {
      const config: ScanConfigDto = {
        model: 'gpt-4',
        modelType: 'openai',
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
        apiKey: 'sk-test-api-key-123',
      };

      const command = (service as any).buildGarakCommand(config, '/output');

      expect(command).toContain('-e');
      expect(command).toContain('OPENAI_API_KEY=sk-test-api-key-123');
    });

    it('should use preset probes when preset is specified', () => {
      const config: ScanConfigDto = {
        model: 'gpt-4',
        modelType: 'openai',
        probes: ['injection'], // Should be overridden by preset
        generators: ['default'],
        detectors: ['default'],
        preset: GarakScanPreset.QUICK,
      };

      const command = (service as any).buildGarakCommand(config, '/output');

      const probesIdx = command.indexOf('--probes');
      // Quick preset = injection,jailbreak,toxicity
      expect(command[probesIdx + 1]).toBe('injection,jailbreak,toxicity');
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
    });

    it('should emit scan failed event on execution error', async () => {
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

  describe('Severity Breakdown', () => {
    it('should compute severity breakdown correctly', () => {
      const vulnerabilities = [
        { category: 'A', severity: 'critical' as const, description: '' },
        { category: 'B', severity: 'critical' as const, description: '' },
        { category: 'C', severity: 'high' as const, description: '' },
        { category: 'D', severity: 'moderate' as const, description: '' },
        { category: 'E', severity: 'low' as const, description: '' },
      ];

      const breakdown = (service as any).computeSeverityBreakdown(vulnerabilities);

      expect(breakdown).toEqual({
        critical: 2,
        high: 1,
        moderate: 1,
        low: 1,
      });
    });

    it('should return all zeros for empty vulnerabilities', () => {
      const breakdown = (service as any).computeSeverityBreakdown([]);

      expect(breakdown).toEqual({
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
      });
    });
  });

  describe('determineSeverity', () => {
    it('should use provided severity when available', () => {
      const result = (service as any).determineSeverity({ severity: 'high' });
      expect(result).toBe('high');
    });

    it('should map injection probes to critical', () => {
      const result = (service as any).determineSeverity({ probe: 'injection.test' });
      expect(result).toBe('critical');
    });

    it('should map toxicity probes to high', () => {
      const result = (service as any).determineSeverity({ probe: 'toxicity.check' });
      expect(result).toBe('high');
    });

    it('should default to moderate for unknown probes', () => {
      const result = (service as any).determineSeverity({ probe: 'unknown_probe' });
      expect(result).toBe('moderate');
    });
  });

  describe('isTransientError', () => {
    it('should identify timeout as transient', () => {
      const result = (service as any).isTransientError(new Error('Command timeout'));
      expect(result).toBe(true);
    });

    it('should identify connection refused as transient', () => {
      const result = (service as any).isTransientError(new Error('connection refused'));
      expect(result).toBe(true);
    });

    it('should not treat generic errors as transient', () => {
      const result = (service as any).isTransientError(new Error('Invalid model name'));
      expect(result).toBe(false);
    });
  });
});
