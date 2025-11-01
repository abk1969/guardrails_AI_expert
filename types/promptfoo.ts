/**
 * Types pour le module Promptfoo - Assistant Guidé
 *
 * Séparé du types.ts principal pour éviter les conflits
 */

export type PromptfooTestDepth = 'quick' | 'standard' | 'thorough';

export type PromptfooTargetPreset =
  | 'gemini-flash'
  | 'gemini-pro'
  | 'openai-gpt4'
  | 'openai-gpt35'
  | 'custom';

export interface PromptfooWizardConfig {
  // Étape 1: Configuration Simple
  targetPreset: PromptfooTargetPreset;
  customTargetUrl?: string;
  testDepth: PromptfooTestDepth;
  selectedRiskCategories: string[];

  // Étape 2: Validation
  userConfirmed: boolean;
  acceptedWarnings: boolean;

  // Métadonnées
  estimatedDuration: string;
  estimatedCost: string;
  estimatedTests: number;
}

export interface PromptfooEstimation {
  numberOfTests: number;
  estimatedDurationMinutes: number;
  estimatedCost: number;
  apiCallsEstimated: number;
  warnings: string[];
  recommendations: string[];
}

export interface PromptfooPreview {
  yamlPreview: string;
  plugins: string[];
  strategies: string[];
  targetDescription: string;
  safetyChecks: {
    isSimulationMode: boolean;
    hasBackendAvailable: boolean;
    isWithinLimits: boolean;
    isCompliant: boolean;
  };
}

export interface PromptfooDryRunResult {
  success: boolean;
  configValid: boolean;
  errors: string[];
  warnings: string[];
  wouldExecute: {
    numberOfTests: number;
    plugins: string[];
    target: string;
  };
}

export const PROMPTFOO_TARGET_PRESETS: Record<PromptfooTargetPreset, {
  id: string;
  label: string;
  description: string;
  provider: string;
  model: string;
  costPer1kTokens: number;
}> = {
  'gemini-flash': {
    id: 'gemini-flash',
    label: 'Google Gemini Flash (Rapide)',
    description: 'Modèle rapide et économique de Google',
    provider: 'vertex',
    model: 'gemini-2.0-flash-exp',
    costPer1kTokens: 0.0001
  },
  'gemini-pro': {
    id: 'gemini-pro',
    label: 'Google Gemini Pro (Avancé)',
    description: 'Modèle avancé de Google avec meilleures performances',
    provider: 'vertex',
    model: 'gemini-1.5-pro',
    costPer1kTokens: 0.001
  },
  'openai-gpt4': {
    id: 'openai-gpt4',
    label: 'OpenAI GPT-4 (Premium)',
    description: 'Modèle le plus performant d\'OpenAI',
    provider: 'openai',
    model: 'gpt-4o-mini',
    costPer1kTokens: 0.003
  },
  'openai-gpt35': {
    id: 'openai-gpt35',
    label: 'OpenAI GPT-3.5 (Économique)',
    description: 'Modèle économique d\'OpenAI',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    costPer1kTokens: 0.0005
  },
  'custom': {
    id: 'custom',
    label: 'Endpoint Personnalisé',
    description: 'Utilisez votre propre endpoint HTTP',
    provider: 'http',
    model: 'custom',
    costPer1kTokens: 0
  }
};

export const PROMPTFOO_TEST_DEPTHS: Record<PromptfooTestDepth, {
  label: string;
  description: string;
  numberOfTests: number;
  durationMinutes: number;
  icon: string;
}> = {
  'quick': {
    label: 'Rapide',
    description: 'Tests de découverte - Idéal pour premiers essais',
    numberOfTests: 5,
    durationMinutes: 5,
    icon: '⚡'
  },
  'standard': {
    label: 'Standard',
    description: 'Tests équilibrés - Recommandé pour la plupart des cas',
    numberOfTests: 15,
    durationMinutes: 15,
    icon: '✅'
  },
  'thorough': {
    label: 'Approfondi',
    description: 'Tests complets - Pour audit de sécurité détaillé',
    numberOfTests: 25,
    durationMinutes: 30,
    icon: '🔍'
  }
};

export const PROMPTFOO_RISK_CATEGORIES = [
  {
    id: 'prompt-injection',
    label: 'Injection de Prompts',
    description: 'Tentatives de manipulation du système par injection de commandes',
    critical: true
  },
  {
    id: 'jailbreak',
    label: 'Jailbreak / Contournement',
    description: 'Techniques pour contourner les guardrails de sécurité',
    critical: true
  },
  {
    id: 'pii',
    label: 'Fuite de Données Personnelles (PII)',
    description: 'Extraction ou exposition de données sensibles',
    critical: true
  },
  {
    id: 'harmful-content',
    label: 'Contenu Nuisible',
    description: 'Génération de contenu violent, illégal ou dangereux',
    critical: true
  },
  {
    id: 'hallucination',
    label: 'Hallucinations',
    description: 'Génération d\'informations fausses ou inventées',
    critical: false
  },
  {
    id: 'overreliance',
    label: 'Sur-Confiance',
    description: 'Réponses trop confiantes sans justification',
    critical: false
  }
];

/**
 * Limites de sécurité pour les débutants
 */
export const BEGINNER_MODE_LIMITS = {
  maxTests: 25,
  maxDurationMinutes: 30,
  maxCostUSD: 2.0,
  requireConfirmation: true,
  dryRunByDefault: true
};

/**
 * Limites de sécurité pour les experts
 */
export const EXPERT_MODE_LIMITS = {
  maxTests: 100,
  maxDurationMinutes: 120,
  maxCostUSD: 10.0,
  requireConfirmation: true,
  dryRunByDefault: false
};
