import { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import { BarChart3, CheckCircle, XCircle, ShieldCheck, HelpCircle } from "lucide-react";

function ATS() {
  const [resumeData, setResumeData] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("careerforge-resume-data");
      if (stored) {
        setResumeData(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const atsData = resumeData?.ats_score;
  const score = atsData?.ats_score ?? 0;
  const targetRole = atsData?.target_role ?? "";
  const matched = atsData?.matched_keywords ?? [];
  const missing = atsData?.missing_keywords ?? [];

  const getScoreColor = (val) => {
    if (val >= 85) return "text-green-400 border-green-500/30 bg-green-500/10";
    if (val >= 70) return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    if (val >= 50) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
    return "text-red-400 border-red-500/30 bg-red-500/10";
  };

  const getStrokeColor = (val) => {
    if (val >= 85) return "#10b981"; // green
    if (val >= 70) return "#3b82f6"; // blue
    if (val >= 50) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  return (
    <PageLayout
      title="ATS Analysis"
      subtitle="Check how your resume performs with Applicant Tracking Systems."
    >
      {resumeData && atsData ? (
        <div className="space-y-8">
          {/* Hero Stats Section */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Radial Score Gauge */}
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-8 flex flex-col items-center justify-center text-center">
              <h3 className="text-lg font-semibold text-zinc-400 mb-6">ATS Compatibility</h3>
              
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#27272a"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={getStrokeColor(score)}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * score) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white">{score}</span>
                  <span className="text-xs text-zinc-500 mt-1">out of 100</span>
                </div>
              </div>

              <div className={`mt-6 rounded-full border px-4 py-1.5 text-xs font-semibold ${getScoreColor(score)}`}>
                {score >= 85 ? "Excellent Match" : score >= 70 ? "Good Match" : score >= 50 ? "Average Match" : "Needs Improvement"}
              </div>
            </div>

            {/* Target Role & Keyword Summary */}
            <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-[#121212] to-black p-8 flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                  <ShieldCheck size={14} />
                  ATS Optimization Engine
                </span>
                <h3 className="mt-4 text-3xl font-bold text-white">Target Career: {targetRole}</h3>
                <p className="mt-3 text-zinc-400 leading-7">
                  Applicant Tracking Systems screen resumes for key phrases and technical skills. 
                  Below is the breakdown of keywords matched and missed from your resume for a <strong>{targetRole}</strong> role.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
                  <p className="text-zinc-500 text-sm">Matched Keywords</p>
                  <p className="mt-2 text-3xl font-extrabold text-green-400">{matched.length}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-black/40 p-5">
                  <p className="text-zinc-500 text-sm">Missing Keywords</p>
                  <p className="mt-2 text-3xl font-extrabold text-red-400">{missing.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Keyword Detail Section */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/20 p-8">
            {/* Filter Tabs */}
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-5">
              <button
                onClick={() => setActiveTab("all")}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === "all" ? "bg-red-600 text-white shadow-lg" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                All Keywords ({matched.length + missing.length})
              </button>
              <button
                onClick={() => setActiveTab("matched")}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === "matched" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Matched ({matched.length})
              </button>
              <button
                onClick={() => setActiveTab("missing")}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === "missing" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                Missing ({missing.length})
              </button>
            </div>

            {/* Keyword Grid */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Matched Keywords */}
              {(activeTab === "all" || activeTab === "matched") &&
                matched.map((item, index) => (
                  <div
                    key={`matched-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-green-500/10 bg-green-500/5 p-5 transition hover:border-green-500/30"
                  >
                    <CheckCircle className="text-green-400 shrink-0" size={20} />
                    <span className="text-zinc-200 font-semibold">{item}</span>
                  </div>
                ))}

              {/* Missing Keywords */}
              {(activeTab === "all" || activeTab === "missing") &&
                missing.map((item, index) => (
                  <div
                    key={`missing-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 p-5 transition hover:border-red-500/30"
                  >
                    <XCircle className="text-red-400 shrink-0" size={20} />
                    <span className="text-zinc-200 font-semibold">{item}</span>
                  </div>
                ))}
            </div>

            {/* Hint */}
            {missing.length > 0 && (
              <div className="mt-8 rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-6 flex items-start gap-3">
                <HelpCircle className="text-yellow-400 mt-1 shrink-0" size={18} />
                <p className="text-sm text-zinc-300 leading-6">
                  <strong>Tip for Optimization:</strong> Try modifying your resume descriptions or adding new project experiences that demonstrate practical use of the <strong>missing keywords</strong> listed above. This will help you clear automatic resume filters.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <div className="rounded-full bg-blue-500/10 p-6 text-blue-500">
            <BarChart3 size={48} />
          </div>
          <h3 className="mt-6 text-2xl font-bold text-white">No ATS Score Available</h3>
          <p className="mt-2 max-w-md text-zinc-400">
            Please upload and analyze your resume on the Dashboard first to unlock full ATS keyword analysis.
          </p>
          <a
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      )}
    </PageLayout>
  );
}


export default ATS;