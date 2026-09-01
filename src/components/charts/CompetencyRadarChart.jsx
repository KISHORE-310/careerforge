import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Award, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { getProgressAnalytics, getResume, getInterviews } from "../../services/api";

function CustomRadarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#0e0e0e]/95 border border-[#d4af37]/40 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 max-w-xs">
        <p className="text-white font-semibold font-mono border-b border-stone-800 pb-1">{d.subject}</p>
        <p className="text-[#f5d77f] font-mono flex items-center justify-between gap-4">
          <span>Candidate Calibration:</span>
          <strong>{d.candidate}%</strong>
        </p>
        <p className="text-stone-400 font-mono flex items-center justify-between gap-4 text-[11px]">
          <span>Industry Baseline:</span>
          <span>{d.benchmark}%</span>
        </p>
        <p className="text-[10px] text-stone-400 font-light pt-1 border-t border-stone-800">
          <strong className="text-stone-300 font-medium">Source:</strong> {d.sourceExplanation}
        </p>
      </div>
    );
  }
  return null;
}

export default function CompetencyRadarChart({ analytics: propAnalytics }) {
  const [analytics, setAnalytics] = useState(propAnalytics || null);
  const [resumeData, setResumeData] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(!propAnalytics);

  useEffect(() => {
    if (propAnalytics) {
      setAnalytics(propAnalytics);
      setLoading(false);
    }

    let isMounted = true;
    async function loadData() {
      try {
        const [progRes, resRes, intRes] = await Promise.all([
          !propAnalytics ? getProgressAnalytics() : Promise.resolve(null),
          getResume(),
          getInterviews(),
        ]);

        if (isMounted) {
          if (progRes?.success && progRes.analytics) setAnalytics(progRes.analytics);
          if (resRes?.success) setResumeData(resRes);
          if (intRes?.success && Array.isArray(intRes.sessions)) setInterviews(intRes.sessions);
        }
      } catch (err) {
        console.error("Failed to load competency radar data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();

    return () => {
      isMounted = false;
    };
  }, [propAnalytics]);

  // Derive genuine calibrated scores from real user data sources
  const radarData = useMemo(() => {
    // 1. Resume ATS Score (Real score from uploaded resume or ATS scan)
    const atsScore =
      resumeData?.evaluation?.resume_score ??
      analytics?.resume_ats_score ??
      0;

    // 2. DSA & Code Rigor (Solved problems vs target threshold of 10 problems)
    const dsaSolved = analytics?.dsa_metrics?.solved_count ?? 0;
    const dsaScore = Math.min(100, Math.round((dsaSolved / 10) * 100));

    // 3. Technical Communication & STAR Storytelling (Evaluations from completed mock interviews)
    const evaluatedInterviews = interviews.filter((i) => i.overallScore != null || i.rubrics);
    const commScores = evaluatedInterviews
      .map((i) => i.rubrics?.communication ?? i.overallScore)
      .filter((s) => typeof s === "number");
    const commScore =
      commScores.length > 0
        ? Math.round(commScores.reduce((a, b) => a + b, 0) / commScores.length)
        : evaluatedInterviews.length > 0 ? (analytics?.interview_metrics?.average_score ?? 0) : 0;

    // 4. System Design & Architecture
    const sysDesignInterviews = evaluatedInterviews.filter(
      (i) => (i.track || "").toLowerCase().includes("system") || (i.track || "").toLowerCase().includes("design")
    );
    const sysScores = sysDesignInterviews
      .map((i) => i.rubrics?.technical ?? i.overallScore)
      .filter((s) => typeof s === "number");
    const sysScore =
      sysScores.length > 0
        ? Math.round(sysScores.reduce((a, b) => a + b, 0) / sysScores.length)
        : evaluatedInterviews.length > 0 ? (analytics?.interview_metrics?.average_score ?? 0) : 0;

    // 5. Problem Solving & Scalability
    const psScores = evaluatedInterviews
      .map((i) => i.rubrics?.problemSolving ?? i.overallScore)
      .filter((s) => typeof s === "number");
    const psScore =
      psScores.length > 0
        ? Math.round(psScores.reduce((a, b) => a + b, 0) / psScores.length)
        : dsaSolved > 0 ? Math.min(100, dsaScore) : 0;

    // 6. Skill Stack Alignment (Verified skills vs total documented skills)
    const totalSkills = analytics?.skills_overview?.total_skills ?? 0;
    const verifiedSkills = analytics?.skills_overview?.verified_skills ?? 0;
    const skillScore =
      totalSkills > 0
        ? Math.min(100, Math.round((verifiedSkills / Math.max(totalSkills, 1)) * 80 + Math.min(totalSkills * 4, 20)))
        : 0;

    return [
      {
        subject: "ATS Alignment",
        candidate: atsScore,
        benchmark: 70,
        fullMark: 100,
        sourceExplanation: "Calculated from primary resume ATS evaluation keyword density and formatting.",
      },
      {
        subject: "DSA & Code",
        candidate: dsaScore,
        benchmark: 65,
        fullMark: 100,
        sourceExplanation: "Calculated from ratio of verified LeetCode/DSA problems solved.",
      },
      {
        subject: "System Design",
        candidate: sysScore,
        benchmark: 70,
        fullMark: 100,
        sourceExplanation: "Calculated from completed System Design mock interview evaluations.",
      },
      {
        subject: "STAR Storytelling",
        candidate: commScore,
        benchmark: 75,
        fullMark: 100,
        sourceExplanation: "Calculated from AI Interview rubrics on clarity, structure, and communication.",
      },
      {
        subject: "Problem Solving",
        candidate: psScore,
        benchmark: 72,
        fullMark: 100,
        sourceExplanation: "Calculated from algorithmic code submissions and technical interview trade-offs.",
      },
      {
        subject: "Stack Depth",
        candidate: skillScore,
        benchmark: 68,
        fullMark: 100,
        sourceExplanation: "Calculated from verified technical skills and project framework competencies.",
      },
    ];
  }, [analytics, resumeData, interviews]);

  // Check if any genuine data exists
  const hasRealData = radarData.some((d) => d.candidate > 0);

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

      {loading ? (
        <div className="h-64 flex items-center justify-center text-xs text-stone-500 font-mono">
          Calibrating competency radar...
        </div>
      ) : !hasRealData ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-stone-800 rounded-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 text-[#d4af37] flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Radar Uncalibrated</h4>
            <p className="text-xs text-stone-400 max-w-xs mt-1">
              Upload your resume, solve DSA challenges, or complete a mock interview to calibrate your 6-axis competency radar.
            </p>
          </div>
          <Link
            to="/resume"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37] text-black font-semibold text-xs hover:bg-[#e4c660] transition"
          >
            <span>Scan Resume ATS</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
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
      )}
    </div>
  );
}
