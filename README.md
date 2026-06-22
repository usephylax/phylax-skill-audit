<p align="center">
  <img src="assets/phylax-logo.svg" width="84" alt="Phylax" />
</p>

<h1 align="center">Phylax — Skill Audit</h1>

<p align="center">
  <strong>Pre-install security verdicts for agent skills on Base.</strong><br/>
  Scan a skill before it touches your wallet. Get a deterministic <code>ALLOW</code> / <code>WARN</code> / <code>DENY</code> with evidence.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/phylax-skill-audit"><img src="https://img.shields.io/npm/v/phylax-skill-audit?style=flat-square&color=3B82F6" alt="npm"></a>
  <img src="https://img.shields.io/badge/license-MIT-3ddc97?style=flat-square" alt="MIT">
  <img src="https://img.shields.io/badge/chain-Base%208453-48D8FF?style=flat-square" alt="Base">
  <a href="https://github.com/aaronjmars/aeon"><img src="https://img.shields.io/badge/skill-merged%20into%20Aeon-b98cff?style=flat-square" alt="Aeon"></a>
  <a href="https://usephylax.com"><img src="https://img.shields.io/badge/site-usephylax.com-E8E8EC?style=flat-square" alt="Site"></a>
</p>

---

Scans `SKILL.md` + manifest for prompt-injection and secret-exfiltration,
audits referenced contracts (unlimited approvals, upgradeable owner, honeypot),
and validates x402 endpoints. Returns a **deterministic** risk verdict
(`ALLOW` / `WARN` / `DENY`) with evidence.

> **Demo:** [`assets/phylax-demo.mp4`](assets/phylax-demo.mp4) — a 15s walkthrough of the CLI flagging a honeypot skill.

## Use it

Four ways, all live:

```bash
# 1. Install from npm
npm install phylax-skill-audit

# 2. Run the CLI (no install needed)
npx phylax --skill ./SKILL.md

# 3. Call the hosted HTTP API
curl -X POST https://usephylax.com/api/audit \
  -H "Content-Type: application/json" \
  -d '{"skill_source":"github.com/owner/repo/SKILL.md"}'

# 4. As an Aeon skill
./add-skill aaronjmars/aeon phylax-audit
```

## Build from source

```bash
npm install
npm run build
npm test
```

## CLI Usage

```bash
# Scan a local SKILL.md
npx phylax --skill ./path/to/SKILL.md

# Scan with explicit contracts + endpoints
npx phylax --skill ./SKILL.md \
  --contracts "0xabc... (chainId:8453)" \
  --endpoints "https://api.example.com"

# Deep mode (onchain simulation)
npx phylax --skill ./SKILL.md --mode deep
```

### Exit Codes

| Code | Verdict |
|------|---------|
| 0    | ALLOW   |
| 1    | WARN    |
| 2    | DENY    |

## Programmatic API

```typescript
import { audit } from "phylax-skill-audit";

const result = await audit({
  skill_source: "github.com/owner/repo/skills/my-skill",
  skill_md: fs.readFileSync("./SKILL.md", "utf-8"),
  contracts: ["0xabc... (chainId:8453)"],
  mode: "fast",
});

console.log(result.verdict); // "ALLOW" | "WARN" | "DENY"
console.log(result.score);   // 0–100
console.log(result.findings);
```

## HTTP API

A hosted endpoint wraps the same `audit()` engine:

```
POST https://usephylax.com/api/audit
Content-Type: application/json
```

```jsonc
// request body
{
  "skill_source": "github.com/owner/repo/SKILL.md", // required
  "skill_md": "...",      // optional raw SKILL.md (else fetched from source)
  "contracts": [],        // optional, auto-extracted
  "endpoints": [],        // optional, auto-extracted
  "chain_id": 8453,       // default Base
  "mode": "fast"          // "fast" | "deep"
}
```

Returns the same `AuditOutput` JSON (`verdict`, `score`, `findings`, `summary`, `ttl`).
Rate-limited to 20 requests/min per IP. `GET /api/audit` returns a self-describing usage doc.

## Scoring

```
score = 100 − Σ(severity_weight × hit_count)
```

| Severity | Weight |
|----------|--------|
| Critical | 40     |
| High     | 20     |
| Medium   | 10     |
| Low      | 3      |

Score clamped to `[0, 100]`.

## Verdict Rules

| Verdict | Condition |
|---------|-----------|
| ALLOW   | Score ≥ 80, no Critical or High findings |
| WARN    | Score 50–79, has Medium/High but no Critical |
| DENY    | Score < 50 **or** any Critical finding |

## Rules

Detection rules live in [`rules/`](./rules/) as versioned YAML files:

- `pi-rules.yaml` — Prompt injection (PI-*)
- `sec-rules.yaml` — Secret exfiltration (SEC-*)
- `con-rules.yaml` — Contract risk (CON-*)
- `x402-rules.yaml` — Endpoint validation (X402-*)
- `man-rules.yaml` — Manifest integrity (MAN-*)
- `liq-rules.yaml` — Liquidity & holder concentration (LIQ-*)

## Project Structure

```
phylax-skill-audit/
├── SKILL.md              # Skill definition
├── catalog.json          # Catalog metadata
├── src/
│   ├── index.ts          # Main entry point
│   ├── cli.ts            # CLI wrapper
│   ├── types.ts          # TypeScript types
│   ├── extractors.ts     # Auto-extract addresses/URLs
│   ├── rules.ts          # YAML rule loader
│   ├── scoring.ts        # Score + verdict logic
│   └── scanner/
│       ├── static.ts     # Static regex scanner
│       ├── onchain.ts    # Onchain bytecode + simulation
│       └── endpoint.ts   # x402 endpoint validation
├── rules/                # Detection rules (YAML, open-source)
└── tests/                # Vitest test suite
```

## MVP Acceptance Criteria

- ✅ Known safe skill → `ALLOW` (no false-positive)
- ✅ Honeypot contract → `DENY` with `CON-020`
- ✅ SKILL.md with "transfer funds" injection → `DENY` with `PI-001`
- ✅ Valid JSON output with evidence per finding
- ✅ Reproducible verdict (same input → same output)

## License

MIT

---

<p align="center">
  <sub>Phylax is a native <code>onchain-security</code> skill in <a href="https://github.com/aaronjmars/aeon">Aeon</a> — <code>./add-skill aaronjmars/aeon phylax-audit</code></sub>
</p>
