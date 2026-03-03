import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TestTube2,
  Play,
  Eye,
  RefreshCw,
  XCircle,
  Loader2,
  BarChart3,
} from 'lucide-react';
import Card from '../ui/Card';
import type {
  UnifiedMetrics,
  SecurityTool,
  ToolOperationalStatus,
  ActivitySeverity,
  SecurityActivity,
} from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TOOL_THEME: Record<SecurityTool, {
  label: string;
  description: string;
  color: string;
  bgLight: string;
  bgDark: string;
  border: string;
  hoverBg: string;
  icon: React.ReactNode;
}> = {
  garak: {
    label: 'Garak',
    description: 'Scanner de vulnerabilites LLM (OWASP Top 10)',
    color: 'text-red-400',
    bgLight: 'bg-red-500/10',
    bgDark: 'bg-red-600',
    border: 'border-red-500/30',
    hoverBg: 'hover:bg-red-700',
    icon: <Shield className="w-6 h-6" />,
  },
  promptfoo: {
    label: 'Promptfoo',
    description: 'Tests de prompts LLM et evaluations automatisees',
    color: 'text-blue-400',
    bgLight: 'bg-blue-500/10',
    bgDark: 'bg-blue-600',
    border: 'border-blue-500/30',
    hoverBg: 'hover:bg-blue-700',
    icon: <TestTube2 className="w-6 h-6" />,
  },
};

const STATUS_LABELS: Record<ToolOperationalStatus, { label: string; dot: string }> = {
  running: { label: 'En cours', dot: 'bg-green-400 animate-pulse' },
  idle: { label: 'Inactif', dot: 'bg-gray-400' },
  error: { label: 'Erreur', dot: 'bg-red-400' },
};

const SEVERITY_STYLES: Record<ActivitySeverity, string> = {
  critical: 'text-red-500 bg-red-500/10',
  high: 'text-orange-500 bg-orange-500/10',
  moderate: 'text-yellow-500 bg-yellow-500/10',
  low: 'text-blue-500 bg-blue-500/10',
  info: 'text-gray-500 bg-gray-500/10',
};

const DEFAULT_METRICS: UnifiedMetrics = {
  totalTests: 0,
  vulnerabilitiesFound: 0,
  criticalFindings: 0,
  lastScanTime: '',
  toolsStatus: {
    promptfoo: 'idle',
    garak: 'idle',
  },
  recentActivity: [],
};

