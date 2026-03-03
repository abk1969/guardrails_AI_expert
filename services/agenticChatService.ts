import type { ChatbotSendRequest, ChatbotSendResponse } from '../types/chatbot';
import { backendStatus } from './backendStatus';

/**
 * Send a message to the agentic chatbot backend.
 * Returns a sessionId for WebSocket subscription.
 */
export async function sendAgenticMessage(request: ChatbotSendRequest): Promise<ChatbotSendResponse> {
  const response = await fetch(`${backendStatus.apiUrl}/chatbot/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Chatbot API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Check if backend is available (delegates to centralized backendStatus)
 */
export async function isBackendAvailable(): Promise<boolean> {
  return backendStatus.check();
}

/**
 * Fallback response when backend is unavailable (standalone mode)
 */
export function generateFallbackResponse(userMessage: string): string {
  const lowerMsg = userMessage.toLowerCase();

  if (lowerMsg.includes('compass') || lowerMsg.includes('owasp')) {
    return "Le module COMPASS propose 31 scenarios de menaces bases sur le framework OWASP LLM Top 10. Pour une analyse detaillee, veuillez activer le backend ou consulter la section Referentiels > COMPASS.";
  }
  if (lowerMsg.includes('risque') || lowerMsg.includes('risk')) {
    return "La base de risques IA contient des centaines d'entrees classees par domaine, entite et intentionnalite. Connectez-vous au backend pour des recherches avancees.";
  }
  if (lowerMsg.includes('garak') || lowerMsg.includes('promptfoo')) {
    return "Les outils de pentest (Garak, Promptfoo) necessitent le backend Docker. Lancez 'docker-compose up -d' pour les activer.";
  }
  if (lowerMsg.includes('politique') || lowerMsg.includes('policy') || lowerMsg.includes('sia')) {
    return "Les politiques IA (regles SIA) sont gerees dans le module Gouvernance IA. Le backend est necessaire pour les interroger.";
  }

  return "Je suis en mode hors-ligne. Mes capacites sont limitees sans connexion au backend. Veuillez lancer le backend pour acceder a l'analyse complete par IA avec raisonnement agentique et acces aux 25 outils MCP.";
}
