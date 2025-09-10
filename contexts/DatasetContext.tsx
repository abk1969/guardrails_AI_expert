import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GuardrailCategory, PromptTemplate, PromptComplexity } from '../types';
import { INITIAL_PROMPT_TEMPLATES } from '../constants';

interface DatasetState {
  promptTemplates: Record<GuardrailCategory, PromptTemplate[]>;
  addPrompt: (category: GuardrailCategory, text: string) => void;
  updatePrompt: (category: GuardrailCategory, id: string, newText: string) => void;
  deletePrompt: (category: GuardrailCategory, id: string) => void;
}

const DatasetContext = createContext<DatasetState | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [promptTemplates, setPromptTemplates] = useState(INITIAL_PROMPT_TEMPLATES);

  const addPrompt = (category: GuardrailCategory, text: string) => {
    if (!text.trim()) return;
    const newPrompt: PromptTemplate = {
      id: `prompt-${Date.now()}`,
      text,
      complexity: PromptComplexity.SIMPLE,
      guide: "Nouveau prompt ajouté par l'utilisateur.",
      protection: "Les mécanismes de protection standards pour cette catégorie s'appliquent. Pensez à documenter ce prompt de manière plus détaillée."
    };
    setPromptTemplates(prev => ({
      ...prev,
      [category]: [...prev[category], newPrompt],
    }));
  };

  const updatePrompt = (category: GuardrailCategory, id: string, newText: string) => {
    if (!newText.trim()) return;
    setPromptTemplates(prev => {
      const newPrompts = prev[category].map(p => 
        p.id === id ? { ...p, text: newText } : p
      );
      return { ...prev, [category]: newPrompts };
    });
  };

  const deletePrompt = (category: GuardrailCategory, id: string) => {
    setPromptTemplates(prev => {
      const newPrompts = prev[category].filter(p => p.id !== id);
      return { ...prev, [category]: newPrompts };
    });
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