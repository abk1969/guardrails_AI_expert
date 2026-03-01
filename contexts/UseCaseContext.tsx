import React, { createContext, useContext, ReactNode } from 'react';
import { UseCase } from '../types';
import { INITIAL_USE_CASES } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UseCaseState {
  useCases: UseCase[];
  addUseCase: (useCase: Omit<UseCase, 'id' | 'riskScore'>) => void;
  updateUseCase: (useCase: UseCase) => void;
  deleteUseCase: (id: string) => void;
}

const UseCaseContext = createContext<UseCaseState | undefined>(undefined);

export const UseCaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [useCases, setUseCases] = useLocalStorage<UseCase[]>(
    'llmGuardrailUseCases',
    INITIAL_USE_CASES
  );

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
