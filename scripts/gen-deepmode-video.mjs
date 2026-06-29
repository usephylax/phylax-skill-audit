// gen-deepmode-video.mjs — animated motion-graphics explainer for Phylax deep-mode
// honeypot simulation. SVG frames -> PNG (rsvg-convert) -> MP4 (ffmpeg). 60fps.
// No terminal. Brand-synced, eased animation, per-scene captions.

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FRAMES = resolve(ROOT, ".dm-frames");
const OUT = resolve(ROOT, "assets", "phylax-deepmode.mp4");

const W = 1280, H = 720, FPS = 60;
const C = {
  text: "#E8E8EC", sub: "#9aa0ae", muted: "#4A4A5A",
  accent: "#3B82F6", scan: "#48D8FF",
  green: "#3ddc97", red: "#ff6b6b", yellow: "#f5c451",
  card: "#0E0E14", border: "#222634",
};
const MONO = "DejaVu Sans Mono, monospace";
const SANS = "DejaVu Sans, sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
// local progress of [s,e] window at frame f
const seg = (f, s, e) => clamp((f - s) / (e - s));

function bg() {
  return `
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0a0f1c"/><stop offset="0.55" stop-color="#0a0d16"/><stop offset="1" stop-color="#06080e"/>
    </linearGradient>
    <radialGradient id="halo" cx="${W/2}" cy="300" r="620" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#15325c" stop-opacity="0.5"/><stop offset="1" stop-color="#15325c" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>`;
}

