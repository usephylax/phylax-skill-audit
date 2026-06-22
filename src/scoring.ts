/**
 * scoring.ts — Deterministic scoring + verdict logic.
 *
 * score = 100 − Σ(severity_weight × hit_count)
 *   Critical = 40 | High = 20 | Medium = 10 | Low = 3
 *   Clamp to [0, 100]
 *
 * Verdict:
 *   ALLOW  ≥ 80, no Critical or High findings
 *   WARN   50–79, has Medium/High but no Critical
 *   DENY   < 50 OR any Critical finding
 *
 * Deterministic: verdict = pure function of finding IDs, not model opinion.
 */

import type { Finding, Verdict } from "./types.js";
import { SEVERITY_WEIGHT } from "./types.js";

/**
 * Calculate score from findings.
 */
export function calculateScore(findings: Finding[]): number {
  let penalty = 0;
  for (const f of findings) {
    penalty += SEVERITY_WEIGHT[f.severity] ?? 0;
  }
  return Math.max(0, Math.min(100, 100 - penalty));
}

/**
 * Derive verdict from findings and score.
 */
export function deriveVerdict(findings: Finding[], score: number): Verdict {
  const hasCritical = findings.some((f) => f.severity === "critical");
  const hasHigh = findings.some((f) => f.severity === "high");

  // Any Critical ⇒ immediate DENY
  if (hasCritical) return "DENY";

  // Score < 50 ⇒ DENY
  if (score < 50) return "DENY";

  // Score ≥ 80 and no High ⇒ ALLOW
  if (score >= 80 && !hasHigh) return "ALLOW";

  // Everything else ⇒ WARN
  return "WARN";
}

/**
 * Generate human-readable summary from findings + verdict.
 */
export function generateSummary(verdict: Verdict, findings: Finding[]): string {
  if (findings.length === 0) {
    return "No security issues detected. Skill appears safe to install.";
  }

  const critical = findings.filter((f) => f.severity === "critical");
  const high = findings.filter((f) => f.severity === "high");
  const medium = findings.filter((f) => f.severity === "medium");
  const low = findings.filter((f) => f.severity === "low");

  const parts: string[] = [];

  if (critical.length > 0) {
    const ids = critical.map((f) => f.id).join(", ");
    parts.push(`Critical issues found (${ids}). Do not install.`);
  }
  if (high.length > 0) {
    parts.push(`${high.length} high-severity risk(s) detected.`);
  }
  if (medium.length > 0) {
    parts.push(`${medium.length} medium-severity warning(s).`);
  }
  if (low.length > 0) {
    parts.push(`${low.length} low-severity informational note(s).`);
  }

  parts.push("Verdict is a signal with TTL (24h), not a guarantee.");

  return parts.join(" ");
}
