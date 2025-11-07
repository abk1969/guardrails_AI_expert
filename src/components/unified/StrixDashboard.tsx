import React, { useState, useEffect } from 'react';
import { Zap, Play, Pause, RotateCcw, FileCode, Terminal, CheckCircle, XCircle, Clock } from 'lucide-react';
import Card from '../ui/Card';

interface AgentConfig {
  targetUrl: string;
  attackMode: 'light' | 'moderate' | 'aggressive';
  headless: boolean;
  maxSteps: number;
  timeout: number;
}

interface AgentExecution {
  id: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  currentStep: number;
  totalSteps: number;
  startTime: string;
  duration: number;
  findings: Array<{
    type: 'vulnerability' | 'info' | 'success';
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
    timestamp: string;
  }>;
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
  }>;
}

const StrixDashboard: React.FC = () => {
  const [config, setConfig] = useState<AgentConfig>({
    targetUrl: 'https://example.com',
    attackMode: 'moderate',
    headless: true,
    maxSteps: 50,
    timeout: 300,
  });

  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (execution && execution.status === 'running') {
      // Fetch updates every 2 seconds
      const interval = setInterval(fetchExecutionStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [execution]);

  const fetchExecutionStatus = async () => {
    if (!execution) return;

    try {
      const response = await fetch(`http://localhost:3003/api/v1/strix/execution/${execution.id}`);
      if (response.ok) {
        const data = await response.json();
        setExecution(data);
      }
    } catch (error) {
      console.error('Failed to fetch execution status:', error);
    }
  };

  const startExecution = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/v1/strix/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const data = await response.json();
        setExecution(data);
      }
    } catch (error) {
      console.error('Failed to start execution:', error);
    }
  };

  const pauseExecution = async () => {
    if (!execution) return;

    try {
      await fetch(`http://localhost:3003/api/v1/strix/execution/${execution.id}/pause`, {
        method: 'POST',
      });
      setExecution({ ...execution, status: 'paused' });
    } catch (error) {
      console.error('Failed to pause execution:', error);
    }
  };

  const resumeExecution = async () => {
    if (!execution) return;

    try {
      await fetch(`http://localhost:3003/api/v1/strix/execution/${execution.id}/resume`, {
        method: 'POST',
      });
      setExecution({ ...execution, status: 'running' });
    } catch (error) {
      console.error('Failed to resume execution:', error);
    }
  };

  const stopExecution = async () => {
    if (!execution) return;

    try {
      await fetch(`http://localhost:3003/api/v1/strix/execution/${execution.id}/stop`, {
        method: 'POST',
      });
      setExecution({ ...execution, status: 'completed' });
    } catch (error) {
      console.error('Failed to stop execution:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500';
      case 'moderate':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 'low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Zap className="w-8 h-8 text-purple-400" />
          Strix Agent - Tests Agentic AI
        </h1>
        <p className="text-gray-400 mt-1">
          Agent autonome pour le pentesting automatisé de systèmes AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Configuration Agent</h2>

            <div className="space-y-4">
              {/* Target URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL Cible
                </label>
                <input
                  type="url"
                  value={config.targetUrl}
                  onChange={(e) => setConfig({ ...config, targetUrl: e.target.value })}
                  placeholder="https://example.com"
                  disabled={execution?.status === 'running'}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                />
              </div>

              {/* Attack Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mode d'Attaque
                </label>
                <select
                  value={config.attackMode}
                  onChange={(e) => setConfig({ ...config, attackMode: e.target.value as any })}
                  disabled={execution?.status === 'running'}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                >
                  <option value="light">Light (Reconnaissance)</option>
                  <option value="moderate">Moderate (Tests Standards)</option>
                  <option value="aggressive">Aggressive (Tests Avancés)</option>
                </select>
              </div>

              {/* Headless Mode */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.headless}
                    onChange={(e) => setConfig({ ...config, headless: e.target.checked })}
                    disabled={execution?.status === 'running'}
                    className="accent-purple-400"
                  />
                  <span className="text-sm text-gray-300">Mode Headless (sans UI)</span>
                </label>
              </div>

              {/* Max Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Étapes Maximales: {config.maxSteps}
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={config.maxSteps}
                  onChange={(e) => setConfig({ ...config, maxSteps: parseInt(e.target.value) })}
                  disabled={execution?.status === 'running'}
                  className="w-full accent-purple-400 disabled:opacity-50"
                />
              </div>

              {/* Timeout */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Timeout (secondes): {config.timeout}
                </label>
                <input
                  type="range"
                  min="60"
                  max="1800"
                  step="60"
                  value={config.timeout}
                  onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) })}
                  disabled={execution?.status === 'running'}
                  className="w-full accent-purple-400 disabled:opacity-50"
                />
              </div>

              {/* Control Buttons */}
              <div className="space-y-2 pt-4">
                {!execution || execution.status === 'completed' || execution.status === 'failed' ? (
                  <button
                    onClick={startExecution}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    <Play className="w-5 h-5" />
                    Lancer l'Agent
                  </button>
                ) : (
                  <>
                    {execution.status === 'running' ? (
                      <button
                        onClick={pauseExecution}
                        className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={resumeExecution}
                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Reprendre
                      </button>
                    )}
                    <button
                      onClick={stopExecution}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Arrêter
                    </button>
                  </>
                )}

                {execution && (
                  <button
                    onClick={() => setExecution(null)}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Nouveau Test
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Execution Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!execution && (
            <Card>
              <div className="text-center py-12">
                <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Agent Strix Prêt
                </h3>
                <p className="text-gray-500">
                  Configurez et lancez l'agent pour commencer les tests automatisés
                </p>
              </div>
            </Card>
          )}

          {execution && (
            <>
              {/* Status Card */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Exécution en Cours</h2>
                  <div className="flex items-center gap-2">
                    {execution.status === 'running' && (
                      <div className="flex items-center gap-2 text-green-400">
                        <div className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm font-medium">EN COURS</span>
                      </div>
                    )}
                    {execution.status === 'paused' && (
                      <span className="text-yellow-400 text-sm font-medium">EN PAUSE</span>
                    )}
                    {execution.status === 'completed' && (
                      <span className="text-blue-400 text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        TERMINÉ
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Étape {execution.currentStep} / {execution.totalSteps}</span>
                    <span>{Math.round((execution.currentStep / execution.totalSteps) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(execution.currentStep / execution.totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <Clock className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-400">Durée</p>
                    <p className="text-lg font-semibold text-white">
                      {Math.floor(execution.duration / 60)}:{(execution.duration % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                  <div className="text-center">
                    <FileCode className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-400">Découvertes</p>
                    <p className="text-lg font-semibold text-white">{execution.findings.length}</p>
                  </div>
                  <div className="text-center">
                    <Terminal className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-400">Logs</p>
                    <p className="text-lg font-semibold text-white">{execution.logs.length}</p>
                  </div>
                </div>
              </Card>

              {/* Findings */}
              <Card>
                <h2 className="text-xl font-bold text-white mb-4">Découvertes</h2>
                {execution.findings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>Aucune découverte pour le moment</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {execution.findings.map((finding, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${getSeverityColor(finding.severity)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{finding.title}</h3>
                          <span className="text-xs font-medium px-2 py-1 rounded">
                            {finding.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm opacity-80">{finding.description}</p>
                        <p className="text-xs opacity-60 mt-2">{finding.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Logs */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Logs en Direct</h2>
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                      className="accent-purple-400"
                    />
                    Auto-scroll
                  </label>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto">
                  {execution.logs.map((log, index) => (
                    <div
                      key={index}
                      className={`py-1 ${
                        log.level === 'error'
                          ? 'text-red-400'
                          : log.level === 'warning'
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                      <span className="text-cyan-400">[{log.level.toUpperCase()}]</span>{' '}
                      {log.message}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StrixDashboard;
