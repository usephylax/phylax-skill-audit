/**
 * agt.test.ts — Tests for the AGT (Agent Authorization Risk) rule category.
 * Covers unlimited approvals, auto-execution, and permission escalation
 * requested in SKILL.md — the core risks when an agent trades on your behalf.
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
const agtRules = rulesByCategory(allRules, "AGT");

function loadFixture(name: string): string {
  return readFileSync(resolve(__dirname, "fixtures", name), "utf-8");
}

describe("AGT rules — loading", () => {
  it("loads AGT rules with the correct category", () => {
    expect(agtRules.length).toBeGreaterThanOrEqual(4);
    for (const r of agtRules) {
      expect(r.category).toBe("AGT");
      expect(r.id.startsWith("AGT-")).toBe(true);
    }
  });
});

describe("AGT scanner — agent-permission skill", () => {
  const text = loadFixture("agent-permission-skill.md");
  const result = runStaticScan(text, agtRules);

  it("detects AGT-001 (unlimited approval) as critical", () => {
    const f = result.findings.find((x) => x.id === "AGT-001");
    expect(f).toBeDefined();
    expect(f!.severity).toBe("critical");
    expect(f!.evidence.toLowerCase()).toContain("approve unlimited");
  });

  it("detects AGT-002 (auto-execution without confirmation)", () => {
    const f = result.findings.find((x) => x.id === "AGT-002");
    expect(f).toBeDefined();
    expect(f!.severity).toBe("high");
  });

  it("detects AGT-003 (disable safety prompt)", () => {
    const f = result.findings.find((x) => x.id === "AGT-003");
    expect(f).toBeDefined();
    expect(f!.severity).toBe("high");
  });

  it("detects AGT-004 (open-ended trading permission)", () => {
    const f = result.findings.find((x) => x.id === "AGT-004");
    expect(f).toBeDefined();
    expect(f!.severity).toBe("medium");
  });
});

describe("AGT scanner — clean skill", () => {
  it("produces no AGT findings for a clean skill", () => {
    const text = loadFixture("clean-skill.md");
    const result = runStaticScan(text, agtRules);
    expect(result.findings).toHaveLength(0);
  });
});
