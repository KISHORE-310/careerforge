import {
  Target,
  CheckCircle2,
  XCircle,
} from "lucide-react";

function SkillGap({ skillGap }) {

  if (!skillGap) return null;

  return (

    <div className="mt-10 rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#18181B] to-[#111111] p-8">

      {/* Header */}

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-blue-500/10 p-3">

          <Target
            size={28}
            className="text-blue-400"
          />

        </div>

        <div>

          <h2 className="text-3xl font-bold text-white">
            Skill Gap Analysis
          </h2>

          <p className="mt-1 text-zinc-400">
            Compare your skills against the requirements for your target role.
          </p>

        </div>

      </div>

      {/* Target Role */}

      <div className="mt-8">

        <span className="rounded-full bg-blue-500/10 px-5 py-2 text-blue-400 font-semibold">

          {skillGap.target_role}

        </span>

      </div>

      {/* Readiness */}

      <div className="mt-8">

        <div className="flex justify-between">

          <span className="text-zinc-300 font-medium">

            Career Readiness

          </span>

          <span className="text-white font-bold">

            {skillGap.readiness}%

          </span>

        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-800">

          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
            style={{
              width: `${skillGap.readiness}%`,
            }}
          />

        </div>

      </div>

      {/* Skills */}

      <div className="grid lg:grid-cols-2 gap-8 mt-10">

        {/* Matched */}

        <div>

          <h3 className="text-xl font-bold text-green-400 mb-5">

            Matched Skills

          </h3>

          <div className="space-y-4">

            {skillGap.matched_skills.map((skill, index) => (

              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4"
              >

                <CheckCircle2
                  className="text-green-400"
                  size={20}
                />

                <span className="text-zinc-200">

                  {skill}

                </span>

              </div>

            ))}

          </div>

        </div>

        {/* Missing */}

        <div>

          <h3 className="text-xl font-bold text-red-400 mb-5">

            Missing Skills

          </h3>

          <div className="space-y-4">

            {skillGap.missing_skills.map((skill, index) => (

              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4"
              >

                <XCircle
                  className="text-red-400"
                  size={20}
                />

                <span className="text-zinc-200">

                  {skill}

                </span>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

  );

}

export default SkillGap;