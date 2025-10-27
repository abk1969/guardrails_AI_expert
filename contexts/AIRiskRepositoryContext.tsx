import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  CausalTaxonomyNode,
  DatabaseExplainerContent,
  RiskDatabaseExample,
  AIRiskEntry,
  AIRiskMetadata,
  AIRiskStatistics
} from '../types';
import {
  CAUSAL_TAXONOMY_DATA,
  DOMAIN_TAXONOMY_DATA,
  DATABASE_EXPLAINER_CONTENT,
  RISK_DATABASE_EXAMPLES,
  AI_RISK_DATABASE,
  AI_RISK_METADATA,
  AI_RISK_STATISTICS,
  AIRiskFilters,
  searchAndFilterRisks,
  getRiskById,
  getRelatedRisks
} from '../data/aiRiskRepositoryContent';

interface AIRiskRepositoryState {
  // Taxonomies
  causalTaxonomy: CausalTaxonomyNode[];
  domainTaxonomy: CausalTaxonomyNode[];
  databaseExplainerContent: DatabaseExplainerContent[];
  riskDatabaseExamples: RiskDatabaseExample[];

  // AI Risk Database (1,350 risks)
  allRisks: AIRiskEntry[];
  metadata: AIRiskMetadata;
  statistics: AIRiskStatistics;

  // Filtering and search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: AIRiskFilters;
  setFilters: (filters: AIRiskFilters) => void;
  filteredRisks: AIRiskEntry[];

  // Selected risk for detail view
  selectedRisk: AIRiskEntry | null;
  setSelectedRisk: (risk: AIRiskEntry | null) => void;

  // Utility functions
  getRiskById: (id: string) => AIRiskEntry | undefined;
  getRelatedRisks: (riskId: string, limit?: number) => AIRiskEntry[];
  clearFilters: () => void;
}

const AIRiskRepositoryContext = createContext<AIRiskRepositoryState | undefined>(undefined);

export const AIRiskRepositoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [causalTaxonomy] = useState<CausalTaxonomyNode[]>(CAUSAL_TAXONOMY_DATA);
  const [domainTaxonomy] = useState<CausalTaxonomyNode[]>(DOMAIN_TAXONOMY_DATA);
  const [databaseExplainerContent] = useState<DatabaseExplainerContent[]>(DATABASE_EXPLAINER_CONTENT);
  const [riskDatabaseExamples] = useState<RiskDatabaseExample[]>(RISK_DATABASE_EXAMPLES);

  // AI Risk Database
  const [allRisks] = useState<AIRiskEntry[]>(AI_RISK_DATABASE as AIRiskEntry[]);
  const [metadata] = useState<AIRiskMetadata>(AI_RISK_METADATA as AIRiskMetadata);
  const [statistics] = useState<AIRiskStatistics>(AI_RISK_STATISTICS as AIRiskStatistics);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<AIRiskFilters>({});

  // Selected risk state
  const [selectedRisk, setSelectedRisk] = useState<AIRiskEntry | null>(null);

  // Filtered risks using useMemo for performance
  const filteredRisks = useMemo(() => {
    return searchAndFilterRisks(searchQuery, filters);
  }, [searchQuery, filters]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({});
  };

  return (
    <AIRiskRepositoryContext.Provider value={{
      causalTaxonomy,
      domainTaxonomy,
      databaseExplainerContent,
      riskDatabaseExamples,
      allRisks,
      metadata,
      statistics,
      searchQuery,
      setSearchQuery,
      filters,
      setFilters,
      filteredRisks,
      selectedRisk,
      setSelectedRisk,
      getRiskById,
      getRelatedRisks,
      clearFilters
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