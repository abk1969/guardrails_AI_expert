import React, { createContext, useContext, ReactNode } from 'react';
import { RedTeamQuestion } from '../types';
import { INITIAL_RED_TEAM_QUESTIONS, INITIAL_BUSINESS_OBJECTIVE } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface RedTeamData {
  questions: RedTeamQuestion[];
  businessObjective: string;
}

interface RedTeamState {
  questions: RedTeamQuestion[];
  businessObjective: string;
  addQuestion: (category: string) => void;
  updateQuestion: (id: string, updatedData: Partial<Omit<RedTeamQuestion, 'id'>>) => void;
  deleteQuestion: (id: string) => void;
  updateBusinessObjective: (text: string) => void;
}

const RedTeamContext = createContext<RedTeamState | undefined>(undefined);

const DEFAULTS: RedTeamData = {
  questions: INITIAL_RED_TEAM_QUESTIONS,
  businessObjective: INITIAL_BUSINESS_OBJECTIVE,
};

export const RedTeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useLocalStorage<RedTeamData>('llmGuardrailRedTeamReview', DEFAULTS);

  const addQuestion = (category: string) => {
    const newQuestion: RedTeamQuestion = {
      id: `rt-custom-${crypto.randomUUID()}`,
      category,
      question: 'Nouvelle question...',
      response: '',
      initialRating: '',
    };
    setData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const updateQuestion = (id: string, updatedData: Partial<Omit<RedTeamQuestion, 'id'>>) => {
    setData(prev => ({ ...prev, questions: prev.questions.map(q => (q.id === id ? { ...q, ...updatedData } : q)) }));
  };

  const deleteQuestion = (id: string) => {
    setData(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
  };

  const updateBusinessObjective = (text: string) => {
    setData(prev => ({ ...prev, businessObjective: text }));
  };

  return (
    <RedTeamContext.Provider value={{
      questions: data.questions,
      businessObjective: data.businessObjective,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      updateBusinessObjective
    }}>
      {children}
    </RedTeamContext.Provider>
  );
};

export const useRedTeam = (): RedTeamState => {
  const context = useContext(RedTeamContext);
  if (context === undefined) {
    throw new Error('useRedTeam must be used within a RedTeamProvider');
  }
  return context;
};
