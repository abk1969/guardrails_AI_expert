export enum GuardrailCategory {
  SECURITY_PRIVACY = "Sécurité et Confidentialité",
  RELEVANCE_RESPONSE = "Pertinence et Réponse",
  LINGUISTIC_QUALITY = "Qualité Linguistique",
  CONTENT_VALIDATION = "Validation de Contenu",
  LOGICAL_VALIDATION = "Validation Logique",
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

export interface PromptTemplate {
  id: string;
  text: string;
  complexity: PromptComplexity;
  guide: string;
  protection: string;
}

export enum LLMProvider {
  AZURE_OPENAI = "Azure OpenAI",
  AWS_BEDROCK = "AWS Bedrock",
}

export const LLM_MODELS: Record<LLMProvider, string[]> = {
  [LLMProvider.AZURE_OPENAI]: ["GPT-4", "GPT-3.5-Turbo"],
  [LLMProvider.AWS_BEDROCK]: ["Claude 3 Opus", "Claude 3 Sonnet", "Llama 3"],
};

export interface TestConfiguration {
  categories: GuardrailCategory[];
  provider: LLMProvider;
  model: string;
  volume: number;
  intensity: number;
}

export interface TestPrompt {
  id: string;
  text: string;
  category: GuardrailCategory;
}

export enum TestStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
}

export interface TestResult {
  prompt: TestPrompt;
  response?: string;
  score: number;
  status: TestStatus;
  explanation?: string;
}