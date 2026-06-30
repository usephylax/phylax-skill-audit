/**
 * urlSafety.ts — SSRF guards for outbound HTTP fetches.
 */

export type FetchUrlPolicy = {
  /** Reject http:// (recommended for server-side fetches). */
  httpsOnly?: boolean;
  /** Allow localhost / RFC1918 targets (CLI-only; never on public API). */
  allowPrivateHosts?: boolean;
};

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata.goog",
]);

function parseIpv4(host: string): number[] | null {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  const parts = host.split(".").map((p) => Number(p));
  if (parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return parts;
}

function isPrivateIpv4(parts: number[]): boolean {
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return true;
  }
  const ipv4 = parseIpv4(host);
  if (ipv4) return isPrivateIpv4(ipv4);
  if (host.includes(":")) return true; // IPv6 literals
  return false;
}

/**
 * Validate a URL before the engine fetches it. Returns the normalized href.
 * @throws Error when the URL is not allowed
 */
export function validateFetchUrl(url: string, policy: FetchUrlPolicy = {}): string {
  const { httpsOnly = false, allowPrivateHosts = false } = policy;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Blocked URL scheme: ${parsed.protocol}`);
  }
  if (httpsOnly && parsed.protocol !== "https:") {
    throw new Error("HTTPS is required for remote fetches");
  }
  if (parsed.username || parsed.password) {
    throw new Error("URLs with embedded credentials are not allowed");
  }
  if (!allowPrivateHosts && isPrivateHostname(parsed.hostname)) {
    throw new Error(`Blocked private or local hostname: ${parsed.hostname}`);
  }

  return parsed.href;
}

export function isSafeFetchUrl(url: string, policy: FetchUrlPolicy = {}): boolean {
  try {
    validateFetchUrl(url, policy);
    return true;
  } catch {
    return false;
  }
}

/** Default policy for serverless / production outbound fetches. */
export function productionFetchPolicy(): FetchUrlPolicy {
  return {
    httpsOnly: process.env.NODE_ENV === "production",
    allowPrivateHosts: false,
  };
}
