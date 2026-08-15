import {
  CheckCircle2,
  AlertCircle,
  Award,
} from "lucide-react";

function ResumeAnalysis({ resumeScore }) {
  if (!resumeScore) return null;

  return (
    <div className="rounded-xl border border-stone-800 bg-[#0e0e0e] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
            <Award size={16} />
          </div>
          <div>
            <h2 className="text-sm font-normal text-stone-100">
              Resume Structural Diagnostic
            </h2>
            <p className="text-xs text-stone-500 font-light">
              Quality feedback and impact analysis.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-xs text-[#d4af37] font-light">
          <span>Grade</span>
          <span className="font-normal font-mono">{resumeScore.grade}</span>
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider font-light text-emerald-400">
            Identified Strengths
          </h3>

          <div className="space-y-2">
            {resumeScore.strengths?.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-3 text-xs text-stone-300 font-light leading-relaxed"
              >
                <CheckCircle2 size={14} className="mt-0.5 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider font-light text-amber-400">
            Recommended Improvements
          </h3>

          <div className="space-y-2">
            {resumeScore.weaknesses?.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 rounded-lg border border-amber-900/30 bg-amber-950/10 p-3 text-xs text-stone-300 font-light leading-relaxed"
              >
                <AlertCircle size={14} className="mt-0.5 text-amber-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeAnalysis;