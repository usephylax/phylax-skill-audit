/**
 * Bankr x402 Cloud handler — proxies deep audits to Vercel (rules + RPC infra).
 * Payment collected by x402; engine runs on usephylax.com via internal key.
 */

const AUDIT_API = "https://usephylax.com/api/audit";
const MAX_BODY_BYTES = 256 * 1024;

function jsonError(status: number, error: string, detail?: string): Response {
  return new Response(JSON.stringify({ error, ...(detail ? { detail } : {}) }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return jsonError(405, "Method not allowed. Use POST with JSON body.");
  }

  const key = process.env.PHYLAX_INTERNAL_AUDIT_KEY?.trim();
  if (!key) {
    return jsonError(500, "Server misconfigured.", "PHYLAX_INTERNAL_AUDIT_KEY not set.");
  }

  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
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

  const upstream = await fetch(AUDIT_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-phylax-internal-key": key,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(55_000),
  });

  let result: unknown;
  try {
    result = await upstream.json();
  } catch {
    return jsonError(502, "Upstream audit returned non-JSON.", `HTTP ${upstream.status}`);
  }

  if (!upstream.ok) {
    return new Response(JSON.stringify(result), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return {
    ...(result as Record<string, unknown>),
    attested: true,
    service: "phylax-audit-deep",
    pricing: { model: "x402", amount_usdc: 0.05 },
  };
}
