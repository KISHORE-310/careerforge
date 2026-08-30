import { useState, useMemo } from "react";
import { Flame, Calendar, Award, CheckCircle2, ChevronRight, Zap } from "lucide-react";

/**
 * Generates deterministic 52-week activity data for candidate trajectory
 */
function generateActivityData() {
  const data = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364); // 52 weeks ago

  let currentStreak = 0;
  let maxStreak = 0;
  let totalActive = 0;
  let totalContributions = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);

    // Realistic tech career prep activity pattern (active weekdays, high weekends, occasional rest)
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const seed = (i * 13 + (dayOfWeek * 7)) % 100;

    let count = 0;
    if (i > 300) {
      // Recent surge in last 2 months
      count = seed > 20 ? (seed % 6) + 1 : 0;
    } else if (i > 180) {
      count = seed > 35 ? (seed % 5) + 1 : 0;
    } else {
      count = seed > 45 ? (seed % 4) + 1 : 0;
    }

    // Map count to intensity level 0-4
    let level = 0;
    if (count === 0) level = 0;
    else if (count <= 2) level = 1;
    else if (count <= 4) level = 2;
    else if (count <= 6) level = 3;
    else level = 4;

    const dsa = Math.floor(count * 0.5);
    const mock = count > 2 ? 1 : 0;
    const apps = count > 3 ? count - dsa - mock : 0;

    if (count > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      totalActive++;
      totalContributions += count;
    } else {
      // If within last 3 days don't break active current streak
      if (365 - i > 3) {
        currentStreak = 0;
      }
    }

    data.push({
      date: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      monthName: d.toLocaleDateString("en-US", { month: "short" }),
      count,
      level,
      dsa,
      mock,
      apps,
    });
  }

  return {
    days: data,
    stats: {
      currentStreak: 16,
      longestStreak: 42,
      totalActiveDays: totalActive,
      totalActivities: totalContributions,
      completionRate: "94%",
    },
  };
}

export default function ActivityHeatmap({ title = "Career Execution & Practice Heatmap", subtitle = "52-week activity timeline tracking DSA submissions, mock interview loops, and ATS iterations." }) {
  const [filter, setFilter] = useState("all");
  const [hoveredDay, setHoveredDay] = useState(null);

  const { days, stats } = useMemo(() => generateActivityData(), []);

  // Split days into 52 weeks (7 days each)
  const weeks = useMemo(() => {
    const w = [];
    for (let i = 0; i < days.length; i += 7) {
      w.push(days.slice(i, i + 7));
    }
    return w;
  }, [days]);

  // Month labels for column placement
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = "";
    weeks.forEach((week, wIdx) => {
      const firstDay = week[0];
      if (firstDay && firstDay.monthName !== lastMonth) {
        labels.push({ month: firstDay.monthName, colIndex: wIdx });
        lastMonth = firstDay.monthName;
      }
    });
    return labels;
  }, [weeks]);

  const getColorClass = (level) => {
    switch (level) {
      case 1:
        return "bg-[#3d2e05] border-[#594308]";
      case 2:
        return "bg-[#806516] border-[#a1811d]";
      case 3:
        return "bg-[#d4af37] border-[#ecd06c]";
      case 4:
        return "bg-[#fef08a] border-[#fffbeb] shadow-sm shadow-[#d4af37]/40";
      case 0:
      default:
        return "bg-[#141414] border-stone-800/80";
    }
  };

  return (
    <div className="apple-liquid-glass rounded-2xl p-5 sm:p-6 border border-[#d4af37]/30 shadow-2xl space-y-5">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
              Consistency Index
            </span>
            <span className="text-xs text-stone-400 font-mono">Last 365 Days</span>
          </div>
          <h3 className="text-base sm:text-lg font-serif-header text-white mt-1">
            {title}
          </h3>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-stone-900/90 border border-stone-800 rounded-xl p-1 self-start md:self-auto">
          {[
            { id: "all", label: "All Velocity" },
            { id: "dsa", label: "DSA Labs" },
            { id: "mock", label: "Mock Loops" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filter === tab.id
                  ? "bg-[#d4af37] text-black font-semibold shadow-sm"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-black/60 border border-stone-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 text-[#f5d77f] flex items-center justify-center font-bold">
            <Flame size={16} />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 font-mono block">Current Streak</span>
            <span className="text-sm font-bold text-white font-mono">{stats.currentStreak} Days</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-stone-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center font-bold">
            <Award size={16} />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 font-mono block">Longest Streak</span>
            <span className="text-sm font-bold text-white font-mono">{stats.longestStreak} Days</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-stone-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-[#d4af37] flex items-center justify-center font-bold">
            <Calendar size={16} />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 font-mono block">Active Practice Days</span>
            <span className="text-sm font-bold text-white font-mono">{stats.totalActiveDays} / 365</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/60 border border-stone-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-300 flex items-center justify-center font-bold">
            <Zap size={16} />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 font-mono block">Total Milestones</span>
            <span className="text-sm font-bold text-[#f5d77f] font-mono">{stats.totalActivities} Tasks</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Stage */}
      <div className="pt-2 overflow-x-auto pb-2 no-scrollbar">
        <div className="min-w-[760px]">
          {/* Month Labels Bar */}
          <div className="flex text-[10px] text-stone-500 font-mono mb-2 pl-7 relative h-4">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                style={{ left: `${(m.colIndex / 52) * 100}%` }}
                className="absolute"
              >
                {m.month}
              </span>
            ))}
          </div>

          <div className="flex gap-1.5">
            {/* Day of Week Labels */}
            <div className="flex flex-col justify-between text-[9px] font-mono text-stone-600 pr-2 py-0.5 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* 52 Columns */}
            <div className="flex gap-[3.5px] flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3.5px]">
                  {week.map((day, dIdx) => {
                    const effectiveLevel =
                      filter === "dsa"
                        ? day.dsa > 0
                          ? Math.min(4, day.dsa + 1)
                          : 0
                        : filter === "mock"
                        ? day.mock > 0
                          ? 3
                          : 0
                        : day.level;

                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-[11px] h-[11px] rounded-[2.5px] border cursor-pointer transition-all duration-150 hover:scale-125 hover:z-20 ${getColorClass(
                          effectiveLevel
                        )}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend & Hover Inspect */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4 pt-3 border-t border-stone-800/80 text-xs">
            <div className="text-[11px] text-stone-400 font-mono flex items-center gap-2">
              {hoveredDay ? (
                <span className="text-stone-200">
                  <strong className="text-[#f5d77f] font-semibold">{hoveredDay.date}</strong>:{" "}
                  {hoveredDay.count === 0
                    ? "No prep sessions logged"
                    : `${hoveredDay.count} activities (${hoveredDay.dsa} DSA, ${hoveredDay.mock} Mocks, ${hoveredDay.apps} Apps)`}
                </span>
              ) : (
                <span className="text-stone-500">Hover over any day tile for granular activity breakdown</span>
              )}
            </div>

            {/* Intensity Legend */}
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono">
              <span>Less</span>
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#141414] border border-stone-800" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#3d2e05] border border-[#594308]" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#806516] border border-[#a1811d]" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#d4af37] border border-[#ecd06c]" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#fef08a] border border-[#fffbeb]" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
