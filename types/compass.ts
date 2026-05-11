// OWASP COMPASS (Threat Defense Framework) types

import { AIComponentType } from './test-execution';

export interface BilingualText {
  fr: string;
  en: string;
}

export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low';

export interface PDFLink {
  pdfId: string;
  itemIds?: string[];
  relevance?: BilingualText;
}

// String literal union (was previously an enum). Switched so that JSON
// data files like data/compassContent.ts can use bare string literals
// (`oodaPhase: "orient"`) without an explicit cast. Backwards compatible
// at runtime because all enum values were already these exact strings.
// No code reads OODAPhase as a value (verified via grep) — only as a
// type — so the union is functionally equivalent.
export type OODAPhase = 'observe' | 'orient' | 'decide' | 'act';

export interface CompassUseCase {
  id: string;
  title: BilingualText;
  description: BilingualText;
  impact: 1 | 2 | 3 | 4 | 5;
  likelihood: 1 | 2 | 3 | 4 | 5;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendation: BilingualText;
  associatedThreat: BilingualText;
  attackMapping: {
    mitre?: string;
    atlas?: string;
    description?: BilingualText;
  };
  /**
   * Related sheets indexed into other COMPASS arrays. The auto-generator
   * (scripts/transform-compass-data.cjs) emits numeric indices for the
   * referential lookups (defenses, questions, threatProfiles,
   * attackSurfaces, incidentReadiness, redTeamSecurity, redTeamResults,
   * useCases) and string descriptors for the human-authored fields
   * (vulnerabilities CVE codes, incidents textual descriptions). The
   * union (string | number)[] reflects both shapes without forcing the
   * generator to coerce — keep both forms readable in the JSON.
   */
  relatedSheets: {
    vulnerabilities: string[];
    incidents: string[];
    defenses: (string | number)[];
    questions: (string | number)[];
    threatProfiles: (string | number)[];
    attackSurfaces: (string | number)[];
    incidentReadiness: (string | number)[];
    redTeamSecurity: (string | number)[];
    redTeamResults: (string | number)[];
    useCases: (string | number)[];
  };
  oodaPhase: OODAPhase;
  relatedPDFs?: PDFLink[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OWASPSheet {
  id: string;
  name: string;
  title: BilingualText;
  description: BilingualText;
  oodaPhase: OODAPhase | null;
  icon?: string;
  color?: string;
  order: number;
}

export interface OODAProgress {
  observe: {
    completed: boolean;
    profileDefined: boolean;
    attackSurfaceAnalyzed: boolean;
  };
  orient: {
    completed: boolean;
    vulnerabilitiesReviewed: boolean;
    incidentsReviewed: boolean;
    redTeamCompleted: boolean;
  };
  decide: {
    completed: boolean;
    prioritizationDone: boolean;
    mitigationsPrioritized: boolean;
  };
  act: {
    completed: boolean;
    strategyDefined: boolean;
    roadmapCreated: boolean;
  };
}

export interface CompassThreatProfile {
  id: string;
  name: BilingualText;
  description: BilingualText;
  systemType: string;
  aiComponents: AIComponentType[];
  riskAppetite: 'low' | 'medium' | 'high';
  criticalAssets: string[];
  complianceRequirements: string[];
}

export interface AttackSurface {
  id: string;
  component: BilingualText;
  exposureLevel: 'public' | 'internal' | 'restricted';
  attackVectors: BilingualText[];
  existingControls: BilingualText[];
  gaps: BilingualText[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface CompassKnownVulnerability {
  id: string;
  title: BilingualText;
  description: BilingualText;
  cveId?: string;
  owaspCategory: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedComponents: string[];
  exploitAvailable: boolean;
  mitigations: BilingualText[];
  references: string[];
}

export interface KnownIncident {
  id: string;
  title: BilingualText;
  date: string;
  organization?: string;
  description: BilingualText;
  impact: BilingualText;
  rootCause: BilingualText;
  lessonsLearned: BilingualText;
  relatedVulnerabilities: string[];
  publicReport?: string;
}

export interface DefenseMitigation {
  id: string;
  name: BilingualText;
  description: BilingualText;
  category: string;
  effectiveness: 'high' | 'medium' | 'low';
  implementationComplexity: 'high' | 'medium' | 'low';
  cost: 'high' | 'medium' | 'low';
  applicableThreats: string[];
  implementationGuidance: BilingualText;
  tools?: string[];
  references?: string[];
}

export interface ThirdPartyQuestion {
  id: string;
  category: BilingualText;
  question: BilingualText;
  rationale: BilingualText;
  expectedAnswers: BilingualText[];
  redFlags: BilingualText[];
  relatedThreats: string[];
}
