import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Clock3,
  Layers3,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
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

  return (
    <AppLayout>
      <div className="space-y-6">
        <section className="apple-liquid-glass rounded-2xl p-6 border border-[#d4af37]/30 shadow-2xl">
          <Link
            to="/dsa"
            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 border border-stone-800 px-3.5 py-1.5 text-xs font-semibold text-stone-300 transition hover:border-[#d4af37] hover:text-white mb-4"
          >
            <ArrowLeft size={14} />
            Back to DSA Topics
          </Link>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 border border-stone-800 px-2.5 py-0.5 text-xs font-medium text-stone-300">
                  <Layers3 size={13} />
                  {topicMeta?.group || "DSA"}
                </span>
                <span className="rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 px-2.5 py-0.5 text-xs font-mono font-semibold text-[#f5d77f]">
                  {topicMeta?.priority || "Priority Track"}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-serif-header text-white">
                {topicMeta?.title || "DSA Topic"}
              </h1>

              <p className="mt-1 max-w-2xl text-xs text-stone-400 font-light">
                {topicMeta?.description || "Curated DSA practice problems targeted for top tier interviews"}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-black/40 p-4">
              <div className="flex justify-between text-xs text-stone-400">
                <span>{topicStats?.solved || 0} / {problems.length} solved</span>
                <span className="font-mono text-[#f5d77f] font-bold">{topicStats?.progress || 0}%</span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-900">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#d4af37] to-[#f5d77f]"
                  style={{ width: `${topicStats?.progress || 0}%` }}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-stone-900/80 p-2.5 border border-stone-800">
                  <p className="flex items-center gap-1.5 text-[10px] text-stone-400">
                    <Clock3 size={13} className="text-[#d4af37]" />
                    Total Estimated
                  </p>
                  <p className="mt-0.5 text-sm font-bold font-mono text-white">
                    {Math.round(totalMinutes / 60)}h
                  </p>
                </div>
                <div className="rounded-xl bg-stone-900/80 p-2.5 border border-stone-800">
                  <p className="flex items-center gap-1.5 text-[10px] text-stone-400">
                    <Bookmark size={13} className="text-[#d4af37]" />
                    Problems
                  </p>
                  <p className="mt-0.5 text-sm font-bold font-mono text-white">
                    {problems.length}
                  </p>
                </div>
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
    </AppLayout>
  );
}

export default DSATopic;
