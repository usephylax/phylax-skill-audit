/**
 * scanner/static.ts — Static analysis scanner.
 * Runs regex-based detection on SKILL.md + manifest text.
 * Covers categories: PI (prompt injection), SEC (secret exfiltration),
 * MAN (manifest integrity).
 */

import type { Finding, Rule, ScanResult, Severity } from "../types.js";

/** Severity ladder used to downgrade documentation-context matches. */
const DOWNGRADE: Record<Severity, Severity | null> = {
  critical: "high",
  high: "medium",
  medium: "low",
  low: null, // low inside docs → dropped
};

/**
 * Precompute, for each line, whether it sits inside a fenced code block
 * (``` ... ```) or is a Markdown blockquote (> ...). Matches in these
 * contexts are documentation/examples, not live payloads, so they are
 * downgraded one severity tier (and dropped if already `low`).
 *
 * This prevents false-positive DENYs on skills that *describe* dangerous
 * patterns as part of their own docs (e.g. a security skill listing the
 * very strings it detects).
 */
function computeDocContext(lines: string[]): boolean[] {
  const inDoc: boolean[] = new Array(lines.length).fill(false);
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const isFence = /^(```|~~~)/.test(trimmed);
    if (isFence) {
      // The fence delimiter line itself counts as doc context, then toggle.
      inDoc[i] = true;
      fenced = !fenced;
      continue;
    }
    if (fenced) { inDoc[i] = true; continue; }
    if (/^>/.test(trimmed)) inDoc[i] = true; // blockquote
  }
  return inDoc;
}

/**
 * True if the regex's match on `line` falls inside an inline-code span
 * (backticks). Documentation often quotes dangerous strings as `code`.
 */
function matchInInlineCode(line: string, regex: RegExp): boolean {
  regex.lastIndex = 0;
  const m = regex.exec(line);
  regex.lastIndex = 0;
  if (!m) return false;
  const start = m.index;
  // Count unescaped backticks before the match start; odd = inside a span.
  let ticks = 0;
  for (let i = 0; i < start && i < line.length; i++) if (line[i] === "`") ticks++;
  return ticks % 2 === 1;
}

/**
 * Run static regex scan on the given text against a set of rules.
 * Each rule's `patterns[]` are compiled to RegExp and matched against `text`.
 * Returns findings with line-level evidence. Matches inside code blocks,
 * blockquotes, or inline-code spans are downgraded one severity tier
 * (documentation context).
 */
export function runStaticScan(text: string, rules: Rule[]): ScanResult {
  const findings: Finding[] = [];
  const lines = text.split("\n");
  const inDoc = computeDocContext(lines);

  for (const rule of rules) {
    if (!rule.patterns || rule.patterns.length === 0) continue;

    for (const pattern of rule.patterns) {
      let regex: RegExp;
      try {
        regex = new RegExp(pattern, "gi");
      } catch {
        // If pattern is invalid regex, do plain string match
        regex = new RegExp(escapeRegex(pattern), "gi");
      }

      // Search line by line for evidence
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (regex.test(line)) {
          // Reset lastIndex for global regexes
          regex.lastIndex = 0;

          const docContext = inDoc[i] || matchInInlineCode(line, regex);
          let severity: Severity = rule.severity;
          let note = "";
          if (docContext) {
            const downgraded = DOWNGRADE[rule.severity];
            if (downgraded === null) {
              break; // low-severity doc-context match → drop entirely
            }
            severity = downgraded;
            note = " [doc-context: downgraded]";
          }

          findings.push({
            id: rule.id,
            severity,
            evidence: `Line ${i + 1}: "${line.trim().substring(0, 200)}"${note}`,
            ref: `SKILL.md#L${i + 1}`,
          });
          break; // One finding per rule per file (deduplicate)
        }
        regex.lastIndex = 0;
      }
    }
  }

  return { findings };
}

/**
 * Scan manifest JSON for structural issues (MAN-* rules).
 */
export function runManifestScan(manifestJson: string, rules: Rule[]): ScanResult {
  const findings: Finding[] = [];

  for (const rule of rules) {
    switch (rule.id) {
      case "MAN-002": {
        // Try parsing JSON
        try {
          JSON.parse(manifestJson);
        } catch {
          findings.push({
            id: rule.id,
            severity: rule.severity,
            evidence: "catalog.json contains invalid JSON",
            ref: "catalog.json",
          });
        }
        break;
      }
      case "MAN-001": {
        // Check required fields
        try {
          const obj = JSON.parse(manifestJson);
          const missing: string[] = [];
          if (!obj.slug) missing.push("slug");
          if (!obj.name) missing.push("name");
          if (!obj.description) missing.push("description");
          if (missing.length > 0) {
            findings.push({
              id: rule.id,
              severity: rule.severity,
              evidence: `Missing required fields: ${missing.join(", ")}`,
              ref: "catalog.json",
            });
          }
        } catch {
          // Already caught by MAN-002
        }
        break;
      }
      case "MAN-003": {
        // Slug vs folder name — requires external context, skip in pure static
        break;
      }
      case "MAN-004": {
        // Check frontmatter name/description empty
        const nameMatch = manifestJson.match(/^name:\s*$/m);
        const descMatch = manifestJson.match(/^description:\s*$/m);
        if (nameMatch) {
          findings.push({
            id: rule.id,
            severity: rule.severity,
            evidence: "frontmatter 'name' field is empty",
            ref: "SKILL.md#frontmatter",
          });
        }
        if (descMatch) {
          findings.push({
            id: rule.id,
            severity: rule.severity,
            evidence: "frontmatter 'description' field is empty",
            ref: "SKILL.md#frontmatter",
          });
        }
        break;
      }
    }
  }

  return { findings };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
