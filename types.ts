export enum GuardrailCategory {
  SECURITY_PRIVACY = "Sécurité et Confidentialité",
  RELEVANCE_RESPONSE = "Pertinence et Réponse",
  LINGUISTIC_QUALITY = "Qualité Linguistique",
  CONTENT_VALIDATION = "Validation de Contenu",
  LOGICAL_VALIDATION = "Validation Logique",
}

export enum AttackFamily {
  PROMPT_INJECTION = "Injection de Prompt",
  DATA_POISONING = "Empoisonnement des Données",
  RAG_ATTACKS = "Manipulation de Contexte (RAG)",
  SENSITIVE_LEAK = "Fuite d'Informations Sensibles",
  EVASION = "Attaques par Évasion",
  CUSTOM_PROMPTS = "Prompts Personnalisés"
}

export interface Guardrail {
  id: string;
  name: string;
  category: GuardrailCategory;
}

export enum PromptComplexity {
  SIMPLE = "Simple",
  MOYEN = "Moyen",
  SOPHISTIQUE = "Sophistiqué",
}

export type Sensitivity = 'Tolérant' | 'Normal' | 'Strict';

export interface PromptTemplate {
  id: string;
  text: string;
  category: GuardrailCategory;
  complexity: PromptComplexity;
  guide: string;
  protection: string;
  attackFamily: AttackFamily;
  attackTags?: string[];
}

export enum AIComponentType {
  FOUNDATION_MODEL = "Modèle de fondation (API Directe)",
  RAG_SYSTEM = "Système RAG",
  AGENT = "Agent Conversationnel",
  AGENTIC_AI = "Agentic AI (Multi-Agents)",
  AGENTIC_RAG = "Agentic RAG",
  MCP_ARCHITECTURE = "Architecture MCP (Client/Host/Server)",
  CUSTOM = "Autre (Configuration Manuelle)",
}


export interface TestTarget {
  id: string;
  name: string;
  componentType: AIComponentType;
  apiUrl: string;
  apiMethod: 'POST'; // Can be expanded later
  apiHeaders: Record<string, string>;
  apiBodyTemplate: string; // JSON string with {{prompt}} placeholder
  responseExtractionPath: string; // e.g., 'choices[0].message.content'
}

export type VulnerabilityLevel = 'Simple' | 'Moyenne' | 'Complexe';

export type SandboxVulnerabilityConfig = Partial<Record<GuardrailCategory, VulnerabilityLevel>>;

export interface TestConfiguration {
  categories: GuardrailCategory[];
  target: TestTarget;
  volume: number;
  categorySensitivities: Record<GuardrailCategory, Sensitivity>;
  complexities: PromptComplexity[];
  sandboxConfig?: SandboxVulnerabilityConfig;
}

export interface TestPrompt {
  id: string;
  text: string;
  category: GuardrailCategory;
  complexity: PromptComplexity;
  templateId: string; // To link back to the original template
}

export enum TestStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}

export interface EvaluationStep {
    stage: string;
    status: 'PASSED' | 'FAILED' | 'INFO';
    details: string;
    timestamp: string;
}

export interface TestResult {
  prompt: TestPrompt;
  response?: string;
  score: number;
  status: TestStatus;
  explanation?: string;
  evaluationChain: EvaluationStep[];
  remediation?: string;
}

export interface HistoricalRun {
  id: string;
  date: string;
  configuration: TestConfiguration;
  results: TestResult[];
}

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
  profile: string; // e.g., 'Profile 1: External Adversary'
  threat: string;
  note: string;
  initialRating: ThreatRating | '';
  defenses: string;
}

export interface AttackSurfaceVector {
  id: string;
  threat: string;
  description: string;
  riskLevel: number; // 1-5
}

export type ImpactLevelName = 'Catastrophic' | 'Severe' | 'Major' | 'Moderate' | 'Minor';

export interface OrganizationalImpactConfig {
  level: ImpactLevelName;
  rating: number;
  lowRange: string;
  highRange: string;
}


export interface NuclearDisasterScenario {
  id: string; // scenario-1, scenario-2, ...
  impactRating: number;
  scenarioDescription: string;
  lowRange: string;
  highRange: string;
}

// Settings Types
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

// Known Vulnerabilities Types
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

// Known AI Incidents Types
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

// AI Incident Response Readiness Types
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


// Red Team Security Review Types
export type RedTeamRating = 'Critical' | 'High' | 'Medium' | 'Low' | 'Not Significant';

export interface RedTeamQuestion {
  id: string;
  category: string;
  question: string;
  response: string;
  initialRating: RedTeamRating | '';
}

// Red Team Results
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

// Defenses & Mitigations Reference
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

// AI Third Party Questions
export type QuestionRating = 'Excellent' | 'Good' | 'Acceptable' | 'Poor' | 'Not Answered' | '';

export interface AIThirdPartyQuestion {
    id: string;
    category: string;
    question: string;
    response: string;
    rating: QuestionRating;
}

// Wiki Red Teamer Types
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

// AI Policy Types
export type AIPolicyRuleStatus = 'Non implémentée' | 'En cours' | 'Implémentée' | 'Non applicable';

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