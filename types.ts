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
  customPlugins?: string[]; // Liste des plugins Promptfoo personnalisés (optionnel)
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

// AI Risk Repository Types
export interface CausalTaxonomyNode {
  id: string;
  name: string;
  description: string;
  count?: number; // Number of risks in this category
  percentage?: number; // Percentage of total risks
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

// AI Risk Entry - Individual risk from the database
export interface AIRiskEntry {
  id: string; // e.g., "RISK-0001"
  evId: string; // Evidence ID from source
  title: string;
  quickRef: string; // Quick reference (author/year)
  description: string;

  // Risk categorization
  riskCategory: string;
  riskSubcategory: string;

  // Causal taxonomy
  causal: {
    entity: 'IA' | 'Humain' | 'Autre' | '4 - Not coded';
    intentionality: 'Intentionnel' | 'Non intentionnel' | 'Autre' | '4 - Not coded';
    timing: 'Pré-déploiement' | 'Post-déploiement' | 'Autre' | '4 - Not coded';
  };

  // Domain taxonomy
  domain: {
    category: string;
    subcategory: string;
  };

  // Metadata
  source: string;
  paperId: string;
  categoryLevel: string; // "Risk Category" or "Risk Sub-Category"
  additionalEvidence: string;

  // Search support
  searchText: string; // Normalized text for full-text search
}

// AI Risk Database Metadata
export interface AIRiskMetadata {
  version: string;
  lastUpdated: string;
  extractedAt: string;
  totalRisks: number;
  language: string;
  source: string;
  license: string;
}

// AI Risk Statistics
export interface AIRiskStatistics {
  total: number;
  byEntity: Record<string, number>;
  byIntentionality: Record<string, number>;
  byTiming: Record<string, number>;
  byDomain: Record<string, number>;
}

// Included Resource from the AI Risk Repository
export interface IncludedResource {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: string; // e.g., "Academic Paper", "Report", "Framework"
  organization?: string;
  url?: string;
  description: string;
  risksCount?: number; // Number of risks from this resource
}

// ============================================================
// OWASP COMPASS (Threat Defense Framework) - Types
// ============================================================

// Bilingual text support
export interface BilingualText {
  fr: string;
  en: string;
}

// Risk level based on risk score
export type RiskLevel = 'critical' | 'high' | 'moderate' | 'low';

// OODA Loop phases
export enum OODAPhase {
  OBSERVE = 'observe',
  ORIENT = 'orient',
  DECIDE = 'decide',
  ACT = 'act'
}

// COMPASS Use Case (from "Notes Uses Cases" sheet)
export interface CompassUseCase {
  id: string;
  title: BilingualText;
  description: BilingualText;

  // Risk scoring (1-5 scale)
  impact: 1 | 2 | 3 | 4 | 5;
  likelihood: 1 | 2 | 3 | 4 | 5;
  riskScore: number; // impact × likelihood
  riskLevel: RiskLevel; // calculated from riskScore

  // Recommendations and threat info
  recommendation: BilingualText;
  associatedThreat: BilingualText;

  // MITRE ATT&CK / ATLAS mapping
  attackMapping: {
    mitre?: string; // e.g., "T1566.001"
    atlas?: string; // e.g., "T1647"
    description?: BilingualText;
  };

  // Cross-module relationships
  relatedSheets: {
    vulnerabilities: string[]; // IDs from "3a Orient Known AI Vulnerabilit"
    incidents: string[]; // IDs from "3b Orient Known AI Incidents"
    defenses: string[]; // IDs from "6a Reference Defenses & Mitigat"
    questions: string[]; // IDs from "6c Reference Third Party Questi"
    threatProfiles: string[]; // IDs from "2a Observe Objective Threat Pr"
    attackSurfaces: string[]; // IDs from "2b Observe Attack Surface Analy"
    incidentReadiness: string[]; // IDs from "3c Orient AI Incident Response"
    redTeamSecurity: string[]; // IDs from "3d Orient Red Team Security Rev"
    redTeamResults: string[]; // IDs from "3e Orient AI Red Team Results"
    useCases: string[]; // IDs from "1 Observe Business Context & Us"
  };

