import React, { createContext, useContext, ReactNode } from 'react';
import { DefenseMitigationReference, KeyControlStrategy, OwaspReference } from '../types';
import { INITIAL_DEFENSES_MITIGATIONS, INITIAL_KEY_CONTROLS_STRATEGIES, INITIAL_KEY_DETECTION_MECHANISMS, INITIAL_OWASP_TOP_TEN_LLM, INITIAL_OWASP_AGENTIC_TOP_15 } from '../constants';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface DefensesData {
  defenses: DefenseMitigationReference[];
  keyControlsStrategies: KeyControlStrategy[];
  keyDetectionMechanisms: KeyControlStrategy[];
  owaspTopTen: OwaspReference[];
  owaspAgenticTop15: OwaspReference[];
}

interface DefensesMitigationsState {
  defenses: DefenseMitigationReference[];
  keyControlsStrategies: KeyControlStrategy[];
  keyDetectionMechanisms: KeyControlStrategy[];
  owaspTopTen: OwaspReference[];
  owaspAgenticTop15: OwaspReference[];
  addDefense: () => void;
  updateDefense: (id: string, updatedData: Partial<Omit<DefenseMitigationReference, 'id'>>) => void;
  deleteDefense: (id: string) => void;
  updateKeyControlStrategy: (id: string, text: string) => void;
  updateKeyDetectionMechanism: (id: string, text: string) => void;
  addOwaspTopTenRow: () => void;
  updateOwaspTopTenRow: (id: string, updatedData: Partial<Omit<OwaspReference, 'id'>>) => void;
  deleteOwaspTopTenRow: (id: string) => void;
  addOwaspAgentic15Row: () => void;
  updateOwaspAgentic15Row: (id: string, updatedData: Partial<Omit<OwaspReference, 'id'>>) => void;
  deleteOwaspAgentic15Row: (id: string) => void;
}

const DefensesMitigationsContext = createContext<DefensesMitigationsState | undefined>(undefined);

const DEFAULTS: DefensesData = {
  defenses: INITIAL_DEFENSES_MITIGATIONS,
  keyControlsStrategies: INITIAL_KEY_CONTROLS_STRATEGIES,
  keyDetectionMechanisms: INITIAL_KEY_DETECTION_MECHANISMS,
  owaspTopTen: INITIAL_OWASP_TOP_TEN_LLM,
  owaspAgenticTop15: INITIAL_OWASP_AGENTIC_TOP_15,
};

export const DefensesMitigationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useLocalStorage<DefensesData>('llmGuardrailDefensesMitigations', DEFAULTS);

  const addDefense = () => {
    const newDefense: DefenseMitigationReference = {
      id: `dm-custom-${crypto.randomUUID()}`,
      attackType: 'New Category',
      threatIdName: 'New Threat',
      aiStackLayer: '',
      coreAttackVector: '',
      impactBlastRadius: '',
      mitigation: '',
      references: '',
      estimatedRelation: '',
      mitreAtlasOwaspLinks: '',
    };
    setData(prev => ({ ...prev, defenses: [...prev.defenses, newDefense] }));
  };

  const updateDefense = (id: string, updatedData: Partial<Omit<DefenseMitigationReference, 'id'>>) => {
    setData(prev => ({ ...prev, defenses: prev.defenses.map(d => (d.id === id ? { ...d, ...updatedData } : d)) }));
  };

  const deleteDefense = (id: string) => {
    setData(prev => ({ ...prev, defenses: prev.defenses.filter(d => d.id !== id) }));
  };

  const updateKeyControlStrategy = (id: string, text: string) => {
    setData(prev => ({ ...prev, keyControlsStrategies: prev.keyControlsStrategies.map(k => k.id === id ? { ...k, text } : k) }));
  };

  const updateKeyDetectionMechanism = (id: string, text: string) => {
    setData(prev => ({ ...prev, keyDetectionMechanisms: prev.keyDetectionMechanisms.map(k => k.id === id ? { ...k, text } : k) }));
  };

  const addOwaspTopTenRow = () => {
    const newRow: OwaspReference = { id: `owasp-llm-custom-${crypto.randomUUID()}`, vulnerability: '', examples: '', preventativeControls: '', detectiveControls: '' };
    setData(prev => ({ ...prev, owaspTopTen: [...prev.owaspTopTen, newRow] }));
  };

  const updateOwaspTopTenRow = (id: string, updatedData: Partial<Omit<OwaspReference, 'id'>>) => {
    setData(prev => ({ ...prev, owaspTopTen: prev.owaspTopTen.map(r => r.id === id ? { ...r, ...updatedData } : r) }));
  };

  const deleteOwaspTopTenRow = (id: string) => {
    setData(prev => ({ ...prev, owaspTopTen: prev.owaspTopTen.filter(r => r.id !== id) }));
  };

  const addOwaspAgentic15Row = () => {
    const newRow: OwaspReference = { id: `owasp-a15-custom-${crypto.randomUUID()}`, vulnerability: '', examples: '', preventativeControls: '', detectiveControls: '' };
    setData(prev => ({ ...prev, owaspAgenticTop15: [...prev.owaspAgenticTop15, newRow] }));
  };

  const updateOwaspAgentic15Row = (id: string, updatedData: Partial<Omit<OwaspReference, 'id'>>) => {
    setData(prev => ({ ...prev, owaspAgenticTop15: prev.owaspAgenticTop15.map(r => r.id === id ? { ...r, ...updatedData } : r) }));
  };

  const deleteOwaspAgentic15Row = (id: string) => {
    setData(prev => ({ ...prev, owaspAgenticTop15: prev.owaspAgenticTop15.filter(r => r.id !== id) }));
  };

  return (
    <DefensesMitigationsContext.Provider value={{
      defenses: data.defenses,
      keyControlsStrategies: data.keyControlsStrategies,
      keyDetectionMechanisms: data.keyDetectionMechanisms,
      owaspTopTen: data.owaspTopTen,
      owaspAgenticTop15: data.owaspAgenticTop15,
      addDefense,
      updateDefense,
      deleteDefense,
      updateKeyControlStrategy,
      updateKeyDetectionMechanism,
      addOwaspTopTenRow,
      updateOwaspTopTenRow,
      deleteOwaspTopTenRow,
      addOwaspAgentic15Row,
      updateOwaspAgentic15Row,
      deleteOwaspAgentic15Row
    }}>
      {children}
    </DefensesMitigationsContext.Provider>
  );
};

export const useDefensesMitigations = (): DefensesMitigationsState => {
  const context = useContext(DefensesMitigationsContext);
  if (context === undefined) {
    throw new Error('useDefensesMitigations must be used within a DefensesMitigationsProvider');
  }
  return context;
};
