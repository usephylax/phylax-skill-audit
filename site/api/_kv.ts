// api/_kv.ts — Centralized rate limiter + verdict cache backed by Upstash Redis.
//
// Replaces the per-instance in-memory Map that can't share state across Vercel
// serverless invocations. Falls back gracefully to in-memory when env vars are
// not set (local dev / preview deploys).
//
// Required env vars (set in Vercel → Settings → Environment Variables):
//   UPSTASH_REDIS_REST_URL   — from Upstash console
//   UPSTASH_REDIS_REST_TOKEN — from Upstash console

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// ── Redis client (lazy, singleton) ──────────────────────────────────────────

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

// ── Global rate limiter: 20 requests per 60s sliding window per IP ──────────

let _limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (_limiter) return _limiter;
  const redis = getRedis();
  if (!redis) return null;
  _limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    prefix: "phylax:rl",
    analytics: true,
  });
  return _limiter;
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetMs: number;
  limit: number;
}

/**
 * Check rate limit for the given IP. Returns result compatible with existing
 * handler code. Falls back to "allow everything" if Redis is unavailable.
 */
export async function kvRateLimited(ip: string): Promise<RateLimitResult> {
  const limiter = getLimiter();
  if (!limiter) {
    // Fallback: no Redis configured → allow (in-memory fallback still exists in _lib.ts)
    return { limited: false, remaining: 20, resetMs: 60_000, limit: 20 };
  }
  try {
    const { success, remaining, reset } = await limiter.limit(ip);
    const resetMs = Math.max(0, reset - Date.now());
    return { limited: !success, remaining, resetMs, limit: 20 };
  } catch {
    // Redis error → fail open (allow request, rely on in-memory as backup)
    return { limited: false, remaining: 20, resetMs: 60_000, limit: 20 };
  }
}

// ── Global verdict cache (TTL 24h) ─────────────────────────────────────────

const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24h

/**
 * Get cached verdict from Redis. Returns null on miss or error.
 */
export async function kvCacheGet(key: string): Promise<unknown | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const val = await redis.get<string>(`phylax:cache:${key}`);
    if (val === null) return null;
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return null;
  }
}

/**
 * Store verdict in Redis with 24h TTL.
 */
export async function kvCacheSet(key: string, value: unknown): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(`phylax:cache:${key}`, JSON.stringify(value), { ex: CACHE_TTL_SECONDS });
  } catch {
    // Best-effort; in-memory cache in _lib.ts is backup
  }
}
