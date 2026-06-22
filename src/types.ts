/** Severity levels — each maps to a fixed weight for scoring. */
export type Severity = "critical" | "high" | "medium" | "low";

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 40,
  high: 20,
  medium: 10,
  low: 3,
};

/** Verdict classification. */
export type Verdict = "ALLOW" | "WARN" | "DENY";

/** Audit mode. */
export type Mode = "fast" | "deep";

/** A single detection rule loaded from YAML. */
export interface Rule {
  id: string;           // e.g. "PI-001"
  severity: Severity;
  category: "PI" | "SEC" | "CON" | "X402" | "MAN" | "LIQ";
  description: string;
  /** Regex patterns or keyword lists used for matching (static rules). */
  patterns?: string[];
  /** For onchain rules: ABI function selector or heuristic tag. */
  selector?: string;
}

/** A finding produced by a scanner. */
export interface Finding {
  id: string;           // rule ID that triggered
  severity: Severity;
  evidence: string;     // human-readable proof
  ref?: string;         // e.g. "SKILL.md#L42", "tx-sim:0xabc..."
}

/** Input to the audit pipeline. */
export interface AuditInput {
  skill_source: string;
  manifest?: string;    // raw JSON string of catalog.json / skills.json
  contracts?: string[]; // ["0x... (chainId:8453)"]
  endpoints?: string[]; // ["https://..."]
  chain_id?: number;    // default 8453 (Base)
  mode?: Mode;          // default "fast"
  /** Raw SKILL.md content (if already fetched). */
  skill_md?: string;
}

/** The JSON verdict output. */
export interface AuditOutput {
  skill: string;        // "owner/repo@<slug>"
  verdict: Verdict;
  score: number;
  findings: Finding[];
  summary: string;
  ttl: string;          // "24h"
  attested: boolean;    // always false for MVP
}

/** Internal: result from a single scanner pass. */
export interface ScanResult {
  findings: Finding[];
}
