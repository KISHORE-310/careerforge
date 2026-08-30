import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { subject: "System Design", candidate: 95, benchmark: 80, fullMark: 100 },
  { subject: "DSA & Code", candidate: 88, benchmark: 75, fullMark: 100 },
  { subject: "STAR Storytelling", candidate: 92, benchmark: 70, fullMark: 100 },
  { subject: "ATS Alignment", candidate: 94, benchmark: 65, fullMark: 100 },
  { subject: "Cloud & K8s", candidate: 86, benchmark: 72, fullMark: 100 },
  { subject: "Scalability", candidate: 90, benchmark: 78, fullMark: 100 },
];

function CustomRadarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#0e0e0e]/95 border border-[#d4af37]/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1">
        <p className="text-white font-semibold font-mono border-b border-stone-800 pb-1">{d.subject}</p>
        <p className="text-[#f5d77f] font-mono flex items-center justify-between gap-4">
          <span>Candidate Score:</span>
          <strong>{d.candidate}%</strong>
        </p>
        <p className="text-stone-400 font-mono flex items-center justify-between gap-4 text-[11px]">
          <span>Industry Average:</span>
          <span>{d.benchmark}%</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function CompetencyRadarChart() {
  return (
    <div className="gold-card rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
            Competency Calibration
          </span>
          <h3 className="text-base font-serif-header text-white mt-1">
            6-Axis Candidate Radar
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-[#f5d77f] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#d4af37]" /> You
          </span>
          <span className="text-stone-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-stone-600" /> Avg
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#262626" />
            <PolarAngleAxis
              dataKey="subject"
              stroke="#a8a29e"
              tick={{ fill: "#d6d3d1", fontSize: 10, fontFamily: "monospace" }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              stroke="#444"
              tick={{ fill: "#666", fontSize: 9 }}
            />
            <Tooltip content={<CustomRadarTooltip />} />
            <Radar
              name="Candidate"
              dataKey="candidate"
              stroke="#d4af37"
              fill="#d4af37"
              fillOpacity={0.45}
            />
            <Radar
              name="Benchmark"
              dataKey="benchmark"
              stroke="#78716c"
              fill="#78716c"
              fillOpacity={0.15}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
