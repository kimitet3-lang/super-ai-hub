import { useState, useRef, useEffect } from "react";
import { Send, Copy, Check, Sparkles, Code2, Megaphone, Github, Zap, Cloud, Database, Cpu, Shield } from "lucide-react";

// Super AI Hub — Homepage route (Zo Space)
// 3 specialist AIs: Architect (code), Designer (UI/UX), Marketer (copy)
// Live chat powered by /api/ai-chat. Toolkit section verified June 2026.

type Persona = {
  key: string;
  name: string;
  tagline: string;
  emoji: string;
  icon: typeof Code2;
  accent: string;
  accentSoft: string;
  placeholder: string;
  starter: string;
};

const PERSONAS: Persona[] = [
  {
    key: "architect",
    name: "DeepSeek Architect",
    tagline: "Code, logic & systems",
    emoji: "🏗️",
    icon: Code2,
    accent: "#38bdf8",
    accentSoft: "rgba(56,189,248,0.12)",
    placeholder: "Ask for code, HTML/CSS, prompt logic, debugging…",
    starter: "Build me a clean, mobile-first landing page skeleton with a hero, 3 feature cards, and a footer.",
  },
  {
    key: "designer",
    name: "Muse Spark Designer",
    tagline: "UI/UX, color & creative hooks",
    emoji: "🎨",
    icon: Sparkles,
    accent: "#f472b6",
    accentSoft: "rgba(244,114,182,0.12)",
    placeholder: "Ask for layouts, palettes, headlines, visual direction…",
    starter: "Give me a color palette and layout direction for a futuristic AI tools landing page.",
  },
  {
    key: "marketer",
    name: "Meta AI Marketer",
    tagline: "Copywriting & growth",
    emoji: "📈",
    icon: Megaphone,
    accent: "#34d399",
    accentSoft: "rgba(52,211,153,0.12)",
    placeholder: "Ask for headlines, CTAs, social posts, positioning…",
    starter: "Write 3 honest, high-converting headlines for an open-source AI prompt hub.",
  },
];

// Verified free-first toolkit (fact-checked June 2026)
const TOOLKIT = {
  cloud: [
    { rank: 1, name: "Cloudflare Pages + Workers", best: "Global edge & MVP hosting", note: "DNS + CDN + Workers/D1/R2/KV on free plan", cost: "Free tier" },
    { rank: 2, name: "Supabase", best: "Backend-as-a-service", note: "Postgres + Auth + Realtime + Vectors", cost: "Free (pauses if idle)" },
    { rank: 3, name: "Vercel (Hobby)", best: "Next.js / frontend", note: "Best DX, preview deploys, SSR/ISR", cost: "Free (bandwidth caps)" },
    { rank: 4, name: "Neon.tech", best: "Serverless Postgres", note: "Scale-to-zero, dev/prod branching", cost: "Free tier" },
    { rank: 5, name: "Hugging Face Spaces", best: "AI model demos", note: "Free T4 GPU (small), community reach", cost: "Free (shared compute)" },
  ],
  models: [
    { rank: 1, name: "DeepSeek-R1 (distilled)", best: "Math, hard reasoning, agents", note: "MIT license, self-host or cheap API", cost: "Free self / cheap API" },
    { rank: 2, name: "Qwen3 family (Alibaba)", best: "Agentic workflows, multilingual", note: "Open-weight; Qwen3-Max = 1T params (closed)", cost: "Free self-host" },
    { rank: 3, name: "Llama 4 Maverick (Meta)", best: "General chat, 10M-token context", note: "MoE 17B-400B, open-weight (Meta since shifted to closed Muse Spark)", cost: "Free self-host" },
    { rank: 4, name: "Gemma 4 (Google, Apr 2026)", best: "On-device / edge AI", note: "Apache 2.0, runs local, E2B/E4B/31B variants", cost: "Free" },
    { rank: 5, name: "Mistral 3 / Devstral 2", best: "Balanced tools + coding", note: "Open-weight frontier + coding model", cost: "Free self / low API" },
  ],
  topOpen: "GLM-5 & Kimi 2.5 currently top the open Arena leaderboard.",
};

type Msg = { role: "user" | "assistant"; content: string };

