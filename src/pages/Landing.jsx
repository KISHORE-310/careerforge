import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Briefcase,
  FileText,
  Mic,
  Cpu,
  TrendingUp,
  Award,
  CheckCircle2,
  Lock,
  ChevronRight,
  Star,
} from "lucide-react";

function Landing() {
  return (
    <div className="min-h-screen bg-[#080808] text-stone-100 flex flex-col justify-between selection:bg-[#d4af37] selection:text-black">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-xl border-b border-stone-900/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#8c701f] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-[#080808] rounded-[6px] flex items-center justify-center">
                <ShieldCheck size={16} className="text-[#d4af37]" />
              </div>
            </div>
            <div className="text-sm font-semibold tracking-tight text-white flex items-center gap-1">
              <span>Career</span>
              <span className="text-[#d4af37]">Forge</span>
              <span className="text-[9px] uppercase px-1 py-0.2 bg-[#d4af37]/20 text-[#f5d77f] rounded font-mono ml-1">AI</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs text-stone-400 hover:text-white px-3 py-1.5 transition"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#f5d77f] transition shadow-lg flex items-center gap-1"
            >
              Launch Platform
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24 max-w-6xl mx-auto text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-radial from-[#d4af37]/15 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-[#d4af37]/40 text-[#f5d77f] text-xs font-medium mb-6 shadow-xl">
          <Sparkles size={13} className="text-[#d4af37]" />
          <span>The Next-Generation AI Career Operating System</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif-header text-white tracking-tight leading-[1.15] max-w-4xl">
          Land Top-Tier Engineering Roles with <span className="gold-gradient-text">Precision Intelligence</span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-stone-300 max-w-2xl font-light leading-relaxed">
          From live ATS resume optimization and real-time System Design mock loops to market compensation benchmarking and structured 90-day learning roadmaps.
        </p>

        {/* CTA Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#d4af37] text-black text-sm font-bold hover:bg-[#f5d77f] transition shadow-2xl flex items-center justify-center gap-2"
          >
            Start Free Synthesis
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-sm font-medium hover:border-[#d4af37]/40 hover:text-white transition flex items-center justify-center"
          >
            View Live Command Center
          </Link>
        </div>

        {/* 3 Core Capability Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16 text-left w-full">
          <div className="apple-liquid-glass rounded-2xl p-6 border border-[#d4af37]/25 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#d4af37]">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white">ATS Resume Studio & Rewriter</h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              Real metric-driven bullet rewriter that converts vague claims into quantified accomplishments like <em className="text-stone-300">"Reduced p99 latency by 45%"</em>.
            </p>
          </div>

          <div className="apple-liquid-glass rounded-2xl p-6 border border-[#d4af37]/25 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#d4af37]">
              <Mic size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white">System Design & STAR Mock Lab</h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              Interactive conversational interview simulation calibrated for Stripe, Anthropic, and Tier-1 loops with live rubric scoring.
            </p>
          </div>

          <div className="apple-liquid-glass rounded-2xl p-6 border border-[#d4af37]/25 shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#d4af37]">
              <Briefcase size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white">Role Match & Application Kanban</h3>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              AI-driven job match engine evaluating stack compatibility, salary bands, and recruiter outreach generator.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 py-6 text-center text-xs text-stone-500 font-light">
        <p>CareerForge AI • Obsidian Gold Architecture • Production Build</p>
      </footer>
    </div>
  );
}

export default Landing;
