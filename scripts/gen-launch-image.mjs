// gen-launch-image.mjs — bold 1600x900 token-launch image for X.
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SVG = resolve(ROOT, "assets", "x-launch.svg");
const PNG = resolve(ROOT, "assets", "x-launch.png");

const W = 1600, H = 900;
const C = {
  accent: "#3B82F6", scan: "#48D8FF", text: "#EAF2FF", sub: "#8e97ad", muted: "#4A4A5A",
  green: "#3ddc97", red: "#ff6b6b", yellow: "#f5c451", card: "#0E121B", border: "#222838",
};
const MONO = "DejaVu Sans Mono, monospace";
const SANS = "DejaVu Sans, sans-serif";
const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

function shield(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <circle cx="16" cy="15" r="15" fill="${C.scan}" opacity="0.18"/>
    <path d="M16 2 L28 6 V15 C28 23 22.5 27.5 16 30 C9.5 27.5 4 23 4 15 V6 Z" fill="${C.card}" stroke="${C.scan}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="16" cy="14.5" r="5" fill="none" stroke="${C.accent}" stroke-width="1.8"/>
    <circle cx="16" cy="14.5" r="1.6" fill="${C.scan}"/>
    <line x1="16" y1="7" x2="16" y2="9.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="16" y1="19.5" x2="16" y2="22" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="8.5" y1="14.5" x2="11" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="21" y1="14.5" x2="23.5" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
  </g>`;
}
function pill(x, y, label, color) {
  const w = label.length * 13 + 40;
  return `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="${w}" height="46" rx="10" fill="${color}1f" stroke="${color}66" stroke-width="1.5"/>
    <text x="${w/2}" y="30" text-anchor="middle" font-family="${MONO}" font-size="22" font-weight="bold" fill="${color}">${esc(label)}</text>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0a1322"/><stop offset="0.5" stop-color="#080c15"/><stop offset="1" stop-color="#05070d"/>
    </linearGradient>
    <radialGradient id="halo" cx="800" cy="300" r="640" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1c4488" stop-opacity="0.55"/><stop offset="1" stop-color="#1c4488" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  <g stroke="${C.border}" stroke-width="1" opacity="0.3">
    ${[150,300,450,600,750].map(y=>`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`).join("")}
  </g>

  ${shield(700, 70, 6.0)}

  <text x="800" y="345" text-anchor="middle" font-family="${MONO}" font-size="76" font-weight="bold" fill="${C.text}">$PHYLAX</text>
  <text x="800" y="392" text-anchor="middle" font-family="${SANS}" font-size="26" fill="${C.sub}">audit agent skills before they drain your wallet</text>

  <!-- verdict pills -->
  <g transform="translate(0 0)">
    ${pill(520, 440, "ALLOW", C.green)}
    ${pill(700, 440, "WARN", C.yellow)}
    ${pill(862, 440, "DENY", C.red)}
  </g>

  <!-- proof row -->
  <text x="800" y="565" text-anchor="middle" font-family="${MONO}" font-size="22" fill="${C.scan}">live on npm · hosted API · merged into Aeon</text>

  <!-- contract -->
  <g transform="translate(800 640)">
    <rect x="-440" y="0" width="880" height="64" rx="12" fill="${C.card}" stroke="${C.border}"/>
    <text x="-414" y="29" font-family="${MONO}" font-size="13" fill="${C.muted}">OFFICIAL CONTRACT · BASE</text>
    <text x="-414" y="51" font-family="${MONO}" font-size="19" fill="${C.text}">0xd7e608d398b88fe3084b495e9b86de2db343cba3</text>
  </g>

  <text x="800" y="788" text-anchor="middle" font-family="${MONO}" font-size="18" fill="${C.muted}">usephylax.com · verify before you ape · open source (MIT)</text>
</svg>`;

writeFileSync(SVG, svg);
execFileSync("rsvg-convert", ["-w", String(W), "-h", String(H), SVG, "-o", PNG]);
console.log("Done →", PNG);
