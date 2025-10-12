import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { KnownVulnerability } from '../types';
import { INITIAL_KNOWN_VULNERABILITIES } from '../constants';

interface KnownVulnerabilitiesState {
  vulnerabilities: KnownVulnerability[];
  addVulnerability: (vulnerability: Omit<KnownVulnerability, 'id'>) => void;
  updateVulnerability: (id: string, updatedVulnerability: Partial<Omit<KnownVulnerability, 'id'>>) => void;
  deleteVulnerability: (id: string) => void;
}

const KnownVulnerabilitiesContext = createContext<KnownVulnerabilitiesState | undefined>(undefined);

const VULNERABILITIES_STORAGE_KEY = 'llmGuardrailKnownVulnerabilities';

export const KnownVulnerabilitiesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vulnerabilities, setVulnerabilities] = useState<KnownVulnerability[]>(() => {
    try {
      const storedData = localStorage.getItem(VULNERABILITIES_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : INITIAL_KNOWN_VULNERABILITIES;
    } catch (error) {
      console.error("Failed to load known vulnerabilities from localStorage", error);
      return INITIAL_KNOWN_VULNERABILITIES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VULNERABILITIES_STORAGE_KEY, JSON.stringify(vulnerabilities));
    } catch (error) {
      console.error("Failed to save known vulnerabilities to localStorage", error);
    }
  }, [vulnerabilities]);

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
