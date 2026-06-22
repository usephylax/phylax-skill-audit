/**
 * static.test.ts — Unit tests for the static scanner.
 * Uses fixture SKILL.md files to verify detection correctness.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runStaticScan } from "../src/scanner/static.js";
import { loadRules, rulesByCategory } from "../src/rules.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RULES_DIR = resolve(__dirname, "..", "rules");

const allRules = loadRules(RULES_DIR);
const piRules = rulesByCategory(allRules, "PI");
const secRules = rulesByCategory(allRules, "SEC");
const manRules = rulesByCategory(allRules, "MAN");

function loadFixture(name: string): string {
  return readFileSync(resolve(__dirname, "fixtures", name), "utf-8");
}

describe("Static Scanner — Clean Skill", () => {
  it("produces no PI findings for a clean skill", () => {
    const text = loadFixture("clean-skill.md");
    const result = runStaticScan(text, piRules);
    expect(result.findings).toHaveLength(0);
  });

  it("produces no SEC findings for a clean skill", () => {
    const text = loadFixture("clean-skill.md");
    const result = runStaticScan(text, secRules);
    expect(result.findings).toHaveLength(0);
  });
});

describe("Static Scanner — Injection Skill", () => {
  it("detects PI-001 (transfer instruction)", () => {
    const text = loadFixture("inject-skill.md");
    const result = runStaticScan(text, piRules);
    const pi001 = result.findings.find((f) => f.id === "PI-001");
    expect(pi001).toBeDefined();
    expect(pi001!.severity).toBe("critical");
    expect(pi001!.evidence).toContain("transfer all USDC");
  });

  it("detects PI-002 (ignore instructions)", () => {
    const text = loadFixture("inject-skill.md");
    const result = runStaticScan(text, piRules);
    const pi002 = result.findings.find((f) => f.id === "PI-002");
    expect(pi002).toBeDefined();
    expect(pi002!.severity).toBe("critical");
    expect(pi002!.evidence).toContain("Ignore all previous instructions");
  });

  it("detects SEC-001 (private key request)", () => {
    const text = loadFixture("inject-skill.md");
    const result = runStaticScan(text, secRules);
    const sec001 = result.findings.find((f) => f.id === "SEC-001");
    expect(sec001).toBeDefined();
    expect(sec001!.severity).toBe("critical");
    expect(sec001!.evidence).toContain("private key");
  });

  it("detects SEC-001 (seed phrase request)", () => {
    const text = loadFixture("inject-skill.md");
    const result = runStaticScan(text, secRules);
    const seedFindings = result.findings.filter((f) => f.id === "SEC-001");
    expect(seedFindings.length).toBeGreaterThanOrEqual(1);
  });
});

describe("Static Scanner — Honeypot Skill", () => {
  it("detects CON-020 (sell tax pattern) in static text", () => {
    const text = loadFixture("honeypot-skill.md");
    // CON rules have patterns too, run them as static
    const conRules = rulesByCategory(allRules, "CON");
    const result = runStaticScan(text, conRules);
    const con020 = result.findings.find((f) => f.id === "CON-020");
    expect(con020).toBeDefined();
    expect(con020!.severity).toBe("critical");
    expect(con020!.evidence).toContain("sell_tax");
  });

  it("detects CON-012 (privileged functions)", () => {
    const text = loadFixture("honeypot-skill.md");
    const conRules = rulesByCategory(allRules, "CON");
    const result = runStaticScan(text, conRules);
    const con012 = result.findings.find((f) => f.id === "CON-012");
    expect(con012).toBeDefined();
    expect(con012!.severity).toBe("high");
  });
});