  // OODA phase association
  oodaPhase: OODAPhase;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// OWASP Sheet (represents one tab from the Excel file)
export interface OWASPSheet {
  id: string;
  name: string;
  title: BilingualText;
  description: BilingualText;
  oodaPhase: OODAPhase | null; // null for reference sheets
  icon?: string; // Lucide icon name
  color?: string; // Tailwind color class
  order: number; // Display order
}

// OODA Progress tracking
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

// Threat Profile (from "2a Observe Objective Threat Pr")
export interface CompassThreatProfile {
  id: string;
  name: BilingualText;
  description: BilingualText;
  systemType: string; // e.g., "Internal chatbot", "Public API"
  aiComponents: AIComponentType[];
  riskAppetite: 'low' | 'medium' | 'high';
  criticalAssets: string[];
  complianceRequirements: string[];
}

// Attack Surface Analysis (from "2b Observe Attack Surface Analy")
export interface AttackSurface {
  id: string;
  component: BilingualText;
  exposureLevel: 'public' | 'internal' | 'restricted';
  attackVectors: BilingualText[];
  existingControls: BilingualText[];
  gaps: BilingualText[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

// Known Vulnerability (from "3a Orient Known AI Vulnerabilit")
export interface CompassKnownVulnerability {
  id: string;
  title: BilingualText;
  description: BilingualText;
  cveId?: string;
  owaspCategory: string; // OWASP LLM Top 10 or Agentic Top 15
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedComponents: string[];
  exploitAvailable: boolean;
  mitigations: BilingualText[];
  references: string[];
}

// Known Incident (from "3b Orient Known AI Incidents")
export interface KnownIncident {
  id: string;
  title: BilingualText;
  date: string;
  organization?: string;
  description: BilingualText;
  impact: BilingualText;
  rootCause: BilingualText;
  lessonsLearned: BilingualText;
  relatedVulnerabilities: string[]; // IDs of KnownVulnerability
  publicReport?: string; // URL
}

// Defense/Mitigation (from "6a Reference Defenses & Mitigat")
export interface DefenseMitigation {
  id: string;
  name: BilingualText;
  description: BilingualText;
  category: string; // e.g., "Input Validation", "Output Filtering"
  effectiveness: 'high' | 'medium' | 'low';
  implementationComplexity: 'high' | 'medium' | 'low';
  cost: 'high' | 'medium' | 'low';
  applicableThreats: string[]; // IDs of CompassUseCase
  implementationGuidance: BilingualText;
  tools?: string[];
  references?: string[];
}

// Third Party Question (from "6c Reference Third Party Questi")
export interface ThirdPartyQuestion {
  id: string;
  category: BilingualText;
  question: BilingualText;
  rationale: BilingualText;
  expectedAnswers: BilingualText[];
  redFlags: BilingualText[];
  relatedThreats: string[]; // IDs of CompassUseCase
}

// ============================================================================
// APPLICATION PROFILE MANAGEMENT
// Pour gérer le profil des applications à tester (multiarchitectures)
// ============================================================================

export type ApplicationArchitecture =
  | 'llm-chatbot'
  | 'rag'
  | 'agentic-rag'
  | 'text-to-speech'
  | 'text-to-video'
  | 'video-to-text'
  | 'speech-to-text'
  | 'complex-pipeline'
  | 'code-generation'
  | 'other';

export type TestMode = 'blackbox' | 'whitebox';

export type AuthenticationType =
  | 'none'
  | 'api-key'
  | 'bearer-token'
  | 'oauth'
  | 'basic-auth'
  | 'custom-header';

export type InputOutputType =
  | 'text'
  | 'audio'
  | 'video'
  | 'image'
  | 'multimodal';

export interface ApplicationEndpoint {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  bodyTemplate?: string; // Template with {{prompt}} placeholder
  responseField?: string; // JSON path to extract response (e.g., "data.response")
}

export interface ApplicationAuthentication {
  type: AuthenticationType;
  credentials?: {
    apiKey?: string;
    token?: string;
    username?: string;
    password?: string;
    customHeaders?: Record<string, string>;
  };
  // Pour mode whitebox : stockage sécurisé des credentials
  isEncrypted?: boolean;
}

export interface ApplicationTestability {
  promptfooCompatible: boolean; // Peut être testé avec Promptfoo ?
  requiresCustomTest: boolean; // Nécessite des tests custom ?
  inputType: InputOutputType;
  outputType: InputOutputType;
  limitations?: string[]; // Limites connues (rate limit, etc.)
  estimatedTestDuration?: number; // En minutes
}

export interface ApplicationSafetyConfig {
  maxRequestsPerMinute?: number; // Rate limiting
  maxTestsPerSession?: number; // Limite de tests
  allowedPlugins?: string[]; // Plugins autorisés (si restriction)
  dangerousPlugins?: string[]; // Plugins à éviter (ex: harmful-* pour prod)
  requiresConfirmation?: boolean; // Confirmation avant chaque test
  productionEnvironment?: boolean; // Flag si app en production
}

export interface ApplicationProfile {
  id: string;
  name: string;
  description?: string;
  architecture: ApplicationArchitecture;
  testMode: TestMode;

  // Configuration de l'endpoint
  endpoint: ApplicationEndpoint;

  // Authentication (optionnel pour blackbox simple)
  authentication?: ApplicationAuthentication;

  // Testability
  testability: ApplicationTestability;

  // Safety configuration
  safetyConfig: ApplicationSafetyConfig;

  // Metadata
  owner?: string; // Nom du client ou propriétaire
  tags?: string[]; // Tags pour catégorisation
  createdAt: string;
  updatedAt: string;

  // Test history
  lastTestedAt?: string;
  testCount?: number;
}

export interface ApplicationTestSession {
  id: string;
  applicationId: string;
  applicationName: string;
  startedAt: string;
  completedAt?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

  // Configuration du test
  testType: 'promptfoo' | 'custom-multimodal' | 'manual';
  promptfooConfig?: string; // YAML content si Promptfoo

  // Résultats
  results?: {
    totalTests: number;
    passed: number;
    failed: number;
    score?: number;
    duration?: number; // En secondes
    outputPath?: string; // Chemin vers résultats JSON
  };

  // Logs et audit
  logs: string[];
  warnings: string[];
  errors: string[];
}