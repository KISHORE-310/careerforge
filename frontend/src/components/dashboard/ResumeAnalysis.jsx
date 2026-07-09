import {
  CheckCircle2,
  AlertCircle,
  Award,
} from "lucide-react";

function ResumeAnalysis({ resumeScore }) {
  if (!resumeScore) return null;

  return (
    <div className="mt-10 rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#18181B] to-[#111111] p-8">

      {/* Header */}

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-red-500/10 p-3">

          <Award
            size={28}
            className="text-red-400"
          />

        </div>

        <div>

          <h2 className="text-3xl font-bold text-white">
            AI Resume Analysis
          </h2>

          <p className="mt-1 text-zinc-400">
            AI evaluated your resume and found these insights.
          </p>

        </div>

      </div>

      {/* Grade */}

      <div className="mt-8 inline-flex items-center rounded-full bg-red-500/10 px-5 py-2">

        <span className="text-red-400 font-semibold">
          Grade : {resumeScore.grade}
        </span>

      </div>

      {/* Strengths + Weaknesses */}

      <div className="grid lg:grid-cols-2 gap-8 mt-10">

        {/* Strengths */}

        <div>

          <h3 className="text-xl font-bold text-green-400 mb-6">
            Strengths
          </h3>

          <div className="space-y-4">

            {resumeScore.strengths.map((item, index) => (

              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl border border-green-500/20 bg-green-500/5 p-5 transition hover:border-green-400"
              >

                <CheckCircle2
                  size={22}
                  className="mt-1 text-green-400"
                />

                <p className="leading-7 text-zinc-200">
                  {item}
                </p>

              </div>

            ))}

          </div>

        </div>

        {/* Weaknesses */}

        <div>

          <h3 className="text-xl font-bold text-red-400 mb-6">
            Improvements
          </h3>

          <div className="space-y-4">

            {resumeScore.weaknesses.map((item, index) => (

              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 transition hover:border-red-400"
              >

                <AlertCircle
                  size={22}
                  className="mt-1 text-red-400"
                />

                <p className="leading-7 text-zinc-200">
                  {item}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default ResumeAnalysis;