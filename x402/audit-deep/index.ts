/**
 * Bankr x402 Cloud handler — Phylax deep audit ($0.05 USDC/request).
 * Single-file handler (Bankr deploy uploads index.ts only).
 */

import {
  audit,
  productionFetchPolicy,
  validateFetchUrl,
} from "phylax-skill-audit";

const FETCH_POLICY = { ...productionFetchPolicy(), httpsOnly: true };
const MAX_SKILL_SOURCE_LEN = 2048;
const MAX_ENDPOINTS = 20;
const MAX_CONTRACTS = 50;
const MAX_BODY_BYTES = 256 * 1024;

function resolveSkillUrl(ref: string): string {
  const s = ref.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) {
    return validateFetchUrl(s, FETCH_POLICY);
  }

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

function validateSkillSource(skillSource: string, skillMd?: string): string {
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

function validateEndpointList(endpoints: unknown): string[] {
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

function validateContractList(contracts: unknown): string[] {
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

  const raw = await req.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return jsonError(413, "Payload too large (max 256KB).");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  if (!body || typeof body !== "object") {
    return jsonError(400, "Request body must be a JSON object.");
  }

  const { skill_source, skill_md, manifest, contracts, endpoints, chain_id } =
    body as Record<string, unknown>;

  if (typeof skill_source !== "string" || skill_source.trim() === "") {
    return jsonError(400, "'skill_source' is required and must be a non-empty string.");
  }
  if (contracts !== undefined && !Array.isArray(contracts)) {
    return jsonError(400, "'contracts' must be an array of strings.");
  }
  if (endpoints !== undefined && !Array.isArray(endpoints)) {
    return jsonError(400, "'endpoints' must be an array of strings.");
  }

  let safeSource: string;
  let safeEndpoints: string[] | undefined;
  let safeContracts: string[] | undefined;

  try {
    safeSource = validateSkillSource(
      skill_source,
      typeof skill_md === "string" ? skill_md : undefined
    );
    if (endpoints !== undefined) safeEndpoints = validateEndpointList(endpoints);
    if (contracts !== undefined) safeContracts = validateContractList(contracts);
  } catch (err) {
    return jsonError(400, "Invalid request.", err instanceof Error ? err.message : String(err));
  }

  try {
    const result = await audit({
      skill_source: safeSource,
      skill_md: typeof skill_md === "string" ? skill_md : undefined,
      manifest: typeof manifest === "string" ? manifest : undefined,
      contracts: safeContracts,
      endpoints: safeEndpoints,
      chain_id: typeof chain_id === "number" ? chain_id : undefined,
      mode: "deep",
    });
    return {
      ...result,
      attested: true,
      service: "phylax-audit-deep",
      pricing: { model: "x402", amount_usdc: 0.05 },
    };
  } catch (err) {
    return jsonError(500, "Audit failed.", err instanceof Error ? err.message : String(err));
  }
}
