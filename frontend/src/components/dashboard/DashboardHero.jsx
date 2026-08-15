import {
  Sparkles,
  ArrowUpRight,
  BrainCircuit,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";

function DashboardHero({ data }) {
  const resumeScore = data?.resume_score?.resume_score ?? 74;
  const atsScore = data?.ats_score?.ats_score ?? 68;
  const readiness = data?.skill_gap?.readiness ?? 72;
  const role = data?.target_role || data?.ats_score?.target_role || "Backend Developer";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#0e0e0e] p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      {/* Subtle gold ambient backdrop */}
      <div className="absolute -top-16 -right-16 w-60 h-60 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid gap-6 lg:grid-cols-12 items-center">
        {/* Left Info */}
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5 px-3 py-1 text-xs text-[#d4af37] font-light tracking-wide">
            <Sparkles size={13} className="text-[#d4af37]" />
            <span>Profile Evaluation Active</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight">
              Target Discipline: <span className="text-[#d4af37] italic">{role}</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-400 max-w-xl font-light leading-relaxed">
              Upload your latest resume to regenerate ATS match rates, identify missing technical skills, 
              and follow a tailored 6-week curriculum.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-md">
            <div className="rounded-xl border border-stone-800/80 bg-[#141414] p-3">
              <span className="text-[11px] text-stone-500 font-light uppercase tracking-wider block">Resume Quality</span>
              <p className="mt-1 text-lg font-light text-stone-100">{resumeScore}<span className="text-xs text-stone-500 font-light">/100</span></p>
            </div>

            <div className="rounded-xl border border-stone-800/80 bg-[#141414] p-3">
              <span className="text-[11px] text-stone-500 font-light uppercase tracking-wider block">ATS Match</span>
              <p className="mt-1 text-lg font-light text-[#d4af37]">{atsScore}%</p>
            </div>

            <div className="rounded-xl border border-stone-800/80 bg-[#141414] p-3">
              <span className="text-[11px] text-stone-500 font-light uppercase tracking-wider block">Readiness</span>
              <p className="mt-1 text-lg font-light text-emerald-400">{readiness}%</p>
            </div>
          </div>
        </div>

        {/* Right Readiness Meter */}
        <div className="lg:col-span-4 rounded-xl border border-stone-800 bg-[#121212] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} className="text-[#d4af37]" />
              <span className="text-xs font-normal text-stone-200">Career Readiness</span>
            </div>
            <span className="text-sm font-light text-[#d4af37]">{readiness}%</span>
          </div>

          <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#9e8334] to-[#d4af37] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${readiness}%` }}
            ></div>
          </div>

          <div className="space-y-1.5 text-xs text-stone-400 font-light">
            <div className="flex items-center justify-between">
              <span>Goal</span>
              <span className="text-stone-300">{role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="text-[#d4af37]">Active Practice</span>
            </div>
          </div>

          <Link
            to="/roadmap"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 py-1.5 px-3 text-xs text-[#d4af37] hover:bg-[#d4af37]/20 transition"
          >
            <span>Review Full Roadmap</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DashboardHero;