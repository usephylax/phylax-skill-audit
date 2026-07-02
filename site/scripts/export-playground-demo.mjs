// Re-encode existing frames in site/.demo-out/frames-60/ to MP4/GIF.
import { execSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const FRAMES = join(ROOT, ".demo-out", "frames-60");
const ASSETS = new URL("../../assets/", import.meta.url).pathname;
const FPS = 60;
const W = 1920;
const H = 1080;

if (!existsSync(FRAMES)) {
  console.error("No frames found. Run record-playground-demo.mjs first.");
  process.exit(1);
}

const count = readdirSync(FRAMES).filter((f) => f.endsWith(".jpg")).length;
const mp4 = join(ASSETS, "phylax-playground-demo.mp4");
const gif = join(ASSETS, "phylax-playground-demo.gif");
const poster = join(ASSETS, "phylax-playground-demo-poster.png");

execSync(
  `ffmpeg -y -framerate ${FPS} -i "${join(FRAMES, "f%06d.jpg")}" -frames:v ${count} ` +
    `-c:v libx264 -pix_fmt yuv420p -movflags +faststart -crf 15 -preset slow ` +
    `-vf "scale=${W}:${H}:flags=lanczos" "${mp4}"`,
  { stdio: "inherit" },
);
execSync(`ffmpeg -y -ss 19 -i "${mp4}" -vframes 1 "${poster}"`, { stdio: "pipe" });
execSync(
  `ffmpeg -y -i "${mp4}" -vf "fps=20,scale=1280:-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3" "${gif}"`,
  { stdio: "inherit" },
);
console.log(`done — ${count} frames → ${mp4}`);