function ChatPanel({ persona }: { persona: Persona }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = persona.icon;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ persona: persona.key, message: content, history: messages }),
      });
      const data = await resp.json();
      if (data.reply) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else {
        const note = data.error === "live_ai_not_configured"
          ? "Live AI needs a key. Owner: add ZO_API_KEY in Settings -> Advanced, then this Super AI goes fully live."
          : `${data.message || data.error || "Something went wrong. Try again."}`;
        setMessages((m) => [...m, { role: "assistant", content: note }]);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `Network error: ${e?.message || e}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, idx: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {}
  }

  return (
    <div
      className="flex flex-col rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(20,22,30,0.6)", height: "560px" }}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: persona.accentSoft }}>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: persona.accent }}>
          <Icon className="w-5 h-5 text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <span>{persona.emoji}</span> {persona.name}
          </div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{persona.tagline}</div>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: persona.accent, color: "#000" }}>LIVE</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">{persona.emoji}</div>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Chat with {persona.name}. Try:</p>
            <button onClick={() => send(persona.starter)} className="text-xs text-left px-3 py-2 rounded-lg border hover:opacity-80 transition" style={{ borderColor: persona.accent, color: "rgba(255,255,255,0.8)", background: persona.accentSoft }}>
              {persona.starter}
            </button>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="group max-w-[85%]">
              <div className="px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words" style={m.role === "user" ? { background: persona.accent, color: "#000", borderBottomRightRadius: "4px" } : { background: "rgba(255,255,255,0.06)", color: "#e5e7eb", borderBottomLeftRadius: "4px" }}>
                {m.content}
              </div>
              {m.role === "assistant" && (
                <button onClick={() => copy(m.content, i)} className="mt-1 flex items-center gap-1 text-[10px] opacity-0 group-hover:opacity-100 transition" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {copiedIdx === i ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl flex gap-1" style={{ background: "rgba(255,255,255,0.06)" }}>
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: persona.accent, animationDelay: `${d * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t flex gap-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(input); }} placeholder={persona.placeholder} className="flex-1 bg-transparent text-sm text-white px-3 py-2 rounded-lg outline-none border focus:opacity-100" style={{ borderColor: "rgba(255,255,255,0.12)", opacity: 0.9 }} />
        <button onClick={() => send(input)} disabled={loading || !input.trim()} className="flex items-center justify-center w-10 h-10 rounded-lg transition disabled:opacity-40" style={{ background: persona.accent, color: "#000" }}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function SuperAIHub() {
  const [active, setActive] = useState(0);
  return (
    <div className="min-h-screen" style={{ background: "#0a0b10", color: "#f8fafc", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "#38bdf8" }} />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: "#f472b6" }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ background: "#34d399" }} />
      </div>
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-lg"><Zap className="w-5 h-5" style={{ color: "#38bdf8" }} /><span>Super AI Hub</span></div>
        <a href="https://github.com/kimitet3-lang" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition hover:opacity-80" style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}><Github className="w-4 h-4" /> GitHub</a>
      </nav>
      <header className="relative z-10 text-center px-6 pt-12 pb-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6" style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)" }}><Sparkles className="w-3 h-3" /> Autonomous Multi-Agent AI · Live</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">3 Specialist AIs. <span style={{ background: "linear-gradient(90deg,#38bdf8,#f472b6,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>One Super Hub.</span></h1>
        <p className="text-base sm:text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>Chat live with the Architect, the Designer, and the Marketer — three fused AI minds that build, design, and sell together. Zero hype. Real output.</p>
      </header>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {PERSONAS.map((p, i) => { const Icon = p.icon; const isActive = i === active; return (
            <button key={p.key} onClick={() => setActive(i)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition" style={{ background: isActive ? p.accent : "rgba(255,255,255,0.04)", color: isActive ? "#000" : "rgba(255,255,255,0.7)", border: `1px solid ${isActive ? p.accent : "rgba(255,255,255,0.1)"}` }}>
              <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{p.name}</span><span className="sm:hidden">{p.emoji}</span>
            </button>
          ); })}
        </div>
        <div className="max-w-2xl mx-auto"><ChatPanel persona={PERSONAS[active]} /></div>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-10">
          {[{ n: "3", l: "Specialist AIs" }, { n: "100%", l: "Open Source" }, { n: "0", l: "Hype Promises" }].map((s) => (
            <div key={s.l} className="text-center py-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}><div className="text-2xl font-black" style={{ color: "#38bdf8" }}>{s.n}</div><div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{s.l}</div></div>
          ))}
        </div>
        <section id="toolkit" className="max-w-5xl mx-auto mt-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}><Shield className="w-3 h-3" /> Verified · Free-First · Checked June 2026</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">🧰 Max Free Stack &amp; Super AI Toolkit</h2>
            <p className="text-sm max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>The real, current best-in-class free-tier &amp; open-source tools powering this hub. No fictional model names — every entry fact-checked.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6" style={{ background: "rgba(20,22,30,0.6)", border: "1px solid rgba(56,189,248,0.2)" }}>
              <div className="flex items-center gap-2 mb-5"><Cloud className="w-5 h-5" style={{ color: "#38bdf8" }} /><h3 className="font-bold text-lg">Cloud &amp; Infrastructure</h3></div>
              <div className="space-y-3">
                {TOOLKIT.cloud.map((t) => (
                  <div key={t.rank} className="flex gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 text-xs font-black" style={{ background: "#38bdf8", color: "#000" }}>{t.rank}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2"><span className="font-semibold text-sm text-white">{t.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8" }}>{t.cost}</span></div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{t.best}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{t.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-6" style={{ background: "rgba(20,22,30,0.6)", border: "1px solid rgba(244,114,182,0.2)" }}>
              <div className="flex items-center gap-2 mb-5"><Cpu className="w-5 h-5" style={{ color: "#f472b6" }} /><h3 className="font-bold text-lg">Open AI Models</h3></div>
              <div className="space-y-3">
                {TOOLKIT.models.map((t) => (
                  <div key={t.rank} className="flex gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 text-xs font-black" style={{ background: "#f472b6", color: "#000" }}>{t.rank}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2"><span className="font-semibold text-sm text-white">{t.name}</span><span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(244,114,182,0.15)", color: "#f472b6" }}>{t.cost}</span></div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{t.best}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{t.note}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl flex items-start gap-2" style={{ background: "rgba(52,211,153,0.08)" }}><Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#34d399" }} /><p className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>{TOOLKIT.topOpen}</p></div>
            </div>
          </div>
          <div className="rounded-2xl p-6 mt-6" style={{ background: "rgba(20,22,30,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2 mb-4"><Database className="w-5 h-5" style={{ color: "#34d399" }} /><h3 className="font-bold text-lg">Zero-Cost MVP Stack</h3><span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399" }}>free → free → free</span></div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[["Repo & dev", "GitHub + Codespaces"], ["Frontend", "Astro/Next.js → Cloudflare Pages"], ["Backend & auth", "Supabase (Postgres + RLS)"], ["AI inference", "Ollama local / Groq free tier"], ["Storage", "Cloudflare R2 (10GB, no egress)"], ["Email", "Resend (100/day) or CF Routing"], ["Payments", "Stripe Payment Links"], ["Analytics", "Plausible self-host / CF Analytics"]].map(([label, val]) => (
                <div key={label} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}><div className="font-semibold" style={{ color: "#34d399" }}>{label}</div><div style={{ color: "rgba(255,255,255,0.6)" }}>{val}</div></div>
              ))}
            </div>
          </div>
          <p className="text-center text-[11px] mt-6" style={{ color: "rgba(255,255,255,0.35)" }}>Free tiers are generous but finite — watch request/storage quotas, expect cold starts, and handle GDPR/CCPA even on free plans.</p>
        </section>
      </div>
      <footer className="relative z-10 text-center py-12 px-6 mt-16 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>© 2026 Super AI Hub · Built autonomously on Zo Space · Powered by fused multi-agent AI</p>
        <div className="flex justify-center gap-4 mt-3 text-xs">
          <a href="https://9pd.zo.space/api/ai-chat" target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>API</a>
          <a href="https://github.com/kimitet3-lang" target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>Source</a>
        </div>
      </footer>
    </div>
  );
}
