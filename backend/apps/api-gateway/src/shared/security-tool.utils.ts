import { exec, execFile } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { Logger } from '@nestjs/common';

/**
 * Shared utilities for security testing tools (Garak, Strix, Promptfoo)
 */

// Promisified exec functions — import from here instead of declaring per-service
export const execAsync = promisify(exec);
export const execFileAsync = promisify(execFile);

export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low' | 'info';

/**
 * Convert severity string to numeric score (0-1 scale).
 * Lower score = more severe.
 */
export function severityToScore(severity: string): number {
  const scoreMap: Record<string, number> = {
    critical: 0.1,
    high: 0.3,
    moderate: 0.5,
    low: 0.7,
    info: 1.0,
  };
  return scoreMap[severity] || 0.5;
}

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
export async function ensureDirectory(
  dirPath: string,
  logger?: Logger,
): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    logger?.log(`Directory ensured: ${dirPath}`);
  } catch (error) {
    logger?.error(`Failed to create directory: ${dirPath}`, error);
  }
}
