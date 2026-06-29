# Phylax v0.2 — Deep Mode tweet (attach assets/phylax-deepmode.mp4)

## Main tweet
```
Phylax v0.2 is live 🛡️

New: deep-mode honeypot simulation.

A honeypot lets you buy — then blocks the sell. Phylax now catches that *before* you install a skill: it simulates the sell on-chain and flags a DENY if it reverts.

No funds moved. Nothing broadcast. 🎥👇
```

## Reply 1 — how it works
```
How deep mode works:

1. sample a real holder from on-chain Transfer logs
2. simulate selling their balance via eth_call (no funds, no broadcast)
3. if the sell reverts or returns false → sells are blocked → honeypot

one deterministic CON-020 verdict, with evidence.
```

## Reply 2 — try it
```
live everywhere:

npx phylax --skill ./SKILL.md --mode deep
npm i phylax-skill-audit
POST usephylax.com/api/audit  (mode: "deep")

open source · native skill in @aeonframework
github.com/usephylax/phylax-skill-audit
```

Notes:
- Attach assets/phylax-deepmode.mp4 (1280x720, 60fps, ~19s) to the MAIN tweet.
- Product-first; do NOT put the token in this tweet.
- Pin or thread under your build-log.
```
