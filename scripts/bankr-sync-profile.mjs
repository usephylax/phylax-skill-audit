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
    description: "npx phylax@0.2.2 --skill ./SKILL.md — deterministic ALLOW/WARN/DENY verdict.",
    url: "https://www.npmjs.com/package/phylax-skill-audit/v/0.2.2",
  },
  {
    name: "Audit API",
    description: "POST /api/audit and GET /api/badge — hosted verdict + embeddable SVG badge (SSRF-hardened).",
    url: "https://usephylax.com/api/audit",
  },
  {
    name: "Aeon skill",
    description: "Native onchain-security skill: ./add-skill aaronjmars/aeon phylax-audit",
    url: "https://github.com/usephylax/phylax-skill-audit",
  },
];

const UPDATE = {
  title: "v0.2.2 — API hardening & test suite",
  content: [
    "Shipped phylax-skill-audit@0.2.2 on npm.",
    "",
    "• SSRF guards on hosted API (blocks private IPs, metadata hosts, local paths)",
    "• fast vs deep mode documented; honeypot simulation in deep mode",
    "• 54 automated tests (integration + urlSafety)",
    "• Official CA on usephylax.com/#token",
    "",
    "Open source: https://github.com/usephylax/phylax-skill-audit",
  ].join("\n"),
};

async function main() {
  const before = await api("GET", "/agent/profile");
  console.log(`Profile: ${before.slug} · approved=${before.approved}`);

  await api("PUT", "/agent/profile", {
    description:
      "Pre-install security audit for agent skills on Base. Scans SKILL.md, onchain contracts, and x402 endpoints — deterministic ALLOW / WARN / DENY with evidence. npm v0.2.2, hosted API, Aeon skill. Open source (MIT).",
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
