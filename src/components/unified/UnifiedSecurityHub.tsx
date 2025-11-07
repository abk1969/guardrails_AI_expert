import React, { useState, useEffect } from 'react';
import { Shield, Activity, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';

interface UnifiedMetrics {
  totalTests: number;
  vulnerabilitiesFound: number;
  criticalFindings: number;
  lastScanTime: string;
  toolsStatus: {
    promptfoo: 'running' | 'idle' | 'error';
    garak: 'running' | 'idle' | 'error';
    strix: 'running' | 'idle' | 'error';
  };
  recentActivity: Array<{
    id: string;
    tool: 'promptfoo' | 'garak' | 'strix';
    action: string;
    timestamp: string;
    severity: 'critical' | 'high' | 'moderate' | 'low' | 'info';
  }>;
}

const UnifiedSecurityHub: React.FC = () => {
  const [metrics, setMetrics] = useState<UnifiedMetrics>({
    totalTests: 0,
    vulnerabilitiesFound: 0,
    criticalFindings: 0,
    lastScanTime: '',
    toolsStatus: {
      promptfoo: 'idle',
      garak: 'idle',
      strix: 'idle',
    },
    recentActivity: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    // Refresh every 10 seconds
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:3003/api/v1/unified/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-400';
      case 'idle':
        return 'text-gray-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10';
      case 'high':
        return 'text-orange-500 bg-orange-500/10';
      case 'moderate':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Centre de Sécurité Unifié</h1>
          <p className="text-gray-400 mt-1">
            Vue d'ensemble des tests de sécurité - Promptfoo, Garak & Strix
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tests Effectués</p>
              <p className="text-3xl font-bold text-white mt-1">{metrics.totalTests}</p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-lg">
              <Shield className="w-8 h-8 text-cyan-400" />
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
              <p className="text-gray-400 text-sm">Vulnérabilités</p>
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
                {metrics.lastScanTime || 'Jamais'}
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
              <p className="text-gray-400 text-sm">Statut Système</p>
              <p className="text-lg font-semibold text-green-400 mt-1 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Opérationnel
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tools Status */}
      <Card>
        <h2 className="text-xl font-bold text-white mb-4">Statut des Outils</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Promptfoo */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Promptfoo</span>
              <span className={`text-sm font-medium ${getStatusColor(metrics.toolsStatus.promptfoo)}`}>
                {metrics.toolsStatus.promptfoo === 'running' && '● En cours'}
                {metrics.toolsStatus.promptfoo === 'idle' && '○ Inactif'}
                {metrics.toolsStatus.promptfoo === 'error' && '✕ Erreur'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Tests de prompts LLM et évaluations automatisées
            </p>
          </div>

          {/* Garak */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Garak</span>
              <span className={`text-sm font-medium ${getStatusColor(metrics.toolsStatus.garak)}`}>
                {metrics.toolsStatus.garak === 'running' && '● En cours'}
                {metrics.toolsStatus.garak === 'idle' && '○ Inactif'}
                {metrics.toolsStatus.garak === 'error' && '✕ Erreur'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Scanner de vulnérabilités LLM (OWASP Top 10)
            </p>
          </div>

          {/* Strix */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Strix</span>
              <span className={`text-sm font-medium ${getStatusColor(metrics.toolsStatus.strix)}`}>
                {metrics.toolsStatus.strix === 'running' && '● En cours'}
                {metrics.toolsStatus.strix === 'idle' && '○ Inactif'}
                {metrics.toolsStatus.strix === 'error' && '✕ Erreur'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Tests agentic AI et sandboxing automatisé
            </p>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Activité Récente</h2>
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
            Voir tout →
          </button>
        </div>

        {metrics.recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucune activité récente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(activity.severity)}`}>
                  {activity.severity.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-gray-400 text-sm">{activity.tool}</p>
                </div>
                <div className="text-gray-400 text-sm">{activity.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-6 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-left">
          <Shield className="w-8 h-8 text-white mb-2" />
          <h3 className="text-white font-semibold mb-1">Nouveau Scan Promptfoo</h3>
          <p className="text-cyan-100 text-sm">Tester des prompts LLM</p>
        </button>

        <button className="p-6 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-left">
          <AlertTriangle className="w-8 h-8 text-white mb-2" />
          <h3 className="text-white font-semibold mb-1">Lancer Garak</h3>
          <p className="text-orange-100 text-sm">Scanner les vulnérabilités</p>
        </button>

        <button className="p-6 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-left">
          <Activity className="w-8 h-8 text-white mb-2" />
          <h3 className="text-white font-semibold mb-1">Exécuter Strix</h3>
          <p className="text-purple-100 text-sm">Tests agentic AI</p>
        </button>
      </div>
    </div>
  );
};

export default UnifiedSecurityHub;
