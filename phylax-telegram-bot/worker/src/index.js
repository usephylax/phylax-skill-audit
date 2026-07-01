/**
 * Phylax Telegram ingress — Cloudflare Worker
 *
 * Security model (fail-closed):
 * - TELEGRAM_WEBHOOK_SECRET required on every POST
 * - TELEGRAM_CHAT_ID allowlist (only your chat)
 * - CURSOR_API_KEY never touches this worker
 * - Forwards to agent bridge over HTTPS + shared secret
 */

const MAX_PROMPT_LEN = 4000;

export default {
  async fetch(request, env) {
    if (request.method === "GET") {
      return new Response("phylax telegram bot: ok", { status: 200 });
    }

    if (request.method !== "POST") {
      return new Response("method not allowed", { status: 405 });
    }

    // F4-style: fail closed — no secret configured = reject all
    if (
      !env.TELEGRAM_WEBHOOK_SECRET ||
      request.headers.get("x-telegram-bot-api-secret-token") !==
        env.TELEGRAM_WEBHOOK_SECRET
    ) {
      return new Response("forbidden", { status: 403 });
    }

    if (!env.AGENT_BRIDGE_SECRET || !env.AGENT_BRIDGE_URL) {
      return new Response("misconfigured", { status: 503 });
    }

    let update;
    try {
      update = await request.json();
    } catch {
      return new Response("bad request", { status: 400 });
    }

    const message = update?.message;
    const chatId = message?.chat?.id;
    const text = message?.text?.trim();

    if (!text || String(chatId) !== String(env.TELEGRAM_CHAT_ID)) {
      return new Response("ignored", { status: 200 });
    }

    // Only process explicit commands — prevents accidental triggers
    if (!text.startsWith("/ask ") && text !== "/status") {
      await sendTelegram(env, chatId, "Send /ask <prompt> to run the agent, or /status.");
      return new Response("ok", { status: 200 });
    }

    if (text === "/status") {
      await sendTelegram(env, chatId, "Phylax bot online. Ready for /ask commands.");
      return new Response("ok", { status: 200 });
    }

    const prompt = text.slice("/ask ".length).trim().slice(0, MAX_PROMPT_LEN);
    if (!prompt) {
      await sendTelegram(env, chatId, "Usage: /ask fix the MAN-002 false positive");
      return new Response("ok", { status: 200 });
    }

    await sendTelegram(env, chatId, "⏳ Agent running…");

    let reply;
    try {
      const bridgeRes = await fetch(`${env.AGENT_BRIDGE_URL.replace(/\/$/, "")}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.AGENT_BRIDGE_SECRET}`,
        },
        body: JSON.stringify({ prompt, chatId: String(chatId) }),
      });

      if (!bridgeRes.ok) {
        reply = `Bridge error (${bridgeRes.status}). Check agent server logs.`;
      } else {
        const data = await bridgeRes.json();
        reply = data.reply ?? data.error ?? "No response from agent.";
      }
    } catch (err) {
      reply = `Bridge unreachable: ${err?.message ?? "unknown"}`;
    }

    await sendTelegram(env, chatId, reply.slice(0, 4000));
    return new Response("ok", { status: 200 });
  },
};

async function sendTelegram(env, chatId, text) {
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
