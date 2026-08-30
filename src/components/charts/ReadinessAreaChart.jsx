import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", candidate: 64, target: 85, benchmark: 52 },
  { month: "Feb", candidate: 71, target: 85, benchmark: 54 },
  { month: "Mar", candidate: 76, target: 85, benchmark: 56 },
  { month: "Apr", candidate: 82, target: 90, benchmark: 58 },
  { month: "May", candidate: 87, target: 90, benchmark: 60 },
  { month: "Jun", candidate: 92, target: 95, benchmark: 62 },
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0e0e0e]/95 border border-[#d4af37]/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5">
        <p className="text-white font-semibold font-mono border-b border-stone-800 pb-1">{label} Readiness Velocity</p>
        <div className="space-y-1">
          <p className="text-[#f5d77f] font-mono flex items-center justify-between gap-4">
            <span>Candidate Score:</span>
            <strong>{payload[0]?.value}/100</strong>
          </p>
          <p className="text-stone-400 font-mono flex items-center justify-between gap-4 text-[11px]">
            <span>Tier-1 Target:</span>
            <span>{payload[1]?.value}/100</span>
          </p>
          <p className="text-stone-500 font-mono flex items-center justify-between gap-4 text-[10px]">
            <span>Market Baseline:</span>
            <span>{payload[2]?.value}/100</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export default function ReadinessAreaChart({ currentScore = 92 }) {
  return (
    <div className="apple-liquid-glass rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
              Velocity Trajectory
            </span>
            <span className="text-xs text-emerald-400 font-mono">+28 pts over 6 months</span>
          </div>
          <h3 className="text-base sm:text-lg font-serif-header text-white mt-1">
            Career Readiness Curve vs. Tier-1 Bar
          </h3>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-[#f5d77f]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
            <span>Candidate ({currentScore})</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-600" />
            <span>Tier-1 Bar (95)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#78716c" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#78716c" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#666"
              tickLine={false}
              tick={{ fill: "#888", fontSize: 11, fontFamily: "monospace" }}
            />
            <YAxis
              domain={[40, 100]}
              stroke="#666"
              tickLine={false}
              tick={{ fill: "#888", fontSize: 11, fontFamily: "monospace" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="candidate"
              stroke="#d4af37"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#goldGradient)"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#a8a29e"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#targetGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
