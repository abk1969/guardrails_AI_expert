import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { RedTeamQuestion } from '../types';
import { INITIAL_RED_TEAM_QUESTIONS, INITIAL_BUSINESS_OBJECTIVE } from '../constants';

interface RedTeamState {
  questions: RedTeamQuestion[];
  businessObjective: string;
  addQuestion: (category: string) => void;
  updateQuestion: (id: string, updatedData: Partial<Omit<RedTeamQuestion, 'id'>>) => void;
  deleteQuestion: (id: string) => void;
  updateBusinessObjective: (text: string) => void;
}

const RedTeamContext = createContext<RedTeamState | undefined>(undefined);

const RED_TEAM_STORAGE_KEY = 'llmGuardrailRedTeamReview';

export const RedTeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<RedTeamQuestion[]>([]);
  const [businessObjective, setBusinessObjective] = useState<string>('');

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(RED_TEAM_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setQuestions(parsed.questions || INITIAL_RED_TEAM_QUESTIONS);
        setBusinessObjective(parsed.businessObjective || INITIAL_BUSINESS_OBJECTIVE);
      } else {
        setQuestions(INITIAL_RED_TEAM_QUESTIONS);
        setBusinessObjective(INITIAL_BUSINESS_OBJECTIVE);
      }
    } catch (error) {
      console.error("Failed to load Red Team review data from localStorage", error);
      setQuestions(INITIAL_RED_TEAM_QUESTIONS);
      setBusinessObjective(INITIAL_BUSINESS_OBJECTIVE);
    }
  }, []);

  useEffect(() => {
    try {
      const dataToStore = JSON.stringify({ questions, businessObjective });
      localStorage.setItem(RED_TEAM_STORAGE_KEY, dataToStore);
    } catch (error) {
      console.error("Failed to save Red Team review data to localStorage", error);
    }
  }, [questions, businessObjective]);

  const addQuestion = (category: string) => {
    const newQuestion: RedTeamQuestion = {
      id: `rt-custom-${crypto.randomUUID()}`,
      category,
      question: 'Nouvelle question...',
      response: '',
      initialRating: '',
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id: string, updatedData: Partial<Omit<RedTeamQuestion, 'id'>>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updatedData } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateBusinessObjective = (text: string) => {
    setBusinessObjective(text);
  };

  return (
    <RedTeamContext.Provider value={{ questions, businessObjective, addQuestion, updateQuestion, deleteQuestion, updateBusinessObjective }}>
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