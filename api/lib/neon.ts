import { neon, neonConfig } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Enable connection caching for serverless
neonConfig.fetchConnectionCache = true;

/**
 * Get a Neon SQL tagged template function.
 * Uses DATABASE_URL from environment (set in Vercel project settings).
 */
export function getSQL() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(dbUrl);
}

/** Handle CORS preflight. Returns true if handled (OPTIONS request). */
export function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

/** Send JSON response (CORS headers already set by handleCors) */
export function json(res: VercelResponse, data: any, status = 200) {
  res.status(status).json(data);
}
