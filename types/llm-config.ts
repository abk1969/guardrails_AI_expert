// LLM provider configuration types

export type LLMProvider =
  | 'gemini'
  | 'openai'
  | 'mistral'
  | 'claude'
  | 'deepseek'
  | 'qwen'
  | 'xai-grok'
  | 'groq'
  | 'ollama'
  | 'lm-studio';

export interface LLMProviderInfo {
  id: LLMProvider;
  name: string;
  description: string;
  requiresApiKey: boolean;
  isLocal: boolean;
  defaultBaseUrl?: string;
  models: {
    id: string;
    name: string;
    recommended?: boolean;
  }[];
}

export interface LLMConfiguration {
  provider: LLMProvider;
  apiKey?: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface LLMConfigContextType {
  config: LLMConfiguration | null;
  setConfig: (config: LLMConfiguration) => void;
  testConnection: () => Promise<{ success: boolean; message: string; model?: string }>;
  isConfigured: boolean;
  loading: boolean;
}
