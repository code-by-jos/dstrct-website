/**
 * Cache duration constants (in milliseconds)
 */
export const CACHE_DURATION = {
  /** 5 minutes - default for most content */
  SHORT: 1000 * 60 * 5,
  /** 15 minutes */
  MEDIUM: 1000 * 60 * 15,
  /** 1 hour */
  LONG: 1000 * 60 * 60,
} as const;
