/**
 * Phylax Telegram → Cursor Cloud Agent bridge
 *
 * Runs on VPS/localhost. Worker is the only public ingress.
 * CURSOR_API_KEY stays here — never on Cloudflare Worker.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Agent, CursorAgentError } from "@cursor/sdk";

const PORT = Number(process.env.PORT ?? 8788);
const API_KEY = process.env.CURSOR_API_KEY;
const BRIDGE_SECRET = process.env.AGENT_BRIDGE_SECRET;
const REPO = process.env.CURSOR_REPO ?? "https://github.com/usephylax/phylax-skill-audit";
const RATE_LIMIT = Number(process.env.RATE_LIMIT_PER_HOUR ?? 10);

if (!API_KEY || !BRIDGE_SECRET) {
  console.error("Missing CURSOR_API_KEY or AGENT_BRIDGE_SECRET");
  process.exit(1);
}

/** chatId → timestamps of recent runs */
const rateBuckets = new Map<string, number[]>();

function checkRateLimit(chatId: string): boolean {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const hits = (rateBuckets.get(chatId) ?? []).filter((t) => t > hourAgo);
  if (hits.length >= RATE_LIMIT) return false;
  hits.push(now);
  rateBuckets.set(chatId, hits);
  return true;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function runAgent(prompt: string): Promise<string> {
  const scopedPrompt = `[phylax-skill-audit only] ${prompt}\n\nConstraints: minimal diff, run tests, do not commit unless explicitly asked.`;

  try {
    const result = await Agent.prompt(scopedPrompt, {
      apiKey: API_KEY!,
      model: { id: "composer-2.5" },
      cloud: {
        repos: [{ url: REPO, startingRef: "main" }],
      },
    });

    if (result.status === "error") {
      return `Agent run failed (run id: ${result.id}). Check Cursor dashboard.`;
    }

    const text = result.result?.trim();
    return text || `Done (run id: ${result.id}). No text output.`;
  } catch (err) {
    if (err instanceof CursorAgentError) {
      return `Agent startup failed: ${err.message}`;
    }
    throw err;
  }
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    json(res, 200, { ok: true });
    return;
  }

  if (req.method !== "POST" || req.url !== "/run") {
    json(res, 404, { error: "not found" });
    return;
  }

  const auth = req.headers.authorization;
  if (auth !== `Bearer ${BRIDGE_SECRET}`) {
    json(res, 401, { error: "unauthorized" });
    return;
  }

  let body: { prompt?: string; chatId?: string };
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    json(res, 400, { error: "invalid json" });
    return;
  }

  const { prompt, chatId } = body;
  if (!prompt || typeof prompt !== "string" || prompt.length > 4000) {
    json(res, 400, { error: "invalid prompt" });
    return;
  }

  if (chatId && !checkRateLimit(chatId)) {
    json(res, 429, { error: "rate limit", reply: "Rate limit hit. Try again in an hour." });
    return;
  }

  try {
    const reply = await runAgent(prompt);
    json(res, 200, { reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    json(res, 500, { error: msg });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`phylax agent bridge listening on 127.0.0.1:${PORT}`);
});
