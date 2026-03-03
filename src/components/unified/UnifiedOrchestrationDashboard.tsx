import React, { useState, useEffect } from 'react';
import {
  GitMerge,
  Play,
  Square,
  RefreshCw,
  Layers,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import Card from '../ui/Card';

// Enums matching backend DTOs
enum ExecutionMode {
  PARALLEL = 'parallel',
  SEQUENTIAL = 'sequential',
  SELECTIVE = 'selective',
}

enum Framework {
  PROMPTFOO = 'promptfoo',
  GARAK = 'garak',
}

// Types matching backend DTOs
interface UnifiedExecutionConfig {
  mode: ExecutionMode;
  frameworks: Framework[];
  promptfoo?: {
    suiteName: string;
    configPath?: string;
    providers?: string[];
    testCategories?: string[];
  };
  garak?: {
    model: string;
    modelType?: string;
    probes: string[];
    generators: string[];
    detectors: string[];
  };
}

interface FrameworkExecutionStatus {
  framework: Framework;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executionId?: string;
  progress: number;
  startTime?: string;
  endTime?: string;
  error?: string;
  results?: any;
}

interface UnifiedExecution {
  id: string;
  mode: ExecutionMode;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'partial';
  frameworks: FrameworkExecutionStatus[];
  startTime: string;
  endTime?: string;
  duration: number;
  aggregatedResults?: {
    totalVulnerabilities: number;
    totalFindings: number;
    byFramework: Record<string, any>;
    completedFrameworks: number;
    failedFrameworks: number;
  };
}

const UnifiedOrchestrationDashboard: React.FC = () => {
  const [config, setConfig] = useState<UnifiedExecutionConfig>({
    mode: ExecutionMode.PARALLEL,
    frameworks: [Framework.GARAK, Framework.PROMPTFOO],
    garak: {
      model: 'gpt-4',
      modelType: 'openai',
      probes: ['injection', 'toxicity'],
      generators: ['default'],
      detectors: ['default'],
    },
  });

  const [execution, setExecution] = useState<UnifiedExecution | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (execution && execution.status === 'running') {
      const interval = setInterval(fetchExecutionStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [execution]);

  const fetchExecutionStatus = async () => {
    if (!execution) return;

    try {
      const response = await fetch(
        `http://localhost:3003/api/v1/unified/orchestration/${execution.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setExecution(data);
      }
    } catch (error) {
      console.error('Failed to fetch execution status:', error);
    }
  };

  const startUnifiedExecution = async () => {
    setIsStarting(true);
    try {
      const response = await fetch(
        'http://localhost:3003/api/v1/unified/orchestration/start',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add JWT token here when auth is implemented
          },
          body: JSON.stringify(config),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExecution(data);
      } else {
        console.error('Failed to start unified execution');
      }
    } catch (error) {
      console.error('Failed to start unified execution:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const stopUnifiedExecution = async () => {
    if (!execution) return;

    try {
      await fetch(
        `http://localhost:3003/api/v1/unified/orchestration/${execution.id}/stop`,
        {
          method: 'POST',
          headers: {
            // Add JWT token here when auth is implemented
          },
        }
      );
      // Refresh status
      await fetchExecutionStatus();
    } catch (error) {
      console.error('Failed to stop unified execution:', error);
    }
  };

  const toggleFramework = (framework: Framework) => {
    setConfig((prev) => {
      const frameworks = prev.frameworks.includes(framework)
        ? prev.frameworks.filter((f) => f !== framework)
        : [...prev.frameworks, framework];
      return { ...prev, frameworks };
    });
  };

  const getFrameworkIcon = (framework: Framework) => {
    switch (framework) {
      case Framework.PROMPTFOO:
        return '🎯';
      case Framework.GARAK:
        return '🔍';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-400 bg-blue-500/10 border-blue-500';
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500';
      case 'partial':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500';
    }
  };

  const getModeLabel = (mode: ExecutionMode) => {
    switch (mode) {
      case ExecutionMode.PARALLEL:
        return 'Parallèle (Rapide)';
      case ExecutionMode.SEQUENTIAL:
        return 'Séquentiel (Ressources optimisées)';
      case ExecutionMode.SELECTIVE:
        return 'Sélectif (Frameworks choisis)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <GitMerge className="w-8 h-8 text-cyan-400" />
          Orchestration Unifiée - Plateforme Pentest AI
        </h1>
        <p className="text-gray-400 mt-1">
          Exécution coordonnée de Promptfoo et Garak pour une couverture complète
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Configuration</h2>

            {/* Execution Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Mode d'Exécution
              </label>
              <div className="space-y-2">
                {Object.values(ExecutionMode).map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-cyan-400 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      checked={config.mode === mode}
                      onChange={(e) =>
                        setConfig({ ...config, mode: e.target.value as ExecutionMode })
                      }
                      disabled={execution?.status === 'running'}
                      className="accent-cyan-400"
                    />
                    <div>
                      <div className="text-white font-medium">{getModeLabel(mode)}</div>
                      <div className="text-xs text-gray-400">
                        {mode === ExecutionMode.PARALLEL &&
                          'Tous les frameworks en même temps'}
                        {mode === ExecutionMode.SEQUENTIAL &&
                          'Un framework après l\'autre'}
                        {mode === ExecutionMode.SELECTIVE &&
                          'Seulement les frameworks sélectionnés'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Framework Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Frameworks Actifs
              </label>
              <div className="space-y-2">
                {Object.values(Framework).map((framework) => (
                  <label
                    key={framework}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-cyan-400 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={config.frameworks.includes(framework)}
                      onChange={() => toggleFramework(framework)}
                      disabled={execution?.status === 'running'}
                      className="accent-cyan-400"
                    />
                    <span className="text-2xl">{getFrameworkIcon(framework)}</span>
                    <div>
                      <div className="text-white font-medium capitalize">
                        {framework}
                      </div>
                      <div className="text-xs text-gray-400">
                        {framework === Framework.PROMPTFOO &&
                          'Tests de prompts LLM'}
                        {framework === Framework.GARAK &&
                          'Scanner de vulnérabilités'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="space-y-2 pt-6">
              {!execution || ['completed', 'failed', 'partial'].includes(execution.status) ? (
                <button
                  onClick={startUnifiedExecution}
                  disabled={
                    isStarting ||
                    config.frameworks.length === 0 ||
                    execution?.status === 'running'
                  }
                  className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Démarrage...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Lancer Orchestration
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={stopUnifiedExecution}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  <Square className="w-5 h-5" />
                  Arrêter Tout
                </button>
              )}

              {execution && (
                <button
                  onClick={() => setExecution(null)}
                  disabled={execution.status === 'running'}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Nouvelle Exécution
                </button>
              )}
            </div>
          </Card>
        </div>

        {/* Execution Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!execution && (
            <Card>
              <div className="text-center py-12">
                <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Orchestration Prête
                </h3>
                <p className="text-gray-500">
                  Sélectionnez les frameworks et lancez l'exécution unifiée
                </p>
              </div>
            </Card>
          )}

          {execution && (
            <>
              {/* Overall Status */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Exécution Unifiée #{execution.id.split('-').pop()}
                  </h2>
                  <div
                    className={`px-3 py-1 rounded-lg border ${getStatusColor(
                      execution.status
                    )}`}
                  >
                    <span className="text-sm font-semibold uppercase">
                      {execution.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center">
                    <Clock className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-400">Durée</p>
                    <p className="text-lg font-semibold text-white">
                      {Math.floor(execution.duration / 60)}:
                      {(execution.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="text-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-400">Complétés</p>
                    <p className="text-lg font-semibold text-white">
                      {execution.aggregatedResults?.completedFrameworks || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <AlertTriangle className="w-6 h-6 text-orange-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-400">Vulnérabilités</p>
                    <p className="text-lg font-semibold text-white">
                      {execution.aggregatedResults?.totalVulnerabilities || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-400">Découvertes</p>
                    <p className="text-lg font-semibold text-white">
                      {execution.aggregatedResults?.totalFindings || 0}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Framework Status Cards */}
              <div className="space-y-4">
                {execution.frameworks.map((fw) => (
                  <Card key={fw.framework}>
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{getFrameworkIcon(fw.framework)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white capitalize">
                            {fw.framework}
                          </h3>
                          <div className="flex items-center gap-3">
                            {fw.status === 'running' && (
                              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                            )}
                            {fw.status === 'completed' && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                            {fw.status === 'failed' && (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                fw.status === 'running'
                                  ? 'text-blue-400'
                                  : fw.status === 'completed'
                                  ? 'text-green-400'
                                  : fw.status === 'failed'
                                  ? 'text-red-400'
                                  : 'text-gray-400'
                              }`}
                            >
                              {fw.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Progression</span>
                            <span>{fw.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                fw.status === 'failed'
                                  ? 'bg-red-400'
                                  : 'bg-cyan-400'
                              }`}
                              style={{ width: `${fw.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Error Message */}
                        {fw.error && (
                          <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded">
                            <span className="font-semibold">Erreur: </span>
                            {fw.error}
                          </div>
                        )}

                        {/* Results Summary */}
                        {fw.results && (
                          <div className="text-sm text-gray-300 bg-gray-800 px-3 py-2 rounded mt-2">
                            <span className="font-semibold">Résultats: </span>
                            {JSON.stringify(fw.results)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedOrchestrationDashboard;
