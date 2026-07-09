import DashboardLayout from "../components/dashboard/DashboardLayout";

import DSAHero from "../components/dsa/DSAHero";
import ProgressOverview from "../components/dsa/ProgressOverview";
import TopicGrid from "../components/dsa/TopicGrid";
import { useDSAProgress } from "../hooks/useDSAProgress";

function DSATracker() {
  const { resetProgress, stats, topics } = useDSAProgress();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <DSAHero stats={stats} onReset={resetProgress} />

        <ProgressOverview stats={stats} />

        {stats.nextProblems.length > 0 && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Next Best Problems</h2>
                <p className="mt-1 text-zinc-400">
                  High-impact unsolved problems from your roadmap.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-5">
              {stats.nextProblems.map((problem) => (
                <a
                  key={`${problem.topicSlug}-${problem.slug}`}
                  href={`/dsa/${problem.topicSlug}`}
                  className="rounded-2xl border border-zinc-800 bg-black/30 p-4 transition hover:border-red-500/60 hover:bg-zinc-950"
                >
                  <p className="text-sm font-semibold text-red-300">{problem.topicTitle}</p>
                  <h3 className="mt-2 min-h-12 font-semibold text-white">{problem.title}</h3>
                  <p className="mt-3 text-sm text-zinc-500">{problem.difficulty} · {problem.pattern}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        <TopicGrid topics={topics} />
      </div>
    </DashboardLayout>
  );
}

export default DSATracker;
