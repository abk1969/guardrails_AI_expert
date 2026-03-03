import { Test, TestingModule } from '@nestjs/testing';
import { TestsService } from './tests.service';
import { PrismaService } from '@app/database';
import { TestsGateway } from './tests.gateway';
import { TestRunStatus, TestStatus, Role, Plan, AIComponentType, GuardrailCategory, PromptComplexity } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

/**
 * TestsService Integration Tests (No Mocks for Database)
 *
 * Uses real Prisma client with in-memory database for true integration testing.
 * Mocks only the WebSocket gateway (TestsGateway) since it's not database-related.
 */
describe('TestsService (Integration Tests)', () => {
  let service: TestsService;
  let prisma: PrismaService;
  let mockGateway: jest.Mocked<TestsGateway>;

  // Test data IDs
  let testOrgId: string;
  let testUserId: string;
  let testTargetId: string;

  beforeAll(async () => {
    // Mock WebSocket gateway (not database-related, can be mocked)
    mockGateway = {
      emitProgress: jest.fn(),
      emitTestResult: jest.fn(),
      emitCompletion: jest.fn(),
      emitError: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestsService,
        PrismaService,
        {
          provide: TestsGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<TestsService>(TestsService);
    prisma = module.get<PrismaService>(PrismaService);

    // Setup test organization and user
    const org = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org',
        plan: Plan.PROFESSIONAL,
        maxUsers: 10,
        maxTestsPerMonth: 100,
      },
    });
    testOrgId = org.id;

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        role: Role.TESTER,
        organizationId: testOrgId,
        isActive: true,
        emailVerified: true,
      },
    });
    testUserId = user.id;

    const target = await prisma.testTarget.create({
      data: {
        organizationId: testOrgId,
        name: 'Test Target',
        componentType: AIComponentType.FOUNDATION_MODEL,
        apiUrl: 'https://api.example.com',
        apiMethod: 'POST',
        apiHeaders: '{}', // Encrypted JSON string
        apiBodyTemplate: '{"prompt":"{{prompt}}"}',
        responseExtractionPath: 'response.text',
      },
    });
    testTargetId = target.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.testResult.deleteMany({});
    await prisma.testRun.deleteMany({});
    await prisma.testTarget.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create valid DTO
  const createTestRunDto = (overrides: Partial<any> = {}) => ({
    targetId: testTargetId,
    categories: [GuardrailCategory.SECURITY_PRIVACY],
    volume: 10,
    complexities: [PromptComplexity.SIMPLE],
    categorySensitivities: [
      {
        category: GuardrailCategory.SECURITY_PRIVACY,
        sensitivity: 'Normal' as const,
      },
    ],
    ...overrides,
  });

  // Helper to create valid test result data matching Prisma TestResult schema
  const createTestResultData = (overrides: Partial<any> = {}) => ({
    promptId: 'prompt-template-001',
    promptText: 'Test prompt',
    promptCategory: 'SECURITY_PRIVACY',
    promptComplexity: 'SIMPLE',
    response: 'Test response',
    status: TestStatus.PASSED,
    score: 0.9,
    evaluationChain: [],
    ...overrides,
  });

  describe('createTestRun', () => {
    it('should create a new test run', async () => {
      const dto = createTestRunDto({
        description: 'Test run description',
      });

      const result = await service.createTestRun(dto as any, testUserId, testOrgId);

      expect(result).toBeDefined();
      expect(result.organizationId).toBe(testOrgId);
      expect(result.createdById).toBe(testUserId);
      expect(result.targetId).toBe(testTargetId);
      expect(result.status).toBe(TestRunStatus.PENDING);
      expect(result.totalTests).toBe(10);
      expect(result.passedTests).toBe(0);
      expect(result.failedTests).toBe(0);
      expect(result.blockedTests).toBe(0);
    });

    it('should create test run with configuration stored as JSON', async () => {
      const dto = createTestRunDto({
        categories: [GuardrailCategory.CONTENT_VALIDATION, GuardrailCategory.LOGICAL_VALIDATION],
        volume: 25,
        complexities: [PromptComplexity.MOYEN, PromptComplexity.SOPHISTIQUE],
        categorySensitivities: [
          { category: GuardrailCategory.CONTENT_VALIDATION, sensitivity: 'Strict' as const },
          { category: GuardrailCategory.LOGICAL_VALIDATION, sensitivity: 'Normal' as const },
        ],
        description: 'Complex test configuration',
      });

      const result = await service.createTestRun(dto as any, testUserId, testOrgId);

      expect(result.configuration).toBeDefined();
      expect(result.configuration).toMatchObject({
        categories: dto.categories,
        volume: dto.volume,
        complexities: dto.complexities,
      });
    });
  });

  describe('getTestRuns', () => {
    it('should retrieve test runs with pagination', async () => {
      // Create multiple test runs
      await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 5,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.RELEVANCE_RESPONSE],
          volume: 8,
          complexities: [PromptComplexity.MOYEN],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      const result = await service.getTestRuns(testOrgId, 1, 10);

      expect(result.testRuns).toBeDefined();
      expect(result.testRuns.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);

      // Verify test runs include relations
      result.testRuns.forEach((run) => {
        expect(run.target).toBeDefined();
        expect(run.createdBy).toBeDefined();
        expect(run.createdBy.email).toBeDefined();
      });
    });

    it('should respect pagination parameters', async () => {
      const result = await service.getTestRuns(testOrgId, 1, 1);

      expect(result.testRuns.length).toBeLessThanOrEqual(1);
      expect(result.pageSize).toBe(1);
    });

    it('should exclude deleted test runs', async () => {
      // Create a test run
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 3,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      // Soft delete it
      await prisma.testRun.update({
        where: { id: testRun.id },
        data: { deletedAt: new Date() },
      });

      const result = await service.getTestRuns(testOrgId);

      // Should not include the deleted run
      expect(result.testRuns.find((r) => r.id === testRun.id)).toBeUndefined();
    });
  });

  describe('getTestRunById', () => {
    it('should retrieve a specific test run', async () => {
      const created = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 7,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      const result = await service.getTestRunById(created.id, testOrgId);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.organizationId).toBe(testOrgId);
    });

    it('should throw NotFoundException for non-existent test run', async () => {
      await expect(
        service.getTestRunById('non-existent-id', testOrgId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for soft-deleted test run', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 3,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      await prisma.testRun.update({
        where: { id: testRun.id },
        data: { deletedAt: new Date() },
      });

      await expect(
        service.getTestRunById(testRun.id, testOrgId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for different organization', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 3,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      await expect(
        service.getTestRunById(testRun.id, 'different-org-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTestResults', () => {
    it('should retrieve test results with pagination', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 5,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      // Add test results
      await service.addTestResult(testRun.id, createTestResultData({
        promptText: 'Test prompt 1',
        response: 'Test response 1',
        status: TestStatus.PASSED,
        score: 0.95,
      }));

      await service.addTestResult(testRun.id, createTestResultData({
        promptId: 'prompt-template-002',
        promptText: 'Test prompt 2',
        response: 'Test response 2',
        status: TestStatus.FAILED,
        score: 0.45,
      }));

      const result = await service.getTestResults(testRun.id, testOrgId, 1, 50);

      expect(result.results).toBeDefined();
      expect(result.results.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(50);
    });

    it('should throw NotFoundException for non-existent test run', async () => {
      await expect(
        service.getTestResults('non-existent-id', testOrgId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelTestRun', () => {
    it('should cancel a pending test run', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 10,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      const result = await service.cancelTestRun(testRun.id, testOrgId);

      expect(result.status).toBe(TestRunStatus.CANCELLED);
      expect(result.completedAt).toBeDefined();
    });

    it('should throw error when cancelling completed test run', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 5,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      // Complete the test run
      await service.completeTestRun(testRun.id);

      await expect(
        service.cancelTestRun(testRun.id, testOrgId),
      ).rejects.toThrow('Cannot cancel a completed or already cancelled test run');
    });

    it('should throw error when cancelling already cancelled test run', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 5,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      // Cancel once
      await service.cancelTestRun(testRun.id, testOrgId);

      // Try to cancel again
      await expect(
        service.cancelTestRun(testRun.id, testOrgId),
      ).rejects.toThrow('Cannot cancel a completed or already cancelled test run');
    });
  });

  describe('retryFailedTests', () => {
    it('should create new test run with failed tests', async () => {
      const originalRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 10,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      // Add failed test results
      await service.addTestResult(originalRun.id, createTestResultData({
        promptText: 'Failed test 1',
        response: 'Response 1',
        status: TestStatus.FAILED,
        score: 0.3,
      }));

      await service.addTestResult(originalRun.id, createTestResultData({
        promptId: 'prompt-template-002',
        promptText: 'Failed test 2',
        response: 'Response 2',
        status: TestStatus.FAILED,
        score: 0.2,
      }));

      const retryRun = await service.retryFailedTests(originalRun.id, testOrgId);

      expect(retryRun).toBeDefined();
      expect(retryRun.totalTests).toBe(2); // Only failed tests
      expect(retryRun.status).toBe(TestRunStatus.PENDING);
      expect(retryRun.metadata).toMatchObject({
        originalTestRunId: originalRun.id,
        retryAttempt: 1,
      });
    });

    it('should increment retry attempt counter', async () => {
      const originalRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 5,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      await service.addTestResult(originalRun.id, createTestResultData({
        promptText: 'Failed test',
        response: 'Response',
        status: TestStatus.FAILED,
        score: 0.3,
      }));

      const retry1 = await service.retryFailedTests(originalRun.id, testOrgId);
      expect(retry1.metadata?.retryAttempt).toBe(1);

      // Add failed result to first retry
      await service.addTestResult(retry1.id, createTestResultData({
        promptId: 'prompt-template-002',
        promptText: 'Still failing',
        response: 'Response',
        status: TestStatus.FAILED,
        score: 0.25,
      }));

      const retry2 = await service.retryFailedTests(retry1.id, testOrgId);
      expect(retry2.metadata?.retryAttempt).toBe(2);
    });
  });

  describe('getTestTargets', () => {
    it('should retrieve all test targets for organization', async () => {
      const result = await service.getTestTargets(testOrgId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('apiUrl');
    });

    it('should exclude deleted targets', async () => {
      // Create and soft delete a target
      const target = await prisma.testTarget.create({
        data: {
          organizationId: testOrgId,
          name: 'To be deleted',
          componentType: AIComponentType.FOUNDATION_MODEL,
          apiUrl: 'https://delete.me',
          apiMethod: 'POST',
          apiHeaders: '{}',
          apiBodyTemplate: '{}',
          responseExtractionPath: 'response',
        },
      });

      await prisma.testTarget.update({
        where: { id: target.id },
        data: { deletedAt: new Date() },
      });

      const result = await service.getTestTargets(testOrgId);

      expect(result.find((t) => t.id === target.id)).toBeUndefined();
    });
  });

  describe('createTestTarget', () => {
    it('should create a new test target', async () => {
      const data = {
        name: 'New API Target',
        componentType: AIComponentType.FOUNDATION_MODEL,
        apiUrl: 'https://new-api.example.com',
        apiMethod: 'POST',
        apiHeaders: JSON.stringify({ Authorization: 'Bearer token' }),
        apiBodyTemplate: '{"prompt":"{{prompt}}"}',
        responseExtractionPath: 'response.text',
      };

      const result = await service.createTestTarget(testOrgId, data);

      expect(result).toBeDefined();
      expect(result.organizationId).toBe(testOrgId);
      expect(result.name).toBe(data.name);
      expect(result.apiUrl).toBe(data.apiUrl);
    });
  });

  describe('getPromptTemplates', () => {
    it('should retrieve all active prompt templates', async () => {
      const result = await service.getPromptTemplates();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by category', async () => {
      const result = await service.getPromptTemplates('SECURITY_PRIVACY');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by complexity', async () => {
      const result = await service.getPromptTemplates(undefined, 'SIMPLE');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('emitTestProgress', () => {
    it('should calculate and emit test progress via WebSocket', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 10,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      // Add some results to create progress
      await service.addTestResult(testRun.id, createTestResultData({
        promptText: 'Test',
        response: 'Response',
        status: TestStatus.PASSED,
        score: 0.9,
      }));

      await service.emitTestProgress(testRun.id);

      expect(mockGateway.emitProgress).toHaveBeenCalledWith(
        testRun.id,
        expect.objectContaining({
          progress: expect.any(Number),
          totalTests: 10,
          passedTests: 1,
          failedTests: 0,
          blockedTests: 0,
        }),
      );
    });
  });

  describe('addTestResult', () => {
    it('should add test result and update counters', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 5,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      const result = await service.addTestResult(testRun.id, createTestResultData({
        promptText: 'Security test prompt',
        promptCategory: 'SECURITY_PRIVACY',
        response: 'Blocked response',
        status: TestStatus.PASSED,
        score: 0.95,
      }));

      expect(result).toBeDefined();
      expect(result.testRunId).toBe(testRun.id);
      expect(result.status).toBe(TestStatus.PASSED);

      // Verify counter was incremented
      const updatedRun = await service.getTestRunById(testRun.id, testOrgId);
      expect(updatedRun.passedTests).toBe(1);

      // Verify WebSocket emissions
      expect(mockGateway.emitTestResult).toHaveBeenCalledWith(testRun.id, result);
      expect(mockGateway.emitProgress).toHaveBeenCalled();
    });

    it('should increment failedTests counter for failed tests', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 3,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      await service.addTestResult(testRun.id, createTestResultData({
        promptText: 'Test',
        response: 'Response',
        status: TestStatus.FAILED,
        score: 0.2,
      }));

      const updatedRun = await service.getTestRunById(testRun.id, testOrgId);
      expect(updatedRun.failedTests).toBe(1);
    });

    it('should increment blockedTests counter for skipped tests', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 3,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      await service.addTestResult(testRun.id, createTestResultData({
        promptText: 'Test',
        response: 'Response',
        status: TestStatus.SKIPPED,
        score: 0,
      }));

      const updatedRun = await service.getTestRunById(testRun.id, testOrgId);
      expect(updatedRun.blockedTests).toBe(1);
    });
  });

  describe('completeTestRun', () => {
    it('should mark test run as completed and emit completion event', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 5,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      const result = await service.completeTestRun(testRun.id);

      expect(result.status).toBe(TestRunStatus.COMPLETED);
      expect(result.completedAt).toBeDefined();

      expect(mockGateway.emitCompletion).toHaveBeenCalledWith(
        testRun.id,
        expect.objectContaining({
          status: TestRunStatus.COMPLETED,
          totalTests: 5,
          duration: expect.any(Number),
        }),
      );
    });

    it('should calculate duration correctly', async () => {
      const testRun = await service.createTestRun(
        {
          targetId: testTargetId,
          categories: [GuardrailCategory.SECURITY_PRIVACY],
          volume: 3,
          complexities: [PromptComplexity.SIMPLE],
          categorySensitivities: [],
        },
        testUserId,
        testOrgId,
      );

      // Set startedAt to 5 seconds ago so duration calculation produces > 0
      await prisma.testRun.update({
        where: { id: testRun.id },
        data: { startedAt: new Date(Date.now() - 5000) },
      });

      await service.completeTestRun(testRun.id);

      const call = mockGateway.emitCompletion.mock.calls[0];
      expect(call[1].duration).toBeGreaterThan(0);
    });
  });

  describe('emitTestError', () => {
    it('should emit error via WebSocket', () => {
      const testRunId = 'test-run-123';
      const error = new Error('Test execution failed');

      service.emitTestError(testRunId, error);

      expect(mockGateway.emitError).toHaveBeenCalledWith(
        testRunId,
        expect.objectContaining({
          message: 'Test execution failed',
          code: 'TEST_EXECUTION_ERROR',
          details: expect.stringContaining('Error: Test execution failed'),
        }),
      );
    });
  });
});
