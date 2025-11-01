import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { GuardrailCategory, TestTarget, Sensitivity, PromptComplexity, VulnerabilityLevel, SandboxVulnerabilityConfig } from '../types';
import { GUARDRAIL_CATEGORIES, INITIAL_TEST_TARGETS } from '../constants';
import { useTestRun } from '../contexts/TestRunContext';
import { useApplicationProfile } from '../contexts/ApplicationProfileContext';
import TestTargetConfigurationModal from './TestTargetConfigurationModal';
import AdvancedTestConfiguration from './AdvancedTestConfiguration';
import { Settings, PlusCircle, SlidersHorizontal, ListChecks, Pencil, Check, ShieldAlert, ShieldCheck, Shield, Sliders, Info, X } from 'lucide-react';

const COMPLEXITY_OPTIONS: PromptComplexity[] = [PromptComplexity.SIMPLE, PromptComplexity.MOYEN, PromptComplexity.SOPHISTIQUE];
const VULNERABILITY_LEVELS: {level: VulnerabilityLevel, icon: React.ReactNode, label: string}[] = [
    { level: 'Simple', icon: <ShieldCheck size={16} className="mr-2 text-green-400"/>, label: 'Robuste (Vulnérabilités simples)' },
    { level: 'Moyenne', icon: <Shield size={16} className="mr-2 text-yellow-400"/>, label: 'Moyen (Vulnérabilités moyennes)' },
    { level: 'Complexe', icon: <ShieldAlert size={16} className="mr-2 text-red-400"/>, label: 'Faible (Vulnérabilités complexes)' },
];

interface TestConfigurationProps {
  onCancel: () => void;
}

