import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DSAPerformanceChart({ stats, topics }) {
  const data = (topics || []).map((topic) => ({ topic: topic.title, progress: topic.progress }));
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 apple-liquid-glass rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">Saved progress</span>
        <h3 className="text-base font-serif-header text-white">Practice Summary</h3>
        <div className="rounded-xl border border-stone-800 bg-black/30 p-5 text-center">
          <p className="text-4xl font-bold font-mono text-[#f5d77f]">{stats?.totalSolved || 0}</p>
          <p className="text-xs text-stone-400 mt-1">of {stats?.totalProblems || 0} curated problems solved</p>
          <p className="text-[11px] text-stone-500 mt-3">{stats?.progressPercent || 0}% complete · {stats?.solvedHours || 0} saved practice hours</p>
        </div>
      </div>
      <div className="lg:col-span-7 gold-card rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">Topic progress</span>
        <h3 className="text-base font-serif-header text-white">Curated DSA Catalog Completion</h3>
        <div className="h-60 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} /><XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: "#888", fontSize: 10 }} /><YAxis type="category" dataKey="topic" width={105} tick={{ fill: "#d6d3d1", fontSize: 10 }} /><Tooltip formatter={(value) => `${value}%`} /><Bar dataKey="progress" name="progress" fill="#d4af37" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  );
}
