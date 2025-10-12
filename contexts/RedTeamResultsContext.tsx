import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { RedTeamResult, MitigationProfile, MitigationMapping, StrategyRoadmapItem } from '../types';
import { INITIAL_RED_TEAM_RESULTS, INITIAL_MITIGATION_PROFILES, INITIAL_MITIGATION_MAPPINGS, INITIAL_STRATEGY_ROADMAP } from '../constants';

interface RedTeamResultsState {
  results: RedTeamResult[];
  mitigationProfiles: MitigationProfile[];
  mitigationMappings: MitigationMapping[];
  strategyRoadmap: StrategyRoadmapItem[];
  addResult: () => void;
  updateResult: (id: string, updatedData: Partial<Omit<RedTeamResult, 'id'>>) => void;
  deleteResult: (id: string) => void;
  addMitigationMapping: (profileId: string) => void;
  updateMitigationMapping: (id: string, updatedData: Partial<Omit<MitigationMapping, 'id' | 'profileId'>>) => void;
  deleteMitigationMapping: (id: string) => void;
  addStrategyItem: (category: string) => void;
  updateStrategyItem: (id: string, updatedData: Partial<Omit<StrategyRoadmapItem, 'id' | 'category'>>) => void;
  deleteStrategyItem: (id: string) => void;
}

const RedTeamResultsContext = createContext<RedTeamResultsState | undefined>(undefined);

const RESULTS_STORAGE_KEY = 'llmGuardrailRedTeamResults';

export const RedTeamResultsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<RedTeamResult[]>([]);
  const [mitigationProfiles] = useState<MitigationProfile[]>(INITIAL_MITIGATION_PROFILES);
  const [mitigationMappings, setMitigationMappings] = useState<MitigationMapping[]>([]);
  const [strategyRoadmap, setStrategyRoadmap] = useState<StrategyRoadmapItem[]>([]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(RESULTS_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setResults(parsed.results || INITIAL_RED_TEAM_RESULTS);
        setMitigationMappings(parsed.mitigationMappings || INITIAL_MITIGATION_MAPPINGS);
        setStrategyRoadmap(parsed.strategyRoadmap || INITIAL_STRATEGY_ROADMAP);
      } else {
        setResults(INITIAL_RED_TEAM_RESULTS);
        setMitigationMappings(INITIAL_MITIGATION_MAPPINGS);
        setStrategyRoadmap(INITIAL_STRATEGY_ROADMAP);
      }
    } catch (error) {
      console.error("Failed to load Red Team results from localStorage", error);
      setResults(INITIAL_RED_TEAM_RESULTS);
      setMitigationMappings(INITIAL_MITIGATION_MAPPINGS);
      setStrategyRoadmap(INITIAL_STRATEGY_ROADMAP);
    }
  }, []);

  useEffect(() => {
    try {
      const dataToStore = JSON.stringify({ results, mitigationMappings, strategyRoadmap });
      localStorage.setItem(RESULTS_STORAGE_KEY, dataToStore);
    } catch (error)      {
      console.error("Failed to save Red Team results to localStorage", error);
    }
  }, [results, mitigationMappings, strategyRoadmap]);

  const addResult = () => {
    const newResult: RedTeamResult = {
      id: `rtr-custom-${crypto.randomUUID()}`,
      name: '',
      description: '',
      vulnerability: '',
      score: '',
      rating: '',
      impact: '',
    };
    setResults(prev => [...prev, newResult]);
  };

  const updateResult = (id: string, updatedData: Partial<Omit<RedTeamResult, 'id'>>) => {
    setResults(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updatedData } : r))
    );
  };

  const deleteResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const addMitigationMapping = (profileId: string) => {
    const newMapping: MitigationMapping = {
        id: `map-custom-${crypto.randomUUID()}`,
        profileId,
        threatVulnerability: '',
        description: '',
        score: '',
        defenseMitigation: '',
        residualScore: '',
    };
    setMitigationMappings(prev => [...prev, newMapping]);
  };
  
  const updateMitigationMapping = (id: string, updatedData: Partial<Omit<MitigationMapping, 'id' | 'profileId'>>) => {
    setMitigationMappings(prev => 
        prev.map(m => (m.id === id ? { ...m, ...updatedData } : m))
    );
  };

  const deleteMitigationMapping = (id: string) => {
    setMitigationMappings(prev => prev.filter(m => m.id !== id));
  };
  
  const addStrategyItem = (category: string) => {
    const newItem: StrategyRoadmapItem = {
      id: `sr-custom-${crypto.randomUUID()}`,
      category,
      action: 'Nouvelle action...',
      owners: '',
      strategy: '',
      timeline: '',
      status: 'Not Started',
    };
    setStrategyRoadmap(prev => [...prev, newItem]);
  };

  const updateStrategyItem = (id: string, updatedData: Partial<Omit<StrategyRoadmapItem, 'id' | 'category'>>) => {
    setStrategyRoadmap(prev => 
      prev.map(item => (item.id === id ? { ...item, ...updatedData } : item))
    );
  };

  const deleteStrategyItem = (id: string) => {
    setStrategyRoadmap(prev => prev.filter(item => item.id !== id));
  };

  return (
    <RedTeamResultsContext.Provider value={{ 
        results, 
        mitigationProfiles,
        mitigationMappings,
        strategyRoadmap,
        addResult, 
        updateResult, 
        deleteResult,
        addMitigationMapping,
        updateMitigationMapping,
        deleteMitigationMapping,
        addStrategyItem,
        updateStrategyItem,
        deleteStrategyItem,
    }}>
      {children}
    </RedTeamResultsContext.Provider>
  );
};

export const useRedTeamResults = (): RedTeamResultsState => {
  const context = useContext(RedTeamResultsContext);
  if (context === undefined) {
    throw new Error('useRedTeamResults must be used within a RedTeamResultsProvider');
  }
  return context;
};