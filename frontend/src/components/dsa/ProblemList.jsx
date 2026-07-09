import { useMemo, useState } from "react";
import {
  Bookmark,
  Filter,
  Search,
} from "lucide-react";

import ProblemCard from "./ProblemCard";

const difficultyOptions = ["All", "Easy", "Medium", "Hard"];
const statusOptions = ["All", "Not Started", "Attempted", "Solved", "Revised", "Mastered"];
const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Difficulty", value: "difficulty" },
  { label: "Time", value: "time" },
  { label: "Importance", value: "importance" },
  { label: "Title", value: "title" },
];
const difficultyRank = { Easy: 1, Medium: 2, Hard: 3 };

function ProblemList({
  getProblemProgress,
  onBookmark,
  onNoteChange,
  onStatusChange,
  problems,
  topicSlug,
}) {
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [difficulty, setDifficulty] = useState("All");
  const [pattern, setPattern] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");
  const [stage, setStage] = useState("All");
  const [status, setStatus] = useState("All");

  const patterns = useMemo(
    () => ["All", ...new Set(problems.map((problem) => problem.pattern))],
    [problems],
  );
  const stages = useMemo(
    () => ["All", ...new Set(problems.map((problem) => problem.stage))],
    [problems],
  );

  const filteredProblems = useMemo(
    () =>
      problems
        .filter((problem) => {
          const progress = getProblemProgress(topicSlug, problem.slug);
          const currentStatus = progress.status || problem.status;
          const isBookmarked = progress.bookmarked || problem.bookmarked;
          const searchText = `${problem.title} ${problem.pattern} ${problem.stage} ${problem.companies.join(" ")}`.toLowerCase();

          return (
            searchText.includes(search.toLowerCase()) &&
            (difficulty === "All" || problem.difficulty === difficulty) &&
            (stage === "All" || problem.stage === stage) &&
            (pattern === "All" || problem.pattern === pattern) &&
            (status === "All" || currentStatus === status) &&
            (!bookmarkedOnly || isBookmarked)
          );
        })
        .sort((first, second) => {
          if (sort === "difficulty") {
            return difficultyRank[first.difficulty] - difficultyRank[second.difficulty];
          }

          if (sort === "time") {
            return first.estimatedTime - second.estimatedTime;
          }

          if (sort === "importance") {
            return second.importance - first.importance;
          }

          if (sort === "title") {
            return first.title.localeCompare(second.title);
          }

          return (
            second.importance - first.importance ||
            difficultyRank[first.difficulty] - difficultyRank[second.difficulty]
          );
        }),
    [
      bookmarkedOnly,
      difficulty,
      getProblemProgress,
      pattern,
      problems,
      search,
      sort,
      stage,
      status,
      topicSlug,
    ],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-zinc-800 bg-black/30 px-4">
            <Search size={18} className="text-zinc-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search problem, pattern, company"
              className="w-full bg-transparent text-white outline-none placeholder:text-zinc-600"
            />
          </div>

          <button
            type="button"
            onClick={() => setBookmarkedOnly((current) => !current)}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 font-semibold transition ${
              bookmarkedOnly
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-300"
                : "border-zinc-800 bg-black/30 text-zinc-300 hover:border-yellow-400/50"
            }`}
          >
            <Bookmark size={18} fill={bookmarkedOnly ? "currentColor" : "none"} />
            Bookmarked
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="min-h-11 rounded-xl border border-zinc-800 bg-black/30 px-4 text-white outline-none focus:border-red-500">
            {difficultyOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="min-h-11 rounded-xl border border-zinc-800 bg-black/30 px-4 text-white outline-none focus:border-red-500">
            {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select value={stage} onChange={(event) => setStage(event.target.value)} className="min-h-11 rounded-xl border border-zinc-800 bg-black/30 px-4 text-white outline-none focus:border-red-500">
            {stages.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select value={pattern} onChange={(event) => setPattern(event.target.value)} className="min-h-11 rounded-xl border border-zinc-800 bg-black/30 px-4 text-white outline-none focus:border-red-500">
            {patterns.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-11 rounded-xl border border-zinc-800 bg-black/30 px-4 text-white outline-none focus:border-red-500">
            {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          <Filter size={16} />
          Showing {filteredProblems.length} of {problems.length} problems
        </div>
      </div>

      {filteredProblems.map((problem) => (
        <ProblemCard
          key={problem.id}
          onBookmark={() => onBookmark(topicSlug, problem.slug)}
          onNoteChange={(notes) => onNoteChange(topicSlug, problem.slug, notes)}
          onStatusChange={(nextStatus) =>
            onStatusChange(topicSlug, problem.slug, nextStatus)
          }
          problem={problem}
          progress={getProblemProgress(topicSlug, problem.slug)}
        />
      ))}

      {filteredProblems.length === 0 && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-400">
          No problems match the selected filters.
        </div>
      )}
    </div>
  );
}

export default ProblemList;
