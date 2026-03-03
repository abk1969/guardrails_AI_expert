import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_METRICS = {
  totalTests: 0,
  vulnerabilitiesFound: 0,
  criticalFindings: 0,
  lastScanTime: '',
  toolsStatus: {
    promptfoo: 'idle' as const,
    garak: 'idle' as const,
  },
  recentActivity: [],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return res.status(200).json(DEFAULT_METRICS);

    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);

    const [testStats] = await sql`
      SELECT
        COUNT(*)::int as total_tests,
        COUNT(*) FILTER (WHERE status = 'COMPLETED')::int as completed,
        COUNT(*) FILTER (WHERE status = 'FAILED')::int as failed,
        MAX("completedAt") as last_scan_time
      FROM "TestRun"
      WHERE "deletedAt" IS NULL
    `;

    const [resultStats] = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'FAILED')::int as vulnerabilities,
        COUNT(*) FILTER (WHERE status = 'FAILED' AND metadata->>'severity' = 'critical')::int as critical
      FROM "TestResult"
    `;

    const recentActivity = await sql`
      SELECT
        tr.id,
        tr.status,
        tr."createdAt" as timestamp,
        COALESCE(tr.metadata->>'tool', 'promptfoo') as tool,
        COALESCE(tr.metadata->>'severity', 'info') as severity,
        COALESCE(tr.metadata->>'action', 'Test execute') as action
      FROM "TestRun" tr
      WHERE tr."deletedAt" IS NULL
      ORDER BY tr."createdAt" DESC
      LIMIT 10
    `;

    res.status(200).json({
      totalTests: testStats?.total_tests || 0,
      vulnerabilitiesFound: resultStats?.vulnerabilities || 0,
      criticalFindings: resultStats?.critical || 0,
      lastScanTime: testStats?.last_scan_time || '',
      toolsStatus: { promptfoo: 'idle', garak: 'idle' },
      recentActivity: recentActivity.map((a: any) => ({
        id: a.id,
        tool: a.tool,
        severity: a.severity,
        action: a.action,
        timestamp: a.timestamp,
      })),
    });
  } catch {
    res.status(200).json(DEFAULT_METRICS);
  }
}
