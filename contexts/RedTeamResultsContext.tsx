import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RedTeamResult, MitigationProfile, MitigationMapping, StrategyRoadmapItem } from '../types';
import { INITIAL_RED_TEAM_RESULTS, INITIAL_MITIGATION_PROFILES, INITIAL_MITIGATION_MAPPINGS, INITIAL_STRATEGY_ROADMAP } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface RedTeamResultsData {
  results: RedTeamResult[];
  mitigationMappings: MitigationMapping[];
  strategyRoadmap: StrategyRoadmapItem[];
}

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

const DEFAULTS: RedTeamResultsData = {
  results: INITIAL_RED_TEAM_RESULTS,
  mitigationMappings: INITIAL_MITIGATION_MAPPINGS,
  strategyRoadmap: INITIAL_STRATEGY_ROADMAP,
};

export const RedTeamResultsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useLocalStorage<RedTeamResultsData>('llmGuardrailRedTeamResults', DEFAULTS);
  const [mitigationProfiles] = useState<MitigationProfile[]>(INITIAL_MITIGATION_PROFILES);

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
    setData(prev => ({ ...prev, results: [...prev.results, newResult] }));
  };

  const updateResult = (id: string, updatedData: Partial<Omit<RedTeamResult, 'id'>>) => {
    setData(prev => ({ ...prev, results: prev.results.map(r => (r.id === id ? { ...r, ...updatedData } : r)) }));
  };

  const deleteResult = (id: string) => {
    setData(prev => ({ ...prev, results: prev.results.filter(r => r.id !== id) }));
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
    setData(prev => ({ ...prev, mitigationMappings: [...prev.mitigationMappings, newMapping] }));
  };

  const updateMitigationMapping = (id: string, updatedData: Partial<Omit<MitigationMapping, 'id' | 'profileId'>>) => {
    setData(prev => ({ ...prev, mitigationMappings: prev.mitigationMappings.map(m => (m.id === id ? { ...m, ...updatedData } : m)) }));
  };

  const deleteMitigationMapping = (id: string) => {
    setData(prev => ({ ...prev, mitigationMappings: prev.mitigationMappings.filter(m => m.id !== id) }));
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
    setData(prev => ({ ...prev, strategyRoadmap: [...prev.strategyRoadmap, newItem] }));
  };

  const updateStrategyItem = (id: string, updatedData: Partial<Omit<StrategyRoadmapItem, 'id' | 'category'>>) => {
    setData(prev => ({ ...prev, strategyRoadmap: prev.strategyRoadmap.map(item => (item.id === id ? { ...item, ...updatedData } : item)) }));
  };

  const deleteStrategyItem = (id: string) => {
    setData(prev => ({ ...prev, strategyRoadmap: prev.strategyRoadmap.filter(item => item.id !== id) }));
  };

  return (
    <RedTeamResultsContext.Provider value={{
      results: data.results,
      mitigationProfiles,
      mitigationMappings: data.mitigationMappings,
      strategyRoadmap: data.strategyRoadmap,
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
