/**
 * Shared constants for the API Gateway
 */

/**
 * Default seed data IDs used in development mode when JWT auth is bypassed.
 * These correspond to records created by prisma/seed.ts.
 */
export const DEV_DEFAULTS = {
  ORGANIZATION_ID: '0872cd2b-4b4c-41a6-b505-799671a44daa',
  USER_ID: '81976246-23f4-465c-bd1f-0b42c492a204',
  TARGET_ID: '96dbf125-74e8-4b8d-b6d2-81ecc6781bba',
} as const;

/**
 * Shared WebSocket gateway CORS configuration.
 * Uses CORS_ORIGIN env var in production, allows all origins in development.
 */
export const WS_CORS_CONFIG = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
} as const;

/**
 * Common WebSocket transport options for all gateways.
 */
export const WS_TRANSPORT_OPTIONS = {
  transports: ['websocket', 'polling'] as const,
  allowEIO3: true,
} as const;
