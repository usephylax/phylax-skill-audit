// gen-demo-video.mjs — Programmatically render a Phylax demo MP4.
// Pipeline: build SVG frames (Phylax terminal theme) -> PNG (rsvg-convert) -> MP4 (ffmpeg).
// No screen recording. Deterministic, brand-synced with usephylax.com.

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FRAMES = resolve(ROOT, ".demo-frames");
const OUT = resolve(ROOT, "phylax-demo.mp4");

const W = 1280, H = 720, FPS = 30;

// Brand palette (matches site theme)
const C = {
  bg: "#08080C", card: "#0E0E14", border: "#1E1E26",
  accent: "#3B82F6", scan: "#48D8FF",
  text: "#E8E8EC", sub: "#8888A0", muted: "#4A4A5A",
  green: "#34D399", red: "#F87171", yellow: "#FACC15",
};
const MONO = "DejaVu Sans Mono, monospace";
const SANS = "DejaVu Sans, sans-serif";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Shield logo markup at (x,y) scale s
function logo(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M16 2 L28 6 V15 C28 23 22.5 27.5 16 30 C9.5 27.5 4 23 4 15 V6 Z" fill="${C.card}" stroke="${C.scan}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="16" cy="14.5" r="5" fill="none" stroke="${C.accent}" stroke-width="1.8"/>
    <circle cx="16" cy="14.5" r="1.6" fill="${C.scan}"/>
    <line x1="16" y1="7" x2="16" y2="9.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="16" y1="19.5" x2="16" y2="22" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="8.5" y1="14.5" x2="11" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="21" y1="14.5" x2="23.5" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
  </g>`;
}

function frameSVG(bodyLines, opts = {}) {
  const { showCursor = false, cursorRow = 0, badge = null } = opts;
  const termX = 140, termY = 150, termW = 1000, termH = 430;
  const lineH = 26, padX = 28, padY = 56;

  let lines = "";
  bodyLines.forEach((ln, i) => {
    const y = termY + padY + i * lineH;
    const color = ln.color || C.text;
    lines += `<text x="${termX + padX}" y="${y}" font-family="${MONO}" font-size="16" fill="${color}" xml:space="preserve">${esc(ln.t)}</text>`;
    if (showCursor && i === cursorRow) {
      const cx = termX + padX + esc(ln.t).length * 0; // approx; cursor drawn at end via tspan width
    }
  });

  // blinking cursor block at end of cursorRow
  let cursor = "";
  if (showCursor) {
    const y = termY + padY + cursorRow * lineH;
    const approxX = termX + padX + (bodyLines[cursorRow]?.t.length || 0) * 9.6;
    cursor = `<rect x="${approxX + 2}" y="${y - 13}" width="9" height="17" fill="${C.accent}" opacity="0.8"/>`;
  }

  let badgeEl = "";
  if (badge) {
    const bc = badge.kind === "DENY" ? C.red : badge.kind === "WARN" ? C.yellow : C.green;
    badgeEl = `<g transform="translate(${termX + padX} ${termY + padY + (badge.row) * lineH})">
      <rect x="-4" y="-18" width="${110}" height="26" rx="5" fill="${bc}22" stroke="${bc}55"/>
      <text x="6" y="0" font-family="${MONO}" font-size="16" font-weight="bold" fill="${bc}">${badge.kind} ${badge.score}</text>
    </g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <g stroke="${C.border}" stroke-width="1" opacity="0.4">
    ${[180,360,540].map(y=>`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`).join("")}
  </g>
  ${logo(70, 54, 2.2)}
  <text x="150" y="92" font-family="${MONO}" font-size="34" font-weight="bold" fill="${C.text}">phylax</text>
  <text x="152" y="118" font-family="${SANS}" font-size="15" fill="${C.sub}">Pre-install risk verdicts for agent skills</text>

  <rect x="${termX}" y="${termY}" width="${termW}" height="${termH}" rx="10" fill="${C.card}" stroke="${C.border}" stroke-width="1.5"/>
  <g transform="translate(${termX+18} ${termY+22})">
    <circle cx="0" cy="0" r="5" fill="#4A4A5A"/><circle cx="16" cy="0" r="5" fill="#4A4A5A"/><circle cx="32" cy="0" r="5" fill="#4A4A5A"/>
    <text x="60" y="5" font-family="${MONO}" font-size="13" fill="${C.muted}">phylax audit</text>
  </g>
  <line x1="${termX}" y1="${termY+38}" x2="${termX+termW}" y2="${termY+38}" stroke="${C.border}"/>
  ${lines}
  ${cursor}
  ${badgeEl}
  <text x="${termX}" y="640" font-family="${MONO}" font-size="15" fill="${C.muted}">usephylax.com  ·  npm i phylax-skill-audit  ·  native skill in Aeon</text>
</svg>`;
}

// ---- Storyboard ----
const prompt = "$ npx phylax --skill ./honeypot-SKILL.md";
const scanLines = [
  { t: "▸ Loading rules from /rules/*.yaml", color: C.scan },
  { t: "▸ Static scan  ........ prompt-injection, secret-exfil", color: C.scan },
  { t: "▸ Onchain scan ........ Base 8453 bytecode + selectors", color: C.scan },
  { t: "▸ Endpoint scan ....... x402 schema + price sanity", color: C.scan },
];
const findings = [
  { t: "  CON-020  critical   sell_tax = 35%   (SKILL.md:23)", color: C.red },
  { t: "  CON-012  high       owner mint()/pause()  (SKILL.md:20)", color: C.yellow },
  { t: "  CON-030  medium     contract has no bytecode", color: C.sub },
];

// ---- Intro / Outro cards ----
function cardSVG(opts) {
  const { title, sub, lines = [], badge = null } = opts;
  let body = "";
  lines.forEach((ln, i) => {
    body += `<text x="${W/2}" y="${430 + i*40}" text-anchor="middle" font-family="${MONO}" font-size="20" fill="${ln.color||C.sub}">${esc(ln.t)}</text>`;
  });
  let badgeEl = "";
  if (badge) {
    const bc = badge.kind === "DENY" ? C.red : C.green;
    badgeEl = `<g transform="translate(${W/2} 320)">
      <rect x="-130" y="-36" width="260" height="64" rx="10" fill="${bc}22" stroke="${bc}66" stroke-width="2"/>
      <text x="0" y="10" text-anchor="middle" font-family="${MONO}" font-size="36" font-weight="bold" fill="${bc}">${badge.kind} · ${badge.score}</text>
    </g>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <radialGradient id="g" cx="${W/2}" cy="300" r="430" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#13233f"/><stop offset="1" stop-color="${C.bg}"/>
  </radialGradient>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  ${logo(W/2 - 60, 105, 3.7)}
  <text x="${W/2}" y="275" text-anchor="middle" font-family="${MONO}" font-size="54" font-weight="bold" fill="${C.text}">${esc(title)}</text>
  ${sub ? `<text x="${W/2}" y="318" text-anchor="middle" font-family="${SANS}" font-size="22" fill="${C.sub}">${esc(sub)}</text>` : ""}
  ${badgeEl}
  ${body}
</svg>`;
}

const frames = [];
const hold = (svg, n) => { for (let i=0;i<n;i++) frames.push(svg); };

// INTRO (~2.3s)
hold(cardSVG({ title: "phylax", sub: "Pre-install risk verdicts for agent skills" }), 70);

// 1) type the command (char by char)
for (let i = 1; i <= prompt.length; i++) {
  frames.push(frameSVG([{ t: prompt.slice(0, i) }], { showCursor: true, cursorRow: 0 }));
}
hold(frameSVG([{ t: prompt }], { showCursor: true, cursorRow: 0 }), 18);

// 2) scan lines appear one by one
const acc = [{ t: prompt }];
for (const s of scanLines) {
  acc.push(s);
  hold(frameSVG([...acc]), 14);
}
hold(frameSVG([...acc]), 10);

// 3) divider + verdict header + findings reveal
acc.push({ t: "" });
acc.push({ t: "VERDICT", color: C.muted });
const verdictRowIndex = acc.length - 1;
hold(frameSVG([...acc], { badge: { kind: "DENY", score: 27, row: verdictRowIndex } }), 16);
for (const f of findings) {
  acc.push(f);
  hold(frameSVG([...acc], { badge: { kind: "DENY", score: 27, row: verdictRowIndex } }), 12);
}
acc.push({ t: "" });
acc.push({ t: "→ Critical issues found. Do not install.", color: C.text });
hold(frameSVG([...acc], { badge: { kind: "DENY", score: 27, row: verdictRowIndex } }), 75);

// OUTRO (~3s) — CTA card
hold(cardSVG({
  title: "phylax",
  badge: { kind: "DENY", score: 27 },
  lines: [
    { t: "npm i phylax-skill-audit", color: C.text },
    { t: "POST usephylax.com/api/audit", color: C.scan },
    { t: "./add-skill aaronjmars/aeon phylax-audit", color: C.accent },
  ],
}), 95);

// ---- Render ----
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });
console.log(`Rendering ${frames.length} frames...`);
frames.forEach((svg, i) => {
  const n = String(i).padStart(5, "0");
  const svgPath = resolve(FRAMES, `f${n}.svg`);
  const pngPath = resolve(FRAMES, `f${n}.png`);
  writeFileSync(svgPath, svg);
  execFileSync("rsvg-convert", ["-w", String(W), "-h", String(H), svgPath, "-o", pngPath]);
});

console.log("Encoding MP4...");
execFileSync("ffmpeg", [
  "-y", "-framerate", String(FPS), "-i", resolve(FRAMES, "f%05d.png"),
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
  "-vf", "scale=1280:720", OUT,
], { stdio: "inherit" });

rmSync(FRAMES, { recursive: true, force: true });
console.log("Done →", OUT);
