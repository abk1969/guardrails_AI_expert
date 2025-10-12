export enum GuardrailCategory {
  SECURITY_PRIVACY = "Sécurité & Confidentialité",
  RELEVANCE_RESPONSE = "Pertinence & Réponse",
  LINGUISTIC_QUALITY = "Qualité Linguistique",
  CONTENT_VALIDATION = "Validation de Contenu",
  LOGICAL_VALIDATION = "Validation Logique",
}

export enum AttackFamily {
    PROMPT_INJECTION = "Injection de Prompt",
    EVASION = "Évasion",
    SENSITIVE_LEAK = "Fuite d'Informations Sensibles",
    RAG_ATTACKS = "Attaques RAG",
    DATA_POISONING = "Empoisonnement de Données",
    CUSTOM_PROMPTS = "Prompts Personnalisés",
}

export enum PromptComplexity {
  SIMPLE = "Simple",
  MOYEN = "Moyen",
  SOPHISTIQUE = "Sophistiqué",
}

export enum AIComponentType {
    SANDBOX = "Bac à Sable (Cible Locale)",
    FOUNDATION_MODEL = "Modèle de Fondation",
    RAG_SYSTEM = "Système RAG",
    AGENT = "Agent",
    AGENTIC_AI = "IA Agentique",
    AGENTIC_RAG = "RAG Agentique",
    MCP_ARCHITECTURE = "Architecture MCP",
    CUSTOM = "Personnalisé",
}

export interface PromptTemplate {
  id: string;
  category: GuardrailCategory;
  attackFamily: AttackFamily;
  text: string;
  complexity: PromptComplexity;
  guide: string;
  protection: string;
  attackTags?: string[];
  simulatedResponsePass?: string;
  simulatedResponseFail?: string;
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
  score: number;
  status: TestStatus;
  response?: string;
  explanation?: string;
  evaluationChain: EvaluationStep[];
  remediation?: string;
}

export type Sensitivity = 'Tolérant' | 'Normal' | 'Strict';

export type DefenseLevel = 'Faible' | 'Moyen' | 'Robuste';

export type SandboxDefenseConfig = Partial<Record<GuardrailCategory, DefenseLevel>>;

export interface TestTarget {
    id: string;
    name: string;
    componentType: AIComponentType;
    apiUrl?: string;
    apiMethod?: 'POST' | 'GET';
    apiHeaders?: Record<string, string>;
    apiBodyTemplate?: string;
    responseExtractionPath?: string;
}

export interface TestConfiguration {
  categories: GuardrailCategory[];
  target: TestTarget;
  volume: number;
  categorySensitivities: Record<GuardrailCategory, Sensitivity>;
  complexities: PromptComplexity[];
  sandboxConfig?: SandboxDefenseConfig;
}

export interface HistoricalRun {
  id: string;
  date: string;
  configuration: TestConfiguration;
  results: TestResult[];
}
