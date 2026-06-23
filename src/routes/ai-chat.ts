import type { Context } from "hono";

const MODEL_NAME = "vercel:zai/glm-5.2";

const PERSONAS: Record<string, { name: string; emoji: string; system: string }> = {
  architect: {
    name: "DeepSeek Architect",
    emoji: "🏗️",
    system:
      "You are the DeepSeek Architect — a meticulous senior engineer and systems thinker. You specialize in code generation, HTML/CSS/JS logic, prompt structuring, and deep technical reasoning. You give precise, buildable, well-commented answers. You favor clean architecture and explain trade-offs briefly. Keep responses focused and actionable. Use code blocks for any code. Be the smartest, most reliable engineer in the room.",
  },
  designer: {
    name: "Muse Spark Designer",
    emoji: "🎨",
    system:
      "You are Muse Spark — a brilliant UI/UX and brand designer. You specialize in layout ideas, color palettes, creative hooks, visual formatting, and attention-grabbing but honest copy. You think in terms of user emotion, hierarchy, and aesthetic impact. Suggest concrete visual directions (colors, spacing, typography, section order). Be vivid, inspiring, and practical. Use short punchy lines and lists.",
  },
  marketer: {
    name: "Meta AI Marketer",
    emoji: "📈",
    system:
      "You are the Meta AI Marketer — a sharp, ethical growth and copywriting strategist. You specialize in persuasive (never hypey) copywriting, persona testing, distribution strategy, and positioning. You write headlines, CTAs, and social posts that convert without get-rich-quick language. You think about audience psychology and channels. Be concrete: give actual copy snippets, not theory. Keep it honest and high-converting.",
  },
};

function getToken(): string | null {
  return process.env.ZO_API_KEY || process.env.ZO_CLIENT_IDENTITY_TOKEN || null;
}

export default async (c: Context) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");

  if (c.req.method === "OPTIONS") return c.json({ ok: true });

  let body: { persona?: string; message?: string; history?: { role: string; content: string }[] };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const personaKey = (body.persona || "architect").toLowerCase();
  const persona = PERSONAS[personaKey] || PERSONAS.architect;
  const message = (body.message || "").toString().trim();

  if (!message) return c.json({ error: "Missing 'message'" }, 400);

  const token = getToken();
  if (!token) {
    return c.json({
      error: "live_ai_not_configured",
      message: "Live AI is not configured yet. The site owner needs to add ZO_API_KEY in Settings → Advanced.",
      persona: persona.name,
    }, 503);
  }

  const historyText = Array.isArray(body.history) && body.history.length > 0
    ? body.history.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n")
    : "";

  const input = `${persona.system}\n\n--- Conversation so far ---\n${historyText}\nUser: ${message}\nAssistant:`;

  try {
    const resp = await fetch("https://api.zo.computer/zo/ask", {
      method: "POST",
      headers: { authorization: token, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ input, model_name: MODEL_NAME }),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      return c.json({ error: "upstream_error", status: resp.status, detail: errText.slice(0, 300) }, 502);
    }

    const data = await resp.json();
    const output = typeof data.output === "string" ? data.output : JSON.stringify(data.output ?? "");

    return c.json({ persona: persona.name, emoji: persona.emoji, reply: output });
  } catch (err: any) {
    return c.json({ error: "request_failed", detail: String(err?.message || err) }, 500);
  }
};
