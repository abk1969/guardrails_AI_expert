import React, { useState } from 'react';
import Button from './ui/Button';
import {
  X,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { ApplicationProfile } from '../types';
import { useApplicationProfile } from '../contexts/ApplicationProfileContext';
import {
  WizardStepBasicInfo,
  WizardStepArchitecture,
  WizardStepEndpoint,
  WizardStepAuthentication,
  WizardStepSafety,
  WizardStepPreview,
} from './ApplicationWizardSteps';

interface ApplicationConfigWizardProps {
  isOpen: boolean;
  onClose: () => void;
  editingApp?: ApplicationProfile | null;
}

const ApplicationConfigWizard: React.FC<ApplicationConfigWizardProps> = ({
  isOpen,
  onClose,
  editingApp,
}) => {
  const { addApplication, updateApplication } = useApplicationProfile();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

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

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!formData.name || formData.name.trim().length < 3) {
          errors.push('Le nom doit contenir au moins 3 caractères');
        }
        break;
      case 2:
        if (!formData.architecture) {
          errors.push('Veuillez sélectionner une architecture');
        }
        break;
      case 3:
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
      case 4:
        if (formData.testMode === 'whitebox' && formData.authentication) {
          if (formData.authentication.type !== 'none' && !formData.authentication.credentials) {
            errors.push('Les credentials sont requis pour ce type d\'authentification');
          }
        }
        break;
      case 5:
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
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
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
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const stepProps = { formData, updateFormData, updateNestedFormData };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <WizardStepBasicInfo {...stepProps} />;
      case 2: return <WizardStepArchitecture {...stepProps} />;
      case 3: return <WizardStepEndpoint {...stepProps} />;
      case 4: return <WizardStepAuthentication {...stepProps} showPassword={showPassword} setShowPassword={setShowPassword} />;
      case 5: return <WizardStepSafety {...stepProps} />;
      case 6: return <WizardStepPreview {...stepProps} />;
      default: return null;
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
