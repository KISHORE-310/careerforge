import { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import ResumeOverview from "../components/dashboard/ResumeOverview";
import ResumeAnalysis from "../components/dashboard/ResumeAnalysis";
import AIRecommendations from "../components/dashboard/AIRecommendations";
import { FileText } from "lucide-react";

function Resume() {
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("careerforge-resume-data");
      if (stored) {
        setResumeData(JSON.parse(stored));
      }
    } catch {}
  }, []);

  return (
    <PageLayout
      title="Resume Intelligence"
      subtitle="Analyze, improve and optimize your resume."
    >
      {resumeData ? (
        <div className="space-y-8">
          <ResumeOverview profile={resumeData.profile} />
          <ResumeAnalysis resumeScore={resumeData.resume_score} />
          <AIRecommendations recommendations={resumeData.recommendations} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <div className="rounded-full bg-red-500/10 p-6 text-red-500">
            <FileText size={48} />
          </div>
          <h3 className="mt-6 text-2xl font-bold text-white">No Resume Uploaded Yet</h3>
          <p className="mt-2 max-w-md text-zinc-400">
            Please upload and analyze your resume on the Dashboard first to unlock AI Resume Intelligence.
          </p>
          <a
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Go to Dashboard
          </a>
        </div>
      )}
    </PageLayout>
  );
}


export default Resume;