import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const skillTrends = [
  { skill: "Kafka & Flink", growth: 42, premium: "+22%", category: "Streaming" },
  { skill: "Rust Systems", growth: 38, premium: "+25%", category: "Languages" },
  { skill: "Distributed AI Infra", growth: 48, premium: "+30%", category: "AI/ML" },
  { skill: "Kubernetes & Istio", growth: 31, premium: "+18%", category: "DevOps" },
  { skill: "GraphQL & gRPC", growth: 26, premium: "+14%", category: "Backend" },
  { skill: "PostgreSQL & Raft", growth: 29, premium: "+16%", category: "Databases" },
];

function CustomSkillTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#0e0e0e]/95 border border-[#d4af37]/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1">
        <p className="text-white font-semibold font-mono border-b border-stone-800 pb-1">{d.skill}</p>
        <p className="text-emerald-400 font-mono flex items-center justify-between gap-4">
          <span>YoY Hiring Growth:</span>
          <strong>+{d.growth}%</strong>
        </p>
        <p className="text-[#f5d77f] font-mono flex items-center justify-between gap-4 text-[11px]">
          <span>Salary Premium:</span>
          <span>{d.premium}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function SkillDemandBarChart() {
  return (
    <div className="apple-liquid-glass rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
            Market Premium Index
          </span>
          <h3 className="text-base sm:text-lg font-serif-header text-white mt-1">
            Top Skill Demand & YoY Growth Rate (%)
          </h3>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={skillTrends}
            margin={{ top: 10, right: 30, left: 35, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
            <XAxis
              type="number"
              unit="%"
              stroke="#666"
              tickLine={false}
              tick={{ fill: "#888", fontSize: 11, fontFamily: "monospace" }}
            />
            <YAxis
              type="category"
              dataKey="skill"
              stroke="#666"
              tickLine={false}
              tick={{ fill: "#d6d3d1", fontSize: 11 }}
            />
            <Tooltip content={<CustomSkillTooltip />} />
            <Bar dataKey="growth" fill="#d4af37" radius={[0, 6, 6, 0]} barSize={20}>
              {skillTrends.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 2 ? "#fef08a" : index === 0 ? "#f5d77f" : "#d4af37"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
