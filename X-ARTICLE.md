══════════════════════════════════════════════════════════════
  PETUNJUK FORMAT (jangan ikut di-copy ke X):
  • [BANNER]  → upload assets/x-article-banner.png sebagai header artikel
  • [VIDEO]   → sisipkan assets/phylax-demo.mp4 di titik ini
  • **teks**  → di editor X, blok teksnya lalu klik Bold
  • # / ##    → pakai tombol Heading / Subheading di toolbar X
  • Enter tunggal antar paragraf — sudah dirapikan, jangan tambah jarak
══════════════════════════════════════════════════════════════


JUDUL ARTIKEL (taruh di field Title):

Phylax: audit agent skills before they drain your wallet


─────────────────────────────────────────────
[BANNER → assets/x-article-banner.png]
─────────────────────────────────────────────


Installing an agent skill is like running a stranger's code with your wallet attached. One `SKILL.md` can hide a transfer instruction, ask for your seed phrase, or point your agent at a honeypot contract.

So I built **Phylax** — a pre-install security audit that gives you a verdict *before* a skill ever runs.


## The problem

Agent frameworks let you pull in skills with one command. That skill then runs unattended, with your keys, sometimes with a wallet.

There's no seatbelt. You either read every line yourself, or you trust the author. At scale, neither works.


## What Phylax does

Phylax reads a skill and returns one deterministic verdict — **ALLOW**, **WARN**, or **DENY** — with line-level evidence for every finding.

It runs **three independent scanners**:

**Static scan** — reads the SKILL.md for prompt-injection, secret-exfiltration, and obfuscation. Things like "ignore all previous instructions" or "send your private key".

**Onchain scan** — pulls bytecode for any Base contract the skill references and checks for honeypot powers, hidden mint/pause, and proxy upgradeability.

**Endpoint scan** — probes declared x402 endpoints for HTTPS, valid 402 schema, and price sanity.


## See it run

The clip below audits a honeypot skill. Phylax flags the hidden `mint()` and the 35% sell tax, does the math, and returns **DENY**.

─────────────────────────────────────────────
[VIDEO → assets/phylax-demo.mp4]
─────────────────────────────────────────────


## How the score works

It's not a vibe. The score is math:

`score = 100 − Σ(severity weights)`

Critical −40, High −20, Medium −10, Low −3. Any critical finding, or a score under 50, means **DENY**. Same input always gives the same verdict.


## Use it — four ways, all live

**npm:** `npm install phylax-skill-audit`

**CLI:** `npx phylax --skill ./SKILL.md`

**HTTP API:** `POST usephylax.com/api/audit`

**Aeon:** `./add-skill aaronjmars/aeon phylax-audit`

That last one is real — Phylax was just **merged into @aeonframework** as a native onchain-security skill. Huge thanks to @aaronjmars for the review.


## What's next

Phylax is open source (MIT) and live today. A few things are still in progress, and I'd rather say so:

The deep-mode honeypot **simulation** is stubbed for now — bytecode heuristics run, but the full buy/sell simulation is coming. And **there is no token** — paid x402 scans are planned, but the hosted API is free right now. No token, no presale, nothing to buy. If you see one claiming to be Phylax, it isn't me.


## Links

Code + docs: github.com/usephylax/phylax-skill-audit

Site: usephylax.com

Don't install blind. 🛡️
