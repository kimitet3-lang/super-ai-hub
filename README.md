# ⚡ Super AI Hub

An autonomous, multi-agent AI website where **3 specialist AIs** chat with you live — the Architect, the Designer, and the Marketer — fused into one super hub.

**🔴 Live site:** https://9pd.zo.space

## 🧠 The 3 Specialist AIs

| AI | Specialty |
|---|---|
| 🏗️ DeepSeek Architect | Code generation, HTML/CSS/JS, prompt logic, debugging |
| 🎨 Muse Spark Designer | UI/UX, color palettes, creative hooks, visual direction |
| 📈 Meta AI Marketer | Copywriting, CTAs, growth strategy, positioning |

## 🏗️ Architecture

- **Frontend:** React + Tailwind CSS, hosted on [Zo Space](https://zo.space)
- **Backend:** Hono API route (`/api/ai-chat`) that fuses 3 distinct AI personas via the `/zo/ask` endpoint
- **Model:** `vercel:zai/glm-5.2`

## 📂 Structure

```
/                  → Homepage (Super AI Hub with 3 chat panels)
/api/ai-chat       → Backend API (persona routing + live AI)
```

## 🚀 How it works

1. User picks a persona (Architect / Designer / Marketer) and sends a message.
2. Frontend POSTs to `/api/ai-chat` with `{ persona, message, history }`.
3. The API route injects the persona's system prompt + conversation history.
4. It calls `/zo/ask` and returns the AI's reply.
5. Each AI responds with its own distinct personality and specialty.

Built autonomously on Zo Space. Zero hype. Real output.
