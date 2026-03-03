import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { LLMConfiguration, LLMConfigContextType } from '../types';
import { backendStatus } from '../services/backendStatus';

const LLMConfigContext = createContext<LLMConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'llm-global-config';

export const LLMConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<LLMConfiguration | null>(null);
  const [loading, setLoading] = useState(false);

  // Load config from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfigState(parsed);
      } catch (error) {
        console.error('[LLMConfig] Failed to parse stored config:', error);
      }
    }
  }, []);

  const setConfig = (newConfig: LLMConfiguration) => {
    setConfigState(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
  };

  const testConnection = async (): Promise<{ success: boolean; message: string; model?: string }> => {
    if (!config) {
      return { success: false, message: 'Aucune configuration définie' };
    }

    setLoading(true);

    try {
      // Check backend availability before attempting connection test
      if (!backendStatus.isAvailable()) {
        await backendStatus.check();
        if (!backendStatus.isAvailable()) {
          return { success: false, message: 'Backend non disponible. Le test de connexion necessite le backend Docker.' };
        }
      }

      // Test via backend API (pour éviter d'exposer la clé API côté client)
      const response = await fetch(`${backendStatus.apiUrl}/llm/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          message: result.message || 'Connexion réussie',
          model: result.model,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Échec de connexion',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Erreur réseau: ${error instanceof Error ? error.message : 'Inconnue'}`,
      };
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = config !== null && !!config.provider && !!config.model;

  return (
    <LLMConfigContext.Provider
      value={{
        config,
        setConfig,
        testConnection,
        isConfigured,
        loading,
      }}
    >
      {children}
    </LLMConfigContext.Provider>
  );
};

export const useLLMConfig = (): LLMConfigContextType => {
  const context = useContext(LLMConfigContext);
  if (!context) {
    throw new Error('useLLMConfig must be used within LLMConfigProvider');
  }
  return context;
};
