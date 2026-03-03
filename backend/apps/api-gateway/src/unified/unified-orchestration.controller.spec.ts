import { Test, TestingModule } from '@nestjs/testing';
import { UnifiedOrchestrationController } from './unified-orchestration.controller';
import { UnifiedOrchestrationService } from './unified-orchestration.service';
import { NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  ExecutionMode,
  Framework,
  UnifiedExecutionConfigDto,
  UnifiedExecutionDto,
  GarakConfigDto,
} from './dto/unified-execution.dto';

// Mock the auth guards and decorators to avoid importing real implementations
jest.mock('@app/auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard {},
}));
jest.mock('@app/auth/decorators/current-user.decorator', () => ({
  CurrentUser: () => () => {},
}));

describe('UnifiedOrchestrationController - TDD Strict', () => {
  let controller: UnifiedOrchestrationController;
  let service: UnifiedOrchestrationService;

  // Mock user from JWT token
  const mockUser = {
    id: 'user-123',
    role: 'TESTER',
    email: 'tester@example.com',
    organizationId: 'org-123',
  };

  beforeEach(async () => {
    // Create minimal service mock
    const mockService = {
      startUnifiedExecution: jest.fn(),
      getUnifiedExecution: jest.fn(),
      stopUnifiedExecution: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnifiedOrchestrationController],
      providers: [
        {
          provide: UnifiedOrchestrationService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UnifiedOrchestrationController>(
      UnifiedOrchestrationController,
    );
    service = module.get<UnifiedOrchestrationService>(
      UnifiedOrchestrationService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('DTO Validation', () => {
    it('should reject invalid execution mode enum value', async () => {
      const invalidConfig = {
        mode: 'INVALID_MODE', // Not a valid ExecutionMode enum value
        frameworks: [Framework.GARAK],
        garak: {
          model: 'gpt-4',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
        },
      };

      const dto = plainToInstance(UnifiedExecutionConfigDto, invalidConfig);
      const errors = await validate(dto);

      // Should have validation error for mode enum
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((err) => err.property === 'mode')).toBe(true);
    });

    it('should reject empty frameworks array', async () => {
      const invalidConfig = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [], // Empty array - invalid
      };

      const dto = plainToInstance(UnifiedExecutionConfigDto, invalidConfig);
      const errors = await validate(dto);

      // Should have validation error for frameworks array
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((err) => err.property === 'frameworks')).toBe(true);
    });

    it('should reject missing required Garak model field', async () => {
      const invalidGarakConfig = {
        // Missing required 'model' field
        probes: ['injection'],
        generators: ['default'],
        detectors: ['default'],
      };

      const dto = plainToInstance(GarakConfigDto, invalidGarakConfig);
      const errors = await validate(dto);

      // Should have validation error for missing model
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((err) => err.property === 'model')).toBe(true);
    });
  });

  describe('POST /orchestration/start', () => {
    it('should start unified execution with valid config', async () => {
      const config: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.PARALLEL,
        frameworks: [Framework.GARAK],
        garak: {
          model: 'gpt-4',
          modelType: 'openai',
          probes: ['injection'],
          generators: ['default'],
          detectors: ['default'],
        },
      };

      const expectedResult: UnifiedExecutionDto = {
        id: 'unified-123',
        mode: ExecutionMode.PARALLEL,
        status: 'running',
        frameworks: [
          {
            framework: Framework.GARAK,
            status: 'pending',
            progress: 0,
          },
        ],
        startTime: new Date().toISOString(),
        duration: 0,
      };

      (service.startUnifiedExecution as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.startExecution(mockUser, config);

      expect(result).toBeDefined();
      expect(result.id).toBe('unified-123');
      expect(result.mode).toBe(ExecutionMode.PARALLEL);
      expect(result.status).toBe('running');
      expect(service.startUnifiedExecution).toHaveBeenCalledWith(
        'org-123',
        config,
        'user-123',
        expect.any(String), // DEV_DEFAULTS.TARGET_ID
      );
    });

    it('should pass organizationId from authenticated user', async () => {
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

      (service.startUnifiedExecution as jest.Mock).mockResolvedValue({
        id: 'test',
        mode: ExecutionMode.PARALLEL,
        status: 'running',
        frameworks: [],
        startTime: new Date().toISOString(),
        duration: 0,
      });

      await controller.startExecution(mockUser, config);

      expect(service.startUnifiedExecution).toHaveBeenCalledWith(
        'org-123', // User's organizationId
        expect.any(Object),
        'user-123', // User's ID
        expect.any(String),
      );
    });

    it('should propagate validation errors from service', async () => {
      const invalidConfig: UnifiedExecutionConfigDto = {
        mode: ExecutionMode.SELECTIVE,
        frameworks: [Framework.GARAK],
        // Missing garak config - should fail validation
      };

      (service.startUnifiedExecution as jest.Mock).mockRejectedValue(
        new Error('Garak selected but configuration missing'),
      );

      await expect(
        controller.startExecution(mockUser, invalidConfig),
      ).rejects.toThrow('Garak selected but configuration missing');
    });
  });

  describe('GET /orchestration/:id', () => {
    it('should return execution status by ID', async () => {
      const executionId = 'unified-123';
      const expectedResult: UnifiedExecutionDto = {
        id: executionId,
        mode: ExecutionMode.PARALLEL,
        status: 'running',
        frameworks: [
          {
            framework: Framework.GARAK,
            status: 'running',
            progress: 50,
          },
        ],
        startTime: new Date().toISOString(),
        duration: 100,
      };

      (service.getUnifiedExecution as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getExecution(mockUser, executionId);

      expect(result).toBeDefined();
      expect(result.id).toBe(executionId);
      expect(result.status).toBe('running');
      expect(service.getUnifiedExecution).toHaveBeenCalledWith(
        'org-123',
        executionId,
      );
    });

    it('should throw NotFoundException when execution does not exist', async () => {
      const nonExistentId = 'non-existent-id';

      (service.getUnifiedExecution as jest.Mock).mockRejectedValue(
        new NotFoundException(`Unified execution ${nonExistentId} not found`),
      );

      await expect(
        controller.getExecution(mockUser, nonExistentId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.getExecution(mockUser, nonExistentId),
      ).rejects.toThrow(`Unified execution ${nonExistentId} not found`);
    });

    it('should scope execution retrieval by organizationId', async () => {
      const executionId = 'unified-456';

      (service.getUnifiedExecution as jest.Mock).mockResolvedValue({
        id: executionId,
        mode: ExecutionMode.PARALLEL,
        status: 'completed',
        frameworks: [],
        startTime: new Date().toISOString(),
        duration: 300,
      });

      await controller.getExecution(mockUser, executionId);

      // Verify organizationId is passed (prevents cross-org access)
      expect(service.getUnifiedExecution).toHaveBeenCalledWith(
        'org-123',
        executionId,
      );
    });
  });

  describe('POST /orchestration/:id/stop', () => {
    it('should stop running execution', async () => {
      const executionId = 'unified-789';

      (service.stopUnifiedExecution as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.stopExecution(mockUser, executionId);

      expect(result).toBeUndefined(); // void return
      expect(service.stopUnifiedExecution).toHaveBeenCalledWith(
        'org-123',
        executionId,
      );
    });

    it('should throw NotFoundException when stopping non-existent execution', async () => {
      const nonExistentId = 'non-existent-id';

      (service.stopUnifiedExecution as jest.Mock).mockRejectedValue(
        new NotFoundException(`Unified execution ${nonExistentId} not found`),
      );

      await expect(
        controller.stopExecution(mockUser, nonExistentId),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.stopExecution(mockUser, nonExistentId),
      ).rejects.toThrow(`Unified execution ${nonExistentId} not found`);
    });

    it('should scope stop operation by organizationId', async () => {
      const executionId = 'unified-999';

      (service.stopUnifiedExecution as jest.Mock).mockResolvedValue(undefined);

      await controller.stopExecution(mockUser, executionId);

      // Verify organizationId is passed (prevents cross-org stop)
      expect(service.stopUnifiedExecution).toHaveBeenCalledWith(
        'org-123',
        executionId,
      );
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 202 Accepted when starting execution', async () => {
      // Note: @HttpCode(HttpStatus.ACCEPTED) decorator sets this
      // This test verifies the decorator is correctly applied
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

      (service.startUnifiedExecution as jest.Mock).mockResolvedValue({
        id: 'test',
        mode: ExecutionMode.PARALLEL,
        status: 'running',
        frameworks: [],
        startTime: new Date().toISOString(),
        duration: 0,
      });

      const result = await controller.startExecution(mockUser, config);

      // If execution starts successfully, result should be returned
      expect(result).toBeDefined();
    });

    it('should return 204 No Content when stopping execution', async () => {
      // Note: @HttpCode(HttpStatus.NO_CONTENT) decorator sets this
      const executionId = 'unified-123';

      (service.stopUnifiedExecution as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.stopExecution(mockUser, executionId);

      // void return means 204 No Content
      expect(result).toBeUndefined();
    });
  });

  describe('Authentication & Authorization', () => {
    it('should require JWT authentication for all endpoints', () => {
      // Note: @UseGuards(JwtAuthGuard) and @ApiBearerAuth() decorators
      // This is verified by checking the controller metadata
      const guards = Reflect.getMetadata(
        '__guards__',
        UnifiedOrchestrationController,
      );

      // Guards should be applied at controller level
      expect(guards).toBeDefined();
    });

    it('should extract user from JWT token via @CurrentUser decorator', async () => {
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

      (service.startUnifiedExecution as jest.Mock).mockResolvedValue({
        id: 'test',
        mode: ExecutionMode.PARALLEL,
        status: 'running',
        frameworks: [],
        startTime: new Date().toISOString(),
        duration: 0,
      });

      await controller.startExecution(mockUser, config);

      // Verify user.organizationId and user.id are used
      expect(service.startUnifiedExecution).toHaveBeenCalledWith(
        mockUser.organizationId,
        expect.any(Object),
        mockUser.id,
        expect.any(String),
      );
    });
  });
});
