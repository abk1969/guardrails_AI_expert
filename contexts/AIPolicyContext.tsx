import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { AIPolicyChapter, AIPolicyRule, AIPolicyRuleStatus } from '../types';
import { CLUSIF_AI_POLICY } from '../data/aiPolicyContentNew';

interface AIPolicyState {
  policyData: AIPolicyChapter[];
  updateRule: (ruleId: string, updates: Partial<AIPolicyRule>) => void;
  importPolicyData: (data: AIPolicyChapter[]) => boolean;
}

const AIPolicyContext = createContext<AIPolicyState | undefined>(undefined);

const STORAGE_KEY = 'llmGuardrailAIPolicy';

export const AIPolicyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [policyData, setPolicyData] = useState<AIPolicyChapter[]>(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        // Basic validation
        const parsed = JSON.parse(storedData);
        if (Array.isArray(parsed) && parsed.length > 0 && 'sections' in parsed[0]) {
          return parsed;
        }
      }
      return CLUSIF_AI_POLICY;
    } catch (error) {
      console.error("Failed to load AI policy from localStorage", error);
      return CLUSIF_AI_POLICY;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(policyData));
    } catch (error) {
      console.error("Failed to save AI policy to localStorage", error);
    }
  }, [policyData]);

  const updateRule = useCallback((ruleId: string, updates: Partial<AIPolicyRule>) => {
    setPolicyData(currentData => {
      // Deep map to find and update the rule immutably
      return currentData.map(chapter => ({
        ...chapter,
        sections: chapter.sections.map(section => ({
          ...section,
          content: section.content.map(item => {
            if (item.type === 'rule' && item.rule.id === ruleId) {
              return {
                ...item,
                rule: {
                  ...item.rule,
                  ...updates,
                }
              };
            }
            return item;
          })
        }))
      }));
    });
  }, []);

  const importPolicyData = (data: AIPolicyChapter[]): boolean => {
     if (Array.isArray(data) && data.length > 0 && 'sections' in data[0]) {
      setPolicyData(data);
      return true;
    }
    return false;
  };

  return (
    <AIPolicyContext.Provider value={{ policyData, updateRule, importPolicyData }}>
      {children}
    </AIPolicyContext.Provider>
  );
};

export const useAIPolicy = (): AIPolicyState => {
  const context = useContext(AIPolicyContext);
  if (context === undefined) {
    throw new Error('useAIPolicy must be used within a AIPolicyProvider');
  }
  return context;
};
