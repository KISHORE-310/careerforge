import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Bookmark,
  ExternalLink,
  Search,
  Code2,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Sparkles,
  Building2,
  Layers,
} from "lucide-react";

export function ProblemList({
  problems = [],
  topicSlug,
  getProblemProgress,
  onBookmark,
  onStatusChange,
  onNoteChange,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all"); // all, Easy, Medium, Hard
  const [expandedId, setExpandedId] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.pattern.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "all" || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const handleOpenNotes = (problemId, currentNotes) => {
    if (activeNoteId === problemId) {
      setActiveNoteId(null);
    } else {
      setActiveNoteId(problemId);
      setNoteDraft(currentNotes || "");
    }
  };

  const handleSaveNotes = (problemId) => {
    onNoteChange(topicSlug, problemId, noteDraft);
    setActiveNoteId(null);
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "Easy":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "Medium":
        return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "Hard":
        return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      default:
        return "text-stone-400 bg-stone-800 border-stone-700";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0c0c0c] border border-stone-800/80">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems or patterns..."
            className="w-full bg-stone-900/90 border border-stone-800 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["all", "Easy", "Medium", "Hard"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setDifficultyFilter(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition ${
                difficultyFilter === lvl
                  ? "bg-[#d4af37] text-black font-semibold shadow-md shadow-[#d4af37]/20"
                  : "bg-stone-900 text-stone-400 hover:text-white border border-stone-800"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Items List */}
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-stone-800/60 bg-[#0c0c0c] p-6 text-stone-400">
            <p className="text-sm font-medium">No problems found matching your filters</p>
            <p className="text-xs text-stone-500 mt-1">Try refining your search query or reset difficulty filter.</p>
          </div>
        ) : (
          filteredProblems.map((problem) => {
            const progress = getProblemProgress(topicSlug, problem.id);
            const isSolved = progress.status === "solved";
            const isReviewing = progress.status === "reviewing";
            const isExpanded = expandedId === problem.id;
            const isEditingNote = activeNoteId === problem.id;

            return (
              <div
                key={problem.id}
                className={`rounded-2xl border transition bg-[#0c0c0c]/90 backdrop-blur-sm ${
                  isSolved
                    ? "border-emerald-500/30 hover:border-emerald-500/50"
                    : isReviewing
                    ? "border-amber-500/30 hover:border-amber-500/50"
                    : "border-stone-800 hover:border-[#d4af37]/50"
                }`}
              >
                {/* Main Card Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <button
                      onClick={() =>
                        onStatusChange(
                          topicSlug,
                          problem.id,
                          isSolved ? "unsolved" : "solved"
                        )
                      }
                      className="mt-0.5 text-stone-500 hover:text-emerald-400 transition"
                      title={isSolved ? "Mark as unsolved" : "Mark as solved"}
                    >
                      {isSolved ? (
                        <CheckCircle2 size={19} className="text-emerald-400" />
                      ) : isReviewing ? (
                        <Circle size={19} className="text-amber-400" />
                      ) : (
                        <Circle size={19} className="text-stone-600" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-white group-hover:text-[#f5d77f]">
                          {problem.title}
                        </h3>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-stone-500 bg-stone-900 border border-stone-800 px-2 py-0.5 rounded-full">
                          {problem.pattern}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock size={12} className="text-[#d4af37]" />
                          {problem.estimatedTime} mins
                        </span>
                        {problem.acceptance && (
                          <span className="text-[11px] font-mono text-stone-500">
                            Acceptance: {problem.acceptance}
                          </span>
                        )}
                        {problem.companies && (
                          <div className="hidden md:flex items-center gap-1 text-[10px] text-stone-500">
                            <Building2 size={11} />
                            {problem.companies.slice(0, 3).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <select
                      value={progress.status}
                      onChange={(e) =>
                        onStatusChange(topicSlug, problem.id, e.target.value)
                      }
                      className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-[#d4af37]"
                    >
                      <option value="unsolved">Unsolved</option>
                      <option value="reviewing">In Review</option>
                      <option value="solved">Mastered</option>
                    </select>

                    <button
                      onClick={() => onBookmark(topicSlug, problem.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        progress.bookmarked
                          ? "bg-[#d4af37]/20 border-[#d4af37]/50 text-[#f5d77f]"
                          : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                      }`}
                      title={progress.bookmarked ? "Bookmarked" : "Bookmark problem"}
                    >
                      <Bookmark size={14} className={progress.bookmarked ? "fill-[#f5d77f]" : ""} />
                    </button>

                    <button
                      onClick={() => handleOpenNotes(problem.id, progress.notes)}
                      className={`p-1.5 rounded-lg border transition ${
                        progress.notes
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : "bg-stone-900 border-stone-800 text-stone-400 hover:text-white"
                      }`}
                      title="Notes & Insights"
                    >
                      <FileEdit size={14} />
                    </button>

                    {problem.leetcodeUrl && (
                      <a
                        href={problem.leetcodeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-[#d4af37] transition"
                        title="Open on LeetCode"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : problem.id)
                      }
                      className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition"
                      title={isExpanded ? "Collapse starter code" : "View starter code"}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Notes Drawer */}
                {isEditingNote && (
                  <div className="px-5 pb-4 pt-2 border-t border-stone-800/80 bg-black/40">
                    <label className="block text-[11px] uppercase tracking-wider text-[#f5d77f] font-mono font-medium mb-1.5">
                      Personal Notes & Intuition
                    </label>
                    <textarea
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Write your mental model, time/space complexity notes, or edge cases..."
                      rows={3}
                      className="w-full bg-[#141414] border border-stone-800 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] text-white text-xs rounded-xl p-3 outline-none font-mono"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setActiveNoteId(null)}
                        className="px-3 py-1 rounded-lg bg-stone-800 text-stone-400 hover:text-white text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNotes(problem.id)}
                        className="px-3 py-1 rounded-lg bg-[#d4af37] text-black font-semibold text-xs shadow-md shadow-[#d4af37]/20"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Starter Code & Problem Description Expanded Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-stone-800 bg-[#080808] rounded-b-2xl space-y-3">
                    <div className="text-xs text-stone-300 font-light">
                      <span className="text-[11px] font-mono uppercase text-[#d4af37] block font-semibold mb-1">
                        Problem Statement
                      </span>
                      {problem.description}
                    </div>

                    {problem.starterCode && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 mb-1">
                          <span className="flex items-center gap-1.5 text-[#f5d77f]">
                            <Code2 size={13} />
                            TypeScript Optimal Template
                          </span>
                        </div>
                        <pre className="p-3.5 rounded-xl bg-[#0e0e0e] border border-stone-800 text-[11px] font-mono text-stone-300 overflow-x-auto">
                          <code>{problem.starterCode}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ProblemList;
