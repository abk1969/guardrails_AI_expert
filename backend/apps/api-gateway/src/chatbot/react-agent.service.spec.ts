import { Test, TestingModule } from '@nestjs/testing';
import { ReactAgentService } from './react-agent.service';
import { LLMChatService } from '../llm/llm-chat.service';
import { McpService } from '../mcp/mcp.service';
import { ChatbotGateway } from './chatbot.gateway';
import { LLMChatResponse } from '../llm/dto/chat-message.dto';
import { ChatbotSendDto } from './dto/chatbot.dto';

// ── Mock MCP_TOOL_SCHEMAS to avoid importing the real file ───────────
jest.mock('../mcp/mcp-tool-schemas', () => ({
  MCP_TOOL_SCHEMAS: [
    {
      name: 'search_compass_scenarios',
      description: 'Search COMPASS scenarios',
      parameters: { type: 'object', properties: { query: { type: 'string' } } },
    },
    {
      name: 'get_platform_overview',
      description: 'Get platform overview',
      parameters: { type: 'object', properties: {} },
    },
  ],
}));

describe('ReactAgentService', () => {
  let service: ReactAgentService;
  let llmChatService: jest.Mocked<LLMChatService>;
  let mcpService: jest.Mocked<McpService>;
  let chatbotGateway: jest.Mocked<ChatbotGateway>;

  const SESSION_ID = 'test-session-123';
  const ORG_ID = 'org-test-456';

  const baseDto: ChatbotSendDto = {
    message: 'Quels sont les risques critiques ?',
    llmConfig: {
      provider: 'claude',
      model: 'claude-sonnet-4-20250514',
      apiKey: 'test-api-key',
      temperature: 0.3,
      maxTokens: 4096,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReactAgentService,
        {
          provide: LLMChatService,
          useValue: {
            chatWithTools: jest.fn(),
          },
        },
        {
          provide: McpService,
          useValue: {
            executeQuery: jest.fn(),
          },
        },
        {
          provide: ChatbotGateway,
          useValue: {
            emitThinking: jest.fn(),
            emitToolCall: jest.fn(),
            emitToolResult: jest.fn(),
            emitComplete: jest.fn(),
            emitError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ReactAgentService);
    llmChatService = module.get(LLMChatService);
    mcpService = module.get(McpService);
    chatbotGateway = module.get(ChatbotGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ================================================================
  // Single-turn: LLM returns end_turn with text, no tools
  // ================================================================

  describe('single-turn response (no tools)', () => {
    it('should emit complete with the text answer', async () => {
      const llmResponse: LLMChatResponse = {
        content: [{ type: 'text', text: 'Voici les risques critiques...' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 50, outputTokens: 30 },
      };
      llmChatService.chatWithTools.mockResolvedValue(llmResponse);

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      expect(llmChatService.chatWithTools).toHaveBeenCalledTimes(1);
      expect(chatbotGateway.emitComplete).toHaveBeenCalledWith(
        SESSION_ID,
        'Voici les risques critiques...',
        [],
        1,
      );
      expect(chatbotGateway.emitToolCall).not.toHaveBeenCalled();
      expect(chatbotGateway.emitError).not.toHaveBeenCalled();
    });

    it('should include conversation history in messages', async () => {
      const dto: ChatbotSendDto = {
        ...baseDto,
        conversationHistory: [
          { role: 'user', content: 'Bonjour' },
          { role: 'assistant', content: 'Bonjour, comment puis-je vous aider ?' },
        ],
      };

      const llmResponse: LLMChatResponse = {
        content: [{ type: 'text', text: 'Réponse' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 100, outputTokens: 20 },
      };
      llmChatService.chatWithTools.mockResolvedValue(llmResponse);

      await service.processMessage(dto, SESSION_ID, ORG_ID);

      const callArgs = llmChatService.chatWithTools.mock.calls[0][0];
      // history (2) + current message (1) = 3
      expect(callArgs.messages).toHaveLength(3);
      expect(callArgs.messages[0].role).toBe('user');
      expect(callArgs.messages[0].content).toBe('Bonjour');
      expect(callArgs.messages[2].content).toBe(baseDto.message);
    });

    it('should pass systemPrompt and tools in the request', async () => {
      const llmResponse: LLMChatResponse = {
        content: [{ type: 'text', text: 'Ok' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 10, outputTokens: 5 },
      };
      llmChatService.chatWithTools.mockResolvedValue(llmResponse);

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      const callArgs = llmChatService.chatWithTools.mock.calls[0][0];
      expect(callArgs.systemPrompt).toContain('AI RISK MANAGER');
      expect(callArgs.tools).toHaveLength(2);
      expect(callArgs.tools[0].name).toBe('search_compass_scenarios');
      expect(callArgs.config.provider).toBe('claude');
      expect(callArgs.config.model).toBe('claude-sonnet-4-20250514');
    });

    it('should handle max_tokens stop reason as end_turn', async () => {
      const llmResponse: LLMChatResponse = {
        content: [{ type: 'text', text: 'Réponse tronquée...' }],
        stopReason: 'max_tokens',
        usage: { inputTokens: 50, outputTokens: 4096 },
      };
      llmChatService.chatWithTools.mockResolvedValue(llmResponse);

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      expect(chatbotGateway.emitComplete).toHaveBeenCalledWith(
        SESSION_ID,
        'Réponse tronquée...',
        [],
        1,
      );
    });
  });

  // ================================================================
  // Tool use: single tool call then final answer
  // ================================================================

  describe('single tool call flow', () => {
    it('should execute tool and return final answer', async () => {
      // First call: LLM wants to use a tool
      const toolCallResponse: LLMChatResponse = {
        content: [
          { type: 'text', text: 'Je vais chercher les scénarios...' },
          {
            type: 'tool_use',
            id: 'tool_1',
            name: 'search_compass_scenarios',
            input: { query: 'critical' },
          },
        ],
        stopReason: 'tool_use',
        usage: { inputTokens: 100, outputTokens: 50 },
      };

      // Second call: LLM provides final answer
      const finalResponse: LLMChatResponse = {
        content: [{ type: 'text', text: 'J\'ai trouvé 7 scénarios critiques.' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 200, outputTokens: 80 },
      };

      llmChatService.chatWithTools
        .mockResolvedValueOnce(toolCallResponse)
        .mockResolvedValueOnce(finalResponse);

      mcpService.executeQuery.mockResolvedValue({
        result: { count: 7, scenarios: [] },
        tool: 'search_compass_scenarios',
        timestamp: new Date().toISOString(),
      });

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      // Verify thinking emitted (text alongside tool_use)
      expect(chatbotGateway.emitThinking).toHaveBeenCalledWith(
        SESSION_ID,
        'Je vais chercher les scénarios...',
      );

      // Verify tool call emitted
      expect(chatbotGateway.emitToolCall).toHaveBeenCalledWith(
        SESSION_ID,
        'search_compass_scenarios',
        { query: 'critical' },
        'tool_1',
      );

      // Verify MCP executed
      expect(mcpService.executeQuery).toHaveBeenCalledWith(
        { tool: 'search_compass_scenarios', parameters: { query: 'critical' } },
        ORG_ID,
      );

      // Verify tool result emitted
      expect(chatbotGateway.emitToolResult).toHaveBeenCalledWith(
        SESSION_ID,
        'search_compass_scenarios',
        'tool_1',
        { count: 7, scenarios: [] },
      );

      // Verify final answer
      expect(chatbotGateway.emitComplete).toHaveBeenCalledWith(
        SESSION_ID,
        'J\'ai trouvé 7 scénarios critiques.',
        ['search_compass_scenarios'],
        2,
      );

      // LLM called twice: once for tool, once for final
      expect(llmChatService.chatWithTools).toHaveBeenCalledTimes(2);
    });
  });

  // ================================================================
  // Multi-tool: LLM returns 2 tool_use blocks in one response
  // ================================================================

  describe('multi-tool flow', () => {
    it('should execute multiple tools and return final answer', async () => {
      const multiToolResponse: LLMChatResponse = {
        content: [
          {
            type: 'tool_use',
            id: 'tool_a',
            name: 'search_compass_scenarios',
            input: { riskLevel: 'critical' },
          },
          {
            type: 'tool_use',
            id: 'tool_b',
            name: 'get_platform_overview',
            input: {},
          },
        ],
        stopReason: 'tool_use',
        usage: { inputTokens: 100, outputTokens: 40 },
      };

      const finalResponse: LLMChatResponse = {
        content: [{ type: 'text', text: 'Synthèse complète.' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 300, outputTokens: 100 },
      };

      llmChatService.chatWithTools
        .mockResolvedValueOnce(multiToolResponse)
        .mockResolvedValueOnce(finalResponse);

      mcpService.executeQuery
        .mockResolvedValueOnce({
          result: { count: 7 },
          tool: 'search_compass_scenarios',
          timestamp: new Date().toISOString(),
        })
        .mockResolvedValueOnce({
          result: { name: 'AI Risk Manager' },
          tool: 'get_platform_overview',
          timestamp: new Date().toISOString(),
        });

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      // Both tools called
      expect(mcpService.executeQuery).toHaveBeenCalledTimes(2);
      expect(chatbotGateway.emitToolCall).toHaveBeenCalledTimes(2);
      expect(chatbotGateway.emitToolResult).toHaveBeenCalledTimes(2);

      // Both tools tracked
      expect(chatbotGateway.emitComplete).toHaveBeenCalledWith(
        SESSION_ID,
        'Synthèse complète.',
        ['search_compass_scenarios', 'get_platform_overview'],
        2,
      );
    });
  });

  // ================================================================
  // Max iterations: loop exhaustion
  // ================================================================

  describe('max iterations reached', () => {
    it('should stop after 8 iterations and emit complete with warning', async () => {
      // Always return tool_use to force loop exhaustion
      const loopResponse: LLMChatResponse = {
        content: [
          {
            type: 'tool_use',
            id: 'tool_loop',
            name: 'search_compass_scenarios',
            input: { query: 'test' },
          },
        ],
        stopReason: 'tool_use',
        usage: { inputTokens: 50, outputTokens: 20 },
      };

      llmChatService.chatWithTools.mockResolvedValue(loopResponse);
      mcpService.executeQuery.mockResolvedValue({
        result: { count: 0 },
        tool: 'search_compass_scenarios',
        timestamp: new Date().toISOString(),
      });

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      // Should have iterated 8 times (MAX_ITERATIONS = 8)
      expect(llmChatService.chatWithTools).toHaveBeenCalledTimes(8);

      // Emit complete with the exhaustion message
      expect(chatbotGateway.emitComplete).toHaveBeenCalledWith(
        SESSION_ID,
        expect.stringContaining('limite de raisonnement'),
        ['search_compass_scenarios'],
        8,
      );
    });
  });

  // ================================================================
  // Error handling: LLM throws
  // ================================================================

  describe('LLM error handling', () => {
    it('should emit error when LLM throws', async () => {
      llmChatService.chatWithTools.mockRejectedValue(
        new Error('Erreur Claude: API rate limit exceeded'),
      );

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      expect(chatbotGateway.emitError).toHaveBeenCalledWith(
        SESSION_ID,
        'Erreur Claude: API rate limit exceeded',
      );
      expect(chatbotGateway.emitComplete).not.toHaveBeenCalled();
    });

    it('should emit generic error when error has no message', async () => {
      llmChatService.chatWithTools.mockRejectedValue({});

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      expect(chatbotGateway.emitError).toHaveBeenCalledWith(
        SESSION_ID,
        'Erreur interne du moteur de raisonnement',
      );
    });
  });

  // ================================================================
  // Tool error: MCP throws, tool result contains error
  // ================================================================

  describe('tool execution error', () => {
    it('should pass error in tool result and continue loop', async () => {
      // First call: tool use
      const toolResponse: LLMChatResponse = {
        content: [
          {
            type: 'tool_use',
            id: 'tool_err',
            name: 'search_compass_scenarios',
            input: { query: 'test' },
          },
        ],
        stopReason: 'tool_use',
        usage: { inputTokens: 50, outputTokens: 20 },
      };

      // Second call: LLM handles the error gracefully
      const finalResponse: LLMChatResponse = {
        content: [{ type: 'text', text: 'L\'outil a rencontré une erreur.' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 100, outputTokens: 40 },
      };

      llmChatService.chatWithTools
        .mockResolvedValueOnce(toolResponse)
        .mockResolvedValueOnce(finalResponse);

      mcpService.executeQuery.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      // Tool result should contain the error
      expect(chatbotGateway.emitToolResult).toHaveBeenCalledWith(
        SESSION_ID,
        'search_compass_scenarios',
        'tool_err',
        { error: 'Database connection failed' },
      );

      // Agent should continue and produce final answer
      expect(chatbotGateway.emitComplete).toHaveBeenCalledWith(
        SESSION_ID,
        'L\'outil a rencontré une erreur.',
        ['search_compass_scenarios'],
        2,
      );

      // No emitError (the error was handled in-loop)
      expect(chatbotGateway.emitError).not.toHaveBeenCalled();
    });
  });

  // ================================================================
  // Tool deduplication: same tool used twice
  // ================================================================

  describe('tool usage deduplication', () => {
    it('should not duplicate tool names in toolsUsed list', async () => {
      // First iteration: tool call
      const iter1: LLMChatResponse = {
        content: [
          { type: 'tool_use', id: 'tc1', name: 'search_compass_scenarios', input: { query: 'a' } },
        ],
        stopReason: 'tool_use',
        usage: { inputTokens: 50, outputTokens: 20 },
      };

      // Second iteration: same tool again
      const iter2: LLMChatResponse = {
        content: [
          { type: 'tool_use', id: 'tc2', name: 'search_compass_scenarios', input: { query: 'b' } },
        ],
        stopReason: 'tool_use',
        usage: { inputTokens: 80, outputTokens: 30 },
      };

      // Third iteration: final
      const iter3: LLMChatResponse = {
        content: [{ type: 'text', text: 'Résultat final' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 100, outputTokens: 40 },
      };

      llmChatService.chatWithTools
        .mockResolvedValueOnce(iter1)
        .mockResolvedValueOnce(iter2)
        .mockResolvedValueOnce(iter3);

      mcpService.executeQuery.mockResolvedValue({
        result: { count: 0 },
        tool: 'search_compass_scenarios',
        timestamp: new Date().toISOString(),
      });

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      // toolsUsed should contain the tool only once
      expect(chatbotGateway.emitComplete).toHaveBeenCalledWith(
        SESSION_ID,
        'Résultat final',
        ['search_compass_scenarios'],
        3,
      );
    });
  });

  // ================================================================
  // No text, no tools: fallback break
  // ================================================================

  describe('fallback break (no text, no tool_use, unknown stop reason)', () => {
    it('should emit complete with exhaustion message', async () => {
      const emptyResponse: LLMChatResponse = {
        content: [],
        stopReason: 'end_turn' as any,
        usage: { inputTokens: 10, outputTokens: 0 },
      };
      llmChatService.chatWithTools.mockResolvedValue(emptyResponse);

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      // end_turn with empty text blocks => emitComplete with empty string
      expect(chatbotGateway.emitComplete).toHaveBeenCalledWith(
        SESSION_ID,
        '',
        [],
        1,
      );
    });
  });

  // ================================================================
  // Thinking emission: text alongside tool_use
  // ================================================================

  describe('thinking emission', () => {
    it('should not emit thinking when stop reason is end_turn', async () => {
      const response: LLMChatResponse = {
        content: [{ type: 'text', text: 'Réponse directe' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 50, outputTokens: 30 },
      };
      llmChatService.chatWithTools.mockResolvedValue(response);

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      expect(chatbotGateway.emitThinking).not.toHaveBeenCalled();
    });

    it('should emit thinking when text accompanies tool_use', async () => {
      const response: LLMChatResponse = {
        content: [
          { type: 'text', text: 'Réflexion en cours...' },
          { type: 'tool_use', id: 'tc1', name: 'search_compass_scenarios', input: {} },
        ],
        stopReason: 'tool_use',
        usage: { inputTokens: 50, outputTokens: 30 },
      };

      const final: LLMChatResponse = {
        content: [{ type: 'text', text: 'Done' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 100, outputTokens: 20 },
      };

      llmChatService.chatWithTools
        .mockResolvedValueOnce(response)
        .mockResolvedValueOnce(final);

      mcpService.executeQuery.mockResolvedValue({
        result: {},
        tool: 'search_compass_scenarios',
        timestamp: new Date().toISOString(),
      });

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      expect(chatbotGateway.emitThinking).toHaveBeenCalledWith(
        SESSION_ID,
        'Réflexion en cours...',
      );
    });

    it('should not emit thinking when tool_use has no accompanying text', async () => {
      const response: LLMChatResponse = {
        content: [
          { type: 'tool_use', id: 'tc1', name: 'search_compass_scenarios', input: {} },
        ],
        stopReason: 'tool_use',
        usage: { inputTokens: 50, outputTokens: 30 },
      };

      const final: LLMChatResponse = {
        content: [{ type: 'text', text: 'Done' }],
        stopReason: 'end_turn',
        usage: { inputTokens: 100, outputTokens: 20 },
      };

      llmChatService.chatWithTools
        .mockResolvedValueOnce(response)
        .mockResolvedValueOnce(final);

      mcpService.executeQuery.mockResolvedValue({
        result: {},
        tool: 'search_compass_scenarios',
        timestamp: new Date().toISOString(),
      });

      await service.processMessage(baseDto, SESSION_ID, ORG_ID);

      expect(chatbotGateway.emitThinking).not.toHaveBeenCalled();
    });
  });
});
