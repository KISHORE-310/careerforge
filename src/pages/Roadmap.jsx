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
import { getRoadmap, regenerateRoadmap, updateRoadmap } from "../services/api";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "../components/common/AsyncPanel";

function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      setError("");
      const res = await getRoadmap();
      if (res && res.success) {
        setRoadmap(res.roadmap || null);
      } else {
        setRoadmap(null);
        setError(res?.message || "Your roadmap could not be loaded.");
      }
    } catch (err) {
      console.error(err);
      setRoadmap(null);
      setError("Your roadmap could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm("Replace the current roadmap with a new plan based on your latest target role and skills?")) return;
    setRegenerating(true);
    setError("");
    try {
      const result = await regenerateRoadmap();
      if (!result?.success) throw new Error(result?.message || "Unable to regenerate roadmap.");
      await fetchRoadmap();
    } catch (err) {
      setError(err.message || "Unable to regenerate roadmap. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleTask = async (phaseIdx, taskIdx) => {
    if (!roadmap) return;
    const milestones = roadmap.milestones.map((phase) => ({ ...phase, tasks: (phase.tasks || []).map((task) => ({ ...task })) }));
    const task = milestones[phaseIdx].tasks[taskIdx];
    task.completed = !task.completed;
    const updated = { ...roadmap, milestones };
    setRoadmap(updated);
    try {
      const result = await updateRoadmap({ targetRole: roadmap.targetRole, milestones });
      if (!result?.success) throw new Error(result?.message || "Unable to save roadmap progress.");
    } catch (err) {
      console.error(err);
      setRoadmap(roadmap);
      setError("Roadmap progress could not be saved. Your change was reverted.");
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
          <button type="button" onClick={handleRegenerate} disabled={regenerating} className="rounded-xl border border-[#d4af37]/50 px-3 py-2 text-xs font-semibold text-[#f5d77f] transition hover:bg-[#d4af37]/10 disabled:opacity-50">
            {regenerating ? "Regenerating…" : "Regenerate roadmap"}
          </button>
        </div>

        {/* 30/60/90 Day Phase Cards */}
        {loading ? <LoadingPanel label="Building your career roadmap…" /> : error ? <ErrorPanel message={error} onRetry={fetchRoadmap} /> : !roadmap?.milestones?.length ? <EmptyPanel title="No roadmap yet" description="Add a target role and skills in your profile, then retry." /> : <div className="space-y-6">
          <p className="text-xs text-stone-500">Personalized from your saved target role and skills. Update your profile or skills before creating a new roadmap.</p>
          {roadmap.milestones.map((phase, pIdx) => (
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
                    <h3 className="text-base font-serif-header text-white">{phase.title}</h3>
                    <p className="text-xs text-[#d4af37] font-medium">{phase.duration}</p>
                    {phase.description && <p className="mt-1 text-xs text-stone-400">{phase.description}</p>}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3 w-full sm:w-48">
                  <div className="flex-1 bg-stone-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#d4af37] to-[#f5d77f] h-full transition-all duration-300"
                      style={{ width: `${phase.tasks?.length ? Math.round((phase.tasks.filter((task) => task.completed).length / phase.tasks.length) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-white">{phase.tasks?.length ? Math.round((phase.tasks.filter((task) => task.completed).length / phase.tasks.length) * 100) : 0}%</span>
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
                      Task
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>}
      </div>
    </AppLayout>
  );
}

export default Roadmap;
