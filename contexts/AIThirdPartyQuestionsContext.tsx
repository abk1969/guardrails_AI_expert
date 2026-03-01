import React, { createContext, useContext, ReactNode } from 'react';
import { AIThirdPartyQuestion } from '../types';
import { INITIAL_AI_THIRD_PARTY_QUESTIONS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AIThirdPartyQuestionsState {
  questions: AIThirdPartyQuestion[];
  addQuestion: (category: string) => void;
  updateQuestion: (id: string, updatedData: Partial<Omit<AIThirdPartyQuestion, 'id'>>) => void;
  deleteQuestion: (id: string) => void;
  importQuestions: (importedQuestions: AIThirdPartyQuestion[]) => boolean;
}

const AIThirdPartyQuestionsContext = createContext<AIThirdPartyQuestionsState | undefined>(undefined);

export const AIThirdPartyQuestionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useLocalStorage<AIThirdPartyQuestion[]>(
    'llmGuardrailAIThirdPartyQuestions',
    INITIAL_AI_THIRD_PARTY_QUESTIONS
  );

  const addQuestion = (category: string) => {
    const newQuestion: AIThirdPartyQuestion = {
      id: `tpq-custom-${crypto.randomUUID()}`,
      category,
      question: 'Nouvelle question...',
      response: '',
      rating: '',
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id: string, updatedData: Partial<Omit<AIThirdPartyQuestion, 'id'>>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updatedData } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const importQuestions = (importedQuestions: AIThirdPartyQuestion[]): boolean => {
    if (Array.isArray(importedQuestions) && importedQuestions.length > 0 && 'id' in importedQuestions[0] && 'question' in importedQuestions[0]) {
      setQuestions(importedQuestions);
      return true;
    }
    return false;
  };

  return (
    <AIThirdPartyQuestionsContext.Provider value={{ questions, addQuestion, updateQuestion, deleteQuestion, importQuestions }}>
      {children}
    </AIThirdPartyQuestionsContext.Provider>
  );
};

export const useAIThirdPartyQuestions = (): AIThirdPartyQuestionsState => {
  const context = useContext(AIThirdPartyQuestionsContext);
  if (context === undefined) {
    throw new Error('useAIThirdPartyQuestions must be used within a AIThirdPartyQuestionsProvider');
  }
  return context;
};
