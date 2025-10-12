import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ThreatProfile } from '../types';
import { INITIAL_THREAT_PROFILES } from '../constants';

interface ThreatProfileState {
  threatProfiles: ThreatProfile[];
  addThreatProfile: (profileName: string) => void;
  updateThreatProfile: (id: string, updatedThreat: Partial<ThreatProfile>) => void;
  deleteThreatProfile: (id: string) => void;
}

const ThreatProfileContext = createContext<ThreatProfileState | undefined>(undefined);

const THREAT_PROFILE_STORAGE_KEY = 'llmGuardrailThreatProfiles';

export const ThreatProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [threatProfiles, setThreatProfiles] = useState<ThreatProfile[]>(() => {
    try {
      const storedData = localStorage.getItem(THREAT_PROFILE_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : INITIAL_THREAT_PROFILES;
    } catch (error) {
      console.error("Failed to load threat profiles from localStorage", error);
      return INITIAL_THREAT_PROFILES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THREAT_PROFILE_STORAGE_KEY, JSON.stringify(threatProfiles));
    } catch (error) {
      console.error("Failed to save threat profiles to localStorage", error);
    }
  }, [threatProfiles]);

  const addThreatProfile = (profileName: string) => {
    const newThreat: ThreatProfile = {
      id: `tp-custom-${crypto.randomUUID()}`,
      profile: profileName,
      threat: 'Nouveau vecteur d\'attaque...',
      note: '',
      initialRating: '',
      defenses: '',
    };
    setThreatProfiles(prev => [...prev, newThreat]);
  };

  const updateThreatProfile = (id: string, updatedData: Partial<ThreatProfile>) => {
    setThreatProfiles(prev =>
      prev.map(tp => (tp.id === id ? { ...tp, ...updatedData } : tp))
    );
  };

  const deleteThreatProfile = (id: string) => {
    setThreatProfiles(prev => prev.filter(tp => tp.id !== id));
  };

  return (
    <ThreatProfileContext.Provider value={{ threatProfiles, addThreatProfile, updateThreatProfile, deleteThreatProfile }}>
      {children}
    </ThreatProfileContext.Provider>
  );
};

export const useThreatProfile = (): ThreatProfileState => {
  const context = useContext(ThreatProfileContext);
  if (context === undefined) {
    throw new Error('useThreatProfile must be used within a ThreatProfileProvider');
  }
  return context;
};