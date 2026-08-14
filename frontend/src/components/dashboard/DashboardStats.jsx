import StatCard from "./StatCard";

function DashboardStats({ resumeScore, atsScore }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Resume Score"
        value={resumeScore ? `${resumeScore.resume_score}%` : "--"}
        subtitle={resumeScore ? `Grade: ${resumeScore.grade}` : "Upload Resume"}
        color="text-stone-100"
      />

      <StatCard
        title="ATS Score"
        value={atsScore ? `${atsScore.ats_score}%` : "--"}
        subtitle={atsScore ? atsScore.target_role : "Awaiting Analysis"}
        color="text-[#d4af37]"
      />

      <StatCard
        title="Readiness Index"
        value={resumeScore ? `${Math.min(resumeScore.resume_score + 6, 100)}%` : "--"}
        subtitle="Algorithmic Match"
        color="text-emerald-400"
      />

      <StatCard
        title="Missing Skills"
        value={atsScore ? atsScore.missing_keywords?.length ?? 0 : "--"}
        subtitle="Key Action Items"
        color="text-amber-400"
      />
    </div>
  );
}

export default DashboardStats;