/**
 * scanner/endpoint.ts — Endpoint validation scanner.
 * Checks x402 payment-gated endpoints for schema validity, TLS, redirects,
 * reachability, and price sanity.
 */

import type { Finding, Rule, ScanResult } from "../types.js";

/**
 * Run endpoint checks on a list of URLs.
 * Each URL is probed and validated against X402-* rules.
 */
export async function runEndpointScan(
  endpoints: string[],
  rules: Rule[],
  allSkillPrices?: number[]  // median price context from catalog
): Promise<ScanResult> {
  const findings: Finding[] = [];

  for (const url of endpoints) {
    const urlFindings = await checkEndpoint(url, rules, allSkillPrices);
    findings.push(...urlFindings);
  }

  return { findings };
}

/**
 * Check a single endpoint against rules.
 */
async function checkEndpoint(
  url: string,
  rules: Rule[],
  allSkillPrices?: number[]
): Promise<Finding[]> {
  const findings: Finding[] = [];

  // X402-041: HTTP instead of HTTPS
  if (url.startsWith("http://") && !url.startsWith("http://localhost") && !url.startsWith("http://127.0.0.1")) {
    const rule = rules.find((r) => r.id === "X402-041");
    if (rule) {
      findings.push({
        id: rule.id,
        severity: rule.severity,
        evidence: `Endpoint uses HTTP instead of HTTPS: ${url}`,
        ref: url,
      });
    }
  }

  // Probe the endpoint
  let resp: Response | null = null;
  let redirectCount = 0;
  let finalUrl = url;

  try {
    // Manual redirect counting
    const probe = await fetchWithRedirectCount(url, 5);
    resp = probe.response;
    redirectCount = probe.redirectCount;
    finalUrl = probe.finalUrl;
  } catch (err) {
    const rule = rules.find((r) => r.id === "X402-040");
    if (rule) {
      findings.push({
        id: rule.id,
        severity: rule.severity,
        evidence: `Endpoint unreachable: ${err instanceof Error ? err.message : "unknown error"}`,
        ref: url,
      });
    }
    return findings;
  }

  // X402-042: Suspicious redirect chain
  if (redirectCount > 3) {
    const rule = rules.find((r) => r.id === "X402-042");
    if (rule) {
      findings.push({
        id: rule.id,
        severity: rule.severity,
        evidence: `Redirect chain exceeded 3 hops (${redirectCount} hops): ${url} → ${finalUrl}`,
        ref: url,
      });
    }
  }

  // Check if redirect changed domain
  try {
    const origDomain = new URL(url).hostname;
    const finalDomain = new URL(finalUrl).hostname;
    if (origDomain !== finalDomain) {
      const rule = rules.find((r) => r.id === "X402-042");
      if (rule) {
        findings.push({
          id: rule.id,
          severity: rule.severity,
          evidence: `Redirect changed domain: ${origDomain} → ${finalDomain}`,
          ref: url,
        });
      }
    }
  } catch {
    // invalid URL — skip
  }

  // X402-001: Check for 402 response (x402 schema)
  if (resp && resp.status === 402) {
    // Check for x-payment-required header or body
    const hasPaymentHeader = resp.headers.get("x-payment-required") !== null;
    let hasPaymentBody = false;
    try {
      const body = await resp.clone().json();
      hasPaymentBody = typeof body === "object" && body !== null && ("paymentRequired" in body || "x402" in body);
    } catch {
      // not JSON
    }

    if (!hasPaymentHeader && !hasPaymentBody) {
      const rule = rules.find((r) => r.id === "X402-001");
      if (rule) {
        findings.push({
          id: rule.id,
          severity: rule.severity,
          evidence: `402 response missing x-payment-required header and valid body schema`,
          ref: url,
        });
      }
    }
  } else if (resp && resp.status >= 500) {
    const rule = rules.find((r) => r.id === "X402-040");
    if (rule) {
      findings.push({
        id: rule.id,
        severity: rule.severity,
        evidence: `Endpoint returned server error: HTTP ${resp.status}`,
        ref: url,
      });
    }
  }

  // X402-030: Price sanity check
  if (allSkillPrices && allSkillPrices.length > 0) {
    const median = calculateMedian(allSkillPrices);
    // For MVP, we don't have the endpoint's price — this is a placeholder
    // Real implementation would parse price from 402 response body
  }

  return findings;
}

/**
 * Fetch with redirect counting (Node 18+ fetch doesn't expose redirect count).
 */
async function fetchWithRedirectCount(
  url: string,
  maxRedirects: number
): Promise<{ response: Response | null; redirectCount: number; finalUrl: string }> {
  let currentUrl = url;
  let redirectCount = 0;
  let response: Response | null = null;

  for (let i = 0; i <= maxRedirects; i++) {
    response = await fetch(currentUrl, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) break;
      currentUrl = new URL(location, currentUrl).toString();
      redirectCount++;
    } else {
      break;
    }
  }

  return { response, redirectCount, finalUrl: currentUrl };
}

function calculateMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
