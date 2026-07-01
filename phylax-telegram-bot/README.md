# Phylax Telegram Bot

Chat with a Cursor Cloud Agent from Telegram — build Phylax while rebahan 🛡️

## Security model (fail-closed)

| Layer | Guard |
|-------|--------|
| Telegram | `TELEGRAM_WEBHOOK_SECRET` **required** on every POST |
| Telegram | `TELEGRAM_CHAT_ID` allowlist — only your chat |
| Commands | Only `/ask …` and `/status` — no free-text agent triggers |
| Worker → Agent | `AGENT_BRIDGE_SECRET` bearer token |
| Agent server | Binds `127.0.0.1` only — not public; expose via tunnel if needed |
| Cursor | `CURSOR_API_KEY` stays on agent server, **never** on Worker |
| Repo | Pinned to `usephylax/phylax-skill-audit` only |
| Rate limit | Default 10 runs/hour per chat |

This follows the same lessons as GHSA-252c-qvvq-j2j9 (webhook secret, author allowlist, no shell injection).

## Architecture

```
Telegram → Cloudflare Worker (gate) → Agent bridge (VPS, localhost) → Cursor Cloud Agent → GitHub repo
```

## Setup

### 1. Cursor API key

Get from [cursor.com/settings](https://cursor.com/settings) → API keys.

### 2. Agent bridge (VPS or local machine)

```bash
cd phylax-telegram-bot/agent
cp ../.env.example .env
# fill CURSOR_API_KEY, AGENT_BRIDGE_SECRET (openssl rand -hex 32)

npm install
npm run dev
```

Verify: `curl http://127.0.0.1:8788/health`

### 3. Expose bridge to Worker (if Worker is on Cloudflare)

Use Tailscale, Cloudflare Tunnel, or nginx reverse proxy with **mTLS or IP allowlist**.
Never expose `/run` without the bridge secret.

Example tunnel:
```bash
cloudflared tunnel --url http://127.0.0.1:8788
# set AGENT_BRIDGE_URL to the tunnel URL in worker secrets
```

### 4. Cloudflare Worker

```bash
cd phylax-telegram-bot/worker
cp .dev.vars.example .dev.vars
# fill all vars

npm install
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
npx wrangler secret put AGENT_BRIDGE_SECRET
npx wrangler secret put AGENT_BRIDGE_URL

npm run deploy
```

### 5. Register Telegram webhook (with secret!)

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook\
?url=https://phylax-telegram-bot.<your>.workers.dev\
&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

## Usage

```
/ask run npm test and fix any failures
/ask add rate limit docs to README
/status
```

## What NOT to do

- Do not put `CURSOR_API_KEY` in Worker env
- Do not skip `secret_token` on setWebhook
- Do not bind agent server to `0.0.0.0` without a firewall
- Do not auto-merge agent changes — review in Cursor/GitHub first

## Requirements

- Cursor plan with API / Cloud Agents access
- Node.js 20+
- Cloudflare account (free tier OK)
