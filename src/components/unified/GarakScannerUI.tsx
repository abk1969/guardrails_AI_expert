import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Play,
  Settings,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ArrowUpDown,
  History,
  Zap,
  Trash2,
  Info,
} from 'lucide-react';
import Card from '../ui/Card';
import { useLLMConfig } from '@/contexts/LLMConfigContext';
import type {
  GarakScanConfig,
  GarakScanResult,
  GarakScanPreset,
  GarakSeverity,
  GarakProbeType,
} from '@/types/garak';
import {
  GARAK_AVAILABLE_PROBES,
  GARAK_SCAN_PRESETS,
  GARAK_PRESET_PROBES,
} from '@/types/garak';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCAN_HISTORY_KEY = 'garak-scan-history';
const MAX_HISTORY = 5;

const SEVERITY_ORDER: Record<GarakSeverity, number> = {
  critical: 0,
  high: 1,
  moderate: 2,
  low: 3,
};

const SEVERITY_STYLES: Record<GarakSeverity, { badge: string; label: string }> = {
  critical: { badge: 'bg-red-500/20 text-red-400 border border-red-500/30', label: 'CRITIQUE' },
  high: { badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30', label: 'ÉLEVÉ' },
  moderate: { badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30', label: 'MODÉRÉ' },
  low: { badge: 'bg-green-500/20 text-green-400 border border-green-500/30', label: 'FAIBLE' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadScanHistory(): GarakScanResult[] {
  try {
    const raw = localStorage.getItem(SCAN_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScanHistory(history: GarakScanResult[]) {
  localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Severity Badge Component
// ---------------------------------------------------------------------------

const SeverityBadge: React.FC<{ severity: GarakSeverity }> = ({ severity }) => {
  const style = SEVERITY_STYLES[severity];
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${style.badge}`}>
      {style.label}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const GarakScannerUI: React.FC = () => {
  const { config: llmConfig, isConfigured } = useLLMConfig();

  // Scan configuration
  const [config, setConfig] = useState<GarakScanConfig>({
    model: llmConfig?.model || 'openai/gpt-4',
    apiKey: llmConfig?.apiKey || '',
    probes: ['injection', 'jailbreak', 'toxicity'],
    generators: ['default'],
    detectors: ['default'],
    preset: 'quick',
  });

  // UI state
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<GarakScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<GarakScanResult[]>(loadScanHistory);

  // Filters
  const [severityFilter, setSeverityFilter] = useState<GarakSeverity | 'all'>('all');
  const [sortAsc, setSortAsc] = useState(false);

  // Sync LLM config changes into scan config
  useEffect(() => {
    if (llmConfig) {
      setConfig(prev => ({
        ...prev,
        model: llmConfig.model || prev.model,
        apiKey: llmConfig.apiKey || prev.apiKey,
        modelType: llmConfig.provider === 'gemini' || llmConfig.provider === 'openai' || llmConfig.provider === 'claude'
          ? (llmConfig.provider === 'claude' ? 'anthropic' : llmConfig.provider) as GarakScanConfig['modelType']
          : prev.modelType,
      }));
    }
  }, [llmConfig]);

  // Preset selection handler
  const handlePresetChange = useCallback((preset: GarakScanPreset) => {
    setConfig(prev => ({
      ...prev,
      preset,
      probes: GARAK_PRESET_PROBES[preset],
    }));
  }, []);

  // Probe toggle
  const handleProbeToggle = useCallback((probeId: GarakProbeType) => {
    setConfig(prev => {
      if (probeId === 'all') {
        return { ...prev, probes: ['all'], preset: 'thorough' };
      }
      const withoutAll = prev.probes.filter(p => p !== 'all');
      const probes = withoutAll.includes(probeId)
        ? withoutAll.filter(p => p !== probeId)
        : [...withoutAll, probeId];
      return { ...prev, probes: probes.length === 0 ? ['all'] : probes, preset: undefined };
    });
  }, []);

  // Start scan
  const startScan = async () => {
    if (!config.model) {
      setError('Veuillez sélectionner un modèle LLM avant de lancer le scan.');
      return;
    }

    setScanning(true);
    setResults(null);
    setError(null);
    setProgress(0);

    // Simulate progress during network request
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 8;
      });
    }, 800);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003/api/v1';
      const response = await fetch(`${apiUrl}/garak/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => '');
        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentification échouée. Vérifiez votre clé API.');
        }
        if (response.status === 429) {
          throw new Error('Trop de requêtes. Veuillez patienter avant de relancer un scan.');
        }
        if (response.status >= 500) {
          throw new Error('Erreur serveur. Le service Garak est peut-être indisponible.');
        }
        throw new Error(errorBody || `Erreur HTTP ${response.status}`);
      }

      const data: GarakScanResult = await response.json();
      setProgress(100);
      setResults(data);

      // Save to history
      const updated = [data, ...scanHistory].slice(0, MAX_HISTORY);
      setScanHistory(updated);
      saveScanHistory(updated);
    } catch (err) {
      const message =
        err instanceof TypeError && err.message.includes('fetch')
          ? 'Impossible de contacter le serveur. Vérifiez que le backend est démarré.'
          : err instanceof Error
          ? err.message
          : 'Une erreur inattendue est survenue.';
      setError(message);
    } finally {
      clearInterval(progressInterval);
      setScanning(false);
    }
  };

  // Filter and sort vulnerabilities
  const filteredVulnerabilities = results
    ? results.vulnerabilities
        .filter(v => severityFilter === 'all' || v.severity === severityFilter)
        .sort((a, b) => {
          const diff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
          return sortAsc ? -diff : diff;
        })
    : [];

  // Clear history
  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem(SCAN_HISTORY_KEY);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-orange-400" />
          Garak Scanner - Vulnérabilités LLM
        </h1>
        <p className="text-gray-400 mt-1">
          Scanner complet basé sur OWASP LLM Top 10 et tests agentic
        </p>
      </div>

      {/* LLM Config Banner */}
      {isConfigured && llmConfig && (
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-900/30 border border-cyan-700/40 rounded-lg text-sm">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-cyan-300">
            Configuration LLM détectée : <span className="font-semibold text-white">{llmConfig.provider}</span> / <span className="font-semibold text-white">{llmConfig.model}</span>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============================================================= */}
        {/* Configuration Panel                                           */}
        {/* ============================================================= */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Configuration</h2>
            </div>

            <div className="space-y-4">
              {/* Preset Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Préréglage de scan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(GARAK_SCAN_PRESETS) as [GarakScanPreset, typeof GARAK_SCAN_PRESETS[GarakScanPreset]][]).map(
                    ([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePresetChange(key)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          config.preset === key
                            ? 'bg-orange-600/20 border-orange-500 text-orange-300'
                            : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Zap className="w-3.5 h-3.5" />
                          {preset.label}
                        </div>
                        <div className="text-xs text-gray-400">{preset.probeCount} sondes</div>
                      </button>
                    ),
                  )}
                </div>
                {config.preset && (
                  <p className="text-xs text-gray-500 mt-1">
                    {GARAK_SCAN_PRESETS[config.preset].description}
                  </p>
                )}
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modèle LLM
                </label>
                <input
                  type="text"
                  value={config.model}
                  onChange={e => setConfig({ ...config, model: e.target.value })}
                  placeholder="ex: openai/gpt-4, gemini/gemini-2.0-flash"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
                {isConfigured && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pré-rempli depuis la configuration LLM globale
                  </p>
                )}
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Clé API (optionnel)
                </label>
                <input
                  type="password"
                  value={config.apiKey || ''}
                  onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Utilise la clé globale si vide"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Probes Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sondes à exécuter
                </label>
                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  {GARAK_AVAILABLE_PROBES.map(probe => (
                    <label
                      key={probe.id}
                      className="flex items-start gap-2 p-2 rounded hover:bg-gray-700/60 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={
                          config.probes.includes(probe.id) ||
                          (probe.id !== 'all' && config.probes.includes('all'))
                        }
                        onChange={() => handleProbeToggle(probe.id)}
                        className="mt-0.5 accent-cyan-400"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium">{probe.name}</div>
                        <div className="text-gray-500 text-xs">{probe.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Start Scan Button */}
              <button
                type="button"
                onClick={startScan}
                disabled={scanning}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold text-white"
              >
                {scanning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Scan en cours...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Lancer le Scan
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Historique des scans</h3>
                </div>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                  title="Effacer l'historique"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {scanHistory.map(scan => (
                  <button
                    key={scan.id}
                    type="button"
                    onClick={() => setResults(scan)}
                    className="w-full text-left p-2 rounded bg-gray-700/40 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium truncate">
                        {scan.model}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          scan.status === 'completed'
                            ? 'text-green-400'
                            : scan.status === 'failed'
                            ? 'text-red-400'
                            : 'text-yellow-400'
                        }`}
                      >
                        {scan.status === 'completed' ? 'Terminé' : scan.status === 'failed' ? 'Échoué' : 'En cours'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(scan.timestamp)}
                      </span>
                      <span>{scan.totalTests} tests</span>
                      {scan.failed > 0 && (
                        <span className="text-red-400">{scan.failed} échoués</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* ============================================================= */}
        {/* Results Panel                                                  */}
        {/* ============================================================= */}
        <div className="lg:col-span-2 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-700/40 rounded-lg">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 font-medium">Erreur lors du scan</p>
                <p className="text-red-400/80 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!results && !scanning && !error && (
            <Card>
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Aucun scan en cours
                </h3>
                <p className="text-gray-500">
                  Configurez et lancez un scan pour détecter les vulnérabilités
                </p>
              </div>
            </Card>
          )}

          {/* Scanning Progress */}
          {scanning && (
            <Card>
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Scan en cours...
                </h3>
                <p className="text-gray-400 mb-4">
                  Analyse du modèle <span className="text-cyan-300 font-medium">{config.model}</span>
                </p>
                {/* Progress bar */}
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {progress < 30
                      ? 'Initialisation des sondes...'
                      : progress < 60
                      ? 'Exécution des tests de vulnérabilité...'
                      : progress < 90
                      ? 'Analyse des réponses du modèle...'
                      : 'Finalisation des résultats...'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Results */}
          {results && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Tests effectués</p>
                    <p className="text-3xl font-bold text-white">{results.totalTests}</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Réussis</p>
                    <p className="text-3xl font-bold text-green-400 flex items-center justify-center gap-2">
                      <CheckCircle className="w-6 h-6" />
                      {results.passed}
                    </p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Échoués</p>
                    <p className="text-3xl font-bold text-red-400 flex items-center justify-center gap-2">
                      <XCircle className="w-6 h-6" />
                      {results.failed}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Vulnerabilities List */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <h2 className="text-xl font-bold text-white">
                      Vulnérabilités détectées ({results.vulnerabilities.length})
                    </h2>
                  </div>

                  {/* Severity filter & sort */}
                  {results.vulnerabilities.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                          value={severityFilter}
                          onChange={e => setSeverityFilter(e.target.value as GarakSeverity | 'all')}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="all">Toutes</option>
                          <option value="critical">Critique</option>
                          <option value="high">Élevé</option>
                          <option value="moderate">Modéré</option>
                          <option value="low">Faible</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSortAsc(prev => !prev)}
                        className="p-1 rounded hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                        title={sortAsc ? 'Tri : faible → critique' : 'Tri : critique → faible'}
                      >
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {results.vulnerabilities.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold">Aucune vulnérabilité détectée</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Le modèle a passé tous les tests avec succès
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredVulnerabilities.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        Aucune vulnérabilité ne correspond au filtre sélectionné
                      </p>
                    ) : (
                      filteredVulnerabilities.map((vuln, index) => (
                        <div
                          key={index}
                          className="p-4 bg-gray-800/60 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-white font-semibold">{vuln.category}</h3>
                            <SeverityBadge severity={vuln.severity} />
                          </div>
                          <p className="text-gray-400 text-sm">{vuln.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Export buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-white"
                  >
                    <FileText className="w-4 h-4" />
                    Exporter PDF
                  </button>
                  <button
                    type="button"
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-white"
                  >
                    <FileText className="w-4 h-4" />
                    Exporter JSON
                  </button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GarakScannerUI;
