import StatCard from "./StatCard";

function DashboardStats({
  resumeScore,
  atsScore,
}) {

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">

      <StatCard
        title="Resume Score"
        value={
          resumeScore
            ? `${resumeScore.resume_score}%`
            : "--"
        }
        subtitle={
          resumeScore
            ? resumeScore.grade
            : "Upload Resume"
        }
        color="text-green-400"
      />

      <StatCard
        title="ATS Score"
        value={
          atsScore
            ? `${atsScore.ats_score}%`
            : "--"
        }
        subtitle={
          atsScore
            ? atsScore.target_role
            : "Awaiting Analysis"
        }
        color="text-blue-400"
      />

      <StatCard
        title="Career Readiness"
        value={
          resumeScore
            ? `${Math.min(
                resumeScore.resume_score + 8,
                100
              )}%`
            : "--"
        }
        subtitle="AI Prediction"
        color="text-purple-400"
      />

      <StatCard
        title="Missing Skills"
        value={
          atsScore
            ? atsScore.missing_keywords.length
            : "--"
        }
        subtitle="Need Improvement"
        color="text-red-400"
      />

    </div>

  );

}

export default DashboardStats;