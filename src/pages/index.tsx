import { useState, useRef, useEffect } from "react";
import { Send, Copy, Check, Sparkles, Code2, Megaphone, Github, Zap } from "lucide-react";

// Super AI Hub — Homepage route (Zo Space)
// 3 specialist AIs: Architect, Designer, Marketer — live chat via /api/ai-chat

type Persona = {
  key: string; name: string; tagline: string; emoji: string;
  icon: typeof Code2; accent: string; accentSoft: string;
  placeholder: string; starter: string;
};

const PERSONAS: Persona[] = [
  {
    key: "architect", name: "DeepSeek Architect", tagline: "Code, logic & systems",
    emoji: "🏗️", icon: Code2, accent: "#38bdf8", accentSoft: "rgba(56,189,248,0.12)",
    placeholder: "Ask for code, HTML/CSS, prompt logic, debugging…",
    starter: "Build me a clean, mobile-first landing page skeleton with a hero, 3 feature cards, and a footer.",
  },
  {
    key: "designer", name: "Muse Spark Designer", tagline: "UI/UX, color & creative hooks",
    emoji: "🎨", icon: Sparkles, accent: "#f472b6", accentSoft: "rgba(244,114,182,0.12)",
    placeholder: "Ask for layouts, palettes, headlines, visual direction…",
    starter: "Give me a color palette and layout direction for a futuristic AI tools landing page.",
  },
  {
    key: "marketer", name: "Meta AI Marketer", tagline: "Copywriting & growth",
    emoji: "📈", icon: Megaphone, accent: "#34d399", accentSoft: "rgba(52,211,153,0.12)",
    placeholder: "Ask for headlines, CTAs, social posts, positioning…",
    starter: "Write 3 honest, high-converting headlines for an open-source AI prompt hub.",
  },
];

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
      const resp = await fetch("https://9pd.zo.space/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ persona: persona.key, message: content, history: messages }),
      });
      const data = await resp.json();
      if (data.reply) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      } else {
        const note = data.error === "live_ai_not_configured"
          ? "⚡ Live AI needs a key. Owner: add ZO_API_KEY in Settings → Advanced, then this Super AI goes fully live."
          : `⚠️ ${data.message || data.error || "Something went wrong. Try again."}`;
        setMessages((m) => [...m, { role: "assistant", content: note }]);
      }
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ Network error: ${e?.message || e}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, idx: number) {
    try { await navigator.clipboard.writeText(text); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1500); } catch {}
  }

  return (
    <div className="flex flex-col rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(20,22,30,0.6)", height: "560px" }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: persona.accentSoft }}>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: persona.accent }}>
          <Icon className="w-5 h-5 text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm flex items-center gap-2"><span>{persona.emoji}</span> {persona.name}</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{persona.tagline}</div>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: persona.accent, color: "#000" }}>LIVE</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">{persona.emoji}</div>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Chat with {persona.name}. Try:</p>
            <button onClick={() => send(persona.starter)}
              className="text-xs text-left px-3 py-2 rounded-lg border hover:opacity-80 transition"
              style={{ borderColor: persona.accent, color: "rgba(255,255,255,0.8)", background: persona.accentSoft }}>
              {persona.starter}
            </button>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="group max-w-[85%]">
              <div className="px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words"
                style={m.role === "user"
                  ? { background: persona.accent, color: "#000", borderBottomRightRadius: "4px" }
                  : { background: "rgba(255,255,255,0.06)", color: "#e5e7eb", borderBottomLeftRadius: "4px" }}>
                {m.content}
              </div>
              {m.role === "assistant" && (
                <button onClick={() => copy(m.content, i)}
                  className="mt-1 flex items-center gap-1 text-[10px] opacity-0 group-hover:opacity-100 transition"
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  {copiedIdx === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
          placeholder={persona.placeholder}
          className="flex-1 bg-transparent text-sm text-white px-3 py-2 rounded-lg outline-none border focus:opacity-100"
          style={{ borderColor: "rgba(255,255,255,0.12)", opacity: 0.9 }} />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}
          className="flex items-center justify-center w-10 h-10 rounded-lg transition disabled:opacity-40"
          style={{ background: persona.accent, color: "#000" }}>
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
        <div className="flex items-center gap-2 font-bold text-lg">
          <Zap className="w-5 h-5" style={{ color: "#38bdf8" }} /><span>Super AI Hub</span>
        </div>
        <a href="https://github.com/kimitet3-lang/super-ai-hub" target="_blank" rel="noreferrer"
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border transition hover:opacity-80"
          style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
          <Github className="w-4 h-4" /> GitHub
        </a>
      </nav>
      <header className="relative z-10 text-center px-6 pt-12 pb-10 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
          style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.25)" }}>
          <Sparkles className="w-3 h-3" /> Autonomous Multi-Agent AI · Live
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
          3 Specialist AIs.{" "}
          <span style={{ background: "linear-gradient(90deg,#38bdf8,#f472b6,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            One Super Hub.
          </span>
        </h1>
        <p className="text-base sm:text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
          Chat live with the Architect, the Designer, and the Marketer — three fused AI minds that build, design, and sell together. Zero hype. Real output.
        </p>
      </header>
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {PERSONAS.map((p, i) => {
            const Icon = p.icon; const isActive = i === active;
            return (
              <button key={p.key} onClick={() => setActive(i)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                style={{ background: isActive ? p.accent : "rgba(255,255,255,0.04)", color: isActive ? "#000" : "rgba(255,255,255,0.7)", border: `1px solid ${isActive ? p.accent : "rgba(255,255,255,0.1)"}` }}>
                <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{p.name}</span><span className="sm:hidden">{p.emoji}</span>
              </button>
            );
          })}
        </div>
        <div className="max-w-2xl mx-auto"><ChatPanel persona={PERSONAS[active]} /></div>
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-10">
          {[{ n: "3", l: "Specialist AIs" }, { n: "100%", l: "Open Source" }, { n: "0", l: "Hype Promises" }].map((s) => (
            <div key={s.l} className="text-center py-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-2xl font-black" style={{ color: "#38bdf8" }}>{s.n}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <footer className="relative z-10 text-center py-12 px-6 mt-16 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          © 2026 Super AI Hub · Built autonomously on Zo Space · Powered by fused multi-agent AI
        </p>
        <div className="flex justify-center gap-4 mt-3 text-xs">
          <a href="https://9pd.zo.space/api/ai-chat" target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>API</a>
          <a href="https://github.com/kimitet3-lang/super-ai-hub" target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>Source</a>
        </div>
      </footer>
    </div>
  );
}
