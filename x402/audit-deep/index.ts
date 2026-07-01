/**
 * Bankr x402 Cloud handler — payment gateway → Vercel deep engine.
 *
 * Bankr deploy uploads this file only. Do not import phylax-skill-audit or local
 * modules; rule YAML and Base RPC run on usephylax.com via PHYLAX_INTERNAL_AUDIT_KEY.
 */

const AUDIT_API = "https://usephylax.com/api/audit";
const MAX_BODY_BYTES = 256 * 1024;

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

function jsonError(status: number, error: string, detail?: string): Response {
  return Response.json({ error, ...(detail ? { detail } : {}) }, { status });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return jsonError(405, "Method not allowed. Use POST with JSON body.");
  }

  const key = process.env.PHYLAX_INTERNAL_AUDIT_KEY?.trim();
  if (!key) {
    return jsonError(500, "Server misconfigured.", "PHYLAX_INTERNAL_AUDIT_KEY not set.");
  }

  let raw: string;
  try {
    raw = await req.text();
  } catch (err) {
    return jsonError(400, "Could not read body.", err instanceof Error ? err.message : String(err));
  }

  if (byteLength(raw) > MAX_BODY_BYTES) {
    return jsonError(413, "Payload too large (max 256KB).");
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  if (!body || typeof body !== "object") {
    return jsonError(400, "Request body must be a JSON object.");
  }

  if (typeof body.skill_source !== "string" || !body.skill_source.trim()) {
    return jsonError(400, "'skill_source' is required and must be a non-empty string.");
  }

  body.mode = "deep";

  let upstream: Response;
  try {
    upstream = await fetch(AUDIT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-phylax-internal-key": key,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return jsonError(502, "Upstream audit unreachable.", err instanceof Error ? err.message : String(err));
  }

  const text = await upstream.text();
  let result: Record<string, unknown>;
  try {
    result = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return jsonError(502, "Upstream audit returned non-JSON.", text.slice(0, 200));
  }

  if (!upstream.ok) {
    return Response.json(result, { status: upstream.status });
  }

  return Response.json({
    ...result,
    attested: true,
    service: "phylax-audit-deep",
    pricing: { model: "x402", amount_usdc: 0.05 },
  });
}
