/**
 * rules.ts — Rule loader. Reads YAML rule files and returns typed Rule objects.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { Rule } from "./types.js";

/**
 * Derive category from rule ID prefix (e.g. "PI-001" → "PI").
 */
function deriveCategory(ruleId: string): Rule["category"] {
  const prefix = ruleId.split("-")[0];
  const valid: Record<string, Rule["category"]> = {
    PI: "PI", SEC: "SEC", CON: "CON", X402: "X402", MAN: "MAN", LIQ: "LIQ",
  };
  return valid[prefix] ?? "PI"; // fallback
}

/**
 * Load all rule YAML files from the given directory.
 * Each YAML file must have a top-level `rules` array.
 * Category is auto-derived from rule ID prefix if not present.
 */
export function loadRules(rulesDir: string): Rule[] {
  const files = readdirSync(rulesDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
  const rules: Rule[] = [];

  for (const file of files) {
    const raw = readFileSync(join(rulesDir, file), "utf-8");
    const parsed = parseYaml(raw) as { rules: Rule[] };
    if (Array.isArray(parsed.rules)) {
      for (const rule of parsed.rules) {
        // Auto-derive category from ID if missing
        if (!rule.category) {
          (rule as Rule).category = deriveCategory(rule.id);
        }
        rules.push(rule as Rule);
      }
    }
  }

  return rules;
}

/**
 * Filter rules by category prefix.
 */
export function rulesByCategory(rules: Rule[], category: Rule["category"]): Rule[] {
  return rules.filter((r) => r.category === category);
}
