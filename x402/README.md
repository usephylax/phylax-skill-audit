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

## 1. Deploy the endpoint

**Prerequisites:** [Bankr CLI](https://docs.bankr.bot/) installed and `bankr login`.

```bash
# From repo root
cd x402/audit-deep && npm install && cd ../..

# Optional: custom Base RPC (default: public mainnet.base.org)
bankr x402 env set BASE_RPC_URL=https://mainnet.base.org

bankr x402 deploy
```

Expected output:

```text
✔ Deployed 1 service(s)
  Service:  audit-deep
  URL:      https://x402.bankr.bot/0xYourWallet/audit-deep
  Price:    $0.05 USDC/req
```

Save the URL — you need it for Vercel and the site.

---

## 2. Wire the free API to x402

Set on Vercel (project `site`):

```bash
PHYLAX_X402_DEEP_URL=https://x402.bankr.bot/0xYourWallet/audit-deep
```

When callers request `mode=deep` on the free API, they get HTTP 402 with this URL.

---

## 3. Sync Bankr agent profile

```bash
export BANKR_API_KEY=bk_...
export PHYLAX_X402_DEEP_URL=https://x402.bankr.bot/0xYourWallet/audit-deep
npm run bankr:sync
```

---

## 4. List on x402 terminal

Open [bankr.bot/terminal/x402](https://bankr.bot/terminal/x402) or chat with Bankr:

```text
List my audit-deep x402 endpoint on the x402 marketplace.
Add Phylax as a security layer project — pre-install audits for Bankr skills and x402 APIs.
```

Or create/update your project card:

```text
Create a project for Phylax on the x402 terminal:
- Tagline: Security layer for skills & x402 endpoints on Bankr
- Website: https://usephylax.com
- x402 endpoint: https://x402.bankr.bot/0xYourWallet/audit-deep ($0.05 deep audit)
- Free tier: https://usephylax.com/api/audit (fast mode)
```

Dashboard: [bankr.bot/x402](https://bankr.bot/x402) — logs, revenue, env vars.

---

## 5. Test

```bash
# Unpaid → 402 Payment Required
curl -i "https://x402.bankr.bot/0xYourWallet/audit-deep"

# Paid call via Bankr CLI (handles wallet)
bankr x402 call https://x402.bankr.bot/0xYourWallet/audit-deep -i

# Or POST with x402-fetch (see Bankr docs)
```

Example body:

```json
{
  "skill_source": "usephylax/phylax-skill-audit",
  "chain_id": 8453
}
```

---

## Files

```
bankr.x402.json          # service config + JSON schema for agents
x402/audit-deep/
  index.ts               # handler (always mode=deep)
  validate.ts            # SSRF-safe input validation
  package.json           # pins phylax-skill-audit@0.2.2
```
