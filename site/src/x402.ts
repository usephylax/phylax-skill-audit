/** Shared x402 deep-audit config (site + API). */
export const X402 = {
  terminal: "https://bankr.bot/terminal/x402",
  dashboard: "https://bankr.bot/x402",
  docs: "https://docs.bankr.bot/x402-cloud/overview/",
  deepPriceUsdc: "0.05",
  /** Set VITE_PHYLAX_X402_DEEP_URL after deploy for live links on the site. */
  deepAuditUrl:
    import.meta.env.VITE_PHYLAX_X402_DEEP_URL?.trim() ||
    "https://x402.bankr.bot/0x7fc2987df6e0fb7567d64838696a5bac4d220b91/audit-deep",
  tagline: "Security layer for skills & x402 endpoints on Bankr",
} as const;
