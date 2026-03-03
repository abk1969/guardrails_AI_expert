import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, mode, llmConfig } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return res.status(200).json({
        sessionId: `session-${Date.now()}`,
        answer: generateFallbackResponse(message),
        reasoning: [],
        toolsUsed: [],
        mode: 'fallback',
      });
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${geminiApiKey}`,
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
      // Distinguish rate limit from other errors
      const isRateLimit = geminiResponse.status === 429;
      const answer = isRateLimit
        ? "Le quota API Gemini est temporairement epuise. Veuillez reessayer dans quelques instants. En attendant, voici une reponse locale:\n\n" + generateFallbackResponse(message)
        : generateFallbackResponse(message);
      return res.status(200).json({
        sessionId: `session-${Date.now()}`,
        answer,
        reasoning: [],
        toolsUsed: [],
        mode: isRateLimit ? 'rate-limited' : 'fallback',
      });
    }

    const geminiData: any = await geminiResponse.json();
    const answer =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      generateFallbackResponse(message);

    res.status(200).json({
      sessionId: `session-${Date.now()}`,
      answer,
      reasoning: [
        {
          step: 1,
          thought: 'Analyse de la question utilisateur',
          action: 'Gemini 3 Flash Preview',
          result: 'Reponse generee',
        },
      ],
      toolsUsed: ['gemini-3-flash-preview'],
      mode: 'gemini',
    });
  } catch (error: any) {
    console.error('Chatbot error:', error);
    res.status(200).json({
      sessionId: `session-${Date.now()}`,
      answer: generateFallbackResponse(req.body?.message || ''),
      reasoning: [],
      toolsUsed: [],
      mode: 'fallback',
      error: error.message,
    });
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
