import {
  FileText,
  Compass,
  Lightbulb,
  Briefcase,
  BarChart3,
  BookOpen,
} from "lucide-react";

function Features() {
  const features = [
    {
      icon: <FileText size={22} className="text-[#d4af37]" />,
      title: "ATS Resume Analysis",
      description:
        "Extract technical keywords and evaluate your resume structure against industry benchmarks.",
    },
    {
      icon: <Compass size={22} className="text-[#d4af37]" />,
      title: "Tailored Roadmaps",
      description:
        "Receive personalized 6-week learning schedules tailored to your target job profile.",
    },
    {
      icon: <Lightbulb size={22} className="text-[#d4af37]" />,
      title: "Skill Gap Detection",
      description:
        "Identify missing core requirements and bridge gaps before submitting job applications.",
    },
    {
      icon: <Briefcase size={22} className="text-[#d4af37]" />,
      title: "DSA Practice Tracker",
      description:
        "Master coding interviews with categorized algorithms practice, notes, and bookmarking.",
    },
    {
      icon: <BarChart3 size={22} className="text-[#d4af37]" />,
      title: "Readiness Index",
      description:
        "Quantify your career preparation with metrics calculated across your projects and skill proficiencies.",
    },
    {
      icon: <BookOpen size={22} className="text-[#d4af37]" />,
      title: "Curated Learning",
      description:
        "Access structured topic breakdowns and high-impact resources for each targeted competency.",
    },
  ];

  return (
    <section id="features" className="bg-[#0a0a0a] text-stone-200 py-20 px-6 border-t border-stone-900">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Heading */}
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-light">
            Core Modules
          </p>

          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Engineered for Job Readiness
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto leading-relaxed font-light">
            Everything you need to calibrate your technical capabilities and prepare for competitive engineering interviews.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#0f0f0f] border border-[#d4af37]/15 rounded-xl p-6 transition-all duration-200 hover:border-[#d4af37]/40 hover:bg-[#131313] hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                  {feature.icon}
                </div>

                <h3 className="text-base font-normal text-stone-100 tracking-tight">
                  {feature.title}
                </h3>

                <p className="text-xs text-stone-400 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;