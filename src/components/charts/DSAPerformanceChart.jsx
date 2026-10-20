import { useMemo } from "react";
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
import { dsaProblems } from "../../data/dsa";
import { useDSAProgress } from "../../hooks/useDSAProgress";

function CustomPieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#0e0e0e]/95 border border-[#d4af37]/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1">
        <p className="text-white font-semibold font-mono border-b border-stone-800 pb-1">{d.name}</p>
        <p className="text-stone-300 font-mono flex items-center justify-between gap-4">
          <span>Solved Ratio:</span>
          <strong className="text-white">{d.solved} / {d.total} ({d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0}%)</strong>
        </p>
      </div>
    );
  }
  return null;
}

export default function DSAPerformanceChart({ topics: propTopics, progressState: propProgress }) {
  const hookData = useDSAProgress();
  const topics = propTopics || hookData.topics;
  const progressState = propProgress || hookData.progressState;

  const { difficultyData, totalSolved, topicMasteryData } = useMemo(() => {
    let easySolved = 0, easyTotal = 0;
    let medSolved = 0, medTotal = 0;
    let hardSolved = 0, hardTotal = 0;

    Object.entries(dsaProblems || {}).forEach(([slug, probs]) => {
      probs.forEach((prob) => {
        const isSolved = progressState?.problems?.[slug]?.[prob.id]?.status === "solved";
        if (prob.difficulty === "Easy") {
          easyTotal++;
          if (isSolved) easySolved++;
        } else if (prob.difficulty === "Medium") {
          medTotal++;
          if (isSolved) medSolved++;
        } else if (prob.difficulty === "Hard") {
          hardTotal++;
          if (isSolved) hardSolved++;
        }
      });
    });

    const solvedSum = easySolved + medSolved + hardSolved;

    const diffs = [
      {
        name: "Easy (Fundamentals)",
        value: solvedSum > 0 ? Math.max(5, Math.round((easySolved / solvedSum) * 100)) : 33,
        color: "#10b981",
        solved: easySolved,
        total: easyTotal,
      },
      {
        name: "Medium (Core Interview)",
        value: solvedSum > 0 ? Math.max(5, Math.round((medSolved / solvedSum) * 100)) : 33,
        color: "#d4af37",
        solved: medSolved,
        total: medTotal,
      },
      {
        name: "Hard (Tier-1 Distinguisher)",
        value: solvedSum > 0 ? Math.max(5, Math.round((hardSolved / solvedSum) * 100)) : 34,
        color: "#ef4444",
        solved: hardSolved,
        total: hardTotal,
      },
    ];

    const mastery = (topics || []).map((t) => ({
      topic: t.title.split("&")[0].trim().slice(0, 16),
      mastery: t.progress || 0,
      solved: t.solved || 0,
      total: t.problemCount || 0,
    }));

    return {
      difficultyData: diffs,
      totalSolved: solvedSum,
      topicMasteryData: mastery,
    };
  }, [topics, progressState]);

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
            <span className="text-xl font-bold font-mono text-white">{totalSolved}</span>
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
                        <p className="text-stone-400">{d.solved} / {d.total} problems solved</p>
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
