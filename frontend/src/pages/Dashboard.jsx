import { useState } from "react";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import DashboardHero from "../components/dashboard/DashboardHero";
import DashboardStats from "../components/dashboard/DashboardStats";
import UploadCard from "../components/dashboard/UploadCard";
import TargetRoleSelector from "../components/dashboard/TargetRoleSelector";
import ResumeAnalysis from "../components/dashboard/ResumeAnalysis";
import ResumeOverview from "../components/dashboard/ResumeOverview";
import SkillGap from "../components/dashboard/SkillGap";
import LearningRoadmap from "../components/dashboard/LearningRoadmap";

import { uploadResume } from "../services/api";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(() => {
    try {
      const stored = localStorage.getItem("careerforge-resume-data");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState(() => {
    try {
      const stored = localStorage.getItem("careerforge-resume-data");
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.target_role || "Backend Developer";
      }
    } catch {}
    return "Backend Developer";
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    setMessage("");

    try {
      const res = await uploadResume(file, targetRole);
      if (res.success) {
        setDashboardData(res);
        localStorage.setItem("careerforge-resume-data", JSON.stringify(res));
        setMessage("Resume uploaded and analyzed successfully!");
      } else {
        setMessage(res.message || "Failed to analyze resume. Please try again.");
      }
    } catch (err) {
      setMessage("An error occurred during upload. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DashboardHero data={dashboardData} />

        <DashboardStats
          resumeScore={dashboardData?.resume_score}
          atsScore={dashboardData?.ats_score}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          <TargetRoleSelector
            targetRole={targetRole}
            setTargetRole={setTargetRole}
          />

          <UploadCard
            loading={loading}
            selectedFile={selectedFile}
            message={message}
            handleFileChange={handleFileChange}
          />
        </div>

        {dashboardData && (
          <>
            <ResumeAnalysis resumeScore={dashboardData.resume_score} />
            <ResumeOverview profile={dashboardData.profile} />
            <SkillGap skillGap={dashboardData.skill_gap} />
            <LearningRoadmap roadmap={dashboardData.roadmap} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;