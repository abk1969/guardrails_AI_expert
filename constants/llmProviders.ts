import type { LLMProviderInfo } from '../types';

export const LLM_PROVIDERS: LLMProviderInfo[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Gemini 3.1 Pro / 3 Flash - Google',
    requiresApiKey: true,
    isLocal: false,
    models: [
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)', recommended: true },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', recommended: true },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 et modèles OpenAI',
    requiresApiKey: true,
    isLocal: false,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', recommended: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (moins cher)', recommended: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'o1-preview', name: 'O1 Preview (Reasoning)' },
      { id: 'o1-mini', name: 'O1 Mini (Reasoning)' },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral Large 2407 - Mistral AI',
    requiresApiKey: true,
    isLocal: false,
    models: [
      { id: 'mistral-large-2407', name: 'Mistral Large 2407', recommended: true },
      { id: 'mistral-large-latest', name: 'Mistral Large Latest' },
      { id: 'mistral-medium', name: 'Mistral Medium' },
      { id: 'mistral-small', name: 'Mistral Small' },
      { id: 'open-mistral-7b', name: 'Open Mistral 7B' },
      { id: 'codestral-latest', name: 'Codestral (Code)' },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Claude Sonnet 4.5 - Anthropic',
    requiresApiKey: true,
    isLocal: false,
    models: [
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', recommended: true },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Oct 2024)' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek-V3 - DeepSeek',
    requiresApiKey: true,
    isLocal: false,
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', recommended: true },
      { id: 'deepseek-coder', name: 'DeepSeek Coder' },
    ],
  },
  {
    id: 'qwen',
    name: 'Qwen',
    description: 'Qwen Max - Alibaba',
    requiresApiKey: true,
    isLocal: false,
    models: [
      { id: 'qwen-max', name: 'Qwen Max', recommended: true },
      { id: 'qwen-plus', name: 'Qwen Plus' },
      { id: 'qwen-turbo', name: 'Qwen Turbo' },
    ],
  },
  {
    id: 'xai-grok',
    name: 'xAI Grok',
    description: 'Grok 4 - xAI',
    requiresApiKey: true,
    isLocal: false,
    models: [
      { id: 'grok-4', name: 'Grok 4', recommended: true },
      { id: 'grok-vision-beta', name: 'Grok Vision (Beta)' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Llama 3.3 - Plateforme Groq (GRATUIT)',
    requiresApiKey: true,
    isLocal: false,
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (GRATUIT)', recommended: true },
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B Versatile' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Modèles locaux avec Ollama',
    requiresApiKey: false,
    isLocal: true,
    defaultBaseUrl: 'http://localhost:11434',
    models: [
      { id: 'llama3.3', name: 'Llama 3.3' },
      { id: 'llama3.2', name: 'Llama 3.2' },
      { id: 'qwen2.5', name: 'Qwen 2.5' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'deepseek-r1', name: 'DeepSeek R1' },
      { id: 'codellama', name: 'Code Llama' },
    ],
  },
  {
    id: 'lm-studio',
    name: 'LM Studio',
    description: 'Interface LM Studio locale',
    requiresApiKey: false,
    isLocal: true,
    defaultBaseUrl: 'http://localhost:1234',
    models: [
      { id: 'local-model', name: 'Modèle chargé dans LM Studio' },
    ],
  },
];

export const getProviderInfo = (providerId: string): LLMProviderInfo | undefined => {
  return LLM_PROVIDERS.find((p) => p.id === providerId);
};
