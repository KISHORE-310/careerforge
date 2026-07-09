import {
  Sparkles,
  ArrowUpRight,
  BrainCircuit,
  Trophy,
  Target,
} from "lucide-react";

function DashboardHero({ data }) {

  const resumeScore = data?.resume_score?.resume_score ?? 71;
  const atsScore = data?.ats_score?.ats_score ?? 64;
  const readiness = data?.skill_gap?.readiness ?? 72;
  const role = data?.ats_score?.target_role ?? "Backend Developer";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#18181B] via-[#121212] to-[#09090B] p-8">

      {/* Glow */}

      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-red-500/10 blur-3xl"></div>

      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-500/5 blur-3xl"></div>

      <div className="relative z-10 grid gap-8 xl:grid-cols-3">

        {/* LEFT */}

        <div className="xl:col-span-2">

          <div className="inline-flex items-center gap-3 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2">

            <Sparkles
              size={18}
              className="text-red-400"
            />

            <span className="text-red-300 text-sm font-medium">
              AI Career Intelligence
            </span>

          </div>

          <h1 className="mt-6 text-5xl font-extrabold text-white">

            Welcome Back 👋

          </h1>

          <p className="mt-3 text-xl text-zinc-300">

            Target Role

          </p>

          <h2 className="mt-1 text-3xl font-bold text-red-400">

            {role}

          </h2>

          <p className="mt-6 max-w-2xl leading-8 text-zinc-400">

            Continue improving your resume to increase your ATS score,
            strengthen your profile and become placement ready.

          </p>

          {/* KPI */}

          <div className="mt-10 grid grid-cols-3 gap-6">

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">

              <p className="text-zinc-500 text-sm">
                Resume Score
              </p>

              <h2 className="mt-3 text-4xl font-bold text-white">
                {resumeScore}
              </h2>

            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">

              <p className="text-zinc-500 text-sm">
                ATS Score
              </p>

              <h2 className="mt-3 text-4xl font-bold text-white">
                {atsScore}
              </h2>

            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">

              <p className="text-zinc-500 text-sm">
                Readiness
              </p>

              <h2 className="mt-3 text-4xl font-bold text-white">
                {readiness}%
              </h2>

            </div>

          </div>

          <button className="mt-10 inline-flex items-center gap-3 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700">

            Continue Analysis

            <ArrowUpRight size={18} />

          </button>

        </div>

        {/* RIGHT */}

        <div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-8">

            <div className="flex items-center gap-4">

              <div className="rounded-2xl bg-red-500/10 p-4">

                <BrainCircuit
                  className="text-red-400"
                  size={32}
                />

              </div>

              <div>

                <p className="text-zinc-400">

                  Career Readiness

                </p>

                <h2 className="mt-2 text-5xl font-bold text-white">

                  {readiness}%

                </h2>

              </div>

            </div>

            <div className="mt-8 h-3 rounded-full bg-zinc-800">

              <div
                className="h-3 rounded-full bg-gradient-to-r from-red-500 to-red-300"
                style={{ width: `${readiness}%` }}
              ></div>

            </div>

            <div className="mt-8 space-y-5">

              <div className="flex items-center gap-3">

                <Target
                  size={20}
                  className="text-red-400"
                />

                <span className="text-zinc-300">

                  Target:
                  {" "}
                  {role}

                </span>

              </div>

              <div className="flex items-center gap-3">

                <Trophy
                  size={20}
                  className="text-yellow-400"
                />

                <span className="text-zinc-300">

                  Reach 85% to unlock Excellent Grade

                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default DashboardHero;