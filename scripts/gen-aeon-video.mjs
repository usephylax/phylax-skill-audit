// gen-aeon-video.mjs — macOS-style terminal demo framed around the Aeon use case:
// "you're about to ./add-skill into Aeon — run Phylax first." Two audits: a malicious
// skill (DENY) then a clean one (ALLOW). 60fps, slow, captioned. Brand-synced.

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FRAMES = resolve(ROOT, ".aeon-frames");
const OUT = resolve(ROOT, "assets", "phylax-aeon-demo.mp4");

const W = 1280, H = 720, FPS = 60;
const C = {
  text: "#E6E7EB", sub: "#9aa0ae", muted: "#5a6072",
  accent: "#3B82F6", scan: "#48D8FF",
  green: "#3ddc97", red: "#ff6b6b", yellow: "#f5c451", purple: "#b98cff",
  termTop: "#2b2f3a", termBody: "#0f1118", termBorder: "#3a3f4d",
};
const MONO = "DejaVu Sans Mono, monospace";
const SANS = "DejaVu Sans, sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const easeInOut = (t) => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;

function bg() {
  return `<defs>
    <linearGradient id="wall" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0a0f1c"/><stop offset="0.5" stop-color="#0c1322"/><stop offset="1" stop-color="#070a12"/>
    </linearGradient>
    <radialGradient id="halo" cx="${W*0.7}" cy="${H*0.25}" r="520" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1b3a66" stop-opacity="0.55"/><stop offset="1" stop-color="#1b3a66" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="24" stdDeviation="34" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/><rect width="${W}" height="${H}" fill="url(#halo)"/>`;
}
function shieldLogo(x, y, s, glow = false) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${glow ? `<circle cx="16" cy="15" r="15" fill="${C.scan}" opacity="0.18"/>` : ""}
    <path d="M16 2 L28 6 V15 C28 23 22.5 27.5 16 30 C9.5 27.5 4 23 4 15 V6 Z" fill="#0E0E14" stroke="${C.scan}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="16" cy="14.5" r="5" fill="none" stroke="${C.accent}" stroke-width="1.8"/>
    <circle cx="16" cy="14.5" r="1.6" fill="${C.scan}"/>
    <line x1="16" y1="7" x2="16" y2="9.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="16" y1="19.5" x2="16" y2="22" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="8.5" y1="14.5" x2="11" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="21" y1="14.5" x2="23.5" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
  </g>`;
}

const TX = 150, TY = 96, TW = 980, TH = 470;
const PADX = 30, BODY_TOP = TY + 46 + 24, LH = 27;

function macWindow(innerSVG, opts = {}) {
  const { title = "aeon — zsh — 80×24", caption = null, captionColor = C.scan } = opts;
  const cap = caption ? `<g transform="translate(${TX} ${TY + TH + 34})">
      <circle cx="10" cy="-4" r="5" fill="${captionColor}"/>
      <text x="26" y="0" font-family="${SANS}" font-size="19" fill="${C.text}">${esc(caption)}</text></g>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${bg()}
  ${shieldLogo(40, 28, 1.3)}
  <text x="84" y="52" font-family="${MONO}" font-size="20" font-weight="bold" fill="${C.text}">phylax</text>
  <text x="${W-40}" y="52" text-anchor="end" font-family="${SANS}" font-size="16" fill="${C.sub}">for @aeonframework</text>
  <g filter="url(#shadow)">
    <rect x="${TX}" y="${TY}" width="${TW}" height="${TH}" rx="14" fill="${C.termBody}" stroke="${C.termBorder}" stroke-width="1"/>
    <path d="M${TX} ${TY+14} a14 14 0 0 1 14 -14 h${TW-28} a14 14 0 0 1 14 14 v32 h-${TW} z" fill="${C.termTop}"/>
    <circle cx="${TX+22}" cy="${TY+23}" r="7" fill="#ff5f57"/><circle cx="${TX+44}" cy="${TY+23}" r="7" fill="#febc2e"/><circle cx="${TX+66}" cy="${TY+23}" r="7" fill="#28c840"/>
    <text x="${TX+TW/2}" y="${TY+28}" text-anchor="middle" font-family="${SANS}" font-size="14" fill="${C.sub}">${esc(title)}</text>
  </g>
  ${innerSVG}${cap}
