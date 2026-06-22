// prerender.js — Static-site generation step.
// Renders the React app to HTML at build time and injects it into the
// client template, so the served page has real content for SEO / crawlers
// while still hydrating into a full SPA on the client.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const template = readFileSync(resolve(__dirname, "dist/client/index.html"), "utf-8");

// Import the server bundle produced by `vite build --ssr`.
const { render } = await import(
  pathToFileURL(resolve(__dirname, "dist/server/entry-server.js")).href
);

const appHtml = render();
const html = template.replace("<!--app-html-->", appHtml);

writeFileSync(resolve(__dirname, "dist/client/index.html"), html);

console.log("✓ Prerendered dist/client/index.html");
