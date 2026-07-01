#!/usr/bin/env node
/**
 * Post-deploy helper: sync profile + print env checklist.
 *
 * Usage:
 *   BANKR_API_KEY=bk_... PHYLAX_X402_DEEP_URL=https://x402.bankr.bot/0x.../audit-deep \
 *     node scripts/bankr-x402-onboard.mjs
 */

const deepUrl = process.env.PHYLAX_X402_DEEP_URL?.trim();

if (!deepUrl) {
  console.error("Set PHYLAX_X402_DEEP_URL to your deployed audit-deep URL.");
  console.error("Deploy: bankr x402 env set PHYLAX_INTERNAL_AUDIT_KEY=<secret> && bankr x402 deploy");
  process.exit(1);
}

console.log("Phylax x402 onboard\n");
console.log("Architecture: x402 handler proxies to Vercel (rules + RPC). Set the same internal key on both sides.\n");
console.log("1. Vercel env (site project):");
console.log(`   PHYLAX_X402_DEEP_URL=${deepUrl}`);
console.log("   PHYLAX_INTERNAL_AUDIT_KEY=<openssl rand -hex 24>\n");
console.log("2. Bankr x402 env:");
console.log("   bankr x402 env set PHYLAX_INTERNAL_AUDIT_KEY=<same secret>");
console.log("   bankr x402 deploy audit-deep   # redeploy after env set\n");
console.log("3. Sync Bankr profile:");
console.log(`   BANKR_API_KEY=bk_... PHYLAX_X402_DEEP_URL=${deepUrl} npm run bankr:sync\n`);
console.log("4. Test paid call:");
console.log(`   bankr x402 call -X POST -y -d '{"skill_source":"owner/repo"}' ${deepUrl}\n`);
console.log("5. Marketplace listing — chat at https://bankr.bot/terminal/x402");
