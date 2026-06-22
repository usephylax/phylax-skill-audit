/**
 * extractors.ts — Auto-extract contract addresses and URLs from SKILL.md text.
 * Used when the caller omits `contracts[]` or `endpoints[]`.
 */

/** EVM address pattern: 0x followed by 40 hex chars. */
const EVM_ADDRESS_RE = /0x[a-fA-F0-9]{40}/g;

/** URL pattern (http/https). */
const URL_RE = /https?:\/\/[^\s<>"')\]]+/g;

/** Chain-id hint pattern near an address, e.g. "(chainId:8453)" or "@8453". */
const CHAIN_HINT_RE = /(?:chainId|chain_id|@)\s*[:=]?\s*(\d+)/gi;

/**
 * Extract unique EVM addresses from text.
 * Returns lowercase addresses for consistent matching.
 */
export function extractAddresses(text: string): string[] {
  const matches = text.match(EVM_ADDRESS_RE) ?? [];
  return [...new Set(matches.map((a) => a.toLowerCase()))];
}

/**
 * Extract unique URLs from text.
 */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_RE) ?? [];
  return [...new Set(matches)];
}

/**
 * Extract chain-id hints from text.
 * Returns the first chain-id found, or undefined.
 */
export function extractChainId(text: string): number | undefined {
  // Create fresh regex each call to avoid stale lastIndex from `g` flag
  const re = /(?:chainId|chain_id|@)\s*[:=]?\s*(\d+)/i;
  const match = re.exec(text);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Build contract descriptors from raw addresses + optional chain hint.
 * Format: "0x... (chainId:8453)"
 */
export function buildContractDescriptors(
  addresses: string[],
  defaultChainId: number = 8453
): string[] {
  return addresses.map((addr) => `${addr} (chainId:${defaultChainId})`);
}
