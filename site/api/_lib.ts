// api/_lib.ts — shared helpers for the Phylax HTTP API (not a route; underscore-prefixed).
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { productionFetchPolicy, validateFetchUrl } from "phylax-skill-audit";

export const ALLOWED_MODES = new Set(["fast", "deep"]);

/** Paid deep audits on Bankr x402 Cloud — set after `bankr x402 deploy`. */
export const X402_DEEP_AUDIT_URL =
  process.env.PHYLAX_X402_DEEP_URL?.trim() ||
  "https://x402.bankr.bot/0x7fc2987df6e0fb7567d64838696a5bac4d220b91/audit-deep";
export const X402_DEEP_PRICE_USDC = "0.05";

export function deepAuditPaymentRequired() {
  return {
    error: "Deep audit requires x402 payment.",
    detail:
      "Fast mode is free on this endpoint. Deep mode (honeypot simulation + full onchain checks) is $0.05 USDC/request on Bankr x402 Cloud.",
    mode: "deep",
    pricing: { model: "x402", amount_usdc: X402_DEEP_PRICE_USDC, currency: "USDC", network: "base" },
    x402_endpoint: X402_DEEP_AUDIT_URL,
    free_alternative: {
      mode: "fast",
      endpoint: "POST https://usephylax.com/api/audit",
      cli: "npx phylax@0.2.2 --skill ./SKILL.md --mode deep",
    },
  };
}

/** x402 Cloud handler authenticates with this header to run deep audits on Vercel. */
export function allowsInternalDeepAudit(req: { headers?: Record<string, string | string[] | undefined> }): boolean {
  const expected = process.env.PHYLAX_INTERNAL_AUDIT_KEY?.trim();
  if (!expected) return false;
  const raw = req.headers?.["x-phylax-internal-key"];
  const provided = Array.isArray(raw) ? raw[0] : raw;
  return typeof provided === "string" && provided.length > 0 && provided === expected;
}

export const MAX_BODY_BYTES = 256 * 1024;
export const MAX_SKILL_SOURCE_LEN = 2048;
export const MAX_ENDPOINTS = 20;
export const MAX_CONTRACTS = 50;

const FETCH_POLICY = { ...productionFetchPolicy(), httpsOnly: true };

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
  if (s.startsWith("http://") || s.startsWith("https://")) {
    return validateFetchUrl(s, FETCH_POLICY);
  }

  // strip a leading github.com/ if present
  const cleaned = s.replace(/^github\.com\//, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length < 2) {
    throw new Error("skill ref must be owner/repo or a public https URL");
  }

  const [owner, repo, ...rest] = parts;
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD`;
  let url: string;
  if (rest.length === 0) url = `${base}/SKILL.md`;
  else if (rest[rest.length - 1].toLowerCase().endsWith(".md")) url = `${base}/${rest.join("/")}`;
  else {
    const dir = rest[0] === "skills" ? rest.join("/") : `skills/${rest.join("/")}`;
    url = `${base}/${dir}/SKILL.md`;
  }
  return validateFetchUrl(url, FETCH_POLICY);
}

function isInlineSkillMarkdown(source: string): boolean {
  return source.startsWith("---") || source.startsWith("# ");
}

/**
 * Validate skill_source for the HTTP API. Blocks local file paths and SSRF targets.
 */
export function validateSkillSource(skillSource: string, skillMd?: string): string {
  const source = skillSource.trim();
  if (!source) throw new Error("skill_source is required");
  if (source.length > MAX_SKILL_SOURCE_LEN) {
    throw new Error(`skill_source exceeds ${MAX_SKILL_SOURCE_LEN} characters`);
  }
  if (skillMd) return source;
  if (isInlineSkillMarkdown(source)) return source;
  if (source.startsWith("http://") || source.startsWith("https://")) {
    return validateFetchUrl(source, FETCH_POLICY);
  }
  return resolveSkillUrl(source);
}

export function validateEndpointList(endpoints: unknown): string[] {
  if (!Array.isArray(endpoints)) throw new Error("endpoints must be an array");
  if (endpoints.length > MAX_ENDPOINTS) {
    throw new Error(`endpoints exceeds max of ${MAX_ENDPOINTS}`);
  }
  return endpoints.map((ep, i) => {
    if (typeof ep !== "string" || !ep.trim()) {
      throw new Error(`endpoints[${i}] must be a non-empty string`);
    }
    return validateFetchUrl(ep.trim(), FETCH_POLICY);
  });
}

export function validateContractList(contracts: unknown): string[] {
  if (!Array.isArray(contracts)) throw new Error("contracts must be an array");
  if (contracts.length > MAX_CONTRACTS) {
    throw new Error(`contracts exceeds max of ${MAX_CONTRACTS}`);
  }
  return contracts.map((c, i) => {
    if (typeof c !== "string" || !c.trim()) {
      throw new Error(`contracts[${i}] must be a non-empty string`);
    }
    return c.trim();
  });
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
