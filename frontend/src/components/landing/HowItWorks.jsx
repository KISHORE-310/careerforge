import {
  Upload,
  Brain,
  Map,
  CheckCircle2,
} from "lucide-react";

function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <Upload size={18} className="text-[#d4af37]" />,
      title: "Upload & Parse",
      description: "Submit your engineering resume for instant structural and keyword extraction.",
    },
    {
      num: "02",
      icon: <Brain size={18} className="text-[#d4af37]" />,
      title: "ATS & Gap Analysis",
      description: "Match profile against target tech roles and identify missing proficiencies.",
    },
    {
      num: "03",
      icon: <Map size={18} className="text-[#d4af37]" />,
      title: "6-Week Roadmap",
      description: "Follow customized weekly milestones tailored to close your specific gaps.",
    },
    {
      num: "04",
      icon: <CheckCircle2 size={18} className="text-[#d4af37]" />,
      title: "DSA & Interview Prep",
      description: "Practice key problem patterns with progress tracking and revision notes.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-[#070707] text-stone-200 py-20 px-6 border-t border-stone-900">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Heading */}
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-light">
            Methodology
          </p>

          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            How CareerForge Operates
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto leading-relaxed font-light">
            A structured four-step methodology to transition from skill assessment to interview readiness.
          </p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-[#0e0e0e] border border-[#d4af37]/15 rounded-xl p-5 space-y-3 relative hover:border-[#d4af37]/40 hover:bg-[#121212] transition duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-xs font-mono text-[#d4af37]/60 tracking-wider">
                  {step.num}
                </span>
              </div>

              <h3 className="text-sm font-normal text-stone-100">
                {step.title}
              </h3>

              <p className="text-xs text-stone-400 leading-relaxed font-light">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;