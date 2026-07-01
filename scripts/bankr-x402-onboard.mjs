#!/usr/bin/env node
/**
 * Post-deploy helper: sync profile + print terminal listing prompts.
 *
 * Usage:
 *   BANKR_API_KEY=bk_... PHYLAX_X402_DEEP_URL=https://x402.bankr.bot/0x.../audit-deep \
 *     node scripts/bankr-x402-onboard.mjs
 */

const deepUrl = process.env.PHYLAX_X402_DEEP_URL?.trim();

if (!deepUrl) {
  console.error("Set PHYLAX_X402_DEEP_URL to your deployed audit-deep URL.");
  console.error("Deploy first: cd x402/audit-deep && npm i && cd ../.. && bankr x402 deploy");
  process.exit(1);
}

console.log("Phylax x402 onboard\n");
console.log("1. Vercel env (site project):");
console.log(`   PHYLAX_X402_DEEP_URL=${deepUrl}\n`);
console.log("2. Sync Bankr profile:");
console.log(`   BANKR_API_KEY=bk_... PHYLAX_X402_DEEP_URL=${deepUrl} npm run bankr:sync\n`);
console.log("3. Paste in Bankr chat (terminal/x402 listing):");
console.log(`
List my audit-deep x402 endpoint on the marketplace: ${deepUrl}
Project: Phylax — security layer for skills & x402 endpoints on Bankr.
Free fast audits: https://usephylax.com/api/audit
Paid deep audits: ${deepUrl} ($0.05 USDC)
Website: https://usephylax.com
`.trim());
console.log("\n4. Dashboard: https://bankr.bot/x402");
console.log("5. Terminal:  https://bankr.bot/terminal/x402");
