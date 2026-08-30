import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import ActivityHeatmap from "../components/charts/ActivityHeatmap";
import ReadinessAreaChart from "../components/charts/ReadinessAreaChart";
import CompetencyRadarChart from "../components/charts/CompetencyRadarChart";
import ApplicationFunnelChart from "../components/charts/ApplicationFunnelChart";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { getProgressAnalytics } from "../services/api";

function Progress() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getProgressAnalytics();
        if (res.success) {
          setAnalytics(res.analytics);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const readinessScore = analytics?.career_readiness_score || 92;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
              Career Trajectory Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-serif-header text-white">
            Progress & Readiness Analytics
          </h1>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            Holistic metrics tracking your career readiness velocity, stage conversion throughput, competency calibration radar, and 365-day practice heatmap.
          </p>
        </div>

        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="apple-liquid-glass rounded-2xl p-5 border border-[#d4af37]/30 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 font-light">Overall Career Readiness</span>
              <h3 className="text-3xl font-bold text-white font-mono mt-1">{readinessScore}<span className="text-sm text-stone-500 font-normal">/100</span></h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <ArrowUpRight size={13} /> +8 pts this month
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-black/60 border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f]">
              <Award size={24} />
            </div>
          </div>

          <div className="gold-card rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 font-light">Interview Screen Pass Rate</span>
              <h3 className="text-3xl font-bold text-white font-mono mt-1">75%</h3>
              <p className="text-xs text-[#f5d77f] mt-1 flex items-center gap-1 font-mono">
                <Sparkles size={13} /> Top 5th Percentile
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#d4af37]">
              <TrendingUp size={22} />
            </div>
          </div>

          <div className="gold-card rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 font-light">Sprint Tasks Completed</span>
              <h3 className="text-3xl font-bold text-white font-mono mt-1">24<span className="text-sm text-stone-500 font-normal">/30</span></h3>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <CheckCircle2 size={13} /> 80% Sprint Velocity
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center text-[#d4af37]">
              <Layers size={22} />
            </div>
          </div>
        </div>

        {/* Dynamic Velocity Curve & Radar Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ReadinessAreaChart currentScore={readinessScore} />
          </div>
          <div className="lg:col-span-5">
            <CompetencyRadarChart />
          </div>
        </div>

        {/* Application Stage Conversion Funnel Chart */}
        <ApplicationFunnelChart />

        {/* Comprehensive 52-Week Practice & Execution Heatmap */}
        <ActivityHeatmap
          title="52-Week Practice, Interview & Application Heatmap"
          subtitle="Detailed daily activity matrix with streak analytics, practice hours, and target milestone fulfillment."
        />
      </div>
    </AppLayout>
  );
}

export default Progress;
