import React, { useState, useEffect, useRef } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import {
  Play,
  Square,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Loader,
  Download,
  Copy,
  ExternalLink,
  Server,
  Command,
  XCircle,
  ArrowRight,
  WifiOff,
  RefreshCw,
  Info,
  Clock
} from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { io, Socket } from 'socket.io-client';
import { backendStatus } from '../services/backendStatus';

type ExecutionMode = 'auto' | 'manual' | 'checking';
type TestStatus = 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';

/** Steps displayed during auto execution */
const EXECUTION_STEPS = [
  { id: 'connect', label: 'Connexion au backend', description: 'Etablissement de la connexion WebSocket' },
  { id: 'validate', label: 'Validation de la configuration', description: 'Verification du YAML et des parametres' },
  { id: 'init', label: 'Initialisation des tests', description: 'Preparation de l\'environnement de test' },
  { id: 'execute', label: 'Execution des tests', description: 'Lancement des scenarios de securite' },
  { id: 'analyze', label: 'Analyse des resultats', description: 'Traitement et scoring des reponses' },
  { id: 'finalize', label: 'Finalisation', description: 'Sauvegarde des resultats et nettoyage' },
];

/** Actionable error suggestions in French */
const ERROR_SUGGESTIONS: Record<string, { message: string; actions: string[] }> = {
  'ECONNREFUSED': {
    message: 'Le backend n\'est pas demarre ou n\'est pas accessible.',
    actions: [
      'Verifiez que Docker est en cours d\'execution',
      'Lancez "docker-compose up -d" dans le terminal',
      'Verifiez que le port 3003 n\'est pas utilise par un autre service',
    ],
  },
  'TIMEOUT': {
    message: 'Le backend ne repond pas dans le delai imparti.',
    actions: [
      'Verifiez la connexion reseau',
      'Le backend est peut-etre surcharge, attendez quelques minutes',
      'Consultez les logs avec "docker-compose logs -f api-gateway"',
    ],
  },
  'UNAUTHORIZED': {
    message: 'L\'authentification a echoue.',
    actions: [
      'Verifiez votre cle API dans la Configuration LLM',
      'Reconnectez-vous a l\'application',
    ],
  },
  'DEFAULT': {
    message: 'Une erreur inattendue s\'est produite.',
    actions: [
      'Verifiez les logs du backend: "docker-compose logs -f api-gateway"',
      'Essayez le mode manuel avec les instructions CLI ci-dessous',
      'Redemarrez les services: "docker-compose restart"',
    ],
  },
};

function getErrorSuggestion(error: string): { message: string; actions: string[] } {
  if (error.includes('ECONNREFUSED') || error.includes('fetch failed') || error.includes('NetworkError')) {
    return ERROR_SUGGESTIONS['ECONNREFUSED'];
  }
  if (error.includes('timeout') || error.includes('Timeout') || error.includes('AbortError')) {
    return ERROR_SUGGESTIONS['TIMEOUT'];
  }
  if (error.includes('401') || error.includes('Unauthorized') || error.includes('403')) {
    return ERROR_SUGGESTIONS['UNAUTHORIZED'];
  }
  return ERROR_SUGGESTIONS['DEFAULT'];
}

/**
 * Composant pour lancer et suivre l'execution des tests Promptfoo
 *
 * MODE HYBRIDE:
 * 1. Essaie d'appeler le backend (mode auto)
 * 2. Si backend indisponible, affiche instructions CLI (mode manuel)
 */
