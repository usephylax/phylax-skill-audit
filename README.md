# Phylax — Skill Audit

Pre-install security audit for agent skills on **Base** (chain ID 8453).

Scans `SKILL.md` + manifest for prompt-injection and secret-exfiltration,
audits referenced contracts (unlimited approvals, upgradeable owner, honeypot),
and validates x402 endpoints. Returns a **deterministic** risk verdict
(`ALLOW` / `WARN` / `DENY`) with evidence.

## Quick Start

```bash
npm install
npm run build
npm test
```

## CLI Usage

```bash
# Scan a local SKILL.md
node dist/cli.js --skill ./path/to/SKILL.md

# Scan with explicit contracts + endpoints
node dist/cli.js --skill ./SKILL.md \
  --contracts "0xabc... (chainId:8453)" \
  --endpoints "https://api.example.com"

# Deep mode (onchain simulation)
node dist/cli.js --skill ./SKILL.md --mode deep
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
