// AI Risk Repository types

export interface CausalTaxonomyNode {
  id: string;
  name: string;
  description: string;
  count?: number;
  percentage?: number;
  children?: CausalTaxonomyNode[];
}

export interface DatabaseExplainerContent {
  id: string;
  title: string;
  content: (
    | { type: 'paragraph'; text: string }
    | { type: 'list'; items: string[] }
    | { type: 'warning'; text: string }
    | { type: 'box'; title: string; text: string }
    | { type: 'h3'; text: string }
  )[];
}

export interface RiskDatabaseExample {
  id: string;
  category: string;
  prompt: string;
  nonViolating: string;
  violating: string;
  why: string;
}

export interface AIRiskEntry {
  id: string;
  evId: string;
  title: string;
  quickRef: string;
  description: string;
  riskCategory: string;
  riskSubcategory: string;
  causal: {
    entity: 'IA' | 'Humain' | 'Autre' | '4 - Not coded';
    intentionality: 'Intentionnel' | 'Non intentionnel' | 'Autre' | '4 - Not coded';
    timing: 'Pré-déploiement' | 'Post-déploiement' | 'Autre' | '4 - Not coded';
  };
  domain: {
    category: string;
    subcategory: string;
  };
  source: string;
  paperId: string;
  categoryLevel: string;
  additionalEvidence: string;
  searchText: string;
}

export interface AIRiskMetadata {
  version: string;
  lastUpdated: string;
  extractedAt: string;
  totalRisks: number;
  language: string;
  source: string;
  license: string;
}

export interface AIRiskStatistics {
  total: number;
  byEntity: Record<string, number>;
  byIntentionality: Record<string, number>;
  byTiming: Record<string, number>;
  byDomain: Record<string, number>;
}

export interface IncludedResource {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: string;
  organization?: string;
  url?: string;
  description: string;
  risksCount?: number;
}
