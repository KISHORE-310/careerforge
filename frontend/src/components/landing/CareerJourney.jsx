import {
  Target,
  FileSearch,
  BookOpen,
  FolderGit2,
  MessagesSquare,
  Trophy,
} from "lucide-react";

function CareerJourney() {
  const steps = [
    {
      icon: <Target size={18} className="text-[#d4af37]" />,
      title: "Define Target Engineering Role",
      description: "Select from specialized tracks like Backend, Frontend, Cloud, AI/ML, or DevOps.",
    },
    {
      icon: <FileSearch size={18} className="text-[#d4af37]" />,
      title: "Evaluate Resume & Keyword Fit",
      description: "Identify missing ATS keywords and quantify structural gaps against requirements.",
    },
    {
      icon: <BookOpen size={18} className="text-[#d4af37]" />,
      title: "Execute Weekly Milestones",
      description: "Follow customized schedules targeting high-frequency industry technologies.",
    },
    {
      icon: <FolderGit2 size={18} className="text-[#d4af37]" />,
      title: "Build Production-Grade Projects",
      description: "Implement practical full-stack projects showcasing clean code and architecture.",
    },
    {
      icon: <MessagesSquare size={18} className="text-[#d4af37]" />,
      title: "Master DSA Patterns",
      description: "Solve problem archetypes, track revision notes, and prepare for live screens.",
    },
    {
      icon: <Trophy size={18} className="text-[#d4af37]" />,
      title: "Track Interview Readiness",
      description: "Reach 85%+ readiness on your composite score before applying to top companies.",
    },
  ];

  return (
    <section id="curriculum" className="bg-[#070707] text-stone-200 py-20 px-6 border-t border-stone-900">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Heading */}
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-light">
            Career Progression
          </p>

          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            End-to-End Preparation Lifecycle
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto leading-relaxed font-light">
            A continuous progression designed to take engineers from self-assessment to interview readiness.
          </p>
        </div>

        {/* List */}
        <div className="grid sm:grid-cols-2 gap-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-[#0d0d0d] border border-[#d4af37]/15 rounded-xl p-4 flex items-start gap-3.5 hover:border-[#d4af37]/40 hover:bg-[#121212] transition"
            >
              <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center shrink-0 mt-0.5">
                {step.icon}
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-medium text-stone-100 tracking-tight">
                  <span className="text-[#d4af37] font-mono mr-1.5">{index + 1}.</span>
                  {step.title}
                </h3>
                <p className="text-xs text-stone-400 font-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CareerJourney;