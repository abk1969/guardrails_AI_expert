import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSQL, handleCors, json } from '../../lib/neon';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  try {
    const sql = getSQL();
    const result = await sql`SELECT 1 as ok`;
    json(res, {
      status: 'ok',
      database: result?.[0]?.ok === 1 ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
      environment: 'vercel-serverless',
    });
  } catch (error: any) {
    // Even if DB is not configured, health endpoint should respond
    json(res, {
      status: 'ok',
      database: 'not_configured',
      error: error.message?.includes('DATABASE_URL') ? 'DATABASE_URL not set' : error.message,
      timestamp: new Date().toISOString(),
      environment: 'vercel-serverless',
    });
  }
}
