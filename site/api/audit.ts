// api/audit.ts — Vercel serverless function exposing Phylax as an HTTP API.
//
// POST /api/audit
//   body: {
//     skill_source: string            (required — URL, github ref, or identifier)
//     skill_md?:    string            (raw SKILL.md; if omitted, audit() fetches skill_source)
//     manifest?:    string            (raw catalog.json/skills.json)
//     contracts?:   string[]          ("0x... (chainId:8453)")
//     endpoints?:   string[]          ("https://...")
//     chain_id?:    number            (default 8453)
//     mode?:        "fast" | "deep"   (default "fast")
//   }
//   200 -> AuditOutput JSON { verdict, score, findings, summary, ttl, attested }
//
// GET /api/audit -> lightweight usage doc (so the endpoint is self-describing).

import { audit, type AuditInput } from "phylax-skill-audit";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const MAX_BODY_BYTES = 256 * 1024; // 256KB cap on request payloads
const ALLOWED_MODES = new Set(["fast", "deep"]);

function cors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json({
      service: "phylax-skill-audit",
      endpoint: "POST /api/audit",
      docs: "https://github.com/usephylax/phylax-skill-audit",
      body: {
        skill_source: "string (required)",
        skill_md: "string (optional raw SKILL.md)",
        manifest: "string (optional)",
        contracts: "string[] (optional)",
        endpoints: "string[] (optional)",
        chain_id: "number (default 8453)",
        mode: "'fast' | 'deep' (default 'fast')",
      },
      returns: "{ verdict: 'ALLOW'|'WARN'|'DENY', score, findings, summary, ttl, attested }",
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  // Parse + validate body (Vercel usually pre-parses JSON; guard either way).
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
    res.status(500).json({
      error: "Audit failed.",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
