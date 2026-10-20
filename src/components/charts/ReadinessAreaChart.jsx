export default function ReadinessAreaChart({ currentScore = 0, history = [] }) {
  const points = history.filter((item) => Number.isFinite(item?.score));
  const values = points.map((item) => item.score);
  const min = Math.max(0, Math.min(...values, currentScore) - 8);
  const max = Math.min(100, Math.max(...values, currentScore) + 8);
  const range = Math.max(1, max - min);
  const position = (score) => 92 - ((score - min) / range) * 76;
  const horizontal = (index) => points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
  const plot = points.map((item, index) => `${horizontal(index)},${position(item.score)}`).join(" ");
  return <div className="apple-liquid-glass rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><div className="flex items-center gap-2"><span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">Readiness history</span><span className="text-xs text-stone-400 font-mono">Daily saved snapshots</span></div><h3 className="text-base sm:text-lg font-serif-header text-white mt-1">Career Readiness Trend</h3></div><span className="text-[11px] font-mono text-[#f5d77f]">Current {currentScore}/100</span></div>
    {points.length >= 2 ? <div className="h-64 rounded-xl border border-stone-800 bg-black/20 p-4"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-[calc(100%-24px)] w-full" aria-label="Career readiness trend chart" role="img"><line x1="0" x2="100" y1="92" y2="92" stroke="#44403c" strokeWidth="0.6" /><polyline points={plot} fill="none" stroke="#d4af37" strokeWidth="2" vectorEffect="non-scaling-stroke" />{points.map((item, index) => <circle key={item.date} cx={horizontal(index)} cy={position(item.score)} r="1.7" fill="#f5d77f"><title>{`${item.date}: ${item.score}/100`}</title></circle>)}</svg><div className="mt-2 flex justify-between text-[10px] font-mono text-stone-500"><span>{points[0].date}</span><span>{points.at(-1).date}</span></div></div> : <div className="h-64 w-full grid place-items-center rounded-xl border border-dashed border-stone-800 bg-black/20 p-6 text-center"><div><p className="text-5xl font-mono font-bold text-[#f5d77f]">{currentScore}/100</p><p className="mt-3 max-w-sm text-xs leading-relaxed text-stone-400">Your first daily readiness snapshot has been saved. Return on another day to see a real trend.</p></div></div>}
  </div>;
}
