import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const difficultyData = [
  { name: "Easy (Fundamentals)", value: 42, color: "#10b981", solved: 18, total: 20 },
  { name: "Medium (Core Interview)", value: 48, color: "#d4af37", solved: 22, total: 35 },
  { name: "Hard (Tier-1 Distinguisher)", value: 10, color: "#ef4444", solved: 5, total: 15 },
];

const topicMasteryData = [
  { topic: "Arrays & Hash", mastery: 95, solved: 12 },
  { topic: "Two Pointers", mastery: 90, solved: 8 },
  { topic: "Sliding Window", mastery: 85, solved: 6 },
  { topic: "Trees & Graphs", mastery: 80, solved: 10 },
  { topic: "Dynamic Prog", mastery: 72, solved: 5 },
  { topic: "Heap / Priority", mastery: 78, solved: 4 },
];

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#0e0e0e]/95 border border-[#d4af37]/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1">
        <p className="text-white font-semibold font-mono border-b border-stone-800 pb-1">{d.name}</p>
        <p className="text-stone-300 font-mono flex items-center justify-between gap-4">
          <span>Solved Ratio:</span>
          <strong className="text-white">{d.solved} / {d.total} ({Math.round((d.solved/d.total)*100)}%)</strong>
        </p>
      </div>
    );
  }
  return null;
}

export default function DSAPerformanceChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Difficulty Breakdown (5 cols) */}
      <div className="lg:col-span-5 apple-liquid-glass rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
            Difficulty Distribution
          </span>
          <h3 className="text-base font-serif-header text-white mt-1">
            Problem Tier Breakdown
          </h3>
        </div>

        <div className="h-48 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#080808" strokeWidth={2} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center pointer-events-none">
            <span className="text-xl font-bold font-mono text-white">45</span>
            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-mono">Solved</span>
          </div>
        </div>

        <div className="space-y-2 pt-1 border-t border-stone-800 text-xs">
          {difficultyData.map((d, idx) => (
            <div key={idx} className="flex items-center justify-between text-stone-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name.split(" ")[0]}</span>
              </div>
              <span className="font-mono text-stone-400">{d.solved} / {d.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Mastery Breakdown (7 cols) */}
      <div className="lg:col-span-7 gold-card rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
            Algorithmic Depth
          </span>
          <h3 className="text-base font-serif-header text-white mt-1">
            Pattern Mastery Progress (%)
          </h3>
        </div>

        <div className="h-60 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topicMasteryData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 35, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                stroke="#666"
                tickLine={false}
                tick={{ fill: "#888", fontSize: 10, fontFamily: "monospace" }}
              />
              <YAxis
                type="category"
                dataKey="topic"
                stroke="#666"
                tickLine={false}
                tick={{ fill: "#d6d3d1", fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#0e0e0e]/95 border border-[#d4af37]/40 rounded-xl p-2.5 shadow-2xl text-xs space-y-1 font-mono">
                        <p className="text-white font-semibold">{d.topic}</p>
                        <p className="text-[#f5d77f]">Mastery: {d.mastery}%</p>
                        <p className="text-stone-400">{d.solved} problems solved</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="mastery" fill="#d4af37" radius={[0, 6, 6, 0]} barSize={16}>
                {topicMasteryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.mastery >= 90 ? "#fef08a" : entry.mastery >= 80 ? "#d4af37" : "#a1811d"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
