export type ReasoningStepType = 'thinking' | 'tool_call' | 'tool_result' | 'error';

export interface ReasoningStep {
  id: string;
  type: ReasoningStepType;
  timestamp: string;
  // For thinking
  thought?: string;
  // For tool_call
  toolName?: string;
  toolCallId?: string;
  parameters?: Record<string, any>;
  // For tool_result
  result?: any;
  // For error
  error?: string;
}

export interface AgenticMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // Agentic-specific fields (assistant messages only)
  reasoningSteps?: ReasoningStep[];
  toolsUsed?: string[];
  iterations?: number;
  // UI state
  favorite?: boolean;
  reaction?: 'like' | 'dislike';
}

export interface AgenticConversation {
  id: string;
  title: string;
  messages: AgenticMessage[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface ChatbotSendRequest {
  message: string;
  conversationHistory: Array<{ role: string; content: string }>;
  llmConfig: {
    provider: string;
    model: string;
    apiKey?: string;
    baseUrl?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ChatbotSendResponse {
  sessionId: string;
}

// WebSocket event payloads
export interface ChatbotThinkingEvent {
  thought: string;
  timestamp: string;
}

export interface ChatbotToolCallEvent {
  toolName: string;
  parameters: Record<string, any>;
  toolCallId: string;
  timestamp: string;
}

export interface ChatbotToolResultEvent {
  toolName: string;
  toolCallId: string;
  result: any;
  timestamp: string;
}

export interface ChatbotCompleteEvent {
  answer: string;
  toolsUsed: string[];
  iterations: number;
  timestamp: string;
}

export interface ChatbotErrorEvent {
  error: string;
  timestamp: string;
}
