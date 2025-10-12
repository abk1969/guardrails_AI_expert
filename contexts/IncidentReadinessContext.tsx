import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { IncidentReadinessQuestion, IncidentCategory, IncidentMonitoringReference } from '../types';
import { INITIAL_READINESS_QUESTIONS, INITIAL_INCIDENT_CATEGORIES, INITIAL_INCIDENT_MONITORING_REFERENCES } from '../constants';

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

const READINESS_STORAGE_KEY = 'llmGuardrailIncidentReadiness';

export const IncidentReadinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<IncidentReadinessQuestion[]>([]);
  const [incidentCategories, setIncidentCategories] = useState<IncidentCategory[]>([]);
  const [incidentMonitoringReferences, setIncidentMonitoringReferences] = useState<IncidentMonitoringReference[]>([]);


  useEffect(() => {
    try {
      const storedData = localStorage.getItem(READINESS_STORAGE_KEY);
       if (storedData) {
        const parsed = JSON.parse(storedData);
        setQuestions(parsed.questions || INITIAL_READINESS_QUESTIONS);
        setIncidentCategories(parsed.incidentCategories || INITIAL_INCIDENT_CATEGORIES);
        setIncidentMonitoringReferences(parsed.incidentMonitoringReferences || INITIAL_INCIDENT_MONITORING_REFERENCES);
      } else {
        setQuestions(INITIAL_READINESS_QUESTIONS);
        setIncidentCategories(INITIAL_INCIDENT_CATEGORIES);
        setIncidentMonitoringReferences(INITIAL_INCIDENT_MONITORING_REFERENCES);
      }
    } catch (error) {
      console.error("Failed to load incident readiness data from localStorage", error);
      setQuestions(INITIAL_READINESS_QUESTIONS);
      setIncidentCategories(INITIAL_INCIDENT_CATEGORIES);
      setIncidentMonitoringReferences(INITIAL_INCIDENT_MONITORING_REFERENCES);
    }
  }, []);

  useEffect(() => {
    try {
      const dataToStore = JSON.stringify({ questions, incidentCategories, incidentMonitoringReferences });
      localStorage.setItem(READINESS_STORAGE_KEY, dataToStore);
    } catch (error)      {
      console.error("Failed to save incident readiness data to localStorage", error);
    }
  }, [questions, incidentCategories, incidentMonitoringReferences]);

  // Questions CRUD
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
    setQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestion = (id: string, updatedData: Partial<Omit<IncidentReadinessQuestion, 'id'>>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updatedData } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Incident Categories CRUD
  const addIncidentCategory = () => {
    const newCategory: IncidentCategory = {
      id: `ic-custom-${crypto.randomUUID()}`,
      categoryType: 'Nouveau Type de Catégorie',
      examplesOfIncidents: 'Nouveaux exemples...',
    };
    setIncidentCategories(prev => [...prev, newCategory]);
  };

  const updateIncidentCategory = (id: string, updatedData: Partial<Omit<IncidentCategory, 'id'>>) => {
    setIncidentCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updatedData } : c)));
  };

  const deleteIncidentCategory = (id: string) => {
    setIncidentCategories(prev => prev.filter(c => c.id !== id));
  };
  
  // Incident Monitoring References CRUD
  const addIncidentMonitoringReference = () => {
    const newRef: IncidentMonitoringReference = {
      id: `imr-custom-${crypto.randomUUID()}`,
      layer: 'Nouveau Layer',
      whatToMonitor: '',
      alertType: '',
      suggestedTools: '',
    };
    setIncidentMonitoringReferences(prev => [...prev, newRef]);
  };

  const updateIncidentMonitoringReference = (id: string, updatedData: Partial<Omit<IncidentMonitoringReference, 'id'>>) => {
    setIncidentMonitoringReferences(prev => prev.map(r => (r.id === id ? { ...r, ...updatedData } : r)));
  };

  const deleteIncidentMonitoringReference = (id: string) => {
    setIncidentMonitoringReferences(prev => prev.filter(r => r.id !== id));
  };

  return (
    <IncidentReadinessContext.Provider value={{ 
        questions, 
        incidentCategories,
        incidentMonitoringReferences,
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