import { BookOpen, CheckCircle2 } from "lucide-react";

function LearningRoadmap({ roadmap }) {

  if (!roadmap || roadmap.length === 0) return null;

  return (

    <div className="mt-10 rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#18181B] to-[#111111] p-8">

      {/* Header */}

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-purple-500/10 p-3">

          <BookOpen
            size={28}
            className="text-purple-400"
          />

        </div>

        <div>

          <h2 className="text-3xl font-bold text-white">
            Learning Roadmap
          </h2>

          <p className="mt-1 text-zinc-400">
            Your AI-generated learning journey.
          </p>

        </div>

      </div>

      {/* Timeline */}

      <div className="mt-10 space-y-8">

        {roadmap.map((step, index) => (

          <div
            key={index}
            className="flex gap-6"
          >

            {/* Timeline */}

            <div className="flex flex-col items-center">

              <div className="rounded-full bg-purple-500 p-2">

                <CheckCircle2
                  className="text-white"
                  size={18}
                />

              </div>

              {index !== roadmap.length - 1 && (

                <div className="h-20 w-[2px] bg-zinc-700 mt-2"></div>

              )}

            </div>

            {/* Content */}

            <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

              <p className="text-purple-400 font-semibold">

                Week {step.week}

              </p>

              <h3 className="text-xl font-bold text-white mt-2">

                {step.title}

              </h3>

              <p className="text-zinc-400 mt-3 leading-7">

                {step.description}

              </p>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

export default LearningRoadmap;