import React, { useState, useEffect, useCallback } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Tooltip from './ui/Tooltip';
import { TestTarget, AIComponentType } from '../types';
import { Plus, Trash2, AlertCircle, HelpCircle } from 'lucide-react';
import { COMPONENT_TYPE_TEMPLATES } from '../constants';

interface TestTargetConfigurationModalProps {
  target: TestTarget | null;
  onSave: (target: TestTarget) => void;
  onClose: () => void;
  onDelete: (targetId: string) => void;
}

interface FormErrors {
  name?: string;
  apiUrl?: string;
  apiBodyTemplate?: string;
  responseExtractionPath?: string;
  headers?: string;
}

type HeaderState = { id: number; key: string; value: string };

const isSensitiveHeader = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    const sensitiveKeywords = ['key', 'token', 'secret', 'auth', 'pass'];
    return sensitiveKeywords.some(keyword => lowerKey.includes(keyword));
}

// OWASP API7:2023 - SSRF Protection
// Validate URL to prevent requests to local/private networks
const isUrlSafe = (url: string): boolean => {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        // Disallow localhost and common local hostnames
        if (hostname === 'localhost' || hostname === 'host.docker.internal') {
            return false;
        }

        // Disallow IP addresses, especially private/reserved ranges
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
            const parts = hostname.split('.').map(Number);
            if (
                parts[0] === 127 || // Loopback
                parts[0] === 10 || // Private Class A
                (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // Private Class B
                (parts[0] === 192 && parts[1] === 168) || // Private Class C
                (parts[0] === 169 && parts[1] === 254) || // Link-local
                parts[0] === 0 // 0.0.0.0
            ) {
                return false;
            }
        }
        return true;
    } catch (_) {
        // If URL parsing fails, it's invalid anyway. The other validator will catch this.
        return true; 
    }
}


