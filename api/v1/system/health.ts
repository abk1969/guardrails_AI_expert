import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return res.status(200).json({
        status: 'ok',
        database: 'not_configured',
        timestamp: new Date().toISOString(),
        environment: 'vercel-serverless',
      });
    }

    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);
    const result = await sql`SELECT 1 as ok`;

    res.status(200).json({
      status: 'ok',
      database: result?.[0]?.ok === 1 ? 'connected' : 'error',
      timestamp: new Date().toISOString(),
      environment: 'vercel-serverless',
    });
  } catch (error: any) {
    res.status(200).json({
      status: 'ok',
      database: 'not_configured',
      error: error.message?.includes('DATABASE_URL') ? 'DATABASE_URL not set' : error.message,
      timestamp: new Date().toISOString(),
      environment: 'vercel-serverless',
    });
  }
}
