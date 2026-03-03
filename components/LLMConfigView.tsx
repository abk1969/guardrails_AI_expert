import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, XCircle, AlertTriangle, Loader2, Save, Info } from 'lucide-react';
import Card from './ui/Card';
import { useLLMConfig } from '../contexts/LLMConfigContext';
import { LLM_PROVIDERS, getProviderInfo } from '../constants/llmProviders';
import { backendStatus } from '../services/backendStatus';
import type { LLMConfiguration } from '../types';

const LLMConfigView: React.FC = () => {
  const { config: savedConfig, setConfig, testConnection, loading } = useLLMConfig();

  const [formData, setFormData] = useState<LLMConfiguration>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-3-flash-preview',
    temperature: 0.7,
    maxTokens: 4096,
  });

  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const [isSaving, setIsSaving] = useState(false);

  // Load saved config on mount
  useEffect(() => {
    if (savedConfig) {
      setFormData(savedConfig);
    }
  }, [savedConfig]);

  const selectedProvider = getProviderInfo(formData.provider);

  const handleProviderChange = (providerId: string) => {
    const provider = getProviderInfo(providerId);
    if (provider) {
      setFormData({
        ...formData,
        provider: providerId as any,
        model: provider.models[0]?.id || '',
        baseUrl: provider.defaultBaseUrl,
        apiKey: provider.requiresApiKey ? formData.apiKey : undefined,
      });
      setTestResult({ status: 'idle', message: '' });
    }
  };

  const handleTestConnection = async () => {
    if (!formData.apiKey && selectedProvider?.requiresApiKey) {
      setTestResult({
        status: 'error',
        message: 'Clé API manquante',
      });
      return;
    }

    // Temporarily save config for testing
    setConfig(formData);

    const result = await testConnection();

    setTestResult({
      status: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setConfig(formData);
    setTimeout(() => {
      setIsSaving(false);
      setTestResult({
        status: 'success',
        message: 'Configuration sauvegardée avec succès',
      });
    }, 500);
  };

  const isConfigIncomplete =
    !formData.provider ||
    !formData.model ||
    (selectedProvider?.requiresApiKey && !formData.apiKey);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          Configuration LLM
        </h1>
        <p className="text-gray-400 mt-2">
          Configuration des modèles de langage et paramètres de l'application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-white mb-4">Configuration LLM</h2>

            {/* Provider Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fournisseur LLM
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {LLM_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderChange(provider.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.provider === provider.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-semibold text-white">{provider.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {provider.description}
                        </div>
                        {provider.isLocal && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                            Local
                          </span>
                        )}
                        {provider.id === 'groq' && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                            GRATUIT
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              {selectedProvider?.requiresApiKey && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Clé API {selectedProvider.name} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey || ''}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder={`Entrez votre clé API ${selectedProvider.name}`}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                  {selectedProvider.id === 'gemini' && (
                    <p className="text-xs text-gray-400 mt-1">
                      Obtenez votre clé API sur{' '}
                      <a
                        href="https://ai.google.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  )}
                  {selectedProvider.id === 'groq' && (
                    <p className="text-xs text-green-400 mt-1">
                      API Groq est GRATUITE avec limite généreuse.{' '}
                      <a
                        href="https://console.groq.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:underline"
                      >
                        Créer un compte
                      </a>
                    </p>
                  )}
                </div>
              )}

              {/* Base URL (for local models) */}
              {selectedProvider?.isLocal && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL de base
                  </label>
                  <input
                    type="text"
                    value={formData.baseUrl || selectedProvider.defaultBaseUrl || ''}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                  />
                </div>
              )}

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modèle <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-400"
                >
                  {selectedProvider?.models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                      {model.recommended ? ' (Recommandé)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Advanced Parameters */}
          <Card>
            <h3 className="text-lg font-bold text-white mb-4">Paramètres Avancés</h3>

            <div className="space-y-4">
              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Température: {formData.temperature?.toFixed(2) || '0.70'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature || 0.7}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: parseFloat(e.target.value) })
                  }
                  className="w-full accent-purple-400"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Déterministe (0.0)</span>
                  <span>Créatif (2.0)</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Tokens: {formData.maxTokens || 4096}
                </label>
                <input
                  type="range"
                  min="512"
                  max="32768"
                  step="512"
                  value={formData.maxTokens || 4096}
                  onChange={(e) =>
                    setFormData({ ...formData, maxTokens: parseInt(e.target.value) })
                  }
                  className="w-full accent-purple-400"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Test & Save Panel */}
        <div className="space-y-6">
          {/* Test Result */}
          {testResult.status !== 'idle' && (
            <Card>
              <div className="flex items-start gap-3">
                {testResult.status === 'success' && (
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                )}
                {testResult.status === 'error' && (
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3
                    className={`font-semibold ${
                      testResult.status === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {testResult.status === 'success'
                      ? 'Connexion réussie'
                      : 'Échec de connexion'}
                  </h3>
                  <p className="text-gray-300 text-sm mt-1">{testResult.message}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Warning */}
          {isConfigIncomplete && (
            <Card>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-400">Configuration incomplète</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    {selectedProvider?.requiresApiKey && !formData.apiKey && 'Clé API manquante'}
                    {!formData.model && 'Modèle non sélectionné'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <div className="space-y-3">
              {!backendStatus.isAvailable() && (
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300">
                    Backend Docker non disponible. Le test de connexion necessite le backend en cours d'execution.
                    La configuration peut etre sauvegardee localement.
                  </p>
                </div>
              )}
              <button
                onClick={handleTestConnection}
                disabled={loading || isConfigIncomplete}
                className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Tester la connexion
                  </>
                )}
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving || isConfigIncomplete}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* Info */}
          <Card>
            <h3 className="text-sm font-semibold text-white mb-3">
              Cette configuration sera utilisée pour:
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Garak Scanner (Tests Vulnérabilités LLM)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Garak (Scanner de vulnérabilités LLM)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Promptfoo (Framework de tests)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Chatbot de l'application
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LLMConfigView;
