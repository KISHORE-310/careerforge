import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Clock3,
  Layers3,
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import ProblemList from "../components/dsa/ProblemList";

import dsaProblems, { dsaTopics } from "../data/dsa";
import { useDSAProgress } from "../hooks/useDSAProgress";

function DSATopic() {
  const { topic } = useParams();
  const problems = dsaProblems[topic] || [];
  const topicMeta = dsaTopics.find((item) => item.slug === topic);
  const {
    getProblemProgress,
    setProblemNote,
    setProblemStatus,
    toggleBookmark,
    topics,
  } = useDSAProgress();
  const topicStats = topics.find((item) => item.slug === topic);
  const totalMinutes = problems.reduce(
    (total, problem) => total + problem.estimatedTime,
    0,
  );
  const difficultyCounts = problems.reduce(
    (counts, problem) => ({
      ...counts,
      [problem.difficulty]: (counts[problem.difficulty] || 0) + 1,
    }),
    { Easy: 0, Medium: 0, Hard: 0 },
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_top_left,#7f1d1d_0%,#18181b_38%,#09090b_100%)] p-8">
          <Link
            to="/dsa"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-red-500 hover:text-white"
          >
            <ArrowLeft size={16} />
            DSA Tracker
          </Link>

          <div className="mt-7 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-950/70 px-3 py-1 text-sm font-semibold text-zinc-300">
                  <Layers3 size={14} />
                  {topicMeta?.group || "DSA"}
                </span>
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-300">
                  {topicMeta?.priority || "Roadmap"}
                </span>
              </div>

              <h1 className="mt-5 text-5xl font-bold text-white">
                {topicMeta?.title || "DSA Topic"}
              </h1>

              <p className="mt-3 max-w-2xl text-lg text-zinc-300">
                {topicMeta?.description || "Curated DSA practice problems"}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/35 p-6">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>{topicStats?.solved || 0} / {problems.length} solved</span>
                <span>{topicStats?.progress || 0}%</span>
              </div>

              <div className="mt-3 h-4 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-300"
                  style={{ width: `${topicStats?.progress || 0}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-zinc-950/70 p-4">
                  <p className="flex items-center gap-2 text-sm text-zinc-500">
                    <Clock3 size={15} />
                    Practice Time
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {Math.round(totalMinutes / 60)}h
                  </p>
                </div>
                <div className="rounded-2xl bg-zinc-950/70 p-4">
                  <p className="flex items-center gap-2 text-sm text-zinc-500">
                    <Bookmark size={15} />
                    Bookmarks
                  </p>
                  <p className="mt-1 text-xl font-bold text-white">
                    {topicStats?.bookmarked || 0}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">Easy {difficultyCounts.Easy}</span>
                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-300">Medium {difficultyCounts.Medium}</span>
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-red-300">Hard {difficultyCounts.Hard}</span>
              </div>
            </div>
          </div>
        </section>

        <ProblemList
          getProblemProgress={getProblemProgress}
          onBookmark={toggleBookmark}
          onNoteChange={setProblemNote}
          onStatusChange={setProblemStatus}
          problems={problems}
          topicSlug={topic}
        />
      </div>
    </DashboardLayout>
  );
}

export default DSATopic;
