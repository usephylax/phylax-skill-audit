/** Official $PHYLAX token — live on Robinhood Chain via Virtuals. Single source of truth. */
export const TOKEN = {
  address: "0xff36bcb3cb9e3e2dac718ccaec3bc5ed489d9f0d",
  symbol: "PHYLAX",
  chain: "Robinhood Chain",
  chainId: 4663,
  launchpad: "Virtuals",
  status: "Live",
  explorer:
    "https://robinhoodchain.blockscout.com/token/0xff36bcb3cb9e3e2dac718ccaec3bc5ed489d9f0d",
  x: "https://x.com/usephylax",
} as const;

export function shortenAddress(addr: string, head = 6, tail = 4): string {
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}
