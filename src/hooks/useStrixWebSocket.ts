import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const DEBUG = import.meta.env.DEV;
const log = (...args: unknown[]) => { if (DEBUG) console.log('[Strix WS]', ...args); };
const logError = (...args: unknown[]) => { if (DEBUG) console.error('[Strix WS]', ...args); };

import type {
  AgentExecution,
  Finding,
  LogEntry,
  StrixEventCallbacks,
  TimelineEvent,
  ExecutionStats,
  ProgressEvent,
  ToolExecutionEvent,
  AgentCreatedEvent,
} from '../types/strix';

// WebSocket URL - use the API URL without the /api/v1 prefix
const getWebSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1';
  // Remove /api/v1 if present, keep the base URL
  const baseUrl = apiUrl.replace('/api/v1', '').replace(/\/$/, '');
  return baseUrl;
};

const WEBSOCKET_URL = getWebSocketUrl();

interface UseStrixWebSocketReturn {
  execution: AgentExecution | null;
  findings: Finding[];
  logs: LogEntry[];
  timeline: TimelineEvent[];
  stats: ExecutionStats | null;
  isConnected: boolean;
  error: string | null;
}

export function useStrixWebSocket(
  executionId: string | null,
  callbacks?: Partial<StrixEventCallbacks>
): UseStrixWebSocketReturn {
  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [stats, setStats] = useState<ExecutionStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  // Store current state in refs to avoid dependency issues
  const findingsRef = useRef<Finding[]>([]);
  const logsRef = useRef<LogEntry[]>([]);
  const executionRef = useRef<AgentExecution | null>(null);

  // Sync refs with state
  useEffect(() => {
    findingsRef.current = findings;
    logsRef.current = logs;
    executionRef.current = execution;
  }, [findings, logs, execution]);

  // Calculer les stats à partir des findings et logs
  const updateStats = useCallback((currentFindings: Finding[], currentLogs: LogEntry[], exec: AgentExecution | null) => {
    const newStats: ExecutionStats = {
      totalFindings: currentFindings.length,
      criticalFindings: currentFindings.filter(f => f.severity === 'critical').length,
      highFindings: currentFindings.filter(f => f.severity === 'high').length,
      moderateFindings: currentFindings.filter(f => f.severity === 'moderate').length,
      lowFindings: currentFindings.filter(f => f.severity === 'low').length,
      infoFindings: currentFindings.filter(f => f.severity === 'info').length,

      totalLogs: currentLogs.length,
      errorLogs: currentLogs.filter(l => l.level === 'error').length,
      warningLogs: currentLogs.filter(l => l.level === 'warning').length,

      toolsUsed: exec?.toolsUsed?.length || 0,
      agentsCreated: exec?.agentsCreated || 0,

      duration: exec?.duration || 0,
    };

    setStats(newStats);
  }, []);

  // Ajouter un événement à la timeline
  const addTimelineEvent = useCallback((event: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `${Date.now()}-${Math.random()}`,
    };
    setTimeline(prev => [...prev, newEvent]);
  }, []);

  useEffect(() => {
    if (!executionId) {
      // Cleanup si pas d'executionId
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Récupérer l'état initial de l'exécution via API REST
    const fetchInitialState = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1';
        const response = await fetch(`${apiUrl}/strix/execution/${executionId}`);
        if (response.ok) {
          const data = await response.json();
          log('Initial state fetched:', data);

          // Initialiser l'état avec les données de l'API
          setExecution({
            id: data.id,
            status: data.status,
            currentStep: data.currentStep,
            totalSteps: data.totalSteps,
            startTime: data.startTime,
            duration: data.duration,
            findings: data.findings || [],
            logs: data.logs || [],
            progress: data.currentStep && data.totalSteps ? (data.currentStep / data.totalSteps) * 100 : 0,
          });

          setFindings(data.findings || []);
          setLogs(data.logs || []);

          updateStats(data.findings || [], data.logs || [], data);
        }
      } catch (err) {
        logError('Failed to fetch initial state:', err);
      }
    };

    fetchInitialState();

    // Connexion WebSocket
    // Socket.IO client: to connect to namespace 'strix', use the format:
    // io('http://localhost:3003/strix') or io(WEBSOCKET_URL + '/strix')
    // Socket.IO automatically adds /socket.io/ and handles the namespace
    const socketUrl = `${WEBSOCKET_URL}/strix`;
    log('Connecting to:', socketUrl);
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
    });

    socketRef.current = socket;

    // Événements de connexion
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
      logError('Error details:', {
        message: err.message,
        type: err.type,
        description: err.description,
        context: err.context,
        transport: socket.io.engine?.transport?.name,
      });
      setError(`Erreur de connexion WebSocket: ${err.message}`);
      setIsConnected(false);
      
      // Retry connection after delay if it's a network error
      if (err.type === 'TransportError' || err.message.includes('timeout')) {
        log('Will retry connection...');
      }
    });

    // Événement: Exécution démarrée
    socket.on(`strix:started:${executionId}`, (data: { executionId: string; timestamp: string; message: string }) => {
      log('Started:', data);

      setExecution({
        id: data.executionId,
        status: 'running',
        currentStep: 0,
        totalSteps: 0,
        startTime: data.timestamp,
        duration: 0,
        findings: [],
        logs: [],
        progress: 0,
      });

      addTimelineEvent({
        timestamp: data.timestamp,
        type: 'start',
        title: 'Exécution démarrée',
        description: data.message,
        icon: '🚀',
      });

      callbacks?.onStarted?.(data);
    });

    // Événement: Progression
    socket.on(`strix:progress:${executionId}`, (data: ProgressEvent) => {
      log('Progress:', data);

      setExecution(prev => prev ? {
        ...prev,
        currentStep: data.currentStep,
        totalSteps: data.totalSteps,
        progress: data.progress,
      } : null);

      addTimelineEvent({
        timestamp: new Date().toISOString(),
        type: 'progress',
        title: `Étape ${data.currentStep}/${data.totalSteps}`,
        description: data.message,
        icon: '⚡',
      });

      callbacks?.onProgress?.(data);
    });

    // Événement: Log
    socket.on(`strix:log:${executionId}`, (data: { log: LogEntry; timestamp: string }) => {
      const logEntry: LogEntry = {
        ...data.log,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: data.timestamp,
      };

      setLogs(prev => {
        const updated = [...prev, logEntry];
        // Use refs to avoid closure issues
        updateStats(findingsRef.current, updated, executionRef.current);
        return updated;
      });

      callbacks?.onLog?.(logEntry);
    });

    // Événement: Découverte (Finding)
    socket.on(`strix:finding:${executionId}`, (data: { finding: Finding }) => {
      log('Finding:', data);

      const finding: Finding = {
        ...data.finding,
        id: `${Date.now()}-${Math.random()}`,
      };

      setFindings(prev => {
        const updated = [...prev, finding];
        // Use refs to avoid closure issues
        updateStats(updated, logsRef.current, executionRef.current);
        return updated;
      });

      addTimelineEvent({
        timestamp: finding.timestamp,
        type: 'finding',
        title: finding.title,
        description: finding.description,
        severity: finding.severity,
        icon: finding.type === 'vulnerability' ? '🔴' : finding.type === 'warning' ? '⚠️' : '✅',
      });

      callbacks?.onFinding?.(finding);
    });

    // Événement: Pause
    socket.on(`strix:paused:${executionId}`, (data: { timestamp: string; message: string }) => {
      log('Paused:', data);

      setExecution(prev => prev ? { ...prev, status: 'paused' } : null);

      addTimelineEvent({
        timestamp: data.timestamp,
        type: 'pause',
        title: 'Exécution mise en pause',
        description: data.message,
        icon: '⏸️',
      });

      callbacks?.onPaused?.(data);
    });

    // Événement: Reprise
    socket.on(`strix:resumed:${executionId}`, (data: { timestamp: string; message: string }) => {
      log('Resumed:', data);

      setExecution(prev => prev ? { ...prev, status: 'running' } : null);

      addTimelineEvent({
        timestamp: data.timestamp,
        type: 'resume',
        title: 'Exécution reprise',
        description: data.message,
        icon: '▶️',
      });

      callbacks?.onResumed?.(data);
    });

    // Événement: Arrêt
    socket.on(`strix:stopped:${executionId}`, (data: { timestamp: string; message: string }) => {
      log('Stopped:', data);

      setExecution(prev => prev ? { ...prev, status: 'completed', endTime: data.timestamp } : null);

      addTimelineEvent({
        timestamp: data.timestamp,
        type: 'stop',
        title: 'Exécution arrêtée',
        description: data.message,
        icon: '⏹️',
      });

      callbacks?.onStopped?.(data);
    });

    // Événement: Terminé
    socket.on(`strix:completed:${executionId}`, (data: { execution: AgentExecution; findings: Finding[] }) => {
      log('Completed:', data);

      setExecution({
        ...data.execution,
        status: 'completed',
        endTime: new Date().toISOString(),
      });
      setFindings(data.findings || []);

      addTimelineEvent({
        timestamp: new Date().toISOString(),
        type: 'complete',
        title: 'Exécution terminée',
        description: `${data.findings?.length || 0} découverte(s) au total`,
        icon: '🏁',
      });

      // Use refs to avoid closure issues
      updateStats(data.findings || [], logsRef.current, data.execution);

      callbacks?.onCompleted?.(data);
    });

    // Événement: Échec
    socket.on(`strix:failed:${executionId}`, (data: { error: string; timestamp: string }) => {
      logError('Failed:', data);

      setExecution(prev => prev ? { ...prev, status: 'failed', endTime: data.timestamp } : null);
      setError(data.error);

      addTimelineEvent({
        timestamp: data.timestamp,
        type: 'error',
        title: 'Exécution échouée',
        description: data.error,
        severity: 'critical',
        icon: '❌',
      });

      callbacks?.onFailed?.(data);
    });

    // Événement: Exécution d'outil
    socket.on(`strix:tool:${executionId}`, (data: ToolExecutionEvent) => {
      log('Tool execution:', data);

      if (data.action === 'start') {
        addTimelineEvent({
          timestamp: new Date().toISOString(),
          type: 'tool',
          title: `Outil: ${data.toolName}`,
          description: 'Exécution démarrée',
          icon: '🔧',
        });
      } else if (data.action === 'end') {
        addTimelineEvent({
          timestamp: new Date().toISOString(),
          type: 'tool',
          title: `Outil: ${data.toolName}`,
          description: `Terminé (${data.duration}ms) - ${data.result}`,
          icon: data.result === 'success' ? '✅' : '❌',
        });

        // Ajouter l'outil à la liste des outils utilisés
        setExecution(prev => {
          if (!prev) return null;
          const tools = prev.toolsUsed || [];
          if (!tools.includes(data.toolName)) {
            return { ...prev, toolsUsed: [...tools, data.toolName] };
          }
          return prev;
        });
      }

      callbacks?.onToolExecution?.(data);
    });

    // Événement: Création d'agent
    socket.on(`strix:agent:${executionId}`, (data: AgentCreatedEvent) => {
      log('Agent created:', data);

      addTimelineEvent({
        timestamp: new Date().toISOString(),
        type: 'agent',
        title: `Agent créé: ${data.agentType}`,
        description: data.purpose,
        icon: '🤖',
      });

      setExecution(prev => prev ? {
        ...prev,
        agentsCreated: (prev.agentsCreated || 0) + 1,
      } : null);

      callbacks?.onAgentCreated?.(data);
    });

    // Cleanup
    return () => {
      log('Cleaning up connection');
      socket.disconnect();
      socketRef.current = null;
    };
    // IMPORTANT: Only depend on executionId to avoid infinite reconnection loops
    // addTimelineEvent, updateStats are wrapped in useCallback and won't cause re-renders
    // findings, logs, execution should NOT be dependencies as they are updated by the socket events
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionId, addTimelineEvent, updateStats]);

  return {
    execution,
    findings,
    logs,
    timeline,
    stats,
    isConnected,
    error,
  };
}