</svg>`;
}
function termBody(lines, opts = {}) {
  const { cursorRow = null, cursorCol = 0, badge = null } = opts;
  let out = "";
  lines.forEach((ln, i) => {
    const y = BODY_TOP + i * LH;
    out += `<text x="${TX+PADX}" y="${y}" font-family="${MONO}" font-size="17" fill="${ln.color||C.text}" xml:space="preserve">${esc(ln.t)}</text>`;
  });
  if (cursorRow !== null) {
    const y = BODY_TOP + cursorRow * LH, x = TX + PADX + cursorCol * 10.2;
    out += `<rect x="${x+1}" y="${y-14}" width="9" height="18" fill="${C.scan}" opacity="0.85"/>`;
  }
  if (badge) {
    const bc = badge.kind === "DENY" ? C.red : badge.kind === "WARN" ? C.yellow : C.green;
    const y = BODY_TOP + badge.row * LH;
    out += `<g transform="translate(${TX+PADX} ${y})"><rect x="-6" y="-19" width="160" height="28" rx="6" fill="${bc}22" stroke="${bc}66"/>
      <text x="6" y="1" font-family="${MONO}" font-size="17" font-weight="bold" fill="${bc}">${badge.kind}  score ${badge.score}</text></g>`;
  }
  return out;
}
function card(opts) {
  const { title, sub, lines = [], badge = null, glow = true } = opts;
  let body = "";
  lines.forEach((ln, i) => {
    body += `<text x="${W/2}" y="${452 + i*42}" text-anchor="middle" font-family="${MONO}" font-size="21" fill="${ln.color||C.sub}">${esc(ln.t)}</text>`;
  });
  let badgeEl = "";
  if (badge) {
    const bc = badge.kind === "DENY" ? C.red : C.green;
    badgeEl = `<g transform="translate(${W/2} 340)"><rect x="-135" y="-37" width="270" height="66" rx="12" fill="${bc}22" stroke="${bc}77" stroke-width="2"/>
      <text x="0" y="11" text-anchor="middle" font-family="${MONO}" font-size="38" font-weight="bold" fill="${bc}">${badge.kind} · ${badge.score}</text></g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${bg()}${shieldLogo(W/2 - 64, 108, 4.0, glow)}
  <text x="${W/2}" y="288" text-anchor="middle" font-family="${MONO}" font-size="54" font-weight="bold" fill="${C.text}">${esc(title)}</text>
  ${sub ? `<text x="${W/2}" y="330" text-anchor="middle" font-family="${SANS}" font-size="22" fill="${C.sub}">${esc(sub)}</text>` : ""}
  ${badgeEl}${body}</svg>`;
}

// ====== STORYBOARD ======
const frames = [];
const hold = (svg, n) => { for (let i = 0; i < n; i++) frames.push(svg); };
function typeCmd(promptText, baseLines, caption) {
  // show base lines + typing prompt on the next row
  for (let i = 1; i <= promptText.length; i++) {
    const lines = [...baseLines, { t: promptText.slice(0, i) }];
    const svg = macWindow(termBody(lines, { cursorRow: baseLines.length, cursorCol: promptText.length>0?promptText.slice(0,i).length:0 }), { caption });
    frames.push(svg); frames.push(svg);
  }
}

// 1) INTRO — the hook (fade in)
for (let i = 0; i < 36; i++) {
  const o = easeInOut(Math.min(1, i/28));
  frames.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bg()}
    <g opacity="${o.toFixed(3)}">${shieldLogo(W/2-64,96,4.0,true)}
    <text x="${W/2}" y="276" text-anchor="middle" font-family="${MONO}" font-size="50" font-weight="bold" fill="${C.text}">phylax</text>
    <text x="${W/2}" y="320" text-anchor="middle" font-family="${SANS}" font-size="22" fill="${C.sub}">audit an Aeon skill before you install it</text></g></svg>`);
}
hold(card({ title: "phylax", sub: "audit an Aeon skill before you install it" }), 60);

