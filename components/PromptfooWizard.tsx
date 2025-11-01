import React, { useState, useEffect } from 'react';
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
  Square
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

/**
 * Assistant Guidé Promptfoo - Mode Débutant
 *
 * Flux simplifié en 3 étapes pour les utilisateurs novices :
 * 1. Configuration simple (questions claires)
 * 2. Validation et prévisualisation (garde-fous de sécurité)
 * 3. Exécution automatique
 */
const PromptfooWizard: React.FC = () => {
  const { setActiveNav } = useNavigation();

  // État du wizard
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [config, setConfig] = useState<Partial<PromptfooWizardConfig>>({
    targetPreset: 'gemini-flash',
    testDepth: 'standard',
    selectedRiskCategories: ['prompt-injection', 'jailbreak', 'pii'],
    userConfirmed: false,
    acceptedWarnings: false
  });

  // États de chargement
  const [isLoadingEstimation, setIsLoadingEstimation] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Données calculées
  const [estimation, setEstimation] = useState<PromptfooEstimation | null>(null);
  const [preview, setPreview] = useState<PromptfooPreview | null>(null);
  const [dryRunResult, setDryRunResult] = useState<PromptfooDryRunResult | null>(null);

  // État d'exécution
  const [testRunId, setTestRunId] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Charger l'estimation automatiquement quand la config change
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

  const handleNext = async () => {
    if (currentStep === 1) {
      // Valider étape 1
      if (!config.targetPreset || !config.testDepth || !config.selectedRiskCategories || config.selectedRiskCategories.length === 0) {
        alert('Veuillez remplir tous les champs requis');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Valider étape 2 et faire dry-run
      if (!config.acceptedWarnings || !config.userConfirmed) {
        alert('Veuillez accepter les conditions avant de continuer');
        return;
      }

      const dryRunSuccess = await executeDryRun();
      if (!dryRunSuccess && dryRunResult) {
        alert(`Validation échouée:\n${dryRunResult.errors.join('\n')}`);
        return;
      }

      await loadPreview();
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionError(null);

    try {
      // Vérifier si le backend est disponible
      const backendAvailable = await promptfooAutomationService.checkBackendAvailability();

      if (!backendAvailable) {
        setExecutionError(
          'Le backend n\'est pas disponible. ' +
          'Pour exécuter des tests réels, démarrez le backend avec Docker:\n\n' +
          'docker-compose up -d\n\n' +
          'Ou utilisez le mode "simulation" dans Configuration (Expert).'
        );
        setIsExecuting(false);
        return;
      }

      const result = await promptfooAutomationService.executeReal(config as PromptfooWizardConfig);

      if (result.success && result.testRunId) {
        setTestRunId(result.testRunId);
        // Sauvegarder pour la page de résultats
        localStorage.setItem('promptfoo_last_test_run_id', result.testRunId);
        localStorage.setItem('promptfoo-wizard-config', JSON.stringify(config));

        // Rediriger vers la page d'exécution après 2 secondes
        setTimeout(() => {
          setActiveNav('promptfoo-execution');
        }, 2000);
      } else {
        setExecutionError(result.error || 'Erreur inconnue lors du lancement des tests');
      }
    } catch (error) {
      setExecutionError(
        'Erreur lors de l\'exécution:\n' +
        (error instanceof Error ? error.message : 'Erreur inconnue') +
        '\n\nVeuillez vérifier que le backend est démarré avec Docker.'
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
                Assistant Guidé Promptfoo - Mode Débutant
              </h2>
              <p className="text-gray-300">
                Configuration simplifiée en 3 étapes pour lancer des tests de sécurité sans risque
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

      {/* Progress Indicator */}
      <Card className="bg-gray-700/30">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step
                  ? 'bg-cyan-500 border-cyan-400 text-white'
                  : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}>
                {currentStep > step ? <CheckCircle2 size={20} /> : step}
              </div>
              <div className="flex-1 mx-2">
                <div className={`text-sm font-bold ${
                  currentStep >= step ? 'text-white' : 'text-gray-500'
                }`}>
                  {step === 1 && 'Configuration'}
                  {step === 2 && 'Validation'}
                  {step === 3 && 'Exécution'}
                </div>
              </div>
              {step < 3 && (
                <ChevronRight className={`${
                  currentStep > step ? 'text-cyan-400' : 'text-gray-600'
                }`} size={20} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Étape 1: Configuration Simple */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Sélection de la cible */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-cyan-400" />
              1. Quel système IA voulez-vous tester ?
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
                  URL de votre endpoint personnalisé
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

          {/* Sélection de la profondeur */}
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
                    {depth.numberOfTests} tests • ~{depth.durationMinutes} min
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Sélection des catégories de risques */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-cyan-400" />
              3. Quelles catégories de risques tester ?
            </h3>
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
        </div>
      )}

      {/* Étape 2: Validation et Prévisualisation */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Estimation */}
          <Card className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
            <h3 className="text-lg font-bold text-white mb-4">Estimation</h3>
            {isLoadingEstimation ? (
              <div className="flex items-center justify-center py-8">
                <Loader size={24} className="animate-spin text-cyan-400" />
              </div>
            ) : estimation ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 p-4 rounded text-center">
                  <div className="text-3xl font-bold text-cyan-400">{estimation.numberOfTests}</div>
                  <div className="text-sm text-gray-400 mt-1">Tests</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded text-center">
                  <div className="text-3xl font-bold text-green-400">~{estimation.estimatedDurationMinutes}</div>
                  <div className="text-sm text-gray-400 mt-1">Minutes</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded text-center">
                  <div className="text-3xl font-bold text-yellow-400">${estimation.estimatedCost.toFixed(2)}</div>
                  <div className="text-sm text-gray-400 mt-1">Coût (USD)</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded text-center">
                  <div className="text-3xl font-bold text-purple-400">{estimation.apiCallsEstimated}</div>
                  <div className="text-sm text-gray-400 mt-1">Appels API</div>
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
                  <li key={i} className="text-sm text-yellow-300">• {warning}</li>
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

          {/* Garde-fous de Sécurité */}
          <Card className="bg-green-900/20 border-green-500/30">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-green-400" />
              Garde-fous de Sécurité
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Mode Simulation Sécurisé</div>
                  <div className="text-sm text-gray-400">
                    Aucune modification de vos systèmes de production. Les tests sont exécutés dans un environnement isolé.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Confidentialité Garantie</div>
                  <div className="text-sm text-gray-400">
                    Vos données et configurations restent privées. Aucune information n'est partagée avec des tiers.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Conformité Réglementaire</div>
                  <div className="text-sm text-gray-400">
                    Les tests respectent les meilleures pratiques de sécurité et les normes OWASP.
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
                  className="mt-1"
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
                  className="mt-1"
                />
                <span className="text-gray-300">
                  Je confirme vouloir lancer les tests de sécurité avec cette configuration
                </span>
              </label>
            </div>
          </Card>
        </div>
      )}

      {/* Étape 3: Exécution */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {!isExecuting && !testRunId && !executionError && (
            <Card className="bg-gradient-to-r from-cyan-900/20 to-green-900/20 border-cyan-500/30">
              <h3 className="text-lg font-bold text-white mb-4">Prêt à Lancer les Tests</h3>
              {preview && (
                <div className="space-y-4">
                  <div className="bg-gray-700/50 p-4 rounded">
                    <h4 className="font-bold text-white mb-2">Récapitulatif :</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• <strong>Cible:</strong> {preview.targetDescription}</li>
                      <li>• <strong>Tests:</strong> {estimation?.numberOfTests} tests sur {preview.plugins.length} plugins</li>
                      <li>• <strong>Durée estimée:</strong> ~{estimation?.estimatedDurationMinutes} minutes</li>
                      <li>• <strong>Coût estimé:</strong> ${estimation?.estimatedCost.toFixed(2)} USD</li>
                    </ul>
                  </div>

                  {dryRunResult && !dryRunResult.success && (
                    <Card className="bg-red-900/20 border-red-500/30">
                      <h4 className="font-bold text-red-400 mb-2">Erreurs de Validation:</h4>
                      <ul className="space-y-1">
                        {dryRunResult.errors.map((err, i) => (
                          <li key={i} className="text-sm text-red-300">• {err}</li>
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
                <h3 className="text-xl font-bold text-white mb-2">Tests Lancés avec Succès !</h3>
                <p className="text-gray-400 mb-4">Test Run ID: {testRunId}</p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setActiveNav('promptfoo-execution')}>
                    Suivre la Progression
                  </Button>
                  <Button variant="secondary" onClick={() => setActiveNav('test-results')}>
                    Voir les Résultats
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
                    <h3 className="text-xl font-bold text-white mb-3">Erreur lors de l'Exécution</h3>
                    <div className="text-red-300 text-left whitespace-pre-line mb-4 bg-red-950/30 p-4 rounded border border-red-500/20">
                      {executionError}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleExecute}>
                    Réessayer
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
          <div className="flex gap-2">
            {currentStep < 3 && (
              <Button onClick={handleNext} disabled={isLoadingEstimation || isLoadingPreview}>
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
      </Card>

      {/* Info Footer */}
      <Card className="bg-gray-700/20 border-gray-600">
        <p className="text-sm text-gray-400 text-center">
          💡 <strong>Besoin d'aide ?</strong> Consultez la{' '}
          <a href="#" className="text-cyan-400 hover:underline">documentation</a> ou{' '}
          <button onClick={() => setActiveNav('promptfoo-config')} className="text-cyan-400 hover:underline">
            passez en mode expert
          </button> pour plus d'options.
        </p>
      </Card>
    </div>
  );
};

export default PromptfooWizard;
