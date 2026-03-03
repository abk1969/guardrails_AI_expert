import React, { useState, useEffect, useMemo } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Play,
  Shield,
  Clock,
  DollarSign,
  Target,
  Loader,
  ExternalLink,
  AlertTriangle,
  CheckSquare,
  Square,
  Sparkles,
  Search,
  ShieldAlert,
  ListChecks
} from 'lucide-react';
import {
  PromptfooWizardConfig,
  PromptfooEstimation,
  PromptfooPreview,
  PromptfooDryRunResult,
  PROMPTFOO_TARGET_PRESETS,
  PROMPTFOO_TEST_DEPTHS,
  PROMPTFOO_RISK_CATEGORIES,
  PromptfooTestDepth,
  PromptfooTargetPreset
} from '../types/promptfoo';
import { promptfooAutomationService } from '../services/promptfooAutomationService';
import { useNavigation } from '../contexts/NavigationContext';

type WizardStep = 1 | 2 | 3;

/** Preset configurations for quick setup */
interface WizardPreset {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  targetPreset: PromptfooTargetPreset;
  testDepth: PromptfooTestDepth;
  selectedRiskCategories: string[];
  badgeColor: string;
}

const WIZARD_PRESETS: WizardPreset[] = [
  {
    id: 'quick-check',
    label: 'Verification Rapide',
    description: 'Test rapide des vulnerabilites critiques (injection, jailbreak). Ideal pour un premier diagnostic.',
    icon: <Zap size={20} />,
    targetPreset: 'gemini-flash',
    testDepth: 'quick',
    selectedRiskCategories: ['prompt-injection', 'jailbreak'],
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  {
    id: 'full-audit',
    label: 'Audit Complet',
    description: 'Audit exhaustif couvrant toutes les categories de risques avec tests approfondis.',
    icon: <Search size={20} />,
    targetPreset: 'gemini-pro',
    testDepth: 'thorough',
    selectedRiskCategories: PROMPTFOO_RISK_CATEGORIES.map(c => c.id),
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  {
    id: 'injection-focus',
    label: 'Focus Injection',
    description: 'Tests specialises sur les attaques par injection de prompts et contournement.',
    icon: <ShieldAlert size={20} />,
    targetPreset: 'gemini-flash',
    testDepth: 'standard',
    selectedRiskCategories: ['prompt-injection', 'jailbreak', 'harmful-content'],
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
];

const STEP_LABELS: Record<WizardStep, { title: string; subtitle: string }> = {
  1: { title: 'Configuration', subtitle: 'Cible, profondeur et categories' },
  2: { title: 'Validation', subtitle: 'Estimation et confirmations' },
  3: { title: 'Execution', subtitle: 'Lancement des tests' },
};

/**
 * Assistant Guide Promptfoo - Mode Debutant
 *
 * Flux simplifie en 3 etapes pour les utilisateurs novices :
 * 1. Configuration simple (questions claires)
 * 2. Validation et previsualisation (garde-fous de securite)
 * 3. Execution automatique
 */
const PromptfooWizard: React.FC = () => {
  const { setActiveNav } = useNavigation();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [config, setConfig] = useState<Partial<PromptfooWizardConfig>>({
    targetPreset: 'gemini-flash',
    testDepth: 'standard',
    selectedRiskCategories: ['prompt-injection', 'jailbreak', 'pii'],
    userConfirmed: false,
    acceptedWarnings: false
  });

  // Loading states
  const [isLoadingEstimation, setIsLoadingEstimation] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Computed data
  const [estimation, setEstimation] = useState<PromptfooEstimation | null>(null);
  const [preview, setPreview] = useState<PromptfooPreview | null>(null);
  const [dryRunResult, setDryRunResult] = useState<PromptfooDryRunResult | null>(null);

  // Execution state
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Validation errors for step 1
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate step 1
  const step1Errors = useMemo(() => {
    const errors: string[] = [];
    if (!config.targetPreset) errors.push('Veuillez selectionner un systeme IA cible');
    if (config.targetPreset === 'custom' && !config.customTargetUrl) {
      errors.push('Veuillez saisir l\'URL de votre endpoint personnalise');
    }
    if (!config.testDepth) errors.push('Veuillez choisir un niveau de profondeur');
    if (!config.selectedRiskCategories || config.selectedRiskCategories.length === 0) {
      errors.push('Veuillez selectionner au moins une categorie de risque');
    }
    return errors;
  }, [config.targetPreset, config.testDepth, config.selectedRiskCategories, config.customTargetUrl]);

  const isStep1Valid = step1Errors.length === 0;

  // Load estimation automatically when config changes on step 2
  useEffect(() => {
    if (currentStep >= 2) {
      loadEstimation();
    }
  }, [config.targetPreset, config.testDepth, config.selectedRiskCategories, currentStep]);

  const loadEstimation = async () => {
    setIsLoadingEstimation(true);
    try {
      const est = await promptfooAutomationService.generateEstimation(config);
      setEstimation(est);
    } catch (error) {
      console.error('Erreur chargement estimation:', error);
    } finally {
      setIsLoadingEstimation(false);
    }
  };

  const loadPreview = async () => {
    setIsLoadingPreview(true);
    try {
      const prev = await promptfooAutomationService.generatePreview(config as PromptfooWizardConfig);
      setPreview(prev);
    } catch (error) {
      console.error('Erreur chargement preview:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const executeDryRun = async () => {
    setIsLoadingPreview(true);
    try {
      const result = await promptfooAutomationService.executeDryRun(config as PromptfooWizardConfig);
      setDryRunResult(result);
      return result.success;
    } catch (error) {
      console.error('Erreur dry-run:', error);
      return false;
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const applyPreset = (preset: WizardPreset) => {
    setConfig({
      ...config,
      targetPreset: preset.targetPreset,
      testDepth: preset.testDepth,
      selectedRiskCategories: [...preset.selectedRiskCategories],
    });
    setValidationErrors([]);
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!isStep1Valid) {
        setValidationErrors(step1Errors);
        return;
      }
      setValidationErrors([]);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!config.acceptedWarnings || !config.userConfirmed) {
        setValidationErrors(['Veuillez accepter les conditions avant de continuer']);
        return;
      }
      setValidationErrors([]);

      const dryRunSuccess = await executeDryRun();
      if (!dryRunSuccess && dryRunResult) {
        setValidationErrors(dryRunResult.errors);
        return;
      }

      await loadPreview();
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setValidationErrors([]);
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionError(null);

    try {
      const backendAvailable = await promptfooAutomationService.checkBackendAvailability();

      if (!backendAvailable) {
        setExecutionError(
          'Le backend n\'est pas disponible. ' +
          'Pour executer des tests reels, demarrez le backend avec Docker:\n\n' +
          'docker-compose up -d\n\n' +
          'Ou utilisez le mode "simulation" dans Configuration (Expert).'
        );
        setIsExecuting(false);
        return;
      }

      const result = await promptfooAutomationService.executeReal(config as PromptfooWizardConfig);

      if (result.success && result.testRunId) {
        setTestRunId(result.testRunId);
        localStorage.setItem('promptfoo_last_test_run_id', result.testRunId);
        localStorage.setItem('promptfoo-wizard-config', JSON.stringify(config));

        setTimeout(() => {
          setActiveNav('promptfoo-execution');
        }, 2000);
      } else {
        setExecutionError(result.error || 'Erreur inconnue lors du lancement des tests');
      }
    } catch (error) {
      setExecutionError(
        'Erreur lors de l\'execution:\n' +
        (error instanceof Error ? error.message : 'Erreur inconnue') +
        '\n\nVeuillez verifier que le backend est demarre avec Docker.'
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const toggleRiskCategory = (categoryId: string) => {
    const current = config.selectedRiskCategories || [];
    if (current.includes(categoryId)) {
      setConfig({
        ...config,
        selectedRiskCategories: current.filter(c => c !== categoryId)
      });
    } else {
      setConfig({
        ...config,
        selectedRiskCategories: [...current, categoryId]
      });
    }
  };

  const selectedDepth = config.testDepth ? PROMPTFOO_TEST_DEPTHS[config.testDepth] : null;
  const selectedTarget = config.targetPreset ? PROMPTFOO_TARGET_PRESETS[config.targetPreset] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Zap size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Assistant Guide Promptfoo - Mode Debutant
              </h2>
              <p className="text-gray-300">
                Configuration simplifiee en 3 etapes pour lancer des tests de securite sans risque
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Button
              variant="secondary"
              className="text-xs"
              onClick={() => setActiveNav('promptfoo-config')}
            >
              Passer en Mode Expert
            </Button>
          </div>
        </div>
      </Card>

      {/* Visual Progress Indicator */}
      <Card className="bg-gray-700/30">
        {/* Progress bar */}
        <div className="relative w-full h-1.5 bg-gray-700 rounded-full mb-6">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          {([1, 2, 3] as WizardStep[]).map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep > step
                    ? 'bg-green-500 border-green-400 text-white'
                    : currentStep === step
                    ? 'bg-cyan-500 border-cyan-400 text-white ring-4 ring-cyan-500/20'
                    : 'bg-gray-700 border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step ? <CheckCircle2 size={20} /> : step}
                </div>
                <div>
                  <div className={`text-sm font-bold ${
                    currentStep >= step ? 'text-white' : 'text-gray-500'
                  }`}>
                    {STEP_LABELS[step].title}
                  </div>
                  <div className={`text-xs ${
                    currentStep >= step ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {STEP_LABELS[step].subtitle}
                  </div>
                </div>
              </div>
              {step < 3 && (
                <div className="flex-1 mx-4">
                  <div className={`h-0.5 rounded ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Validation Errors Banner */}
      {validationErrors.length > 0 && (
        <Card className="bg-red-900/20 border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-400 mb-1">Champs requis</h4>
              <ul className="space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i} className="text-sm text-red-300">{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Step 1: Simple Configuration */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Preset Configurations */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-400" />
              Configurations Pre-definies
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Selectionnez un preset pour configurer rapidement, ou personnalisez ci-dessous.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {WIZARD_PRESETS.map((preset) => {
                const isActive =
                  config.targetPreset === preset.targetPreset &&
                  config.testDepth === preset.testDepth &&
                  JSON.stringify([...(config.selectedRiskCategories || [])].sort()) ===
                    JSON.stringify([...preset.selectedRiskCategories].sort());
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-900/30 ring-2 ring-cyan-500/20'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`p-1.5 rounded ${preset.badgeColor}`}>
                        {preset.icon}
                      </span>
                      <span className="font-bold text-white">{preset.label}</span>
                    </div>
                    <p className="text-sm text-gray-400">{preset.description}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Target Selection */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-cyan-400" />
              1. Quel systeme IA voulez-vous tester ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(PROMPTFOO_TARGET_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => setConfig({ ...config, targetPreset: key as PromptfooTargetPreset })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    config.targetPreset === key
                      ? 'border-cyan-400 bg-cyan-900/30'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className="font-bold text-white mb-1">{preset.label}</div>
                  <div className="text-sm text-gray-400">{preset.description}</div>
                  <div className="text-xs text-gray-500 mt-2">~${preset.costPer1kTokens * 1000}/1M tokens</div>
                </button>
              ))}
            </div>

            {config.targetPreset === 'custom' && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-white mb-2">
                  URL de votre endpoint personnalise
                </label>
                <input
                  type="url"
                  value={config.customTargetUrl || ''}
                  onChange={(e) => setConfig({ ...config, customTargetUrl: e.target.value })}
                  placeholder="https://api.example.com/v1/chat"
                  className="w-full bg-gray-800 text-gray-200 p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}
          </Card>

          {/* Depth Selection */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock size={20} className="text-cyan-400" />
              2. Niveau de profondeur des tests ?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(PROMPTFOO_TEST_DEPTHS).map(([key, depth]) => (
                <button
                  key={key}
                  onClick={() => setConfig({ ...config, testDepth: key as PromptfooTestDepth })}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    config.testDepth === key
                      ? 'border-cyan-400 bg-cyan-900/30'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{depth.icon}</div>
                  <div className="font-bold text-white mb-1">{depth.label}</div>
                  <div className="text-sm text-gray-400 mb-2">{depth.description}</div>
                  <div className="text-xs text-gray-500">
                    {depth.numberOfTests} tests | ~{depth.durationMinutes} min
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Risk Categories Selection */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield size={20} className="text-cyan-400" />
                3. Quelles categories de risques tester ?
              </h3>
              <span className="text-sm text-gray-400">
                {(config.selectedRiskCategories || []).length}/{PROMPTFOO_RISK_CATEGORIES.length} selectionnees
              </span>
            </div>
            <div className="space-y-3">
              {PROMPTFOO_RISK_CATEGORIES.map((category) => {
                const isSelected = (config.selectedRiskCategories || []).includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleRiskCategory(category.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-900/30'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {isSelected ? (
                        <CheckSquare size={20} className="text-cyan-400" />
                      ) : (
                        <Square size={20} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{category.label}</span>
                        {category.critical && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                            Critique
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Quick estimation preview at step 1 bottom */}
          {isStep1Valid && selectedDepth && selectedTarget && (
            <Card className="bg-gray-700/20 border-gray-600">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks size={18} className="text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Apercu de la configuration</h4>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gray-800/50 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">Cible</p>
                  <p className="text-sm font-bold text-white mt-1">{selectedTarget.label.split('(')[0].trim()}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">Tests</p>
                  <p className="text-lg font-bold text-cyan-400">{selectedDepth.numberOfTests}</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">Duree estimee</p>
                  <p className="text-lg font-bold text-green-400">~{selectedDepth.durationMinutes} min</p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded text-center">
                  <p className="text-xs text-gray-400">Categories</p>
                  <p className="text-lg font-bold text-purple-400">{(config.selectedRiskCategories || []).length}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Validation & Preview */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Estimation */}
          <Card className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-yellow-400" />
              Estimation des Couts et de la Duree
            </h3>
            {isLoadingEstimation ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={24} className="animate-spin text-cyan-400" />
                <span className="ml-3 text-gray-400">Calcul de l'estimation...</span>
              </div>
            ) : estimation ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 p-4 rounded text-center border border-gray-600">
                  <div className="text-3xl font-bold text-cyan-400">{estimation.numberOfTests}</div>
                  <div className="text-sm text-gray-400 mt-1">Tests</div>
                  <div className="text-xs text-gray-500 mt-1">scenarios de securite</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded text-center border border-gray-600">
                  <div className="text-3xl font-bold text-green-400">~{estimation.estimatedDurationMinutes}</div>
                  <div className="text-sm text-gray-400 mt-1">Minutes</div>
                  <div className="text-xs text-gray-500 mt-1">duree d'execution</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded text-center border border-gray-600">
                  <div className="text-3xl font-bold text-yellow-400">${estimation.estimatedCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-400 mt-1">Cout (USD)</div>
                  <div className="text-xs text-gray-500 mt-1">appels API inclus</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded text-center border border-gray-600">
                  <div className="text-3xl font-bold text-purple-400">{estimation.apiCallsEstimated}</div>
                  <div className="text-sm text-gray-400 mt-1">Appels API</div>
                  <div className="text-xs text-gray-500 mt-1">requetes au modele</div>
                </div>
              </div>
            ) : null}
          </Card>

          {/* Warnings */}
          {estimation && estimation.warnings.length > 0 && (
            <Card className="bg-yellow-900/20 border-yellow-500/30">
              <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} />
                Avertissements
              </h4>
              <ul className="space-y-1">
                {estimation.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-yellow-300">- {warning}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Recommendations */}
          {estimation && estimation.recommendations.length > 0 && (
            <Card className="bg-blue-900/20 border-blue-500/30">
              <h4 className="text-sm font-bold text-blue-400 mb-2">Recommandations</h4>
              <ul className="space-y-1">
                {estimation.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-blue-300">{rec}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Safety Guards */}
          <Card className="bg-green-900/20 border-green-500/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-green-400" />
              Garde-fous de Securite
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Mode Simulation Securise</div>
                  <div className="text-sm text-gray-400">
                    Aucune modification de vos systemes de production. Les tests sont executes dans un environnement isole.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Confidentialite Garantie</div>
                  <div className="text-sm text-gray-400">
                    Vos donnees et configurations restent privees. Aucune information n'est partagee avec des tiers.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Conformite Reglementaire</div>
                  <div className="text-sm text-gray-400">
                    Les tests respectent les meilleures pratiques de securite et les normes OWASP.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Confirmations */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Confirmations Requises</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.acceptedWarnings || false}
                  onChange={(e) => setConfig({ ...config, acceptedWarnings: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-cyan-500"
                />
                <span className="text-gray-300">
                  J'ai lu et compris les avertissements et estimations ci-dessus
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.userConfirmed || false}
                  onChange={(e) => setConfig({ ...config, userConfirmed: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-cyan-500"
                />
                <span className="text-gray-300">
                  Je confirme vouloir lancer les tests de securite avec cette configuration
                </span>
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Execution */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {!isExecuting && !testRunId && !executionError && (
            <Card className="bg-gradient-to-r from-cyan-900/20 to-green-900/20 border-cyan-500/30">
              <h3 className="text-lg font-bold text-white mb-4">Pret a Lancer les Tests</h3>
              {preview && (
                <div className="space-y-4">
                  <div className="bg-gray-700/50 p-4 rounded">
                    <h4 className="font-bold text-white mb-2">Recapitulatif :</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>- <strong>Cible:</strong> {preview.targetDescription}</li>
                      <li>- <strong>Tests:</strong> {estimation?.numberOfTests} tests sur {preview.plugins.length} plugins</li>
                      <li>- <strong>Duree estimee:</strong> ~{estimation?.estimatedDurationMinutes} minutes</li>
                      <li>- <strong>Cout estime:</strong> ${estimation?.estimatedCost.toFixed(2)} USD</li>
                    </ul>
                  </div>

                  {dryRunResult && !dryRunResult.success && (
                    <Card className="bg-red-900/20 border-red-500/30">
                      <h4 className="font-bold text-red-400 mb-2">Erreurs de Validation:</h4>
                      <ul className="space-y-1">
                        {dryRunResult.errors.map((err, i) => (
                          <li key={i} className="text-sm text-red-300">- {err}</li>
                        ))}
                      </ul>
                    </Card>
                  )}
                </div>
              )}
            </Card>
          )}

          {isExecuting && (
            <Card>
              <div className="text-center py-8">
                <Loader size={48} className="animate-spin text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Lancement des tests...</h3>
                <p className="text-gray-400">Connexion au backend et initialisation</p>
              </div>
            </Card>
          )}

          {testRunId && (
            <Card className="bg-green-900/20 border-green-500/30">
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Tests Lances avec Succes !</h3>
                <p className="text-gray-400 mb-4">Test Run ID: {testRunId}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setActiveNav('promptfoo-execution')}>
                    Suivre la Progression
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveNav('test-results')}>
                    Voir les Resultats
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {executionError && (
            <Card className="bg-red-900/20 border-red-500/30">
              <div className="py-8 px-6">
                <div className="flex items-start gap-4 mb-4">
                  <AlertCircle size={48} className="text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">Erreur lors de l'Execution</h3>
                    <div className="text-red-300 text-left whitespace-pre-line mb-4 bg-red-950/30 p-4 rounded border border-red-500/20">
                      {executionError}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleExecute}>
                    Reessayer
                  </Button>
                  <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                    Modifier la Configuration
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveNav('promptfoo-config')}>
                    Mode Expert
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="secondary" onClick={handleBack} disabled={isExecuting}>
                <ChevronLeft size={16} className="mr-2" />
                Retour
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Step indicator text */}
            <span className="text-sm text-gray-500">
              Etape {currentStep} sur 3
            </span>
            <div className="flex gap-2">
              {currentStep < 3 && (
                <Button
                  onClick={handleNext}
                  disabled={isLoadingEstimation || isLoadingPreview || (currentStep === 1 && !isStep1Valid)}
                >
                  {isLoadingEstimation || isLoadingPreview ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      Continuer
                      <ChevronRight size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              )}
              {currentStep === 3 && !testRunId && !isExecuting && (
                <Button onClick={handleExecute} className="px-8">
                  <Play size={16} className="mr-2" />
                  Lancer les Tests
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PromptfooWizard;