const TestTargetConfigurationModal: React.FC<TestTargetConfigurationModalProps> = ({ target, onSave, onClose, onDelete }) => {
  const [currentTarget, setCurrentTarget] = useState<Omit<TestTarget, 'id' | 'apiMethod' | 'apiHeaders'>>({
    name: '',
    componentType: AIComponentType.FOUNDATION_MODEL,
    apiUrl: '',
    apiBodyTemplate: '',
    responseExtractionPath: '',
  });
  const [headers, setHeaders] = useState<HeaderState[]>([]);
  const [isNew, setIsNew] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = useCallback((targetData: Omit<TestTarget, 'id' | 'apiMethod' | 'apiHeaders'>, currentHeaders: HeaderState[]): FormErrors => {
    const newErrors: FormErrors = {};
  
    if (!targetData.name.trim()) {
      newErrors.name = "Le nom de la configuration est requis.";
    }
  
    if (!targetData.apiUrl.trim()) {
      newErrors.apiUrl = "L'URL de l'endpoint est requise.";
    } else {
      try {
        const urlWithPlaceholders = targetData.apiUrl
            .replace(/VOTRE_ENDPOINT/g, 'placeholder.endpoint')
            .replace(/VOTRE_DEPLOYMENT/g, 'placeholder-deployment')
            .replace(/REGION/g, 'us-east-1');
        new URL(urlWithPlaceholders);
        if (!isUrlSafe(urlWithPlaceholders)) {
             newErrors.apiUrl = "L'URL ne doit pas pointer vers une adresse locale ou privée.";
        }
      } catch (_) {
        newErrors.apiUrl = "L'URL de l'endpoint n'est pas valide.";
      }
    }
  
    if (!targetData.apiBodyTemplate.trim()) {
      newErrors.apiBodyTemplate = "Le modèle de corps de requête est requis.";
    } else {
      try {
        JSON.parse(targetData.apiBodyTemplate);
        if (!targetData.apiBodyTemplate.includes('{{prompt}}')) {
          newErrors.apiBodyTemplate = "Le corps de la requête doit contenir le placeholder {{prompt}}.";
        }
      } catch (e) {
        newErrors.apiBodyTemplate = "Le format JSON est invalide.";
      }
    }
  
    if (!targetData.responseExtractionPath.trim()) {
      newErrors.responseExtractionPath = "Le chemin d'extraction est requis.";
    }
  
    if (currentHeaders.some(h => !h.key.trim() || !h.value.trim())) {
        newErrors.headers = "Les clés et valeurs des headers ne peuvent pas être vides.";
    }
  
    return newErrors;
  }, []);

  useEffect(() => {
    if (target) {
      const { apiHeaders, ...rest } = target;
      setCurrentTarget(rest);
      setHeaders(Object.entries(apiHeaders).map(([key, value], index) => ({ id: index, key, value })));
      setIsNew(false);
    } else {
      setIsNew(true);
      const initialType = AIComponentType.FOUNDATION_MODEL;
      setCurrentTarget({
        name: '',
        componentType: initialType,
        apiUrl: '',
        apiBodyTemplate: COMPONENT_TYPE_TEMPLATES[initialType].apiBodyTemplate || '',
        responseExtractionPath: COMPONENT_TYPE_TEMPLATES[initialType].responseExtractionPath || '',
      });
      setHeaders([{id: 0, key: 'Content-Type', value: 'application/json'}]);
    }
  }, [target]);

  useEffect(() => {
    const validationErrors = validate(currentTarget, headers);
    setErrors(validationErrors);
  }, [currentTarget, headers, validate]);

  const handleComponentTypeChange = (type: AIComponentType) => {
    const template = COMPONENT_TYPE_TEMPLATES[type];
    setCurrentTarget(prev => ({
        ...prev,
        componentType: type,
        apiBodyTemplate: template.apiBodyTemplate || prev.apiBodyTemplate,
        responseExtractionPath: template.responseExtractionPath || prev.responseExtractionPath
    }));
  }
  
  const handleHeaderChange = (id: number, field: 'key' | 'value', value: string) => {
    setHeaders(prev => prev.map(h => (h.id === id ? { ...h, [field]: value } : h)));
  };

  const addHeader = () => {
    setHeaders(prev => [...prev, { id: Date.now(), key: '', value: '' }]);
  };

  const removeHeader = (id: number) => {
     setHeaders(prev => prev.filter(h => h.id !== id));
  };

  const handleSave = () => {
    const finalHeaders = headers.reduce((acc, curr) => {
      if (curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const finalTarget: TestTarget = {
        id: isNew ? `target-${Date.now()}` : (target as TestTarget).id,
        apiMethod: 'POST',
        ...currentTarget,
        apiHeaders: finalHeaders
    };
    onSave(finalTarget);
    onClose();
  };
  
  const handleDelete = () => {
    if (target) {
        onDelete(target.id);
        onClose();
    }
  }

  const isFormValid = Object.keys(errors).length === 0;

  const renderSectionHeader = (title: string) => (
    <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-cyan-500/30"></div>
        </div>
        <div className="relative flex justify-start">
            <span className="bg-gray-800 pr-2 text-sm font-semibold text-cyan-400">{title}</span>
        </div>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isNew ? 'Créer une Configuration' : 'Modifier la Configuration'}
      footer={
        <div className="flex items-center justify-between w-full bg-gray-800 pt-4">
            <div>
                 {!isNew && <Button variant="danger" onClick={handleDelete}>Supprimer</Button>}
            </div>
            <div className="flex space-x-2">
                <Button variant="secondary" onClick={onClose}>Annuler</Button>
                <Button onClick={handleSave} disabled={!isFormValid}>Sauvegarder</Button>
            </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
            {renderSectionHeader("Identification")}
            <div className="space-y-4 mt-4">
                 <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <label htmlFor="targetName" className="block text-sm font-medium text-gray-300">Nom de la Configuration</label>
                        <Tooltip content="Donnez un nom unique et descriptif. Ex: `Azure OpenAI (GPT-4 Production)` ou `Agent de Support v1.2`.">
                            <HelpCircle size={14} className="text-gray-400 cursor-help" />
                        </Tooltip>
                    </div>
                    <input
                        id="targetName"
                        type="text"
                        value={currentTarget.name}
                        onChange={(e) => setCurrentTarget(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full bg-gray-700 rounded-md p-2 text-white border transition-colors ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'}`}
                        placeholder="Ex: Agent de Support Client v2"
                    />
                    {errors.name && <p className="flex items-center text-sm text-red-400 mt-1"><AlertCircle size={14} className="mr-1" />{errors.name}</p>}
                </div>
                 <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <label htmlFor="componentType" className="block text-sm font-medium text-gray-300">Type de Composant IA</label>
                        <Tooltip content="Sélectionnez le type d'architecture. Cela pré-remplira les champs avec des modèles adaptés pour vous guider.">
                            <HelpCircle size={14} className="text-gray-400 cursor-help" />
                        </Tooltip>
                    </div>
                    <select
                        id="componentType"
                        value={currentTarget.componentType}
                        onChange={(e) => handleComponentTypeChange(e.target.value as AIComponentType)}
                        className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                    >
                        {Object.values(AIComponentType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <div className="flex items-center space-x-2 mb-1">
                        <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-300">Endpoint URL</label>
                         <Tooltip content="URL complète de l'API, incluant chemin et paramètres. Ex. pour Azure : `.../chat/completions?api-version=...`">
                            <HelpCircle size={14} className="text-gray-400 cursor-help" />
                        </Tooltip>
                    </div>
                    <input
                        id="apiUrl"
                        type="text"
                        value={currentTarget.apiUrl}
                        onChange={(e) => setCurrentTarget(prev => ({ ...prev, apiUrl: e.target.value }))}
                        className={`w-full bg-gray-700 rounded-md p-2 text-white border transition-colors ${errors.apiUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'}`}
                        placeholder="https://api.mon-service.com/v1/chat"
                    />
                     {errors.apiUrl && <p className="flex items-center text-sm text-red-400 mt-1"><AlertCircle size={14} className="mr-1" />{errors.apiUrl}</p>}
                </div>
                 <div>
                     <div className="flex items-center space-x-2 mb-2">
                        <label className="block text-sm font-medium text-gray-300">Headers</label>
                        <Tooltip content="En-têtes HTTP requis pour l'authentification et le format de la requête (ex: `Content-Type`, `api-key`).">
                            <HelpCircle size={14} className="text-gray-400 cursor-help" />
                        </Tooltip>
                    </div>
                    <div className="space-y-2">
                        {headers.map(({ id, key, value }) => (
                        <div key={id} className="flex items-center space-x-2">
                            <input
                            type="text"
                            value={key}
                            onChange={(e) => handleHeaderChange(id, 'key', e.target.value)}
                            className="w-1/3 bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="api-key"
                            />
                            <input
                            type={isSensitiveHeader(key) ? 'password' : 'text'}
                            value={value}
                            onChange={(e) => handleHeaderChange(id, 'value', e.target.value)}
                            className="w-2/3 bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="VOTRE_CLÉ_API"
                            />
                            <button onClick={() => removeHeader(id)} className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0" aria-label="Supprimer le header"><Trash2 size={16} /></button>
                        </div>
                        ))}
                        <button onClick={addHeader} className="flex items-center text-sm text-cyan-500 hover:text-cyan-400 pt-2">
                            <Plus size={16} className="mr-1" /> Ajouter un Header
                        </button>
                    </div>
                    {errors.headers && <p className="flex items-center text-sm text-red-400 mt-2"><AlertCircle size={14} className="mr-1" />{errors.headers}</p>}
                </div>
            </div>
        </div>
       
        <div>
            {renderSectionHeader("Format de la Requête")}
             <div className="mt-4">
                 <div className="flex items-center space-x-2 mb-1">
                    <label htmlFor="apiBodyTemplate" className="block text-sm font-medium text-gray-300">Modèle de Corps de Requête (JSON)</label>
                     <Tooltip content={<>Collez le corps de votre requête API en JSON. <strong>Crucial :</strong> Utilisez <code>{'{{prompt}}'}</code> là où le prompt de test doit être injecté.</>}>
                        <HelpCircle size={14} className="text-gray-400 cursor-help" />
                    </Tooltip>
                </div>
                <textarea
                    id="apiBodyTemplate"
                    rows={10}
                    value={currentTarget.apiBodyTemplate}
                    onChange={(e) => setCurrentTarget(prev => ({ ...prev, apiBodyTemplate: e.target.value }))}
                    className={`w-full bg-gray-900 rounded-md p-2 text-white font-mono text-sm border transition-colors ${errors.apiBodyTemplate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'}`}
                />
                <p className="text-xs text-gray-400 mt-1">{'Utilisez `{{prompt}}` comme placeholder pour le prompt du test.'}</p>
                {errors.apiBodyTemplate && <p className="flex items-center text-sm text-red-400 mt-1"><AlertCircle size={14} className="mr-1" />{errors.apiBodyTemplate}</p>}
            </div>
       </div>

        <div>
            {renderSectionHeader("Analyse de la Réponse")}
            <div className="mt-4">
                <div className="flex items-center space-x-2 mb-1">
                    <label htmlFor="responseExtractionPath" className="block text-sm font-medium text-gray-300">Chemin d'Extraction de la Réponse</label>
                    <Tooltip content="Chemin pour extraire la réponse texte du JSON retourné. Ex: `choices[0].message.content`">
                        <HelpCircle size={14} className="text-gray-400 cursor-help" />
                    </Tooltip>
                </div>
                <input
                    id="responseExtractionPath"
                    type="text"
                    value={currentTarget.responseExtractionPath}
                    onChange={(e) => setCurrentTarget(prev => ({ ...prev, responseExtractionPath: e.target.value }))}
                    className={`w-full bg-gray-700 rounded-md p-2 text-white border transition-colors ${errors.responseExtractionPath ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'}`}
                    placeholder="Ex: choices[0].message.content"
                />
                <p className="text-xs text-gray-400 mt-1">Notation par points pour les objets et crochets pour les tableaux.</p>
                {errors.responseExtractionPath && <p className="flex items-center text-sm text-red-400 mt-1"><AlertCircle size={14} className="mr-1" />{errors.responseExtractionPath}</p>}
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default TestTargetConfigurationModal;