const PromptfooTestExecution: React.FC = () => {
  const { setActiveNav } = useNavigation();
  const [mode, setMode] = useState<ExecutionMode>('manual');
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [yamlContent, setYamlContent] = useState('');
  const [currentTestRunId, setCurrentTestRunId] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedDisplay, setElapsedDisplay] = useState('0:00');
  const [backendAvailable, setBackendAvailable] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Elapsed time counter
  useEffect(() => {
    if (testStatus !== 'running' || !startTime) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      setElapsedDisplay(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [testStatus, startTime]);

  // Load YAML and check backend on mount
  useEffect(() => {
    loadYamlFromStorage();
    backendStatus.check().then((available) => {
      setBackendAvailable(available);
      if (available) {
        setMode('auto');
        addLog('Backend disponible - Mode automatique active');
      } else {
        addLog('Mode manuel active par defaut (backend non disponible)');
        addLog('Suivez les instructions ci-dessous pour lancer Promptfoo en ligne de commande');
        addLog('Cliquez sur "Activer Mode Auto" si vous avez demarre le backend');
      }
    });
    const unsub = backendStatus.onChange((available) => setBackendAvailable(available));
    return () => { unsub(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const checkBackendAvailability = async () => {
    addLog('Verification de la disponibilite du backend...');
    setMode('checking');

    try {
      const available = await backendStatus.forceCheck();
      setBackendAvailable(available);

      if (available) {
        setMode('auto');
        addLog('Backend disponible - Mode automatique active');
      } else {
        setMode('manual');
        addLog('Backend non disponible (normal si non demarre)');
        addLog('Restez en mode manuel pour utiliser Promptfoo en CLI');
      }
    } catch {
      setMode('manual');
      setBackendAvailable(false);
      addLog('Backend non disponible (normal si non demarre)');
      addLog('Restez en mode manuel pour utiliser Promptfoo en CLI');
    }
  };

  const loadYamlFromStorage = () => {
    const stored = localStorage.getItem('promptfoo-yaml');
    if (stored) {
      setYamlContent(stored);
      addLog('Configuration YAML chargee depuis l\'etape precedente');
    } else {
      addLog('Aucune configuration YAML trouvee. Retournez a l\'etape 2.');
    }
  };

  const setupWebSocket = (testRunId: string) => {
    if (!backendAvailable) {
      addLog('WebSocket non disponible - backend hors ligne');
      return;
    }

    // Derive WS base URL from the API URL (strip /api/v1 suffix)
    const WS_URL = backendStatus.apiUrl.replace(/\/api\/v1\/?$/, '');

    addLog('Connexion au WebSocket...');
    setCurrentStepIndex(0);

    const socket = io(`${WS_URL}/promptfoo`, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      addLog('WebSocket connecte');
      socket.emit('subscribe-test', { testRunId });
      addLog(`Abonne aux mises a jour du test ${testRunId}`);
      setCurrentStepIndex(1);
    });

    socket.on('test-started', (data) => {
      addLog(`Test demarre: ${data.testRunId}`);
      setCurrentStepIndex(2);
    });

    socket.on('test-progress', (data) => {
      setProgress(data.progress);
      setProgressMessage(data.message);
      addLog(`${data.progress}% - ${data.message}`);
      // Advance step based on progress
      if (data.progress < 20) setCurrentStepIndex(2);
      else if (data.progress < 80) setCurrentStepIndex(3);
      else if (data.progress < 95) setCurrentStepIndex(4);
      else setCurrentStepIndex(5);
    });

    socket.on('test-log', (data) => {
      addLog(data.log);
    });

    socket.on('test-completed', () => {
      setTestStatus('completed');
      setProgress(100);
      setCurrentStepIndex(5);
      addLog('Tests termines avec succes!');
      addLog('Resultats disponibles dans l\'etape "Resultats"');

      if (currentTestRunId) {
        localStorage.setItem('promptfoo_last_test_run_id', currentTestRunId);
        addLog(`Test Run ID sauvegarde: ${currentTestRunId}`);
      }

      setTimeout(() => {
        socket.disconnect();
      }, 2000);
    });

    socket.on('test-failed', (data) => {
      setTestStatus('failed');
      setErrorDetails(data.error);
      addLog(`Echec du test: ${data.error}`);
      socket.disconnect();
    });

    socket.on('connect_error', (error) => {
      addLog(`Erreur WebSocket: ${error.message}`);
    });

    socket.on('disconnect', () => {
      addLog('WebSocket deconnecte');
    });
  };

  const handleStartTestAuto = async () => {
    setTestStatus('running');
    setProgress(0);
    setCurrentStepIndex(0);
    setErrorDetails(null);
    setStartTime(Date.now());
    addLog('Lancement des tests via le backend...');

    try {
      const response = await fetch(`${backendStatus.apiUrl}/promptfoo/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml: yamlContent }),
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.testRunId) {
        addLog(`Tests lances avec succes (ID: ${result.testRunId})`);
        addLog(`Duree estimee: ${result.estimatedDuration}`);

        setCurrentTestRunId(result.testRunId);
        setupWebSocket(result.testRunId);
      } else {
        throw new Error('Reponse invalide du serveur');
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Echec de l\'execution';
      setTestStatus('failed');
      setErrorDetails(errorMsg);
      addLog(`Erreur: ${errorMsg}`);
      addLog('Utilisez le mode manuel ci-dessous pour lancer Promptfoo en CLI');
    }
  };

  const handleStopTest = () => {
    setTestStatus('cancelled');
    setProgress(0);
    setProgressMessage('');
    setStartTime(null);
    addLog('Tests arretes par l\'utilisateur');

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Allow restart after cancellation
    setTimeout(() => setTestStatus('idle'), 1000);
  };

  const handleDownloadYaml = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptfoo-config-${Date.now()}.yaml`;
    link.click();
    URL.revokeObjectURL(url);
    addLog('Fichier YAML telecharge');
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    addLog('Commande copiee dans le presse-papiers');
  };

  const promptfooPath = './guardrail/solution_promptfoo/ai-risk-guardrails-tests';

  const errorSuggestion = errorDetails ? getErrorSuggestion(errorDetails) : null;

  return (
    <div className="space-y-6">
      {/* Offline warning banner */}
      {!backendAvailable && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30 text-yellow-300 text-sm">
          <WifiOff size={18} className="flex-shrink-0" />
          <span>Backend non disponible — mode hors-ligne actif. Les tests automatiques et les resultats en temps reel ne sont pas accessibles.</span>
          <button
            onClick={checkBackendAvailability}
            className="ml-auto flex items-center gap-1 text-yellow-400 hover:text-yellow-300 whitespace-nowrap"
          >
            <RefreshCw size={14} />
            Reessayer
          </button>
        </div>
      )}

      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-900/20 to-green-900/20 border-cyan-500/30">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              {mode === 'checking' ? (
                <Loader size={24} className="animate-spin" />
              ) : mode === 'auto' ? (
                testStatus === 'running' ? (
                  <Loader size={24} className="animate-spin" />
                ) : testStatus === 'completed' ? (
                  <CheckCircle2 size={24} className="text-green-400" />
                ) : testStatus === 'failed' ? (
                  <AlertCircle size={24} className="text-red-400" />
                ) : (
                  <Server size={24} />
                )
              ) : (
                <Command size={24} />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === 'checking' && 'Verification du Backend...'}
                {mode === 'auto' && testStatus === 'idle' && 'Mode Automatique - Pret a Lancer'}
                {mode === 'auto' && testStatus === 'running' && 'Execution en Cours...'}
                {mode === 'auto' && testStatus === 'completed' && 'Tests Termines !'}
                {mode === 'auto' && testStatus === 'failed' && 'Echec de l\'Execution'}
                {mode === 'auto' && testStatus === 'cancelled' && 'Tests Annules'}
                {mode === 'manual' && 'Mode Manuel - Instructions CLI'}
              </h2>
              <p className="text-gray-300">
                {mode === 'checking' && 'Detection de la disponibilite du backend...'}
                {mode === 'auto' && testStatus === 'idle' && 'Le backend est pret. Cliquez sur "Lancer les Tests" pour demarrer.'}
                {mode === 'auto' && testStatus === 'running' && `Execution en cours depuis ${elapsedDisplay}. Duree estimee: 5-30 minutes.`}
                {mode === 'auto' && testStatus === 'completed' && 'Tous les tests ont ete executes avec succes.'}
                {mode === 'auto' && testStatus === 'failed' && 'Une erreur s\'est produite. Consultez les details ci-dessous.'}
                {mode === 'auto' && testStatus === 'cancelled' && 'L\'execution a ete annulee.'}
                {mode === 'manual' && 'Le backend n\'est pas disponible. Suivez les instructions pour lancer Promptfoo manuellement.'}
              </p>
            </div>
          </div>

          {/* Mode switcher */}
          <div className="flex flex-col gap-2">
            {mode === 'manual' && (
              <Button variant="secondary" onClick={checkBackendAvailability} className="text-sm">
                <Server size={16} className="mr-2" />
                Activer Mode Auto
              </Button>
            )}
            {mode === 'auto' && testStatus === 'idle' && (
              <Button variant="secondary" onClick={() => setMode('manual')} className="text-sm">
                <Command size={16} className="mr-2" />
                Passer en Manuel
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Mode Auto: Progress & Steps */}
      {mode === 'auto' && testStatus === 'running' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Progression</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={14} />
                <span>{elapsedDisplay}</span>
              </div>
              <Button
                variant="danger"
                className="text-sm"
                onClick={handleStopTest}
              >
                <Square size={14} className="mr-2" />
                Arreter
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-6">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {progress > 15 && (
                <span className="text-xs font-bold text-white drop-shadow">{progress}%</span>
              )}
            </div>
          </div>

          {/* Current step message */}
          <div className="mb-6 px-1">
            <p className="text-sm text-cyan-400 flex items-center gap-2">
              <Loader size={14} className="animate-spin" />
              {progressMessage || EXECUTION_STEPS[currentStepIndex]?.description || 'Execution en cours...'}
            </p>
          </div>

          {/* Step indicators */}
          <div className="grid grid-cols-6 gap-1">
            {EXECUTION_STEPS.map((step, index) => (
              <div key={step.id} className="text-center">
                <div className={`w-full h-1.5 rounded-full mb-2 transition-colors ${
                  index < currentStepIndex
                    ? 'bg-green-500'
                    : index === currentStepIndex
                    ? 'bg-cyan-500 animate-pulse'
                    : 'bg-gray-700'
                }`} />
                <p className={`text-xs ${
                  index <= currentStepIndex ? 'text-white' : 'text-gray-600'
                }`}>
                  {step.label}
                </p>
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mt-6 text-center">
            <div className="bg-gray-700/50 p-3 rounded">
              <p className="text-sm text-gray-400">Progression</p>
              <p className="text-2xl font-bold text-cyan-400">{progress}%</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded">
              <p className="text-sm text-gray-400">Test Run ID</p>
              <p className="text-sm font-mono text-white truncate">{currentTestRunId || '-'}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded">
              <p className="text-sm text-gray-400">Temps ecoule</p>
              <p className="text-2xl font-bold text-white">{elapsedDisplay}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Error display with actionable suggestions */}
      {mode === 'auto' && testStatus === 'failed' && errorSuggestion && (
        <Card className="bg-red-900/20 border-red-500/30">
          <div className="flex items-start gap-4">
            <XCircle size={24} className="text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-400 mb-2">Erreur d'Execution</h3>
              <p className="text-sm text-red-300 mb-4">{errorSuggestion.message}</p>

              {errorDetails && (
                <div className="text-xs text-red-300/70 bg-red-950/30 p-3 rounded border border-red-500/20 mb-4 font-mono">
                  {errorDetails}
                </div>
              )}

              <h4 className="text-sm font-bold text-white mb-2">Actions recommandees :</h4>
              <ul className="space-y-2">
                {errorSuggestion.actions.map((action, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <ArrowRight size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                    {action}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 mt-4">
                <Button onClick={() => { setTestStatus('idle'); setErrorDetails(null); }}>
                  <RefreshCw size={14} className="mr-2" />
                  Reessayer
                </Button>
                <Button variant="secondary" onClick={() => { setMode('manual'); setTestStatus('idle'); setErrorDetails(null); }}>
                  <Command size={14} className="mr-2" />
                  Mode Manuel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Success display */}
      {mode === 'auto' && testStatus === 'completed' && (
        <Card className="bg-green-900/20 border-green-500/30">
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Tests Termines avec Succes</h3>
            <p className="text-gray-400 mb-1">Duree totale: {elapsedDisplay}</p>
            {currentTestRunId && (
              <p className="text-sm text-gray-500 mb-4">ID: {currentTestRunId}</p>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setActiveNav('test-results')}>
                Voir les Resultats
              </Button>
              <Button variant="secondary" onClick={() => { setTestStatus('idle'); setProgress(0); setStartTime(null); }}>
                Relancer un Test
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Mode Manual: CLI Instructions */}
      {mode === 'manual' && (
        <Card className="bg-blue-900/20 border-blue-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20">
              <WifiOff size={16} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Instructions pour Execution Manuelle</h3>
              <p className="text-xs text-gray-400">Le backend n'est pas detecte. Utilisez Promptfoo en ligne de commande.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1: Download YAML */}
            <div className="bg-gray-700/50 p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">1</span>
                  Telecharger la Configuration YAML
                </h4>
                <Button variant="secondary" className="text-sm" onClick={handleDownloadYaml}>
                  <Download size={16} className="mr-2" />
                  Telecharger YAML
                </Button>
              </div>
              <p className="text-sm text-gray-300">
                Telechargez le fichier <code className="bg-gray-800 px-2 py-1 rounded">promptfooconfig.yaml</code> et placez-le dans le dossier Promptfoo.
              </p>
            </div>

            {/* Step 2: Open terminal */}
            <div className="bg-gray-700/50 p-4 rounded">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">2</span>
                Ouvrir un Terminal
              </h4>
              <p className="text-sm text-gray-300 mb-3">
                Ouvrez un terminal (PowerShell, CMD, ou Git Bash) et naviguez vers le dossier Promptfoo:
              </p>
              <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-200 flex items-center justify-between">
                <span>cd {promptfooPath}</span>
                <Button variant="secondary" className="text-xs" onClick={() => handleCopyCommand(`cd ${promptfooPath}`)}>
                  <Copy size={14} className="mr-1" />
                  Copier
                </Button>
              </div>
            </div>

            {/* Step 3: Run tests */}
            <div className="bg-gray-700/50 p-4 rounded">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">3</span>
                Lancer les Tests
              </h4>
              <p className="text-sm text-gray-300 mb-3">
                Executez l'une des commandes suivantes:
              </p>
              <div className="space-y-2">
                <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-200 flex items-center justify-between">
                  <span>npm run test:quick</span>
                  <Button variant="secondary" className="text-xs" onClick={() => handleCopyCommand('npm run test:quick')}>
                    <Copy size={14} className="mr-1" />
                    Copier
                  </Button>
                </div>
                <p className="text-xs text-gray-400 ml-3">Test rapide (5 minutes, 15 tests)</p>

                <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-200 flex items-center justify-between">
                  <span>npm run test</span>
                  <Button variant="secondary" className="text-xs" onClick={() => handleCopyCommand('npm run test')}>
                    <Copy size={14} className="mr-1" />
                    Copier
                  </Button>
                </div>
                <p className="text-xs text-gray-400 ml-3">Test complet (30-60 minutes)</p>
              </div>
            </div>

            {/* Step 4: View results */}
            <div className="bg-gray-700/50 p-4 rounded">
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">4</span>
                Visualiser les Resultats
              </h4>
              <p className="text-sm text-gray-300 mb-3">
                Une fois les tests termines, lancez l'interface web Promptfoo:
              </p>
              <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-200 flex items-center justify-between mb-2">
                <span>npm run view</span>
                <Button variant="secondary" className="text-xs" onClick={() => handleCopyCommand('npm run view')}>
                  <Copy size={14} className="mr-1" />
                  Copier
                </Button>
              </div>
              <p className="text-xs text-gray-400 ml-3">
                Ouvre l'interface web sur <code>http://localhost:15500</code>
              </p>
              <Button variant="secondary" className="mt-3 text-sm" onClick={() => window.open('http://localhost:15500', '_blank')}>
                <ExternalLink size={16} className="mr-2" />
                Ouvrir Interface Promptfoo
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Controles d'Execution</h3>
            <p className="text-sm text-gray-400 mt-1">
              {mode === 'auto' && 'Gerez l\'execution automatique via le backend'}
              {mode === 'manual' && 'Suivez les instructions CLI ci-dessus'}
              {mode === 'checking' && 'Verification en cours...'}
            </p>
          </div>
          <div className="flex gap-2">
            {mode === 'auto' && testStatus === 'idle' && (
              <Button onClick={handleStartTestAuto} className="px-6">
                <Play size={16} className="mr-2" />
                Lancer les Tests
              </Button>
            )}
            {mode === 'auto' && testStatus === 'running' && (
              <Button onClick={handleStopTest} variant="danger">
                <Square size={16} className="mr-2" />
                Arreter
              </Button>
            )}
            {mode === 'auto' && testStatus === 'completed' && (
              <Button onClick={() => setActiveNav('test-results')} className="px-6">
                Voir les Resultats
              </Button>
            )}
            {mode === 'checking' && (
              <Button variant="secondary" disabled>
                <Loader size={16} className="mr-2 animate-spin" />
                Verification...
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Console */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal size={20} className="text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Console</h3>
          </div>
          <span className="text-xs text-gray-500">{logs.length} lignes</span>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="text-gray-300 mb-1">
              {log}
            </div>
          ))}
          {mode === 'auto' && testStatus === 'running' && (
            <div className="text-cyan-400 animate-pulse">
              En cours d'execution...
            </div>
          )}
          <div ref={logsEndRef} />
        </div>
      </Card>
    </div>
  );
};

export default PromptfooTestExecution;
