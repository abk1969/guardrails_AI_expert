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

/**
 * Detect if the API URL points to localhost but we're running on a remote
 * origin (e.g. Vercel). In that case, the backend is definitely unreachable
 * and we should NOT even attempt a fetch (which would cause CORS errors).
 */
function _isRemoteOriginWithLocalBackend(): boolean {
  try {
    const apiHost = new URL(API_URL).hostname;
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    return (
      (apiHost === 'localhost' || apiHost === '127.0.0.1') &&
      currentHost !== 'localhost' &&
      currentHost !== '127.0.0.1' &&
      currentHost !== ''
    );
  } catch {
    return false;
  }
}

/**
 * Detect if running on Vercel serverless (relative API URL = same origin).
 * Vercel serverless does NOT support WebSocket/Socket.IO connections.
 */
function _isServerlessMode(): boolean {
  return API_URL.startsWith('/');
}

const _standaloneMode = _isRemoteOriginWithLocalBackend();
const _serverlessMode = _isServerlessMode();

let _available: boolean | null = _standaloneMode ? false : null;
let _lastCheck = _standaloneMode ? Date.now() : 0;
let _failCount = _standaloneMode ? MAX_FAILURES : 0;
let _checking = false;
let _listeners: Array<(available: boolean) => void> = [];

async function _check(): Promise<boolean> {
  // Never attempt fetch if we know it will cause CORS errors
  if (_standaloneMode) {
    _setAvailable(false);
    return false;
  }
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

  /** True when running on a remote host with a localhost backend URL (e.g. Vercel). */
  isStandaloneMode: _standaloneMode,

  /** True when using Vercel serverless API (no WebSocket/Socket.IO support). */
  isServerless: _serverlessMode,

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