const TestConfiguration: React.FC<TestConfigurationProps> = ({ onCancel }) => {
  const [selectedCategories, setSelectedCategories] = useState<GuardrailCategory[]>([]);
  const [categorySensitivities, setCategorySensitivities] = useState<Record<GuardrailCategory, Sensitivity>>(
    Object.fromEntries(GUARDRAIL_CATEGORIES.map(c => [c.name, 'Normal'])) as Record<GuardrailCategory, Sensitivity>
  );
  const [complexities, setComplexities] = useState<PromptComplexity[]>([PromptComplexity.SIMPLE, PromptComplexity.MOYEN]);
  const [volume, setVolume] = useState<number>(100);
  const [targets, setTargets] = useState<TestTarget[]>(INITIAL_TEST_TARGETS);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(targets.length > 0 ? targets[0].id : '');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TestTarget | null>(null);
  const [sandboxConfig, setSandboxConfig] = useState<SandboxVulnerabilityConfig>({});

  // Advanced Configuration
  const [isAdvancedConfigOpen, setIsAdvancedConfigOpen] = useState(false);
  const [customPlugins, setCustomPlugins] = useState<string[]>([]);

  const { startTest, isRunning, testMode, setTestMode } = useTestRun();
  const { selectedApplicationId, getApplication, setSelectedApplicationId } = useApplicationProfile();

  const isSandboxMode = selectedTargetId === 'embedded-sandbox';

  // Récupérer l'application sélectionnée si elle existe
  const selectedApp = selectedApplicationId ? getApplication(selectedApplicationId) : null;
  const [showAppBanner, setShowAppBanner] = useState(!!selectedApp);

  useEffect(() => {
    // Initialize sandbox config for selected categories
    const initialConfig: SandboxVulnerabilityConfig = {};
    selectedCategories.forEach(cat => {
      initialConfig[cat] = sandboxConfig[cat] || 'Moyenne';
    });
    setSandboxConfig(initialConfig);
  }, [selectedCategories]);

  // Auto-créer une cible de test quand une application est sélectionnée
  useEffect(() => {
    if (selectedApp && !targets.find(t => t.id === `app-${selectedApp.id}`)) {
      const newTarget: TestTarget = {
        id: `app-${selectedApp.id}`,
        name: selectedApp.name,
        endpoint: selectedApp.endpoint.url,
        method: selectedApp.endpoint.method || 'POST',
        headers: selectedApp.authentication?.credentials
          ? {
              'Authorization': selectedApp.authentication.type === 'bearer-token'
                ? `Bearer ${selectedApp.authentication.credentials.token}`
                : selectedApp.authentication.type === 'api-key'
                ? selectedApp.authentication.credentials.apiKey || ''
                : ''
            }
          : {},
        description: `Application: ${selectedApp.description || 'Aucune description'}`
      };

      setTargets(prev => [...prev, newTarget]);
      setSelectedTargetId(newTarget.id);
      setShowAppBanner(true);
    }
  }, [selectedApp]);


  const handleCategoryChange = (category: GuardrailCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleComplexityChange = (complexity: PromptComplexity) => {
    setComplexities(prev =>
        prev.includes(complexity)
        ? prev.filter(c => c !== complexity)
        : [...prev, complexity]
    );
  }

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === GUARDRAIL_CATEGORIES.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(GUARDRAIL_CATEGORIES.map(c => c.name));
    }
  };
  
  const handleOpenModal = (target: TestTarget | null) => {
    if (target?.id === 'embedded-sandbox') return; // Cannot edit sandbox
    setEditingTarget(target);
    setIsModalOpen(true);
  };

  const handleSaveTarget = (target: TestTarget) => {
    setTargets(prev => {
        const index = prev.findIndex(t => t.id === target.id);
        if (index > -1) {
            const newTargets = [...prev];
            newTargets[index] = target;
            return newTargets;
        }
        return [...prev, target];
    });
    if (!selectedTargetId) {
        setSelectedTargetId(target.id);
    }
  };
  
  const handleDeleteTarget = (targetId: string) => {
    if (targetId === 'embedded-sandbox') return; // Cannot delete sandbox
    const newTargets = targets.filter(t => t.id !== targetId);
    setTargets(newTargets);
    if (selectedTargetId === targetId) {
        setSelectedTargetId(newTargets.length > 0 ? newTargets[0].id : '');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTarget = targets.find(t => t.id === selectedTargetId);
    if (selectedCategories.length > 0 && selectedTarget && complexities.length > 0) {
      startTest({
        categories: selectedCategories,
        target: selectedTarget,
        volume,
        categorySensitivities,
        complexities,
        sandboxConfig: isSandboxMode ? sandboxConfig : undefined,
        customPlugins: customPlugins.length > 0 ? customPlugins : undefined,
      });
    }
  };
  
  const isSubmitDisabled = selectedCategories.length === 0 || !selectedTargetId || isRunning || complexities.length === 0;

  const renderCategoryCheckbox = (cat: {name: GuardrailCategory}) => (
    <div key={cat.name} className="p-2 rounded-md transition-all duration-200">
        <label className="flex items-center cursor-pointer">
            <input
            type="checkbox"
            className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-600 focus:ring-cyan-500"
            checked={selectedCategories.includes(cat.name)}
            onChange={() => handleCategoryChange(cat.name)}
            />
            <span className="ml-3 text-white">{cat.name}</span>
        </label>
    </div>
  );

  const handleCloseBanner = () => {
    setShowAppBanner(false);
    setSelectedApplicationId(null);
  };

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-white mb-6">Configurer un Nouveau Test</h2>

          {/* Bannière Application Sélectionnée */}
          {showAppBanner && selectedApp && (
            <div className="mb-6 p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Info size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-white font-bold mb-1">
                      Test configuré pour : {selectedApp.name}
                    </h3>
                    <p className="text-sm text-gray-300 mb-2">
                      {selectedApp.description || 'Aucune description'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Architecture :</span>{' '}
                        <span className="text-white">{selectedApp.architecture}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Mode :</span>{' '}
                        <span className="text-white">{selectedApp.testMode === 'blackbox' ? 'Blackbox' : 'Whitebox'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">URL :</span>{' '}
                        <span className="text-white font-mono text-xs truncate">{selectedApp.endpoint.url}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Rate Limit :</span>{' '}
                        <span className="text-white">{selectedApp.safetyConfig.maxRequestsPerMinute || 10} req/min</span>
                      </div>
                    </div>
                    <p className="text-xs text-cyan-400 mt-2">
                      ✅ Une cible de test a été créée automatiquement avec ces paramètres
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseBanner}
                  className="text-gray-400 hover:text-white ml-2"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center"><ListChecks className="mr-3 text-cyan-500" />Catégories à Tester</h3>
                    <button type="button" onClick={handleSelectAllCategories} className="text-sm text-cyan-500 hover:underline">
                    {selectedCategories.length === GUARDRAIL_CATEGORIES.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    <div className="space-y-2">
                        {GUARDRAIL_CATEGORIES.filter((_, i) => i % 2 === 0).map(renderCategoryCheckbox)}
                    </div>
                    <div className="space-y-2">
                        {GUARDRAIL_CATEGORIES.filter((_, i) => i % 2 !== 0).map(renderCategoryCheckbox)}
                    </div>
                </div>
            </section>

             <section>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><SlidersHorizontal className="mr-3 text-cyan-500" />Configuration du Jeu de Données</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <label className="block text-md font-medium text-gray-300 mb-3">Complexité des Attaques</label>
                        <div className="flex flex-wrap gap-3">
                            {COMPLEXITY_OPTIONS.map(comp => {
                                const isSelected = complexities.includes(comp);
                                return (
                                    <button
                                        type="button"
                                        key={comp}
                                        onClick={() => handleComplexityChange(comp)}
                                        className={`flex items-center justify-center px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200 border-2 text-sm ${
                                            isSelected
                                                ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                                        }`}
                                    >
                                        {isSelected && <Check size={16} className="mr-2" />}
                                        {comp}
                                    </button>
                                );
                            })}
                        </div>
                         {complexities.length === 0 && <p className="text-sm text-yellow-400 mt-2">Veuillez sélectionner au moins une complexité.</p>}
                    </div>
                     <div>
                        <label htmlFor="volume" className="block text-md font-medium text-gray-300 mb-3">Volume de Prompts ({volume})</label>
                        <input
                        id="volume"
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>
                </div>
             </section>

            {/* 🆕 MODE D'EXÉCUTION */}
            <section>
                <h3 className="text-lg font-semibold text-white mb-4">Mode d'Exécution</h3>
                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-colors">
                    <input
                      type="radio"
                      name="testMode"
                      value="simulation"
                      checked={testMode === 'simulation'}
                      onChange={() => setTestMode('simulation')}
                      className="mt-1 form-radio text-cyan-500 focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">Simulation (Rapide)</div>
                      <p className="text-sm text-gray-400 mt-1">
                        Tests simulés sans appels API réels. Résultats probabilistes basés sur des heuristiques.
                        Idéal pour développement et tests UI.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-colors">
                    <input
                      type="radio"
                      name="testMode"
                      value="real"
                      checked={testMode === 'real'}
                      onChange={() => setTestMode('real')}
                      className="mt-1 form-radio text-cyan-500 focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">Tests Réels avec Promptfoo 🚀</div>
                      <p className="text-sm text-gray-400 mt-1">
                        Exécution via Promptfoo avec vrais appels LLM (Gemini, GPT-4o). Résultats authentiques.
                        Requiert une clé API configurée dans <code className="text-cyan-400">.env</code>.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-colors">
                    <input
                      type="radio"
                      name="testMode"
                      value="backend"
                      checked={testMode === 'backend'}
                      onChange={() => setTestMode('backend')}
                      className="mt-1 form-radio text-cyan-500 focus:ring-cyan-500"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">Backend API avec Temps Réel 🌐</div>
                      <p className="text-sm text-gray-400 mt-1">
                        Exécution via backend NestJS avec persistance PostgreSQL, authentification multi-utilisateurs et mises à jour WebSocket en temps réel.
                        Requiert backend démarré sur <code className="text-cyan-400">http://localhost:3000</code>.
                      </p>
                    </div>
                  </label>

                  {testMode === 'real' && (
                    <>
                      <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
                        <p className="text-yellow-300 text-sm font-medium mb-2">
                          ⚠️ Attention: Tests réels
                        </p>
                        <ul className="text-yellow-300 text-sm space-y-1 list-disc list-inside">
                          <li>Consommation de crédits API ({volume} tests × 2 providers ≈ {volume * 2} appels)</li>
                          <li>Durée estimée: ~{Math.ceil(volume / 10)} minutes</li>
                          <li>Configuration: <code className="text-xs bg-yellow-900/30 px-1 py-0.5 rounded">guardrail/solution_promptfoo/ai-risk-guardrails-tests/.env</code></li>
                        </ul>
                      </div>

                      <div className="bg-purple-500/10 border border-purple-500/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-purple-300 text-sm font-medium mb-1">
                              🎛️ Configuration Avancée des Plugins
                            </p>
                            <p className="text-purple-300 text-xs">
                              {customPlugins.length > 0
                                ? `${customPlugins.length} plugin(s) personnalisés sélectionnés`
                                : 'Utilisation du mapping automatique catégorie → plugins'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAdvancedConfigOpen(true)}
                            className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors text-sm font-medium"
                          >
                            <Sliders size={16} className="mr-2" />
                            Configurer
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Pencil className="mr-3 text-cyan-500" />Système d'IA à Tester</h3>
                 <div className="flex items-center space-x-2">
                    <select
                        id="target"
                        value={selectedTargetId}
                        onChange={(e) => setSelectedTargetId(e.target.value)}
                        className="w-full bg-gray-700 border-gray-600 rounded-md p-2.5 text-white focus:ring-cyan-500 focus:border-cyan-500"
                        disabled={targets.length === 0}
                    >
                        {targets.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <Button type="button" variant="secondary" onClick={() => handleOpenModal(targets.find(t => t.id === selectedTargetId) || null)} disabled={!selectedTargetId || isSandboxMode} aria-label="Configurer la cible" className="p-2.5">
                        <Settings size={20} />
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => handleOpenModal(null)} aria-label="Nouvelle cible" className="p-2.5">
                        <PlusCircle size={20} />
                    </Button>
                </div>
                 {targets.length === 0 && <p className="text-sm text-yellow-400 mt-2">Aucune cible définie. Veuillez en créer une.</p>}
            </section>

            {isSandboxMode && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><ShieldAlert className="mr-3 text-cyan-500" />Configurer les Vulnérabilités du Bac à Sable</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
                  {selectedCategories.length > 0 ? selectedCategories.map(cat => (
                    <div key={cat} className="grid grid-cols-3 items-center gap-4">
                      <label className="text-gray-300 col-span-1">{cat}</label>
                      <select
                        value={sandboxConfig[cat] || 'Moyenne'}
                        onChange={(e) => setSandboxConfig(prev => ({ ...prev, [cat]: e.target.value as VulnerabilityLevel }))}
                        className="col-span-2 bg-gray-800 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                      >
                        {VULNERABILITY_LEVELS.map(opt => (
                          <option key={opt.level} value={opt.level}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )) : (
                    <p className="text-gray-400 text-center">Veuillez d'abord sélectionner des catégories à tester pour configurer leurs vulnérabilités.</p>
                  )}
                </div>
              </section>
            )}

          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 flex justify-between items-center">
            <Button type="submit" disabled={isSubmitDisabled} isLoading={isRunning} className="px-6 py-2.5">
              {testMode === 'real' ? '🚀 Lancer Tests Réels' : testMode === 'backend' ? '🌐 Lancer Tests Backend' : 'Lancer le Test'}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </Card>
      {isModalOpen && (
          <TestTargetConfigurationModal
            target={editingTarget}
            onSave={handleSaveTarget}
            onClose={() => setIsModalOpen(false)}
            onDelete={handleDeleteTarget}
          />
      )}

      <AdvancedTestConfiguration
        isOpen={isAdvancedConfigOpen}
        onClose={() => setIsAdvancedConfigOpen(false)}
        selectedPlugins={customPlugins}
        onPluginsChange={setCustomPlugins}
      />
    </>
  );
};

export default TestConfiguration;