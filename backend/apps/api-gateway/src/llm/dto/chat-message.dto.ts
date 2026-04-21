export type ContentBlockType = 'text' | 'tool_use' | 'tool_result';

export interface TextBlock {
  type: 'text';
  text: string;
}

export interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, any>;
  /** Raw Gemini parts for this assistant turn (preserves thoughtSignature). */
  _geminiRawParts?: any[];
}

export interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

export type ContentBlock = TextBlock | ToolUseBlock | ToolResultBlock;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | ContentBlock[];
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface LLMChatResponse {
  content: ContentBlock[];
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens';
  usage: { inputTokens: number; outputTokens: number };
}

export interface ChatRequest {
  messages: ChatMessage[];
  tools?: ToolSchema[];
  systemPrompt?: string;
  config: {
    provider: string;
    model: string;
    apiKey?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
  };
}
