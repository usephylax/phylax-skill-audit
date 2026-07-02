// record-playground-demo.mjs — 1080p @ 60fps, no intro/outro. Clean product demo.
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

const easeOut4 = (t) => 1 - Math.pow(1 - t, 4);
const easeInOut4 = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.max(0, Math.min(1, t));
const seg = (f, a, b) => clamp01((f - a) / Math.max(1, b - a));

async function installOverlay(page) {
  await page.evaluate(() => {
    if (document.getElementById("__demo_layer")) return;
    const layer = document.createElement("div");
    layer.id = "__demo_layer";
    layer.innerHTML = `
      <style>
        #__demo_cursor { position:fixed;top:0;left:0;width:26px;height:26px;z-index:2147483647;
          pointer-events:none;transform:translate(-50%,-50%);filter:drop-shadow(0 3px 8px rgba(0,0,0,.55)); }
        .__demo_glow { position:fixed;z-index:2147483643;pointer-events:none;border-radius:14px;
          box-shadow:0 0 0 3px #48D8FF,0 0 28px 6px rgba(72,216,255,.4);opacity:0; }
        .__demo_glow.show { opacity:1; }
      </style>
      <div id="__demo_cursor"><svg width="26" height="26" viewBox="0 0 22 22" fill="none">
        <path d="M2 2 L2 17 L6 13 L9 20 L12 19 L9 12 L15 12 Z" fill="#fff" stroke="#070A0F" stroke-width="1.2" stroke-linejoin="round"/></svg></div>
      <div id="__demo_glowbox" class="__demo_glow"></div>
    `;
    document.body.appendChild(layer);
  });
}

async function getAnchors(page) {
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
    const box = (el) => (el ? { x: el.x, y: el.y, width: el.width, height: el.height } : null);
    return {
      sample: sample ? { x: sample.x + sample.width / 2, y: sample.y + sample.height / 2 } : null,
      run: run ? { x: run.x + run.width / 2, y: run.y + run.height / 2 } : null,
      input: input ? { x: input.x + input.width / 2, y: input.y + input.height / 2, box: box(input) } : null,
      deny: deny ? { x: deny.x + deny.width / 2, y: deny.y + deny.height / 2, box: box(deny) } : null,
      pgTop: pg ? pg.offsetTop : 0,
      scrollResult: pg && deny ? Math.max(0, pg.offsetTop + deny.top - 120) : 0,
    };
  });
}

function cursorAt(anchors, f) {
  const cx = W / 2;
  const cy = H / 2;
  const s = anchors.sample || { x: cx, y: cy };
  const r = anchors.run || { x: cx, y: cy };
  const i = anchors.input || { x: cx, y: cy };
  const d = anchors.deny || { x: cx, y: cy };

  if (f < 48) {
    const t = easeOut4(seg(f, 0, 48));
    return { x: lerp(cx, s.x, t), y: lerp(cy, s.y, t) };
  }
  if (f < 76) return { x: s.x, y: s.y };
  if (f < 120) {
    const t = easeOut4(seg(f, 76, 120));
    return { x: lerp(s.x, i.x, t), y: lerp(s.y, i.y, t) };
  }
  if (f < 180) return { x: i.x, y: i.y };
  if (f < 210) {
    const t = easeOut4(seg(f, 180, 210));
    return { x: lerp(i.x, r.x, t), y: lerp(i.y, r.y, t) };
  }
  if (f < 238) return { x: r.x, y: r.y };
  if (f < 380) {
    const t = easeOut4(seg(f, 238, 380));
    return { x: lerp(r.x, d.x, t), y: lerp(r.y, d.y, t) };
  }
  return { x: d.x, y: d.y };
}

