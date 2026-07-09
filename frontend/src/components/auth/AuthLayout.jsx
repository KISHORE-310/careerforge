function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#030712] grid lg:grid-cols-2">

      {/* Left Side */}
      <div className="hidden lg:flex flex-col justify-center px-20 bg-gradient-to-br from-blue-700 via-blue-900 to-black text-white">

        <h1 className="text-6xl font-extrabold">
          Career<span className="text-cyan-300">Forge</span>
        </h1>

        <p className="mt-8 text-xl leading-9 text-gray-200 max-w-lg">
          Build your dream tech career with AI-powered resume analysis,
          personalized learning roadmaps, interview preparation, and
          real-world project recommendations.
        </p>

        <div className="mt-14 space-y-6">

          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-cyan-300"></div>
            <p className="text-lg">
              AI Resume Analysis
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-cyan-300"></div>
            <p className="text-lg">
              Personalized Learning Roadmaps
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-cyan-300"></div>
            <p className="text-lg">
              Project Recommendations
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-cyan-300"></div>
            <p className="text-lg">
              Interview Preparation
            </p>
          </div>

        </div>

      </div>

      {/* Right Side */}

      <div className="flex items-center justify-center p-8">

        <div className="w-full max-w-md">
          {children}
        </div>

      </div>

    </div>
  );
}

export default AuthLayout;