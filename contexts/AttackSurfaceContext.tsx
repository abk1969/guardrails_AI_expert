import React, { createContext, useContext, ReactNode } from 'react';
import { AttackSurfaceVector, OrganizationalImpactConfig, NuclearDisasterScenario, ImpactLevelName } from '../types';
import { INITIAL_ATTACK_SURFACE_VECTORS, INITIAL_ORGANIZATIONAL_IMPACT_CONFIG, INITIAL_NUCLEAR_DISASTER_SCENARIOS } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AttackSurfaceData {
  attackVectors: AttackSurfaceVector[];
  impactConfig: OrganizationalImpactConfig[];
  nuclearScenarios: NuclearDisasterScenario[];
}

interface AttackSurfaceState {
  attackVectors: AttackSurfaceVector[];
  impactConfig: OrganizationalImpactConfig[];
  nuclearScenarios: NuclearDisasterScenario[];
  updateAttackVector: (id: string, updatedData: Partial<AttackSurfaceVector>) => void;
  updateImpactConfig: (level: ImpactLevelName, updatedData: Partial<OrganizationalImpactConfig>) => void;
  updateNuclearScenario: (id: string, updatedData: Partial<NuclearDisasterScenario>) => void;
}

const AttackSurfaceContext = createContext<AttackSurfaceState | undefined>(undefined);

const DEFAULTS: AttackSurfaceData = {
  attackVectors: INITIAL_ATTACK_SURFACE_VECTORS,
  impactConfig: INITIAL_ORGANIZATIONAL_IMPACT_CONFIG,
  nuclearScenarios: INITIAL_NUCLEAR_DISASTER_SCENARIOS,
};

export const AttackSurfaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useLocalStorage<AttackSurfaceData>('llmGuardrailAttackSurface', DEFAULTS);

  const updateAttackVector = (id: string, updatedData: Partial<AttackSurfaceVector>) => {
    setData(prev => ({ ...prev, attackVectors: prev.attackVectors.map(v => (v.id === id ? { ...v, ...updatedData } : v)) }));
  };

  const updateImpactConfig = (level: ImpactLevelName, updatedData: Partial<OrganizationalImpactConfig>) => {
    setData(prev => ({ ...prev, impactConfig: prev.impactConfig.map(c => (c.level === level ? { ...c, ...updatedData } : c)) }));
  };

  const updateNuclearScenario = (id: string, updatedData: Partial<NuclearDisasterScenario>) => {
    setData(prev => ({ ...prev, nuclearScenarios: prev.nuclearScenarios.map(s => (s.id === id ? { ...s, ...updatedData } : s)) }));
  };

  return (
    <AttackSurfaceContext.Provider value={{
      attackVectors: data.attackVectors,
      impactConfig: data.impactConfig,
      nuclearScenarios: data.nuclearScenarios,
      updateAttackVector,
      updateImpactConfig,
      updateNuclearScenario,
    }}>
      {children}
    </AttackSurfaceContext.Provider>
  );
};

export const useAttackSurface = (): AttackSurfaceState => {
  const context = useContext(AttackSurfaceContext);
  if (context === undefined) {
    throw new Error('useAttackSurface must be used within a AttackSurfaceProvider');
  }
  return context;
};
