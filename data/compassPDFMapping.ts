// Mapping explicite entre CompassUseCase.id et les références PDF OWASP.
// Généré initialement par heuristiques mots-clés, puis révisable manuellement.
// Source du mapping : spec docs/superpowers/specs/2026-04-20-owasp-data-security-pdf-ingestion-design.md §6.

import type { BilingualText } from '../types/compass';

export interface PDFLink {
  pdfId: string;
  itemIds?: string[];
  relevance?: BilingualText;
}

/**
 * Mapping CompassUseCase.id → PDFLink[]
 * Chaque use-case peut pointer vers plusieurs PDF + items spécifiques.
 * Couverture garantie : les 7 use-cases `critical` ont au moins un mapping vers genai-data-security-2026.
 *
 * Règles de mapping appliquées (mots-clés sur title + associatedThreat) :
 *   jailbreak|bypass|prompt injection|control bypass|manipulation  → dsgai01, dsgai11, dsgai15
 *   data leak|exfil|PII|sensitive data|leak                        → dsgai01, dsgai14
 *   agent|autonomous|delegation|credential                         → dsgai02, dsgai06
 *   RAG|retrieval|vector|embedding                                  → dsgai13, dsgai15
 *   poisoning|tampering|supply chain                               → dsgai04, dsgai05, dsgai21
 *   shadow|unsanctioned|productivity tools|copilot                 → dsgai03, dsgai16
 *   extraction|distillation|IP theft                               → dsgai20
 *   biometric|multimodal|voice|image|OCR                           → dsgai09
 *   compliance|GDPR|HIPAA|regulatory|right to be forgotten         → dsgai07, dsgai08
 *   inference attack|reconstruction|membership                     → dsgai18
 *   hallucin|disinformation|false narrative                        → dsgai21, dsgai12
 *   SQL|NL2SQL|query                                               → dsgai12
 */
