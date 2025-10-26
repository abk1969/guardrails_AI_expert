import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CausalTaxonomyNode, DatabaseExplainerContent, RiskDatabaseExample } from '../types';
import { CAUSAL_TAXONOMY_DATA, DOMAIN_TAXONOMY_DATA, DATABASE_EXPLAINER_CONTENT, RISK_DATABASE_EXAMPLES } from '../data/aiRiskRepositoryContent';

interface AIRiskRepositoryState {
  causalTaxonomy: CausalTaxonomyNode[];
  domainTaxonomy: CausalTaxonomyNode[];
  databaseExplainerContent: DatabaseExplainerContent[];
  riskDatabaseExamples: RiskDatabaseExample[];
}

const AIRiskRepositoryContext = createContext<AIRiskRepositoryState | undefined>(undefined);

export const AIRiskRepositoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [causalTaxonomy] = useState<CausalTaxonomyNode[]>(CAUSAL_TAXONOMY_DATA);
  const [domainTaxonomy] = useState<CausalTaxonomyNode[]>(DOMAIN_TAXONOMY_DATA);
  const [databaseExplainerContent] = useState<DatabaseExplainerContent[]>(DATABASE_EXPLAINER_CONTENT);
  const [riskDatabaseExamples] = useState<RiskDatabaseExample[]>(RISK_DATABASE_EXAMPLES);


  return (
    <AIRiskRepositoryContext.Provider value={{ 
      causalTaxonomy,
      domainTaxonomy,
      databaseExplainerContent,
      riskDatabaseExamples
    }}>
      {children}
    </AIRiskRepositoryContext.Provider>
  );
};

export const useAIRiskRepository = (): AIRiskRepositoryState => {
  const context = useContext(AIRiskRepositoryContext);
  if (context === undefined) {
    throw new Error('useAIRiskRepository must be used within a AIRiskRepositoryProvider');
  }
  return context;
};