/** Official $PHYLAX token on Base — single source of truth for the site. */
export const TOKEN = {
  address: "0xd7e608d398b88fe3084b495e9b86de2db343cba3",
  symbol: "PHYLAX",
  chain: "Base",
  chainId: 8453,
  bankr: "https://bankr.bot/agents/phylax",
  basescan: "https://basescan.org/token/0xd7e608d398b88fe3084b495e9b86de2db343cba3",
  x: "https://x.com/usephylax",
} as const;

export function shortenAddress(addr: string, head = 6, tail = 4): string {
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
