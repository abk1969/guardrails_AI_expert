import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import {
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Server,
  Lock,
  Key,
  Settings,
  Eye,
  EyeOff,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';
import {
  ApplicationProfile,
  ApplicationArchitecture,
  TestMode,
  AuthenticationType,
  InputOutputType,
} from '../types';
import { useApplicationProfile } from '../contexts/ApplicationProfileContext';

interface ApplicationConfigWizardProps {
  isOpen: boolean;
  onClose: () => void;
  editingApp?: ApplicationProfile | null;
}

/**
 * Wizard de Configuration Guidée pour Profils d'Applications
 *
 * MODE GUIDÉ SÉCURISÉ:
 * - Étapes validées une par une
 * - Warnings contextuels selon les choix
 * - Explications détaillées pour chaque champ
 * - Preview final avant sauvegarde
 * - Validation stricte des inputs
 *
 * ÉTAPES:
 * 1. Informations de base (nom, description, propriétaire)
 * 2. Architecture et testabilité
 * 3. Configuration endpoint
 * 4. Authentication (si whitebox)
 * 5. Configuration de sécurité
 * 6. Preview et confirmation
 */
const ApplicationConfigWizard: React.FC<ApplicationConfigWizardProps> = ({
  isOpen,
  onClose,
  editingApp,
}) => {
  const { addApplication, updateApplication } = useApplicationProfile();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form state
  const [formData, setFormData] = useState<Partial<ApplicationProfile>>(
    editingApp || {
      id: `app-${Date.now()}`,
      name: '',
      description: '',
      architecture: 'llm-chatbot',
      testMode: 'blackbox',
      endpoint: {
        url: '',
        method: 'POST',
        headers: {},
      },
      testability: {
        promptfooCompatible: true,
        requiresCustomTest: false,
        inputType: 'text',
        outputType: 'text',
      },
      safetyConfig: {
        maxRequestsPerMinute: 10,
        maxTestsPerSession: 50,
        requiresConfirmation: true,
        productionEnvironment: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  // Validation par étape
  const validateStep = (step: number): boolean => {
    const errors: string[] = [];

    switch (step) {
      case 1: // Informations de base
        if (!formData.name || formData.name.trim().length < 3) {
          errors.push('Le nom doit contenir au moins 3 caractères');
        }
        break;

      case 2: // Architecture
        if (!formData.architecture) {
          errors.push('Veuillez sélectionner une architecture');
        }
        break;

      case 3: // Endpoint
        if (!formData.endpoint?.url) {
          errors.push('L\'URL de l\'endpoint est requise');
        } else {
          try {
            new URL(formData.endpoint.url);
          } catch {
            errors.push('L\'URL n\'est pas valide');
          }
        }
        break;

      case 4: // Authentication
        if (formData.testMode === 'whitebox' && formData.authentication) {
          if (formData.authentication.type !== 'none' && !formData.authentication.credentials) {
            errors.push('Les credentials sont requis pour ce type d\'authentification');
          }
        }
        break;

      case 5: // Safety config
        if (formData.safetyConfig) {
          if (
            formData.safetyConfig.maxRequestsPerMinute &&
            (formData.safetyConfig.maxRequestsPerMinute < 1 ||
              formData.safetyConfig.maxRequestsPerMinute > 100)
          ) {
            errors.push('Le rate limit doit être entre 1 et 100 req/min');
          }
        }
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    if (validateStep(currentStep)) {
      const profile: ApplicationProfile = {
        ...formData,
        updatedAt: new Date().toISOString(),
      } as ApplicationProfile;

      if (editingApp) {
        updateApplication(editingApp.id, profile);
      } else {
        addApplication(profile);
      }

      onClose();
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNestedFormData = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof typeof prev] as any),
        [field]: value,
      },
    }));
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
              <div className="flex items-start gap-2">
                <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-200">
                  <p className="font-bold text-white mb-1">Étape 1 : Informations de Base</p>
                  <p>
                    Donnez un nom unique à cette application et ajoutez une description pour vous
                    aider à la retrouver. Si c'est une application cliente, indiquez le nom du client.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Nom de l'Application <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => updateFormData('name', e.target.value)}
                placeholder="Ex: Chatbot Support Client - Acme Corp"
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Conseil : Utilisez un nom descriptif incluant le client/projet
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={e => updateFormData('description', e.target.value)}
                placeholder="Ex: Chatbot de support client avec RAG sur documentation technique. Environnement: Production."
                rows={3}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Propriétaire / Client
              </label>
              <input
                type="text"
                value={formData.owner || ''}
                onChange={e => updateFormData('owner', e.target.value)}
                placeholder="Ex: Acme Corporation"
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Important pour la traçabilité et les rapports clients
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
              <div className="flex items-start gap-2">
                <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-200">
                  <p className="font-bold text-white mb-1">Étape 2 : Architecture et Testabilité</p>
                  <p>
                    Sélectionnez le type d'architecture pour déterminer comment l'application sera testée.
                    Les applications textuelles (chatbot, RAG) sont compatibles Promptfoo directement.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Type d'Architecture <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.architecture}
                onChange={e => {
                  const arch = e.target.value as ApplicationArchitecture;
                  updateFormData('architecture', arch);

                  // Auto-configure testability based on architecture
                  const isTextual = ['llm-chatbot', 'rag', 'agentic-rag', 'code-generation'].includes(arch);
                  updateNestedFormData('testability', 'promptfooCompatible', isTextual);
                  updateNestedFormData('testability', 'requiresCustomTest', !isTextual);
                  updateNestedFormData('testability', 'inputType', isTextual ? 'text' : 'multimodal');
                  updateNestedFormData('testability', 'outputType', isTextual ? 'text' : 'multimodal');
                }}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              >
                <option value="llm-chatbot">Chatbot LLM</option>
                <option value="rag">RAG (Retrieval Augmented Generation)</option>
                <option value="agentic-rag">Agentic RAG (avec agents autonomes)</option>
                <option value="code-generation">Génération de Code</option>
                <option value="text-to-speech">Text-to-Speech</option>
                <option value="text-to-video">Text-to-Video</option>
                <option value="video-to-text">Video-to-Text</option>
                <option value="speech-to-text">Speech-to-Text</option>
                <option value="complex-pipeline">Pipeline Complexe (Bedrock/LangFuse/MCP)</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div className={`p-4 rounded border ${
              formData.testability?.promptfooCompatible
                ? 'bg-green-900/20 border-green-500/30'
                : 'bg-orange-900/20 border-orange-500/30'
            }`}>
              <div className="flex items-start gap-2">
                {formData.testability?.promptfooCompatible ? (
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle size={20} className="text-orange-400 flex-shrink-0" />
                )}
                <div className="text-sm">
                  <p className="font-bold text-white mb-1">
                    {formData.testability?.promptfooCompatible
                      ? '✅ Compatible Promptfoo'
                      : '⚠️ Tests Custom Requis'}
                  </p>
                  <p className="text-gray-300">
                    {formData.testability?.promptfooCompatible
                      ? 'Cette architecture est compatible avec Promptfoo. Vous pourrez lancer des tests red team automatisés avec 40+ plugins.'
                      : 'Cette architecture nécessite des tests personnalisés. Promptfoo ne peut pas tester directement les inputs/outputs multimodaux.'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Mode de Test <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateFormData('testMode', 'blackbox')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.testMode === 'blackbox'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock size={20} className={formData.testMode === 'blackbox' ? 'text-blue-400' : 'text-gray-400'} />
                    <span className={`font-bold ${formData.testMode === 'blackbox' ? 'text-white' : 'text-gray-300'}`}>
                      Blackbox
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Test externe uniquement. Vous n'avez que l'URL publique. <strong className="text-blue-400">Plus sûr pour commencer.</strong>
                  </p>
                </button>

                <button
                  onClick={() => updateFormData('testMode', 'whitebox')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.testMode === 'whitebox'
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Key size={20} className={formData.testMode === 'whitebox' ? 'text-orange-400' : 'text-gray-400'} />
                    <span className={`font-bold ${formData.testMode === 'whitebox' ? 'text-white' : 'text-gray-300'}`}>
                      Whitebox
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Accès avec credentials. Vous avez API keys, tokens, etc. <strong className="text-orange-400">Nécessite autorisation.</strong>
                  </p>
                </button>
              </div>
            </div>

            {formData.testMode === 'whitebox' && (
              <div className="bg-orange-900/20 p-4 rounded border border-orange-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={20} className="text-orange-400 flex-shrink-0" />
                  <div className="text-sm text-gray-200">
                    <p className="font-bold text-white mb-1">⚠️ Mode Whitebox : Précautions</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Assurez-vous d'avoir l'autorisation écrite du client</li>
                      <li>Les credentials seront stockés localement (localStorage chiffré recommandé)</li>
                      <li>Ne partagez jamais vos configurations avec des tiers</li>
                      <li>Supprimez les credentials après vos tests si non réutilisables</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
              <div className="flex items-start gap-2">
                <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-200">
                  <p className="font-bold text-white mb-1">Étape 3 : Configuration de l'Endpoint</p>
                  <p>
                    Définissez comment envoyer les requêtes à votre application. L'URL doit être accessible depuis votre machine.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                URL de l'Endpoint <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                value={formData.endpoint?.url || ''}
                onChange={e => updateNestedFormData('endpoint', 'url', e.target.value)}
                placeholder="https://api.example.com/v1/chat"
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                ⚠️ Vérifiez que cette URL est correcte. Une URL invalide causera l'échec de tous les tests.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Méthode HTTP
              </label>
              <select
                value={formData.endpoint?.method || 'POST'}
                onChange={e => updateNestedFormData('endpoint', 'method', e.target.value)}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST (recommandé)</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Template du Body (optionnel)
              </label>
              <textarea
                value={formData.endpoint?.bodyTemplate || ''}
                onChange={e => updateNestedFormData('endpoint', 'bodyTemplate', e.target.value)}
                placeholder={'{\n  "message": "{{prompt}}",\n  "model": "gpt-4"\n}'}
                rows={5}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Utilisez <code className="bg-gray-700 px-1 rounded">{"{{prompt}}"}</code> comme placeholder pour le prompt de test.
                Laissez vide pour utiliser le prompt directement.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Chemin de la Réponse (optionnel)
              </label>
              <input
                type="text"
                value={formData.endpoint?.responseField || ''}
                onChange={e => updateNestedFormData('endpoint', 'responseField', e.target.value)}
                placeholder="data.response ou choices[0].message.content"
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Chemin JSON pour extraire la réponse (ex: "data.response"). Laissez vide si la réponse est directe.
              </p>
            </div>
          </div>
        );

      case 4:
        if (formData.testMode === 'blackbox') {
          return (
            <div className="space-y-4">
              <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-200">
                    <p className="font-bold text-white mb-1">Mode Blackbox : Pas d'Authentication</p>
                    <p>
                      En mode blackbox, vous n'avez pas besoin de configurer l'authentication.
                      Les tests seront effectués comme un utilisateur externe.
                    </p>
                    <p className="mt-2 text-cyan-400">
                      ✅ Vous pouvez passer à l'étape suivante.
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-center py-8">
                <Lock size={48} className="text-blue-400 mx-auto mb-3" />
                <p className="text-gray-400">Aucune configuration d'authentication requise</p>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="bg-orange-900/20 p-4 rounded border border-orange-500/30">
              <div className="flex items-start gap-2">
                <AlertTriangle size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-200">
                  <p className="font-bold text-white mb-1">Étape 4 : Authentication (Mode Whitebox)</p>
                  <p>
                    ⚠️ Les credentials que vous entrez seront stockés localement (localStorage).
                    Pour plus de sécurité, activez le chiffrement dans les paramètres.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Type d'Authentication
              </label>
              <select
                value={formData.authentication?.type || 'none'}
                onChange={e => {
                  updateFormData('authentication', {
                    type: e.target.value as AuthenticationType,
                    credentials: {},
                  });
                }}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              >
                <option value="none">Aucune</option>
                <option value="api-key">API Key</option>
                <option value="bearer-token">Bearer Token</option>
                <option value="basic-auth">Basic Auth (Username/Password)</option>
                <option value="oauth">OAuth 2.0</option>
                <option value="custom-header">Custom Header</option>
              </select>
            </div>

            {formData.authentication?.type === 'api-key' && (
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  API Key <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.authentication?.credentials?.apiKey || ''}
                    onChange={e => {
                      const auth = formData.authentication || { type: 'api-key' as AuthenticationType, credentials: {} };
                      updateFormData('authentication', {
                        ...auth,
                        credentials: {
                          ...auth.credentials,
                          apiKey: e.target.value,
                        },
                      });
                    }}
                    placeholder="sk-..."
                    className="w-full bg-gray-800 text-white p-3 pr-12 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-yellow-400 mt-1">
                  ⚠️ Cette clé sera stockée en clair dans localStorage. Ne l'utilisez pas sur un ordinateur partagé.
                </p>
              </div>
            )}

            {formData.authentication?.type === 'bearer-token' && (
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Bearer Token <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.authentication?.credentials?.token || ''}
                    onChange={e => {
                      const auth = formData.authentication || { type: 'bearer-token' as AuthenticationType, credentials: {} };
                      updateFormData('authentication', {
                        ...auth,
                        credentials: {
                          ...auth.credentials,
                          token: e.target.value,
                        },
                      });
                    }}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-gray-800 text-white p-3 pr-12 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {formData.authentication?.type === 'basic-auth' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.authentication?.credentials?.username || ''}
                    onChange={e => {
                      const auth = formData.authentication || { type: 'basic-auth' as AuthenticationType, credentials: {} };
                      updateFormData('authentication', {
                        ...auth,
                        credentials: {
                          ...auth.credentials,
                          username: e.target.value,
                        },
                      });
                    }}
                    className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.authentication?.credentials?.password || ''}
                      onChange={e => {
                        const auth = formData.authentication || { type: 'basic-auth' as AuthenticationType, credentials: {} };
                        updateFormData('authentication', {
                          ...auth,
                          credentials: {
                            ...auth.credentials,
                            password: e.target.value,
                          },
                        });
                      }}
                      className="w-full bg-gray-800 text-white p-3 pr-12 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
              <div className="flex items-start gap-2">
                <Info size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-200">
                  <p className="font-bold text-white mb-1">Étape 5 : Configuration de Sécurité</p>
                  <p>
                    Définissez des limites pour protéger l'application testée contre une surcharge accidentelle.
                    Ces paramètres sont CRITIQUES pour les tests clients.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Rate Limit (requêtes par minute)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.safetyConfig?.maxRequestsPerMinute || 10}
                onChange={e => updateNestedFormData('safetyConfig', 'maxRequestsPerMinute', parseInt(e.target.value))}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Recommandé : 10 req/min pour prod, 20-30 pour dev. Maximum: 100 req/min.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Limite de tests par session
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.safetyConfig?.maxTestsPerSession || 50}
                onChange={e => updateNestedFormData('safetyConfig', 'maxTestsPerSession', parseInt(e.target.value))}
                className="w-full bg-gray-800 text-white p-3 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Commence avec 50 tests maximum. Augmentez après validation.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.safetyConfig?.requiresConfirmation || false}
                  onChange={e => updateNestedFormData('safetyConfig', 'requiresConfirmation', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
                />
                <div>
                  <span className="text-white font-bold">Confirmation obligatoire avant tests</span>
                  <p className="text-xs text-gray-400">Recommandé pour apps clientes</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.safetyConfig?.productionEnvironment || false}
                  onChange={e => updateNestedFormData('safetyConfig', 'productionEnvironment', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500"
                />
                <div>
                  <span className="text-white font-bold">Application en Production</span>
                  <p className="text-xs text-gray-400">Active des protections supplémentaires</p>
                </div>
              </label>
            </div>

            {formData.safetyConfig?.productionEnvironment && (
              <div className="bg-red-900/20 p-4 rounded border border-red-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                  <div className="text-sm text-gray-200">
                    <p className="font-bold text-white mb-1">⚠️ Application en Production Détectée</p>
                    <p className="mb-2">
                      Cette application est marquée comme étant en production. Des protections supplémentaires
                      sont activées automatiquement :
                    </p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>Confirmation obligatoire avant chaque test</li>
                      <li>Rate limit renforcé</li>
                      <li>Plugins dangereux (harmful-*) désactivés par défaut</li>
                      <li>Audit trail complet activé</li>
                    </ul>
                    <p className="mt-2 font-bold text-yellow-300">
                      💡 Si possible, testez sur un environnement de staging/dev d'abord.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-200">
                  <p className="font-bold text-white mb-1">Étape 6 : Preview et Confirmation</p>
                  <p>
                    Vérifiez attentivement la configuration avant de sauvegarder. Vous pourrez la modifier plus tard.
                  </p>
                </div>
              </div>
            </div>

            <Card className="bg-gray-700/30">
              <h4 className="text-lg font-bold text-white mb-4">Récapitulatif de la Configuration</h4>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-600">
                  <span className="text-gray-400">Nom :</span>
                  <span className="text-white font-bold">{formData.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-600">
                  <span className="text-gray-400">Architecture :</span>
                  <span className="text-white">{formData.architecture}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-600">
                  <span className="text-gray-400">Mode :</span>
                  <span className="text-white">{formData.testMode}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-600">
                  <span className="text-gray-400">URL :</span>
                  <span className="text-white font-mono text-xs break-all">{formData.endpoint?.url}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-600">
                  <span className="text-gray-400">Promptfoo Compatible :</span>
                  <span className="text-white">
                    {formData.testability?.promptfooCompatible ? '✅ Oui' : '❌ Non'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-600">
                  <span className="text-gray-400">Rate Limit :</span>
                  <span className="text-white">{formData.safetyConfig?.maxRequestsPerMinute} req/min</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <span className="text-gray-400">Production :</span>
                  <span className={formData.safetyConfig?.productionEnvironment ? 'text-red-400 font-bold' : 'text-green-400'}>
                    {formData.safetyConfig?.productionEnvironment ? '⚠️ Oui' : '✅ Non (Dev/Staging)'}
                  </span>
                </div>
              </div>
            </Card>

            <div className="bg-yellow-900/20 p-4 rounded border border-yellow-500/30">
              <div className="flex items-start gap-2">
                <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-200">
                  <p className="font-bold text-white mb-1">⚠️ Dernière Vérification</p>
                  <p>
                    En sauvegardant cette configuration, vous confirmez :
                  </p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Avoir l'autorisation de tester cette application</li>
                    <li>Avoir vérifié l'exactitude de l'URL et des paramètres</li>
                    <li>Comprendre les risques liés aux tests de sécurité</li>
                    <li>Respecter les limites de rate et volume configurées</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-600">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-600 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-cyan-400" />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingApp ? 'Modifier' : 'Ajouter'} une Application
                </h2>
                <p className="text-sm text-gray-400">
                  Mode Guidé - Étape {currentStep} sur {totalSteps}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 bg-red-900/20 p-4 rounded border border-red-500/30">
              <div className="flex items-start gap-2">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white mb-2">Erreurs de Validation :</p>
                  <ul className="list-disc ml-5 space-y-1 text-sm text-red-300">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-600 p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft size={16} className="mr-2" />
              Précédent
            </Button>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                Annuler
              </Button>
              {currentStep < totalSteps ? (
                <Button onClick={handleNext}>
                  Suivant
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 size={16} className="mr-2" />
                  Sauvegarder la Configuration
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationConfigWizard;
