/**
 * scanner/static.ts — Static analysis scanner.
 * Runs regex-based detection on SKILL.md + manifest text.
 * Covers categories: PI (prompt injection), SEC (secret exfiltration),
 * MAN (manifest integrity).
 */

import type { Finding, Rule, ScanResult } from "../types.js";

/**
 * Run static regex scan on the given text against a set of rules.
 * Each rule's `patterns[]` are compiled to RegExp and matched against `text`.
 * Returns findings with line-level evidence.
 */
export function runStaticScan(text: string, rules: Rule[]): ScanResult {
  const findings: Finding[] = [];
  const lines = text.split("\n");

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

          findings.push({
            id: rule.id,
            severity: rule.severity,
            evidence: `Line ${i + 1}: "${line.trim().substring(0, 200)}"`,
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
