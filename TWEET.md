# Phylax — Launch Tweet Thread

---

**1/6**

Installing an agent skill is like running a stranger's code with your wallet attached.

One `SKILL.md` can hide a transfer, ask for your seed phrase, or point your agent at a honeypot.

So I built **Phylax** 🛡️

---

**2/6**

Phylax is a pre-install security audit for agent skills on Base.

You feed it a skill → it returns one of three verdicts: **ALLOW**, **WARN**, or **DENY**. With line-level evidence. No AI vibes, pure deterministic math.

---

**3/6**

Three scanners, one pipeline:

🔍 **Static** — reads SKILL.md for prompt injection & secret exfiltration
⛓️ **Onchain** — pulls Base contract bytecode, checks for honeypots & hidden mint
🌐 **Endpoint** — probes x402 payment endpoints for HTTPS & schema validity

---

**4/6**

The score is math, not opinion:

```
score = 100 − Σ(severity weights)
```

Critical −40, High −20, Medium −10, Low −3.
Any critical finding → DENY. Same input, same verdict. Always.

---

**5/6**

Four ways, all live:

```
npm install phylax-skill-audit
npx phylax --skill ./SKILL.md
curl -X POST usephylax.com/api/audit
./add-skill aaronjmars/aeon phylax-audit
```

---

**6/6**

Just got merged into **@aeonframework** as a native onchain-security skill. Huge thanks to @aaronjmars for the review.

Open source (MIT). No token, no presale, nothing to buy.

Don't install blind. 🛡️

usephylax.com
github.com/usephylax/phylax-skill-audit