import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AttackSurfaceVector, OrganizationalImpactConfig, NuclearDisasterScenario, ImpactLevelName } from '../types';
import { INITIAL_ATTACK_SURFACE_VECTORS, INITIAL_ORGANIZATIONAL_IMPACT_CONFIG, INITIAL_NUCLEAR_DISASTER_SCENARIOS } from '../constants';

interface AttackSurfaceState {
  attackVectors: AttackSurfaceVector[];
  impactConfig: OrganizationalImpactConfig[];
  nuclearScenarios: NuclearDisasterScenario[];
  updateAttackVector: (id: string, updatedData: Partial<AttackSurfaceVector>) => void;
  updateImpactConfig: (level: ImpactLevelName, updatedData: Partial<OrganizationalImpactConfig>) => void;
  updateNuclearScenario: (id: string, updatedData: Partial<NuclearDisasterScenario>) => void;
}

const AttackSurfaceContext = createContext<AttackSurfaceState | undefined>(undefined);

const ATTACK_SURFACE_STORAGE_KEY = 'llmGuardrailAttackSurface';

export const AttackSurfaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [attackVectors, setAttackVectors] = useState<AttackSurfaceVector[]>([]);
  const [impactConfig, setImpactConfig] = useState<OrganizationalImpactConfig[]>([]);
  const [nuclearScenarios, setNuclearScenarios] = useState<NuclearDisasterScenario[]>([]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(ATTACK_SURFACE_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setAttackVectors(parsed.attackVectors || INITIAL_ATTACK_SURFACE_VECTORS);
        setImpactConfig(parsed.impactConfig || INITIAL_ORGANIZATIONAL_IMPACT_CONFIG);
        setNuclearScenarios(parsed.nuclearScenarios || INITIAL_NUCLEAR_DISASTER_SCENARIOS);
      } else {
        setAttackVectors(INITIAL_ATTACK_SURFACE_VECTORS);
        setImpactConfig(INITIAL_ORGANIZATIONAL_IMPACT_CONFIG);
        setNuclearScenarios(INITIAL_NUCLEAR_DISASTER_SCENARIOS);
      }
    } catch (error) {
      console.error("Failed to load attack surface data from localStorage", error);
      setAttackVectors(INITIAL_ATTACK_SURFACE_VECTORS);
      setImpactConfig(INITIAL_ORGANIZATIONAL_IMPACT_CONFIG);
      setNuclearScenarios(INITIAL_NUCLEAR_DISASTER_SCENARIOS);
    }
  }, []);

  useEffect(() => {
    try {
      const dataToStore = JSON.stringify({ attackVectors, impactConfig, nuclearScenarios });
      localStorage.setItem(ATTACK_SURFACE_STORAGE_KEY, dataToStore);
    } catch (error) {
      console.error("Failed to save attack surface data to localStorage", error);
    }
  }, [attackVectors, impactConfig, nuclearScenarios]);

  const updateAttackVector = (id: string, updatedData: Partial<AttackSurfaceVector>) => {
    setAttackVectors(prev =>
      prev.map(v => (v.id === id ? { ...v, ...updatedData } : v))
    );
  };

  const updateImpactConfig = (level: ImpactLevelName, updatedData: Partial<OrganizationalImpactConfig>) => {
    setImpactConfig(prev =>
      prev.map(c => (c.level === level ? { ...c, ...updatedData } : c))
    );
  };

  const updateNuclearScenario = (id: string, updatedData: Partial<NuclearDisasterScenario>) => {
    setNuclearScenarios(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updatedData } : s))
    );
  };

  return (
    <AttackSurfaceContext.Provider value={{
      attackVectors,
      impactConfig,
      nuclearScenarios,
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