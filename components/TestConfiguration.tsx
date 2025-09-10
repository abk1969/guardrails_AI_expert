
import React, { useState, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { GuardrailCategory, LLMProvider, LLM_MODELS } from '../types';
import { GUARDRAIL_CATEGORIES } from '../constants';
import { useTestRun } from '../contexts/TestRunContext';

const TestConfiguration: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<GuardrailCategory[]>([]);
  const [provider, setProvider] = useState<LLMProvider>(LLMProvider.AZURE_OPENAI);
  const [model, setModel] = useState<string>(LLM_MODELS[LLMProvider.AZURE_OPENAI][0]);
  const [volume, setVolume] = useState<number>(100);

  const { startTest, isRunning, isFinished, resetTest } = useTestRun();

  useEffect(() => {
    setModel(LLM_MODELS[provider][0]);
  }, [provider]);

  const handleCategoryChange = (category: GuardrailCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === GUARDRAIL_CATEGORIES.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(GUARDRAIL_CATEGORIES.map(c => c.name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length > 0) {
      startTest({
        categories: selectedCategories,
        provider,
        model,
        volume,
        intensity: 50 // Placeholder
      });
    }
  };

  if (isRunning || isFinished) {
      return (
          <Card>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Test en Cours</h2>
                <Button onClick={resetTest} variant="secondary">Lancer un Nouveau Test</Button>
              </div>
          </Card>
      );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold text-white mb-6">Configurer un Nouveau Test</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Guardrail Categories */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-lg font-semibold text-gray-300">Catégories de Guardrails</label>
              <button type="button" onClick={handleSelectAll} className="text-sm text-cyan-500 hover:underline">
                {selectedCategories.length === GUARDRAIL_CATEGORIES.length ? 'Désélectionner tout' : 'Sélectionner tout'}
              </button>
            </div>
            <div className="space-y-3">
              {GUARDRAIL_CATEGORIES.map(cat => (
                <label key={cat.name} className="flex items-center p-3 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 transition-colors">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => handleCategoryChange(cat.name)}
                  />
                  <span className="ml-3 text-white">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Test Parameters */}
          <div className="space-y-6">
            <div>
              <label htmlFor="provider" className="block text-lg font-semibold text-gray-300 mb-2">Fournisseur LLM</label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value as LLMProvider)}
                className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              >
                {Object.values(LLMProvider).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            
            <div>
              <label htmlFor="model" className="block text-lg font-semibold text-gray-300 mb-2">Modèle</label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
              >
                {LLM_MODELS[provider].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="volume" className="block text-lg font-semibold text-gray-300 mb-2">Volume de Prompts ({volume})</label>
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
        </div>

        <div className="mt-8 text-right">
          <Button type="submit" disabled={selectedCategories.length === 0 || isRunning} isLoading={isRunning}>
            Lancer le Test
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TestConfiguration;
