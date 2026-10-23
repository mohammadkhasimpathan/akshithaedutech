import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  hashClientIdentifier,
  verifyHoneypot,
  verifyPayloadSize,
  memoryStore,
  ACTION_LIMITS,
} from '@/lib/security/rate-limiter';

describe('Phase 3: Rate Limiting & Anti-Abuse Protection', () => {
  beforeEach(() => {
    memoryStore.clear();
  });

  it('should allow requests within configured rate limits', async () => {
    const identifier = '192.168.1.100';
    const result1 = await checkRateLimit(identifier, 'application');

    expect(result1.allowed).toBe(true);
    expect(result1.limit).toBe(ACTION_LIMITS.application.maxRequests);
    expect(result1.remaining).toBe(ACTION_LIMITS.application.maxRequests - 1);
  });

  it('should block requests when rate limit threshold is exceeded', async () => {
    const identifier = '192.168.1.101';
    const max = ACTION_LIMITS.enquiry.maxRequests;

    for (let i = 0; i < max; i++) {
      const res = await checkRateLimit(identifier, 'enquiry');
      expect(res.allowed).toBe(true);
    }

    // Next request exceeds limit
    const exceeded = await checkRateLimit(identifier, 'enquiry');
    expect(exceeded.allowed).toBe(false);
    expect(exceeded.remaining).toBe(0);
  });

  it('should hash client identifiers with SHA-256 to prevent storing raw IP/PII', () => {
    const rawIp = '203.0.113.195';
    const hash1 = hashClientIdentifier(rawIp);
    const hash2 = hashClientIdentifier(rawIp);

    expect(hash1).toBe(hash2);
    expect(hash1).not.toContain(rawIp);
    expect(hash1.length).toBe(32);
  });

  it('should detect bot abuse through honeypot field', () => {
    expect(verifyHoneypot('')).toBe(true);
    expect(verifyHoneypot(null)).toBe(true);
    expect(verifyHoneypot(undefined)).toBe(true);

    // Bot fills honeypot
    expect(verifyHoneypot('http://malicious-spam.com')).toBe(false);
    expect(verifyHoneypot('spam text')).toBe(false);
  });

  it('should enforce payload size limits to mitigate DoS', () => {
    const maxBytes = 10 * 1024 * 1024; // 10 MB

    expect(verifyPayloadSize(1024, maxBytes)).toBe(true);
    expect(verifyPayloadSize(maxBytes, maxBytes)).toBe(true);
    expect(verifyPayloadSize(maxBytes + 1, maxBytes)).toBe(false);
    expect(verifyPayloadSize(-1, maxBytes)).toBe(false);
    expect(verifyPayloadSize(NaN, maxBytes)).toBe(false);
  });
});
