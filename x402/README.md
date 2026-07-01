# Phylax on Bankr x402 Cloud

Paid **deep** audits via [Bankr x402 Cloud](https://docs.bankr.bot/x402-cloud/overview/).  
**Fast** audits stay free on [usephylax.com/api/audit](https://usephylax.com/api/audit).

Phylax is a **security layer** for skills and x402 endpoints on Bankr — not a competitor to x402 Cloud.

| Tier | Where | Mode | Price |
|------|-------|------|-------|
| Free | `usephylax.com/api/audit`, npm CLI | `fast` | $0 |
| Paid | `x402.bankr.bot/.../audit-deep` | `deep` | $0.05 USDC/req |

Deep adds honeypot `transfer` simulation on Base + full contract bytecode checks.

---

## Architecture (why proxy, not bundle)

Bankr x402 deploy uploads **only** `x402/<service>/index.ts` — local imports and the `rules/` tree are **not** included. Bundling `phylax-skill-audit` from npm also fails at runtime because rule YAML paths resolve incorrectly in the Bankr builder sandbox.

**Fix:** the x402 handler is a thin **payment gateway** that proxies to the hosted Vercel engine after x402 settlement:

```text
Client → x402.bankr.bot/audit-deep ($0.05 USDC)
       → handler POST usephylax.com/api/audit (mode=deep, internal key)
       → full audit engine (rules + Base RPC on Vercel)
```

Shared secret: `PHYLAX_INTERNAL_AUDIT_KEY` must match on **both** Vercel and Bankr x402 env.

Live endpoint: https://x402.bankr.bot/0x7fc2987df6e0fb7567d64838696a5bac4d220b91/audit-deep

---

## 1. Deploy the endpoint

**Prerequisites:** [Bankr CLI](https://docs.bankr.bot/) installed and `bankr login`.

```bash
# From repo root — no npm install in x402/audit-deep (zero deps)
openssl rand -hex 24   # save as INTERNAL_KEY

# Vercel (site project)
vercel env add PHYLAX_INTERNAL_AUDIT_KEY production   # paste INTERNAL_KEY
vercel env add PHYLAX_X402_DEEP_URL production        # set after first deploy

# Bankr x402
bankr x402 env set PHYLAX_INTERNAL_AUDIT_KEY=<INTERNAL_KEY>

bankr x402 deploy
```

Redeploy x402 **after** setting env vars so the handler receives the key at runtime.

---

## 2. Wire the free API to x402

On Vercel (site project):

```
PHYLAX_X402_DEEP_URL=https://x402.bankr.bot/0xYourWallet/audit-deep
```

When callers request `mode=deep` on the public API, they get HTTP **402** with this URL. Only the x402 handler (internal key) may call `mode=deep` on Vercel directly.

---

## 3. Sync Bankr agent profile

```bash
export BANKR_API_KEY=bk_...
export PHYLAX_X402_DEEP_URL=https://x402.bankr.bot/0xYourWallet/audit-deep
npm run bankr:sync
```

Or: `npm run bankr:x402:onboard`

---

## 4. Test

```bash
# Unpaid → 402
curl -si -X POST "https://x402.bankr.bot/0xYourWallet/audit-deep" \
  -H "Content-Type: application/json" \
  -d '{"skill_source":"owner/repo"}'

# Paid (Bankr wallet)
bankr x402 call -X POST -y -d '{"skill_source":"owner/repo"}' \
  "https://x402.bankr.bot/0xYourWallet/audit-deep"
```

---

## Files

```
bankr.x402.json           # service config + JSON schema
x402/audit-deep/
  index.ts                # proxy handler (single file, zero npm deps)
  package.json            # private metadata only
```

**Do not** import `phylax-skill-audit` or split into local modules — Bankr only bundles `index.ts`.

For native in-sandbox audits (advanced), set `PHYLAX_RULES_DIR` when running the npm package and ensure `rules/` is on disk. The production x402 path uses the Vercel proxy above.
