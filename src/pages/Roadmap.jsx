import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  MapPin,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Award,
} from "lucide-react";
import { getRoadmap, updateRoadmap } from "../services/api";

function Roadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await getRoadmap();
      if (res.success) {
        setRoadmap(res.roadmap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (phaseIdx, taskIdx) => {
    const updated = [...roadmap];
    const task = updated[phaseIdx].tasks[taskIdx];
    task.completed = !task.completed;

    // recalculate phase progress
    const totalTasks = updated[phaseIdx].tasks.length;
    const completedTasks = updated[phaseIdx].tasks.filter((t) => t.completed).length;
    updated[phaseIdx].progress = Math.round((completedTasks / totalTasks) * 100);

    setRoadmap(updated);
    try {
      await updateRoadmap(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
                Strategic Career Trajectory
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              90-Day Career Roadmap
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Structured sprint milestones to achieve Senior/Staff readiness and pass Tier-1 technical loops.
            </p>
          </div>
        </div>

        {/* 30/60/90 Day Phase Cards */}
        <div className="space-y-6">
          {roadmap.map((phase, pIdx) => (
            <div
              key={pIdx}
              className="apple-liquid-glass rounded-2xl p-6 border border-[#d4af37]/25 shadow-2xl space-y-4"
            >
              {/* Phase Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 border border-[#d4af37]/40 flex items-center justify-center font-bold text-sm text-[#f5d77f] font-mono">
                    0{pIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-serif-header text-white">{phase.phase}</h3>
                    <p className="text-xs text-[#d4af37] font-medium">{phase.duration}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3 w-full sm:w-48">
                  <div className="flex-1 bg-stone-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#d4af37] to-[#f5d77f] h-full transition-all duration-300"
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-white">{phase.progress}%</span>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-2.5 pt-1">
                {phase.tasks?.map((t, tIdx) => (
                  <div
                    key={tIdx}
                    onClick={() => handleToggleTask(pIdx, tIdx)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                      t.completed
                        ? "bg-stone-900/30 border-stone-800/60 text-stone-500 line-through"
                        : "bg-stone-900/70 border-stone-800 text-stone-200 hover:border-[#d4af37]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {t.completed ? (
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Circle size={16} className="text-stone-500 shrink-0" />
                      )}
                      <span className="text-xs font-medium">{t.title}</span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-stone-800 text-stone-400 shrink-0">
                      {t.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export default Roadmap;
