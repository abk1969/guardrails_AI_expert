import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Supported LLM provider endpoints for connection testing */
const PROVIDER_ENDPOINTS: Record<string, { url: string; buildHeaders: (key: string) => Record<string, string> }> = {
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models?key=',
    buildHeaders: () => ({}),
  },
  openai: {
    url: 'https://api.openai.com/v1/models',
    buildHeaders: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  anthropic: {
    url: 'https://api.anthropic.com/v1/messages',
    buildHeaders: (key) => ({ 'x-api-key': key, 'anthropic-version': '2023-06-01' }),
  },
  mistral: {
    url: 'https://api.mistral.ai/v1/models',
    buildHeaders: (key) => ({ Authorization: `Bearer ${key}` }),
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/models',
    buildHeaders: (key) => ({ Authorization: `Bearer ${key}` }),
  },
};

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
    const { provider, apiKey, model } = req.body || {};

    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Provider et cle API requis',
      });
    }

    const config = PROVIDER_ENDPOINTS[provider.toLowerCase()];
    if (!config) {
      return res.status(200).json({
        success: true,
        message: `Provider ${provider} enregistre (test non disponible cote serveur)`,
        provider,
        model,
      });
    }

    // Test connection to provider
    const url = provider === 'gemini'
      ? `${config.url}${apiKey}`
      : config.url;

    const testResponse = await fetch(url, {
      method: 'GET',
      headers: config.buildHeaders(apiKey),
      signal: AbortSignal.timeout(10000),
    });

    if (testResponse.ok) {
      res.status(200).json({
        success: true,
        message: `Connexion a ${provider} reussie`,
        provider,
        model,
      });
    } else {
      const errBody = await testResponse.text().catch(() => '');
      res.status(200).json({
        success: false,
        message: `Echec de connexion a ${provider}: ${testResponse.status}`,
        details: errBody.substring(0, 200),
      });
    }
  } catch (error: any) {
    res.status(200).json({
      success: false,
      message: `Erreur de connexion: ${error.message}`,
    });
  }
}
