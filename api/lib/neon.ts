import { neon, neonConfig } from '@neondatabase/serverless';

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

/** CORS headers for all API responses */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/** Handle CORS preflight */
export function handleCors(req: any, res: any): boolean {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return true;
  }
  return false;
}

/** Send JSON response with CORS headers */
export function json(res: any, data: any, status = 200) {
  res.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
