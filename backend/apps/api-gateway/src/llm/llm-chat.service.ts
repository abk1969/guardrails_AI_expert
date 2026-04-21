import { Injectable, Logger } from '@nestjs/common';
import {
  ChatRequest,
  LLMChatResponse,
  ContentBlock,
  TextBlock,
  ToolUseBlock,
  ChatMessage,
  ToolSchema,
} from './dto/chat-message.dto';
import { LLMProvider } from './dto/llm-configuration.dto';

@Injectable()
export class LLMChatService {
  private readonly logger = new Logger(LLMChatService.name);

  async chatWithTools(request: ChatRequest): Promise<LLMChatResponse> {
    const provider = request.config.provider;
    this.logger.log(
      `Chat request: provider=${provider}, model=${request.config.model}, tools=${request.tools?.length || 0}`,
    );

    switch (provider) {
      case LLMProvider.CLAUDE:
        return this.chatClaude(request);

      case LLMProvider.GEMINI:
        return this.chatGemini(request);

      case LLMProvider.OPENAI:
      case LLMProvider.MISTRAL:
      case LLMProvider.GROQ:
      case LLMProvider.DEEPSEEK:
      case LLMProvider.QWEN:
      case LLMProvider.XAI_GROK:
        return this.chatOpenAICompatible(request);

      case LLMProvider.OLLAMA:
      case LLMProvider.LM_STUDIO:
        return this.chatLocalModel(request);

      default:
        throw new Error(`Provider "${provider}" non supporté pour le chat`);
    }
  }

  // ---------------------------------------------------------------------------
  // Claude (Anthropic) — native tool_use
  // ---------------------------------------------------------------------------
  private async chatClaude(request: ChatRequest): Promise<LLMChatResponse> {
    if (!request.config.apiKey) {
      throw new Error('Clé API Claude manquante');
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: request.config.apiKey });

    const messages = this.toClaudeMessages(request.messages);

    const params: Record<string, any> = {
      model: request.config.model,
      max_tokens: request.config.maxTokens || 4096,
      messages,
    };

    if (request.systemPrompt) {
      params.system = request.systemPrompt;
    }

    if (request.config.temperature !== undefined) {
      params.temperature = request.config.temperature;
    }

