import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UseCase } from '../types';
import { INITIAL_USE_CASES } from '../constants';

interface UseCaseState {
  useCases: UseCase[];
  addUseCase: (useCase: Omit<UseCase, 'id' | 'riskScore'>) => void;
  updateUseCase: (useCase: UseCase) => void;
  deleteUseCase: (id: string) => void;
}

const UseCaseContext = createContext<UseCaseState | undefined>(undefined);

const USE_CASE_STORAGE_KEY = 'llmGuardrailUseCases';

export const UseCaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [useCases, setUseCases] = useState<UseCase[]>(() => {
    try {
      const storedData = localStorage.getItem(USE_CASE_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : INITIAL_USE_CASES;
    } catch (error) {
      console.error("Failed to load use cases from localStorage", error);
      return INITIAL_USE_CASES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(USE_CASE_STORAGE_KEY, JSON.stringify(useCases));
    } catch (error) {
      console.error("Failed to save use cases to localStorage", error);
    }
  }, [useCases]);

  const addUseCase = (useCaseData: Omit<UseCase, 'id' | 'riskScore'>) => {
    const newUseCase: UseCase = {
      ...useCaseData,
      id: `uc-custom-${crypto.randomUUID()}`,
      riskScore: useCaseData.impact * useCaseData.likelihood,
    };
    setUseCases(prev => [...prev, newUseCase]);
  };

  const updateUseCase = (updatedUseCase: UseCase) => {
    setUseCases(prev => prev.map(uc => 
      uc.id === updatedUseCase.id ? { ...updatedUseCase, riskScore: updatedUseCase.impact * updatedUseCase.likelihood } : uc
    ));
  };

  const deleteUseCase = (id: string) => {
    setUseCases(prev => prev.filter(uc => uc.id !== id));
  };

  return (
    <UseCaseContext.Provider value={{ useCases, addUseCase, updateUseCase, deleteUseCase }}>
      {children}
    </UseCaseContext.Provider>
  );
};

export const useUseCase = (): UseCaseState => {
  const context = useContext(UseCaseContext);
  if (context === undefined) {
    throw new Error('useUseCase must be used within a UseCaseProvider');
  }
  return context;
};