async function paintFrame(page, f, anchors, { rippleAge = -1, glow = null } = {}) {
  const scrollY =
    f < 30 ? lerp(0, anchors.pgTop - 60, easeInOut4(seg(f, 0, 30))) :
    f < 238 ? anchors.pgTop - 60 :
    lerp(anchors.pgTop - 60, anchors.scrollResult, easeInOut4(seg(f, 238, 380)));

  const cur = cursorAt(anchors, f);

  await page.evaluate(({ scrollY, cur, rippleAge, glow, anchors }) => {
    window.scrollTo(0, scrollY);
    const cursor = document.getElementById("__demo_cursor");
    const glowEl = document.getElementById("__demo_glowbox");
    cursor.style.left = cur.x + "px";
    cursor.style.top = cur.y + "px";

    document.querySelectorAll(".__demo_ripple").forEach((n) => n.remove());
    if (rippleAge >= 0) {
      const p = rippleAge / 28;
      const size = 14 + p * 56;
      const rip = document.createElement("div");
      rip.className = "__demo_ripple";
      rip.style.cssText = `position:fixed;left:${cur.x}px;top:${cur.y}px;width:${size}px;height:${size}px;border-radius:999px;border:2px solid #48D8FF;transform:translate(-50%,-50%);opacity:${1 - p};z-index:2147483646;pointer-events:none;`;
      document.body.appendChild(rip);
    }

    glowEl.classList.remove("show");
    if (glow === "input" && anchors.input?.box) {
      const b = anchors.input.box;
      glowEl.style.left = b.x - 6 + "px";
      glowEl.style.top = b.y - 6 + "px";
      glowEl.style.width = b.width + 12 + "px";
      glowEl.style.height = b.height + 12 + "px";
      glowEl.classList.add("show");
    }
    if (glow === "deny" && anchors.deny?.box) {
      const b = anchors.deny.box;
      glowEl.style.left = b.x - 6 + "px";
      glowEl.style.top = b.y - 6 + "px";
      glowEl.style.width = b.width + 12 + "px";
      glowEl.style.height = b.height + 12 + "px";
      glowEl.classList.add("show");
    }
  }, { scrollY, cur, rippleAge, glow, anchors });
}

async function shot(page, f, anchors, opts) {
  await paintFrame(page, f, anchors, opts);
  await page.screenshot({
    path: join(FRAMES, `f${String(f).padStart(6, "0")}.jpg`),
    type: "jpeg",
    quality: 94,
    animations: "disabled",
  });
}

function exportVideo(frameCount) {
  const mp4 = join(ASSETS, "phylax-playground-demo.mp4");
  const gif = join(ASSETS, "phylax-playground-demo.gif");
  const poster = join(ASSETS, "phylax-playground-demo-poster.png");

  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${join(FRAMES, "f%06d.jpg")}" -frames:v ${frameCount} ` +
      `-c:v libx264 -pix_fmt yuv420p -movflags +faststart -crf 14 -preset slow -profile:v high -level 4.2 "${mp4}"`,
    { stdio: "inherit" },
  );
  execSync(`ffmpeg -y -ss 8 -i "${mp4}" -vframes 1 "${poster}"`, { stdio: "pipe" });
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
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, colorScheme: "dark" });

  await page.goto(`${BASE}/#playground`, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator("#pg-input").waitFor({ timeout: 20000 });
  await installOverlay(page);

  let anchors = await getAnchors(page);
  let frame = 0;

  // 0–0.8s: scroll in, cursor → Paste risky
  for (; frame < 48; frame++) await shot(page, frame, anchors, {});

  // click sample + ripple
  for (let r = 0; r < 28; r++) {
    await shot(page, frame, anchors, { rippleAge: r });
    frame++;
  }
  await page.locator("#playground button:has-text('Paste risky SKILL.md')").click();
  anchors = await getAnchors(page);

  // 1.1–2.5s: skill loaded, highlight input
  for (; frame < 150; frame++) await shot(page, frame, anchors, { glow: frame >= 100 ? "input" : null });

  // 2.5–3.5s: cursor → Run audit
  for (; frame < 210; frame++) await shot(page, frame, anchors, {});

  for (let r = 0; r < 28; r++) {
    await shot(page, frame, anchors, { rippleAge: r });
    frame++;
  }
  await page.locator("#playground button:has-text('Run audit')").click();
  await page.locator("#playground .verdict-deny").first().waitFor({ timeout: 30000 });
  anchors = await getAnchors(page);

  // 3.8–4.5s: scroll to verdict
  for (; frame < 380; frame++) await shot(page, frame, anchors, {});

  // 4.5–12s: hold DENY + findings
  const END = 720;
  for (; frame < END; frame++) {
    await shot(page, frame, anchors, { glow: frame >= 400 && frame < 640 ? "deny" : null });
  }

  await browser.close();
  console.log(`rendered ${END} frames @ ${FPS}fps (${(END / FPS).toFixed(1)}s)`);
  exportVideo(END);
}

main().catch((e) => { console.error(e); process.exit(1); });
