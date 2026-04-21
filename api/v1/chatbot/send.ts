import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DSGAI_SUMMARY } from './_dsgai-summary';

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
  const dsgaiList = DSGAI_SUMMARY
    .map((i) => `  ${i.code} — ${i.title}${i.priority ? ` [${i.priority}]` : ''}`)
    .join('\n');

  return `Tu es un assistant expert en securite IA et red teaming. Tu assistes les utilisateurs de la plateforme AI Risk Manager.

Domaines d'expertise:
- OWASP LLM Top 10 et Top 15 Agentic AI
- Tests de securite LLM (Garak, Promptfoo)
- Gouvernance et politiques IA
- Red teaming et audit de securite
- Gestion des risques IA (taxonomie causale et par domaine)
- OWASP GenAI COMPASS (31 scenarios)
- OWASP GenAI Data Security 2026 — 22 risques (DSPM + DSGAI01..DSGAI21)

Liste des 22 risques DSGAI disponibles (avec priorite) :
${dsgaiList}

Si l'utilisateur mentionne un code DSGAI (ex: DSGAI05) ou pose une question sur la securite des donnees GenAI, reponds en t'appuyant sur la liste ci-dessus. Pour un detail approfondi d'un risque specifique (attack vectors, mitigations tier 1/2/3), invite l'utilisateur a consulter le Wiki Red Teamer > section "Securite Donnees GenAI (DSGAI)" ou la banniere OWASP dans Referentiels > COMPASS.

Reponds en francais. Sois precis et actionnable.${mode === 'concise' ? ' Sois bref et direct.' : ''}${mode === 'expert' ? ' Donne des details techniques approfondis.' : ''}`;
}

function generateFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  // DSGAI codes (DSPM, DSGAI01-21) — highest priority match
  const dsgaiMatch = message.match(/\b(DSGAI\d{2}|DSPM)\b/i);
  if (dsgaiMatch) {
    const code = dsgaiMatch[1].toUpperCase();
    const item = DSGAI_SUMMARY.find((i) => i.code.toUpperCase() === code);
    if (item) {
      return `**${item.code} — ${item.title}** ${item.priority ? `(priorite: ${item.priority})` : ''}\n\n${item.overview}\n\nConsultez le Wiki Red Teamer > section "Securite Donnees GenAI (DSGAI)" pour les attack vectors, scenarios et mitigations tier 1/2/3.`;
    }
    return `Le code ${code} n'est pas reconnu dans le referentiel OWASP GenAI Data Security 2026. Codes valides : DSPM, DSGAI01 a DSGAI21.`;
  }

  if (lower.includes('data security') || lower.includes('securite des donnees') || lower.includes('dsgai')) {
    return "Le referentiel OWASP GenAI Data Security 2026 couvre 22 risques (DSPM + DSGAI01 a DSGAI21) : data leakage, poisoning, shadow AI, RAG, vector stores, telemetry, inference. Consultez Referentiels > Wiki Red Teamer > Securite Donnees GenAI (DSGAI) ou la banniere OWASP dans Referentiels > OWASP COMPASS.";
  }

  if (lower.includes('compass') || lower.includes('owasp')) {
    return "Le module COMPASS propose 31 scenarios de menaces bases sur le framework OWASP LLM Top 10. Consultez la section Referentiels > COMPASS pour une analyse detaillee. Referentiels OWASP integres : Top 10 LLM, Top 15 Agentic AI, COMPASS, Data Security 2026 (DSGAI).";
  }
  if (lower.includes('risque') || lower.includes('risk')) {
    return "La base de risques IA contient 1579 entrees classees par domaine, entite et intentionnalite. Explorez la section Referentiels > Base de Risques IA. Voir aussi Referentiels > COMPASS (31 scenarios) et les 22 risques OWASP Data Security 2026 (DSGAI01-21).";
  }
  if (lower.includes('garak') || lower.includes('promptfoo')) {
    return "Les outils de pentest (Garak, Promptfoo) sont disponibles via la Plateforme Unifiee. Garak scanne les vulnerabilites LLM (OWASP Top 10), Promptfoo teste les prompts avec des evaluations automatisees.";
  }
  if (lower.includes('politique') || lower.includes('policy')) {
    return "Les politiques IA sont gerees dans le module Gouvernance IA. Vous pouvez definir des regles, chapitres et recommandations pour encadrer l'usage de l'IA.";
  }

  return "Je suis l'assistant AI Risk Manager. Je peux vous aider sur la securite IA (OWASP LLM Top 10, Agentic Top 15, COMPASS, Data Security 2026/DSGAI), le red teaming, les tests LLM (Garak/Promptfoo), la gouvernance et les referentiels OWASP. Que souhaitez-vous savoir?";
}
