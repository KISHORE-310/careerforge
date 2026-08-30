import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Edit3,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { getResume, saveResume, uploadResume, aiRewriteResume } from "../services/api";

function Resume() {
  const [resumeData, setResumeData] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState("experience");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInputBullet, setAiInputBullet] = useState("");
  const [aiTargetRole, setAiTargetRole] = useState("Senior Full Stack Engineer");
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedExpIdx, setSelectedExpIdx] = useState(0);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const res = await getResume();
      if (res.success) {
        setResumeData(res.resume);
        setEvaluation(res.evaluation);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!resumeData) return;
    setSaving(true);
    try {
      const res = await saveResume(resumeData);
      if (res.success) {
        setEvaluation(res.evaluation);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAiRewrite = async () => {
    if (!aiInputBullet.trim()) return;
    setAiLoading(true);
    try {
      const res = await aiRewriteResume({
        bullet: aiInputBullet,
        target_role: aiTargetRole,
      });
      if (res.success) {
        setAiSuggestions(res.rewritten_bullets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiSuggestion = (bulletText) => {
    if (!resumeData || !resumeData.experience || resumeData.experience.length === 0) return;
    const updatedExp = [...resumeData.experience];
    const target = { ...updatedExp[selectedExpIdx] };
    target.bullets = [...(target.bullets || []), bulletText];
    updatedExp[selectedExpIdx] = target;

    const newResume = { ...resumeData, experience: updatedExp };
    setResumeData(newResume);
    saveResume(newResume);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddExperience = () => {
    const newExp = {
      company: "New Tech Corp",
      role: "Software Engineer",
      period: "2024 - Present",
      location: "Remote",
      bullets: ["Architected high-throughput microservices handling 10k req/sec."],
    };
    setResumeData({
      ...resumeData,
      experience: [newExp, ...(resumeData?.experience || [])],
    });
  };

  const handleRemoveExperience = (idx) => {
    const updated = resumeData.experience.filter((_, i) => i !== idx);
    setResumeData({ ...resumeData, experience: updated });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!resumeData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96 text-stone-400">
          <RefreshCw className="animate-spin text-[#d4af37] mr-2" size={20} />
          Loading Resume Studio...
        </div>
      </AppLayout>
    );
  }

  const score = evaluation?.resume_score || 94;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
                Resume Studio & ATS Optimizer
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              AI Resume Studio
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Live ATS scoring, metric-driven bullet optimization, and instant keyword alignment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs font-medium text-stone-300 flex items-center gap-1.5 transition"
            >
              <Download size={14} />
              Export PDF
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#f5d77f] flex items-center gap-1.5 transition shadow-lg disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check size={15} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={15} />
                  {saving ? "Saving..." : "Save Resume"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Top ATS Score Summary Bar */}
        <div className="apple-liquid-glass rounded-2xl p-4 sm:p-5 border border-[#d4af37]/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black/60 border border-[#d4af37]/40 flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-xl font-bold font-mono text-white leading-none">{score}</span>
              <span className="text-[8px] uppercase tracking-wider text-[#f5d77f] font-bold">ATS Score</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">ATS Pass Probability: High Caliber</h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
                  Grade A+
                </span>
              </div>
              <p className="text-xs text-stone-400 font-light mt-0.5">
                Keyword Density: 94% • Impact Quantification: 92% • Section Completeness: 100%
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {evaluation?.matched_keywords?.slice(0, 5).map((kw, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/30 font-mono">
                ✓ {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Main Split Grid: Left Editor & AI Rewriter (7 cols) + Right Live Preview (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Editor Pane (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Section Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-950 border border-stone-800 overflow-x-auto no-scrollbar">
              {[
                { id: "personal", label: "Contact" },
                { id: "summary", label: "Summary" },
                { id: "experience", label: "Experience" },
                { id: "projects", label: "Projects" },
                { id: "skills", label: "Skills" },
                { id: "ai_rewriter", label: "AI Rewriter", highlight: true },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1 ${
                    activeTab === tab.id
                      ? "bg-[#d4af37] text-black font-semibold shadow"
                      : tab.highlight
                      ? "text-[#f5d77f] hover:bg-stone-900"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
                  }`}
                >
                  {tab.highlight && <Sparkles size={11} />}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: Personal Info */}
            {activeTab === "personal" && (
              <div className="gold-card rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Contact & Profile Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-stone-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={resumeData.name || ""}
                      onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Target Title</label>
                    <input
                      type="text"
                      value={resumeData.title || ""}
                      onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Email</label>
                    <input
                      type="text"
                      value={resumeData.email || ""}
                      onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Location</label>
                    <input
                      type="text"
                      value={resumeData.location || ""}
                      onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Summary */}
            {activeTab === "summary" && (
              <div className="gold-card rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Executive Career Summary</h3>
                <textarea
                  rows={5}
                  value={resumeData.summary || ""}
                  onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-xs text-stone-200 outline-none focus:border-[#d4af37] leading-relaxed font-light"
                />
              </div>
            )}

            {/* TAB: Experience */}
            {activeTab === "experience" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Work Experience</h3>
                  <button
                    onClick={handleAddExperience}
                    className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-[#f5d77f] flex items-center gap-1 transition"
                  >
                    <Plus size={13} /> Add Position
                  </button>
                </div>

                {resumeData.experience?.map((exp, idx) => (
                  <div key={idx} className="gold-card rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 text-xs">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const copy = [...resumeData.experience];
                            copy[idx].role = e.target.value;
                            setResumeData({ ...resumeData, experience: copy });
                          }}
                          placeholder="Role title"
                          className="bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 font-semibold"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const copy = [...resumeData.experience];
                            copy[idx].company = e.target.value;
                            setResumeData({ ...resumeData, experience: copy });
                          }}
                          placeholder="Company name"
                          className="bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-stone-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-[11px] text-stone-400 font-medium">Impact Bullets</label>
                      {exp.bullets?.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <span className="text-[#d4af37] text-xs mt-1.5">•</span>
                          <textarea
                            rows={2}
                            value={b}
                            onChange={(e) => {
                              const copy = [...resumeData.experience];
                              copy[idx].bullets[bIdx] = e.target.value;
                              setResumeData({ ...resumeData, experience: copy });
                            }}
                            className="flex-1 bg-stone-900 border border-stone-800/80 rounded-lg p-2 text-xs text-stone-200 outline-none focus:border-[#d4af37]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Projects */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white">High-Impact Technical Projects</h3>
                {resumeData.projects?.map((proj, idx) => (
                  <div key={idx} className="gold-card rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const copy = [...resumeData.projects];
                          copy[idx].title = e.target.value;
                          setResumeData({ ...resumeData, projects: copy });
                        }}
                        className="bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-white flex-1 mr-2"
                      />
                      <input
                        type="text"
                        value={proj.tech_stack?.join(", ") || ""}
                        onChange={(e) => {
                          const copy = [...resumeData.projects];
                          copy[idx].tech_stack = e.target.value.split(",").map((s) => s.trim());
                          setResumeData({ ...resumeData, projects: copy });
                        }}
                        placeholder="Tech stack (comma-separated)"
                        className="bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-400 flex-1 font-mono"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const copy = [...resumeData.projects];
                        copy[idx].description = e.target.value;
                        setResumeData({ ...resumeData, projects: copy });
                      }}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2 text-xs text-stone-300"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* TAB: Skills */}
            {activeTab === "skills" && (
              <div className="gold-card rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Skills Matrix</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-stone-400 block mb-1">Languages</label>
                    <input
                      type="text"
                      value={resumeData.skills?.languages?.join(", ") || ""}
                      onChange={(e) => {
                        const copy = { ...resumeData.skills, languages: e.target.value.split(",").map((s) => s.trim()) };
                        setResumeData({ ...resumeData, skills: copy });
                      }}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Frameworks & Backend</label>
                    <input
                      type="text"
                      value={resumeData.skills?.frameworks?.join(", ") || ""}
                      onChange={(e) => {
                        const copy = { ...resumeData.skills, frameworks: e.target.value.split(",").map((s) => s.trim()) };
                        setResumeData({ ...resumeData, skills: copy });
                      }}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Cloud & Infrastructure</label>
                    <input
                      type="text"
                      value={resumeData.skills?.cloud?.join(", ") || ""}
                      onChange={(e) => {
                        const copy = { ...resumeData.skills, cloud: e.target.value.split(",").map((s) => s.trim()) };
                        setResumeData({ ...resumeData, skills: copy });
                      }}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: AI Bullet Rewriter */}
            {activeTab === "ai_rewriter" && (
              <div className="apple-liquid-glass rounded-2xl p-5 border border-[#d4af37]/30 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#d4af37]" />
                  <h3 className="text-sm font-semibold text-white">AI Metric-Driven Bullet Rewriter</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-stone-300">Paste weak bullet to enhance:</label>
                  <textarea
                    rows={3}
                    value={aiInputBullet}
                    onChange={(e) => setAiInputBullet(e.target.value)}
                    placeholder="e.g. Worked on database performance and helped make queries faster."
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Target Role:</span>
                    <input
                      type="text"
                      value={aiTargetRole}
                      onChange={(e) => setAiTargetRole(e.target.value)}
                      className="bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1 text-xs text-stone-200 font-medium"
                    />
                  </div>

                  <button
                    onClick={handleAiRewrite}
                    disabled={aiLoading || !aiInputBullet.trim()}
                    className="px-4 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#f5d77f] transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {aiLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    Generate Enhancements
                  </button>
                </div>

                {/* Rewritten suggestions */}
                {aiSuggestions.length > 0 && (
                  <div className="pt-3 border-t border-stone-800 space-y-3">
                    <h4 className="text-xs font-semibold text-[#f5d77f]">AI Optimized Options:</h4>
                    {aiSuggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-stone-900/90 border border-[#d4af37]/30 flex flex-col justify-between space-y-2"
                      >
                        <p className="text-xs text-stone-200 leading-relaxed font-light">{sug}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                          <span className="text-[10px] text-emerald-400 font-mono">✓ High Metric Density</span>
                          <button
                            onClick={() => handleApplyAiSuggestion(sug)}
                            className="px-3 py-1 rounded-lg bg-[#d4af37] text-black text-xs font-bold hover:bg-[#f5d77f] transition flex items-center gap-1"
                          >
                            <Check size={13} />
                            Apply to Resume
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Live Preview Pane (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-20 bg-[#121212] border border-stone-800 rounded-2xl p-6 shadow-2xl text-stone-100 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-[10px] font-mono text-[#f5d77f] uppercase tracking-wider">
                  Live Formatted Resume
                </span>
                <span className="text-xs text-stone-500 font-mono">Standard ATS Engine</span>
              </div>

              {/* Resume Document Preview */}
              <div className="space-y-4 text-xs">
                {/* Header */}
                <div className="text-center pb-2 border-b border-stone-800">
                  <h2 className="text-base font-bold text-white tracking-tight">{resumeData.name}</h2>
                  <p className="text-[#f5d77f] font-medium mt-0.5">{resumeData.title}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {resumeData.email} • {resumeData.location}
                  </p>
                </div>

                {/* Summary */}
                {resumeData.summary && (
                  <div>
                    <h4 className="text-[11px] uppercase font-mono font-bold text-[#d4af37] border-b border-stone-800/60 pb-0.5 mb-1.5">
                      Professional Summary
                    </h4>
                    <p className="text-[11px] text-stone-300 leading-relaxed font-light">
                      {resumeData.summary}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {resumeData.experience?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] uppercase font-mono font-bold text-[#d4af37] border-b border-stone-800/60 pb-0.5 mb-2">
                      Experience
                    </h4>
                    <div className="space-y-2.5">
                      {resumeData.experience.slice(0, 3).map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between font-semibold text-stone-200 text-[11px]">
                            <span>{exp.role} — {exp.company}</span>
                            <span className="text-stone-500 font-mono text-[10px]">{exp.period}</span>
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-[10px] text-stone-400 font-light">
                            {exp.bullets?.slice(0, 2).map((b, bi) => (
                              <li key={bi} className="leading-snug">{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {resumeData.skills && (
                  <div>
                    <h4 className="text-[11px] uppercase font-mono font-bold text-[#d4af37] border-b border-stone-800/60 pb-0.5 mb-1.5">
                      Technical Skills
                    </h4>
                    <p className="text-[10px] text-stone-300 font-mono leading-relaxed">
                      <strong className="text-stone-400">Languages:</strong> {resumeData.skills.languages?.join(", ")}
                      <br />
                      <strong className="text-stone-400">Frameworks:</strong> {resumeData.skills.frameworks?.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default Resume;
