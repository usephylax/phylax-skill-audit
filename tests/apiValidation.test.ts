/**
 * apiValidation.test.ts — HTTP API input validation (mirrors site/api/_lib.ts rules).
 */

import { describe, it, expect } from "vitest";
import { validateFetchUrl } from "../src/urlSafety.js";

const API_POLICY = { httpsOnly: true, allowPrivateHosts: false };

describe("HTTP API fetch policy", () => {
  it("allows raw.githubusercontent.com skill URLs", () => {
    expect(
      validateFetchUrl(
        "https://raw.githubusercontent.com/usephylax/phylax-skill-audit/HEAD/SKILL.md",
        API_POLICY
      )
    ).toContain("raw.githubusercontent.com");
  });

  it("blocks SSRF targets used in skill_source", () => {
    expect(() => validateFetchUrl("http://127.0.0.1/", API_POLICY)).toThrow();
    expect(() => validateFetchUrl("http://169.254.169.254/", API_POLICY)).toThrow();
    expect(() => validateFetchUrl("http://192.168.0.1/", API_POLICY)).toThrow();
  });

  it("rejects plain http for remote API fetches", () => {
    expect(() =>
      validateFetchUrl("http://example.com/skill.md", API_POLICY)
    ).toThrow(/HTTPS is required/);
  });
});
