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
      icon: <FileText size={42} className="text-blue-500" />,
      title: "AI Resume Analysis",
      description:
        "Analyze your resume instantly and discover strengths, weaknesses, and missing skills.",
    },
    {
      icon: <Compass size={42} className="text-blue-500" />,
      title: "Personalized Roadmap",
      description:
        "Get a customized learning path based on your dream job and current skills.",
    },
    {
      icon: <Lightbulb size={42} className="text-blue-500" />,
      title: "Project Recommendations",
      description:
        "Build real-world projects that strengthen your portfolio and impress recruiters.",
    },
    {
      icon: <Briefcase size={42} className="text-blue-500" />,
      title: "Interview Preparation",
      description:
        "Practice coding, aptitude, and technical interview questions with AI guidance.",
    },
    {
      icon: <BarChart3 size={42} className="text-blue-500" />,
      title: "Progress Tracking",
      description:
        "Track your learning journey and measure your career readiness over time.",
    },
    {
      icon: <BookOpen size={42} className="text-blue-500" />,
      title: "Learning Resources",
      description:
        "Access curated courses, documentation, and tutorials for every skill.",
    },
  ];

  return (
   <section
  id="features"
  className="bg-black text-white py-28 px-8"
>
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center">

          <p className="text-blue-500 font-semibold uppercase tracking-[6px]">
            FEATURES
          </p>

          <h2 className="text-5xl md:text-6xl font-bold mt-5 leading-tight">
            Everything You Need
            <br />
            To Become Job-Ready
          </h2>

          <p className="text-gray-400 mt-8 text-lg max-w-3xl mx-auto leading-8">
            CareerForge combines AI-powered career guidance, personalized
            roadmaps, interview preparation, project recommendations, and
            learning resources into one modern platform.
          </p>

        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">

          {features.map((feature, index) => (
            <div
              key={index}
              className="
              group
              bg-gray-900
              border
              border-gray-800
              rounded-3xl
              p-8
              transition-all
              duration-300
              hover:-translate-y-3
              hover:border-blue-500
              hover:shadow-[0_0_40px_rgba(37,99,235,0.25)]
              "
            >

              <div className="mb-6 transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>

              <h3 className="text-3xl font-bold">
                {feature.title}
              </h3>

              <p className="text-gray-400 mt-6 leading-8 text-lg">
                {feature.description}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;