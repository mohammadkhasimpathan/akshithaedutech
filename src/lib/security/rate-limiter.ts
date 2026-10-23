import crypto from 'crypto';

export interface RateLimitConfig {
  actionName: string;
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  clientHash: string;
}

export interface RateLimiterStore {
  consume(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

/**
 * In-Memory fallback store for development, local staging, and automated tests.
 * WARNING: In a multi-instance or serverless production environment, this does NOT
 * provide distributed rate limiting. Production deployments should attach a shared
 * backend (e.g. Redis, Upstash, or database-backed token bucket).
 */
class MemoryRateLimitStore implements RateLimiterStore {
  private records = new Map<string, { count: number; resetAt: number }>();

  async consume(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    const now = Date.now();
    const existing = this.records.get(key);

    if (!existing || now >= existing.resetAt) {
      const resetAt = now + windowMs;
      this.records.set(key, { count: 1, resetAt });
      return { count: 1, resetAt };
    }

    existing.count += 1;
    return { count: existing.count, resetAt: existing.resetAt };
  }

  // Helper for automated tests
  clear(): void {
    this.records.clear();
  }
}

// Global store instance (can be swapped in production with Redis/shared store)
const memoryStore = new MemoryRateLimitStore();

/**
 * Creates a one-way SHA-256 hash of client identifiers (IP address, user agent)
 * preventing personal data (PII) from being stored in logs or in-memory stores.
 */
export function hashClientIdentifier(identifier: string, salt: string = 'akshitha-rate-limiter'): string {
  return crypto.createHash('sha256').update(`${salt}:${identifier}`).digest('hex').slice(0, 32);
}

// Default action limit configurations
export const ACTION_LIMITS: Record<string, RateLimitConfig> = {
  application: {
    actionName: 'application',
    windowMs: 60 * 60 * 1000, // 1 hour window
    maxRequests: 5,           // Maximum 5 applications per hour per client
  },
  enquiry: {
    actionName: 'enquiry',
    windowMs: 15 * 60 * 1000, // 15 minute window
    maxRequests: 4,           // Maximum 4 enquiries per 15 minutes
  },
  report: {
    actionName: 'report',
    windowMs: 30 * 60 * 1000, // 30 minute window
    maxRequests: 3,           // Maximum 3 reports per 30 minutes
  },
  login: {
    actionName: 'login',
    windowMs: 15 * 60 * 1000, // 15 minute window
    maxRequests: 5,           // Maximum 5 login attempts per 15 minutes
  },
  registration: {
    actionName: 'registration',
    windowMs: 30 * 60 * 1000, // 30 minute window
    maxRequests: 5,           // Maximum 5 registrations per 30 minutes
  },
};

/**
 * Checks rate limit for a given client identifier and action.
 */
export async function checkRateLimit(
  identifier: string,
  action: 'application' | 'enquiry' | 'report' | 'login' | 'registration',
  store: RateLimiterStore = memoryStore
): Promise<RateLimitResult> {
  const config = ACTION_LIMITS[action];
  if (!config) {
    throw new Error(`Unconfigured rate limit action: ${action}`);
  }

  const clientHash = hashClientIdentifier(identifier);
  const cacheKey = `ratelimit:${action}:${clientHash}`;

  const { count, resetAt } = await store.consume(cacheKey, config.windowMs);
  const remaining = Math.max(0, config.maxRequests - count);

  return {
    allowed: count <= config.maxRequests,
    limit: config.maxRequests,
    remaining,
    resetAt,
    clientHash,
  };
}

/**
 * Honeypot Anti-Abuse Verification
 * Form submissions with a filled honeypot field are flagged as automated bot abuse.
 */
export function verifyHoneypot(honeypotValue: string | null | undefined): boolean {
  return !honeypotValue || honeypotValue.trim().length === 0;
}

/**
 * Validates request payload size against hard ceiling to mitigate Denial of Service (DoS).
 */
export function verifyPayloadSize(contentLength: number, maxBytes: number): boolean {
  if (isNaN(contentLength) || contentLength < 0) return false;
  return contentLength <= maxBytes;
}

export { memoryStore };
