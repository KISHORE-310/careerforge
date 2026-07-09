import {
  Upload,
  Brain,
  Map,
  Rocket,
} from "lucide-react";

function HowItWorks() {
  const steps = [
    {
      icon: <Upload size={42} className="text-blue-500" />,
      title: "Upload Resume",
      description:
        "Upload your resume securely and let CareerForge understand your current skills.",
    },
    {
      icon: <Brain size={42} className="text-blue-500" />,
      title: "AI Analysis",
      description:
        "Our AI analyzes your resume, identifies missing skills, and measures your readiness.",
    },
    {
      icon: <Map size={42} className="text-blue-500" />,
      title: "Personalized Roadmap",
      description:
        "Receive a step-by-step learning roadmap tailored to your dream role.",
    },
    {
      icon: <Rocket size={42} className="text-blue-500" />,
      title: "Become Job Ready",
      description:
        "Complete projects, prepare for interviews, and confidently apply for jobs.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="bg-[#030712] text-white py-28 px-8"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center">
          <p className="text-blue-500 uppercase tracking-[6px] font-semibold">
            HOW IT WORKS
          </p>

          <h2 className="text-5xl md:text-6xl font-bold mt-5">
            Your Journey To
            <br />
            A Tech Career
          </h2>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto mt-8 leading-8">
            CareerForge guides you from resume analysis to becoming
            interview-ready through a personalized AI-powered journey.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-3 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.25)]"
            >
              <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>

              <h3 className="text-2xl font-bold">
                {step.title}
              </h3>

              <p className="text-gray-400 mt-5 leading-8">
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