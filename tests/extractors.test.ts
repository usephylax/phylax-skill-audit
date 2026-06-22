/**
 * extractors.test.ts — Unit tests for auto-extraction of addresses and URLs.
 */

import { describe, it, expect } from "vitest";
import { extractAddresses, extractUrls, extractChainId, buildContractDescriptors } from "../src/extractors.js";

describe("extractAddresses", () => {
  it("extracts EVM addresses from text", () => {
    const text = "Send to 0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef and 0xabcdef0000000000000000000000000000000000";
    const result = extractAddresses(text);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe("0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef");
  });

  it("deduplicates addresses", () => {
    const text = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef and again 0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
    const result = extractAddresses(text);
    expect(result).toHaveLength(1);
  });

  it("returns empty array when no addresses found", () => {
    expect(extractAddresses("no addresses here")).toHaveLength(0);
  });
});

describe("extractUrls", () => {
  it("extracts HTTP/HTTPS URLs", () => {
    const text = "Visit https://example.com/api and http://test.local/path";
    const result = extractUrls(text);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((u) => u.includes("example.com"))).toBe(true);
  });

  it("returns empty array when no URLs found", () => {
    expect(extractUrls("no urls here")).toHaveLength(0);
  });
});

describe("extractChainId", () => {
  it("extracts chainId from pattern", () => {
    expect(extractChainId("0xabc (chainId:8453)")).toBe(8453);
    expect(extractChainId("chain_id: 1")).toBe(1);
    expect(extractChainId("@137")).toBe(137);
  });

  it("returns undefined when no chain hint", () => {
    expect(extractChainId("no chain hint")).toBeUndefined();
  });
});

describe("buildContractDescriptors", () => {
  it("builds descriptors with default chain ID", () => {
    const result = buildContractDescriptors(["0xabc"], 8453);
    expect(result).toEqual(["0xabc (chainId:8453)"]);
  });

  it("uses provided chain ID", () => {
    const result = buildContractDescriptors(["0xabc"], 1);
    expect(result).toEqual(["0xabc (chainId:1)"]);
  });
});
