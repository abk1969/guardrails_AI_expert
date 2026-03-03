/**
 * Types pour le module Garak - Scanner de vulnérabilités LLM
 *
 * Types frontend alignés sur les DTOs backend (scan-config.dto.ts, scan-result.dto.ts).
 * Les enums reproduisent les valeurs backend pour assurer la cohérence API.
 */

// ---------------------------------------------------------------------------
// Enums (miroir des DTOs backend)
// ---------------------------------------------------------------------------

/** Types de sondes Garak disponibles */
export type GarakProbeType =
  | 'all'
  | 'encoding'
  | 'injection'
  | 'toxicity'
  | 'jailbreak'
  | 'hallucination'
  | 'leakage'
  | 'malicious';

/** Fournisseurs de modèles supportés par Garak */
export type GarakModelType =
  | 'openai'
  | 'google'
  | 'gemini'
  | 'anthropic'
  | 'huggingface'
  | 'litellm';

/** Préréglages de scan avec ensembles de sondes prédéfinis */
export type GarakScanPreset = 'quick' | 'standard' | 'thorough';

/** Niveau de sévérité d'une vulnérabilité */
export type GarakSeverity = 'critical' | 'high' | 'moderate' | 'low';

/** Statut d'un scan */
export type GarakScanStatus = 'pending' | 'running' | 'completed' | 'failed';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration d'un scan Garak (aligné sur ScanConfigDto backend) */
export interface GarakScanConfig {
  /** Modèle LLM à analyser (ex: "gpt-4", "gemini-2.0-flash") */
  model: string;
  /** Type/fournisseur du modèle */
  modelType?: GarakModelType;
  /** Clé API du fournisseur (transmise en variable d'environnement au conteneur) */
  apiKey?: string;
  /** Types de sondes a executer */
  probes: GarakProbeType[];
  /** Générateurs de prompts */
  generators: string[];
  /** Détecteurs de vulnérabilités */
  detectors: string[];
  /** Préréglage (remplace les probes par un ensemble prédéfini) */
  preset?: GarakScanPreset;
  /** Timeout en millisecondes (60000 - 7200000) */
  timeoutMs?: number;
}

/** Sondes associées à chaque préréglage */
export const GARAK_PRESET_PROBES: Record<GarakScanPreset, GarakProbeType[]> = {
  quick: ['injection', 'jailbreak', 'toxicity'],
  standard: ['injection', 'jailbreak', 'toxicity', 'encoding', 'leakage', 'hallucination', 'malicious'],
  thorough: ['all'],
};

// ---------------------------------------------------------------------------
// Sondes disponibles (métadonnées UI)
// ---------------------------------------------------------------------------

export interface GarakProbeInfo {
  id: GarakProbeType;
  /** Nom affiché dans l'UI */
  name: string;
  /** Description courte */
  description: string;
}

export const GARAK_AVAILABLE_PROBES: GarakProbeInfo[] = [
  { id: 'all', name: 'Tous les tests', description: 'Scan complet avec toutes les sondes' },
  { id: 'encoding', name: 'Encodage', description: 'Vulnérabilités liées aux encodages de caractères' },
  { id: 'injection', name: 'Injection de Prompts', description: 'Détection d\'injections directes et indirectes' },
  { id: 'toxicity', name: 'Toxicité', description: 'Contenu toxique, offensant ou discriminatoire' },
  { id: 'jailbreak', name: 'Jailbreak', description: 'Tentatives de contournement des guardrails' },
  { id: 'hallucination', name: 'Hallucination', description: 'Génération d\'informations fausses ou inventées' },
  { id: 'leakage', name: 'Fuite de Données', description: 'Exfiltration de données sensibles ou système' },
  { id: 'malicious', name: 'Utilisation Malveillante', description: 'Génération de contenu dangereux ou illégal' },
];

/** Labels des préréglages de scan */
export const GARAK_SCAN_PRESETS: Record<GarakScanPreset, {
  label: string;
  description: string;
  probeCount: number;
}> = {
  quick: {
    label: 'Rapide',
    description: '3 sondes essentielles - Idéal pour validation rapide',
    probeCount: 3,
  },
  standard: {
    label: 'Standard',
    description: '7 sondes - Couverture équilibrée recommandée',
    probeCount: 7,
  },
  thorough: {
    label: 'Approfondi',
    description: 'Toutes les sondes - Audit de sécurité complet',
    probeCount: 8,
  },
};

// ---------------------------------------------------------------------------
// Résultats
// ---------------------------------------------------------------------------

/** Vulnérabilité détectée par Garak (aligné sur VulnerabilityDto backend) */
export interface GarakVulnerability {
  /** Catégorie de la vulnérabilité (ex: "Prompt Injection") */
  category: string;
  /** Niveau de sévérité */
  severity: GarakSeverity;
  /** Description détaillée */
  description: string;
}

/** Résultat d'un scan Garak (aligné sur ScanResultDto backend) */
export interface GarakScanResult {
  /** Identifiant unique du scan */
  id: string;
  /** Horodatage ISO du scan */
  timestamp: string;
  /** Modèle analysé */
  model: string;
  /** Nombre total de tests exécutés */
  totalTests: number;
  /** Tests réussis */
  passed: number;
  /** Tests échoués */
  failed: number;
  /** Vulnérabilités détectées */
  vulnerabilities: GarakVulnerability[];
  /** Statut du scan */
  status: GarakScanStatus;
}

// ---------------------------------------------------------------------------
// Types partagés - Orchestration unifiée Garak/Promptfoo
// (alignés sur unified-execution.dto.ts et unified-metrics.dto.ts backend)
// ---------------------------------------------------------------------------

/** Outil de sécurité disponible */
export type SecurityTool = 'promptfoo' | 'garak';

/** Mode d'exécution unifié (aligné sur ExecutionMode backend) */
export type UnifiedExecutionMode = 'parallel' | 'sequential' | 'selective';

/** Statut d'exécution d'un outil */
export type ToolExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';

/** Statut global d'une exécution unifiée */
export type UnifiedExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'partial';

/** Statut opérationnel d'un outil */
export type ToolOperationalStatus = 'running' | 'idle' | 'error';

/** Sévérité d'une activité dans le tableau de bord unifié */
export type ActivitySeverity = 'critical' | 'high' | 'moderate' | 'low' | 'info';

/** Statut d'exécution par outil (aligné sur FrameworkExecutionStatusDto) */
export interface ToolExecutionInfo {
  tool: SecurityTool;
  status: ToolExecutionStatus;
  executionId?: string;
  progress: number;
  startTime?: string;
  endTime?: string;
  error?: string;
  results?: Record<string, unknown>;
}

/** Exécution unifiée (aligné sur UnifiedExecutionDto) */
export interface UnifiedExecution {
  id: string;
  mode: UnifiedExecutionMode;
  status: UnifiedExecutionStatus;
  tools: ToolExecutionInfo[];
  startTime: string;
  endTime?: string;
  duration: number;
  aggregatedResults?: Record<string, unknown>;
}

/** Activité récente (aligné sur ActivityDto) */
export interface SecurityActivity {
  id: string;
  tool: SecurityTool;
  action: string;
  timestamp: string;
  severity: ActivitySeverity;
}

/** Métriques unifiées du tableau de bord (aligné sur UnifiedMetricsDto) */
export interface UnifiedMetrics {
  totalTests: number;
  vulnerabilitiesFound: number;
  criticalFindings: number;
  lastScanTime: string;
  toolsStatus: Record<SecurityTool, ToolOperationalStatus>;
  recentActivity: SecurityActivity[];
}
