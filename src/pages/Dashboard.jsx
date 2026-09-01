import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import ActivityHeatmap from "../components/charts/ActivityHeatmap";
import ReadinessAreaChart from "../components/charts/ReadinessAreaChart";
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  FileText,
  CheckCircle2,
  ArrowRight,
  Bot,
  Flame,
  Clock,
  ChevronRight,
  AlertCircle,
  Award,
  Layers,
  Zap,
  Code2,
} from "lucide-react";
import {
  getProfile,
  getResume,
  getJobs,
  getApplications,
  getRoadmap,
  getProgressAnalytics,
} from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [activeApplications, setActiveApplications] = useState([]);
  const [roadmapData, setRoadmapData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profRes, resRes, jobRes, appRes, roadRes, progRes] = await Promise.all([
          getProfile(),
          getResume(),
          getJobs({ min_match: 80 }),
          getApplications(),
          getRoadmap(),
          getProgressAnalytics(),
        ]);

        if (profRes?.success && profRes.user) setProfile(profRes.user);
        if (resRes?.success) setResumeData(resRes);
        if (jobRes?.success && Array.isArray(jobRes.jobs)) setRecommendedJobs(jobRes.jobs.slice(0, 3));
        if (appRes?.success && Array.isArray(appRes.applications)) setActiveApplications(appRes.applications);
        if (roadRes?.success && roadRes.roadmap) setRoadmapData(roadRes.roadmap);
        if (progRes?.success && progRes.analytics) setAnalytics(progRes.analytics);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const readinessScore = analytics?.career_readiness_score ?? 0;
  const resumeScore = resumeData?.evaluation?.resume_score ?? analytics?.resume_ats_score;
  const targetRole = profile?.target_role || profile?.profile?.targetRole || "Full Stack Engineer";
  const targetSalary = analytics?.target_salary || (profile?.profile?.targetSalary ? `$${profile.profile.targetSalary.toLocaleString()}` : null);

  const interviewApps = useMemo(() => {
    return activeApplications.filter(
      (a) => a.status === "interviewing" || a.status === "interview" || a.status === "screening"
    );
  }, [activeApplications]);

  // Derive Next Best Actions dynamically from actual user state
  const nextBestActions = useMemo(() => {
    const actions = [];

    // Priority 1: Imminent Interview Preparation
    if (interviewApps.length > 0) {
      const topInterview = interviewApps[0];
      actions.push({
        title: `Prepare for ${topInterview.company} Interview`,
        desc: `Simulate technical & behavioral rounds calibrated for ${topInterview.role} at ${topInterview.company}.`,
        actionText: "Launch Interview Lab",
        link: "/interviews",
        icon: <Award className="text-[#d4af37]" size={16} />,
        badge: "Urgent Priority",
      });
    }

    // Priority 2: Resume ATS Optimization if missing or low score
    if (!resumeScore || resumeScore < 80) {
      actions.push({
        title: "Elevate Resume ATS Keyword Density",
        desc: "Add quantifiable metrics and modern stack keywords to pass automated recruiter screens.",
        actionText: "Optimize Resume",
        link: "/resume",
        icon: <FileText className="text-[#f5d77f]" size={16} />,
        badge: "High Impact",
      });
    }

    // Priority 3: Active Roadmap Progression
    const milestones = roadmapData?.milestones || [];
    const nextMilestone = milestones.find((m) => m.status !== "completed");
    if (nextMilestone) {
      actions.push({
        title: `Advance Milestone: ${nextMilestone.title}`,
        desc: nextMilestone.description || "Master required architecture patterns and core engineering competencies.",
        actionText: "Open Roadmap",
        link: "/roadmap",
        icon: <Zap className="text-[#f5d77f]" size={16} />,
        badge: `Week ${nextMilestone.week}`,
      });
    }

    // Priority 4: DSA Practice if solved count is modest
    const dsaSolved = analytics?.dsa_metrics?.solved_count ?? 0;
    if (dsaSolved < 5 && actions.length < 2) {
      actions.push({
        title: "Solve Core Algorithmic Challenges",
        desc: "Practice key array, two-pointer, and tree structures in DSA Lab to build interview rigor.",
        actionText: "Open DSA Lab",
        link: "/dsa",
        icon: <Code2 className="text-[#d4af37]" size={16} />,
        badge: "Foundation",
      });
    }

    // Priority 5: Job Discovery if few active applications
    if (activeApplications.length < 3 && actions.length < 2) {
      const topJob = recommendedJobs[0];
      actions.push({
        title: topJob ? `Explore Opening at ${topJob.company}` : "Discover Verified Tech Openings",
        desc: topJob
          ? `${topJob.title} matches ${topJob.match_score}% of your profile and stack.`
          : "Browse high-match job opportunities and track submissions.",
        actionText: "Browse Jobs",
        link: "/jobs",
        icon: <Briefcase className="text-[#f5d77f]" size={16} />,
        badge: topJob ? `${topJob.match_score}% Match` : "Job Match",
      });
    }

    return actions.slice(0, 2);
  }, [interviewApps, resumeScore, roadmapData, analytics, activeApplications, recommendedJobs]);

  // Derive Skill Gaps dynamically by comparing candidate skills with job market / roadmap requirements
  const skillGaps = useMemo(() => {
    const candidateSkills = new Set(
      (profile?.skills || resumeData?.resume?.technical_skills || []).map((s) =>
        (typeof s === "string" ? s : s?.name || "").toLowerCase()
      )
    );

    const requiredSkillsCount = new Map();

    // Tally skills required by recommended jobs
    recommendedJobs.forEach((job) => {
      (job.skills_required || []).forEach((skill) => {
        const lower = skill.toLowerCase();
        if (!candidateSkills.has(lower)) {
          requiredSkillsCount.set(skill, (requiredSkillsCount.get(skill) || 0) + 1);
        }
      });
    });

    // Tally skills from roadmap milestones
    (roadmapData?.milestones || []).forEach((m) => {
      (m.skills || []).forEach((skill) => {
        const lower = skill.toLowerCase();
        if (!candidateSkills.has(lower)) {
          requiredSkillsCount.set(skill, (requiredSkillsCount.get(skill) || 0) + 2);
        }
      });
    });

    const gaps = Array.from(requiredSkillsCount.entries())
      .map(([name, weight]) => ({
        name,
        priority: weight >= 2 ? "High" : "Medium",
        link: "/learning",
      }))
      .slice(0, 3);

    if (gaps.length === 0) {
      return [
        { name: "System Design Patterns", priority: "Recommended", link: "/learning" },
        { name: "Distributed Caching", priority: "Recommended", link: "/learning" },
        { name: "Cloud Architecture", priority: "Recommended", link: "/learning" },
      ];
    }

    return gaps;
  }, [profile, resumeData, recommendedJobs, roadmapData]);

  // Dynamic AI coach tip based on real candidate state
  const coachTip = useMemo(() => {
    if (interviewApps.length > 0) {
      const top = interviewApps[0];
      return `You have an active stage with ${top.company} for ${top.role}. Practice communicating trade-offs cleanly using the STAR method and review relevant architecture capstones.`;
    }
    if (!resumeScore || resumeScore < 80) {
      return `Your resume ATS calibration is currently ${resumeScore ? `${resumeScore}/100` : "unscanned"}. Focus on quantifying your technical project outcomes and listing key modern stack tools.`;
    }
    const dsaSolved = analytics?.dsa_metrics?.solved_count ?? 0;
    if (dsaSolved < 5) {
      return `Strengthen your algorithmic problem-solving in DSA Lab. Solving 5+ core patterns will significantly raise your technical screen readiness.`;
    }
    return `Your readiness velocity is on track. Keep your 365-day practice consistency high and continue applying to verified high-match roles.`;
  }, [interviewApps, resumeScore, analytics]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header Hero */}
        <div className="apple-liquid-glass rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-[#d4af37]/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#d4af37]/10 to-transparent blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
                  Career Command Center
                </span>
                <span className="text-xs text-stone-400">
                  Target Role: <strong className="text-white font-medium">{targetRole}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif-header text-white leading-tight">
                Welcome back, {profile?.name?.split(" ")[0] || profile?.full_name?.split(" ")[0] || "Candidate"}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-1.5 font-light leading-relaxed">
                {activeApplications.length > 0 ? (
                  <>
                    You have <strong className="text-white font-medium">{activeApplications.length} tracked applications</strong>
                    {interviewApps.length > 0 ? ` (${interviewApps.length} in interview stages)` : ""} and{" "}
                    <strong className="text-[#f5d77f]">{recommendedJobs.length} high-match job openings</strong>.
                  </>
                ) : (
                  <>
                    Start your job hunt by tracking your target applications, testing your resume ATS fit, and practicing mock interview simulations.
                  </>
                )}
              </p>
            </div>

            {/* Circular Readiness Gauge */}
            <div className="flex items-center gap-4 bg-black/60 border border-[#d4af37]/30 rounded-2xl p-4 shrink-0 shadow-inner">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-stone-800"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#d4af37]"
                    strokeDasharray={`${readinessScore}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-bold text-white leading-none font-mono">{readinessScore}</span>
                  <span className="text-[8px] uppercase tracking-wider text-[#f5d77f] font-semibold">Score</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">Career Readiness</p>
                <p className="text-[11px] text-[#f5d77f] flex items-center gap-1 font-mono">
                  <Sparkles size={11} /> Real-time Calibrated
                </p>
                <Link
                  to="/progress"
                  className="text-[10px] text-stone-400 hover:text-white flex items-center gap-0.5 pt-0.5"
                >
                  View full analytics <ChevronRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metric Snapshot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="gold-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 font-light">Resume ATS Score</p>
              <h3 className="text-2xl font-bold text-white font-mono mt-0.5">
                {resumeScore !== null && resumeScore !== undefined ? (
                  <>
                    {resumeScore}
                    <span className="text-xs text-stone-500 font-normal">/100</span>
                  </>
                ) : (
                  <span className="text-lg text-stone-500 font-normal">Unscanned</span>
                )}
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 size={11} />{" "}
                {resumeScore >= 85 ? "Optimal ATS Density" : (resumeScore ? "ATS Calibrated" : "Upload to evaluate")}
              </p>
            </div>
            <Link to="/resume" className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-[#d4af37] transition">
              <FileText size={18} />
            </Link>
          </div>

          <div className="gold-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 font-light">Active Applications</p>
              <h3 className="text-2xl font-bold text-white font-mono mt-0.5">{activeApplications.length}</h3>
              <p className="text-[11px] text-[#f5d77f] mt-1 flex items-center gap-1">
                <Clock size={11} />{" "}
                {interviewApps.length > 0 ? `${interviewApps.length} in Interview Stages` : "Tracked Pipeline"}
              </p>
            </div>
            <Link to="/applications" className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-[#d4af37] transition">
              <Briefcase size={18} />
            </Link>
          </div>

          <div className="gold-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 font-light">Target Compensation</p>
              <h3 className="text-2xl font-bold text-white font-mono mt-0.5">
                {targetSalary || "$130k - $170k"}
              </h3>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp size={11} /> {targetRole}
              </p>
            </div>
            <Link to="/market" className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-[#d4af37] transition">
              <TrendingUp size={18} />
            </Link>
          </div>
        </div>

        {/* Two Column Grid: Next Best Actions & AI Strategic Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Best Actions (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Flame size={16} className="text-[#d4af37]" />
                Next Best Actions
              </h3>
              <span className="text-xs text-stone-500 font-light">AI Priority Queue</span>
            </div>

            <div className="space-y-3">
              {nextBestActions.map((act, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#141414] border border-stone-800 hover:border-[#d4af37]/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-[#d4af37]/30 transition">
                      {act.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-stone-100">{act.title}</h4>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#d4af37]/15 text-[#f5d77f] font-mono">
                          {act.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 leading-snug font-light">{act.desc}</p>
                    </div>
                  </div>

                  <Link
                    to={act.link}
                    className="px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-[#d4af37] hover:text-black text-xs font-medium text-stone-200 border border-stone-800 transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <span>{act.actionText}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>

            {/* Active Applications Quick Tracker */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Briefcase size={16} className="text-[#d4af37]" />
                  Active Applications Snapshot
                </h3>
                <Link to="/applications" className="text-xs text-[#d4af37] hover:underline flex items-center gap-1">
                  Open Board <ChevronRight size={13} />
                </Link>
              </div>

              {activeApplications.length === 0 ? (
                <div className="p-5 rounded-xl bg-[#141414] border border-stone-800 text-center space-y-2">
                  <p className="text-xs text-stone-400">No active applications currently tracked.</p>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-1 text-xs text-[#f5d77f] hover:underline"
                  >
                    Browse jobs & track applications <ChevronRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeApplications.slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      onClick={() => navigate("/applications")}
                      className="p-3.5 rounded-xl bg-[#141414] border border-stone-800 hover:border-stone-700 cursor-pointer transition flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-stone-100">{app.company}</h4>
                          <p className="text-[11px] text-stone-400 truncate">{app.role}</p>
                        </div>
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/30">
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-500 pt-2 border-t border-stone-800/80">
                        <span>Match: <strong className="text-stone-300 font-mono">{app.match_score || 85}%</strong></span>
                        <span className="truncate max-w-[140px]">{app.next_step || "Under Review"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Strategic Insights & Skill Gap Radar */}
          <div className="space-y-6">
            {/* AI Career Coach Quick Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#181818] to-[#101010] border border-[#d4af37]/25 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#d4af37] text-black flex items-center justify-center font-bold">
                  <Bot size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">AI Career Coach</h4>
                  <p className="text-[10px] text-[#f5d77f]">Personalized Strategic Feedback</p>
                </div>
              </div>
              <p className="text-xs text-stone-300 font-light leading-relaxed">
                "{coachTip}"
              </p>
              <Link
                to="/coach"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#f5d77f] hover:text-white transition pt-1"
              >
                Chat with Strategic Coach <ArrowRight size={13} />
              </Link>
            </div>

            {/* Priority Skill Gaps */}
            <div className="p-5 rounded-2xl bg-[#141414] border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Layers size={14} className="text-[#d4af37]" />
                  Priority Skill Gaps
                </h4>
                <Link to="/skills" className="text-[10px] text-stone-500 hover:text-stone-300">
                  Skill Matrix
                </Link>
              </div>

              <div className="space-y-2">
                {skillGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-stone-900/60 border border-stone-800/80"
                  >
                    <div>
                      <p className="text-xs font-medium text-stone-200">{gap.name}</p>
                      <span className="text-[9px] text-stone-500 font-mono">Priority: {gap.priority}</span>
                    </div>
                    <Link
                      to={gap.link}
                      className="text-[11px] px-2 py-1 rounded bg-[#d4af37]/15 text-[#f5d77f] hover:bg-[#d4af37]/25 transition"
                    >
                      Bridge Gap
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Readiness Velocity Chart */}
        <ReadinessAreaChart currentScore={readinessScore} />

        {/* 52-Week Practice & Execution Heatmap */}
        <ActivityHeatmap
          activityCalendar={analytics?.activity_calendar}
          title="Candidate Execution & Activity Heatmap"
          subtitle="Real-time 365-day consistency index across LeetCode DSA, System Design mocks, and ATS iterations."
        />

        {/* Recommended High-Match Jobs */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-[#d4af37]" />
                Top Recommended Openings
              </h3>
              <p className="text-xs text-stone-400 font-light">Verified jobs matching 80%+ of your profile</p>
            </div>
            <Link to="/jobs" className="text-xs text-[#d4af37] hover:underline flex items-center gap-1">
              Explore All Jobs <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedJobs.map((job) => (
              <div
                key={job.id}
                className="gold-card rounded-xl p-4 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-stone-100">{job.title}</h4>
                      <p className="text-[11px] text-[#f5d77f] font-medium">{job.company}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/30 shrink-0">
                      {job.match_score}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400 mt-2 line-clamp-2 font-light">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {job.skills_required.slice(0, 4).map((s, idx) => (
                      <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-800/80">
                  <span className="text-xs font-medium text-stone-200 font-mono">
                    {job.salary_range ? job.salary_range.split(" - ")[0] : (job.salary || "$150,000")}
                  </span>
                  <Link
                    to="/jobs"
                    className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-[#d4af37] hover:text-black text-xs font-medium text-stone-300 transition"
                  >
                    View Fit Analysis
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;
