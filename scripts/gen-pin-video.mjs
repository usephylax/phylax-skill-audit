// gen-pin-video.mjs — polished pinned-tweet video for Phylax.
// Story: the risk → one command → 3 scanners (explained) → DENY with evidence
// → contrast a clean ALLOW → how to use. macOS terminal, 60fps, smooth, brand-synced.
// Pipeline: SVG frames -> PNG (rsvg-convert) -> MP4 (ffmpeg, h264).

import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FRAMES = resolve(ROOT, ".pin-frames");
const OUT = resolve(ROOT, "assets", "phylax-pin.mp4");
const W = 1280, H = 720, FPS = 60;

const C = {
  text: "#E6E7EB", sub: "#9aa0ae", muted: "#5a6072",
  accent: "#3B82F6", scan: "#48D8FF",
  green: "#3ddc97", red: "#ff6b6b", yellow: "#f5c451",
  termTop: "#2b2f3a", termBody: "#0f1118", termBorder: "#3a3f4d",
};
const MONO = "DejaVu Sans Mono, monospace";
const SANS = "DejaVu Sans, sans-serif";
const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const ease = (t) => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;

function bg() {
  return `<defs>
    <linearGradient id="wall" x1="0" y1="0" x2="${W}" y2="${H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0a0f1c"/><stop offset="0.55" stop-color="#0a0d16"/><stop offset="1" stop-color="#06080e"/>
    </linearGradient>
    <radialGradient id="halo" cx="${W*0.72}" cy="${H*0.22}" r="560" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#1b3a66" stop-opacity="0.5"/><stop offset="1" stop-color="#1b3a66" stop-opacity="0"/>
    </radialGradient>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="160%">
      <feDropShadow dx="0" dy="22" stdDeviation="32" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#wall)"/><rect width="${W}" height="${H}" fill="url(#halo)"/>`;
}
function shield(x, y, s, glow) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${glow?`<circle cx="16" cy="15" r="15" fill="${C.scan}" opacity="0.18"/>`:""}
    <path d="M16 2 L28 6 V15 C28 23 22.5 27.5 16 30 C9.5 27.5 4 23 4 15 V6 Z" fill="#0E0E14" stroke="${C.scan}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="16" cy="14.5" r="5" fill="none" stroke="${C.accent}" stroke-width="1.8"/>
    <circle cx="16" cy="14.5" r="1.6" fill="${C.scan}"/>
    <line x1="16" y1="7" x2="16" y2="9.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="16" y1="19.5" x2="16" y2="22" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="8.5" y1="14.5" x2="11" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="21" y1="14.5" x2="23.5" y2="14.5" stroke="${C.scan}" stroke-width="1.4" stroke-linecap="round"/>
  </g>`;
}

const TX=150, TY=110, TW=980, TH=440, PADX=30, BTOP=TY+46+26, LH=27;
function term(lines, opts={}) {
  const { cursorRow=null, cursorCol=0, badge=null, caption=null, capColor=C.scan, title="phylax — zsh" } = opts;
  let body="";
  lines.forEach((ln,i)=>{ const y=BTOP+i*LH;
    body+=`<text x="${TX+PADX}" y="${y}" font-family="${MONO}" font-size="17" fill="${ln.color||C.text}" xml:space="preserve">${esc(ln.t)}</text>`; });
  if(cursorRow!==null){ const y=BTOP+cursorRow*LH, x=TX+PADX+cursorCol*10.2;
    body+=`<rect x="${x+1}" y="${y-14}" width="9" height="18" fill="${C.scan}" opacity="0.85"/>`; }
  if(badge){ const bc=badge.kind==="DENY"?C.red:badge.kind==="WARN"?C.yellow:C.green; const y=BTOP+badge.row*LH;
    body+=`<g transform="translate(${TX+PADX} ${y})"><rect x="-6" y="-19" width="168" height="28" rx="6" fill="${bc}22" stroke="${bc}66"/>
      <text x="6" y="1" font-family="${MONO}" font-size="17" font-weight="bold" fill="${bc}">${badge.kind}  ·  score ${badge.score}</text></g>`; }
  let cap="";
  if(caption){ cap=`<g transform="translate(${TX} ${TY+TH+34})"><circle cx="10" cy="-4" r="5" fill="${capColor}"/>
    <text x="26" y="0" font-family="${SANS}" font-size="19" fill="${C.text}">${esc(caption)}</text></g>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bg()}
    ${shield(40,30,1.25)}<text x="82" y="52" font-family="${MONO}" font-size="19" font-weight="bold" fill="${C.text}">phylax</text>
    <g filter="url(#sh)">
      <rect x="${TX}" y="${TY}" width="${TW}" height="${TH}" rx="14" fill="${C.termBody}" stroke="${C.termBorder}"/>
      <path d="M${TX} ${TY+14} a14 14 0 0 1 14 -14 h${TW-28} a14 14 0 0 1 14 14 v32 h-${TW} z" fill="${C.termTop}"/>
      <circle cx="${TX+22}" cy="${TY+23}" r="7" fill="#ff5f57"/><circle cx="${TX+44}" cy="${TY+23}" r="7" fill="#febc2e"/><circle cx="${TX+66}" cy="${TY+23}" r="7" fill="#28c840"/>
      <text x="${TX+TW/2}" y="${TY+28}" text-anchor="middle" font-family="${SANS}" font-size="14" fill="${C.sub}">${esc(title)}</text>
    </g>${body}${cap}</svg>`;
}
function card(o){
  const { title, sub, lines=[], badge=null, fade=1 } = o;
  let body=""; lines.forEach((l,i)=>{ body+=`<text x="${W/2}" y="${454+i*42}" text-anchor="middle" font-family="${MONO}" font-size="21" fill="${l.color||C.sub}">${esc(l.t)}</text>`; });
  let be=""; if(badge){ const bc=badge.kind==="DENY"?C.red:C.green;
    be=`<g transform="translate(${W/2} 344)"><rect x="-135" y="-37" width="270" height="66" rx="12" fill="${bc}22" stroke="${bc}77" stroke-width="2"/>
      <text x="0" y="11" text-anchor="middle" font-family="${MONO}" font-size="38" font-weight="bold" fill="${bc}">${badge.kind} · ${badge.score}</text></g>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${bg()}
    <g opacity="${fade}">${shield(W/2-64,108,4.0,true)}
    <text x="${W/2}" y="288" text-anchor="middle" font-family="${MONO}" font-size="56" font-weight="bold" fill="${C.text}">${esc(title)}</text>
    ${sub?`<text x="${W/2}" y="330" text-anchor="middle" font-family="${SANS}" font-size="22" fill="${C.sub}">${esc(sub)}</text>`:""}
    ${be}${body}</g></svg>`;
}

const frames=[]; const hold=(svg,n)=>{ for(let i=0;i<n;i++) frames.push(svg); };

// ── 1. INTRO with fade (3s) ──
for(let i=0;i<46;i++){ const o=ease(Math.min(1,i/30));
  frames.push(card({title:"phylax", sub:"Audit agent skills before they drain your wallet", fade:o.toFixed(3)})); }
hold(card({title:"phylax", sub:"Audit agent skills before they drain your wallet"}), 60);

// ── 2. The risk (problem framing) ──
const risk=[
  {t:"# You're about to add a skill to your agent.",color:C.sub},
  {t:"# It runs unattended — with your keys. With your wallet.",color:C.sub},
  {t:"",},
  {t:"# One SKILL.md can hide a transfer, ask for your seed",color:C.muted},
  {t:"# phrase, or point you at a honeypot contract.",color:C.muted},
];
hold(term(risk,{caption:"Most people install blind. Phylax checks first."}),120);

// ── 3. type command ──
const prompt="$ npx phylax --skill ./swap-helper/SKILL.md --mode deep";
for(let i=1;i<=prompt.length;i++){ const s=term([{t:prompt.slice(0,i)}],{cursorRow:0,cursorCol:i,caption:"One command. One verdict."}); frames.push(s); frames.push(s); }
for(let b=0;b<30;b++){ const on=Math.floor(b/9)%2===0; hold(term([{t:prompt}], on?{cursorRow:0,cursorCol:prompt.length,caption:"One command. One verdict."}:{caption:"One command. One verdict."}),1); }

// ── 4. three scanners reveal ──
const scan=[
  {t:"▸ Loading 30+ rules from /rules/*.yaml",color:C.scan},
  {t:"▸ [1/3] Static  — SKILL.md: injection · secret-exfil",color:C.scan},
  {t:"▸ [2/3] Onchain — Base 8453: bytecode · honeypot powers",color:C.scan},
  {t:"▸ [3/3] x402    — endpoints: HTTPS · 402 schema · price",color:C.scan},
];
const acc=[{t:prompt},{t:""}];
hold(term([...acc],{caption:"Three independent scanners, one pipeline."}),24);
for(const s of scan){ acc.push(s); hold(term([...acc],{caption:"Three independent scanners, one pipeline."}),28); }
hold(term([...acc],{caption:"Three independent scanners, one pipeline."}),24);

// ── 5. verdict + findings (DENY) ──
acc.push({t:""}); acc.push({t:"── verdict ───────────────────────────────",color:C.muted});
const vrow=acc.length; acc.push({t:""});
hold(term([...acc],{badge:{kind:"DENY",score:27,row:vrow},caption:"Score starts at 100. Each finding subtracts a weight."}),34);
const finds=[
  {t:"  ✗ CON-020  critical   sell_tax = 35%            L23",color:C.red},
  {t:"  ✗ CON-012  high       owner mint() / pause()    L20",color:C.yellow},
  {t:"  ! CON-030  medium     unverified contract       onchain",color:C.sub},
];
for(const f of finds){ acc.push(f); hold(term([...acc],{badge:{kind:"DENY",score:27,row:vrow},caption:"Every finding cites a line. No black box."}),30); }
acc.push({t:""}); acc.push({t:"→ 100 − (40+20+10) = 27   →  DENY. Don't install.",color:C.text});
hold(term([...acc],{badge:{kind:"DENY",score:27,row:vrow},caption:"Critical found → DENY. Deterministic, every time."},),95);

// ── 6. contrast: clean skill ALLOW (quick) ──
const clean=[
  {t:"$ npx phylax --skill ./price-oracle/SKILL.md",},
  {t:""},
  {t:"▸ static · onchain · x402 … no findings",color:C.scan},
  {t:""},
  {t:"── verdict ───────────────────────────────",color:C.muted},
  {t:""},
];
hold(term(clean,{badge:{kind:"ALLOW",score:97,row:5},caption:"Clean skill? ALLOW. Same engine, same math."}),96);

// ── 7. OUTRO — how to use ──
for(let i=0;i<24;i++){ const o=ease(Math.min(1,i/18)).toFixed(3);
  frames.push(card({title:"phylax", sub:"Don't install blind.", fade:o})); }
hold(card({title:"phylax", lines:[
  {t:"npm i phylax-skill-audit",color:C.text},
  {t:"POST usephylax.com/api/audit",color:C.scan},
  {t:"./add-skill aaronjmars/aeon phylax-audit",color:C.accent},
  {t:"usephylax.com",color:C.muted},
]}),150);

// ── render ──
rmSync(FRAMES,{recursive:true,force:true}); mkdirSync(FRAMES,{recursive:true});
console.log(`Rendering ${frames.length} frames (~${(frames.length/FPS).toFixed(1)}s)...`);
frames.forEach((svg,i)=>{ const n=String(i).padStart(5,"0");
  const sp=resolve(FRAMES,`f${n}.svg`), pp=resolve(FRAMES,`f${n}.png`);
  writeFileSync(sp,svg); execFileSync("rsvg-convert",["-w",String(W),"-h",String(H),sp,"-o",pp]); });
console.log("Encoding...");
execFileSync("ffmpeg",["-y","-framerate",String(FPS),"-i",resolve(FRAMES,"f%05d.png"),
  "-c:v","libx264","-preset","slow","-crf","18","-pix_fmt","yuv420p","-movflags","+faststart",OUT],{stdio:"inherit"});
rmSync(FRAMES,{recursive:true,force:true});
console.log("Done →",OUT);
