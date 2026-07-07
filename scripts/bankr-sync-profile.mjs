#!/usr/bin/env node
/**
 * Sync Phylax project metadata to Bankr agent profile.
 *
 * Usage:
 *   BANKR_API_KEY=bk_... node scripts/bankr-sync-profile.mjs
 *
 * Requires a Bankr API key from https://bankr.bot/api-keys
 * (linked to the wallet that owns the phylax profile).
 */

const API = "https://api.bankr.bot";
const KEY = process.env.BANKR_API_KEY;
const X402_DEEP_URL =
  process.env.PHYLAX_X402_DEEP_URL?.trim() || "https://bankr.bot/terminal/x402";

const TAGLINE =
  "Security layer for skills & x402 endpoints on Bankr. Pre-install audits — complements x402 Cloud, does not compete.";

if (!KEY) {
  console.error("Missing BANKR_API_KEY. Export your key from https://bankr.bot/api-keys");
  process.exit(1);
}

const headers = {
  "X-API-Key": KEY,
  "Content-Type": "application/json",
};

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

const PRODUCTS = [
  {
    name: "Phylax CLI + npm",
    description: "npx phylax@0.2.4 --skill ./SKILL.md — deterministic ALLOW/WARN/DENY verdict (fast, free).",
    url: "https://www.npmjs.com/package/phylax-skill-audit/v/0.2.4",
  },
  {
    name: "Audit API (fast, free)",
    description: "POST /api/audit mode=fast + GET /api/badge — hosted verdict + embeddable SVG badge.",
    url: "https://usephylax.com/api/audit",
  },
  {
    name: "Deep audit (x402)",
    description: `Bankr x402 Cloud — honeypot simulation on Base. $0.05 USDC/request.`,
    url: X402_DEEP_URL,
  },
  {
    name: "Aeon skill",
    description: "Native onchain-security skill: ./add-skill aaronjmars/aeon phylax-audit",
    url: "https://github.com/usephylax/phylax-skill-audit",
  },
];

const UPDATE = {
  title: "x402 Cloud — deep audits + Bankr security layer",
  content: [
    TAGLINE,
    "",
    "• Fast audits: free at https://usephylax.com/api/audit",
    `• Deep audits: $0.05 USDC on Bankr x402 → ${X402_DEEP_URL}`,
    "• Validates x402 payment endpoints (X402-*) for other Bankr builders",
    "• Deploy: bankr x402 deploy from github.com/usephylax/phylax-skill-audit",
    "",
    "Open source: https://github.com/usephylax/phylax-skill-audit",
  ].join("\n"),
};

async function main() {
  const before = await api("GET", "/agent/profile");
  console.log(`Profile: ${before.slug} · approved=${before.approved}`);

  await api("PUT", "/agent/profile", {
    description:
      "Security layer for skills & x402 endpoints on Bankr. Pre-install audit: SKILL.md, contracts, x402 APIs — ALLOW/WARN/DENY with evidence. Free fast tier (npm + API), deep mode on x402 Cloud ($0.05). Open source (MIT).",
    website: "https://usephylax.com",
    products: PRODUCTS,
  });
  console.log("✓ Updated description, website, products");

  await api("POST", "/agent/profile/update", UPDATE);
  console.log(`✓ Posted project update: ${UPDATE.title}`);

  const after = await api("GET", "/agent/profile");
  console.log(`Done. ${after.projectUpdates?.length ?? 0} updates on profile.`);
  console.log(`Public: https://bankr.bot/agents/${after.slug}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
