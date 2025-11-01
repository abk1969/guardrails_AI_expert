import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DefenseMitigationReference, KeyControlStrategy, OwaspReference } from '../types';
import { INITIAL_DEFENSES_MITIGATIONS, INITIAL_KEY_CONTROLS_STRATEGIES, INITIAL_KEY_DETECTION_MECHANISMS, INITIAL_OWASP_TOP_TEN_LLM, INITIAL_OWASP_AGENTIC_TOP_15 } from '../constants';

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

const DEFENSES_STORAGE_KEY = 'llmGuardrailDefensesMitigations';

export const DefensesMitigationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [defenses, setDefenses] = useState<DefenseMitigationReference[]>(INITIAL_DEFENSES_MITIGATIONS);
  const [keyControlsStrategies, setKeyControlsStrategies] = useState<KeyControlStrategy[]>(INITIAL_KEY_CONTROLS_STRATEGIES);
  const [keyDetectionMechanisms, setKeyDetectionMechanisms] = useState<KeyControlStrategy[]>(INITIAL_KEY_DETECTION_MECHANISMS);
  const [owaspTopTen, setOwaspTopTen] = useState<OwaspReference[]>(INITIAL_OWASP_TOP_TEN_LLM);
  const [owaspAgenticTop15, setOwaspAgenticTop15] = useState<OwaspReference[]>(INITIAL_OWASP_AGENTIC_TOP_15);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(DEFENSES_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setDefenses(parsed.defenses || INITIAL_DEFENSES_MITIGATIONS);
        setKeyControlsStrategies(parsed.keyControlsStrategies || INITIAL_KEY_CONTROLS_STRATEGIES);
        setKeyDetectionMechanisms(parsed.keyDetectionMechanisms || INITIAL_KEY_DETECTION_MECHANISMS);
        setOwaspTopTen(parsed.owaspTopTen || INITIAL_OWASP_TOP_TEN_LLM);
        setOwaspAgenticTop15(parsed.owaspAgenticTop15 || INITIAL_OWASP_AGENTIC_TOP_15);
      } else {
        setDefenses(INITIAL_DEFENSES_MITIGATIONS);
        setKeyControlsStrategies(INITIAL_KEY_CONTROLS_STRATEGIES);
        setKeyDetectionMechanisms(INITIAL_KEY_DETECTION_MECHANISMS);
        setOwaspTopTen(INITIAL_OWASP_TOP_TEN_LLM);
        setOwaspAgenticTop15(INITIAL_OWASP_AGENTIC_TOP_15);
      }
    } catch (error) {
      console.error("Failed to load defenses & mitigations from localStorage", error);
      setDefenses(INITIAL_DEFENSES_MITIGATIONS);
      setKeyControlsStrategies(INITIAL_KEY_CONTROLS_STRATEGIES);
      setKeyDetectionMechanisms(INITIAL_KEY_DETECTION_MECHANISMS);
      setOwaspTopTen(INITIAL_OWASP_TOP_TEN_LLM);
      setOwaspAgenticTop15(INITIAL_OWASP_AGENTIC_TOP_15);
    }
  }, []);

  useEffect(() => {
    try {
      const dataToStore = JSON.stringify({
        defenses,
        keyControlsStrategies,
        keyDetectionMechanisms,
        owaspTopTen,
        owaspAgenticTop15
      });
      localStorage.setItem(DEFENSES_STORAGE_KEY, dataToStore);
    } catch (error) {
      console.error("Failed to save defenses & mitigations to localStorage", error);
    }
  }, [defenses, keyControlsStrategies, keyDetectionMechanisms, owaspTopTen, owaspAgenticTop15]);

  // Defenses Matrix CRUD
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
    setDefenses(prev => [...prev, newDefense]);
  };

  const updateDefense = (id: string, updatedData: Partial<Omit<DefenseMitigationReference, 'id'>>) => {
    setDefenses(prev =>
      prev.map(d => (d.id === id ? { ...d, ...updatedData } : d))
    );
  };

  const deleteDefense = (id: string) => {
    setDefenses(prev => prev.filter(d => d.id !== id));
  };

  // Key Controls Update
  const updateKeyControlStrategy = (id: string, text: string) => {
    setKeyControlsStrategies(prev => prev.map(k => k.id === id ? { ...k, text } : k));
  };
  const updateKeyDetectionMechanism = (id: string, text: string) => {
    setKeyDetectionMechanisms(prev => prev.map(k => k.id === id ? { ...k, text } : k));
  };

  // OWASP Top 10 CRUD
  const addOwaspTopTenRow = () => {
    const newRow: OwaspReference = { id: `owasp-llm-custom-${crypto.randomUUID()}`, vulnerability: '', examples: '', preventativeControls: '', detectiveControls: '' };
    setOwaspTopTen(prev => [...prev, newRow]);
  };
  const updateOwaspTopTenRow = (id: string, updatedData: Partial<Omit<OwaspReference, 'id'>>) => {
    setOwaspTopTen(prev => prev.map(r => r.id === id ? { ...r, ...updatedData } : r));
  };
  const deleteOwaspTopTenRow = (id: string) => {
    setOwaspTopTen(prev => prev.filter(r => r.id !== id));
  };

  // OWASP Agentic 15 CRUD
  const addOwaspAgentic15Row = () => {
    const newRow: OwaspReference = { id: `owasp-a15-custom-${crypto.randomUUID()}`, vulnerability: '', examples: '', preventativeControls: '', detectiveControls: '' };
    setOwaspAgenticTop15(prev => [...prev, newRow]);
  };
  const updateOwaspAgentic15Row = (id: string, updatedData: Partial<Omit<OwaspReference, 'id'>>) => {
    setOwaspAgenticTop15(prev => prev.map(r => r.id === id ? { ...r, ...updatedData } : r));
  };
  const deleteOwaspAgentic15Row = (id: string) => {
    setOwaspAgenticTop15(prev => prev.filter(r => r.id !== id));
  };


  return (
    <DefensesMitigationsContext.Provider value={{
      defenses,
      keyControlsStrategies,
      keyDetectionMechanisms,
      owaspTopTen,
      owaspAgenticTop15,
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