export const compassPDFMapping: Record<string, PDFLink[]> = {

  // =========================================================================
  // CRITICAL use-cases (7)
  // =========================================================================

  // UC-0001: "Jailbreak of internal chatbot"
  // threat: "Model control bypass via prompt manipulation"
  // patterns matched: jailbreak, bypass, prompt injection/manipulation
  'COMPASS-UC-0001': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai01', 'dsgai11', 'dsgai15'],
      relevance: {
        fr: 'Fuite de données sensibles (DSGAI01), contamination cross-contexte (DSGAI11) et sur-partage de fenêtre de contexte (DSGAI15) directement activables via jailbreak ou injection de prompt.',
        en: 'Sensitive data leakage (DSGAI01), cross-context conversation bleed (DSGAI11), and over-broad context window sharing (DSGAI15) are directly exploitable through jailbreak or prompt manipulation.',
      },
    },
    {
      pdfId: 'owasp-agentic-top10',
      itemIds: ['asi01'],
      relevance: {
        fr: 'Agent Goal Hijack (ASI01) — manipulation des objectifs de l\'agent via injection de prompt, directement applicable au jailbreak de chatbot interne.',
        en: 'Agent Goal Hijack (ASI01) — manipulation of agent objectives through prompt injection, directly applicable to internal chatbot jailbreak.',
      },
    },
  ],

  // UC-0003: "Prompt injection via public API"
  // threat: "Remote code execution or command injection"
  // patterns matched: prompt injection, bypass, manipulation + RCE (agentic tool misuse)
  'COMPASS-UC-0003': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai01', 'dsgai11', 'dsgai15'],
      relevance: {
        fr: 'Injection de prompt via API publique pouvant mener à une fuite de données (DSGAI01), une contamination cross-contexte (DSGAI11) et une exposition de la fenêtre de contexte (DSGAI15).',
        en: 'Prompt injection via public API can lead to sensitive data leakage (DSGAI01), cross-context bleed (DSGAI11), and context window over-sharing (DSGAI15).',
      },
    },
    {
      pdfId: 'owasp-agentic-top10',
      itemIds: ['asi01', 'asi02'],
      relevance: {
        fr: 'Hijacking des objectifs de l\'agent (ASI01) et abus d\'outils (ASI02) — l\'injection de prompt via API peut déclencher une exécution de code non prévue.',
        en: 'Agent Goal Hijack (ASI01) and Tool Misuse (ASI02) — prompt injection via public API may trigger unexpected code execution.',
      },
    },
  ],

  // UC-0004: "LLM auto-response leaks PII"
  // threat: "Unauthorized disclosure of sensitive personal data"
  // patterns matched: PII, sensitive data, leak, data leak
  'COMPASS-UC-0004': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai01', 'dsgai14'],
      relevance: {
        fr: 'Fuite de données sensibles/PII (DSGAI01) et fuite via télémétrie et journaux de monitoring excessifs (DSGAI14) — les deux vecteurs typiques d\'une auto-réponse divulguant des données personnelles.',
        en: 'Sensitive data / PII leakage (DSGAI01) and excessive telemetry & monitoring leakage (DSGAI14) — the two typical vectors through which auto-responses disclose personal data.',
      },
    },
  ],

  // UC-0006: "Unauthorized fine-tuning with sensitive data"
  // threat: "Data exfiltration through unapproved model updates"
  // patterns matched: data leak, exfil, sensitive data + shadow AI (unsanctioned), supply chain (unapproved)
  'COMPASS-UC-0006': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai01', 'dsgai03', 'dsgai04', 'dsgai14'],
      relevance: {
        fr: 'Fuite de données (DSGAI01), usage de Shadow AI non sanctionné (DSGAI03), empoisonnement de données/artefacts lors du fine-tuning non approuvé (DSGAI04), et télémétrie exposant les données d\'entraînement (DSGAI14).',
        en: 'Data leakage (DSGAI01), unsanctioned Shadow AI usage (DSGAI03), data/artifact poisoning via unapproved fine-tuning (DSGAI04), and telemetry exposing training data (DSGAI14).',
      },
    },
  ],

  // UC-0010: "Voice cloning used in phishing attack"
  // threat: "Real-time audio social engineering"
  // patterns matched: voice, multimodal, biometric
  'COMPASS-UC-0010': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai09'],
      relevance: {
        fr: 'Capture multimodale et fuite de données cross-canal (DSGAI09) — le clonage vocal exploite les flux audio/vidéo pour extraire ou usurper des données biométriques.',
        en: 'Multimodal capture and cross-channel data leakage (DSGAI09) — voice cloning exploits audio/video streams to extract or impersonate biometric data.',
      },
    },
  ],

  // UC-0019: "Malicious plugin extends LLM functions"
  // threat: "Backdoor capability injection via plugins"
  // patterns matched: poisoning/tampering/supply chain, agent/delegation/credential
  'COMPASS-UC-0019': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai04', 'dsgai05', 'dsgai06', 'dsgai21'],
      relevance: {
        fr: 'Empoisonnement d\'artefacts (DSGAI04), défaillances d\'intégrité des données (DSGAI05), risques d\'échange de données outil/plugin/agent (DSGAI06), et attaques d\'intégrité via plugins malveillants (DSGAI21).',
        en: 'Data/model/artifact poisoning (DSGAI04), data integrity & validation failures (DSGAI05), tool/plugin/agent data exchange risks (DSGAI06), and integrity attacks via malicious plugins (DSGAI21).',
      },
    },
    {
      pdfId: 'owasp-agentic-top10',
      itemIds: ['asi04'],
      relevance: {
        fr: 'Vulnérabilités de la chaîne d\'approvisionnement agentique (ASI04) — plugins non vérifiés ou frameworks compromis injectant des backdoors.',
        en: 'Agentic Supply Chain Vulnerabilities (ASI04) — unverified plugins or compromised frameworks injecting backdoor capabilities.',
      },
    },
  ],

  // UC-0021: "LLM-generated spear phishing emails"
  // threat: "Highly targeted phishing campaigns facilitated by AI."
  // patterns matched: disinformation/false narrative + hallucin
  'COMPASS-UC-0021': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai21', 'dsgai12'],
      relevance: {
        fr: 'Attaques de désinformation et d\'intégrité via empoisonnement de données (DSGAI21) et passerelles de données en langage naturel non sécurisées facilitant la génération de contenus trompeurs (DSGAI12).',
        en: 'Disinformation & integrity attacks via data poisoning (DSGAI21) and unsafe natural-language data gateways enabling deceptive content generation (DSGAI12).',
      },
    },
  ],

  // =========================================================================
  // HIGH use-cases (5 extras with clear keyword matches)
  // =========================================================================

  // UC-0009: "Supply chain AI model poisoning"
  // threat: "Model poisoning in training pipelines"
  // patterns matched: poisoning, tampering, supply chain
  'COMPASS-UC-0009': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai04', 'dsgai05', 'dsgai21'],
      relevance: {
        fr: 'Empoisonnement de données/modèles/artefacts (DSGAI04), défaillances d\'intégrité et de validation (DSGAI05) et attaques d\'intégrité dans la chaîne d\'approvisionnement (DSGAI21).',
        en: 'Data/model/artifact poisoning (DSGAI04), data integrity & validation failures (DSGAI05), and supply-chain integrity attacks (DSGAI21).',
      },
    },
    {
      pdfId: 'owasp-agentic-top10',
      itemIds: ['asi04'],
      relevance: {
        fr: 'Vulnérabilités de la chaîne d\'approvisionnement agentique (ASI04) — modèles tiers compromis ou dépendances malveillantes dans les pipelines d\'entraînement.',
        en: 'Agentic Supply Chain Vulnerabilities (ASI04) — compromised third-party models or malicious dependencies in training pipelines.',
      },
    },
  ],

  // UC-0014: "Model exposes training data fragments"
  // threat: "Exposure of proprietary or confidential training data"
  // patterns matched: data leak, extraction/distillation/IP theft
  'COMPASS-UC-0014': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai01', 'dsgai14', 'dsgai20'],
      relevance: {
        fr: 'Fuite de données sensibles depuis les poids du modèle (DSGAI01), télémétrie et journaux exposant des fragments d\'entraînement (DSGAI14), et exfiltration/réplication du modèle via extraction (DSGAI20).',
        en: 'Sensitive data leakage from model weights (DSGAI01), telemetry & monitoring exposing training fragments (DSGAI14), and model exfiltration & IP replication via extraction (DSGAI20).',
      },
    },
  ],

  // UC-0017: "GenAI use violates copyright at scale"
  // threat: "Mass-scale IP violations and legal exposure"
  // patterns matched: extraction/distillation/IP theft, compliance
  'COMPASS-UC-0017': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai20', 'dsgai07', 'dsgai08'],
      relevance: {
        fr: 'Exfiltration de modèle et réplication de propriété intellectuelle (DSGAI20), gouvernance et cycle de vie des données pour systèmes IA (DSGAI07), et violations réglementaires et de non-conformité (DSGAI08).',
        en: 'Model exfiltration & IP replication (DSGAI20), data governance, lifecycle & classification for AI systems (DSGAI07), and non-compliance & regulatory violations (DSGAI08).',
      },
    },
  ],

  // UC-0020: "Business logic bypass using LLM"
  // threat: "Bypassing rule-based business logic via LLM reasoning"
  // patterns matched: bypass, manipulation (jailbreak-class)
  'COMPASS-UC-0020': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai01', 'dsgai11', 'dsgai15'],
      relevance: {
        fr: 'Le contournement de logique métier via raisonnement LLM exploite les mêmes vecteurs que le jailbreak : fuite de données (DSGAI01), contamination cross-contexte (DSGAI11), et sur-partage de contexte (DSGAI15).',
        en: 'Business logic bypass via LLM reasoning exploits the same vectors as jailbreak: data leakage (DSGAI01), cross-context bleed (DSGAI11), and context over-sharing (DSGAI15).',
      },
    },
    {
      pdfId: 'owasp-agentic-top10',
      itemIds: ['asi01'],
      relevance: {
        fr: 'Agent Goal Hijack (ASI01) — le raisonnement LLM peut être manipulé pour contourner les règles métier, redirigeant les décisions multi-étapes.',
        en: 'Agent Goal Hijack (ASI01) — LLM reasoning can be manipulated to bypass business rules, redirecting multi-step decision flows.',
      },
    },
  ],

  // UC-0022: "AI-driven election disinformation campaign"
  // threat: "Rapid, large-scale misinformation to influence public opinion."
  // patterns matched: disinformation, false narrative, hallucin
  'COMPASS-UC-0022': [
    {
      pdfId: 'genai-data-security-2026',
      itemIds: ['dsgai21', 'dsgai12'],
      relevance: {
        fr: 'Attaques de désinformation et d\'intégrité (DSGAI21) et passerelles de données en langage naturel utilisées pour générer des narratifs trompeurs à grande échelle (DSGAI12).',
        en: 'Disinformation & integrity attacks (DSGAI21) and natural-language data gateways leveraged to generate misleading narratives at scale (DSGAI12).',
      },
    },
  ],
};

/**
 * Récupère les PDFLink pour un use-case donné.
 * Renvoie [] si aucun mapping défini.
 */
export function getPDFLinksForUseCase(useCaseId: string): PDFLink[] {
  return compassPDFMapping[useCaseId] || [];
}
