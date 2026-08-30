import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const locationData = {
  sf: [
    { level: "Mid-Level (L4)", base: 145, equity: 45, bonus: 20, total: 210 },
    { level: "Senior (L5)", base: 185, equity: 95, bonus: 35, total: 315 },
    { level: "Staff (L6)", base: 235, equity: 180, bonus: 55, total: 470 },
    { level: "Principal (L7)", base: 285, equity: 320, bonus: 85, total: 690 },
  ],
  nyc: [
    { level: "Mid-Level (L4)", base: 140, equity: 40, bonus: 20, total: 200 },
    { level: "Senior (L5)", base: 175, equity: 85, bonus: 35, total: 295 },
    { level: "Staff (L6)", base: 220, equity: 165, bonus: 50, total: 435 },
    { level: "Principal (L7)", base: 270, equity: 290, bonus: 80, total: 640 },
  ],
  remote: [
    { level: "Mid-Level (L4)", base: 135, equity: 35, bonus: 15, total: 185 },
    { level: "Senior (L5)", base: 170, equity: 75, bonus: 30, total: 275 },
    { level: "Staff (L6)", base: 210, equity: 150, bonus: 45, total: 405 },
    { level: "Principal (L7)", base: 255, equity: 260, bonus: 70, total: 585 },
  ],
};

function CustomSalaryTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc, curr) => acc + (curr.value || 0), 0);
    return (
      <div className="bg-[#0e0e0e]/95 border border-[#d4af37]/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[170px]">
        <p className="text-white font-semibold font-mono border-b border-stone-800 pb-1">{label}</p>
        <div className="space-y-1">
          <p className="text-[#f5d77f] font-mono flex items-center justify-between">
            <span>Base Salary:</span>
            <strong>${payload[0]?.value}k</strong>
          </p>
          <p className="text-stone-300 font-mono flex items-center justify-between">
            <span>Equity (RSUs/yr):</span>
            <strong>${payload[1]?.value}k</strong>
          </p>
          <p className="text-emerald-400 font-mono flex items-center justify-between">
            <span>Perf Bonus:</span>
            <strong>${payload[2]?.value}k</strong>
          </p>
          <div className="border-t border-stone-800 pt-1 flex items-center justify-between font-mono font-bold text-white">
            <span>Total Comp:</span>
            <span className="text-[#d4af37]">${total}k / yr</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function SalaryDistributionChart() {
  const [metro, setMetro] = useState("sf");

  return (
    <div className="apple-liquid-glass rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
              Total Comp (TC) Breakdown
            </span>
            <span className="text-xs text-stone-400 font-mono">Tier-1 Market Bands</span>
          </div>
          <h3 className="text-base sm:text-lg font-serif-header text-white mt-1">
            Compensation Packages by Seniority Band ($k / yr)
          </h3>
        </div>

        {/* Location Selector */}
        <div className="flex items-center bg-stone-900/90 border border-stone-800 rounded-xl p-1 self-start sm:self-auto">
          {[
            { id: "sf", label: "SF Bay Area" },
            { id: "nyc", label: "NYC" },
            { id: "remote", label: "US Remote" },
          ].map((loc) => (
            <button
              key={loc.id}
              onClick={() => setMetro(loc.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                metro === loc.id
                  ? "bg-[#d4af37] text-black font-semibold shadow-sm"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={locationData[metro]} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis
              dataKey="level"
              stroke="#666"
              tickLine={false}
              tick={{ fill: "#888", fontSize: 11, fontFamily: "monospace" }}
            />
            <YAxis
              stroke="#666"
              tickLine={false}
              unit="k"
              tick={{ fill: "#888", fontSize: 11, fontFamily: "monospace" }}
            />
            <Tooltip content={<CustomSalaryTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: "12px", fontSize: "11px", fontFamily: "monospace" }}
            />
            <Bar dataKey="base" name="Base Salary" stackId="a" fill="#d4af37" radius={[0, 0, 0, 0]} />
            <Bar dataKey="equity" name="Annual Equity (RSUs)" stackId="a" fill="#f5d77f" radius={[0, 0, 0, 0]} />
            <Bar dataKey="bonus" name="Target Bonus" stackId="a" fill="#a8a29e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
