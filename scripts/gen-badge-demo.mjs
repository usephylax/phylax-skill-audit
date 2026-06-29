// gen-badge-demo.mjs — render a 1600x900 tweet image showing the 3 verdict badges
// + how to embed them. Brand-synced. SVG -> PNG via rsvg-convert.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SVG = resolve(ROOT, "assets", "x-badge-demo.svg");
const PNG = resolve(ROOT, "assets", "x-badge-demo.png");

const W = 1600, H = 900;
const C = {
  accent: "#3B82F6", scan: "#48D8FF", text: "#E8E8EC", sub: "#8888A0", muted: "#4A4A5A",
  green: "#3ddc97", yellow: "#f5c451", red: "#ff6b6b", card: "#0E0E14", border: "#1E1E26",
};
const MONO = "DejaVu Sans Mono, monospace";
const SANS = "DejaVu Sans, sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function shield(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="16" cy="15" r="15" fill="${C.scan}" opacity="0.16"/>
    <path d="M16 2 L28 6 V15 C28 23 22.5 27.5 16 30 C9.5 27.5 4 23 4 15 V6 Z" fill="${C.card}" stroke="${C.scan}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="16" cy="14.5" r="5" fill="none" stroke="${C.accent}" stroke-width="1.8"/>
    <circle cx="16" cy="14.5" r="1.6" fill="${C.scan}"/>
    <line x1="16" y1="7" x2="16" y2="9.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="16" y1="19.5" x2="16" y2="22" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="8.5" y1="14.5" x2="11" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="21" y1="14.5" x2="23.5" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
  </g>`;
}

// shields.io-style badge: "phylax | VERDICT score"
function badge(cx, y, value, color) {
  const label = "phylax";
  const lw = 96, vw = 12 + value.length * 13.5, H2 = 46, r = 8;
  const x = cx - (lw + vw) / 2;
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="${lw}" height="${H2}" rx="${r}" fill="#11131b"/>
    <rect x="${lw - r}" y="0" width="${r}" height="${H2}" fill="#11131b"/>
    <rect x="${lw}" y="0" width="${vw}" height="${H2}" rx="${r}" fill="${color}"/>
    <rect x="${lw}" y="0" width="${r}" height="${H2}" fill="${color}"/>
    <text x="${lw / 2}" y="29" text-anchor="middle" font-family="${SANS}" font-size="20" font-weight="600" fill="${C.scan}">${label}</text>
    <text x="${lw + vw / 2}" y="29" text-anchor="middle" font-family="${MONO}" font-size="19" font-weight="700" fill="#0a0d12">${esc(value)}</text>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0a0f1c"/><stop offset="0.55" stop-color="#0a0d16"/><stop offset="1" stop-color="#06080e"/>
    </linearGradient>
    <radialGradient id="halo" cx="800" cy="300" r="640" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#16335f" stop-opacity="0.45"/><stop offset="1" stop-color="#16335f" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>

  ${shield(W / 2 - 26, 70, 1.7)}
  <text x="${W / 2}" y="170" text-anchor="middle" font-family="${MONO}" font-size="34" font-weight="bold" fill="${C.text}">verdict badge for any agent skill</text>
  <text x="${W / 2}" y="210" text-anchor="middle" font-family="${SANS}" font-size="20" fill="${C.sub}">drop it on a skill listing — green ALLOW, amber WARN, red DENY</text>

  <!-- three badges -->
  ${badge(W / 2 - 360, 320, "ALLOW 97", C.green)}
  ${badge(W / 2, 320, "WARN 57", C.yellow)}
  ${badge(W / 2 + 360, 320, "DENY 27", C.red)}

  <!-- embed snippet card -->
  <rect x="${W / 2 - 470}" y="460" width="940" height="150" rx="12" fill="${C.card}" stroke="${C.border}"/>
  <text x="${W / 2 - 440}" y="500" font-family="${MONO}" font-size="15" fill="${C.muted}">EMBED</text>
  <text x="${W / 2 - 440}" y="540" font-family="${MONO}" font-size="19" fill="${C.scan}">&lt;img src="usephylax.com/api/badge?skill=owner/repo"&gt;</text>
  <text x="${W / 2 - 440}" y="582" font-family="${MONO}" font-size="17" fill="${C.sub}">deterministic · evidence-backed · free · Base</text>

  <text x="${W / 2}" y="700" text-anchor="middle" font-family="${MONO}" font-size="22" fill="${C.text}">audit any agent skill before it touches your wallet</text>
  <text x="${W / 2}" y="800" text-anchor="middle" font-family="${MONO}" font-size="18" fill="${C.muted}">usephylax.com · npm i phylax-skill-audit · native skill in Aeon</text>
</svg>`;

writeFileSync(SVG, svg);
execFileSync("rsvg-convert", ["-w", String(W), "-h", String(H), SVG, "-o", PNG]);
console.log("Done ->", PNG);
