/**
 * index.ts — Main entry point for phylax-skill-audit.
 *
 * Orchestrates the 3-scanner pipeline (static → onchain → endpoint),
 * merges findings, scores, and emits the deterministic verdict JSON.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import type { AuditInput, AuditOutput, Finding, Rule, Mode } from "./types.js";
import { loadRules, rulesByCategory } from "./rules.js";
import { extractAddresses, extractUrls, buildContractDescriptors } from "./extractors.js";
import { runStaticScan, runManifestScan, runFrontmatterScan } from "./scanner/static.js";
import { runOnchainScan } from "./scanner/onchain.js";
import { runEndpointScan } from "./scanner/endpoint.js";
import { calculateScore, deriveVerdict, generateSummary } from "./scoring.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_RULES_DIR = resolve(__dirname, "..", "rules");
const DEFAULT_CHAIN_ID = 8453;
const DEFAULT_RPC_URL = "https://mainnet.base.org";
const VERDICT_TTL = "24h";

/**
 * Main audit function — the public API.
 *
 * Accepts an AuditInput, runs all 3 scanners, returns a deterministic AuditOutput.
 */
export async function audit(input: AuditInput): Promise<AuditOutput> {
  const mode: Mode = input.mode ?? "fast";
  const chainId = input.chain_id ?? DEFAULT_CHAIN_ID;

  // 1. Load rules
  const allRules = loadRules(DEFAULT_RULES_DIR);
  const piRules = rulesByCategory(allRules, "PI");
  const secRules = rulesByCategory(allRules, "SEC");
  const manRules = rulesByCategory(allRules, "MAN");
  const conRules = rulesByCategory(allRules, "CON");
  const x402Rules = rulesByCategory(allRules, "X402");
  const liqRules = rulesByCategory(allRules, "LIQ");

  // 2. Get SKILL.md content
  const skillMd = input.skill_md ?? (await fetchSkillMd(input.skill_source));
  if (!skillMd) {
    return makeErrorOutput(input.skill_source, "Could not fetch SKILL.md content");
  }

  // 3. Auto-extract contracts + endpoints if not provided
  const contracts = input.contracts ?? buildContractDescriptors(extractAddresses(skillMd), chainId);
  const endpoints = input.endpoints ?? extractUrls(skillMd);

  const allFindings: Finding[] = [];

  // ── Scanner A: Static ──────────────────────────────────────────────────
  const piResult = runStaticScan(skillMd, piRules);
  allFindings.push(...piResult.findings);

  const secResult = runStaticScan(skillMd, secRules);
  allFindings.push(...secResult.findings);

  // CON/LIQ rules carry static text patterns (e.g. sell-tax, privileged
  // functions, hidden mint) that describe risky behaviour declared directly
  // in the SKILL.md. Scan the document text for those before the on-chain
  // bytecode pass so honeypot markdown can't slip through.
  const conStaticResult = runStaticScan(skillMd, conRules);
  allFindings.push(...conStaticResult.findings);

  const liqStaticResult = runStaticScan(skillMd, liqRules);
  allFindings.push(...liqStaticResult.findings);

  if (input.manifest) {
    const manResult = runManifestScan(input.manifest, manRules);
    allFindings.push(...manResult.findings);
  }
  const manFrontmatterResult = runFrontmatterScan(skillMd, manRules);
  allFindings.push(...manFrontmatterResult.findings);

  // ── Scanner B: Onchain ─────────────────────────────────────────────────
  const rpcUrl = process.env.BASE_RPC_URL ?? DEFAULT_RPC_URL;
  for (const contractDesc of contracts) {
    const address = contractDesc.split(/\s/)[0]; // strip chain hint
    if (!address.startsWith("0x")) continue;

    try {
      const onchainResult = await runOnchainScan(address, chainId, rpcUrl, [...conRules, ...liqRules], mode);
      allFindings.push(...onchainResult.findings);
    } catch {
      // RPC failure — not a security finding, skip silently
    }
  }

  // ── Scanner C: Endpoint ────────────────────────────────────────────────
  if (endpoints.length > 0) {
    try {
      const endpointResult = await runEndpointScan(endpoints, x402Rules);
      allFindings.push(...endpointResult.findings);
    } catch {
      // Network failure — skip silently
    }
  }

  // ── Deduplicate findings by rule ID ────────────────────────────────────
  const dedupedFindings = deduplicateFindings(allFindings);

  // ── Score + Verdict ────────────────────────────────────────────────────
  const score = calculateScore(dedupedFindings);
  const verdict = deriveVerdict(dedupedFindings, score);
  const summary = generateSummary(verdict, dedupedFindings);

  return {
    skill: input.skill_source,
    verdict,
    score,
    findings: dedupedFindings,
    summary,
    ttl: VERDICT_TTL,
    attested: false,
  };
}

/**
 * Fetch SKILL.md content from source (URL or local path).
 */
async function fetchSkillMd(source: string): Promise<string | null> {
  // If it looks like a URL, fetch it
  if (source.startsWith("http://") || source.startsWith("https://")) {
    try {
      const resp = await fetch(source, { signal: AbortSignal.timeout(15_000) });
      if (!resp.ok) return null;
      return await resp.text();
    } catch {
      return null;
    }
  }

  // If it's a raw markdown content (contains frontmatter dashes)
  if (source.startsWith("---") || source.startsWith("# ")) {
    return source;
  }

  // Try as local file path
  try {
    return readFileSync(source, "utf-8");
  } catch {
    return null;
  }
}

/**
 * Deduplicate findings: keep only the first occurrence of each rule ID.
 */
function deduplicateFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const result: Finding[] = [];
  for (const f of findings) {
    if (!seen.has(f.id)) {
      seen.add(f.id);
      result.push(f);
    }
  }
  // Sort by severity (critical first) then by ID
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  result.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.id.localeCompare(b.id));
  return result;
}

/**
 * Produce an error output when SKILL.md cannot be fetched.
 */
function makeErrorOutput(skillSource: string, message: string): AuditOutput {
  return {
    skill: skillSource,
    verdict: "DENY",
    score: 0,
    findings: [
      {
        id: "SYS-001",
        severity: "critical",
        evidence: message,
        ref: skillSource,
      },
    ],
    summary: `Audit failed: ${message}. Cannot assess safety.`,
    ttl: VERDICT_TTL,
    attested: false,
  };
}

// Re-export types and utilities
export type { AuditInput, AuditOutput, Finding, Verdict, Mode, Rule } from "./types.js";
export { calculateScore, deriveVerdict, generateSummary } from "./scoring.js";
export { loadRules } from "./rules.js";
