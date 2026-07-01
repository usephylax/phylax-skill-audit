/**
 * VPS mode — Telegram long polling → local agent bridge.
 * No Cloudflare Worker or tunnel needed.
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const BRIDGE = process.env.AGENT_BRIDGE_SECRET;
const BRIDGE_URL = (process.env.AGENT_BRIDGE_URL ?? "http://127.0.0.1:8788").replace(/\/$/, "");

if (!TOKEN || !CHAT_ID || !BRIDGE) {
  console.error("Missing TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, or AGENT_BRIDGE_SECRET");
  process.exit(1);
}

let offset = 0;

async function tg(method: string, body?: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function send(chatId: number, text: string) {
  await tg("sendMessage", { chat_id: chatId, text: text.slice(0, 4000) });
}

async function askAgent(prompt: string, chatId: string): Promise<string> {
  const res = await fetch(`${BRIDGE_URL}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BRIDGE}`,
    },
    body: JSON.stringify({ prompt, chatId }),
  });
  const data = (await res.json()) as { reply?: string; error?: string };
  return data.reply ?? data.error ?? `Bridge error (${res.status})`;
}

async function handleMessage(chatId: number, text: string) {
  if (String(chatId) !== String(CHAT_ID)) return;

  if (text === "/status") {
    await send(chatId, "Phylax bot online (VPS polling mode). Send /ask <prompt>");
    return;
  }

  if (!text.startsWith("/ask ")) {
    await send(chatId, "Send /ask <prompt> or /status");
    return;
  }

  const prompt = text.slice("/ask ".length).trim();
  if (!prompt) {
    await send(chatId, "Usage: /ask run npm test");
    return;
  }

  await send(chatId, "⏳ Agent running…");
  const reply = await askAgent(prompt, String(chatId));
  await send(chatId, reply);
}

async function poll() {
  console.log("phylax telegram poll started (chat allowlist active)");
  while (true) {
    try {
      const data = (await tg("getUpdates", {
        offset,
        timeout: 30,
        allowed_updates: ["message"],
      })) as { ok?: boolean; result?: Array<{ update_id: number; message?: { chat: { id: number }; text?: string } }> };

      for (const u of data.result ?? []) {
        offset = u.update_id + 1;
        const msg = u.message;
        if (msg?.text) await handleMessage(msg.chat.id, msg.text.trim());
      }
    } catch (err) {
      console.error("poll error:", err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}

// Clear webhook so polling works
const wh = (await tg("deleteWebhook")) as { ok?: boolean };
console.log("deleteWebhook:", wh.ok ? "ok" : wh);
poll();
