import React, { useState } from 'react';
import { Shield, Play, Settings, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Card from '../ui/Card';

interface ScanConfig {
  model: string;
  apiKey: string;
  probes: string[];
  generators: string[];
  detectors: string[];
}

interface ScanResult {
  id: string;
  timestamp: string;
  model: string;
  totalTests: number;
  passed: number;
  failed: number;
  vulnerabilities: Array<{
    category: string;
    severity: 'critical' | 'high' | 'moderate' | 'low';
    description: string;
  }>;
  status: 'running' | 'completed' | 'failed';
}

const GarakScannerUI: React.FC = () => {
  const [config, setConfig] = useState<ScanConfig>({
    model: 'openai/gpt-4',
    apiKey: '',
    probes: ['all'],
    generators: ['default'],
    detectors: ['default'],
  });

  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult | null>(null);

  const availableProbes = [
    { id: 'all', name: 'Tous les tests', description: 'Scan complet avec tous les probes' },
    { id: 'encoding', name: 'Encoding', description: 'Tester les vulnérabilités d\'encodage' },
    { id: 'injection', name: 'Prompt Injection', description: 'Détection d\'injections de prompts' },
    { id: 'toxicity', name: 'Toxicity', description: 'Contenu toxique et offensant' },
    { id: 'jailbreak', name: 'Jailbreak', description: 'Tentatives de jailbreak' },
    { id: 'hallucination', name: 'Hallucination', description: 'Détection d\'hallucinations' },
    { id: 'leakage', name: 'Data Leakage', description: 'Fuite de données sensibles' },
    { id: 'malicious', name: 'Malicious Use', description: 'Utilisation malveillante' },
  ];

  const startScan = async () => {
    setScanning(true);
    setResults(null);

    try {
      const response = await fetch('http://localhost:3003/api/v1/garak/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setScanning(false);
    }
  };

  const handleProbeToggle = (probeId: string) => {
    setConfig((prev) => {
      const probes = prev.probes.includes(probeId)
        ? prev.probes.filter((p) => p !== probeId)
        : [...prev.probes.filter((p) => p !== 'all'), probeId];
      return { ...prev, probes: probes.length === 0 ? ['all'] : probes };
    });
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white">Configuration</h2>
            </div>

            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modèle LLM
                </label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="openai/gpt-4">OpenAI GPT-4</option>
                  <option value="openai/gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                  <option value="anthropic/claude-3-opus">Anthropic Claude 3 Opus</option>
                  <option value="groq/mixtral-8x7b">Groq Mixtral 8x7B</option>
                  <option value="cohere/command-r-plus">Cohere Command R+</option>
                </select>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Clé API (optionnel)
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Utilise la clé par défaut si vide"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Probes Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tests à Exécuter
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableProbes.map((probe) => (
                    <label
                      key={probe.id}
                      className="flex items-start gap-2 p-2 rounded hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={config.probes.includes(probe.id)}
                        onChange={() => handleProbeToggle(probe.id)}
                        className="mt-1 accent-cyan-400"
                      />
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{probe.name}</div>
                        <div className="text-gray-400 text-xs">{probe.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Start Scan Button */}
              <button
                onClick={startScan}
                disabled={scanning}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
              >
                {scanning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {!results && !scanning && (
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

          {scanning && (
            <Card>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-400 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Scan en cours...
                </h3>
                <p className="text-gray-400">
                  Analyse du modèle {config.model} en cours
                </p>
              </div>
            </Card>
          )}

          {results && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Tests Effectués</p>
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
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <h2 className="text-xl font-bold text-white">
                    Vulnérabilités Détectées ({results.vulnerabilities.length})
                  </h2>
                </div>

                {results.vulnerabilities.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold">Aucune vulnérabilité détectée</p>
                    <p className="text-gray-400 text-sm mt-1">Le modèle a passé tous les tests avec succès</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.vulnerabilities.map((vuln, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold">{vuln.category}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              vuln.severity === 'critical'
                                ? 'bg-red-500/10 text-red-400'
                                : vuln.severity === 'high'
                                ? 'bg-orange-500/10 text-orange-400'
                                : vuln.severity === 'moderate'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-blue-500/10 text-blue-400'
                            }`}
                          >
                            {vuln.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{vuln.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Export Report Button */}
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Exporter PDF
                  </button>
                  <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2">
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
