// api/_lib.ts — shared helpers for the Phylax HTTP API (not a route; underscore-prefixed).
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const ALLOWED_MODES = new Set(["fast", "deep"]);
export const MAX_BODY_BYTES = 256 * 1024;

// ── CORS ────────────────────────────────────────────────────────────────────
export function cors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// ── Best-effort per-instance rate limiter ────────────────────────────────────
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

export function clientIp(req: VercelRequest): string {
  const xff = req.headers["x-forwarded-for"];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  return (raw?.split(",")[0].trim()) || req.socket?.remoteAddress || "unknown";
}

export function rateLimited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  const resetMs = arr.length ? RATE_WINDOW_MS - (now - arr[0]) : RATE_WINDOW_MS;
  if (arr.length >= RATE_LIMIT) {
    hits.set(ip, arr);
    return { limited: true, remaining: 0, resetMs, limit: RATE_LIMIT };
  }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
  }
  return { limited: false, remaining: RATE_LIMIT - arr.length, resetMs, limit: RATE_LIMIT };
}

// ── Skill ref resolver ───────────────────────────────────────────────────────
// Accepts: a raw https URL, or "owner/repo", or "owner/repo/skills/<name>",
// or "owner/repo/path/to/SKILL.md". Returns a best-guess raw.githubusercontent URL.
export function resolveSkillUrl(ref: string): string {
  const s = ref.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // strip a leading github.com/ if present
  const cleaned = s.replace(/^github\.com\//, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length < 2) return s; // can't resolve; let audit() handle/fail

  const [owner, repo, ...rest] = parts;
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD`;
  if (rest.length === 0) return `${base}/SKILL.md`;
  if (rest[rest.length - 1].toLowerCase().endsWith(".md")) return `${base}/${rest.join("/")}`;
  // treat as a skill directory (with or without a leading "skills/")
  const dir = rest[0] === "skills" ? rest.join("/") : `skills/${rest.join("/")}`;
  return `${base}/${dir}/SKILL.md`;
}

// ── In-memory verdict cache (TTL 24h, matches verdict TTL) ───────────────────
type Cached = { at: number; value: unknown };
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, Cached>();

export function cacheGet(key: string): unknown | null {
  const c = cache.get(key);
  if (!c) return null;
  if (Date.now() - c.at > CACHE_TTL_MS) { cache.delete(key); return null; }
  return c.value;
}
export function cacheSet(key: string, value: unknown) {
  cache.set(key, { at: Date.now(), value });
  if (cache.size > 2000) {
    const now = Date.now();
    for (const [k, v] of cache) if (now - v.at > CACHE_TTL_MS) cache.delete(k);
  }
}