function shield(x, y, s, glow = 0) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${glow ? `<circle cx="16" cy="15" r="15" fill="${C.scan}" opacity="${0.22*glow}"/>` : ""}
    <path d="M16 2 L28 6 V15 C28 23 22.5 27.5 16 30 C9.5 27.5 4 23 4 15 V6 Z" fill="${C.card}" stroke="${C.scan}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="16" cy="14.5" r="5" fill="none" stroke="${C.accent}" stroke-width="1.8"/>
    <circle cx="16" cy="14.5" r="1.6" fill="${C.scan}"/>
    <line x1="16" y1="7" x2="16" y2="9.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="16" y1="19.5" x2="16" y2="22" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="8.5" y1="14.5" x2="11" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="21" y1="14.5" x2="23.5" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
  </g>`;
}

function caption(txt, op, color = C.text) {
  if (op <= 0.01) return "";
  return `<text x="${W/2}" y="600" text-anchor="middle" font-family="${SANS}" font-size="23" fill="${color}" opacity="${op.toFixed(3)}">${esc(txt)}</text>`;
}
function kicker(txt, op) {
  if (op <= 0.01) return "";
  return `<text x="${W/2}" y="96" text-anchor="middle" font-family="${MONO}" font-size="15" letter-spacing="3" fill="${C.scan}" opacity="${op.toFixed(3)}">${esc(txt)}</text>`;
}

// node box
function node(cx, cy, w, h, label, sub, stroke, op, scale = 1) {
  if (op <= 0.01) return "";
  const x = cx - w/2, y = cy - h/2;
  return `<g opacity="${op.toFixed(3)}" transform="translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.card}" stroke="${stroke}" stroke-width="1.6"/>
    <text x="${cx}" y="${cy - (sub?6:-7)}" text-anchor="middle" font-family="${MONO}" font-size="19" font-weight="bold" fill="${C.text}">${esc(label)}</text>
    ${sub ? `<text x="${cx}" y="${cy+20}" text-anchor="middle" font-family="${SANS}" font-size="14" fill="${C.sub}">${esc(sub)}</text>` : ""}
  </g>`;
}

// arrow between two x points at y, progress p (0..1), color, optional blocked X
function flow(x1, x2, y, p, color, blocked = false) {
  const xe = x1 + (x2 - x1) * clamp(p);
  let out = `<line x1="${x1}" y1="${y}" x2="${xe}" y2="${y}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
  if (p >= 0.98 && !blocked) {
    out += `<path d="M${x2-12} ${y-7} L${x2} ${y} L${x2-12} ${y+7}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (blocked && p >= 0.5) {
    const bx = (x1 + x2) / 2;
    out += `<g stroke="${C.red}" stroke-width="4" stroke-linecap="round"><line x1="${bx-11}" y1="${y-11}" x2="${bx+11}" y2="${y+11}"/><line x1="${bx+11}" y1="${y-11}" x2="${bx-11}" y2="${y+11}"/></g>`;
  }
  return out;
}

// ---------- timeline (frames @60fps) ----------
const T = {
  intro: [0, 140],
  problem: [140, 410],
  how: [410, 820],
  verdict: [820, 1010],
  outro: [1010, 1170],
};
const TOTAL = T.outro[1];

function frame(f) {
  let s = bg();

  // ===== INTRO =====
  if (f < T.problem[0] + 30) {
    const p = easeOut(seg(f, 0, 70));
    const out = 1 - easeInOut(seg(f, T.intro[1] - 25, T.intro[1] + 30));
    const op = clamp(p) * clamp(out);
    s += `<g opacity="${op.toFixed(3)}">`;
    s += shield(W/2 - 55, 150, 3.4, p);
    s += `<text x="${W/2}" y="380" text-anchor="middle" font-family="${MONO}" font-size="30" letter-spacing="2" fill="${C.scan}">PHYLAX · v0.2</text>`;
    s += `<text x="${W/2}" y="440" text-anchor="middle" font-family="${SANS}" font-size="46" font-weight="bold" fill="${C.text}">Deep Mode: Honeypot Simulation</text>`;
    s += `</g>`;
  }

  // ===== PROBLEM =====
  if (f >= T.problem[0] - 10 && f < T.how[0] + 30) {
    const inP = easeOut(seg(f, T.problem[0], T.problem[0] + 50));
    const outP = 1 - easeInOut(seg(f, T.problem[1] - 25, T.problem[1] + 25));
    const op = clamp(inP) * clamp(outP);
    s += `<g opacity="${op.toFixed(3)}">`;
    s += kicker("THE TRAP", op);
    // token box center
    s += node(W/2, 300, 220, 90, "Honeypot token", "looks normal", C.border, 1);
    // BUY arrow in (green) — reaches the box left edge (box: 530..750)
    const buyP = seg(f, T.problem[0] + 50, T.problem[0] + 110);
    s += `<text x="300" y="250" text-anchor="middle" font-family="${MONO}" font-size="18" fill="${C.green}" opacity="${clamp(buyP*2).toFixed(3)}">BUY</text>`;
    s += flow(220, 528, 300, buyP, C.green);
    // SELL arrow out (red) — starts at box right edge, blocked midway
    const sellP = seg(f, T.problem[0] + 120, T.problem[0] + 180);
    s += `<text x="980" y="250" text-anchor="middle" font-family="${MONO}" font-size="18" fill="${C.red}" opacity="${clamp(sellP*2).toFixed(3)}">SELL</text>`;
    s += flow(752, 1060, 300, sellP, C.red, true);
    s += caption("A honeypot lets you buy — then blocks the sell. Your funds are trapped.", clamp(seg(f, T.problem[0]+150, T.problem[0]+200)) * outP);
    s += `</g>`;
  }

  // ===== HOW IT WORKS =====
  if (f >= T.how[0] - 10 && f < T.verdict[0] + 30) {
    const inP = easeOut(seg(f, T.how[0], T.how[0] + 40));
    const outP = 1 - easeInOut(seg(f, T.how[1] - 25, T.how[1] + 25));
    const op = clamp(inP) * clamp(outP);
    s += `<g opacity="${op.toFixed(3)}">`;
    s += kicker("HOW DEEP MODE WORKS", op);

    // three step nodes appear sequentially, connected by flows
    const y = 300;
    const x1 = 250, x2 = 640, x3 = 1030;
    const a1 = easeOut(seg(f, T.how[0] + 30, T.how[0] + 90));
    const a2 = easeOut(seg(f, T.how[0] + 150, T.how[0] + 210));
    const a3 = easeOut(seg(f, T.how[0] + 270, T.how[0] + 330));

    s += node(x1, y, 250, 96, "1 · Sample holder", "from Transfer logs", C.scan, a1, 0.85 + 0.15*a1);
    s += flow(x1 + 130, x2 - 130, y, seg(f, T.how[0]+95, T.how[0]+150), C.scan);
    s += node(x2, y, 250, 96, "2 · Simulate sell", "eth_call · no funds", C.accent, a2, 0.85 + 0.15*a2);
    s += flow(x2 + 130, x3 - 130, y, seg(f, T.how[0]+215, T.how[0]+270), C.accent);
    s += node(x3, y, 250, 96, "3 · Reverts?", "→ honeypot", C.red, a3, 0.85 + 0.15*a3);

    // captions cycle per step
    const cap1 = clamp(seg(f, T.how[0]+40, T.how[0]+90)) * (1 - clamp(seg(f, T.how[0]+140, T.how[0]+170)));
    const cap2 = clamp(seg(f, T.how[0]+160, T.how[0]+210)) * (1 - clamp(seg(f, T.how[0]+260, T.how[0]+290)));
    const cap3 = clamp(seg(f, T.how[0]+280, T.how[0]+330)) * outP;
    s += caption("Pick a real holder of the token from on-chain Transfer events.", cap1, C.scan);
    s += caption("Simulate selling their balance with eth_call — no funds moved, nothing broadcast.", cap2, C.text);
    s += caption("If the simulated sell reverts or returns false, sells are blocked → honeypot.", cap3, C.red);
    s += `</g>`;
  }

  // ===== VERDICT =====
  if (f >= T.verdict[0] - 10 && f < T.outro[0] + 30) {
    const pop = easeOut(seg(f, T.verdict[0], T.verdict[0] + 30));
    const outP = 1 - easeInOut(seg(f, T.verdict[1] - 25, T.verdict[1] + 25));
    const op = clamp(pop) * clamp(outP);
    const scale = 0.7 + 0.3 * easeOut(seg(f, T.verdict[0], T.verdict[0] + 22));
    s += `<g opacity="${op.toFixed(3)}">`;
    s += kicker("DETERMINISTIC VERDICT", op);
    s += `<g transform="translate(${W/2} 300) scale(${scale}) translate(${-W/2} -300)">
      <rect x="${W/2-150}" y="252" width="300" height="96" rx="14" fill="${C.red}22" stroke="${C.red}" stroke-width="2.5"/>
      <text x="${W/2}" y="315" text-anchor="middle" font-family="${MONO}" font-size="52" font-weight="bold" fill="${C.red}">DENY</text>
    </g>`;
    s += `<text x="${W/2}" y="430" text-anchor="middle" font-family="${MONO}" font-size="19" fill="${C.sub}">CON-020 · critical · "simulated sell reverted (sells blocked)"</text>`;
    s += caption("One verdict, with on-chain evidence. Same input → same output.", clamp(seg(f, T.verdict[0]+40, T.verdict[0]+90)) * outP);
    s += `</g>`;
  }

  // ===== OUTRO =====
  if (f >= T.outro[0] - 10) {
    const op = easeOut(seg(f, T.outro[0], T.outro[0] + 40));
    s += `<g opacity="${op.toFixed(3)}">`;
    s += shield(W/2 - 40, 175, 2.5, 1);
    s += `<text x="${W/2}" y="350" text-anchor="middle" font-family="${MONO}" font-size="40" font-weight="bold" fill="${C.text}">phylax v0.2</text>`;
    s += `<text x="${W/2}" y="398" text-anchor="middle" font-family="${SANS}" font-size="21" fill="${C.sub}">npx phylax --skill ./SKILL.md --mode deep</text>`;
    s += `<text x="${W/2}" y="470" text-anchor="middle" font-family="${MONO}" font-size="17" fill="${C.muted}">npm i phylax-skill-audit · usephylax.com · native skill in Aeon</text>`;
    s += `</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

// ---------- render ----------
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });
console.log(`Rendering ${TOTAL} frames (~${(TOTAL/FPS).toFixed(1)}s @ ${FPS}fps)...`);
for (let f = 0; f < TOTAL; f++) {
  const n = String(f).padStart(5, "0");
  const sp = resolve(FRAMES, `f${n}.svg`);
  const pp = resolve(FRAMES, `f${n}.png`);
  writeFileSync(sp, frame(f));
  execFileSync("rsvg-convert", ["-w", String(W), "-h", String(H), sp, "-o", pp]);
}
console.log("Encoding MP4...");
execFileSync("ffmpeg", [
  "-y", "-framerate", String(FPS), "-i", resolve(FRAMES, "f%05d.png"),
  "-c:v", "libx264", "-preset", "slow", "-crf", "19", "-pix_fmt", "yuv420p",
  "-movflags", "+faststart", OUT,
], { stdio: "ignore" });
rmSync(FRAMES, { recursive: true, force: true });
console.log("Done ->", OUT);
