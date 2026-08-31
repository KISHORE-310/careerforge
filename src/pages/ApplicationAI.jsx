import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Send,
  Building2,
  Briefcase,
  Layers,
  RefreshCw,
  ChevronRight,
  FileText,
  Mail,
  Zap,
} from "lucide-react";
import { generateApplicationAI } from "../services/api";

const PRESETS = [
  {
    title: "Senior Full Stack @ Stripe",
    company: "Stripe",
    role: "Staff Software Engineer",
    type: "cover_letter",
    tone: "Metric-Focused & Confident",
    keyPoints: "Architected distributed payment routing engine processing 20M requests/day; reduced p99 latency by 35% with Redis caching and Go.",
  },
  {
    title: "Referral Request @ Google",
    company: "Google",
    role: "Senior Backend Engineer",
    type: "referral_request",
    tone: "Warm & Collaborative",
    keyPoints: "Built high-throughput Spanner microservices, active open-source contributor to Kubernetes client libraries.",
  },
  {
    title: "LinkedIn InMail @ Meta",
    company: "Meta",
    role: "Production Engineer",
    type: "linkedin_pitch",
    tone: "Concise & Direct (Recruiter-friendly)",
    keyPoints: "Led infrastructure reliability scaling, reduced MTTR by 50% using eBPF observability and automated remediation.",
  },
];

function ApplicationAI() {
  const [docType, setDocType] = useState("cover_letter");
  const [company, setCompany] = useState("Stripe");
  const [role, setRole] = useState("Senior Full Stack Engineer");
  const [tone, setTone] = useState("Metric-Focused & Confident");
  const [keyPoints, setKeyPoints] = useState("Designed high-throughput Kafka microservices and reduced p99 latency by 45% using Redis and Go.");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);

  const docTypes = [
    { id: "cover_letter", label: "Cover Letter", desc: "Structured narrative showing strategic alignment" },
    { id: "linkedin_pitch", label: "LinkedIn Recruiter Outreach", desc: "Short high-converting direct message" },
    { id: "referral_request", label: "Referral Request", desc: "Warm message for engineering connections" },
    { id: "follow_up", label: "Interview Follow-Up", desc: "Post-interview thank you highlighting technical points" },
  ];

  const handleApplyPreset = (preset) => {
    setCompany(preset.company);
    setRole(preset.role);
    setDocType(preset.type);
    setTone(preset.tone);
    setKeyPoints(preset.keyPoints);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateApplicationAI({
        type: docType,
        company,
        role,
        tone,
        key_points: keyPoints,
      });
      if (res.success) {
        setGeneratedContent(res.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format = "txt") => {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${company}_${role.replace(/\s+/g, "_")}_${docType}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = generatedContent
    ? generatedContent.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#f5d77f] font-semibold border border-[#d4af37]/30">
                Application Intelligence
              </span>
            </div>
            <h1 className="text-2xl font-serif-header text-white">
              Application AI Writer
            </h1>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Craft high-conversion cover letters, recruiter pitches, and referral outreach messages tailored to target tech companies.
            </p>
          </div>
        </div>

        {/* Quick Presets Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-mono text-stone-500 shrink-0">Quick Presets:</span>
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-[#d4af37]/20 border border-stone-800 hover:border-[#d4af37]/40 text-xs text-stone-300 hover:text-[#f5d77f] whitespace-nowrap transition flex items-center gap-1.5"
            >
              <Zap size={12} className="text-[#d4af37]" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Doc Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300">Outreach Type</label>
              <div className="grid grid-cols-1 gap-2">
                {docTypes.map((dt) => (
                  <button
                    key={dt.id}
                    onClick={() => setDocType(dt.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                      docType === dt.id
                        ? "bg-[#d4af37]/15 border-[#d4af37] text-white"
                        : "bg-[#141414] border-stone-800 text-stone-400 hover:border-stone-700"
                    }`}
                  >
                    <span className="font-semibold text-stone-200">{dt.label}</span>
                    <span className="text-[11px] text-stone-400 font-light mt-0.5">{dt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Details */}
            <div className="gold-card rounded-2xl p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-stone-400 block mb-1">Target Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Target Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Tone & Persona</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 outline-none focus:border-[#d4af37]"
                >
                  <option>Metric-Focused & Confident</option>
                  <option>Technical Deep-Dive</option>
                  <option>Concise & Direct (Recruiter-friendly)</option>
                  <option>Warm & Collaborative</option>
                </select>
              </div>

              <div>
                <label className="text-stone-400 block mb-1">Key Selling Points / Achievements</label>
                <textarea
                  rows={3}
                  value={keyPoints}
                  onChange={(e) => setKeyPoints(e.target.value)}
                  placeholder="e.g. Led migration to GraphQL, reduced latency by 40%, managed 5 engineers"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-200 outline-none focus:border-[#d4af37]"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-[#f5d77f] transition flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50 mt-2"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generate Tailored Outreach
              </button>
            </div>
          </div>

          {/* Right Preview Output (7 cols) */}
          <div className="lg:col-span-7">
            <div className="apple-liquid-glass rounded-2xl p-6 border border-[#d4af37]/30 shadow-2xl space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#d4af37]" />
                    <span className="text-xs font-semibold text-white">Generated Content</span>
                    {wordCount > 0 && (
                      <span className="text-[10px] font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800">
                        {wordCount} words
                      </span>
                    )}
                  </div>

                  {generatedContent && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs transition"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        {copied ? "Copied" : "Copy"}
                      </button>

                      <button
                        onClick={() => handleDownload("txt")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs transition"
                        title="Download as Plain Text"
                      >
                        <Download size={13} />
                        .txt
                      </button>

                      <button
                        onClick={() => handleDownload("md")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs transition"
                        title="Download as Markdown"
                      >
                        <FileText size={13} />
                        .md
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 rounded-xl bg-[#121212] border border-stone-800/80 min-h-[360px] text-xs text-stone-200 leading-relaxed whitespace-pre-wrap font-light">
                  {generatedContent || (
                    <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 py-16">
                      <Sparkles size={28} className="text-[#d4af37]/40 mb-2" />
                      <p>Click "Generate Tailored Outreach" to synthesize custom content for {company}.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-stone-500 flex items-center justify-between pt-2">
                <span>Optimized for recruiter attention spans & ATS scanning</span>
                <span className="font-mono text-[#f5d77f]">CareerForge AI Core</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default ApplicationAI;