function formatTimestamp(ts: string): string {
  if (!ts) return 'Jamais';
  try {
    const d = new Date(ts);
    return d.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

function toolActivityCount(activities: SecurityActivity[], tool: SecurityTool): {
  total: number;
  critical: number;
  high: number;
} {
  const toolActivities = activities.filter((a) => a.tool === tool);
  return {
    total: toolActivities.length,
    critical: toolActivities.filter((a) => a.severity === 'critical').length,
    high: toolActivities.filter((a) => a.severity === 'high').length,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const UnifiedSecurityHub: React.FC = () => {
  const [metrics, setMetrics] = useState<UnifiedMetrics>(DEFAULT_METRICS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const failCountRef = useRef(0);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

  const fetchMetrics = useCallback(async (isManual = false) => {
    if (isManual) {
      setRefreshing(true);
      // Manual refresh resets failure tracking
      failCountRef.current = 0;
      setBackendAvailable(true);
    }

    // Stop auto-polling after 3 consecutive failures
    if (!isManual && failCountRef.current >= 3) return;

    try {
      const response = await fetch(`${apiUrl}/unified/metrics`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
        failCountRef.current = 0;
        setBackendAvailable(true);
      } else {
        failCountRef.current++;
      }
    } catch {
      failCountRef.current++;
      if (failCountRef.current >= 3) {
        setBackendAvailable(false);
      }
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(() => fetchMetrics(), 15000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const garakStats = toolActivityCount(metrics.recentActivity, 'garak');
  const promptfooStats = toolActivityCount(metrics.recentActivity, 'promptfoo');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Standalone mode banner */}
      {!backendAvailable && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-yellow-300 font-medium text-sm">Mode autonome — Backend non disponible</p>
            <p className="text-yellow-400/70 text-xs mt-0.5">
              Les donnees affichees sont statiques. Lancez le backend Docker pour les donnees temps reel.
            </p>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Header                                                            */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Centre de Securite Unifie</h1>
          <p className="text-gray-400 mt-1">
            Vue d'ensemble des tests de securite &mdash; Garak &amp; Promptfoo
          </p>
        </div>
        <button
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2 text-white"
        >
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Actualiser
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Metrics Overview (4 summary cards)                                */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tests Effectues</p>
              <p className="text-3xl font-bold text-white mt-1">{metrics.totalTests}</p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">+12% cette semaine</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vulnerabilites</p>
              <p className="text-3xl font-bold text-white mt-1">{metrics.vulnerabilitiesFound}</p>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-orange-400">{metrics.criticalFindings} critiques</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Dernier Scan</p>
              <p className="text-lg font-semibold text-white mt-1">
                {formatTimestamp(metrics.lastScanTime)}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Statut Systeme</p>
              {metrics.toolsStatus.garak === 'error' || metrics.toolsStatus.promptfoo === 'error' ? (
                <p className="text-lg font-semibold text-red-400 mt-1 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Erreur detectee
                </p>
              ) : metrics.toolsStatus.garak === 'running' || metrics.toolsStatus.promptfoo === 'running' ? (
                <p className="text-lg font-semibold text-yellow-400 mt-1 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scan en cours
                </p>
              ) : (
                <p className="text-lg font-semibold text-green-400 mt-1 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Operationnel
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Tool Status Cards (2-column)                                      */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(['garak', 'promptfoo'] as SecurityTool[]).map((tool) => {
          const theme = TOOL_THEME[tool];
          const status = metrics.toolsStatus?.[tool] ?? 'idle';
          const statusMeta = STATUS_LABELS[status];
          const stats = tool === 'garak' ? garakStats : promptfooStats;
          const lastActivity = metrics.recentActivity.find((a) => a.tool === tool);

          return (
            <Card key={tool} className={`border ${theme.border}`}>
              {/* Tool header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme.bgLight} ${theme.color}`}>
                    {theme.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{theme.label}</h3>
                    <p className="text-gray-400 text-sm">{theme.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusMeta.dot}`} />
                  <span className={`text-sm font-medium ${
                    status === 'running' ? 'text-green-400' :
                    status === 'error' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {statusMeta.label}
                  </span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Activites</p>
                  <p className="text-white font-bold text-lg">{stats.total}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Critiques</p>
                  <p className="text-red-400 font-bold text-lg">{stats.critical}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Haute</p>
                  <p className="text-orange-400 font-bold text-lg">{stats.high}</p>
                </div>
              </div>

              {/* Last execution */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Clock className="w-4 h-4" />
                <span>
                  Derniere activite : {lastActivity ? formatTimestamp(lastActivity.timestamp) : 'Aucune'}
                </span>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 ${theme.bgDark} ${theme.hoverBg} rounded-lg transition-colors text-white text-sm font-medium`}
                >
                  <Play className="w-4 h-4" />
                  {tool === 'garak' ? 'Lancer Scan' : 'Lancer Test'}
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  Resultats
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Comparative Summary Panel                                         */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Comparaison des Resultats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Garak side */}
          <div className={`rounded-lg border ${TOOL_THEME.garak.border} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded ${TOOL_THEME.garak.bgLight} ${TOOL_THEME.garak.color}`}>
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-white font-semibold">Garak &mdash; Vulnerabilites</h3>
            </div>
            {garakStats.total === 0 ? (
              <p className="text-gray-500 text-sm italic">Aucun scan Garak recent</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Constats critiques</span>
                  <span className="text-red-400 font-bold">{garakStats.critical}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Constats hauts</span>
                  <span className="text-orange-400 font-bold">{garakStats.high}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total activites</span>
                  <span className="text-white font-bold">{garakStats.total}</span>
                </div>
                {/* Severity bar */}
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden flex">
                  {garakStats.critical > 0 && (
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${(garakStats.critical / garakStats.total) * 100}%` }}
                    />
                  )}
                  {garakStats.high > 0 && (
                    <div
                      className="bg-orange-500 h-full"
                      style={{ width: `${(garakStats.high / garakStats.total) * 100}%` }}
                    />
                  )}
                  {garakStats.total - garakStats.critical - garakStats.high > 0 && (
                    <div
                      className="bg-gray-500 h-full"
                      style={{
                        width: `${((garakStats.total - garakStats.critical - garakStats.high) / garakStats.total) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Promptfoo side */}
          <div className={`rounded-lg border ${TOOL_THEME.promptfoo.border} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded ${TOOL_THEME.promptfoo.bgLight} ${TOOL_THEME.promptfoo.color}`}>
                <TestTube2 className="w-4 h-4" />
              </div>
              <h3 className="text-white font-semibold">Promptfoo &mdash; Evaluations</h3>
            </div>
            {promptfooStats.total === 0 ? (
              <p className="text-gray-500 text-sm italic">Aucun test Promptfoo recent</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Constats critiques</span>
                  <span className="text-red-400 font-bold">{promptfooStats.critical}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Constats hauts</span>
                  <span className="text-orange-400 font-bold">{promptfooStats.high}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total activites</span>
                  <span className="text-white font-bold">{promptfooStats.total}</span>
                </div>
                {/* Severity bar */}
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden flex">
                  {promptfooStats.critical > 0 && (
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${(promptfooStats.critical / promptfooStats.total) * 100}%` }}
                    />
                  )}
                  {promptfooStats.high > 0 && (
                    <div
                      className="bg-orange-500 h-full"
                      style={{ width: `${(promptfooStats.high / promptfooStats.total) * 100}%` }}
                    />
                  )}
                  {promptfooStats.total - promptfooStats.critical - promptfooStats.high > 0 && (
                    <div
                      className="bg-gray-500 h-full"
                      style={{
                        width: `${((promptfooStats.total - promptfooStats.critical - promptfooStats.high) / promptfooStats.total) * 100}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Recent Activity                                                    */}
      {/* ----------------------------------------------------------------- */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Activite Recente</h2>
        </div>

        {metrics.recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucune activite recente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.recentActivity.map((activity) => {
              const theme = TOOL_THEME[activity.tool];
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  {/* Tool icon badge */}
                  <div className={`p-1.5 rounded ${theme.bgLight} ${theme.color}`}>
                    {activity.tool === 'garak' ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <TestTube2 className="w-4 h-4" />
                    )}
                  </div>
                  {/* Severity */}
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      SEVERITY_STYLES[activity.severity] ?? SEVERITY_STYLES.info
                    }`}
                  >
                    {activity.severity.toUpperCase()}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{activity.action}</p>
                    <p className={`text-sm ${theme.color}`}>{theme.label}</p>
                  </div>
                  {/* Timestamp */}
                  <div className="text-gray-400 text-sm whitespace-nowrap">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ----------------------------------------------------------------- */}
      {/* Quick Actions Footer                                               */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-6 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-left group">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-white" />
            <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-white font-semibold mb-1">Lancer Scan Garak</h3>
          <p className="text-red-100 text-sm">Scanner les vulnerabilites LLM (OWASP Top 10)</p>
        </button>

        <button className="p-6 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left group">
          <div className="flex items-center gap-3 mb-2">
            <TestTube2 className="w-8 h-8 text-white" />
            <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-white font-semibold mb-1">Lancer Test Promptfoo</h3>
          <p className="text-blue-100 text-sm">Tester les prompts LLM et evaluations automatisees</p>
        </button>
      </div>
    </div>
  );
};

export default UnifiedSecurityHub;
