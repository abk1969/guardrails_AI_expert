import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSQL, handleCors, json } from '../../lib/neon';

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
  if (handleCors(req, res)) return;

  try {
    const sql = getSQL();

    // Aggregate metrics from database
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

    json(res, {
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
  } catch (error: any) {
    // Return default metrics if DB not available
    if (error.message?.includes('DATABASE_URL')) {
      return json(res, DEFAULT_METRICS);
    }
    // For other DB errors (tables don't exist yet, etc.), return defaults
    return json(res, DEFAULT_METRICS);
  }
}
