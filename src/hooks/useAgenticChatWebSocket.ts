import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ReasoningStep,
  ChatbotThinkingEvent,
  ChatbotToolCallEvent,
  ChatbotToolResultEvent,
  ChatbotCompleteEvent,
  ChatbotErrorEvent,
} from '../../types/chatbot';
import { backendStatus } from '../../services/backendStatus';

const DEBUG = import.meta.env.DEV;
const log = (...args: unknown[]) => { if (DEBUG) console.log('[Chatbot WS]', ...args); };
const logError = (...args: unknown[]) => { if (DEBUG) console.error('[Chatbot WS]', ...args); };

const getWebSocketUrl = () => {
  return backendStatus.apiUrl.replace('/api/v1', '').replace(/\/$/, '');
};

export interface AgenticChatCallbacks {
  onThinking?: (event: ChatbotThinkingEvent) => void;
  onToolCall?: (event: ChatbotToolCallEvent) => void;
  onToolResult?: (event: ChatbotToolResultEvent) => void;
  onComplete?: (event: ChatbotCompleteEvent) => void;
  onError?: (event: ChatbotErrorEvent) => void;
}

export interface UseAgenticChatWebSocketReturn {
  reasoningSteps: ReasoningStep[];
  isProcessing: boolean;
  isConnected: boolean;
  error: string | null;
  answer: string | null;
  toolsUsed: string[];
  iterations: number;
  reset: () => void;
}

export function useAgenticChatWebSocket(
  sessionId: string | null,
  callbacks?: Partial<AgenticChatCallbacks>
): UseAgenticChatWebSocketReturn {
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [iterations, setIterations] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  // Store state in refs to avoid closure issues (CRITICAL PATTERN)
  const stepsRef = useRef<ReasoningStep[]>([]);

  useEffect(() => {
    stepsRef.current = reasoningSteps;
  }, [reasoningSteps]);

  const reset = useCallback(() => {
    setReasoningSteps([]);
    setIsProcessing(false);
    setError(null);
    setAnswer(null);
    setToolsUsed([]);
    setIterations(0);
    stepsRef.current = [];
  }, []);

  useEffect(() => {
    if (!sessionId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Skip WebSocket connection only in serverless mode or when backend is
    // EXPLICITLY known to be down. We do NOT skip when isAvailable() is still
    // null (initial check in flight) - the chatbot already received a sessionId
    // from a successful POST, so the backend is reachable; trying to connect
    // the WebSocket is the right call. The previous strict check
    // (!isAvailable()) caused the WS to skip on null state, leaving the user
    // with a sessionId but no streaming response - hanging forever.
    if (backendStatus.isServerless || backendStatus.isGivenUp()) {
      log('Backend serverless or given-up, skipping WebSocket connection');
      setIsConnected(false);
      setIsProcessing(false);
      return;
    }

    // Reset state for new session
    reset();
    setIsProcessing(true);

    const socketUrl = `${getWebSocketUrl()}/chatbot`;
    log('Connecting to:', socketUrl);

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 30000,
      forceNew: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      log('Connected');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      log('Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      logError('Connection error:', err);
      setError(`Erreur de connexion WebSocket: ${err.message}`);
      setIsConnected(false);
    });

    // Thinking event
    socket.on(`chatbot:thinking:${sessionId}`, (data: ChatbotThinkingEvent) => {
      log('Thinking:', data);
      const step: ReasoningStep = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'thinking',
        timestamp: data.timestamp,
        thought: data.thought,
      };
      setReasoningSteps(prev => [...prev, step]);
      callbacks?.onThinking?.(data);
    });

    // Tool call event
    socket.on(`chatbot:tool_call:${sessionId}`, (data: ChatbotToolCallEvent) => {
      log('Tool call:', data);
      const step: ReasoningStep = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'tool_call',
        timestamp: data.timestamp,
        toolName: data.toolName,
        toolCallId: data.toolCallId,
        parameters: data.parameters,
      };
      setReasoningSteps(prev => [...prev, step]);
      callbacks?.onToolCall?.(data);
    });

    // Tool result event
    socket.on(`chatbot:tool_result:${sessionId}`, (data: ChatbotToolResultEvent) => {
      log('Tool result:', data);
      const step: ReasoningStep = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'tool_result',
        timestamp: data.timestamp,
        toolName: data.toolName,
        toolCallId: data.toolCallId,
        result: data.result,
      };
      setReasoningSteps(prev => [...prev, step]);
      callbacks?.onToolResult?.(data);
    });

    // Complete event
    socket.on(`chatbot:complete:${sessionId}`, (data: ChatbotCompleteEvent) => {
      log('Complete:', data);
      setAnswer(data.answer);
      setToolsUsed(data.toolsUsed);
      setIterations(data.iterations);
      setIsProcessing(false);
      callbacks?.onComplete?.(data);
    });

    // Error event
    socket.on(`chatbot:error:${sessionId}`, (data: ChatbotErrorEvent) => {
      logError('Error:', data);
      setError(data.error);
      setIsProcessing(false);
      const step: ReasoningStep = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'error',
        timestamp: data.timestamp,
        error: data.error,
      };
      setReasoningSteps(prev => [...prev, step]);
      callbacks?.onError?.(data);
    });

    return () => {
      log('Cleaning up connection');
      socket.disconnect();
      socketRef.current = null;
    };
    // CRITICAL: Only sessionId in dependency array to avoid infinite reconnection
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return {
    reasoningSteps,
    isProcessing,
    isConnected,
    error,
    answer,
    toolsUsed,
    iterations,
    reset,
  };
}
