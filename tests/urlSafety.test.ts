/**
 * urlSafety.test.ts — SSRF guard unit tests.
 */

import { describe, it, expect } from "vitest";
import { validateFetchUrl, isSafeFetchUrl } from "../src/urlSafety.js";

describe("validateFetchUrl", () => {
  it("allows public https URLs", () => {
    expect(validateFetchUrl("https://raw.githubusercontent.com/o/r/HEAD/SKILL.md")).toContain(
      "raw.githubusercontent.com"
    );
  });

  it("blocks localhost", () => {
    expect(() => validateFetchUrl("http://127.0.0.1/")).toThrow(/Blocked private/);
    expect(() => validateFetchUrl("http://localhost/admin")).toThrow(/Blocked private/);
  });

  it("blocks cloud metadata hosts", () => {
    expect(() => validateFetchUrl("http://169.254.169.254/latest/meta-data/")).toThrow(/Blocked private/);
  });

  it("blocks private RFC1918 addresses", () => {
    expect(() => validateFetchUrl("http://192.168.1.1/")).toThrow(/Blocked private/);
    expect(() => validateFetchUrl("http://10.0.0.5/")).toThrow(/Blocked private/);
  });

  it("blocks non-http schemes", () => {
    expect(() => validateFetchUrl("file:///etc/passwd")).toThrow(/Blocked URL scheme/);
  });

  it("enforces https-only policy", () => {
    expect(() =>
      validateFetchUrl("http://example.com/skill.md", { httpsOnly: true })
    ).toThrow(/HTTPS is required/);
  });

  it("allows localhost only when explicitly permitted", () => {
    expect(
      validateFetchUrl("http://127.0.0.1:3000/api", { allowPrivateHosts: true })
    ).toContain("127.0.0.1");
  });

  it("isSafeFetchUrl returns boolean without throwing", () => {
    expect(isSafeFetchUrl("https://example.com")).toBe(true);
    expect(isSafeFetchUrl("http://127.0.0.1/")).toBe(false);
  });
});
