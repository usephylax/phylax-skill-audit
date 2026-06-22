// gen-demo-video.mjs — Render a polished macOS-style terminal demo MP4 for Phylax.
// Pipeline: SVG frames -> PNG (rsvg-convert) -> MP4 (ffmpeg). 60fps, eased, slow-paced,
// with explainer captions. Brand-synced with usephylax.com.

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FRAMES = resolve(ROOT, ".demo-frames");
const OUT = resolve(ROOT, "assets", "phylax-demo.mp4");

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

// ---- desktop background (subtle macOS-like gradient wallpaper) ----
function bg() {
  return `
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0a0f1c"/>
      <stop offset="0.5" stop-color="#0c1322"/>
      <stop offset="1" stop-color="#070a12"/>
    </linearGradient>
    <radialGradient id="halo" cx="${W*0.7}" cy="${H*0.25}" r="520" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1b3a66" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#1b3a66" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="24" stdDeviation="34" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>`;
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

// ---- macOS terminal window ----
const TX = 150, TY = 96, TW = 980, TH = 470;     // window rect
const PADX = 30, BODY_TOP = TY + 46 + 24, LH = 27;

function macWindow(innerSVG, opts = {}) {
  const { title = "phylax — zsh — 80×24", caption = null, captionColor = C.scan } = opts;
  let cap = "";
  if (caption) {
    cap = `<g transform="translate(${TX} ${TY + TH + 34})">
      <circle cx="10" cy="-4" r="5" fill="${captionColor}"/>
      <text x="26" y="0" font-family="${SANS}" font-size="19" fill="${C.text}">${esc(caption)}</text>
    </g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${bg()}
  <!-- top brand strip -->
  ${shieldLogo(40, 28, 1.3)}
  <text x="84" y="52" font-family="${MONO}" font-size="20" font-weight="bold" fill="${C.text}">phylax</text>

  <!-- window -->
  <g filter="url(#shadow)">
    <rect x="${TX}" y="${TY}" width="${TW}" height="${TH}" rx="14" fill="${C.termBody}" stroke="${C.termBorder}" stroke-width="1"/>
    <path d="M${TX} ${TY+14} a14 14 0 0 1 14 -14 h${TW-28} a14 14 0 0 1 14 14 v32 h-${TW} z" fill="${C.termTop}"/>
    <circle cx="${TX+22}" cy="${TY+23}" r="7" fill="#ff5f57"/>
    <circle cx="${TX+44}" cy="${TY+23}" r="7" fill="#febc2e"/>
    <circle cx="${TX+66}" cy="${TY+23}" r="7" fill="#28c840"/>
    <text x="${TX+TW/2}" y="${TY+28}" text-anchor="middle" font-family="${SANS}" font-size="14" fill="${C.sub}">${esc(title)}</text>
  </g>
  ${innerSVG}
  ${cap}
</svg>`;
}

// render terminal text lines + optional cursor + optional verdict badge
function termBody(lines, opts = {}) {
  const { cursorRow = null, cursorCol = 0, badge = null } = opts;
  let out = "";
  lines.forEach((ln, i) => {
    const y = BODY_TOP + i * LH;
    out += `<text x="${TX+PADX}" y="${y}" font-family="${MONO}" font-size="17" fill="${ln.color||C.text}" xml:space="preserve">${esc(ln.t)}</text>`;
  });
  if (cursorRow !== null) {
    const y = BODY_TOP + cursorRow * LH;
    const x = TX + PADX + cursorCol * 10.2;
    out += `<rect x="${x+1}" y="${y-14}" width="9" height="18" fill="${C.scan}" opacity="0.85"/>`;
  }
  if (badge) {
    const bc = badge.kind === "DENY" ? C.red : badge.kind === "WARN" ? C.yellow : C.green;
    const y = BODY_TOP + badge.row * LH;
    out += `<g transform="translate(${TX+PADX} ${y})">
      <rect x="-6" y="-19" width="150" height="28" rx="6" fill="${bc}22" stroke="${bc}66"/>
      <text x="6" y="1" font-family="${MONO}" font-size="17" font-weight="bold" fill="${bc}">${badge.kind}  score ${badge.score}</text>
    </g>`;
  }
  return out;
}

// ---- full-screen brand card (intro / outro) ----
function card(opts) {
  const { title, sub, lines = [], badge = null, glow = true } = opts;
  let body = "";
  lines.forEach((ln, i) => {
    body += `<text x="${W/2}" y="${452 + i*42}" text-anchor="middle" font-family="${MONO}" font-size="21" fill="${ln.color||C.sub}">${esc(ln.t)}</text>`;
  });
  let badgeEl = "";
  if (badge) {
    const bc = badge.kind === "DENY" ? C.red : C.green;
    badgeEl = `<g transform="translate(${W/2} 340)">
      <rect x="-135" y="-37" width="270" height="66" rx="12" fill="${bc}22" stroke="${bc}77" stroke-width="2"/>
      <text x="0" y="11" text-anchor="middle" font-family="${MONO}" font-size="38" font-weight="bold" fill="${bc}">${badge.kind} · ${badge.score}</text>
    </g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${bg()}
  ${shieldLogo(W/2 - 64, 108, 4.0, glow)}
  <text x="${W/2}" y="288" text-anchor="middle" font-family="${MONO}" font-size="58" font-weight="bold" fill="${C.text}">${esc(title)}</text>
  ${sub ? `<text x="${W/2}" y="332" text-anchor="middle" font-family="${SANS}" font-size="23" fill="${C.sub}">${esc(sub)}</text>` : ""}
  ${badgeEl}
  ${body}
</svg>`;
}

// ====== STORYBOARD ======
const prompt = "$ npx phylax --skill ./swap-helper/SKILL.md --mode deep";
const scan = [
  { t: "▸ Loading 30+ rules from /rules/*.yaml", color: C.scan },
  { t: "▸ [1/3] Static scan   — reading SKILL.md line by line", color: C.scan },
  { t: "      prompt-injection · secret-exfil · obfuscation", color: C.muted },
  { t: "▸ [2/3] Onchain scan  — Base 8453 via eth_getCode", color: C.scan },
  { t: "      bytecode selectors · proxy · honeypot powers", color: C.muted },
  { t: "▸ [3/3] Endpoint scan — probing x402 endpoints", color: C.scan },
  { t: "      HTTPS · 402 schema · price sanity", color: C.muted },
];
const findings = [
  { t: "  ✗ CON-020  critical   \"sell_tax = 35%\"            SKILL.md:23", color: C.red },
  { t: "  ✗ CON-012  high       owner mint() / pause()      SKILL.md:20", color: C.yellow },
  { t: "  ! CON-030  medium     contract has no bytecode    onchain", color: C.sub },
];

const frames = [];
const hold = (svg, n) => { for (let i = 0; i < n; i++) frames.push(svg); };

// caption helper
const W1 = "How it works: one command audits a skill before you install it.";
const W2 = "It runs three independent scanners and merges the findings.";
const W3 = "Each finding subtracts a weight from 100 → a deterministic verdict.";
const W4 = "Critical issues found. Phylax says DENY — don't install.";

// 1) INTRO (3.0s) with gentle fade-in via opacity ramp
for (let i = 0; i < 40; i++) {
  const o = easeInOut(Math.min(1, i / 30));
  frames.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bg()}
    <g opacity="${o.toFixed(3)}">${shieldLogo(W/2-64,108,4.0,true)}
    <text x="${W/2}" y="288" text-anchor="middle" font-family="${MONO}" font-size="58" font-weight="bold" fill="${C.text}">phylax</text>
    <text x="${W/2}" y="332" text-anchor="middle" font-family="${SANS}" font-size="23" fill="${C.sub}">Pre-install risk verdicts for agent skills</text></g></svg>`);
}
hold(card({ title: "phylax", sub: "Pre-install risk verdicts for agent skills" }), 70);

// 2) prompt appears, then TYPE the command slowly (~3 chars per 2 frames)
hold(macWindow(termBody([{ t: "" }], { cursorRow: 0, cursorCol: 0 }), { caption: W1 }), 45);
for (let i = 1; i <= prompt.length; i++) {
  const svg = macWindow(termBody([{ t: prompt.slice(0, i) }], { cursorRow: 0, cursorCol: i }), { caption: W1 });
  frames.push(svg); frames.push(svg); // 2 frames per char => slow, readable
}
// blink cursor after typing (~1.2s)
for (let b = 0; b < 36; b++) {
  const on = Math.floor(b / 9) % 2 === 0;
  hold(macWindow(termBody([{ t: prompt }], on ? { cursorRow: 0, cursorCol: prompt.length } : {}), { caption: W1 }), 1);
}

// 3) scan lines reveal one-by-one, slowly
const acc = [{ t: prompt }, { t: "" }];
hold(macWindow(termBody([...acc]), { caption: W2 }), 20);
for (const s of scan) {
  acc.push(s);
  hold(macWindow(termBody([...acc]), { caption: W2 }), 26); // ~0.43s each
}
hold(macWindow(termBody([...acc]), { caption: W2 }), 30);

// 4) verdict header + findings reveal
acc.push({ t: "" });
acc.push({ t: "── verdict ─────────────────────────────────", color: C.muted });
const vRow = acc.length;
acc.push({ t: "" });
hold(macWindow(termBody([...acc], { badge: { kind: "DENY", score: 27, row: vRow } }), { caption: W3, captionColor: C.yellow }), 36);
for (const f of findings) {
  acc.push(f);
  hold(macWindow(termBody([...acc], { badge: { kind: "DENY", score: 27, row: vRow } }), { caption: W3, captionColor: C.yellow }), 30);
}
acc.push({ t: "" });
acc.push({ t: "→ score 100 − (40+20+10) = 27   →  DENY", color: C.text });
hold(macWindow(termBody([...acc], { badge: { kind: "DENY", score: 27, row: vRow } }), { caption: W4, captionColor: C.red }), 90);

// 5) OUTRO (4s)
hold(card({
  title: "phylax",
  badge: { kind: "DENY", score: 27 },
  lines: [
    { t: "npm i phylax-skill-audit", color: C.text },
    { t: "POST usephylax.com/api/audit", color: C.scan },
    { t: "./add-skill aaronjmars/aeon phylax-audit", color: C.accent },
  ],
}), 150);

// ====== RENDER ======
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });
console.log(`Rendering ${frames.length} frames @ ${FPS}fps (~${(frames.length/FPS).toFixed(1)}s)...`);
frames.forEach((svg, i) => {
  const n = String(i).padStart(5, "0");
  const sp = resolve(FRAMES, `f${n}.svg`);
  const pp = resolve(FRAMES, `f${n}.png`);
  writeFileSync(sp, svg);
  execFileSync("rsvg-convert", ["-w", String(W), "-h", String(H), sp, "-o", pp]);
});
console.log("Encoding MP4...");
execFileSync("ffmpeg", [
  "-y", "-framerate", String(FPS), "-i", resolve(FRAMES, "f%05d.png"),
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
  "-movflags", "+faststart", OUT,
], { stdio: "inherit" });
rmSync(FRAMES, { recursive: true, force: true });
console.log("Done →", OUT);
