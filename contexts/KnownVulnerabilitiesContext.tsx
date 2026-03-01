import React, { createContext, useContext, ReactNode } from 'react';
import { KnownVulnerability } from '../types';
import { INITIAL_KNOWN_VULNERABILITIES } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface KnownVulnerabilitiesState {
  vulnerabilities: KnownVulnerability[];
  addVulnerability: (vulnerability: Omit<KnownVulnerability, 'id'>) => void;
  updateVulnerability: (id: string, updatedVulnerability: Partial<Omit<KnownVulnerability, 'id'>>) => void;
  deleteVulnerability: (id: string) => void;
}

const KnownVulnerabilitiesContext = createContext<KnownVulnerabilitiesState | undefined>(undefined);

export const KnownVulnerabilitiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vulnerabilities, setVulnerabilities] = useLocalStorage<KnownVulnerability[]>(
    'llmGuardrailKnownVulnerabilities',
    INITIAL_KNOWN_VULNERABILITIES
  );

  const addVulnerability = (vulnerabilityData: Omit<KnownVulnerability, 'id'>) => {
    const newVulnerability: KnownVulnerability = {
      ...vulnerabilityData,
      id: `kv-custom-${crypto.randomUUID()}`,
    };
    setVulnerabilities(prev => [newVulnerability, ...prev]);
  };

  const updateVulnerability = (id: string, updatedData: Partial<Omit<KnownVulnerability, 'id'>>) => {
    setVulnerabilities(prev =>
      prev.map(v => (v.id === id ? { ...v, ...updatedData } : v))
    );
  };

  const deleteVulnerability = (id: string) => {
    setVulnerabilities(prev => prev.filter(v => v.id !== id));
  };

  return (
    <KnownVulnerabilitiesContext.Provider value={{ vulnerabilities, addVulnerability, updateVulnerability, deleteVulnerability }}>
      {children}
    </KnownVulnerabilitiesContext.Provider>
  );
};

export const useKnownVulnerabilities = (): KnownVulnerabilitiesState => {
  const context = useContext(KnownVulnerabilitiesContext);
  if (context === undefined) {
    throw new Error('useKnownVulnerabilities must be used within a KnownVulnerabilitiesProvider');
  }
  return context;
};
