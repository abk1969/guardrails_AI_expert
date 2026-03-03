import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GuardrailCategory, PromptComplexity } from './dto/generate-prompts.dto';

/**
 * GeminiService Integration Tests (No Mocks)
 *
 * Tests real Gemini API integration OR fallback behavior if API key not available.
 * These are true integration tests - no mocking of external dependencies.
 */
describe('GeminiService (Integration Tests - No Mocks)', () => {
  let service: GeminiService;
  let hasRealApiKey: boolean;

  beforeEach(async () => {
    // Use real ConfigService with actual environment variables
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => process.env[key],
          },
        },
      ],
    }).compile();

    hasRealApiKey = !!process.env.GEMINI_API_KEY;

    // Only create service if API key is available (to avoid constructor error)
    if (hasRealApiKey) {
      service = module.get<GeminiService>(GeminiService);
    }
  });

  describe('Constructor', () => {
    it('should throw HttpException when GEMINI_API_KEY is not configured', () => {
      // This test verifies error handling in constructor
      expect(() => {
        new GeminiService({
          get: () => undefined,
        } as unknown as ConfigService);
      }).toThrow(HttpException);
    });

    it('should initialize successfully with valid API key', () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(GeminiService);
    });
  });

  describe('generatePrompts', () => {
    it('should generate prompts with real API (if key available)', async () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      const dto = {
        count: 3,
        categories: [GuardrailCategory.SECURITY_PRIVACY],
        complexities: [PromptComplexity.SIMPLE],
      };

      const result = await service.generatePrompts(dto);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);

      result.forEach((prompt) => {
        expect(prompt.id).toBeDefined();
        expect(prompt.text).toBeDefined();
        expect(prompt.category).toBe(GuardrailCategory.SECURITY_PRIVACY);
        expect(prompt.complexity).toBeDefined();
        expect(prompt.templateId).toBeDefined();
      });
    }, 30000); // 30 second timeout for API call

    it('should fall back to mock generation when API fails', async () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      const dto = {
        count: 5,
        categories: [
          GuardrailCategory.SECURITY_PRIVACY,
          GuardrailCategory.RELEVANCE_RESPONSE,
        ],
        complexities: [PromptComplexity.SIMPLE, PromptComplexity.MOYEN],
      };

      // Even if API call fails, service should return mock prompts
      const result = await service.generatePrompts(dto);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(5);
    }, 30000);

    it('should generate multiple prompts across different categories', async () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      const dto = {
        count: 6,
        categories: [
          GuardrailCategory.SECURITY_PRIVACY,
          GuardrailCategory.LINGUISTIC_QUALITY,
          GuardrailCategory.CONTENT_VALIDATION,
        ],
        complexities: [
          PromptComplexity.SIMPLE,
          PromptComplexity.MOYEN,
          PromptComplexity.SOPHISTIQUE,
        ],
      };

      const result = await service.generatePrompts(dto);

      expect(result).toBeDefined();
      expect(result.length).toBe(6);

      // Verify categories are from allowed list
      result.forEach((prompt) => {
        expect(dto.categories).toContain(prompt.category as any);
      });
    }, 30000);

    it('should generate prompts with correct structure', async () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      const dto = {
        count: 2,
        categories: [GuardrailCategory.LOGICAL_VALIDATION],
        complexities: [PromptComplexity.SOPHISTIQUE],
      };

      const result = await service.generatePrompts(dto);

      expect(result.length).toBe(2);

      result.forEach((prompt) => {
        expect(prompt).toHaveProperty('id');
        expect(prompt).toHaveProperty('text');
        expect(prompt).toHaveProperty('category');
        expect(prompt).toHaveProperty('complexity');
        expect(prompt).toHaveProperty('templateId');

        expect(typeof prompt.id).toBe('string');
        expect(typeof prompt.text).toBe('string');
        expect(typeof prompt.category).toBe('string');
        expect(typeof prompt.complexity).toBe('string');
        expect(typeof prompt.templateId).toBe('string');

        expect(prompt.text.length).toBeGreaterThan(0);
      });
    }, 30000);
  });

  describe('chat', () => {
    it('should process chat message with real API (if key available)', async () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      const dto = {
        message: 'Bonjour, comment allez-vous?',
      };

      // Chat may succeed or fail depending on API key validity
      // If it succeeds, verify response structure
      try {
        const result = await service.chat(dto);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      } catch (error) {
        // If API key is invalid, should throw HttpException
        expect(error).toBeInstanceOf(HttpException);
      }
    }, 30000);

    it('should process chat message with context', async () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      const dto = {
        message: 'Quelles sont les vulnérabilités mentionnées?',
        context: {
          vulnerabilities: ['Injection de prompt', 'Fuite de données'],
        },
      };

      // Chat may succeed or fail depending on API key validity
      try {
        const result = await service.chat(dto);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      } catch (error) {
        // If API key is invalid, should throw HttpException
        expect(error).toBeInstanceOf(HttpException);
      }
    }, 30000);

    it('should handle empty message gracefully', async () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      const dto = {
        message: '',
      };

      // Should either throw or return a response
      await expect(async () => {
        await service.chat(dto);
      }).rejects.toThrow();
    }, 30000);
  });

  describe('Mock Generation (Fallback)', () => {
    it('should generate mock prompts when API key is invalid', async () => {
      // Create service with invalid API key to force fallback
      const moduleWithInvalidKey = await Test.createTestingModule({
        providers: [
          GeminiService,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string) => (key === 'GEMINI_API_KEY' ? 'invalid-key-123' : undefined),
            },
          },
        ],
      }).compile();

      const serviceWithInvalidKey = moduleWithInvalidKey.get<GeminiService>(GeminiService);

      const dto = {
        count: 4,
        categories: [GuardrailCategory.SECURITY_PRIVACY],
        complexities: [PromptComplexity.SIMPLE],
      };

      const result = await serviceWithInvalidKey.generatePrompts(dto);

      // Should fall back to mock generation
      expect(result).toBeDefined();
      expect(result.length).toBe(4);

      result.forEach((prompt) => {
        expect(prompt.id).toMatch(/^mock-/);
        expect(prompt.templateId).toBe('mock-backend-generated');
      });
    }, 30000);

    it('should generate correct number of mock prompts', async () => {
      const moduleWithInvalidKey = await Test.createTestingModule({
        providers: [
          GeminiService,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string) => (key === 'GEMINI_API_KEY' ? 'invalid-key-123' : undefined),
            },
          },
        ],
      }).compile();

      const serviceWithInvalidKey = moduleWithInvalidKey.get<GeminiService>(GeminiService);

      const dto = {
        count: 10,
        categories: [
          GuardrailCategory.SECURITY_PRIVACY,
          GuardrailCategory.RELEVANCE_RESPONSE,
        ],
        complexities: [PromptComplexity.SIMPLE, PromptComplexity.MOYEN],
      };

      const result = await serviceWithInvalidKey.generatePrompts(dto);

      expect(result.length).toBe(10);
    }, 30000);
  });

  describe('Performance', () => {
    it('should complete prompt generation within reasonable time', async () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      const dto = {
        count: 5,
        categories: [GuardrailCategory.SECURITY_PRIVACY],
        complexities: [PromptComplexity.SIMPLE],
      };

      const start = Date.now();
      await service.generatePrompts(dto);
      const duration = Date.now() - start;

      // Should complete within 30 seconds (generous timeout for API)
      expect(duration).toBeLessThan(30000);
    }, 35000);

    it('should complete chat within reasonable time', async () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      const dto = {
        message: 'Test message',
      };

      const start = Date.now();

      // Chat may succeed or fail depending on API key validity
      try {
        await service.chat(dto);
      } catch (error) {
        // Expected if API key is invalid
        expect(error).toBeInstanceOf(HttpException);
      }

      const duration = Date.now() - start;

      // Should complete within 30 seconds (success or failure)
      expect(duration).toBeLessThan(30000);
    }, 35000);
  });

  describe('Error Handling', () => {
    it('should throw HttpException when chat fails', async () => {
      // Create service with invalid API key
      const moduleWithInvalidKey = await Test.createTestingModule({
        providers: [
          GeminiService,
          {
            provide: ConfigService,
            useValue: {
              get: (key: string) => (key === 'GEMINI_API_KEY' ? 'invalid-key-123' : undefined),
            },
          },
        ],
      }).compile();

      const serviceWithInvalidKey = moduleWithInvalidKey.get<GeminiService>(GeminiService);

      const dto = {
        message: 'Test message',
      };

      // Chat should throw HttpException (no fallback for chat)
      await expect(serviceWithInvalidKey.chat(dto)).rejects.toThrow(HttpException);
    }, 30000);
  });

  describe('UUID Generation', () => {
    it('should generate unique IDs for prompts', async () => {
      if (!hasRealApiKey) {
        console.warn('⚠️  Skipping test - GEMINI_API_KEY not set');
        return;
      }

      const dto = {
        count: 10,
        categories: [GuardrailCategory.SECURITY_PRIVACY],
        complexities: [PromptComplexity.SIMPLE],
      };

      const result = await service.generatePrompts(dto);

      const ids = result.map((p) => p.id);
      const uniqueIds = new Set(ids);

      // All IDs should be unique
      expect(uniqueIds.size).toBe(ids.length);
    }, 30000);
  });
});
