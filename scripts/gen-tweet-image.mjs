// gen-tweet-image.mjs — render a 1600x900 tweet image for Phylax (brand-synced).
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SVG = resolve(ROOT, "assets", "x-feature.svg");
const PNG = resolve(ROOT, "assets", "x-feature.png");

const W = 1600, H = 900;
const C = {
  accent: "#3B82F6", scan: "#48D8FF", text: "#E8E8EC", sub: "#8888A0", muted: "#4A4A5A",
  green: "#3ddc97", yellow: "#f5c451", red: "#ff6b6b", card: "#0E0E14", border: "#1E1E26",
};
const MONO = "DejaVu Sans Mono, monospace";
const SANS = "DejaVu Sans, sans-serif";
const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

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

// verdict pill card
function vcard(x, y, skill, verdict, score, color) {
  return `<g transform="translate(${x} ${y})">
    <rect width="380" height="118" rx="12" fill="${C.card}" stroke="${C.border}"/>
    <text x="22" y="38" font-family="${MONO}" font-size="17" fill="${C.sub}">${esc(skill)}</text>
    <g transform="translate(22 58)">
      <rect x="0" y="0" width="${verdict.length*15+44}" height="40" rx="8" fill="${color}22" stroke="${color}66"/>
      <text x="16" y="27" font-family="${MONO}" font-size="20" font-weight="bold" fill="${color}">${verdict}</text>
    </g>
    <text x="${verdict.length*15+92}" y="86" font-family="${MONO}" font-size="30" font-weight="bold" fill="${C.text}">${score}</text>
    <text x="340" y="38" font-family="${MONO}" font-size="13" fill="${C.muted}">/api</text>
  </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0a0f1c"/><stop offset="0.55" stop-color="#0a0d16"/><stop offset="1" stop-color="#06080e"/>
    </linearGradient>
    <radialGradient id="halo" cx="1180" cy="240" r="620" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#17396b" stop-opacity="0.5"/><stop offset="1" stop-color="#17396b" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  <g stroke="${C.border}" stroke-width="1" opacity="0.35">
    ${[225,450,675].map(y=>`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`).join("")}
  </g>

  ${shield(96, 80, 2.4)}
  <text x="180" y="118" font-family="${MONO}" font-size="40" font-weight="bold" fill="${C.text}">phylax</text>
  <text x="182" y="150" font-family="${SANS}" font-size="20" fill="${C.sub}">Pre-install risk verdicts for agent skills · Base</text>

  <text x="96" y="270" font-family="${SANS}" font-size="58" font-weight="bold" fill="${C.text}">Audit a skill before</text>
  <text x="96" y="338" font-family="${SANS}" font-size="58" font-weight="bold" fill="${C.text}">it drains your wallet.</text>

  <text x="96" y="402" font-family="${MONO}" font-size="20" fill="${C.scan}">static + onchain + x402  →  one deterministic verdict</text>

  <!-- live verdict cards -->
  ${vcard(96, 470, "skills/article", "ALLOW", 97, C.green)}
  ${vcard(516, 470, "skills/honeypot-check", "WARN", 57, C.yellow)}
  ${vcard(936, 470, "swap-helper (honeypot)", "DENY", 27, C.red)}

  <!-- usage row -->
  <g transform="translate(96 650)">
    <text x="0" y="24" font-family="${MONO}" font-size="19" fill="${C.text}">$ npx phylax --skill ./SKILL.md</text>
    <text x="0" y="58" font-family="${MONO}" font-size="19" fill="${C.sub}">$ curl -X POST usephylax.com/api/audit</text>
    <text x="0" y="92" font-family="${MONO}" font-size="19" fill="${C.accent}">$ ./add-skill aaronjmars/aeon phylax-audit</text>
  </g>

  <text x="96" y="828" font-family="${MONO}" font-size="18" fill="${C.muted}">npm i phylax-skill-audit   ·   MIT   ·   merged into Aeon   ·   usephylax.com</text>
</svg>`;

writeFileSync(SVG, svg);
execFileSync("rsvg-convert", ["-w", String(W), "-h", String(H), SVG, "-o", PNG]);
console.log("Done →", PNG);
