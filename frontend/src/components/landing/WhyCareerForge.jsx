import {
  Check,
  Minus,
} from "lucide-react";

function WhyCareerForge() {
  const comparisons = [
    {
      feature: "Target Role Skill Gap Analysis",
      careerforge: true,
      traditional: false,
    },
    {
      feature: "Automated ATS Resume Parsing",
      careerforge: true,
      traditional: false,
    },
    {
      feature: "Custom 6-Week Learning Roadmaps",
      careerforge: true,
      traditional: false,
    },
    {
      feature: "DSA Topic & Revision Tracking",
      careerforge: true,
      traditional: false,
    },
    {
      feature: "Unified Career Readiness Metric",
      careerforge: true,
      traditional: false,
    },
    {
      feature: "Integrated Preparation Dashboard",
      careerforge: true,
      traditional: false,
    },
  ];

  return (
    <section id="why-careerforge" className="bg-[#0a0a0a] text-stone-200 py-20 px-6 border-t border-stone-900">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Heading */}
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#d4af37] font-light">
            Comparison
          </p>

          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Structured Preparation vs. Generic Guidance
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto leading-relaxed font-light">
            CareerForge combines profile diagnostics, role matching, and practice tracking in one focused interface.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-xl border border-[#d4af37]/20 bg-[#0e0e0e]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] border-b border-stone-800 text-stone-300">
              <tr>
                <th className="py-3.5 px-6 font-normal">Feature</th>
                <th className="py-3.5 px-6 font-normal text-[#d4af37] text-center w-36">
                  CareerForge
                </th>
                <th className="py-3.5 px-6 font-normal text-stone-500 text-center w-36">
                  Traditional Methods
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-800/60 font-light">
              {comparisons.map((item, index) => (
                <tr key={index} className="hover:bg-stone-900/40 transition">
                  <td className="py-3 px-6 text-stone-200">{item.feature}</td>

                  <td className="py-3 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#d4af37]/15 text-[#d4af37]">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                  </td>

                  <td className="py-3 px-6 text-center">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-900 text-stone-600">
                      <Minus size={12} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default WhyCareerForge;