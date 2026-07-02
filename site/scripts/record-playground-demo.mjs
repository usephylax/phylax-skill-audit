// record-playground-demo.mjs — v0.2.3 playground tweet screencast.
// Output: site/.demo-out/*.webm → assets/phylax-playground-demo.{mp4,gif}

import { chromium } from "playwright";
import { mkdirSync, rmSync } from "node:fs";

const BASE = process.env.DEMO_BASE || "https://usephylax.com";
const OUT = new URL("../.demo-out/", import.meta.url).pathname;
const W = 1280;
const H = 800;
const TOTAL_STEPS = 3;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function installOverlay(page) {
  await page.evaluate(() => {
    if (document.getElementById("__demo_layer")) return;
    const layer = document.createElement("div");
    layer.id = "__demo_layer";
    layer.innerHTML = `
      <style>
        #__demo_layer, #__demo_layer * { box-sizing: border-box; }
        #__demo_cursor {
          position: fixed; top: 0; left: 0; width: 22px; height: 22px;
          z-index: 2147483647; pointer-events: none; transform: translate(-50%, -50%);
          filter: drop-shadow(0 2px 6px rgba(0,0,0,.5));
        }
        .__demo_ripple {
          position: fixed; z-index: 2147483646; pointer-events: none;
          width: 12px; height: 12px; border-radius: 999px;
          border: 2px solid #48D8FF; transform: translate(-50%,-50%);
          animation: __demo_rip .55s ease-out forwards;
        }
        @keyframes __demo_rip { 0%{opacity:.9;width:12px;height:12px} 100%{opacity:0;width:64px;height:64px} }
        #__demo_caption {
          position: fixed; left: 50%; bottom: 34px; transform: translateX(-50%) translateY(14px);
          z-index: 2147483645; pointer-events: none; opacity: 0;
          transition: opacity .4s ease, transform .4s ease;
          display: flex; align-items: center; gap: 14px;
          padding: 12px 18px; border-radius: 14px;
          background: rgba(7,10,15,.88); backdrop-filter: blur(12px);
          border: 1px solid rgba(45,125,255,.4); box-shadow: 0 8px 40px rgba(0,0,0,.55);
          font-family: 'IBM Plex Mono', ui-monospace, monospace; max-width: 920px;
        }
        #__demo_caption.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        #__demo_step { font-size:12px; font-weight:700; letter-spacing:.05em; color:#070A0F;
          background:#2D7DFF; padding:5px 10px; border-radius:8px; white-space:nowrap; }
        #__demo_title { font-size:15px; font-weight:700; color:#fff; }
        #__demo_sub { font-size:12.5px; color:#9fb3c8; margin-top:2px; }
        #__demo_progress { position: fixed; top:0; left:0; height:3px; z-index:2147483645;
          background: linear-gradient(90deg,#2D7DFF,#48D8FF); width:0%; transition: width .5s ease; }
        #__demo_card { position: fixed; inset:0; z-index:2147483644; pointer-events:none;
          display:flex; align-items:center; justify-content:center; background: rgba(7,10,15,.94);
          opacity:0; transition: opacity .5s ease; font-family: Inter, system-ui, sans-serif; text-align:center; }
        #__demo_card.show { opacity:1; }
        #__demo_card .badge { display:inline-block; font-family:'IBM Plex Mono',monospace;
          color:#48D8FF; font-size:12px; letter-spacing:.15em; text-transform:uppercase;
          border:1px solid rgba(72,216,255,.35); padding:6px 12px; border-radius:999px; margin-bottom:16px; }
        #__demo_card .t { color:#fff; font-size:36px; font-weight:800; line-height:1.12; white-space:pre-line; }
        #__demo_card .s { color:#9fb3c8; font-size:17px; margin-top:16px; max-width:520px; margin-inline:auto; }
        .__demo_glow { position: fixed; z-index:2147483643; pointer-events:none; border-radius:12px;
          box-shadow: 0 0 0 3px #48D8FF, 0 0 28px 6px rgba(72,216,255,.45); opacity:0; transition: opacity .3s ease; }
        .__demo_glow.show { opacity:1; }
      </style>
      <div id="__demo_progress"></div>
      <div id="__demo_caption">
        <div id="__demo_step">STEP 1/3</div>
        <div><div id="__demo_title"></div><div id="__demo_sub"></div></div>
      </div>
      <div id="__demo_cursor">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M2 2 L2 17 L6 13 L9 20 L12 19 L9 12 L15 12 Z" fill="#fff" stroke="#070A0F" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>
      </div>
      <div id="__demo_glowbox" class="__demo_glow"></div>
      <div id="__demo_card"><div><div class="badge"></div><div class="t"></div><div class="s"></div></div></div>
    `;
    document.body.appendChild(layer);
    const c = document.getElementById("__demo_cursor");
    c.style.left = window.innerWidth / 2 + "px";
    c.style.top = window.innerHeight / 2 + "px";
    window.__demoCursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  });
}

async function setProgress(page, pct) {
  await page.evaluate((p) => { document.getElementById("__demo_progress").style.width = p + "%"; }, pct);
}

async function showCaption(page, step, title, sub) {
  await page.evaluate(({ step, title, sub, total }) => {
    document.getElementById("__demo_step").textContent = `STEP ${step}/${total}`;
    document.getElementById("__demo_title").textContent = title;
    document.getElementById("__demo_sub").textContent = sub || "";
    document.getElementById("__demo_caption").classList.add("show");
  }, { step, title, sub, total: TOTAL_STEPS });
}

