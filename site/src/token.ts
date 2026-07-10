/** Official $PHYLAX token on Robinhood Chain — single source of truth for the site. */
export const TOKEN = {
  address: "0xa5be32780e7307301e1932ae99d1eb98fa3d50cc",
  symbol: "PHYLAX",
  chain: "Robinhood Chain",
  chainId: 4663,
  bankr: "https://bankr.bot/agents/phylax",
  explorer: "https://robinhoodchain.blockscout.com/token/0xa5be32780e7307301e1932ae99d1eb98fa3d50cc",
  x: "https://x.com/usephylax",
} as const;

export function shortenAddress(addr: string, head = 6, tail = 4): string {
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
