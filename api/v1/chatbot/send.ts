import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors, json } from '../../lib/neon';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return json(res, { error: 'Method not allowed' }, 405);
  }

  try {
    const { message, mode, llmConfig } = req.body || {};

    if (!message) {
      return json(res, { error: 'Message is required' }, 400);
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      // Fallback: return a helpful response without LLM
      return json(res, {
        sessionId: `session-${Date.now()}`,
        answer: generateFallbackResponse(message),
        reasoning: [],
        toolsUsed: [],
        mode: 'fallback',
      });
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildSystemPrompt(mode) + '\n\nQuestion utilisateur: ' + message,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: llmConfig?.temperature ?? 0.7,
            maxOutputTokens: llmConfig?.maxTokens ?? 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('Gemini API error:', errText);
      return json(res, {
        sessionId: `session-${Date.now()}`,
        answer: generateFallbackResponse(message),
        reasoning: [],
        toolsUsed: [],
        mode: 'fallback',
      });
    }

    const geminiData: any = await geminiResponse.json();
    const answer =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      generateFallbackResponse(message);

    json(res, {
      sessionId: `session-${Date.now()}`,
      answer,
      reasoning: [
        {
          step: 1,
          thought: 'Analyse de la question utilisateur',
          action: 'Gemini 2.0 Flash',
          result: 'Reponse generee',
        },
      ],
      toolsUsed: ['gemini-2.0-flash'],
      mode: 'gemini',
    });
  } catch (error: any) {
    console.error('Chatbot error:', error);
    json(res, {
      sessionId: `session-${Date.now()}`,
      answer: generateFallbackResponse(req.body?.message || ''),
      reasoning: [],
      toolsUsed: [],
      mode: 'fallback',
      error: error.message,
    }, 200);
  }
}

function buildSystemPrompt(mode?: string): string {
  return `Tu es un assistant expert en securite IA et red teaming. Tu assistes les utilisateurs de la plateforme AI Risk Manager.

Domaines d'expertise:
- OWASP LLM Top 10 et Top 15 Agentic AI
- Tests de securite LLM (Garak, Promptfoo)
- Gouvernance et politiques IA
- Red teaming et audit de securite
- Gestion des risques IA (taxonomie causale et par domaine)
- OWASP GenAI COMPASS

Reponds en francais. Sois precis et actionnable.${mode === 'concise' ? ' Sois bref et direct.' : ''}${mode === 'expert' ? ' Donne des details techniques approfondis.' : ''}`;
}

function generateFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('compass') || lower.includes('owasp')) {
    return "Le module COMPASS propose 31 scenarios de menaces bases sur le framework OWASP LLM Top 10. Consultez la section Referentiels > COMPASS pour une analyse detaillee.";
  }
  if (lower.includes('risque') || lower.includes('risk')) {
    return "La base de risques IA contient des centaines d'entrees classees par domaine, entite et intentionnalite. Explorez la section Referentiels > Base de Risques IA.";
  }
  if (lower.includes('garak') || lower.includes('promptfoo')) {
    return "Les outils de pentest (Garak, Promptfoo) sont disponibles via la Plateforme Unifiee. Garak scanne les vulnerabilites LLM (OWASP Top 10), Promptfoo teste les prompts avec des evaluations automatisees.";
  }
  if (lower.includes('politique') || lower.includes('policy')) {
    return "Les politiques IA sont gerees dans le module Gouvernance IA. Vous pouvez definir des regles, chapitres et recommandations pour encadrer l'usage de l'IA.";
  }

  return "Je suis l'assistant AI Risk Manager. Je peux vous aider sur la securite IA, le red teaming, les tests LLM (Garak/Promptfoo), la gouvernance et les referentiels OWASP. Que souhaitez-vous savoir?";
}
