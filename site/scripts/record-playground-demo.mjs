// record-playground-demo.mjs — 1080p @ 60fps, frame-perfect timeline.
// Each frame = explicit scene state → crisp, smooth output for Twitter.

import { chromium } from "playwright";
import { mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const BASE = process.env.DEMO_BASE || "https://usephylax.com";
const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, ".demo-out");
const FRAMES = join(OUT, "frames-60");
const ASSETS = new URL("../../assets/", import.meta.url).pathname;

const W = 1920;
const H = 1080;
const FPS = 60;
const DURATION_SEC = 24;
const TOTAL_FRAMES = FPS * DURATION_SEC;

const easeOut4 = (t) => 1 - Math.pow(1 - t, 4);
const easeInOut4 = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.max(0, Math.min(1, t));

function segment(frame, start, end) {
  return clamp01((frame - start) / Math.max(1, end - start));
}

async function installOverlay(page) {
  await page.evaluate(() => {
    if (document.getElementById("__demo_layer")) return;
    const layer = document.createElement("div");
    layer.id = "__demo_layer";
    layer.innerHTML = `
      <style>
        #__demo_layer, #__demo_layer * { box-sizing: border-box; }
        #__demo_cursor { position:fixed;top:0;left:0;width:26px;height:26px;z-index:2147483647;
          pointer-events:none;transform:translate(-50%,-50%);filter:drop-shadow(0 3px 8px rgba(0,0,0,.55)); }
        .__demo_ripple { position:fixed;z-index:2147483646;pointer-events:none;width:14px;height:14px;
          border-radius:999px;border:2px solid #48D8FF;transform:translate(-50%,-50%);
          animation:__demo_rip .55s ease-out forwards; }
        @keyframes __demo_rip { 0%{opacity:.95;width:14px;height:14px} 100%{opacity:0;width:72px;height:72px} }
        #__demo_caption { position:fixed;left:50%;bottom:48px;transform:translateX(-50%) translateY(18px);
          z-index:2147483645;pointer-events:none;opacity:0;transition:none;
          display:flex;align-items:center;gap:16px;padding:14px 22px;border-radius:16px;
          background:rgba(7,10,15,.9);backdrop-filter:blur(16px);border:1px solid rgba(45,125,255,.45);
          box-shadow:0 12px 48px rgba(0,0,0,.55);font-family:'IBM Plex Mono',ui-monospace,monospace;max-width:1100px; }
        #__demo_caption.show { opacity:1; transform:translateX(-50%) translateY(0); }
        #__demo_step { font-size:13px;font-weight:700;letter-spacing:.06em;color:#070A0F;background:#2D7DFF;padding:6px 12px;border-radius:9px; }
        #__demo_title { font-size:17px;font-weight:700;color:#fff; }
        #__demo_sub { font-size:14px;color:#9fb3c8;margin-top:3px;line-height:1.35; }
        #__demo_progress { position:fixed;top:0;left:0;height:4px;z-index:2147483645;
          background:linear-gradient(90deg,#2D7DFF,#48D8FF);width:0%;transition:none; }
        #__demo_card { position:fixed;inset:0;z-index:2147483644;pointer-events:none;display:flex;
          align-items:center;justify-content:center;background:rgba(7,10,15,.94);opacity:0;
          font-family:Inter,system-ui,sans-serif;text-align:center; }
        #__demo_card.show { opacity:1; }
        #__demo_card .badge { display:inline-block;font-family:'IBM Plex Mono',monospace;color:#48D8FF;
          font-size:13px;letter-spacing:.18em;text-transform:uppercase;border:1px solid rgba(72,216,255,.4);
          padding:7px 14px;border-radius:999px;margin-bottom:18px; }
        #__demo_card .t { color:#fff;font-size:42px;font-weight:800;line-height:1.1;white-space:pre-line; }
        #__demo_card .s { color:#9fb3c8;font-size:19px;margin-top:18px;max-width:620px;margin-inline:auto;line-height:1.45; }
        .__demo_glow { position:fixed;z-index:2147483643;pointer-events:none;border-radius:14px;
          box-shadow:0 0 0 3px #48D8FF,0 0 32px 8px rgba(72,216,255,.42);opacity:0; }
        .__demo_glow.show { opacity:1; }
      </style>
      <div id="__demo_progress"></div>
      <div id="__demo_caption"><div id="__demo_step"></div><div><div id="__demo_title"></div><div id="__demo_sub"></div></div></div>
      <div id="__demo_cursor"><svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <path d="M2 2 L2 17 L6 13 L9 20 L12 19 L9 12 L15 12 Z" fill="#fff" stroke="#070A0F" stroke-width="1.2" stroke-linejoin="round"/></svg></div>
      <div id="__demo_glowbox" class="__demo_glow"></div>
      <div id="__demo_card"><div><div class="badge"></div><div class="t"></div><div class="s"></div></div></div>
    `;
    document.body.appendChild(layer);
  });
}

