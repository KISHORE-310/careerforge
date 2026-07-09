import DashboardPreview from "./DashboardPreview";
import Button from "../common/Button";

function Hero() {
  return (
   <section
  id="home"
  className="relative overflow-hidden min-h-screen bg-gradient-to-b from-[#030712] via-black to-[#030712] text-white"
>

      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[180px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto min-h-screen grid lg:grid-cols-2 items-center gap-20 px-8">

        {/* Left Side */}
        <div>

          <span className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/50 bg-blue-500/10 text-blue-400 text-sm font-medium">
            🚀 AI-Powered Career Platform
          </span>

          <h1 className="mt-8 text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            Build Skills.
            <br />
            Build Projects.
            <br />
            <span className="text-blue-500">
              Build Your Tech Career.
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg md:text-xl text-gray-400 leading-9">
            CareerForge helps engineering students analyze their resumes,
            identify skill gaps, generate personalized learning roadmaps,
            build real-world projects, and prepare for software engineering
            careers.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-5 mt-10">
            <Button>
              Start Your Journey
            </Button>

            <Button variant="secondary">
              Live Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-12 mt-16">

            <div>
              <h2 className="text-4xl font-bold text-blue-500">
                50+
              </h2>
              <p className="text-gray-400 mt-2">
                Career Paths
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-blue-500">
                100+
              </h2>
              <p className="text-gray-400 mt-2">
                Skills Covered
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-blue-500">
                1000+
              </h2>
              <p className="text-gray-400 mt-2">
                Learning Roadmaps
              </p>
            </div>

          </div>

        </div>

        {/* Right Side */}
        <div className="flex justify-center">
          <DashboardPreview />
        </div>

      </div>

    </section>
  );
}

export default Hero;