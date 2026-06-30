// api/badge.ts — SVG verdict badge for embedding (shields.io-style).
//
// GET /api/badge?skill=<owner/repo|url>[&mode=fast|deep]
//   → image/svg+xml  "phylax | ALLOW 97"  (color-coded)
//
// Embed:  <img src="https://usephylax.com/api/badge?skill=owner/repo" alt="Phylax verdict" />

import { audit } from "phylax-skill-audit";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clientIp, rateLimited, resolveSkillUrl, cacheGet, cacheSet } from "./_lib.js";

const COLORS: Record<string, string> = {
  ALLOW: "#3ddc97", WARN: "#f5c451", DENY: "#ff6b6b", ERROR: "#5a6072",
};

// approximate text width for DejaVu/Verdana-ish at 11px
function tw(s: string) { return s.length * 6.6 + 12; }

function badgeSVG(label: string, value: string, valueColor: string): string {
  const lw = tw(label), vw = tw(value), W = lw + vw, H = 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W.toFixed(0)}" height="${H}" role="img" aria-label="${label}: ${value}">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${W.toFixed(0)}" height="${H}" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw.toFixed(0)}" height="${H}" fill="#0E0E14"/>
    <rect x="${lw.toFixed(0)}" width="${vw.toFixed(0)}" height="${H}" fill="${valueColor}"/>
    <rect width="${W.toFixed(0)}" height="${H}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,Geneva,sans-serif" font-size="11">
    <text x="${(lw/2).toFixed(0)}" y="14" fill="#48D8FF">${label}</text>
    <text x="${(lw + vw/2).toFixed(0)}" y="14" fill="#0a0a0a" fill-opacity=".25">${value}</text>
    <text x="${(lw + vw/2).toFixed(0)}" y="13">${value}</text>
  </g>
</svg>`;
}

function send(res: VercelResponse, svg: string, cacheSeconds: number) {
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(svg);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const skill = typeof req.query.skill === "string" ? req.query.skill : undefined;
  if (!skill) {
    send(res, badgeSVG("phylax", "no skill", COLORS.ERROR), 60);
    return;
  }

  const rl = rateLimited(clientIp(req));
  if (rl.limited) { send(res, badgeSVG("phylax", "rate limit", COLORS.ERROR), 30); return; }

  const mode = req.query.mode === "deep" ? "deep" : "fast";
  const cacheKey = `${skill}::${mode}`;
  try {
    let result = cacheGet(cacheKey) as { verdict: string; score: number } | null;
    if (!result) {
      const url = resolveSkillUrl(skill);
      result = (await audit({ skill_source: url, mode })) as { verdict: string; score: number };
      cacheSet(cacheKey, result);
    }
    const color = COLORS[result.verdict] || COLORS.ERROR;
    send(res, badgeSVG("phylax", `${result.verdict} ${result.score}`, color), 21600); // 6h CDN cache
  } catch {
    send(res, badgeSVG("phylax", "error", COLORS.ERROR), 60);
  }
}
