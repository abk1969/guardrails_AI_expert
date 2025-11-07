# 🚀 Implémentation de la Plateforme Unifiée - Guide Complet

## 📋 Table des Matières

1. [Architecture Technique Détaillée](#architecture-technique)
2. [Composants Frontend à Créer](#composants-frontend)
3. [Services Backend à Implémenter](#services-backend)
4. [Workflows Utilisateur](#workflows-utilisateur)
5. [Configuration Vercel](#configuration-vercel)
6. [Plan de Développement Sprint par Sprint](#plan-de-développement)

---

## 🏗️ Architecture Technique Détaillée

### Structure des Répertoires

```
ai_risk_and_red_team_manager/guardrails_AI_expert/
├── components/
│   ├── unified/                         # NOUVEAU
│   │   ├── UnifiedSecurityHub.tsx       # Hub central
│   │   ├── UnifiedResultsView.tsx       # Résultats consolidés
│   │   ├── ModeSwitcher.tsx             # Débutant/Intermédiaire/Expert
│   │   └── ComprehensiveWizard.tsx      # Wizard 5 étapes
│   ├── garak/                           # NOUVEAU
│   │   ├── GarakScannerUI.tsx           # Interface principale
│   │   ├── GarakProbeSelector.tsx       # Sélection probes
│   │   ├── GarakResults.tsx             # Affichage résultats
│   │   └── GarakConfig.tsx              # Configuration avancée
│   ├── strix/                           # NOUVEAU
│   │   ├── StrixDashboard.tsx           # Interface principale
│   │   ├── StrixAgentView.tsx           # Visualisation agents
│   │   ├── StrixLogs.tsx                # Logs temps réel
│   │   └── StrixConfig.tsx              # Configuration avancée
│   └── promptfoo/                       # EXISTANT (à adapter)
│       ├── PromptfooWizard.tsx          # Déjà implémenté
│       ├── PromptfooResultsView.tsx     # Déjà implémenté
│       └── PromptfooTestExecution.tsx   # Déjà implémenté
├── services/
│   ├── unifiedOrchestratorService.ts    # NOUVEAU - Orchestration
│   ├── garakApiService.ts               # NOUVEAU - API Garak
│   ├── strixApiService.ts               # NOUVEAU - API Strix
│   └── promptfooAutomationService.ts    # EXISTANT
├── contexts/
│   ├── UnifiedSecurityContext.tsx       # NOUVEAU - État global tests
│   └── ...existing contexts...
├── types/
│   ├── unified.ts                       # NOUVEAU - Types unifiés
│   ├── garak.ts                         # NOUVEAU - Types Garak
│   ├── strix.ts                         # NOUVEAU - Types Strix
│   └── promptfoo.ts                     # EXISTANT
└── backend/
    └── apps/
        └── api-gateway/src/
            ├── garak/                    # NOUVEAU
            │   ├── garak.service.ts
            │   ├── garak.controller.ts
            │   └── dto/
            ├── strix/                    # NOUVEAU
            │   ├── strix.service.ts
            │   ├── strix.controller.ts
            │   ├── strix.gateway.ts      # WebSocket
            │   └── dto/
            └── orchestrator/             # NOUVEAU
                ├── orchestrator.service.ts
                ├── orchestrator.controller.ts
                └── dto/
```

---

## 🎨 Composants Frontend à Créer

### 1. `UnifiedSecurityHub.tsx` - Hub Central

**Objectif** : Point d'entrée unique pour tous les tests de sécurité

```tsx
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Shield, Zap, Target, BarChart3 } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useUnifiedSecurity } from '../../contexts/UnifiedSecurityContext';

type SecurityMode = 'beginner' | 'intermediate' | 'expert' | 'comprehensive';

const UnifiedSecurityHub: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<SecurityMode | null>(null);
  const { setActiveNav } = useNavigation();
  const { comprehensiveScanStatus } = useUnifiedSecurity();

  const modes = [
    {
      id: 'beginner' as SecurityMode,
      title: 'Mode Débutant',
      description: 'Tests guidés avec Promptfoo - Idéal pour commencer',
      icon: <Zap size={32} />,
      color: 'cyan',
      difficulty: 'Facile',
      duration: '10-15 min',
      tool: 'Promptfoo',
      features: ['Configuration simple', 'Tests automatiques', 'Rapports visuels'],
      action: () => setActiveNav('promptfoo-wizard')
    },
    {
      id: 'intermediate' as SecurityMode,
      title: 'Mode Intermédiaire',
      description: 'Scanner de vulnérabilités LLM avec Garak',
      icon: <Shield size={32} />,
      color: 'blue',
      difficulty: 'Intermédiaire',
      duration: '20-30 min',
      tool: 'Garak',
      features: ['Probes spécialisées', 'Tests adaptatifs', 'Détection avancée'],
      action: () => setActiveNav('garak-scanner')
    },
    {
      id: 'expert' as SecurityMode,
      title: 'Mode Expert',
      description: 'Pentest applicatif autonome avec Strix',
      icon: <Target size={32} />,
      color: 'purple',
      difficulty: 'Expert',
      duration: '1-2 heures',
      tool: 'Strix',
      features: ['Agents autonomes', 'Exploitation PoC', 'Pentest complet'],
      action: () => setActiveNav('strix-pentest')
    },
    {
      id: 'comprehensive' as SecurityMode,
      title: 'Test Complet',
      description: 'Orchestration des 3 outils pour un audit exhaustif',
      icon: <BarChart3 size={32} />,
      color: 'green',
      difficulty: 'Tous Niveaux',
      duration: '2-3 heures',
      tool: 'Promptfoo + Garak + Strix',
      features: ['Tests exhaustifs', 'Rapport consolidé', 'Vue 360°'],
      action: () => setActiveNav('comprehensive-wizard')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Centre de Sécurité Unifi
é
            </h1>
            <p className="text-gray-300">
              Choisissez votre niveau d'expertise pour des tests de sécurité adaptés
            </p>
          </div>
        </div>
      </Card>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode) => (
          <Card
            key={mode.id}
            className={`cursor-pointer transition-all hover:border-${mode.color}-500/50 hover:shadow-${mode.color}-500/20 ${
              selectedMode === mode.id ? `border-${mode.color}-500 bg-${mode.color}-900/20` : ''
            }`}
            onClick={() => setSelectedMode(mode.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-lg bg-${mode.color}-500/20 text-${mode.color}-400`}>
                {mode.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{mode.title}</h3>
                  <span className={`text-xs bg-${mode.color}-500/20 text-${mode.color}-400 px-3 py-1 rounded-full`}>
                    {mode.difficulty}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-3">{mode.description}</p>

                {/* Features */}
                <ul className="space-y-1 mb-3">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                      <span className={`text-${mode.color}-400`}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <span>⏱️ {mode.duration}</span>
                  <span>🔧 {mode.tool}</span>
                </div>

                {/* Action Button */}
                <Button
                  onClick={mode.action}
                  className="w-full"
                  variant={selectedMode === mode.id ? 'primary' : 'secondary'}
                >
                  Commencer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Scans */}
      {comprehensiveScanStatus && (
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Dernier Scan Complet</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Status: {comprehensiveScanStatus.status}</div>
              <div className="text-sm text-gray-400">Progression: {comprehensiveScanStatus.progress}%</div>
            </div>
            <Button onClick={() => setActiveNav('unified-results')}>
              Voir les Résultats
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-cyan-400">42</div>
          <div className="text-sm text-gray-400">Tests Exécutés</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-400">8</div>
          <div className="text-sm text-gray-400">Vulnérabilités</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-400">76%</div>
          <div className="text-sm text-gray-400">Taux de Succès</div>
        </Card>
      </div>
    </div>
  );
};

export default UnifiedSecurityHub;
```

---

### 2. `GarakScannerUI.tsx` - Interface Garak

**Objectif** : Interface simplifiée pour lancer des scans Garak

```tsx
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Shield, Play, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { garakApiService } from '../../services/garakApiService';

interface GarakProbe {
  id: string;
  name: string;
  category: string;
  description: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  duration: number; // minutes
}

const GARAK_PROBES: GarakProbe[] = [
  {
    id: 'promptinject',
    name: 'Prompt Injection',
    category: 'Injection',
    description: 'Détecte les vulnérabilités d\'injection de prompts pour contourner les instructions système',
    severity: 'critical',
    duration: 5
  },
  {
    id: 'dan',
    name: 'DAN Jailbreak',
    category: 'Jailbreak',
    description: 'Tests de jailbreak "Do Anything Now" pour contourner les restrictions',
    severity: 'critical',
    duration: 10
  },
  {
    id: 'encoding',
    name: 'Encoding Attacks',
    category: 'Injection',
    description: 'Injection via encodage (base64, ROT13, etc.) pour contourner les filtres',
    severity: 'high',
    duration: 5
  },
  {
    id: 'malwaregen',
    name: 'Malware Generation',
    category: 'Content Safety',
    description: 'Tente de faire générer du code malveillant ou des exploits',
    severity: 'critical',
    duration: 8
  },
  {
    id: 'leakreplay',
    name: 'Data Leakage',
    category: 'Privacy',
    description: 'Détecte les fuites de données d\'entraînement ou de contexte',
    severity: 'high',
    duration: 6
  },
  {
    id: 'misleading',
    name: 'Misinformation',
    category: 'Content Quality',
    description: 'Génération d\'affirmations fausses ou trompeuses',
    severity: 'moderate',
    duration: 7
  },
  {
    id: 'atkgen',
    name: 'Adaptive Attacks',
    category: 'Advanced',
    description: 'Génération d\'attaques adaptatives basées sur les réponses du modèle',
    severity: 'high',
    duration: 15
  },
  {
    id: 'xss',
    name: 'Data Exfiltration',
    category: 'Security',
    description: 'Tentatives d\'exfiltration de données sensibles',
    severity: 'high',
    duration: 5
  }
];

const GarakScannerUI: React.FC = () => {
  const [selectedProbes, setSelectedProbes] = useState<string[]>(['promptinject', 'dan', 'encoding']);
  const [targetType, setTargetType] = useState<string>('openai');
  const [targetName, setTargetName] = useState<string>('gpt-3.5-turbo');
  const [apiKey, setApiKey] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);

  const toggleProbe = (probeId: string) => {
    setSelectedProbes(prev =>
      prev.includes(probeId)
        ? prev.filter(id => id !== probeId)
        : [...prev, probeId]
    );
  };

  const estimatedDuration = selectedProbes.reduce((total, probeId) => {
    const probe = GARAK_PROBES.find(p => p.id === probeId);
    return total + (probe?.duration || 0);
  }, 0);

  const handleStartScan = async () => {
    setIsScanning(true);
    try {
      const result = await garakApiService.startScan({
        targetType,
        targetName,
        probes: selectedProbes,
        apiKey
      });
      setScanId(result.scanId);
    } catch (error) {
      console.error('Erreur lancement scan:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Garak - Scanner de Vulnérabilités LLM
            </h2>
            <p className="text-gray-300">
              Tests avancés de sécurité avec 162 outils de pentest IA
            </p>
          </div>
        </div>
      </Card>

      {/* Target Configuration */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">Configuration de la Cible</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Type de Cible</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="w-full bg-gray-800 text-gray-200 p-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="openai">OpenAI</option>
              <option value="huggingface">Hugging Face</option>
              <option value="cohere">Cohere</option>
              <option value="groq">Groq</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">Nom du Modèle</label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="gpt-3.5-turbo"
              className="w-full bg-gray-800 text-gray-200 p-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">API Key (optionnelle)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-gray-800 text-gray-200 p-3 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Laissez vide pour utiliser les variables d'environnement backend
            </p>
          </div>
        </div>
      </Card>

      {/* Probe Selection */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">
          Sélection des Probes ({selectedProbes.length} sélectionnées)
        </h3>
        <div className="space-y-3">
          {GARAK_PROBES.map((probe) => {
            const isSelected = selectedProbes.includes(probe.id);
            return (
              <button
                key={probe.id}
                onClick={() => toggleProbe(probe.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-blue-400 bg-blue-900/30'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {isSelected ? (
                    <CheckSquare size={20} className="text-blue-400" />
                  ) : (
                    <Square size={20} className="text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{probe.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      probe.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      probe.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      probe.severity === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {probe.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">{probe.category}</span>
                  </div>
                  <p className="text-sm text-gray-400">{probe.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Durée estimée: ~{probe.duration} min</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Estimation */}
      <Card className="bg-blue-900/20 border-blue-500/30">
        <h3 className="text-lg font-bold text-white mb-4">Estimation</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-700/50 p-4 rounded text-center">
            <div className="text-3xl font-bold text-blue-400">{selectedProbes.length}</div>
            <div className="text-sm text-gray-400 mt-1">Probes</div>
          </div>
          <div className="bg-gray-700/50 p-4 rounded text-center">
            <div className="text-3xl font-bold text-green-400">~{estimatedDuration}</div>
            <div className="text-sm text-gray-400 mt-1">Minutes</div>
          </div>
          <div className="bg-gray-700/50 p-4 rounded text-center">
            <div className="text-3xl font-bold text-yellow-400">~{selectedProbes.length * 50}</div>
            <div className="text-sm text-gray-400 mt-1">Appels API</div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {selectedProbes.length === 0 && (
              <span className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle size={16} />
                Veuillez sélectionner au moins une probe
              </span>
            )}
          </div>
          <Button
            onClick={handleStartScan}
            disabled={selectedProbes.length === 0 || isScanning}
            className="px-8"
          >
            {isScanning ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Scan en cours...
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                Lancer le Scan
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Scan Results Link */}
      {scanId && (
        <Card className="bg-green-900/20 border-green-500/30">
          <div className="text-center py-4">
            <div className="text-lg font-bold text-white mb-2">Scan Lancé !</div>
            <p className="text-gray-300 mb-4">ID: {scanId}</p>
            <Button onClick={() => window.location.href = `/results/garak/${scanId}`}>
              Voir les Résultats
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GarakScannerUI;
```

---

### 3. `UnifiedResultsView.tsx` - Vue Consolidée

**Objectif** : Afficher les résultats des 3 outils dans une interface unifiée

```tsx
import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Filter, Download, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { UnifiedTestResult } from '../../types/unified';
import { unifiedOrchestratorService } from '../../services/unifiedOrchestratorService';

const COLORS = {
  promptfoo: '#22d3ee', // cyan
  garak: '#3b82f6',     // blue
  strix: '#8b5cf6'      // purple
};

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  moderate: '#fbbf24',
  low: '#3b82f6',
  info: '#6b7280'
};

const UnifiedResultsView: React.FC = () => {
  const [results, setResults] = useState<UnifiedTestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<UnifiedTestResult[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [results, sourceFilter, severityFilter]);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const data = await unifiedOrchestratorService.getConsolidatedResults();
      setResults(data);
    } catch (error) {
      console.error('Erreur chargement résultats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];

    if (sourceFilter !== 'ALL') {
      filtered = filtered.filter(r => r.source === sourceFilter);
    }

    if (severityFilter !== 'ALL') {
      filtered = filtered.filter(r => r.result.severity === severityFilter);
    }

    setFilteredResults(filtered);
  };

  // Statistics
  const stats = {
    total: results.length,
    bySource: {
      promptfoo: results.filter(r => r.source === 'promptfoo').length,
      garak: results.filter(r => r.source === 'garak').length,
      strix: results.filter(r => r.source === 'strix').length
    },
    bySeverity: {
      critical: results.filter(r => r.result.severity === 'critical').length,
      high: results.filter(r => r.result.severity === 'high').length,
      moderate: results.filter(r => r.result.severity === 'moderate').length,
      low: results.filter(r => r.result.severity === 'low').length,
      info: results.filter(r => r.result.severity === 'info').length
    },
    failed: results.filter(r => !r.result.passed).length,
    passed: results.filter(r => r.result.passed).length
  };

  const sourceChartData = Object.entries(stats.bySource).map(([source, count]) => ({
    name: source,
    value: count
  }));

  const severityChartData = Object.entries(stats.bySeverity).map(([severity, count]) => ({
    name: severity,
    value: count
  }));

  const handleExport = async (format: 'pdf' | 'excel') => {
    await unifiedOrchestratorService.exportResults(format, filteredResults);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-cyan-400 text-xl">Chargement des résultats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-cyan-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Résultats Consolidés - Vue 360°
            </h2>
            <p className="text-gray-300">
              Analyse unifiée des tests Promptfoo, Garak et Strix
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleExport('pdf')} variant="secondary">
              <Download size={16} className="mr-2" />
              PDF
            </Button>
            <Button onClick={() => handleExport('excel')} variant="secondary">
              <Download size={16} className="mr-2" />
              Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Top-Level Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="text-center">
          <div className="text-4xl font-bold text-cyan-400">{stats.total}</div>
          <div className="text-sm text-gray-400 mt-1">Total Tests</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-red-400">{stats.failed}</div>
          <div className="text-sm text-gray-400 mt-1">Vulnérabilités</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-green-400">{stats.passed}</div>
          <div className="text-sm text-gray-400 mt-1">Tests Réussis</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-orange-400">{stats.bySeverity.critical}</div>
          <div className="text-sm text-gray-400 mt-1">Critiques</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-blue-400">
            {stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-400 mt-1">Taux de Succès</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Résultats par Source</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sourceChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-white mb-4">Vulnérabilités par Sévérité</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Bar dataKey="value" fill="#22d3ee">
                {severityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-bold text-white">Filtres:</span>
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-gray-800 text-gray-200 p-2 rounded border border-gray-600 text-sm"
          >
            <option value="ALL">Toutes les sources</option>
            <option value="promptfoo">Promptfoo</option>
            <option value="garak">Garak</option>
            <option value="strix">Strix</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-gray-800 text-gray-200 p-2 rounded border border-gray-600 text-sm"
          >
            <option value="ALL">Toutes les sévérités</option>
            <option value="critical">Critique</option>
            <option value="high">Haute</option>
            <option value="moderate">Modérée</option>
            <option value="low">Basse</option>
            <option value="info">Info</option>
          </select>

          <div className="text-sm text-gray-400 ml-auto">
            {filteredResults.length} résultats affichés
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        <h3 className="text-lg font-bold text-white mb-4">Détails des Vulnérabilités</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3 text-sm font-bold text-gray-400">Source</th>
                <th className="text-left p-3 text-sm font-bold text-gray-400">Catégorie</th>
                <th className="text-left p-3 text-sm font-bold text-gray-400">Test</th>
                <th className="text-left p-3 text-sm font-bold text-gray-400">Sévérité</th>
                <th className="text-left p-3 text-sm font-bold text-gray-400">Score</th>
                <th className="text-left p-3 text-sm font-bold text-gray-400">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded`} style={{ backgroundColor: `${COLORS[result.source]}30`, color: COLORS[result.source] }}>
                      {result.source}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-300">{result.test.category}</td>
                  <td className="p-3 text-sm text-gray-300">{result.test.technique}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded`} style={{
                      backgroundColor: `${SEVERITY_COLORS[result.result.severity]}30`,
                      color: SEVERITY_COLORS[result.result.severity]
                    }}>
                      {result.result.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-300">{(result.result.score * 100).toFixed(0)}%</td>
                  <td className="p-3">
                    {result.result.passed ? (
                      <span className="text-green-400">✓ Passé</span>
                    ) : (
                      <span className="text-red-400">✗ Échoué</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UnifiedResultsView;
```

---

## 📊 Prochaines Étapes Immédiates

### Sprint 1 (Semaine 1)

**Jour 1-2** : Setup et Hub Central
- [ ] Créer `components/unified/UnifiedSecurityHub.tsx`
- [ ] Ajouter section dans `App.tsx`
- [ ] Créer contexte `UnifiedSecurityContext`

**Jour 3-4** : Interface Garak
- [ ] Créer `components/garak/GarakScannerUI.tsx`
- [ ] Créer service `garakApiService.ts`
- [ ] Types `garak.ts`

**Jour 5** : Interface Strix (basique)
- [ ] Créer `components/strix/StrixDashboard.tsx`
- [ ] Créer service `strixApiService.ts`
- [ ] Types `strix.ts`

### Sprint 2 (Semaine 2)

**Backend Services**
- [ ] Créer `backend/apps/api-gateway/src/garak/`
- [ ] Créer `backend/apps/api-gateway/src/strix/`
- [ ] Créer `backend/apps/api-gateway/src/orchestrator/`

### Sprint 3 (Semaine 3)

**Résultats Unifiés + Vercel**
- [ ] `UnifiedResultsView.tsx`
- [ ] Configuration Vercel
- [ ] Tests E2E

---

**Prêt à commencer l'implémentation ? 🚀**
