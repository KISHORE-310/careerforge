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

const funnelData = [
  { stage: "Target Sourced", count: 24, rate: "100%", color: "#f5d77f" },
  { stage: "Applications Sent", count: 18, rate: "75%", color: "#e4c660" },
  { stage: "Recruiter Screen", count: 8, rate: "44%", color: "#d4af37" },
  { stage: "Technical Loop", count: 4, rate: "50%", color: "#b89628" },
  { stage: "Offers / Finals", count: 2, rate: "50%", color: "#806516" },
];

function CustomFunnelTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#0e0e0e]/95 border border-[#d4af37]/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1">
        <p className="text-white font-semibold font-mono border-b border-stone-800 pb-1">{d.stage}</p>
        <p className="text-[#f5d77f] font-mono flex items-center justify-between gap-4">
          <span>Candidate Volume:</span>
          <strong>{d.count} Roles</strong>
        </p>
        <p className="text-emerald-400 font-mono flex items-center justify-between gap-4 text-[11px]">
          <span>Throughput Rate:</span>
          <span>{d.rate}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function ApplicationFunnelChart() {
  return (
    <div className="apple-liquid-glass rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
            Pipeline Efficiency
          </span>
          <h3 className="text-base sm:text-lg font-serif-header text-white mt-1">
            Application Stage Conversion Funnel
          </h3>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            Stage-by-stage progression from cold target sourcing to final verified offers.
          </p>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={funnelData}
            margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
            <XAxis
              type="number"
              stroke="#666"
              tickLine={false}
              tick={{ fill: "#888", fontSize: 11, fontFamily: "monospace" }}
            />
            <YAxis
              type="category"
              dataKey="stage"
              stroke="#666"
              tickLine={false}
              tick={{ fill: "#d6d3d1", fontSize: 11 }}
            />
            <Tooltip content={<CustomFunnelTooltip />} />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={22}>
              {funnelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
