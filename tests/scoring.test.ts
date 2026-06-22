/**
 * scoring.test.ts — Unit tests for deterministic scoring + verdict logic.
 */

import { describe, it, expect } from "vitest";
import { calculateScore, deriveVerdict } from "../src/scoring.js";
import type { Finding } from "../src/types.js";

describe("calculateScore", () => {
  it("returns 100 for no findings", () => {
    expect(calculateScore([])).toBe(100);
  });

  it("deducts 40 for a single Critical finding", () => {
    const findings: Finding[] = [
      { id: "PI-001", severity: "critical", evidence: "test" },
    ];
    expect(calculateScore(findings)).toBe(60);
  });

  it("deducts 20 for a single High finding", () => {
    const findings: Finding[] = [
      { id: "CON-010", severity: "high", evidence: "test" },
    ];
    expect(calculateScore(findings)).toBe(80);
  });

  it("deducts 10 for a single Medium finding", () => {
    const findings: Finding[] = [
      { id: "LIQ-050", severity: "medium", evidence: "test" },
    ];
    expect(calculateScore(findings)).toBe(90);
  });

  it("deducts 3 for a single Low finding", () => {
    const findings: Finding[] = [
      { id: "MAN-001", severity: "low", evidence: "test" },
    ];
    expect(calculateScore(findings)).toBe(97);
  });

  it("accumulates penalties correctly", () => {
    const findings: Finding[] = [
      { id: "PI-001", severity: "critical", evidence: "test" },  // -40
      { id: "CON-010", severity: "high", evidence: "test" },     // -20
      { id: "LIQ-050", severity: "medium", evidence: "test" },   // -10
      { id: "MAN-001", severity: "low", evidence: "test" },      // -3
    ];
    // 100 - 40 - 20 - 10 - 3 = 27
    expect(calculateScore(findings)).toBe(27);
  });

  it("clamps to 0 (never negative)", () => {
    const findings: Finding[] = [
      { id: "A", severity: "critical", evidence: "test" },
      { id: "B", severity: "critical", evidence: "test" },
      { id: "C", severity: "critical", evidence: "test" },
    ];
    // 100 - 120 = -20 → clamp to 0
    expect(calculateScore(findings)).toBe(0);
  });
});

describe("deriveVerdict", () => {
  it("returns ALLOW for score ≥ 80 with no High/Critical", () => {
    const findings: Finding[] = [
      { id: "MAN-001", severity: "low", evidence: "test" },
    ];
    expect(deriveVerdict(findings, 97)).toBe("ALLOW");
  });

  it("returns DENY immediately if any Critical finding exists", () => {
    const findings: Finding[] = [
      { id: "PI-001", severity: "critical", evidence: "test" },
    ];
    // Even with score 100 (shouldn't happen, but test the rule)
    expect(deriveVerdict(findings, 100)).toBe("DENY");
  });

  it("returns DENY if score < 50", () => {
    const findings: Finding[] = [
      { id: "CON-010", severity: "high", evidence: "test" },
      { id: "CON-011", severity: "high", evidence: "test" },
      { id: "LIQ-050", severity: "medium", evidence: "test" },
    ];
    // 100 - 20 - 20 - 10 = 50 → not < 50, so WARN
    expect(deriveVerdict(findings, 50)).toBe("WARN");
    // But 49 → DENY
    expect(deriveVerdict(findings, 49)).toBe("DENY");
  });

  it("returns WARN for score 50-79 or with High but no Critical", () => {
    const findings: Finding[] = [
      { id: "CON-010", severity: "high", evidence: "test" },
    ];
    // Score 80 with High → WARN (not ALLOW because hasHigh)
    expect(deriveVerdict(findings, 80)).toBe("WARN");
    // Score 70 → WARN
    expect(deriveVerdict(findings, 70)).toBe("WARN");
  });

  it("returns WARN for medium findings with score 50-79", () => {
    const findings: Finding[] = [
      { id: "LIQ-050", severity: "medium", evidence: "test" },
      { id: "LIQ-051", severity: "medium", evidence: "test" },
      { id: "X402-030", severity: "medium", evidence: "test" },
    ];
    // 100 - 10 - 10 - 10 = 70
    expect(deriveVerdict(findings, 70)).toBe("WARN");
  });

  it("returns ALLOW for empty findings", () => {
    expect(deriveVerdict([], 100)).toBe("ALLOW");
  });
});