    if (request.tools?.length) {
      params.tools = request.tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters,
      }));
    }

    try {
      const response = await client.messages.create(params as any);

      const content: ContentBlock[] = (response.content as any[]).map(
        (block) => {
          if (block.type === 'tool_use') {
            return {
              type: 'tool_use' as const,
              id: block.id,
              name: block.name,
              input: block.input,
            };
          }
          return { type: 'text' as const, text: block.text || '' };
        },
      );

      const stopReason = this.mapClaudeStopReason(response.stop_reason);

      return {
        content,
        stopReason,
        usage: {
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0,
        },
      };
    } catch (error) {
      this.logger.error(`Claude chat error: ${error.message}`);
      throw new Error(`Erreur Claude: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Gemini (Google) — function_calling
  // ---------------------------------------------------------------------------
  private async chatGemini(request: ChatRequest): Promise<LLMChatResponse> {
    if (!request.config.apiKey) {
      throw new Error('Clé API Gemini manquante');
    }

    // Use @google/genai (new SDK) — required for Gemini 3 thought_signature support
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: request.config.apiKey });

    // Build contents array for generateContent
    const contents = this.toGeminiContents(request.messages);

    // Build config
    const config: Record<string, any> = {};

    if (request.systemPrompt) {
      config.systemInstruction = request.systemPrompt;
    }

    if (request.tools?.length) {
      config.tools = [
        {
          functionDeclarations: request.tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          })),
        },
      ];
    }

    if (request.config.temperature !== undefined) {
      config.temperature = request.config.temperature;
    }
    if (request.config.maxTokens) {
      config.maxOutputTokens = request.config.maxTokens;
    }

    // Use low thinking to reduce latency while preserving thought_signature
    config.thinkingConfig = { thinkingBudget: 1024 };

    try {
      const response = await ai.models.generateContent({
        model: request.config.model,
        contents,
        config,
      });

      const content: ContentBlock[] = [];
      let hasToolUse = false;

      // Preserve raw candidate parts for thought_signature circulation
      const candidateParts =
        response.candidates?.[0]?.content?.parts || [];

      for (const part of candidateParts) {
        if (part.functionCall) {
          hasToolUse = true;
          content.push({
            type: 'tool_use',
            id: `gemini_${Date.now()}_${part.functionCall.name}`,
            name: part.functionCall.name,
            input: (part.functionCall.args as Record<string, any>) || {},
            // Store ALL raw parts from this candidate turn so we can replay
            // them in the next request with thoughtSignature intact
            _geminiRawParts: candidateParts,
          });
        } else if (part.text) {
          content.push({ type: 'text', text: part.text });
        }
        // Skip thought parts — they are internal reasoning
      }

      if (content.length === 0) {
        content.push({ type: 'text', text: '' });
      }

      return {
        content,
        stopReason: hasToolUse ? 'tool_use' : 'end_turn',
        usage: {
          inputTokens:
            response.usageMetadata?.promptTokenCount || 0,
          outputTokens:
            response.usageMetadata?.candidatesTokenCount || 0,
        },
      };
    } catch (error) {
      this.logger.error(`Gemini chat error: ${error.message}`);
      throw new Error(`Erreur Gemini: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // OpenAI-compatible (OpenAI, Mistral, Groq, DeepSeek, Qwen, xAI Grok)
  // ---------------------------------------------------------------------------
  private async chatOpenAICompatible(
    request: ChatRequest,
  ): Promise<LLMChatResponse> {
    const provider = request.config.provider;

    // Mistral uses its own SDK
    if (provider === LLMProvider.MISTRAL) {
      return this.chatMistral(request);
    }

    if (!request.config.apiKey) {
      throw new Error(`Clé API ${provider} manquante`);
    }

    const OpenAI = (await import('openai')).default;
    const baseURL = this.getOpenAIBaseURL(provider, request.config.baseUrl);

    const openai = new OpenAI({
      apiKey: request.config.apiKey,
      ...(baseURL && { baseURL }),
    });

    const messages = this.toOpenAIMessages(request.messages, request.systemPrompt);

    const params: Record<string, any> = {
      model: request.config.model,
      messages,
    };

    if (request.config.maxTokens) {
      params.max_tokens = request.config.maxTokens;
    }
    if (request.config.temperature !== undefined) {
      params.temperature = request.config.temperature;
    }

    if (request.tools?.length) {
      params.tools = request.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    try {
      const completion = await openai.chat.completions.create(params as any);
      const choice = completion.choices?.[0];

      if (!choice) {
        throw new Error('Aucune réponse du modèle');
      }

      const content: ContentBlock[] = [];

      if (choice.message?.content) {
        content.push({ type: 'text', text: choice.message.content });
      }

      if (choice.message?.tool_calls?.length) {
        for (const tc of choice.message.tool_calls) {
          if (tc.type === 'function') {
            let parsedArgs: Record<string, any> = {};
            try {
              parsedArgs = JSON.parse(tc.function.arguments || '{}');
            } catch {
              parsedArgs = { raw: tc.function.arguments };
            }
            content.push({
              type: 'tool_use',
              id: tc.id,
              name: tc.function.name,
              input: parsedArgs,
            });
          }
        }
      }

      if (content.length === 0) {
        content.push({ type: 'text', text: '' });
      }

      const stopReason = this.mapOpenAIFinishReason(choice.finish_reason);

      return {
        content,
        stopReason,
        usage: {
          inputTokens: completion.usage?.prompt_tokens || 0,
          outputTokens: completion.usage?.completion_tokens || 0,
        },
      };
    } catch (error) {
      this.logger.error(`${provider} chat error: ${error.message}`);
      throw new Error(`Erreur ${provider}: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Mistral — own SDK
  // ---------------------------------------------------------------------------
  private async chatMistral(request: ChatRequest): Promise<LLMChatResponse> {
    if (!request.config.apiKey) {
      throw new Error('Clé API Mistral manquante');
    }

    const { Mistral } = await import('@mistralai/mistralai');
    const client = new Mistral({ apiKey: request.config.apiKey });

    const messages = this.toOpenAIMessages(request.messages, request.systemPrompt);

    const params: Record<string, any> = {
      model: request.config.model,
      messages,
    };

    if (request.config.maxTokens) {
      params.maxTokens = request.config.maxTokens;
    }
    if (request.config.temperature !== undefined) {
      params.temperature = request.config.temperature;
    }

    if (request.tools?.length) {
      params.tools = request.tools.map((t) => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    try {
      const completion = await client.chat.complete(params as any);
      const choice = (completion as any).choices?.[0];

      if (!choice) {
        throw new Error('Aucune réponse de Mistral');
      }

      const content: ContentBlock[] = [];

      if (choice.message?.content) {
        content.push({ type: 'text', text: choice.message.content });
      }

      if (choice.message?.toolCalls?.length) {
        for (const tc of choice.message.toolCalls) {
          if (tc.type === 'function') {
            let parsedArgs: Record<string, any> = {};
            try {
              parsedArgs =
                typeof tc.function.arguments === 'string'
                  ? JSON.parse(tc.function.arguments)
                  : tc.function.arguments || {};
            } catch {
              parsedArgs = { raw: tc.function.arguments };
            }
            content.push({
              type: 'tool_use',
              id: tc.id || `mistral_${Date.now()}`,
              name: tc.function.name,
              input: parsedArgs,
            });
          }
        }
      }

      if (content.length === 0) {
        content.push({ type: 'text', text: '' });
      }

      const stopReason = this.mapOpenAIFinishReason(choice.finishReason);

      return {
        content,
        stopReason,
        usage: {
          inputTokens: (completion as any).usage?.promptTokens || 0,
          outputTokens: (completion as any).usage?.completionTokens || 0,
        },
      };
    } catch (error) {
      this.logger.error(`Mistral chat error: ${error.message}`);
      throw new Error(`Erreur Mistral: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Local models (Ollama, LM Studio) — ReAct prompt-based fallback
  // ---------------------------------------------------------------------------
  private async chatLocalModel(
    request: ChatRequest,
  ): Promise<LLMChatResponse> {
    const provider = request.config.provider;
    const isOllama = provider === LLMProvider.OLLAMA;

    const baseUrl = request.config.baseUrl ||
      (isOllama ? 'http://localhost:11434' : 'http://localhost:1234');

    // Build system prompt with tools injected as text
    let systemPrompt = request.systemPrompt || '';

    if (request.tools?.length) {
      systemPrompt += this.buildToolsPromptBlock(request.tools);
    }

    if (isOllama) {
      return this.chatOllama(request, baseUrl, systemPrompt);
    }

    return this.chatLMStudio(request, baseUrl, systemPrompt);
  }

  private async chatOllama(
    request: ChatRequest,
    baseUrl: string,
    systemPrompt: string,
  ): Promise<LLMChatResponse> {
    const messages = this.toOpenAIMessages(request.messages, systemPrompt);

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.config.model,
          messages,
          stream: false,
          options: {
            ...(request.config.temperature !== undefined && {
              temperature: request.config.temperature,
            }),
            ...(request.config.maxTokens && {
              num_predict: request.config.maxTokens,
            }),
          },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Ollama (${response.status}): ${text}`);
      }

      const data = await response.json();
      const text = data.message?.content || '';

      return this.parseLocalModelResponse(text, data);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(
          `Impossible de se connecter à Ollama sur ${baseUrl}. Vérifiez qu'Ollama est démarré.`,
        );
      }
      this.logger.error(`Ollama chat error: ${error.message}`);
      throw new Error(`Erreur Ollama: ${error.message}`);
    }
  }

  private async chatLMStudio(
    request: ChatRequest,
    baseUrl: string,
    systemPrompt: string,
  ): Promise<LLMChatResponse> {
    const messages = this.toOpenAIMessages(request.messages, systemPrompt);

    try {
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.config.model,
          messages,
          ...(request.config.temperature !== undefined && {
            temperature: request.config.temperature,
          }),
          ...(request.config.maxTokens && {
            max_tokens: request.config.maxTokens,
          }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LM Studio (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';

      return this.parseLocalModelResponse(text, {
        usage: {
          prompt_tokens: data.usage?.prompt_tokens,
          completion_tokens: data.usage?.completion_tokens,
        },
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(
          `Impossible de se connecter à LM Studio sur ${baseUrl}. Vérifiez qu'un modèle est chargé.`,
        );
      }
      this.logger.error(`LM Studio chat error: ${error.message}`);
      throw new Error(`Erreur LM Studio: ${error.message}`);
    }
  }

  // ===========================================================================
  // Message conversion helpers
  // ===========================================================================

  private toClaudeMessages(
    messages: ChatMessage[],
  ): Array<{ role: string; content: any }> {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => {
        if (typeof m.content === 'string') {
          return { role: m.role, content: m.content };
        }

        // Map ContentBlock[] to Claude format
        const blocks = m.content.map((block) => {
          if (block.type === 'tool_result') {
            return {
              type: 'tool_result',
              tool_use_id: block.tool_use_id,
              content: block.content,
            };
          }
          if (block.type === 'tool_use') {
            return {
              type: 'tool_use',
              id: block.id,
              name: block.name,
              input: block.input,
            };
          }
          return { type: 'text', text: block.text };
        });

        return { role: m.role, content: blocks };
      });
  }

  /**
   * Convert internal ChatMessage[] to Gemini contents format.
   * Preserves raw parts (including thoughtSignature) when available.
   */
  private toGeminiContents(
    messages: ChatMessage[],
  ): Array<{ role: string; parts: any[] }> {
    // Build a map of tool_use_id -> tool name from assistant messages
    const toolNameMap = new Map<string, string>();
    for (const m of messages) {
      if (typeof m.content !== 'string') {
        for (const block of m.content) {
          if (block.type === 'tool_use') {
            toolNameMap.set(block.id, block.name);
          }
        }
      }
    }

    const result: Array<{ role: string; parts: any[] }> = [];

    for (const m of messages) {
      if (m.role === 'system') continue;

      if (typeof m.content === 'string') {
        const role = m.role === 'assistant' ? 'model' : 'user';
        result.push({ role, parts: [{ text: m.content }] });
        continue;
      }

      // Check if this message contains tool_result blocks
      const hasToolResult = m.content.some(
        (block) => block.type === 'tool_result',
      );

      if (hasToolResult) {
        // Gemini: functionResponse goes in a 'user' role message (new SDK)
        const parts = m.content
          .filter((block) => block.type === 'tool_result')
          .map((block) => ({
            functionResponse: {
              name: toolNameMap.get(block.tool_use_id) || block.tool_use_id,
              response: { result: block.content },
            },
          }));
        result.push({ role: 'user', parts });
        continue;
      }

      // Assistant messages: use raw Gemini parts if available (preserves thoughtSignature)
      if (m.role === 'assistant') {
        const toolUseBlock = m.content.find(
          (b): b is ToolUseBlock => b.type === 'tool_use',
        );

        if (toolUseBlock?._geminiRawParts?.length) {
          // Replay raw parts verbatim — this preserves thoughtSignature
          result.push({ role: 'model', parts: toolUseBlock._geminiRawParts });
          continue;
        }

        // Fallback: reconstruct parts manually (no thought_signature)
        const parts = m.content.map((block) => {
          if (block.type === 'tool_use') {
            return {
              functionCall: { name: block.name, args: block.input },
            };
          }
          return { text: (block as any).text || '' };
        });
        result.push({ role: 'model', parts });
        continue;
      }

      // User messages
      const parts = m.content
        .filter((block) => block.type === 'text')
        .map((block) => ({ text: (block as any).text || '' }));
      if (parts.length > 0) {
        result.push({ role: 'user', parts });
      }
    }

    return result;
  }

  private toOpenAIMessages(
    messages: ChatMessage[],
    systemPrompt?: string,
  ): Array<Record<string, any>> {
    const result: Array<Record<string, any>> = [];

    if (systemPrompt) {
      result.push({ role: 'system', content: systemPrompt });
    }

    for (const m of messages) {
      if (m.role === 'system') {
        result.push({ role: 'system', content: this.getTextContent(m) });
        continue;
      }

      if (typeof m.content === 'string') {
        result.push({ role: m.role, content: m.content });
        continue;
      }

      // Check for tool_use blocks (assistant message with tool calls)
      const toolUseBlocks = m.content.filter(
        (b): b is ToolUseBlock => b.type === 'tool_use',
      );
      const textBlocks = m.content.filter(
        (b): b is TextBlock => b.type === 'text',
      );

      if (m.role === 'assistant' && toolUseBlocks.length > 0) {
        const msg: Record<string, any> = {
          role: 'assistant',
          content: textBlocks.map((b) => b.text).join('\n') || null,
          tool_calls: toolUseBlocks.map((tc) => ({
            id: tc.id,
            type: 'function',
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.input),
            },
          })),
        };
        result.push(msg);
        continue;
      }

      // Check for tool_result blocks
      const toolResults = m.content.filter(
        (b) => b.type === 'tool_result',
      );
      if (toolResults.length > 0) {
        for (const tr of toolResults) {
          if (tr.type === 'tool_result') {
            result.push({
              role: 'tool',
              tool_call_id: tr.tool_use_id,
              content: tr.content,
            });
          }
        }
        continue;
      }

      // Plain text content blocks
      result.push({
        role: m.role,
        content: textBlocks.map((b) => b.text).join('\n'),
      });
    }

    return result;
  }

  // ===========================================================================
  // Utility helpers
  // ===========================================================================

  private getTextContent(message: ChatMessage): string {
    if (typeof message.content === 'string') return message.content;
    return message.content
      .filter((b): b is TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
  }

  private getOpenAIBaseURL(
    provider: string,
    customBaseUrl?: string,
  ): string | undefined {
    if (customBaseUrl) return customBaseUrl;

    const providerBaseURLs: Record<string, string> = {
      [LLMProvider.DEEPSEEK]: 'https://api.deepseek.com',
      [LLMProvider.QWEN]:
        'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
      [LLMProvider.XAI_GROK]: 'https://api.x.ai/v1',
    };

    return providerBaseURLs[provider];
  }

  private mapClaudeStopReason(
    reason: string,
  ): 'end_turn' | 'tool_use' | 'max_tokens' {
    if (reason === 'tool_use') return 'tool_use';
    if (reason === 'max_tokens') return 'max_tokens';
    return 'end_turn';
  }

  private mapOpenAIFinishReason(
    reason: string | null | undefined,
  ): 'end_turn' | 'tool_use' | 'max_tokens' {
    if (reason === 'tool_calls') return 'tool_use';
    if (reason === 'length') return 'max_tokens';
    return 'end_turn';
  }

  /**
   * Build a text block describing available tools for local models
   * that don't support native function calling.
   */
  private buildToolsPromptBlock(tools: ToolSchema[]): string {
    const toolDescriptions = tools
      .map(
        (t) =>
          `- **${t.name}**: ${t.description}\n  Parameters: ${JSON.stringify(t.parameters)}`,
      )
      .join('\n');

    return `

## Available Tools

You have the following tools available. To call a tool, respond with a JSON block in this exact format:

\`\`\`json
{"tool_call": {"name": "tool_name", "arguments": {"param1": "value1"}}}
\`\`\`

${toolDescriptions}

When you want to use a tool, output ONLY the JSON block above. After receiving the tool result, continue your reasoning.
If you don't need to use a tool, respond normally with text.`;
  }

  /**
   * Parse local model response text, detecting any tool call JSON blocks.
   */
  private parseLocalModelResponse(
    text: string,
    rawData: any,
  ): LLMChatResponse {
    const content: ContentBlock[] = [];
    let hasToolUse = false;

    // Try to find JSON tool_call blocks in the response
    const toolCallRegex =
      /```(?:json)?\s*\n?\s*(\{[\s\S]*?"tool_call"[\s\S]*?\})\s*\n?\s*```/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = toolCallRegex.exec(text)) !== null) {
      // Add any text before this match
      const textBefore = text.slice(lastIndex, match.index).trim();
      if (textBefore) {
        content.push({ type: 'text', text: textBefore });
      }

      try {
        const parsed = JSON.parse(match[1]);
        if (parsed.tool_call?.name) {
          hasToolUse = true;
          content.push({
            type: 'tool_use',
            id: `local_${Date.now()}_${parsed.tool_call.name}`,
            name: parsed.tool_call.name,
            input: parsed.tool_call.arguments || {},
          });
        }
      } catch {
        // Not valid JSON, treat as text
        content.push({ type: 'text', text: match[0] });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last match
    const remaining = text.slice(lastIndex).trim();
    if (remaining) {
      content.push({ type: 'text', text: remaining });
    }

    if (content.length === 0) {
      content.push({ type: 'text', text: text || '' });
    }

    return {
      content,
      stopReason: hasToolUse ? 'tool_use' : 'end_turn',
      usage: {
        inputTokens:
          rawData?.usage?.prompt_tokens ||
          rawData?.prompt_eval_count ||
          0,
        outputTokens:
          rawData?.usage?.completion_tokens ||
          rawData?.eval_count ||
          0,
      },
    };
  }
}