async function prepareScene(page) {
  // Pre-load sample + run audit so output panel is ready; we only animate UI overlays.
  await page.goto(`${BASE}/#playground`, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator("#pg-input").waitFor({ timeout: 20000 });
  await installOverlay(page);

  await page.locator("#playground button:has-text('Paste risky SKILL.md')").click();
  await page.locator("#playground button:has-text('Run audit')").click();
  await page.locator("#playground .verdict-deny").first().waitFor({ timeout: 30000 });

  // Cache layout anchors for cursor path
  return page.evaluate(() => {
    const r = (sel) => document.querySelector(sel)?.getBoundingClientRect();
    const buttons = [...document.querySelectorAll("#playground button")];
    const sampleBtn = buttons.find((b) => b.textContent?.includes("Paste risky"));
    const runBtn = buttons.find((b) => b.textContent?.includes("Run audit"));
    const sample = sampleBtn?.getBoundingClientRect();
    const run = runBtn?.getBoundingClientRect();
    const input = r("#pg-input");
    const deny = r("#playground .verdict-deny");
    const pg = document.querySelector("#playground");
    const box = (el) => el ? { x: el.x, y: el.y, width: el.width, height: el.height } : null;
    return {
      sample: sample ? { x: sample.x + sample.width / 2, y: sample.y + sample.height / 2 } : null,
      run: run ? { x: run.x + run.width / 2, y: run.y + run.height / 2 } : null,
      input: input ? { x: input.x + input.width / 2, y: input.y + input.height / 2, box: box(input) } : null,
      deny: deny ? { x: deny.x + deny.width / 2, y: deny.y + deny.height / 2, box: box(deny) } : null,
      pgTop: pg ? pg.offsetTop : 0,
      scrollDeny: pg && deny ? pg.offsetTop + deny.top - window.innerHeight / 2 + 40 : 0,
    };
  });
}

function cursorAt(anchors, frame) {
  const cx = W / 2;
  const cy = H / 2;
  const s = anchors.sample || { x: cx, y: cy };
  const r = anchors.run || { x: cx, y: cy };
  const i = anchors.input || { x: cx, y: cy };
  const d = anchors.deny || { x: cx, y: cy };

  // intro: center
  if (frame < 120) return { x: cx, y: cy };

  // move to sample button (frames 120-200)
  if (frame < 200) {
    const t = easeOut4(segment(frame, 120, 200));
    return { x: lerp(cx, s.x, t), y: lerp(cy, s.y, t) };
  }
  // hold on sample + ripple zone (200-280)
  if (frame < 280) return { x: s.x, y: s.y };
  // to input (280-360)
  if (frame < 360) {
    const t = easeOut4(segment(frame, 280, 360));
    return { x: lerp(s.x, i.x, t), y: lerp(s.y, i.y, t) };
  }
  // hold input (360-480)
  if (frame < 480) return { x: i.x, y: i.y };
  // to run button (480-560)
  if (frame < 560) {
    const t = easeOut4(segment(frame, 480, 560));
    return { x: lerp(i.x, r.x, t), y: lerp(i.y, r.y, t) };
  }
  // hold run / result (560-900)
  if (frame < 900) return { x: r.x, y: r.y };
  // to deny badge (900-980)
  if (frame < 980) {
    const t = easeOut4(segment(frame, 900, 980));
    return { x: lerp(r.x, d.x, t), y: lerp(r.y, d.y, t) };
  }
  // hold deny (980-1260)
  if (frame < 1260) return { x: d.x, y: d.y };
  return { x: cx, y: cy };
}

async function renderFrame(page, frame, anchors) {
  const f = frame;
  const introOn = f < 150;
  const introFade = f >= 150 && f < 180;
  const outroOn = f >= 1260;

  const cap1 = f >= 180 && f < 480;
  const cap2 = f >= 480 && f < 900;
  const cap3 = f >= 900 && f < 1260;

  const progress = f < 180 ? 0 : f < 480 ? 33 : f < 900 ? 66 : 100;

  const scrollY =
    f < 120 ? 0 :
    f < 200 ? lerp(0, anchors.pgTop - 80, easeInOut4(segment(f, 120, 200))) :
    f < 900 ? anchors.pgTop - 80 :
    lerp(anchors.pgTop - 80, anchors.scrollDeny, easeInOut4(segment(f, 900, 980)));

  const cur = cursorAt(anchors, f);
  const glowInput = f >= 360 && f < 480;
  const glowDeny = f >= 980 && f < 1260;

  const capTitle = cap1 ? "Load a suspicious skill" : cap2 ? "Run the free audit" : cap3 ? "Verdict: DENY" : "";
  const capSub = cap1
    ? "Airdrop scam: move USDC + hand over private key"
    : cap2
      ? "Same deterministic engine as CLI + API"
      : cap3
        ? "PI-001 fund transfer · SEC-001 private key — blocked with evidence"
        : "";
  const capStep = cap1 ? 1 : cap2 ? 2 : cap3 ? 3 : 0;

  const ripple1 = f >= 200 && f < 236;
  const ripple2 = f >= 560 && f < 596;
  const rippleAge = ripple1 ? f - 200 : ripple2 ? f - 560 : -1;

  await page.evaluate(
    ({ scrollY, cur, rippleAge, glowInput, glowDeny, progress, introOn, introFade, outroOn, capStep, capTitle, capSub, anchors, f }) => {
      window.scrollTo(0, scrollY);

      const card = document.getElementById("__demo_card");
      const caption = document.getElementById("__demo_caption");
      const cursor = document.getElementById("__demo_cursor");
      const glow = document.getElementById("__demo_glowbox");

      cursor.style.left = cur.x + "px";
      cursor.style.top = cur.y + "px";

      document.getElementById("__demo_progress").style.width = progress + "%";

      document.querySelectorAll(".__demo_ripple_static").forEach((n) => n.remove());

      if (introOn || introFade) {
        card.classList.add("show");
        card.querySelector(".badge").textContent = "Phylax v0.2.3";
        card.querySelector(".t").textContent = "Try it before\nyou install it";
        card.querySelector(".s").textContent =
          "Paste any SKILL.md → ALLOW / WARN / DENY with cited evidence. Free in your browser.";
        card.style.opacity = introFade ? String(1 - (f - 150) / 30) : "1";
      } else if (outroOn) {
        card.classList.add("show");
        card.style.opacity = f >= 1410 ? String(Math.max(0, 1 - (f - 1410) / 30)) : "1";
        card.querySelector(".badge").textContent = "Free · No wallet";
        card.querySelector(".t").textContent = "usephylax.com/#playground";
        card.querySelector(".s").textContent = "Deterministic security for agent skills on Base";
      } else {
        card.classList.remove("show");
        card.style.opacity = "1";
      }

      if (capStep) {
        caption.classList.add("show");
        document.getElementById("__demo_step").textContent = `STEP ${capStep}/3`;
        document.getElementById("__demo_title").textContent = capTitle;
        document.getElementById("__demo_sub").textContent = capSub;
      } else {
        caption.classList.remove("show");
      }

      let glowBox = null;
      if (glowInput && anchors.input?.box) glowBox = anchors.input.box;
      if (glowDeny && anchors.deny?.box) glowBox = anchors.deny.box;
      if (glowBox) {
        glow.style.left = glowBox.x - 6 + "px";
        glow.style.top = glowBox.y - 6 + "px";
        glow.style.width = glowBox.width + 12 + "px";
        glow.style.height = glowBox.height + 12 + "px";
        glow.classList.add("show");
      } else {
        glow.classList.remove("show");
      }

      if (rippleAge >= 0) {
        const p = rippleAge / 36;
        const size = 14 + p * 58;
        const r = document.createElement("div");
        r.className = "__demo_ripple_static";
        r.style.cssText = `position:fixed;left:${cur.x}px;top:${cur.y}px;width:${size}px;height:${size}px;border-radius:999px;border:2px solid #48D8FF;transform:translate(-50%,-50%);opacity:${1 - p};z-index:2147483646;pointer-events:none;`;
        document.body.appendChild(r);
      }
    },
    {
      scrollY,
      cur,
      rippleAge,
      glowInput,
      glowDeny,
      progress,
      introOn,
      introFade,
      outroOn,
      capStep,
      capTitle,
      capSub,
      anchors,
      f,
    },
  );
}

function exportVideo(frameCount) {
  const mp4 = join(ASSETS, "phylax-playground-demo.mp4");
  const gif = join(ASSETS, "phylax-playground-demo.gif");
  const poster = join(ASSETS, "phylax-playground-demo-poster.png");

  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${join(FRAMES, "f%06d.jpg")}" -frames:v ${frameCount} ` +
      `-c:v libx264 -pix_fmt yuv420p -movflags +faststart -crf 14 -preset slow -profile:v high -level 4.2 ` +
      `"${mp4}"`,
    { stdio: "inherit" },
  );
  execSync(`ffmpeg -y -ss 14 -i "${mp4}" -vframes 1 "${poster}"`, { stdio: "pipe" });
  execSync(
    `ffmpeg -y -i "${mp4}" -vf "fps=24,scale=1280:-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=160[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3" "${gif}"`,
    { stdio: "inherit" },
  );
  console.log("exported:", mp4);
}

async function main() {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(FRAMES, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ["--force-color-profile=srgb", "--hide-scrollbars", "--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1,
    colorScheme: "dark",
  });

  const anchors = await prepareScene(page);
  console.log(`rendering ${TOTAL_FRAMES} frames @ ${FPS}fps (${W}x${H}, ${DURATION_SEC}s)`);

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    await renderFrame(page, f, anchors);
    await page.screenshot({
      path: join(FRAMES, `f${String(f).padStart(6, "0")}.jpg`),
      type: "jpeg",
      quality: 93,
      animations: "disabled",
    });
    if (f % 120 === 0) console.log(`  frame ${f}/${TOTAL_FRAMES}`);
  }

  await browser.close();
  exportVideo(TOTAL_FRAMES);
}

main().catch((e) => { console.error(e); process.exit(1); });
