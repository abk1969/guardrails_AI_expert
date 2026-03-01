// Risk analysis, vulnerabilities, incidents, defenses, red team, settings

export interface UseCase {
  id: string;
  useCase: string;
  impact: number;
  likelihood: number;
  riskScore: number;
  recommendation: string;
  associatedThreat: string;
  mapping: string;
}

export enum ThreatRating {
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
  NOT_SIGNIFICANT = "Not Significant",
  MINIMAL = "Minimal",
}

export interface ThreatProfile {
  id: string;
  profile: string;
  threat: string;
  note: string;
  initialRating: ThreatRating | '';
  defenses: string;
}

export interface AttackSurfaceVector {
  id: string;
  threat: string;
  description: string;
  riskLevel: number;
}

export type ImpactLevelName = 'Catastrophic' | 'Severe' | 'Major' | 'Moderate' | 'Minor';

export interface OrganizationalImpactConfig {
  level: ImpactLevelName;
  rating: number;
  lowRange: string;
  highRange: string;
}

export interface NuclearDisasterScenario {
  id: string;
  impactRating: number;
  scenarioDescription: string;
  lowRange: string;
  highRange: string;
}

export interface ImpactScoreSetting {
  score: number;
  level: ImpactLevelName;
  description: string;
}

export interface LikelihoodScoreSetting {
  score: number;
  level: string;
  description: string;
}

export interface RiskLevelSetting {
  level: ThreatRating;
  range: [number, number];
  color: string;
}

export interface ScoringSettings {
  impactScores: ImpactScoreSetting[];
  likelihoodScores: LikelihoodScoreSetting[];
  riskLevels: RiskLevelSetting[];
}

export type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | '';

export interface KnownVulnerability {
  id: string;
  organizationTool: string;
  cveIdentifier: string;
  associatedCwes: string;
  descriptionSummary: string;
  originalSeverity: VulnerabilitySeverity;
  fivePointScore: number | '';
  owaspLlmCategory: string;
  owaspCategoryName: string;
  owaspAgenticTop15: string;
  owaspAgenticTop15ThreatName: string;
}

export interface KnownAIIncident {
  id: string;
  incident: string;
  vulnerability: string;
  impact: string;
  referenceUrl: string;
}

export enum ResourceLinkCategory {
  ADVERSARY_REPORTS = 'ADVERSARY_REPORTS',
  DATABASES = 'DATABASES',
  LEGAL_REGULATORY = 'LEGAL_REGULATORY',
}

export interface ResourceLink {
  id: string;
  category: ResourceLinkCategory;
  text: string;
  url: string;
}

export type ReadinessRating = 'Critical' | 'High' | 'Medium' | 'Low' | 'Not Significant';

export interface IncidentReadinessQuestion {
  id: string;
  category: string;
  question: string;
  response: string;
  initialRating: ReadinessRating | '';
  tested: string;
  revisedRating: ReadinessRating | '';
}

export interface IncidentCategory {
  id: string;
  categoryType: string;
  examplesOfIncidents: string;
}

export interface IncidentMonitoringReference {
  id: string;
  layer: string;
  whatToMonitor: string;
  alertType: string;
  suggestedTools: string;
}

export type RedTeamRating = 'Critical' | 'High' | 'Medium' | 'Low' | 'Not Significant';

export interface RedTeamQuestion {
  id: string;
  category: string;
  question: string;
  response: string;
  initialRating: RedTeamRating | '';
}

export interface RedTeamResult {
  id: string;
  name: string;
  description: string;
  vulnerability: string;
  score: number | '';
  rating: string;
  impact: string;
}

export interface VulnerabilityReference {
  severity: number;
  vulnerability: string;
  details: string;
  link?: string;
}

export interface BugCrowdScore {
  score: number;
  cvssV3Score: string;
}

export type CompassRating = 'Critical' | 'High' | 'Medium' | 'Low' | 'None';

export interface CompassScore {
  score: number;
  rating: CompassRating;
  description: string;
  color: string;
}

export interface MitigationProfile {
  id: string;
  title: string;
  color: string;
}

export interface MitigationMapping {
  id: string;
  profileId: string;
  threatVulnerability: string;
  description: string;
  score: string;
  defenseMitigation: string;
  residualScore: string;
}

export type RoadmapStatus = 'Not Started' | 'In Progress' | 'Completed' | '';

export interface StrategyRoadmapItem {
  id: string;
  category: string;
  action: string;
  owners: string;
  strategy: string;
  timeline: string;
  status: RoadmapStatus;
}

export interface DefenseMitigationReference {
  id: string;
  attackType: string;
  threatIdName: string;
  aiStackLayer: string;
  coreAttackVector: string;
  impactBlastRadius: string;
  mitigation: string;
  references: string;
  estimatedRelation: string;
  mitreAtlasOwaspLinks: string;
}

export interface DefenseLayer {
  layer: string;
  focus: string;
}

export interface DefenseQuestion {
  question: string;
}

export interface DefenseCondition {
  condition: string;
}

export interface KeyControlStrategy {
  id: string;
  text: string;
}

export interface OwaspReference {
  id: string;
  vulnerability: string;
  examples: string;
  preventativeControls: string;
  detectiveControls: string;
}

export type QuestionRating = 'Excellent' | 'Good' | 'Acceptable' | 'Poor' | 'Not Answered' | '';

export interface AIThirdPartyQuestion {
  id: string;
  category: string;
  question: string;
  response: string;
  rating: QuestionRating;
}

export interface WikiChecklistItem {
  id: string;
  text: string;
}

export interface WikiChecklistSubSection {
  title: string;
  items: WikiChecklistItem[];
}

export interface WikiChecklistCategory {
  title: string;
  sections: WikiChecklistSubSection[];
}

export interface WikiTool {
  name: string;
  description: string;
  reference: string;
  licensing: string;
}

export interface WikiDataset {
  name: string;
  description: string;
  reference: string;
  licensing: string;
}
