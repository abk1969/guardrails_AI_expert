import React, { useState, useEffect, useRef } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { Play, Pause, Square, Terminal, AlertCircle, CheckCircle2, Loader, Download, Copy, ExternalLink, Server, Command } from 'lucide-react';
import { useNavigation } from '../contexts/NavigationContext';
import { io, Socket } from 'socket.io-client';

type ExecutionMode = 'auto' | 'manual' | 'checking';
type TestStatus = 'idle' | 'running' | 'completed' | 'failed';

/**
 * Composant pour lancer et suivre l'exécution des tests Promptfoo
 *
 * MODE HYBRIDE:
 * 1. Essaie d'appeler le backend (mode auto)
 * 2. Si backend indisponible, affiche instructions CLI (mode manuel)
 */
const PromptfooTestExecution: React.FC = () => {
  const { setActiveNav } = useNavigation();
  const [mode, setMode] = useState<ExecutionMode>('manual'); // Démarrer en mode manuel par défaut
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [testsCompleted, setTestsCompleted] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [elapsedTime, setElapsedTime] = useState('0:00');
  const [logs, setLogs] = useState<string[]>([]);
  const [yamlContent, setYamlContent] = useState('');
  const [currentTestRunId, setCurrentTestRunId] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  // Charger le YAML au démarrage, sans vérifier le backend automatiquement
  useEffect(() => {
    loadYamlFromStorage();
    addLog('ℹ️ Mode manuel activé par défaut');
    addLog('📋 Suivez les instructions ci-dessous pour lancer Promptfoo en ligne de commande');
    addLog('💡 Astuce: Cliquez sur "Activer Mode Automatique" si vous avez démarré le backend');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Nettoyer la connexion WebSocket au démontage
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        addLog('🔌 Connexion WebSocket fermée');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkBackendAvailability = async () => {
    addLog('🔍 Vérification de la disponibilité du backend...');
    setMode('checking');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 secondes max

    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);

      if (response.ok && response.status === 200) {
        // Backend disponible
        setMode('auto');
        addLog('✅ Backend disponible - Mode automatique activé');
        addLog('💡 Vous pouvez maintenant lancer les tests via le backend');
      } else {
        throw new Error(`Backend retourné status ${response.status}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Backend non disponible - rester en mode manuel
      setMode('manual');
      addLog('❌ Backend non disponible (normal si non démarré)');
      addLog('ℹ️ Restez en mode manuel pour utiliser Promptfoo en CLI');

      if (error instanceof Error && error.name !== 'AbortError') {
        addLog(`💡 Détails: ${error.message}`);
      }
    }
  };

  const loadYamlFromStorage = () => {
    const stored = localStorage.getItem('promptfoo-yaml');
    if (stored) {
      setYamlContent(stored);
      addLog('✅ Configuration YAML chargée depuis l\'étape précédente');
    } else {
      addLog('⚠️ Aucune configuration YAML trouvée. Retournez à l\'étape 2.');
    }
  };

  /**
   * Établit la connexion WebSocket et écoute les événements
   */
  const setupWebSocket = (testRunId: string) => {
    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

    addLog('🔌 Connexion au WebSocket...');

    // Créer la connexion WebSocket
    const socket = io(`${WS_URL}/promptfoo`, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Événement: connexion établie
    socket.on('connect', () => {
      addLog('✅ WebSocket connecté');
      // S'abonner au test run spécifique
      socket.emit('subscribe-test', { testRunId });
      addLog(`📡 Abonné aux mises à jour du test ${testRunId}`);
    });

    // Événement: test démarré
    socket.on('test-started', (data) => {
      addLog(`🚀 Test démarré: ${data.testRunId}`);
    });

    // Événement: progression
    socket.on('test-progress', (data) => {
      setProgress(data.progress);
      setProgressMessage(data.message);
      addLog(`⏳ ${data.progress}% - ${data.message}`);
    });

    // Événement: nouveau log
    socket.on('test-log', (data) => {
      addLog(data.log);
    });

    // Événement: test terminé
    socket.on('test-completed', (data) => {
      setTestStatus('completed');
      setProgress(100);
      addLog('✅ Tests terminés avec succès!');
      addLog('📊 Résultats disponibles dans l\'étape "Résultats"');

      // Sauvegarder le testRunId pour la page de résultats
      if (currentTestRunId) {
        localStorage.setItem('promptfoo_last_test_run_id', currentTestRunId);
        addLog(`💾 Test Run ID sauvegardé: ${currentTestRunId}`);
      }

      // Déconnecter le WebSocket
      setTimeout(() => {
        socket.disconnect();
        addLog('🔌 Connexion WebSocket fermée');
      }, 2000);
    });

    // Événement: test échoué
    socket.on('test-failed', (data) => {
      setTestStatus('failed');
      addLog(`❌ Échec du test: ${data.error}`);
      socket.disconnect();
    });

    // Événement: erreur de connexion
    socket.on('connect_error', (error) => {
      addLog(`❌ Erreur WebSocket: ${error.message}`);
    });

    // Événement: déconnexion
    socket.on('disconnect', () => {
      addLog('🔌 WebSocket déconnecté');
    });
  };

  // Mode Auto: Appeler le backend
  const handleStartTestAuto = async () => {
    setTestStatus('running');
    setProgress(0);
    addLog('🚀 Lancement des tests via le backend...');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
      const response = await fetch(`${API_URL}/promptfoo/run`, {
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
        addLog(`✅ Tests lancés avec succès (ID: ${result.testRunId})`);
        addLog(`⏳ Durée estimée: ${result.estimatedDuration}`);

        setCurrentTestRunId(result.testRunId);

        // Établir la connexion WebSocket pour mises à jour temps réel
        setupWebSocket(result.testRunId);
      } else {
        throw new Error('Réponse invalide du serveur');
      }

    } catch (error) {
      setTestStatus('failed');
      addLog(`❌ Erreur: ${error instanceof Error ? error.message : 'Échec de l\'exécution'}`);
      addLog('💡 Utilisez le mode manuel ci-dessous pour lancer Promptfoo en CLI');
    }
  };

  const handleStopTest = () => {
    setTestStatus('idle');
    setProgress(0);
    setProgressMessage('');
    addLog('⏹️ Tests arrêtés par l\'utilisateur');

    // Déconnecter le WebSocket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const handleDownloadYaml = () => {
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptfoo-config-${Date.now()}.yaml`;
    link.click();
    URL.revokeObjectURL(url);
    addLog('📥 Fichier YAML téléchargé');
  };

  const handleCopyCommand = (command: string) => {
    navigator.clipboard.writeText(command);
    addLog('📋 Commande copiée dans le presse-papiers');
  };

  // Chemin relatif pour tous les utilisateurs
  const promptfooPath = './guardrail/solution_promptfoo/ai-risk-guardrails-tests';

  return (
    <div className="space-y-6">
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
                {mode === 'checking' && 'Vérification du Backend...'}
                {mode === 'auto' && testStatus === 'idle' && 'Mode Automatique - Prêt à Lancer'}
                {mode === 'auto' && testStatus === 'running' && 'Exécution Automatique en Cours...'}
                {mode === 'auto' && testStatus === 'completed' && 'Tests Terminés!'}
                {mode === 'auto' && testStatus === 'failed' && 'Échec de l\'Exécution'}
                {mode === 'manual' && 'Mode Manuel - Instructions CLI'}
              </h2>
              <p className="text-gray-300">
                {mode === 'checking' && 'Détection de la disponibilité du backend...'}
                {mode === 'auto' && testStatus === 'idle' && 'Le backend est prêt. Cliquez sur "Lancer les Tests" pour démarrer.'}
                {mode === 'auto' && testStatus === 'running' && 'Les tests sont exécutés par le backend. Durée: 5-30 minutes.'}
                {mode === 'auto' && testStatus === 'completed' && 'Tous les tests ont été exécutés avec succès.'}
                {mode === 'auto' && testStatus === 'failed' && 'Une erreur s\'est produite. Essayez le mode manuel ci-dessous.'}
                {mode === 'manual' && 'Le backend n\'est pas disponible. Suivez les instructions pour lancer Promptfoo manuellement.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Mode Auto: Barre de progression */}
      {mode === 'auto' && testStatus === 'running' && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Progression</h3>
          <div className="relative w-full h-8 bg-gray-700 rounded-lg overflow-hidden mb-4">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-500 flex items-center justify-center"
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <span className="text-sm font-bold text-white">{progress}%</span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-cyan-400 flex items-center gap-2">
              <Loader size={16} className="animate-spin" />
              {progressMessage || 'Exécution en cours...'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-700/50 p-3 rounded">
              <p className="text-sm text-gray-400">Progression</p>
              <p className="text-2xl font-bold text-cyan-400">{progress}%</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded">
              <p className="text-sm text-gray-400">Test Run ID</p>
              <p className="text-sm font-mono text-white truncate">{currentTestRunId || '-'}</p>
            </div>
            <div className="bg-gray-700/50 p-3 rounded">
              <p className="text-sm text-gray-400">Statut</p>
              <p className="text-sm font-bold text-white">En cours...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Mode Manual: Instructions CLI */}
      {mode === 'manual' && (
        <Card className="bg-blue-900/20 border-blue-500/30">
          <h3 className="text-lg font-bold text-white mb-4">📋 Instructions pour Exécution Manuelle</h3>

          <div className="space-y-4">
            {/* Étape 1: Télécharger YAML */}
            <div className="bg-gray-700/50 p-4 rounded">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-white">1. Télécharger la Configuration YAML</h4>
                <Button variant="secondary" className="text-sm" onClick={handleDownloadYaml}>
                  <Download size={16} className="mr-2" />
                  Télécharger YAML
                </Button>
              </div>
              <p className="text-sm text-gray-300">
                Téléchargez le fichier <code className="bg-gray-800 px-2 py-1 rounded">promptfooconfig.yaml</code> et placez-le dans le dossier Promptfoo.
              </p>
            </div>

            {/* Étape 2: Ouvrir terminal */}
            <div className="bg-gray-700/50 p-4 rounded">
              <h4 className="font-bold text-white mb-2">2. Ouvrir un Terminal</h4>
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

            {/* Étape 3: Lancer les tests */}
            <div className="bg-gray-700/50 p-4 rounded">
              <h4 className="font-bold text-white mb-2">3. Lancer les Tests</h4>
              <p className="text-sm text-gray-300 mb-3">
                Exécutez l'une des commandes suivantes:
              </p>
              <div className="space-y-2">
                <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-200 flex items-center justify-between">
                  <span>npm run test:quick</span>
                  <Button variant="secondary" className="text-xs" onClick={() => handleCopyCommand('npm run test:quick')}>
                    <Copy size={14} className="mr-1" />
                    Copier
                  </Button>
                </div>
                <p className="text-xs text-gray-400 ml-3">💡 Test rapide (5 minutes, 15 tests)</p>

                <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-200 flex items-center justify-between">
                  <span>npm run test</span>
                  <Button variant="secondary" className="text-xs" onClick={() => handleCopyCommand('npm run test')}>
                    <Copy size={14} className="mr-1" />
                    Copier
                  </Button>
                </div>
                <p className="text-xs text-gray-400 ml-3">⏱️ Test complet (30-60 minutes)</p>
              </div>
            </div>

            {/* Étape 4: Voir les résultats */}
            <div className="bg-gray-700/50 p-4 rounded">
              <h4 className="font-bold text-white mb-2">4. Visualiser les Résultats</h4>
              <p className="text-sm text-gray-300 mb-3">
                Une fois les tests terminés, lancez l'interface web Promptfoo:
              </p>
              <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-200 flex items-center justify-between mb-2">
                <span>npm run view</span>
                <Button variant="secondary" className="text-xs" onClick={() => handleCopyCommand('npm run view')}>
                  <Copy size={14} className="mr-1" />
                  Copier
                </Button>
              </div>
              <p className="text-xs text-gray-400 ml-3">
                📊 Ouvre l'interface web sur <code>http://localhost:15500</code>
              </p>
              <Button variant="secondary" className="mt-3 text-sm" onClick={() => window.open('http://localhost:15500', '_blank')}>
                <ExternalLink size={16} className="mr-2" />
                Ouvrir Interface Promptfoo
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Contrôles */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Contrôles d'Exécution</h3>
            <p className="text-sm text-gray-400 mt-1">
              {mode === 'auto' && 'Gérez l\'exécution automatique via le backend'}
              {mode === 'manual' && 'Suivez les instructions CLI ci-dessus'}
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
              <Button onClick={handleStopTest} variant="secondary" className="border-red-500 text-red-400 hover:bg-red-500/10">
                <Square size={16} className="mr-2" />
                Arrêter
              </Button>
            )}
            {mode === 'auto' && testStatus === 'completed' && (
              <Button onClick={() => setActiveNav('test-results')} className="px-6">
                Voir les Résultats
              </Button>
            )}
            {mode === 'manual' && (
              <Button variant="secondary" onClick={checkBackendAvailability}>
                <Server size={16} className="mr-2" />
                Activer Mode Automatique
              </Button>
            )}
            {mode === 'checking' && (
              <Button variant="secondary" disabled>
                <Loader size={16} className="mr-2 animate-spin" />
                Vérification...
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Console de logs */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Terminal size={20} className="text-cyan-400" />
          <h3 className="text-lg font-bold text-white">Console</h3>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="text-gray-300 mb-1">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))}
          {mode === 'auto' && testStatus === 'running' && (
            <div className="text-cyan-400 animate-pulse">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> ▓ En cours d'exécution...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PromptfooTestExecution;
