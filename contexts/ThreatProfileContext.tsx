import React, { createContext, useContext, ReactNode } from 'react';
import { ThreatProfile } from '../types';
import { INITIAL_THREAT_PROFILES } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ThreatProfileState {
  threatProfiles: ThreatProfile[];
  addThreatProfile: (profileName: string) => void;
  updateThreatProfile: (id: string, updatedThreat: Partial<ThreatProfile>) => void;
  deleteThreatProfile: (id: string) => void;
}

const ThreatProfileContext = createContext<ThreatProfileState | undefined>(undefined);

export const ThreatProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [threatProfiles, setThreatProfiles] = useLocalStorage<ThreatProfile[]>(
    'llmGuardrailThreatProfiles',
    INITIAL_THREAT_PROFILES
  );

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
