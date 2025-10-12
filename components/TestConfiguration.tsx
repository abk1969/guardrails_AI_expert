import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { GuardrailCategory, TestTarget, Sensitivity, PromptComplexity, DefenseLevel, SandboxDefenseConfig, AIComponentType } from '../types';
import { GUARDRAIL_CATEGORIES, INITIAL_TEST_TARGETS } from '../constants';
import { useTestRun } from '../contexts/TestRunContext';
import TestTargetConfigurationModal from './TestTargetConfigurationModal';
import { Settings, PlusCircle, SlidersHorizontal, ListChecks, Check, ShieldAlert, ShieldCheck, Shield, Target } from 'lucide-react';

const COMPLEXITY_OPTIONS: PromptComplexity[] = [PromptComplexity.SIMPLE, PromptComplexity.MOYEN, PromptComplexity.SOPHISTIQUE];
const DEFENSE_LEVELS: {level: DefenseLevel, icon: React.ReactNode, label: string}[] = [
    { level: 'Faible', icon: <ShieldAlert size={16} className="mr-2 text-red-400"/>, label: 'Défense Faible' },
    { level: 'Moyen', icon: <Shield size={16} className="mr-2 text-yellow-400"/>, label: 'Défense Moyenne' },
    { level: 'Robuste', icon: <ShieldCheck size={16} className="mr-2 text-green-400"/>, label: 'Défense Robuste' },
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
  const [sandboxConfig, setSandboxConfig] = useState<SandboxDefenseConfig>({});

  const { startTest, isRunning } = useTestRun();

  const selectedTarget = targets.find(t => t.id === selectedTargetId);
  const isSandboxMode = selectedTarget?.componentType === AIComponentType.SANDBOX;

  useEffect(() => {
    // Initialize sandbox config for selected categories
    const initialConfig: SandboxDefenseConfig = {};
    selectedCategories.forEach(cat => {
      initialConfig[cat] = sandboxConfig[cat] || 'Moyen';
    });
    setSandboxConfig(initialConfig);
  }, [selectedCategories]);


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
    if (!selectedTargetId || !targets.some(t => t.id === selectedTargetId)) {
        setSelectedTargetId(target.id);
    }
  };
  
  const handleDeleteTarget = (targetId: string) => {
    if (targetId === 'embedded-sandbox') return; // Cannot delete default sandbox
    const newTargets = targets.filter(t => t.id !== targetId);
    setTargets(newTargets);
    if (selectedTargetId === targetId) {
        setSelectedTargetId(newTargets.length > 0 ? newTargets[0].id : '');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length > 0 && selectedTarget && complexities.length > 0) {
      startTest({
        categories: selectedCategories,
        target: selectedTarget,
        volume,
        categorySensitivities,
        complexities,
        sandboxConfig: isSandboxMode ? sandboxConfig : undefined,
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

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit}>
          <h2 className="text-xl font-bold text-white mb-6">Configurer un Nouveau Test</h2>
          
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

            <section>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Target className="mr-3 text-cyan-500" />Système d'IA à Tester</h3>
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
                    <Button type="button" variant="secondary" onClick={() => handleOpenModal(selectedTarget || null)} disabled={!selectedTargetId || isSandboxMode} aria-label="Configurer la cible" className="p-2.5">
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
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><ShieldAlert className="mr-3 text-cyan-500" />Configurer le Niveau de Défense du Bac à Sable</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
                  {selectedCategories.length > 0 ? selectedCategories.map(cat => (
                    <div key={cat} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                      <label className="text-gray-300 col-span-1">{cat}</label>
                      <select
                        value={sandboxConfig[cat] || 'Moyen'}
                        onChange={(e) => setSandboxConfig(prev => ({ ...prev, [cat]: e.target.value as DefenseLevel }))}
                        className="col-span-1 md:col-span-2 bg-gray-800 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                      >
                        {DEFENSE_LEVELS.map(opt => (
                          <option key={opt.level} value={opt.level}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )) : (
                    <p className="text-gray-400 text-center">Veuillez d'abord sélectionner des catégories à tester pour configurer leurs niveaux de défense.</p>
                  )}
                </div>
              </section>
            )}

            {selectedTarget && !isSandboxMode && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-4">Détails de la Cible API</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg text-sm">
                    <p className="text-gray-300"><strong className="text-white">Nom :</strong> {selectedTarget.name}</p>
                    <p className="text-gray-300"><strong className="text-white">URL de l'Endpoint :</strong> <span className="font-mono">{selectedTarget.apiUrl}</span></p>
                    <p className="text-xs text-gray-400 mt-3">Cliquez sur l'icône <Settings size={12} className="inline-block mx-1" /> pour modifier cette configuration.</p>
                </div>
              </section>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 flex justify-between items-center">
            <Button type="submit" disabled={isSubmitDisabled} isLoading={isRunning} className="px-6 py-2.5">
              Lancer le Test
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
    </>
  );
};

export default TestConfiguration;