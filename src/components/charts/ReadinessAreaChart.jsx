export default function ReadinessAreaChart({ currentScore = 0 }) {
  return (
    <div className="apple-liquid-glass rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">Readiness Snapshot</span>
            <span className="text-xs text-stone-400 font-mono">Current calculated score</span>
          </div>
          <h3 className="text-base sm:text-lg font-serif-header text-white mt-1">Career Readiness</h3>
        </div>
        <span className="text-[11px] font-mono text-stone-500">History not yet available</span>
      </div>
      <div className="h-64 w-full grid place-items-center rounded-xl border border-dashed border-stone-800 bg-black/20 p-6 text-center">
        <div>
          <p className="text-5xl font-mono font-bold text-[#f5d77f]">{currentScore}/100</p>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-stone-400">CareerForge has a current readiness calculation, but does not yet persist dated score snapshots. A trend chart will appear after historical analytics are implemented.</p>
        </div>
      </div>
    </div>
  );
}
