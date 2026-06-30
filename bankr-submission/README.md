# Bankr Skills Catalog — PR Submission

Paket ini siap di-copy ke fork [BankrBot/skills](https://github.com/BankrBot/skills).

## Isi folder

```
phylax-skill-audit/
├── SKILL.md              # Definisi skill (required)
├── catalog.json          # schemaVersion 1 (required)
├── logo.svg              # Brand mark
└── references/
    └── api-reference.md  # Dokumentasi API hosted
```

## Langkah submit PR

```bash
# 1. Fork https://github.com/BankrBot/skills di GitHub (lewat UI)

# 2. Clone fork kamu
git clone https://github.com/<username>/skills.git
cd skills

# 3. Copy paket submit
cp -r /path/to/phylax-skill-audit/bankr-submission/phylax-skill-audit ./

# 4. Branch + commit
git checkout -b add-phylax-skill-audit
git add phylax-skill-audit/
git commit -m "Add phylax-skill-audit — pre-install security verdicts for agent skills"

# 5. Push + buka PR ke BankrBot/skills main
git push -u origin add-phylax-skill-audit
gh pr create --repo BankrBot/skills --title "Add phylax-skill-audit" --body "$(cat <<'EOF'
## Summary

Adds **phylax-skill-audit** — pre-install security audit for agent skills on Base.

- Deterministic `ALLOW` / `WARN` / `DENY` verdict with evidence
- Scans SKILL.md for prompt-injection, secret exfiltration, manifest issues
- Contract risk checks + x402 endpoint validation
- Hosted API at https://usephylax.com/api/audit (SSRF-hardened)
- Open source: https://github.com/usephylax/phylax-skill-audit (MIT, npm v0.2.2)
- Also native in Aeon: `./add-skill aaronjmars/aeon phylax-audit`

## Test plan

- [x] `catalog.json` slug matches folder name (`phylax-skill-audit`)
- [x] `SKILL.md` has `name` + `description` frontmatter
- [x] CLI tested: `npx phylax@0.2.2 --skill ./SKILL.md` on clean + malicious fixtures
- [x] Hosted API: `POST https://usephylax.com/api/audit` returns valid JSON verdict
- [x] Read-only — no signing, no key requests

EOF
)"
```

## Setelah merge

User bisa install lewat Bankr:

```
install the phylax-skill-audit skill from https://github.com/BankrBot/skills/tree/main/phylax-skill-audit
```

Skill muncul di Discover catalog setelah `catalog.json` valid dan PR di-merge.
