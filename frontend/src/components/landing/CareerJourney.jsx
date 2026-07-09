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
      icon: <Target size={40} className="text-blue-500" />,
      title: "Choose Your Career",
      description:
        "Select your dream career path like Software Engineering, AI/ML, Data Science, Cybersecurity, Cloud, DevOps, and more.",
    },
    {
      icon: <FileSearch size={40} className="text-blue-500" />,
      title: "Analyze Your Resume",
      description:
        "Upload your resume and receive AI-powered feedback, ATS score, and personalized recommendations.",
    },
    {
      icon: <BookOpen size={40} className="text-blue-500" />,
      title: "Learn Missing Skills",
      description:
        "Follow a customized roadmap with curated courses, documentation, and practice resources.",
    },
    {
      icon: <FolderGit2 size={40} className="text-blue-500" />,
      title: "Build Real Projects",
      description:
        "Create portfolio-worthy projects that strengthen your resume and GitHub profile.",
    },
    {
      icon: <MessagesSquare size={40} className="text-blue-500" />,
      title: "Ace Interviews",
      description:
        "Prepare with AI-generated interview questions, coding challenges, and mock interviews.",
    },
    {
      icon: <Trophy size={40} className="text-blue-500" />,
      title: "Land Your Dream Career",
      description:
        "Track your progress, improve continuously, and become job-ready with confidence.",
    },
  ];

  return (
    <section
      id="career-journey"
      className="bg-black text-white py-28 px-8"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center">

          <p className="text-blue-500 uppercase tracking-[6px] font-semibold">
            CAREER JOURNEY
          </p>

          <h2 className="text-5xl md:text-6xl font-bold mt-5">
            Your Journey To
            <br />
            A Successful Career
          </h2>

          <p className="text-gray-400 text-lg max-w-3xl mx-auto mt-8 leading-8">
            CareerForge guides you through every stage of your learning journey,
            from identifying your goals to becoming industry-ready.
          </p>

        </div>

        {/* Timeline */}
        <div className="mt-20 space-y-8">

          {steps.map((step, index) => (
            <div
              key={index}
              className="group flex items-start gap-6 bg-gray-900 border border-gray-800 rounded-3xl p-8 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.2)] transition-all duration-300"
            >
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition">
                {step.icon}
              </div>

              <div>
                <h3 className="text-2xl font-bold">
                  {index + 1}. {step.title}
                </h3>

                <p className="text-gray-400 mt-3 leading-8">
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