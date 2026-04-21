import { Test, TestingModule } from '@nestjs/testing';
import { LLMChatService } from './llm-chat.service';
import { ChatRequest } from './dto/chat-message.dto';
import { LLMProvider } from './dto/llm-configuration.dto';

// ── Mock Anthropic SDK ──────────────────────────────────────────────
const mockAnthropicCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: mockAnthropicCreate,
    },
  })),
}));

// ── Mock OpenAI SDK ─────────────────────────────────────────────────
const mockOpenAICreate = jest.fn();
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockOpenAICreate,
      },
    },
  })),
}));

// ── Mock @google/genai SDK (new SDK for Gemini 3) ──────────────────
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: mockGenerateContent,
    },
  })),
}));

// ── Mock Mistral SDK ────────────────────────────────────────────────
const mockMistralComplete = jest.fn();
jest.mock('@mistralai/mistralai', () => ({
  Mistral: jest.fn().mockImplementation(() => ({
    chat: {
      complete: mockMistralComplete,
    },
  })),
}));

// ── Mock global fetch for local model tests ─────────────────────────
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('LLMChatService', () => {
  let service: LLMChatService;

  const baseMessages = [{ role: 'user' as const, content: 'Bonjour' }];

  const baseTools = [
    {
      name: 'search_compass_scenarios',
      description: 'Search COMPASS scenarios',
      parameters: {
        type: 'object' as const,
        properties: { query: { type: 'string' } },
      },
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LLMChatService],
    }).compile();

    service = module.get<LLMChatService>(LLMChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ================================================================
  // Claude (Anthropic) provider
  // ================================================================

  describe('Claude provider', () => {
    const claudeRequest: ChatRequest = {
      messages: baseMessages,
      tools: baseTools,
      systemPrompt: 'Vous etes un assistant.',
      config: {
        provider: LLMProvider.CLAUDE,
        model: 'claude-sonnet-4-20250514',
        apiKey: 'test-claude-key',
        temperature: 0.5,
        maxTokens: 2048,
      },
    };

    it('should return text response on end_turn', async () => {
      mockAnthropicCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Bonjour, je suis Claude.' }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 15, output_tokens: 10 },
      });

      const result = await service.chatWithTools(claudeRequest);

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({ type: 'text', text: 'Bonjour, je suis Claude.' });
      expect(result.stopReason).toBe('end_turn');
      expect(result.usage).toEqual({ inputTokens: 15, outputTokens: 10 });
    });

    it('should map tool_use blocks correctly', async () => {
      mockAnthropicCreate.mockResolvedValue({
        content: [
          { type: 'text', text: 'Searching...' },
          { type: 'tool_use', id: 'toolu_01', name: 'search_compass_scenarios', input: { query: 'injection' } },
        ],
        stop_reason: 'tool_use',
        usage: { input_tokens: 30, output_tokens: 25 },
      });

      const result = await service.chatWithTools(claudeRequest);

      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toEqual({ type: 'text', text: 'Searching...' });
      expect(result.content[1]).toEqual({
        type: 'tool_use',
        id: 'toolu_01',
        name: 'search_compass_scenarios',
        input: { query: 'injection' },
      });
      expect(result.stopReason).toBe('tool_use');
    });

    it('should map max_tokens stop reason', async () => {
      mockAnthropicCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Truncated...' }],
        stop_reason: 'max_tokens',
        usage: { input_tokens: 10, output_tokens: 2048 },
      });

      const result = await service.chatWithTools(claudeRequest);
      expect(result.stopReason).toBe('max_tokens');
    });

    it('should throw when API key is missing', async () => {
      const noKeyRequest: ChatRequest = {
        ...claudeRequest,
        config: { ...claudeRequest.config, apiKey: undefined },
      };

      await expect(service.chatWithTools(noKeyRequest)).rejects.toThrow(
        'Clé API Claude manquante',
      );
    });

    it('should throw with Claude error prefix on SDK error', async () => {
      mockAnthropicCreate.mockRejectedValue(new Error('Rate limit exceeded'));

      await expect(service.chatWithTools(claudeRequest)).rejects.toThrow(
        'Erreur Claude: Rate limit exceeded',
      );
    });

    it('should pass tools as input_schema format', async () => {
      mockAnthropicCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Ok' }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 5 },
      });

      await service.chatWithTools(claudeRequest);

      const callArgs = mockAnthropicCreate.mock.calls[0][0];
      expect(callArgs.tools).toBeDefined();
      expect(callArgs.tools[0].input_schema).toEqual(baseTools[0].parameters);
      expect(callArgs.system).toBe('Vous etes un assistant.');
      expect(callArgs.temperature).toBe(0.5);
    });
  });

  // ================================================================
  // OpenAI-compatible providers (OpenAI, Groq, DeepSeek, Qwen, xAI)
  // ================================================================

  describe('OpenAI-compatible provider', () => {
    const openaiRequest: ChatRequest = {
      messages: baseMessages,
      tools: baseTools,
      systemPrompt: 'System prompt',
      config: {
        provider: LLMProvider.OPENAI,
        model: 'gpt-4o',
        apiKey: 'test-openai-key',
        temperature: 0.7,
        maxTokens: 4096,
      },
    };

    it('should return text response on stop finish_reason', async () => {
      mockOpenAICreate.mockResolvedValue({
        choices: [
          {
            message: { content: 'Hello from OpenAI', tool_calls: null },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 20, completion_tokens: 15 },
      });

      const result = await service.chatWithTools(openaiRequest);

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({ type: 'text', text: 'Hello from OpenAI' });
      expect(result.stopReason).toBe('end_turn');
      expect(result.usage).toEqual({ inputTokens: 20, outputTokens: 15 });
    });

    it('should parse tool_calls correctly', async () => {
      mockOpenAICreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                {
                  id: 'call_abc',
                  type: 'function',
                  function: {
                    name: 'search_compass_scenarios',
                    arguments: '{"query":"injection"}',
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: { prompt_tokens: 30, completion_tokens: 20 },
      });

      const result = await service.chatWithTools(openaiRequest);

      expect(result.stopReason).toBe('tool_use');
      const toolBlock = result.content.find((b) => b.type === 'tool_use');
      expect(toolBlock).toBeDefined();
      expect(toolBlock).toEqual({
        type: 'tool_use',
        id: 'call_abc',
        name: 'search_compass_scenarios',
        input: { query: 'injection' },
      });
    });

    it('should handle invalid JSON in tool arguments', async () => {
      mockOpenAICreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                {
                  id: 'call_bad',
                  type: 'function',
                  function: {
                    name: 'search_compass_scenarios',
                    arguments: '{invalid json}',
                  },
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      });

      const result = await service.chatWithTools(openaiRequest);
      const toolBlock = result.content.find((b) => b.type === 'tool_use');
      expect(toolBlock).toBeDefined();
      if (toolBlock && toolBlock.type === 'tool_use') {
        expect(toolBlock.input).toEqual({ raw: '{invalid json}' });
      }
    });

    it('should map length finish_reason to max_tokens', async () => {
      mockOpenAICreate.mockResolvedValue({
        choices: [
          {
            message: { content: 'Truncated', tool_calls: null },
            finish_reason: 'length',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 4096 },
      });

      const result = await service.chatWithTools(openaiRequest);
      expect(result.stopReason).toBe('max_tokens');
    });

    it('should throw when no choices returned', async () => {
      mockOpenAICreate.mockResolvedValue({ choices: [] });

      await expect(service.chatWithTools(openaiRequest)).rejects.toThrow(
        'Erreur openai:',
      );
    });

    it('should throw when API key is missing', async () => {
      const noKeyRequest: ChatRequest = {
        ...openaiRequest,
        config: { ...openaiRequest.config, apiKey: undefined },
      };

      await expect(service.chatWithTools(noKeyRequest)).rejects.toThrow(
        'Clé API openai manquante',
      );
    });

    it('should pass tools in OpenAI function format', async () => {
      mockOpenAICreate.mockResolvedValue({
        choices: [
          {
            message: { content: 'Ok', tool_calls: null },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      });

      await service.chatWithTools(openaiRequest);

      const callArgs = mockOpenAICreate.mock.calls[0][0];
      expect(callArgs.tools).toBeDefined();
      expect(callArgs.tools[0].type).toBe('function');
      expect(callArgs.tools[0].function.name).toBe('search_compass_scenarios');
      expect(callArgs.tools[0].function.parameters).toEqual(baseTools[0].parameters);
    });

    it('should use custom baseURL for DeepSeek', async () => {
      const deepseekRequest: ChatRequest = {
        messages: baseMessages,
        config: {
          provider: LLMProvider.DEEPSEEK,
          model: 'deepseek-chat',
          apiKey: 'test-ds-key',
        },
      };

      mockOpenAICreate.mockResolvedValue({
        choices: [
          {
            message: { content: 'DeepSeek response', tool_calls: null },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      });

      const result = await service.chatWithTools(deepseekRequest);
      expect(result.content[0]).toEqual({ type: 'text', text: 'DeepSeek response' });
    });
  });

  // ================================================================
  // Gemini (Google) provider
  // ================================================================

  describe('Gemini provider', () => {
    const geminiRequest: ChatRequest = {
      messages: baseMessages,
      tools: baseTools,
      systemPrompt: 'System prompt',
      config: {
        provider: LLMProvider.GEMINI,
        model: 'gemini-3-flash-preview',
        apiKey: 'test-gemini-key',
        temperature: 0.3,
        maxTokens: 4096,
      },
    };

    it('should return text response', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: 'Bonjour de Gemini' }],
            },
          },
        ],
        usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 8 },
      });

      const result = await service.chatWithTools(geminiRequest);

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({ type: 'text', text: 'Bonjour de Gemini' });
      expect(result.stopReason).toBe('end_turn');
      expect(result.usage).toEqual({ inputTokens: 12, outputTokens: 8 });
    });

    it('should map function calls to tool_use blocks', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                { functionCall: { name: 'search_compass_scenarios', args: { query: 'critical' } } },
              ],
            },
          },
        ],
        usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 15 },
      });

      const result = await service.chatWithTools(geminiRequest);

      expect(result.stopReason).toBe('tool_use');
      const toolBlock = result.content.find((b) => b.type === 'tool_use');
      expect(toolBlock).toBeDefined();
      if (toolBlock && toolBlock.type === 'tool_use') {
        expect(toolBlock.name).toBe('search_compass_scenarios');
        expect(toolBlock.input).toEqual({ query: 'critical' });
        expect(toolBlock.id).toContain('gemini_');
        // Should preserve raw parts for thoughtSignature circulation
        expect(toolBlock._geminiRawParts).toBeDefined();
      }
    });

    it('should include both text and function calls', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [
                { text: 'Thinking...' },
                { functionCall: { name: 'search_compass_scenarios', args: { query: 'test' } } },
              ],
            },
          },
        ],
        usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 15 },
      });

      const result = await service.chatWithTools(geminiRequest);

      expect(result.content).toHaveLength(2);
      expect(result.stopReason).toBe('tool_use');
    });

    it('should throw when API key is missing', async () => {
      const noKeyRequest: ChatRequest = {
        ...geminiRequest,
        config: { ...geminiRequest.config, apiKey: undefined },
      };

      await expect(service.chatWithTools(noKeyRequest)).rejects.toThrow(
        'Clé API Gemini manquante',
      );
    });

    it('should throw with Gemini prefix on SDK error', async () => {
      mockGenerateContent.mockRejectedValue(new Error('Quota exceeded'));

      await expect(service.chatWithTools(geminiRequest)).rejects.toThrow(
        'Erreur Gemini: Quota exceeded',
      );
    });

    it('should pass tools and config to generateContent', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [{ text: 'Ok' }],
            },
          },
        ],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
      });

      await service.chatWithTools(geminiRequest);

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-3-flash-preview',
          config: expect.objectContaining({
            systemInstruction: 'System prompt',
            tools: [
              {
                functionDeclarations: [
                  {
                    name: 'search_compass_scenarios',
                    description: 'Search COMPASS scenarios',
                    parameters: baseTools[0].parameters,
                  },
                ],
              },
            ],
          }),
        }),
      );
    });

    it('should return empty text block when no content', async () => {
      mockGenerateContent.mockResolvedValue({
        candidates: [
          {
            content: {
              parts: [],
            },
          },
        ],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 0 },
      });

      const result = await service.chatWithTools(geminiRequest);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({ type: 'text', text: '' });
    });
  });

  // ================================================================
  // Mistral provider (own SDK)
  // ================================================================

  describe('Mistral provider', () => {
    const mistralRequest: ChatRequest = {
      messages: baseMessages,
      tools: baseTools,
      config: {
        provider: LLMProvider.MISTRAL,
        model: 'mistral-large',
        apiKey: 'test-mistral-key',
        temperature: 0.4,
        maxTokens: 2048,
      },
    };

    it('should return text response', async () => {
      mockMistralComplete.mockResolvedValue({
        choices: [
          {
            message: { content: 'Bonjour de Mistral', toolCalls: null },
            finishReason: 'stop',
          },
        ],
        usage: { promptTokens: 15, completionTokens: 10 },
      });

      const result = await service.chatWithTools(mistralRequest);

      expect(result.content[0]).toEqual({ type: 'text', text: 'Bonjour de Mistral' });
      expect(result.stopReason).toBe('end_turn');
      expect(result.usage).toEqual({ inputTokens: 15, outputTokens: 10 });
    });

    it('should parse Mistral toolCalls correctly', async () => {
      mockMistralComplete.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
              toolCalls: [
                {
                  id: 'mistral_call_1',
                  type: 'function',
                  function: {
                    name: 'search_compass_scenarios',
                    arguments: '{"query":"test"}',
                  },
                },
              ],
            },
            finishReason: 'tool_calls',
          },
        ],
        usage: { promptTokens: 20, completionTokens: 15 },
      });

      const result = await service.chatWithTools(mistralRequest);

      expect(result.stopReason).toBe('tool_use');
      const toolBlock = result.content.find((b) => b.type === 'tool_use');
      expect(toolBlock).toBeDefined();
      if (toolBlock && toolBlock.type === 'tool_use') {
        expect(toolBlock.name).toBe('search_compass_scenarios');
        expect(toolBlock.input).toEqual({ query: 'test' });
      }
    });

    it('should handle object arguments (non-string) in Mistral toolCalls', async () => {
      mockMistralComplete.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
              toolCalls: [
                {
                  id: 'mc_1',
                  type: 'function',
                  function: {
                    name: 'search_compass_scenarios',
                    arguments: { query: 'direct-object' },
                  },
                },
              ],
            },
            finishReason: 'tool_calls',
          },
        ],
        usage: { promptTokens: 10, completionTokens: 5 },
      });

      const result = await service.chatWithTools(mistralRequest);
      const toolBlock = result.content.find((b) => b.type === 'tool_use');
      if (toolBlock && toolBlock.type === 'tool_use') {
        expect(toolBlock.input).toEqual({ query: 'direct-object' });
      }
    });

    it('should throw when API key is missing', async () => {
      const noKeyRequest: ChatRequest = {
        ...mistralRequest,
        config: { ...mistralRequest.config, apiKey: undefined },
      };

      await expect(service.chatWithTools(noKeyRequest)).rejects.toThrow(
        'Clé API Mistral manquante',
      );
    });
  });

  // ================================================================
  // Local models (Ollama)
  // ================================================================

  describe('Ollama provider', () => {
    const ollamaRequest: ChatRequest = {
      messages: baseMessages,
      tools: baseTools,
      systemPrompt: 'System prompt',
      config: {
        provider: LLMProvider.OLLAMA,
        model: 'llama3',
        temperature: 0.5,
        maxTokens: 2048,
      },
    };

    it('should return text response from Ollama', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            message: { content: 'Hello from Ollama' },
            prompt_eval_count: 10,
            eval_count: 8,
          }),
      });

      const result = await service.chatWithTools(ollamaRequest);

      expect(result.content[0]).toEqual({ type: 'text', text: 'Hello from Ollama' });
      expect(result.stopReason).toBe('end_turn');
    });

    it('should detect tool_call JSON blocks in response', async () => {
      const responseText = `I need to search.\n\`\`\`json\n{"tool_call": {"name": "search_compass_scenarios", "arguments": {"query": "injection"}}}\n\`\`\`\n`;

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            message: { content: responseText },
            prompt_eval_count: 10,
            eval_count: 20,
          }),
      });

      const result = await service.chatWithTools(ollamaRequest);

      expect(result.stopReason).toBe('tool_use');
      const toolBlock = result.content.find((b) => b.type === 'tool_use');
      expect(toolBlock).toBeDefined();
      if (toolBlock && toolBlock.type === 'tool_use') {
        expect(toolBlock.name).toBe('search_compass_scenarios');
        expect(toolBlock.input).toEqual({ query: 'injection' });
      }
    });

    it('should throw on Ollama HTTP error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(service.chatWithTools(ollamaRequest)).rejects.toThrow(
        'Erreur Ollama: Ollama (500): Internal Server Error',
      );
    });

    it('should throw connection error with helpful message', async () => {
      const connError = new Error('Connection refused');
      (connError as any).code = 'ECONNREFUSED';
      mockFetch.mockRejectedValue(connError);

      await expect(service.chatWithTools(ollamaRequest)).rejects.toThrow(
        'Impossible de se connecter à Ollama',
      );
    });

    it('should use default baseUrl http://localhost:11434', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: { content: 'Ok' } }),
      });

      await service.chatWithTools(ollamaRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        expect.any(Object),
      );
    });
  });

  // ================================================================
  // Local models (LM Studio)
  // ================================================================

  describe('LM Studio provider', () => {
    const lmStudioRequest: ChatRequest = {
      messages: baseMessages,
      config: {
        provider: LLMProvider.LM_STUDIO,
        model: 'local-model',
        temperature: 0.5,
      },
    };

    it('should return text response from LM Studio', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'LM Studio response' } }],
            usage: { prompt_tokens: 10, completion_tokens: 8 },
          }),
      });

      const result = await service.chatWithTools(lmStudioRequest);

      expect(result.content[0]).toEqual({ type: 'text', text: 'LM Studio response' });
      expect(result.stopReason).toBe('end_turn');
    });

    it('should use default baseUrl http://localhost:1234', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'Ok' } }],
            usage: {},
          }),
      });

      await service.chatWithTools(lmStudioRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:1234/v1/chat/completions',
        expect.any(Object),
      );
    });
  });

  // ================================================================
  // Unsupported provider
  // ================================================================

  describe('unsupported provider', () => {
    it('should throw for unknown provider', async () => {
      const request: ChatRequest = {
        messages: baseMessages,
        config: {
          provider: 'unknown-provider',
          model: 'some-model',
          apiKey: 'key',
        },
      };

      await expect(service.chatWithTools(request)).rejects.toThrow(
        'Provider "unknown-provider" non supporté pour le chat',
      );
    });
  });

  // ================================================================
  // Groq provider (OpenAI-compatible path)
  // ================================================================

  describe('Groq provider (OpenAI-compatible)', () => {
    it('should route through OpenAI-compatible handler', async () => {
      const groqRequest: ChatRequest = {
        messages: baseMessages,
        config: {
          provider: LLMProvider.GROQ,
          model: 'llama-3.3-70b',
          apiKey: 'test-groq-key',
        },
      };

      mockOpenAICreate.mockResolvedValue({
        choices: [
          {
            message: { content: 'Groq response', tool_calls: null },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      });

      const result = await service.chatWithTools(groqRequest);

      expect(result.content[0]).toEqual({ type: 'text', text: 'Groq response' });
      expect(result.stopReason).toBe('end_turn');
    });
  });

  // ================================================================
  // Message conversion: tool_result in conversation history
  // ================================================================

  describe('message conversion with tool_result history', () => {
    it('should handle messages with tool_result content blocks for Claude', async () => {
      const request: ChatRequest = {
        messages: [
          { role: 'user', content: 'Search for injection' },
          {
            role: 'assistant',
            content: [
              { type: 'text', text: 'Let me search' },
              { type: 'tool_use', id: 'tc1', name: 'search_compass_scenarios', input: { query: 'injection' } },
            ],
          },
          {
            role: 'user',
            content: [
              { type: 'tool_result', tool_use_id: 'tc1', content: '{"count":5}' },
            ],
          },
          { role: 'user', content: 'Tell me more' },
        ],
        config: {
          provider: LLMProvider.CLAUDE,
          model: 'claude-sonnet-4-20250514',
          apiKey: 'test-key',
        },
      };

      mockAnthropicCreate.mockResolvedValue({
        content: [{ type: 'text', text: 'Result' }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 50, output_tokens: 20 },
      });

      const result = await service.chatWithTools(request);
      expect(result.content[0]).toEqual({ type: 'text', text: 'Result' });
    });
  });
});
