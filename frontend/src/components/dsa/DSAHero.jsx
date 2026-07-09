import {
  Bookmark,
  Flame,
  RotateCcw,
  Target,
} from "lucide-react";

function DSAHero({ stats, onReset }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_top_left,#7f1d1d_0%,#18181b_38%,#09090b_100%)]">
      <div className="grid gap-8 p-8 lg:grid-cols-[1.25fr_0.75fr] lg:p-10">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200">
            <Flame size={16} />
            Placement DSA Roadmap
          </div>

          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-tight text-white">
            DSA Tracker
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-zinc-300">
            A curated interview prep cockpit for problems, patterns, revision, bookmarks, and topic mastery.
          </p>

          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-zinc-400">Solved</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.solved}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-zinc-400">Attempted</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.attempted}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-zinc-400">Bookmarks</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.bookmarked}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-zinc-400">Hours</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.estimatedHours}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/35 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Overall
              </p>
              <p className="mt-2 text-5xl font-bold text-white">{stats.progress}%</p>
            </div>

            <Target className="text-red-300" size={42} />
          </div>

          <div className="mt-7 h-4 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 via-orange-400 to-emerald-400"
              style={{ width: `${stats.progress}%` }}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-zinc-950/70 p-4">
              <p className="text-sm text-zinc-500">Mastered</p>
              <p className="mt-1 text-2xl font-bold text-emerald-300">{stats.mastered}</p>
            </div>
            <div className="rounded-2xl bg-zinc-950/70 p-4">
              <p className="text-sm text-zinc-500">Total</p>
              <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:border-red-500 hover:bg-red-500/10 hover:text-white"
          >
            <RotateCcw size={18} />
            Reset Progress
          </button>

          <div className="mt-5 flex items-center gap-2 text-sm text-zinc-500">
            <Bookmark size={16} />
            Progress is saved on this browser.
          </div>
        </div>
      </div>
    </section>
  );
}

export default DSAHero;
