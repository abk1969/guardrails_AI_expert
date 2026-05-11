// Test configuration, prompts, results, evaluation steps

export enum GuardrailCategory {
  SECURITY_PRIVACY = "Sécurité et Confidentialité",
  RELEVANCE_RESPONSE = "Pertinence et Réponse",
  LINGUISTIC_QUALITY = "Qualité Linguistique",
  CONTENT_VALIDATION = "Validation de Contenu",
  LOGICAL_VALIDATION = "Validation Logique",
  HARMFUL_CONTENT = "Contenu Nuisible",
}

export enum AttackFamily {
  PROMPT_INJECTION = "Injection de Prompt",
  DATA_POISONING = "Empoisonnement des Données",
  RAG_ATTACKS = "Manipulation de Contexte (RAG)",
  SENSITIVE_LEAK = "Fuite d'Informations Sensibles",
  EVASION = "Attaques par Évasion",
  CUSTOM_PROMPTS = "Prompts Personnalisés",
  JAILBREAK = "Jailbreak",
  HARMFUL_CONTENT = "Contenu Nuisible Direct",
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
  apiMethod: 'POST';
  apiHeaders: Record<string, string>;
  apiBodyTemplate: string;
  responseExtractionPath: string;
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
  customPlugins?: string[];
}

export interface TestPrompt {
  id: string;
  text: string;
  category: GuardrailCategory;
  complexity: PromptComplexity;
  templateId: string;
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
