/** Shared x402 deep-audit config (site + API). */
export const X402 = {
  terminal: "https://usephylax.com/#x402",
  dashboard: "https://usephylax.com/#x402",
  docs: "https://github.com/usephylax/phylax-skill-audit#x402-deep-audit",
  deepPriceUsdc: "0.05",
  /** Set VITE_PHYLAX_X402_DEEP_URL after deploy for live links on the site. */
  deepAuditUrl:
    import.meta.env.VITE_PHYLAX_X402_DEEP_URL?.trim() ||
    "https://usephylax.com/api/audit?mode=deep",
  tagline: "Security layer for skills & x402 endpoints",
} as const;
