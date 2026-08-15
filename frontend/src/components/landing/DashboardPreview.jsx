function DashboardPreview() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-[#d4af37]/20 bg-[#0e0e0e] shadow-[0_10px_35px_rgba(0,0,0,0.8)] p-6 space-y-5">
      {/* Header Metric */}
      <div className="flex justify-between items-center pb-4 border-b border-stone-800/80">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#d4af37]/80 font-light">
            Readiness Index
          </span>
          <p className="text-3xl font-light text-stone-100 mt-1">
            86<span className="text-base text-stone-500 font-light">/100</span>
          </p>
        </div>

        <div className="w-12 h-12 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/5 flex items-center justify-center text-[#d4af37] text-sm font-light">
          86%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-stone-400 font-light">
          <span>Target: Senior Backend</span>
          <span className="text-[#d4af37]">Ready</span>
        </div>
        <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden">
          <div className="bg-gradient-to-r from-[#9e8334] to-[#d4af37] h-1.5 rounded-full w-[86%]"></div>
        </div>
      </div>

      {/* Recommended Milestones */}
      <div className="rounded-xl bg-[#141414] border border-stone-800/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs tracking-wide text-stone-300 font-light">Current Milestones</span>
          <span className="text-[10px] text-[#d4af37] uppercase tracking-wider">Week 2</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-stone-300">
            <span className="font-light">SQL Schema & Indexing</span>
            <span className="text-emerald-400 text-[11px]">Completed</span>
          </div>

          <div className="flex items-center justify-between text-stone-300">
            <span className="font-light">Distributed Cache (Redis)</span>
            <span className="text-amber-400/90 text-[11px]">In Progress</span>
          </div>

          <div className="flex items-center justify-between text-stone-400">
            <span className="font-light">Containerize with Docker</span>
            <span className="text-stone-600 text-[11px]">Queued</span>
          </div>
        </div>
      </div>

      {/* Key Skill Tags */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase tracking-wider text-stone-500 font-light">
          Extracted Skills
        </span>
        <div className="flex flex-wrap gap-1.5">
          {["FastAPI", "PostgreSQL", "Docker", "AWS"].map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-1 rounded-md text-xs bg-[#171717] border border-[#d4af37]/20 text-stone-300 font-light"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPreview;