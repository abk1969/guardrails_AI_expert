/**
 * Centralized backend availability detection.
 *
 * Singleton module that checks backend reachability once, caches the result,
 * and stops retrying after repeated failures. All frontend components should
 * use this instead of rolling their own health-check polling.
 *
 * Usage:
 *   import { backendStatus } from '../services/backendStatus';
 *   if (backendStatus.isAvailable()) { ... }
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const MAX_FAILURES = 2;
const CACHE_TTL_MS = 60_000; // 1 minute cache

let _available: boolean | null = null;
let _lastCheck = 0;
let _failCount = 0;
let _checking = false;
let _listeners: Array<(available: boolean) => void> = [];

async function _check(): Promise<boolean> {
  if (_checking) return _available ?? false;
  _checking = true;
  try {
    const response = await fetch(`${API_URL}/system/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      _failCount = 0;
      _setAvailable(true);
      return true;
    }
    _failCount++;
    _setAvailable(false);
    return false;
  } catch {
    _failCount++;
    _setAvailable(false);
    return false;
  } finally {
    _lastCheck = Date.now();
    _checking = false;
  }
}

function _setAvailable(value: boolean) {
  const changed = _available !== value;
  _available = value;
  if (changed) {
    _listeners.forEach((fn) => fn(value));
  }
}

export const backendStatus = {
  /** The base API URL (from VITE_API_URL or default). */
  apiUrl: API_URL,

  /**
   * Returns cached availability. `null` means not yet checked.
   * Call `check()` first if you need a fresh result.
   */
  isAvailable(): boolean {
    return _available === true;
  },

  /** Whether a check has completed at least once. */
  hasChecked(): boolean {
    return _available !== null;
  },

  /** Whether retries are exhausted (backend deemed permanently offline). */
  isGivenUp(): boolean {
    return _failCount >= MAX_FAILURES;
  },

  /**
   * Perform a backend health check (with caching).
   * If the cache is fresh (< CACHE_TTL_MS) and we've given up, returns cached result.
   */
  async check(): Promise<boolean> {
    const now = Date.now();
    // Return cached result if fresh
    if (_available !== null && now - _lastCheck < CACHE_TTL_MS) {
      return _available;
    }
    // Don't retry if we've exhausted attempts (unless manual)
    if (_failCount >= MAX_FAILURES && _available !== null) {
      return false;
    }
    return _check();
  },

  /**
   * Force a fresh check, resetting the failure counter.
   * Useful for manual "retry" buttons.
   */
  async forceCheck(): Promise<boolean> {
    _failCount = 0;
    _lastCheck = 0;
    return _check();
  },

  /** Subscribe to availability changes. Returns unsubscribe function. */
  onChange(listener: (available: boolean) => void): () => void {
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter((fn) => fn !== listener);
    };
  },
};
