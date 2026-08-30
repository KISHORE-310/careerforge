import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Sparkles,
  Building2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  X,
  Layers,
  ChevronRight,
  Filter,
  Check,
} from "lucide-react";
import { getJobs, addApplication } from "../services/api";

function Jobs() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [minMatch, setMinMatch] = useState(0);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedSuccess, setTrackedSuccess] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [filterType, minMatch]);

  const fetchJobs = async () => {
    try {
      const params = {};
      if (filterType !== "all") params.type = filterType;
      if (minMatch > 0) params.min_match = minMatch;
      const res = await getJobs(params);
      if (res.success) {
        setJobs(res.jobs);
        if (res.jobs.length > 0 && !selectedJob) {
          setSelectedJob(res.jobs[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.skills_required.some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleTrackApplication = async (job) => {
    setTrackingLoading(true);
    try {
      await addApplication({
        company: job.company,
        role: job.title,
        status: "Wishlist",
        salary_range: job.salary,
        notes: `Matched via Jobs Intelligence with ${job.match_score}% fit score.`,
      });
      setTrackedSuccess(true);
      setTimeout(() => setTrackedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
                AI Job Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              Jobs & Match Intelligence
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Verified tech positions indexed and evaluated against your exact skill profile and resume.
            </p>
          </div>

          {/* Match Filter Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-mono hidden sm:inline">Fit filter:</span>
            {[
              { label: "All Match", val: 0 },
              { label: "85%+ Match", val: 85 },
              { label: "90%+ Top Match", val: 90 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setMinMatch(p.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  minMatch === p.val
                    ? "bg-[#d4af37] text-black border-[#d4af37] font-semibold"
                    : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Location Filter Bar */}
        <div className="apple-liquid-glass rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3 shadow-lg">
          <div className="flex items-center gap-2 flex-1 w-full px-2">
            <Search size={16} className="text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, or stack (e.g. React, Distributed Systems, Golang)..."
              className="w-full bg-transparent text-xs text-stone-100 placeholder:text-stone-500 outline-none font-light"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-stone-800 pt-2 sm:pt-0 sm:pl-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#d4af37]"
            >
              <option value="all">All Work Types</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Full-time">Full-time</option>
            </select>
          </div>
        </div>

        {/* Main Grid: Job Cards (Left) & Job Fit Analysis Drawer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Jobs List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs text-stone-400 font-medium">
              Found <strong className="text-white">{filteredJobs.length}</strong> matching positions
            </div>

            <div className="space-y-3">
              {filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-xl cursor-pointer transition border flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "bg-[#161616] border-[#d4af37] shadow-lg shadow-black"
                        : "bg-[#121212] border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                          <span className="text-[10px] px-2 py-0.2 rounded bg-stone-900 border border-stone-800 text-stone-400">
                            {job.type}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[#f5d77f] mt-0.5">{job.company}</p>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#f5d77f] border border-[#d4af37]/40">
                          {job.match_score}% Fit
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-stone-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-stone-500" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-stone-300">
                        <DollarSign size={12} className="text-[#d4af37]" />
                        {job.salary}
                      </span>
                    </div>

                    <p className="text-xs text-stone-400 line-clamp-2 font-light">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills_required.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-800/80 text-stone-300 font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Job Fit Analysis Pane (5 cols) */}
          <div className="lg:col-span-5">
            {selectedJob ? (
              <div className="sticky top-20 apple-liquid-glass rounded-2xl p-5 border border-[#d4af37]/30 shadow-2xl space-y-5">
                {/* Header */}
                <div className="border-b border-stone-800 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#f5d77f] uppercase tracking-wider">
                      Role Fit Assessment
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {selectedJob.match_score}% High Alignment
                    </span>
                  </div>
                  <h3 className="text-lg font-serif-header text-white mt-1">{selectedJob.title}</h3>
                  <p className="text-xs text-[#d4af37] font-medium">{selectedJob.company} • {selectedJob.location}</p>
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-stone-300">Alignment Breakdown</h4>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-400">
                      <span>Tech Stack Coverage</span>
                      <span className="font-mono text-stone-200">95%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                      <div className="h-full bg-[#d4af37] rounded-full" style={{ width: "95%" }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-400">
                      <span>Seniority & Scope Alignment</span>
                      <span className="font-mono text-stone-200">90%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-900 rounded-full overflow-hidden">
                      <div className="h-full bg-[#f5d77f] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>

                {/* Matched vs Missing Skills */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 size={13} />
                      Strongly Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills_required.slice(0, 4).map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 font-mono">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
                      <Sparkles size={13} />
                      Bridgeable Skill Target
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.skills_required.slice(4).map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-300 font-mono flex items-center gap-1">
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Tailoring Recommendation */}
                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-stone-300 space-y-1">
                  <div className="flex items-center gap-1 text-[#f5d77f] font-medium text-[11px]">
                    <Sparkles size={12} />
                    AI Resume Recommendation
                  </div>
                  <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                    Emphasize your PostgreSQL query tuning experience and system scalability metrics when submitting to {selectedJob.company}.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={() => handleTrackApplication(selectedJob)}
                    disabled={trackingLoading}
                    className="flex-1 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-medium text-stone-200 transition flex items-center justify-center gap-1.5"
                  >
                    {trackedSuccess ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span className="text-emerald-400">Added to Tracker</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        Track Application
                      </>
                    )}
                  </button>

                  <a
                    href="https://stripe.com/jobs"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#f5d77f] transition flex items-center justify-center gap-1.5 shadow-lg"
                  >
                    Apply on Site
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="apple-liquid-glass rounded-2xl p-8 text-center text-xs text-stone-500">
                Select any position to inspect comprehensive AI Fit Analysis.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Jobs;
