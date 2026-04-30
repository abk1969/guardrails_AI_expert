export type ChatbotErrorKind =
  | 'invalid-api-key'
  | 'model-not-found'
  | 'rate-limit'
  | 'quota-exceeded'
  | 'network'
  | 'mcp-tool'
  | 'timeout'
  | 'auth'
  | 'unknown';

export interface ParsedChatbotError {
  kind: ChatbotErrorKind;
  title: string;
  detail: string;
  cta?: { label: string; action: 'open-llm-settings' | 'retry' | 'open-docs'; url?: string };
}

const PATTERNS: Array<{ rx: RegExp; build: (raw: string) => ParsedChatbotError }> = [
  {
    rx: /API_KEY_INVALID|API key not valid|Invalid API key|invalid_api_key|x-api-key.*invalid/i,
    build: () => ({
      kind: 'invalid-api-key',
      title: 'Clé API invalide',
      detail: "La clé du fournisseur LLM est rejetée. Soit la clé serveur GEMINI_API_KEY a expiré (action admin), soit ta propre configuration LLM est incorrecte.",
      cta: { label: 'Ouvrir Configuration LLM', action: 'open-llm-settings' },
    }),
  },
  {
    rx: /model.*not.*found|404.*model|invalid.*model|model.*does not exist/i,
    build: raw => ({
      kind: 'model-not-found',
      title: 'Modèle introuvable',
      detail: `Le modèle demandé n'existe pas chez le fournisseur ou n'est plus disponible. Vérifie la valeur "model" dans Configuration LLM. Détail technique : ${raw.slice(0, 200)}`,
      cta: { label: 'Ouvrir Configuration LLM', action: 'open-llm-settings' },
    }),
  },
  {
    rx: /429|rate.*limit|too many requests|RESOURCE_EXHAUSTED/i,
    build: () => ({
      kind: 'rate-limit',
      title: 'Quota temporairement dépassé',
      detail: "Le fournisseur LLM applique une limite de requêtes. Patiente quelques secondes puis réessaie, ou bascule sur un autre fournisseur.",
      cta: { label: 'Réessayer', action: 'retry' },
    }),
  },
  {
    rx: /quota|billing|payment_required|402|PERMISSION_DENIED.*quota/i,
    build: () => ({
      kind: 'quota-exceeded',
      title: 'Quota du fournisseur épuisé',
      detail: "Le forfait du fournisseur LLM est consommé pour la période courante. Renouvelle le crédit ou utilise un autre provider.",
      cta: { label: 'Ouvrir Configuration LLM', action: 'open-llm-settings' },
    }),
  },
  {
    rx: /timeout|timed out|ETIMEDOUT|deadline exceeded/i,
    build: () => ({
      kind: 'timeout',
      title: 'Délai d\'attente dépassé',
      detail: "Le fournisseur n'a pas répondu à temps. Réseau lent ou requête trop complexe. Réessaie ou raccourcis ta question.",
      cta: { label: 'Réessayer', action: 'retry' },
    }),
  },
  {
    rx: /401|UNAUTHENTICATED|unauthorized|forbidden|403/i,
    build: () => ({
      kind: 'auth',
      title: 'Authentification refusée',
      detail: "Le fournisseur a refusé la requête. Vérifie ta clé API et tes permissions sur le modèle demandé.",
      cta: { label: 'Ouvrir Configuration LLM', action: 'open-llm-settings' },
    }),
  },
  {
    rx: /MCP|tool.*error|tool_error|search_pssi|search_compass/i,
    build: raw => ({
      kind: 'mcp-tool',
      title: 'Erreur d\'un outil MCP',
      detail: `Un des 32 outils MCP a échoué pendant le raisonnement. Détail : ${raw.slice(0, 200)}`,
      cta: { label: 'Réessayer', action: 'retry' },
    }),
  },
  {
    rx: /fetch failed|ECONNREFUSED|network|ENOTFOUND|connection refused|Failed to fetch/i,
    build: () => ({
      kind: 'network',
      title: 'Backend injoignable',
      detail: "Impossible de contacter le serveur backend. Vérifie qu'il est lancé (npm run start:dev dans /backend) et que le port 3001 est ouvert.",
      cta: { label: 'Réessayer', action: 'retry' },
    }),
  },
  {
    rx: /500|502|503|504|Internal Server Error|Bad Gateway|Service Unavailable|Gateway Timeout|Chatbot API error:\s*5/i,
    build: raw => ({
      kind: 'unknown',
      title: 'Erreur serveur',
      detail: `Le backend a renvoyé une erreur serveur. Réessaye dans quelques instants ou consulte les logs backend pour le diagnostic. Détail : ${raw.slice(0, 200)}`,
      cta: { label: 'Réessayer', action: 'retry' },
    }),
  },
  {
    rx: /Chatbot API error:\s*\d{3}/i,
    build: raw => ({
      kind: 'unknown',
      title: 'Réponse backend invalide',
      detail: `Le backend a renvoyé un statut HTTP inattendu. Détail : ${raw.slice(0, 200)}`,
      cta: { label: 'Réessayer', action: 'retry' },
    }),
  },
];

export function parseChatbotError(raw: string | null | undefined): ParsedChatbotError {
  const text = String(raw || '').trim();
  if (!text) {
    return { kind: 'unknown', title: 'Erreur', detail: 'Une erreur inconnue est survenue.' };
  }
  for (const { rx, build } of PATTERNS) {
    if (rx.test(text)) return build(text);
  }
  return {
    kind: 'unknown',
    title: 'Erreur inattendue',
    detail: `Une erreur inconnue est survenue. Réessaye ou ouvre la Configuration LLM pour basculer sur un autre fournisseur. Détail : ${text.length > 300 ? text.slice(0, 300) + '…' : text}`,
    cta: { label: 'Réessayer', action: 'retry' },
  };
}
