import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import DSAPerformanceChart from "../components/charts/DSAPerformanceChart";
import ActivityHeatmap from "../components/charts/ActivityHeatmap";
import {
  Code2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Zap,
  Layers,
  Terminal,
} from "lucide-react";
import { useDSAProgress } from "../hooks/useDSAProgress";
import { reviewCode } from "../services/api";
import { Link } from "react-router-dom";

function DSATracker() {
  const { resetProgress, stats, topics } = useDSAProgress();
  const [activeTab, setActiveTab] = useState("roadmap"); // "roadmap" | "playground"
  const [codeSnippet, setCodeSnippet] = useState(`function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`);
  const [codeReview, setCodeReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleReviewCode = async () => {
    setReviewLoading(true);
    try {
      const res = await reviewCode({
        problem_title: "Two Sum / Hash Map Lookup",
        language: "TypeScript",
        code: codeSnippet,
      });
      if (res.success) {
        setCodeReview(res.review);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
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
                Coding Lab & DSA Track
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              Coding Lab & Algorithm Mastery
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Curated pattern tracks, time/space complexity analyzers, and real-time AI code reviews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-900 border border-stone-800 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("roadmap")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === "roadmap"
                    ? "bg-[#d4af37] text-black font-semibold"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                DSA Topics
              </button>
              <button
                onClick={() => setActiveTab("playground")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                  activeTab === "playground"
                    ? "bg-[#d4af37] text-black font-semibold"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Terminal size={12} />
                AI Code Lab
              </button>
            </div>
          </div>
        </div>

        {/* Top Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
          <div className="gold-card rounded-xl p-4">
            <span className="text-[11px] text-stone-400">Total Solved</span>
            <h3 className="text-xl font-bold font-mono text-white mt-0.5">{stats.totalSolved} / {stats.totalProblems}</h3>
            <span className="text-[10px] text-emerald-400 font-mono">Top 10% Velocity</span>
          </div>

          <div className="gold-card rounded-xl p-4">
            <span className="text-[11px] text-stone-400">Progress</span>
            <h3 className="text-xl font-bold font-mono text-[#f5d77f] mt-0.5">{stats.progressPercent}%</h3>
            <span className="text-[10px] text-stone-400 font-mono">{stats.masteredCount} Mastered</span>
          </div>

          <div className="gold-card rounded-xl p-4">
            <span className="text-[11px] text-stone-400">Practice Time</span>
            <h3 className="text-xl font-bold font-mono text-white mt-0.5">{stats.solvedHours}h</h3>
            <span className="text-[10px] text-stone-400 font-mono">Of {stats.totalHours}h Goal</span>
          </div>

          <div className="gold-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-stone-400">Reset Session</span>
              <p className="text-[10px] text-stone-500 mt-0.5">Clear local progress</p>
            </div>
            <button
              onClick={resetProgress}
              className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-rose-400 transition"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* DSA Mastery & Pattern Distribution Charts */}
        <DSAPerformanceChart />

        {activeTab === "roadmap" ? (
          <div className="space-y-6">
            {/* DSA Topic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((t) => (
                <Link
                  key={t.slug}
                  to={`/dsa/${t.slug}`}
                  className="gold-card rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#d4af37]/60 group transition"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-stone-500 uppercase">{t.group}</span>
                        <h3 className="text-sm font-semibold text-white group-hover:text-[#f5d77f] transition">
                          {t.title}
                        </h3>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#f5d77f]">
                        {t.progress}%
                      </span>
                    </div>

                    <p className="text-xs text-stone-400 mt-2 font-light line-clamp-2">
                      {t.description}
                    </p>

                    <div className="mt-3 space-y-1">
                      <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#d4af37] to-[#f5d77f] rounded-full"
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-xs">
                    <span className="text-stone-400 font-mono">{t.solved} / {t.total} solved</span>
                    <span className="text-[#f5d77f] flex items-center gap-1 font-medium">
                      Practice <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Daily Algorithm Submission & Practice Heatmap */}
            <ActivityHeatmap
              title="Daily Algorithm & Coding Practice Heatmap"
              subtitle="Commit velocity across Arrays, Dynamic Programming, Graph Traversal, and Concurrency Labs."
            />
          </div>
        ) : (
          /* Interactive Code Review Playground */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-stone-400">Code Editor Simulator (TypeScript)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-400 font-mono">
                  O(N) Target
                </span>
              </div>

              <div className="apple-liquid-glass rounded-2xl p-4 border border-[#d4af37]/30 shadow-2xl">
                <textarea
                  rows={14}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="w-full bg-[#0a0a0a] text-emerald-300 font-mono text-xs p-4 rounded-xl outline-none focus:border-[#d4af37] leading-relaxed border border-stone-800"
                />

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-800">
                  <span className="text-[11px] text-stone-500">Press Review to trigger AI AST verification</span>
                  <button
                    onClick={handleReviewCode}
                    disabled={reviewLoading}
                    className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f5d77f] transition flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                  >
                    <Sparkles size={14} />
                    {reviewLoading ? "Analyzing Complexity..." : "Review Code with AI"}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Review Result */}
            <div className="lg:col-span-5">
              <div className="apple-liquid-glass rounded-2xl p-5 border border-[#d4af37]/30 shadow-2xl space-y-4">
                <div className="border-b border-stone-800 pb-3">
                  <span className="text-[10px] font-mono text-[#f5d77f] uppercase tracking-wider">
                    AI Complexity & Code Rubric
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-0.5">
                    Optimization Feedback
                  </h4>
                </div>

                {codeReview ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
                        <span className="text-[10px] text-stone-500 block">Time Complexity</span>
                        <span className="font-bold text-emerald-400 font-mono mt-0.5 block">{codeReview.time_complexity}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800">
                        <span className="text-[10px] text-stone-500 block">Space Complexity</span>
                        <span className="font-bold text-[#f5d77f] font-mono mt-0.5 block">{codeReview.space_complexity}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <span className="font-semibold text-white block mb-1">Code Quality:</span>
                      <p className="text-stone-300 font-light leading-relaxed">{codeReview.quality_notes}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
                      <span className="font-semibold block mb-1">Tier-1 Interviewer Tip:</span>
                      <p className="font-light">{codeReview.interviewer_tip}</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-xs text-stone-500 font-light">
                    Run the code review to evaluate asymptotic bounds and edge case resilience.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default DSATracker;
