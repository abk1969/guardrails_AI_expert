import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ScoringSettings } from '../types';
import { INITIAL_SCORING_SETTINGS } from '../constants';

interface SettingsState {
  settings: ScoringSettings;
  updateSettings: (newSettings: Partial<ScoringSettings>) => void;
}

const SettingsContext = createContext<SettingsState | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'llmGuardrailScoringSettings';

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ScoringSettings>(() => {
    try {
      const storedData = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : INITIAL_SCORING_SETTINGS;
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      return INITIAL_SCORING_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<ScoringSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsState => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};