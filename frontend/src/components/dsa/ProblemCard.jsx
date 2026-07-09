import { useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  Clock3,
  NotebookPen,
  Star,
} from "lucide-react";

import StatusBadge from "../../data/dsa/StatusBadge";

const difficultyStyles = {
  Easy: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  Medium: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-300 border-red-500/20",
};

function ProblemCard({
  onBookmark,
  onNoteChange,
  onStatusChange,
  problem,
  progress,
}) {
  const [notesOpen, setNotesOpen] = useState(Boolean(progress.notes));
  const status = progress.status || problem.status;
  const bookmarked = progress.bookmarked ?? problem.bookmarked;
  const notes = progress.notes || "";
  const isDone = ["Solved", "Revised", "Mastered"].includes(status);

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-red-500/70">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className={`mt-1 rounded-full p-1 ${isDone ? "bg-emerald-500/10 text-emerald-300" : "bg-zinc-800 text-zinc-500"}`}>
            <CheckCircle2 size={22} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold text-white">
                {problem.title}
              </h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${difficultyStyles[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-zinc-300">
                {problem.pattern}
              </span>
              <span className="rounded-full bg-zinc-950 px-3 py-1 text-zinc-400">
                {problem.stage}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950 px-3 py-1 text-zinc-400">
                <Clock3 size={14} />
                {problem.estimatedTime} mins
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={status} onChange={onStatusChange} />

          <button
            type="button"
            onClick={() => setNotesOpen((current) => !current)}
            className={`rounded-full p-2 transition hover:bg-zinc-800 ${notes ? "text-blue-300" : "text-zinc-500"}`}
            aria-label="Toggle notes"
          >
            <NotebookPen size={20} />
          </button>

          <button
            type="button"
            onClick={onBookmark}
            className={`rounded-full p-2 transition hover:bg-zinc-800 ${bookmarked ? "text-yellow-300" : "text-zinc-500"}`}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark problem"}
          >
            <Bookmark size={20} fill={bookmarked ? "currentColor" : "none"} />
          </button>

          {problem.leetcode && (
            <a
              href={problem.leetcode}
              target="_blank"
              rel="noreferrer"
              className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Open problem"
            >
              <ArrowUpRight size={20} />
            </a>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-zinc-800 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {problem.companies.length > 0 ? (
            problem.companies.map((company) => (
              <span
                key={company}
                className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300"
              >
                {company}
              </span>
            ))
          ) : (
            <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-500">
              Core pattern
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-yellow-300">
          {Array.from({ length: problem.importance }).map((_, index) => (
            <Star key={index} size={16} fill="currentColor" />
          ))}
        </div>
      </div>

      {notesOpen && (
        <textarea
          value={notes}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder="Add approach notes, edge cases, or revision hints..."
          className="mt-5 min-h-28 w-full resize-y rounded-2xl border border-zinc-800 bg-black/30 p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500"
        />
      )}
    </article>
  );
}

export default ProblemCard;
