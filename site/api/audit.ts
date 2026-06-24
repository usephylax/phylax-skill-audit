// api/audit.ts — Vercel serverless function exposing Phylax as an HTTP API.
//
// POST /api/audit   body: { skill_source, skill_md?, manifest?, contracts?, endpoints?, chain_id?, mode? }
// GET  /api/audit?skill=<owner/repo|url>&mode=fast   — quick one-shot audit (cached 24h)
// GET  /api/audit   (no query)                       — self-describing usage doc
//
// Returns AuditOutput JSON { verdict, score, findings, summary, ttl, attested }.

import { audit, type AuditInput } from "phylax-skill-audit";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  cors, clientIp, rateLimited, resolveSkillUrl, cacheGet, cacheSet,
  ALLOWED_MODES, MAX_BODY_BYTES,
} from "./_lib.js";

function applyRate(req: VercelRequest, res: VercelResponse): boolean {
  const rl = rateLimited(clientIp(req));
  res.setHeader("X-RateLimit-Limit", String(rl.limit));
  res.setHeader("X-RateLimit-Remaining", String(rl.remaining));
  if (rl.limited) {
    res.setHeader("Retry-After", String(Math.ceil(rl.resetMs / 1000)));
    res.status(429).json({ error: "Rate limit exceeded.", detail: `Retry in ${Math.ceil(rl.resetMs / 1000)}s.` });
    return false;
  }
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);

  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  // ── GET ────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    const skill = typeof req.query.skill === "string" ? req.query.skill : undefined;

    // No ?skill → self-doc
    if (!skill) {
      res.status(200).json({
        service: "phylax-skill-audit",
        endpoints: {
          "POST /api/audit": "full audit — JSON body { skill_source, skill_md?, ... }",
          "GET /api/audit?skill=<owner/repo|url>": "quick audit by skill ref (cached 24h)",
          "GET /api/badge?skill=<owner/repo|url>": "SVG verdict badge for embedding",
        },
        docs: "https://github.com/usephylax/phylax-skill-audit",
        returns: "{ verdict: 'ALLOW'|'WARN'|'DENY', score, findings, summary, ttl, attested }",
      });
      return;
    }

    if (!applyRate(req, res)) return;
    const mode = req.query.mode === "deep" ? "deep" : "fast";
    const cacheKey = `${skill}::${mode}`;
    const cached = cacheGet(cacheKey);
    if (cached) { res.setHeader("X-Cache", "HIT"); res.status(200).json(cached); return; }

    try {
      const url = resolveSkillUrl(skill);
      const result = await audit({ skill_source: url, mode });
      cacheSet(cacheKey, result);
      res.setHeader("X-Cache", "MISS");
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: "Audit failed.", detail: err instanceof Error ? err.message : String(err) });
    }
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use GET or POST." });
    return;
  }

  // ── POST ───────────────────────────────────────────────────────────────
  if (!applyRate(req, res)) return;

  let body: unknown = req.body;
  try {
    if (typeof body === "string") {
      if (Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
        res.status(413).json({ error: "Payload too large (max 256KB)." });
        return;
      }
      body = JSON.parse(body);
    }
  } catch {
    res.status(400).json({ error: "Invalid JSON body." });
    return;
  }
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Request body must be a JSON object." });
    return;
  }

  const { skill_source, skill_md, manifest, contracts, endpoints, chain_id, mode } =
    body as Record<string, unknown>;

  if (typeof skill_source !== "string" || skill_source.trim() === "") {
    res.status(400).json({ error: "'skill_source' is required and must be a non-empty string." });
    return;
  }
  if (mode !== undefined && !ALLOWED_MODES.has(mode)) {
    res.status(400).json({ error: "'mode' must be 'fast' or 'deep'." });
    return;
  }
  if (contracts !== undefined && !Array.isArray(contracts)) {
    res.status(400).json({ error: "'contracts' must be an array of strings." });
    return;
  }
  if (endpoints !== undefined && !Array.isArray(endpoints)) {
    res.status(400).json({ error: "'endpoints' must be an array of strings." });
    return;
  }

  const input: AuditInput = {
    skill_source,
    skill_md: typeof skill_md === "string" ? skill_md : undefined,
    manifest: typeof manifest === "string" ? manifest : undefined,
    contracts: contracts as string[] | undefined,
    endpoints: endpoints as string[] | undefined,
    chain_id: typeof chain_id === "number" ? chain_id : undefined,
    mode: mode === "deep" ? "deep" : "fast",
  };

  try {
    const result = await audit(input);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Audit failed.", detail: err instanceof Error ? err.message : String(err) });
  }
}