// 2) the risky install — about to add a skill to Aeon
const C1 = "About to add a skill to your Aeon agent. It'll run with your keys.";
hold(macWindow(termBody([{ t: "" }], { cursorRow: 0 }), { caption: C1 }), 40);
typeCmd("$ ./add-skill some-dev/aeon swap-helper", [], C1);
hold(macWindow(termBody([{ t: "$ ./add-skill some-dev/aeon swap-helper" }, { t: "  ⚠ runs unattended, with wallet access", color: C.yellow }]), { caption: C1 }), 60);

// 3) run phylax first
const C2 = "Run Phylax first. Three scanners, one deterministic verdict.";
const base2 = [
  { t: "$ ./add-skill some-dev/aeon swap-helper", color: C.muted },
  { t: "  ⚠ paused — auditing first", color: C.muted },
  { t: "" },
];
typeCmd("$ npx phylax --skill some-dev/aeon/swap-helper --mode deep", base2, C2);

const scan = [
  { t: "▸ [1/3] static   — SKILL.md: injection · secret-exfil", color: C.scan },
  { t: "▸ [2/3] onchain  — Base 8453: honeypot · mint · proxy", color: C.scan },
  { t: "▸ [3/3] endpoint — x402: HTTPS · 402 schema · price", color: C.scan },
];
const acc = [...base2, { t: "$ npx phylax --skill some-dev/aeon/swap-helper --mode deep" }, { t: "" }];
hold(macWindow(termBody([...acc]), { caption: C2 }), 18);
for (const s of scan) { acc.push(s); hold(macWindow(termBody([...acc]), { caption: C2 }), 30); }

// 4) verdict DENY
const C3 = "Hidden mint and a 35% sell tax. Phylax says DENY.";
acc.push({ t: "" });
const vRow = acc.length; acc.push({ t: "" });
acc.push({ t: "  ✗ CON-020 critical  sell_tax = 35%        SKILL.md:23", color: C.red });
hold(macWindow(termBody([...acc], { badge: { kind: "DENY", score: 27, row: vRow } }), { caption: C3, captionColor: C.red }), 34);
acc.push({ t: "  ✗ CON-012 high      owner mint()/pause()   SKILL.md:20", color: C.yellow });
hold(macWindow(termBody([...acc], { badge: { kind: "DENY", score: 27, row: vRow } }), { caption: C3, captionColor: C.red }), 34);
acc.push({ t: "→ install blocked. your wallet stays safe.", color: C.text });
hold(macWindow(termBody([...acc], { badge: { kind: "DENY", score: 27, row: vRow } }), { caption: C3, captionColor: C.red }), 80);

// 5) a clean skill — ALLOW (show it's not just a fear tool)
const C4 = "A clean skill passes — ALLOW. Then you install with confidence.";
const base5 = [{ t: "$ npx phylax --skill aaronjmars/aeon/article", color: C.text }, { t: "" }];
hold(macWindow(termBody([...base5]), { caption: C4, captionColor: C.green }), 24);
const acc5 = [...base5,
  { t: "▸ static · onchain · endpoint — all clear", color: C.scan },
  { t: "" }, { t: "" },
  { t: "→ no critical or high findings. safe to add.", color: C.text },
];
hold(macWindow(termBody(acc5, { badge: { kind: "ALLOW", score: 97, row: 3 } }), { caption: C4, captionColor: C.green }), 90);

// 6) OUTRO
hold(card({
  title: "phylax",
  sub: "native onchain-security skill in Aeon",
  lines: [
    { t: "./add-skill aaronjmars/aeon phylax-audit", color: C.accent },
    { t: "usephylax.com", color: C.scan },
  ],
}), 140);

// ====== RENDER ======
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });
console.log(`Rendering ${frames.length} frames @ ${FPS}fps (~${(frames.length/FPS).toFixed(1)}s)...`);
frames.forEach((svg, i) => {
  const n = String(i).padStart(5, "0");
  const sp = resolve(FRAMES, `f${n}.svg`), pp = resolve(FRAMES, `f${n}.png`);
  writeFileSync(sp, svg);
  execFileSync("rsvg-convert", ["-w", String(W), "-h", String(H), sp, "-o", pp]);
});
console.log("Encoding...");
execFileSync("ffmpeg", ["-y", "-framerate", String(FPS), "-i", resolve(FRAMES, "f%05d.png"),
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT],
  { stdio: "ignore" });
rmSync(FRAMES, { recursive: true, force: true });
console.log("Done →", OUT);
