// ============================================================
// Agentic Security Analysis Types
// Source: 20260302_AgentsSecurityAnalyse_Enriched_V2.xlsx
// 33 threats across 9 categories with MAESTRO framework mapping
// ============================================================

export type GRCPriority = 'CRITIQUE' | 'HAUTE' | 'MOYENNE' | 'BASSE';

export interface AgenticSecurityThreat {
  id: string;                          // "AST-001", "AST-002", etc.
  category: string;                     // e.g., "Logique & Objectifs"
  categoryIcon: string;                 // e.g., "Le Cerveau"
  categoryIndex: number;                // 1-9
  threatName: string;                   // French name
  threatNameEn: string;                 // English name in parentheses
  owaspCode: string;                    // e.g., "ASI01 / T06"
  riskDescription: string;
  attackMechanism: string;              // Red Team view
  impactAndExamples: string;            // Real-world examples
  mitigations: string[];                // Blue Team measures with SEC codes
  mitRiskReferences: string[];          // MIT AI Risk Repository refs
  maestroLayer: string;                 // MAESTRO layer(s)
  grcPriority: GRCPriority;
  mitreAtlasRef?: string;              // MITRE ATLAS reference
}

export interface AgenticSecurityCategory {
  index: number;
  name: string;                         // e.g., "Logique & Objectifs"
  icon: string;                         // e.g., "Le Cerveau"
  threatCount: number;
  threats: string[];                    // threat IDs
}

export interface MaestroLayer {
  index: number;
  name: string;
  nameFr: string;
  description: string;
}

export interface AgenticSecurityStatistics {
  totalThreats: number;
  byCategory: Record<string, number>;
  byPriority: Record<GRCPriority, number>;
  byMaestroLayer: Record<string, number>;
}
