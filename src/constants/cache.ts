/**
 * Cache duration constants (in milliseconds)
 */
export const CACHE_DURATION = {
  /** No caching - always fetch fresh data */
  NONE: 0,
  /** 1 minute - for frequently updated content */
  SHORT: 1000 * 60,
  /** 5 minutes */
  MEDIUM: 1000 * 60 * 5,
  /** 1 hour */
  LONG: 1000 * 60 * 60,
} as const;