async function hideCaption(page) {
  await page.evaluate(() => document.getElementById("__demo_caption").classList.remove("show"));
}

async function card(page, badge, title, sub) {
  await page.evaluate(({ badge, title, sub }) => {
    const el = document.getElementById("__demo_card");
    el.querySelector(".badge").textContent = badge;
    el.querySelector(".t").textContent = title;
    el.querySelector(".s").textContent = sub || "";
    el.classList.add("show");
  }, { badge, title, sub });
}

async function hideCard(page) {
  await page.evaluate(() => document.getElementById("__demo_card").classList.remove("show"));
}

async function moveCursor(page, x, y, dur = 700) {
  await page.evaluate(async ({ x, y, dur }) => {
    const c = document.getElementById("__demo_cursor");
    const s = window.__demoCursor || { x: 0, y: 0 };
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    await new Promise((res) => {
      function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        const e = ease(p);
        c.style.left = s.x + (x - s.x) * e + "px";
        c.style.top = s.y + (y - s.y) * e + "px";
        if (p < 1) requestAnimationFrame(step);
        else { window.__demoCursor = { x, y }; res(); }
      }
      requestAnimationFrame(step);
    });
  }, { x, y, dur });
}

async function cursorTo(page, selector, { dur = 750, glow = false } = {}) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) return null;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await moveCursor(page, cx, cy, dur);
  if (glow) {
    await page.evaluate(({ box }) => {
      const g = document.getElementById("__demo_glowbox");
      g.style.left = box.x - 4 + "px"; g.style.top = box.y - 4 + "px";
      g.style.width = box.width + 8 + "px"; g.style.height = box.height + 8 + "px";
      g.classList.add("show");
    }, { box });
  }
  return { cx, cy, box };
}

async function clearGlow(page) {
  await page.evaluate(() => document.getElementById("__demo_glowbox").classList.remove("show"));
}

async function ripple(page, x, y) {
  await page.evaluate(({ x, y }) => {
    const r = document.createElement("div");
    r.className = "__demo_ripple";
    r.style.left = x + "px"; r.style.top = y + "px";
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
  }, { x, y });
}

async function clickWithCursor(page, selector, { dur = 750 } = {}) {
  const pos = await cursorTo(page, selector, { dur });
  if (pos) await ripple(page, pos.cx, pos.cy);
  await wait(220);
  await page.locator(selector).first().click();
}

async function smoothScrollTo(page, selector, dur = 1500) {
  await page.evaluate(async ({ selector, dur }) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const startY = window.scrollY;
    const rect = el.getBoundingClientRect();
    const targetY = startY + rect.top - (window.innerHeight - rect.height) / 2 + 20;
    const clampY = Math.max(0, targetY);
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    await new Promise((resolve) => {
      function step(now) {
        const p = Math.min(1, (now - t0) / dur);
        window.scrollTo(0, startY + (clampY - startY) * ease(p));
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }, { selector, dur });
}

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({
    args: ["--force-color-profile=srgb", "--hide-scrollbars", "--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
    recordVideo: { dir: OUT, size: { width: W, height: H } },
    colorScheme: "dark",
  });
  const page = await context.newPage();

  await page.goto(`${BASE}/#playground`, { waitUntil: "networkidle", timeout: 60000 });
  await installOverlay(page);
  await page.locator("#pg-input").waitFor({ timeout: 20000 });

  // Intro
  await card(
    page,
    "Phylax v0.2.3",
    "Try it before\nyou install it",
    "Paste any SKILL.md → get ALLOW / WARN / DENY with cited evidence. Free in your browser.",
  );
  await wait(2800);
  await hideCard(page);
  await wait(600);

  // STEP 1 — load risky sample
  await setProgress(page, 33);
  await showCaption(page, 1, "Load a suspicious skill", "Airdrop scam: move USDC + hand over private key");
  await smoothScrollTo(page, "#playground", 1200);
  await wait(500);
  await clickWithCursor(page, "#playground button:has-text('Paste risky SKILL.md')", { dur: 850 });
  await wait(1200);
  await cursorTo(page, "#pg-input", { dur: 600, glow: true });
  await wait(1800);
  await clearGlow(page);
  await hideCaption(page);
  await wait(400);

  // STEP 2 — run audit
  await setProgress(page, 66);
  await showCaption(page, 2, "Run the free audit", "Same deterministic engine as CLI + API");
  await clickWithCursor(page, "#playground button:has-text('Run audit')", { dur: 800 });
  await page.locator("#playground .verdict-deny, #playground :text('DENY')").first().waitFor({ timeout: 20000 });
  await wait(400);
  await smoothScrollTo(page, "#playground .terminal-body", 900);
  await hideCaption(page);
  await wait(300);

  // STEP 3 — highlight verdict
  await setProgress(page, 100);
  await showCaption(
    page,
    3,
    "Verdict: DENY",
    "PI-001 fund transfer · SEC-001 private key — install blocked with evidence",
  );
  await cursorTo(page, "#playground .verdict-deny", { dur: 700, glow: true });
  await wait(4500);
  await clearGlow(page);
  await hideCaption(page);
  await wait(400);

  // Outro
  await card(page, "Free · No wallet", "usephylax.com/#playground", "Deterministic security for agent skills on Base");
  await wait(3200);
  await hideCard(page);
  await wait(400);

  await context.close();
  await browser.close();
  console.log("recorded →", OUT);
}

main().catch((e) => { console.error(e); process.exit(1); });
