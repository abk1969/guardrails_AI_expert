import React, { createContext, useContext, ReactNode } from 'react';
import { IncidentReadinessQuestion, IncidentCategory, IncidentMonitoringReference } from '../types';
import { INITIAL_READINESS_QUESTIONS, INITIAL_INCIDENT_CATEGORIES, INITIAL_INCIDENT_MONITORING_REFERENCES } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface IncidentReadinessData {
  questions: IncidentReadinessQuestion[];
  incidentCategories: IncidentCategory[];
  incidentMonitoringReferences: IncidentMonitoringReference[];
}

interface IncidentReadinessState {
  questions: IncidentReadinessQuestion[];
  incidentCategories: IncidentCategory[];
  incidentMonitoringReferences: IncidentMonitoringReference[];
  addQuestion: (category: string) => void;
  updateQuestion: (id: string, updatedData: Partial<Omit<IncidentReadinessQuestion, 'id'>>) => void;
  deleteQuestion: (id: string) => void;
  addIncidentCategory: () => void;
  updateIncidentCategory: (id: string, updatedData: Partial<Omit<IncidentCategory, 'id'>>) => void;
  deleteIncidentCategory: (id: string) => void;
  addIncidentMonitoringReference: () => void;
  updateIncidentMonitoringReference: (id: string, updatedData: Partial<Omit<IncidentMonitoringReference, 'id'>>) => void;
  deleteIncidentMonitoringReference: (id: string) => void;
}

const IncidentReadinessContext = createContext<IncidentReadinessState | undefined>(undefined);

const DEFAULTS: IncidentReadinessData = {
  questions: INITIAL_READINESS_QUESTIONS,
  incidentCategories: INITIAL_INCIDENT_CATEGORIES,
  incidentMonitoringReferences: INITIAL_INCIDENT_MONITORING_REFERENCES,
};

export const IncidentReadinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useLocalStorage<IncidentReadinessData>('llmGuardrailIncidentReadiness', DEFAULTS);

  const addQuestion = (category: string) => {
    const newQuestion: IncidentReadinessQuestion = {
      id: `read-custom-${crypto.randomUUID()}`,
      category,
      question: 'Nouvelle question...',
      response: '',
      initialRating: '',
      tested: '',
      revisedRating: '',
    };
    setData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
  };

  const updateQuestion = (id: string, updatedData: Partial<Omit<IncidentReadinessQuestion, 'id'>>) => {
    setData(prev => ({ ...prev, questions: prev.questions.map(q => (q.id === id ? { ...q, ...updatedData } : q)) }));
  };

  const deleteQuestion = (id: string) => {
    setData(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id) }));
  };

  const addIncidentCategory = () => {
    const newCategory: IncidentCategory = {
      id: `ic-custom-${crypto.randomUUID()}`,
      categoryType: 'Nouveau Type de Catégorie',
      examplesOfIncidents: 'Nouveaux exemples...',
    };
    setData(prev => ({ ...prev, incidentCategories: [...prev.incidentCategories, newCategory] }));
  };

  const updateIncidentCategory = (id: string, updatedData: Partial<Omit<IncidentCategory, 'id'>>) => {
    setData(prev => ({ ...prev, incidentCategories: prev.incidentCategories.map(c => (c.id === id ? { ...c, ...updatedData } : c)) }));
  };

  const deleteIncidentCategory = (id: string) => {
    setData(prev => ({ ...prev, incidentCategories: prev.incidentCategories.filter(c => c.id !== id) }));
  };

  const addIncidentMonitoringReference = () => {
    const newRef: IncidentMonitoringReference = {
      id: `imr-custom-${crypto.randomUUID()}`,
      layer: 'Nouveau Layer',
      whatToMonitor: '',
      alertType: '',
      suggestedTools: '',
    };
    setData(prev => ({ ...prev, incidentMonitoringReferences: [...prev.incidentMonitoringReferences, newRef] }));
  };

  const updateIncidentMonitoringReference = (id: string, updatedData: Partial<Omit<IncidentMonitoringReference, 'id'>>) => {
    setData(prev => ({ ...prev, incidentMonitoringReferences: prev.incidentMonitoringReferences.map(r => (r.id === id ? { ...r, ...updatedData } : r)) }));
  };

  const deleteIncidentMonitoringReference = (id: string) => {
    setData(prev => ({ ...prev, incidentMonitoringReferences: prev.incidentMonitoringReferences.filter(r => r.id !== id) }));
  };

  return (
    <IncidentReadinessContext.Provider value={{
      questions: data.questions,
      incidentCategories: data.incidentCategories,
      incidentMonitoringReferences: data.incidentMonitoringReferences,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      addIncidentCategory,
      updateIncidentCategory,
      deleteIncidentCategory,
      addIncidentMonitoringReference,
      updateIncidentMonitoringReference,
      deleteIncidentMonitoringReference
    }}>
      {children}
    </IncidentReadinessContext.Provider>
  );
};

export const useIncidentReadiness = (): IncidentReadinessState => {
  const context = useContext(IncidentReadinessContext);
  if (context === undefined) {
    throw new Error('useIncidentReadiness must be used within an IncidentReadinessProvider');
  }
  return context;
};
