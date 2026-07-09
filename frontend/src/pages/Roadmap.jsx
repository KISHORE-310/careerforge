import { useState, useEffect } from "react";
import PageLayout from "../components/layout/PageLayout";
import LearningRoadmap from "../components/dashboard/LearningRoadmap";
import { BookOpen } from "lucide-react";

function Roadmap() {
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
      title="Learning Roadmap"
      subtitle="Your personalized AI learning journey."
    >
      {resumeData && resumeData.roadmap ? (
        <div className="space-y-8">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8">
            <h2 className="text-2xl font-bold text-white">Target Career: {resumeData.target_role}</h2>
            <p className="text-zinc-400 mt-2">
              Based on your current resume profile, follow this tailored learning roadmap to prepare for roles in {resumeData.target_role}.
            </p>
          </div>
          <LearningRoadmap roadmap={resumeData.roadmap} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <div className="rounded-full bg-purple-500/10 p-6 text-purple-500">
            <BookOpen size={48} />
          </div>
          <h3 className="mt-6 text-2xl font-bold text-white">No Roadmap Generated</h3>
          <p className="mt-2 max-w-md text-zinc-400">
            Please upload and analyze your resume on the Dashboard first to generate your custom learning roadmap.
          </p>
          <a
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            Go to Dashboard
          </a>
        </div>
      )}
    </PageLayout>
  );
}


export default Roadmap;