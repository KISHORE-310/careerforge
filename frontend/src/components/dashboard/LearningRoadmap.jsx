import { BookOpen, CheckCircle2 } from "lucide-react";

function LearningRoadmap({ roadmap }) {
  if (!roadmap || roadmap.length === 0) return null;

  return (
    <div className="rounded-xl border border-stone-800 bg-[#0e0e0e] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
          <BookOpen size={16} />
        </div>
        <div>
          <h2 className="text-sm font-normal text-stone-100">
            6-Week Structured Learning Curriculum
          </h2>
          <p className="text-xs text-stone-500 font-light">
            Sequential milestones to master missing competencies.
          </p>
        </div>
      </div>

      {/* Grid of Weeks */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {roadmap.map((step, index) => (
          <div
            key={index}
            className="rounded-lg border border-stone-800/90 bg-[#131313] p-4 space-y-2 hover:border-[#d4af37]/30 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/20">
                Week {step.week}
              </span>
              <span className="text-[10px] text-stone-500 font-light">Milestone {index + 1}</span>
            </div>

            <h3 className="text-xs font-normal text-stone-200">
              {step.title}
            </h3>

            <p className="text-[11px] text-stone-400 font-light leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LearningRoadmap;