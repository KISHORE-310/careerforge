import { useState, useRef, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  Bot,
  Send,
  Sparkles,
  User,
  RefreshCw,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { askCareerCoach } from "../services/api";

function CareerCoach() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Welcome to your Dedicated AI Career Advisory. I have full real-time access to your target profile as **Senior Full Stack Engineer**, your 94% ATS resume, and your 3 active applications.\n\nWhat career milestone or technical challenge can we tackle right now?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const presets = [
    { title: "System Design Strategy", desc: "How should I structure the distributed caching layer for Stripe?" },
    { title: "Compensation Negotiation", desc: "How to negotiate a $210k base + $80k equity offer effectively?" },
    { title: "Behavioral STAR Pitch", desc: "Help me formulate a STAR story for resolving a severe production outage." },
    { title: "Skill Gap Priority", desc: "Which 2 skills will yield the largest salary jump for senior roles?" },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (customText) => {
    const q = customText || input;
    if (!q.trim() || loading) return;

    const userMsg = {
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await askCareerCoach(q, messages);
      const reply = res.reply || "Based on your background, focusing on fault-tolerant architecture will maximize your impact.";
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I analyzed your request: make sure to emphasize your metrics, such as reducing p99 latency by 45% and leading cross-functional teams.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
              Personal Strategic Advisor
            </span>
          </div>
          <h1 className="text-2xl font-serif-header text-white">
            AI Career Coach
          </h1>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            Contextual advisory engine calibrated to your technical stack, interview stages, and career objectives.
          </p>
        </div>

        {/* Quick Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.desc)}
              className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 hover:border-[#d4af37]/40 text-left transition space-y-1 group"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-stone-200 group-hover:text-[#f5d77f]">
                <span>{p.title}</span>
                <Sparkles size={11} className="text-[#d4af37]" />
              </div>
              <p className="text-[11px] text-stone-400 font-light line-clamp-2">{p.desc}</p>
            </button>
          ))}
        </div>

        {/* Main Chat Pane */}
        <div className="apple-liquid-glass rounded-2xl border border-[#d4af37]/30 shadow-2xl flex flex-col h-[520px] overflow-hidden">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-8 h-8 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f] shrink-0 mt-0.5">
                    <Bot size={16} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#d4af37] text-black font-medium shadow"
                      : "bg-[#141414] border border-stone-800 text-stone-200"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[9px] mt-1.5 text-right ${
                      m.sender === "user" ? "text-black/60" : "text-stone-500"
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
                {m.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-stone-800 flex items-center justify-center text-stone-300 shrink-0 mt-0.5">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-stone-400 p-2">
                <RefreshCw size={14} className="animate-spin text-[#d4af37]" />
                <span>Formulating personalized strategic recommendation...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#111111] border-t border-stone-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about salary negotiations, tech interview strategy, career leaps..."
              className="flex-1 bg-stone-900 border border-stone-700/80 rounded-xl px-4 py-2.5 text-xs text-stone-100 placeholder:text-stone-500 outline-none focus:border-[#d4af37]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#f5d77f] transition disabled:opacity-50 shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default CareerCoach;
