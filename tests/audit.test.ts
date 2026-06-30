/**
 * audit.test.ts — End-to-end integration tests for the audit() pipeline.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { audit } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFixture(name: string): string {
  return readFileSync(resolve(__dirname, "fixtures", name), "utf-8");
}

/** Skip onchain/endpoint scans so tests stay deterministic and offline. */
const offline = { contracts: [] as string[], endpoints: [] as string[], mode: "fast" as const };

describe("audit() — integration", () => {
  it("returns ALLOW with score 100 for a clean skill", async () => {
    const result = await audit({
      skill_source: "clean-skill",
      skill_md: loadFixture("clean-skill.md"),
      ...offline,
    });

    expect(result.verdict).toBe("ALLOW");
    expect(result.score).toBe(100);
    expect(result.findings).toHaveLength(0);
  });

  it("returns DENY for prompt-injection + secret exfiltration skill", async () => {
    const result = await audit({
      skill_source: "inject-skill",
      skill_md: loadFixture("inject-skill.md"),
      ...offline,
    });

    expect(result.verdict).toBe("DENY");
    expect(result.score).toBe(0);
    const ids = result.findings.map((f) => f.id);
    expect(ids).toContain("PI-001");
    expect(ids).toContain("PI-002");
    expect(ids).toContain("SEC-001");
  });

  it("returns DENY for honeypot patterns declared in SKILL.md", async () => {
    const result = await audit({
      skill_source: "honeypot-skill",
      skill_md: loadFixture("honeypot-skill.md"),
      ...offline,
    });

    expect(result.verdict).toBe("DENY");
    const ids = result.findings.map((f) => f.id);
    expect(ids).toContain("CON-020");
    expect(ids).toContain("CON-012");
    expect(result.score).toBeLessThan(50);
  });

  it("flags invalid manifest JSON only when manifest is provided", async () => {
    const result = await audit({
      skill_source: "clean-skill",
      skill_md: loadFixture("clean-skill.md"),
      manifest: "not valid json {",
      ...offline,
    });

    expect(result.findings.some((f) => f.id === "MAN-002")).toBe(true);
  });

  it("does not flag MAN-002 when only SKILL.md is scanned (no manifest)", async () => {
    const result = await audit({
      skill_source: "clean-skill",
      skill_md: loadFixture("clean-skill.md"),
      ...offline,
    });

    expect(result.findings.some((f) => f.id === "MAN-002")).toBe(false);
  });

  it("produces deterministic output for the same input", async () => {
    const input = {
      skill_source: "inject-skill",
      skill_md: loadFixture("inject-skill.md"),
      ...offline,
    };
    const a = await audit(input);
    const b = await audit(input);
    expect(a).toEqual(b);
  });
});
