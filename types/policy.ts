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
