function DashboardPreview() {
  return (
    <div className="w-[420px] rounded-3xl border border-gray-800 bg-gray-900/80 backdrop-blur-xl shadow-2xl p-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">
            Career Readiness
          </p>

          <h1 className="text-5xl font-bold text-white mt-2">
            82%
          </h1>
        </div>

        <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center text-blue-500 font-bold">
          82
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-8">
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div className="bg-blue-500 h-3 rounded-full w-[82%]"></div>
        </div>
      </div>

      {/* Today's Mission */}
      <div className="mt-8 rounded-2xl bg-gray-800 p-5">

        <h3 className="text-white font-semibold mb-4">
          🔥 Today's Mission
        </h3>

        <div className="space-y-3">

          <div className="flex justify-between">
            <span className="text-gray-300">
              Learn Docker
            </span>

            <span className="text-green-400">
              ✔
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-300">
              Solve 2 DSA Problems
            </span>

            <span className="text-green-400">
              ✔
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-300">
              Build REST API
            </span>

            <span className="text-yellow-400">
              ⏳
            </span>
          </div>

        </div>

      </div>

      {/* Growth Opportunities */}
      <div className="mt-6 rounded-2xl bg-gray-800 p-5">

        <h3 className="text-white font-semibold mb-4">
          📈 Growth Opportunities
        </h3>

        <div className="flex flex-wrap gap-3">

          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
            React
          </span>

          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
            Docker
          </span>

          <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
            System Design
          </span>

        </div>

      </div>

    </div>
  );
}

export default DashboardPreview;