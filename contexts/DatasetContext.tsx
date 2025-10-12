import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GuardrailCategory, PromptTemplate, PromptComplexity, AttackFamily } from '../types';
import { ATTACK_LIBRARY } from '../constants';

interface DatasetState {
  promptTemplates: PromptTemplate[];
  addPrompt: (category: GuardrailCategory, text: string) => void;
  updatePrompt: (id: string, newText: string) => void;
  deletePrompt: (id: string) => void;
}

const DatasetContext = createContext<DatasetState | undefined>(undefined);

// Helper function to sanitize user input and prevent XSS
const sanitizeText = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    "/": '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return text.replace(reg, (match)=>(map[match]));
};


export const DatasetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [promptTemplates, setPromptTemplates] = useState(ATTACK_LIBRARY);

  const addPrompt = (category: GuardrailCategory, text: string) => {
    const sanitizedText = sanitizeText(text);
    if (!sanitizedText.trim()) return;
    const newPrompt: PromptTemplate = {
      id: `prompt-custom-${crypto.randomUUID()}`,
      text: sanitizedText,
      complexity: PromptComplexity.SIMPLE,
      guide: "Nouveau prompt ajouté par l'utilisateur.",
      protection: "Les mécanismes de protection standards pour cette catégorie s'appliquent. Pensez à documenter ce prompt de manière plus détaillée.",
      attackFamily: AttackFamily.CUSTOM_PROMPTS,
      category: category,
    };
    setPromptTemplates(prev => ([...prev, newPrompt]));
  };

  const updatePrompt = (id: string, newText: string) => {
    const sanitizedText = sanitizeText(newText);
    if (!sanitizedText.trim()) return;
    setPromptTemplates(prev => 
      prev.map(p => 
        p.id === id ? { ...p, text: sanitizedText } : p
      )
    );
  };

  const deletePrompt = (id: string) => {
    setPromptTemplates(prev => prev.filter(p => p.id !== id));
  };

  return (
    <DatasetContext.Provider value={{ promptTemplates, addPrompt, updatePrompt, deletePrompt }}>
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = (): DatasetState => {
  const context = useContext(DatasetContext);
  if (context === undefined) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
};