// AI Policy framework types

export enum AIPolicyRuleStatus {
  NOT_IMPLEMENTED = 'Non implémentée',
  IN_PROGRESS = 'En cours',
  IMPLEMENTED = 'Implémentée',
  NOT_APPLICABLE = 'Non applicable'
}

export interface RiskScenario {
  title: string;
  description: string;
  threatActor: string;
  attackVector: string;
  mitigation: string;
  impact: {
    confidentiality?: string;
    integrity?: string;
    availability?: string;
    strategic?: string;
    financial?: string;
    reputational?: string;
    operational?: string;
  };
  mappings: {
    owaspLlm?: string;
    owaspAgentic?: string;
    mitreAtlas?: string;
    nistRmf?: string;
  };
}

export interface AIPolicyRule {
  id: string;
  reference: string;
  ruleText: string;
  implementationDetails?: string;
  status: AIPolicyRuleStatus;
  notes: string;
  associatedThreat?: string;
  associatedRisk?: string;
  implementationGuide?: string;
  testingGuide?: string;
  riskScenarios?: RiskScenario[];
  // --- PSSI IA v3 consolidated fields ----------------------------------
  // Optional so the legacy 22-rule dataset stays backward-compatible.
  // Sources: data_ai_risk/PSSI_IA_v3_CONSOLIDE.pdf (parsed by
  // scripts/parse-pssi-ia-v3-pdf.cjs).
  sourcesReferentials?: string; // Référentiels sources
  testableControl?: string;     // Contrôle testable / preuve
  tier?: string;                // Tier applicable (AI Act × AISVS)
  raci?: string;                // Rôle RACI
  reviewFrequency?: string;     // Fréquence de revue
  chapterNumber?: string;       // e.g. '7' for chapter "Exigences de sécurité par phase du cycle de vie"
  chapterTitle?: string;
}

export type AIPolicyContentItem =
  | { type: 'paragraph'; content: string }
  | { type: 'list'; items: string[] }
  | { type: 'rule'; rule: AIPolicyRule }
  | { type: 'table', headers: string[], rows: (string | number)[][] };

export interface AIPolicySection {
  id: string;
  title: string;
  content: AIPolicyContentItem[];
}

export interface AIPolicyChapter {
  id: string;
  title: string;
  introduction?: string[];
  sections: AIPolicySection[];
}
