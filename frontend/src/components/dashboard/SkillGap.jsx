import {
  Target,
  Check,
  X,
} from "lucide-react";

function SkillGap({ skillGap }) {
  if (!skillGap) return null;

  return (
    <div className="rounded-xl border border-stone-800 bg-[#0e0e0e] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
            <Target size={16} />
          </div>
          <div>
            <h2 className="text-sm font-normal text-stone-100">
              Role Skill Gap Calibration
            </h2>
            <p className="text-xs text-stone-500 font-light">
              Matched against required technical competencies for <span className="text-[#d4af37]">{skillGap.target_role}</span>.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-light text-stone-400">Match Index</span>
          <p className="text-base font-light text-[#d4af37] font-mono leading-none">
            {skillGap.readiness}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-[#9e8334] to-[#d4af37] transition-all duration-500"
          style={{ width: `${skillGap.readiness}%` }}
        />
      </div>

      {/* Skills Comparison */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Matched */}
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-wider font-light text-emerald-400 block">
            Matched Competencies ({skillGap.matched_skills?.length || 0})
          </span>

          <div className="flex flex-wrap gap-1.5">
            {skillGap.matched_skills?.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 font-light"
              >
                <Check size={11} className="text-emerald-400" />
                {skill}
              </span>
            ))}
            {(!skillGap.matched_skills || skillGap.matched_skills.length === 0) && (
              <span className="text-xs text-stone-500 font-light">None detected yet.</span>
            )}
          </div>
        </div>

        {/* Missing */}
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-wider font-light text-amber-400 block">
            Missing / Recommended ({skillGap.missing_skills?.length || 0})
          </span>

          <div className="flex flex-wrap gap-1.5">
            {skillGap.missing_skills?.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-amber-950/20 border border-amber-900/40 text-amber-300 font-light"
              >
                <X size={11} className="text-amber-400" />
                {skill}
              </span>
            ))}
            {(!skillGap.missing_skills || skillGap.missing_skills.length === 0) && (
              <span className="text-xs text-emerald-400 font-light">All required skills matched!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillGap;