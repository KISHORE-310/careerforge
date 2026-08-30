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
} from "lucide-react";
import { generateApplicationAI } from "../services/api";

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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
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
                  </div>

                  {generatedContent && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs transition"
                    >
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
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
