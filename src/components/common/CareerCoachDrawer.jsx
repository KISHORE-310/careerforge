import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, User, RefreshCw, ChevronRight } from "lucide-react";
import { askCareerCoach } from "../../services/api";

function CareerCoachDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello Kishore! I'm your CareerForge Strategic Coach. I have direct context on your target role as **Senior Full Stack Engineer**, your active applications at Stripe & Anthropic, and your skill roadmap.\n\nHow can I help you elevate your career today?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const quickPrompts = [
    "How can I tailor my resume for Stripe's backend role?",
    "What are my highest priority skill gaps to close?",
    "Give me 3 STAR behavioral interview questions",
    "How should I negotiate equity for a Senior role?",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const q = textToSend || input;
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
      const aiReply = res.reply || "I analyzed your request and recommend focusing on your core distributed systems metrics.";
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I experienced a temporary connection hiccup, but based on your profile: keep highlighting your 45ms latency reduction and system design capabilities.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-[#0e0e0e] border-l border-[#d4af37]/30 shadow-2xl h-full flex flex-col z-10 text-stone-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 bg-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#9e8334] flex items-center justify-center text-black font-bold">
              <Bot size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                AI Career Coach
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#d4af37]/20 text-[#f5d77f] font-mono">
                  ACTIVE
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">Context-Aware Advisory Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-[#141414] border-b border-stone-800/80 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:border-[#d4af37]/40 hover:text-[#f5d77f] transition flex items-center gap-1 shrink-0"
            >
              <Sparkles size={10} className="text-[#d4af37]" />
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "ai" && (
                <div className="w-7 h-7 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f] shrink-0 mt-0.5">
                  <Bot size={14} />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#d4af37] text-black font-medium"
                    : "bg-[#181818] border border-stone-800/90 text-stone-200"
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
                <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center text-stone-300 shrink-0 mt-0.5">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-stone-400 p-2">
              <RefreshCw size={14} className="animate-spin text-[#d4af37]" />
              <span>Analyzing career context and formulating strategy...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-stone-800 bg-[#121212]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for interview prep, roadmap guidance, resume tips..."
              className="flex-1 bg-stone-900 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder:text-stone-500 outline-none focus:border-[#d4af37]/60 font-light"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-[#d4af37] text-black font-semibold hover:bg-[#f5d77f] disabled:opacity-50 transition shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CareerCoachDrawer;
