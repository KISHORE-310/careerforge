import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Briefcase,
  DollarSign,
  Cpu,
  FileUp,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";
import { completeOnboarding, uploadResume } from "../services/api";

const TARGET_ROLES = [
  "Senior Full Stack Engineer",
  "Backend / Distributed Systems Engineer",
  "Frontend Systems & UI Architect",
  "AI / LLM Platform Engineer",
  "Cloud & DevOps Architect",
  "Data Scientist / ML Engineer",
];

const POPULAR_SKILLS = [
  "TypeScript", "React", "Node.js", "Python", "Go", "Java", "PostgreSQL",
  "Redis", "Docker", "Kubernetes", "AWS", "System Design", "GraphQL", "Kafka"
];

function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    career_goal: "Land a Senior Engineering role at a Tier-1 tech company within 90 days",
    target_role: "Senior Full Stack Engineer",
    experience_level: "Senior (4-6 years)",
    target_salary: "$160,000 - $200,000",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "System Design", "Docker"],
    resumeFile: null,
  });

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
      };
    });
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      if (formData.resumeFile) {
        await uploadResume(formData.resumeFile, formData.target_role);
      }
      await completeOnboarding({
        career_goal: formData.career_goal,
        target_role: formData.target_role,
        experience_level: formData.experience_level,
        target_salary: formData.target_salary,
        skills: formData.skills,
      });

      // Update local storage user
      const existing = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existing,
          target_role: formData.target_role,
          onboarding_completed: true,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-stone-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Brand */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#d4af37] text-black flex items-center justify-center font-bold">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-white">CareerForge AI</span>
            <span className="text-[10px] text-stone-500 block">Synthesis Onboarding</span>
          </div>
        </div>
        <div className="text-xs font-mono text-[#d4af37]">
          Step {step} of 4
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl w-full mx-auto my-6 bg-stone-900 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#d4af37] to-[#f5d77f] h-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Center Step Container */}
      <div className="max-w-2xl w-full mx-auto apple-liquid-glass rounded-2xl p-6 sm:p-10 shadow-2xl my-auto">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono text-[#d4af37] uppercase tracking-wider">
                Phase 1: Ambition & Objective
              </span>
              <h2 className="text-2xl font-serif-header text-white mt-1">
                What is your primary career target?
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                CareerForge AI customizes ATS analyzers, interview rubrics, and roadmaps based on your target role.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-stone-300">Select Target Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, target_role: role })}
                    className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                      formData.target_role === role
                        ? "bg-[#d4af37]/15 border-[#d4af37] text-white shadow-sm"
                        : "bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200"
                    }`}
                  >
                    <span>{role}</span>
                    {formData.target_role === role && <CheckCircle2 size={15} className="text-[#d4af37]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-300">Target Career Goal</label>
              <input
                type="text"
                value={formData.career_goal}
                onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 outline-none focus:border-[#d4af37]"
                placeholder="e.g. Land a Senior Engineering position with high equity in 6 months"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono text-[#d4af37] uppercase tracking-wider">
                Phase 2: Seniority & Market Compensation
              </span>
              <h2 className="text-2xl font-serif-header text-white mt-1">
                Experience Level & Compensation
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Used to calibrate interview difficulty and market salary benchmarking percentiles.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-stone-300">Current Seniority</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {["Early Career (1-3 yrs)", "Senior (4-6 yrs)", "Staff / Lead (7+ yrs)"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, experience_level: lvl })}
                    className={`p-3 rounded-xl border text-center text-xs transition ${
                      formData.experience_level === lvl
                        ? "bg-[#d4af37]/15 border-[#d4af37] text-white"
                        : "bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-stone-300">Target Compensation Band</label>
              <input
                type="text"
                value={formData.target_salary}
                onChange={(e) => setFormData({ ...formData, target_salary: e.target.value })}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 outline-none focus:border-[#d4af37]"
                placeholder="e.g. $160,000 - $200,000"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono text-[#d4af37] uppercase tracking-wider">
                Phase 3: Core Competencies
              </span>
              <h2 className="text-2xl font-serif-header text-white mt-1">
                Select your core technical stack
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Select the tools, languages, and systems you are proficient in.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = formData.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? "bg-[#d4af37] text-black border-[#d4af37] font-semibold"
                        : "bg-stone-900/70 text-stone-300 border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-stone-500 italic">
              *You can add custom frameworks, databases, and tools anytime in the Skill Intelligence dashboard.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs font-mono text-[#d4af37] uppercase tracking-wider">
                Phase 4: Synthesis & Profile Launch
              </span>
              <h2 className="text-2xl font-serif-header text-white mt-1">
                Attach Resume & Launch
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Upload your PDF resume to extract bullet impact metrics and calculate your initial Readiness Score.
              </p>
            </div>

            <div className="border-2 border-dashed border-stone-800 hover:border-[#d4af37]/50 rounded-2xl p-6 text-center transition bg-stone-950/40">
              <FileUp size={32} className="mx-auto text-[#d4af37] mb-2 opacity-80" />
              <p className="text-xs text-stone-300 font-medium">
                {formData.resumeFile ? formData.resumeFile.name : "Drag & drop your PDF resume here"}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">or click to browse local files (PDF up to 10MB)</p>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFormData({ ...formData, resumeFile: e.target.files[0] });
                  }
                }}
                className="hidden"
                id="onboarding-resume"
              />
              <label
                htmlFor="onboarding-resume"
                className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-xs text-stone-300 hover:text-white cursor-pointer"
              >
                {formData.resumeFile ? "Change File" : "Select PDF File"}
              </label>
            </div>

            <div className="p-3.5 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center gap-3">
              <BrainCircuit size={20} className="text-[#d4af37] shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-[#f5d77f]">AI Synthesis Ready:</span> We will generate your baseline ATS match score, 90-day learning roadmap, and tailored job recommendations immediately upon completion.
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-stone-800/80 mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#d4af37] text-black text-xs font-semibold hover:bg-[#f5d77f] transition shadow-lg"
            >
              Next Step
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#d4af37] text-black text-xs font-bold hover:bg-[#f5d77f] transition shadow-xl disabled:opacity-50"
            >
              {loading ? "Synthesizing Profile..." : "Synthesize & Launch Dashboard"}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-center text-stone-600 text-xs py-2">
        CareerForge AI Operating System • Obsidian Gold Architecture
      </div>
    </div>
  );
}

export default Onboarding;
