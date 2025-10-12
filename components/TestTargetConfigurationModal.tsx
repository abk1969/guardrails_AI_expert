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
const isUrlSafe = (url: string): boolean => {
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;
        if (hostname === 'localhost' || hostname === 'host.docker.internal') return false;
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
            const parts = hostname.split('.').map(Number);
            if (
                parts[0] === 127 || parts[0] === 10 ||
                (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
                (parts[0] === 192 && parts[1] === 168) ||
                (parts[0] === 169 && parts[1] === 254) ||
                parts[0] === 0
            ) return false;
        }
        return true;
    } catch (_) {
        return true; 
    }
}

const TestTargetConfigurationModal: React.FC<TestTargetConfigurationModalProps> = ({ target, onSave, onClose, onDelete }) => {
  const [name, setName] = useState('');
  const [componentType, setComponentType] = useState<AIComponentType>(AIComponentType.FOUNDATION_MODEL);
  const [apiUrl, setApiUrl] = useState('');
  const [apiBodyTemplate, setApiBodyTemplate] = useState('');
  const [responseExtractionPath, setResponseExtractionPath] = useState('');
  const [headers, setHeaders] = useState<HeaderState[]>([]);
  const [isNew, setIsNew] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  const isSandboxType = componentType === AIComponentType.SANDBOX;

  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};
  
    if (!name.trim()) {
      newErrors.name = "Le nom de la configuration est requis.";
    }

    if (isSandboxType) {
        return newErrors;
    }
  
    if (!apiUrl.trim()) {
      newErrors.apiUrl = "L'URL de l'endpoint est requise.";
    } else {
      try {
        const urlWithPlaceholders = apiUrl.replace(/VOTRE_ENDPOINT|VOTRE_DEPLOYMENT|REGION/g, 'placeholder');
        new URL(urlWithPlaceholders);
        if (!isUrlSafe(urlWithPlaceholders)) {
             newErrors.apiUrl = "L'URL ne doit pas pointer vers une adresse locale ou privée.";
        }
      } catch (_) {
        newErrors.apiUrl = "L'URL de l'endpoint n'est pas valide.";
      }
    }
  
    if (!apiBodyTemplate.trim()) {
      newErrors.apiBodyTemplate = "Le modèle de corps de requête est requis.";
    } else {
      try {
        JSON.parse(apiBodyTemplate);
        if (!apiBodyTemplate.includes('{{prompt}}')) {
          newErrors.apiBodyTemplate = "Le corps de la requête doit contenir le placeholder {{prompt}}.";
        }
      } catch (e) {
        newErrors.apiBodyTemplate = "Le format JSON est invalide.";
      }
    }
  
    if (!responseExtractionPath.trim()) {
      newErrors.responseExtractionPath = "Le chemin d'extraction est requis.";
    }
  
    if (headers.some(h => !h.key.trim() || !h.value.trim())) {
        newErrors.headers = "Les clés et valeurs des headers ne peuvent pas être vides.";
    }
  
    return newErrors;
  }, [name, componentType, apiUrl, apiBodyTemplate, responseExtractionPath, headers, isSandboxType]);

  useEffect(() => {
    if (target) {
      setIsNew(false);
      setName(target.name);
      setComponentType(target.componentType);
      setApiUrl(target.apiUrl || '');
      setApiBodyTemplate(target.apiBodyTemplate || '');
      setResponseExtractionPath(target.responseExtractionPath || '');
      setHeaders(Object.entries(target.apiHeaders || {}).map(([key, value], index) => ({ id: index, key, value })));
    } else {
      setIsNew(true);
      const initialType = AIComponentType.FOUNDATION_MODEL;
      setComponentType(initialType);
      const template = COMPONENT_TYPE_TEMPLATES[initialType];
      setName('');
      setApiUrl('');
      setApiBodyTemplate(template.apiBodyTemplate || '');
      setResponseExtractionPath(template.responseExtractionPath || '');
      setHeaders([{id: 0, key: 'Content-Type', value: 'application/json'}]);
    }
  }, [target]);

  useEffect(() => {
    setErrors(validate());
  }, [name, componentType, apiUrl, apiBodyTemplate, responseExtractionPath, headers, validate]);

  const handleComponentTypeChange = (type: AIComponentType) => {
    setComponentType(type);
    const template = COMPONENT_TYPE_TEMPLATES[type];
    
    if (type === AIComponentType.SANDBOX) {
        setName(template.name || 'Nouveau Bac à Sable');
        setApiUrl('');
        setApiBodyTemplate('');
        setResponseExtractionPath('');
        setHeaders([]);
    } else {
        setName(name || '');
        setApiUrl(apiUrl || '');
        setApiBodyTemplate(template.apiBodyTemplate || apiBodyTemplate || '');
        setResponseExtractionPath(template.responseExtractionPath || responseExtractionPath || '');
        if(headers.length === 0) {
            setHeaders([{id: 0, key: 'Content-Type', value: 'application/json'}]);
        }
    }
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
        name,
        componentType,
        ...(isSandboxType ? {} : {
            apiMethod: 'POST',
            apiUrl,
            apiBodyTemplate,
            responseExtractionPath,
            apiHeaders: finalHeaders
        })
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
                 {!isNew && target?.id !== 'embedded-sandbox' && <Button variant="danger" onClick={handleDelete}>Supprimer</Button>}
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
                        <label htmlFor="componentType" className="block text-sm font-medium text-gray-300">Type de Composant IA</label>
                        <Tooltip content="Sélectionnez d'abord le type de cible. Choisir 'Bac à Sable' simplifiera le formulaire.">
                            <HelpCircle size={14} className="text-gray-400 cursor-help" />
                        </Tooltip>
                    </div>
                    <select
                        id="componentType"
                        value={componentType}
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
                        <label htmlFor="targetName" className="block text-sm font-medium text-gray-300">Nom de la Configuration</label>
                        <Tooltip content="Donnez un nom unique et descriptif. Ex: `Azure OpenAI (GPT-4 Production)` ou `Agent de Support v1.2`.">
                            <HelpCircle size={14} className="text-gray-400 cursor-help" />
                        </Tooltip>
                    </div>
                    <input
                        id="targetName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full bg-gray-700 rounded-md p-2 text-white border transition-colors ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'}`}
                        placeholder="Ex: Agent de Support Client v2"
                    />
                    {errors.name && <p className="flex items-center text-sm text-red-400 mt-1"><AlertCircle size={14} className="mr-1" />{errors.name}</p>}
                </div>
                {!isSandboxType && (
                    <>
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
                                value={apiUrl}
                                onChange={(e) => setApiUrl(e.target.value)}
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
                    </>
                )}
            </div>
        </div>
       
        {!isSandboxType && (
            <>
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
                            value={apiBodyTemplate}
                            onChange={(e) => setApiBodyTemplate(e.target.value)}
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
                            value={responseExtractionPath}
                            onChange={(e) => setResponseExtractionPath(e.target.value)}
                            className={`w-full bg-gray-700 rounded-md p-2 text-white border transition-colors ${errors.responseExtractionPath ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-600 focus:border-cyan-500 focus:ring-cyan-500'}`}
                            placeholder="Ex: choices[0].message.content"
                        />
                        <p className="text-xs text-gray-400 mt-1">Notation par points pour les objets et crochets pour les tableaux.</p>
                        {errors.responseExtractionPath && <p className="flex items-center text-sm text-red-400 mt-1"><AlertCircle size={14} className="mr-1" />{errors.responseExtractionPath}</p>}
                    </div>
                </div>
            </>
        )}
      </div>
    </Modal>
  );
};

export default TestTargetConfigurationModal;