import {
  Bookmark,
  ChevronRight,
  Layers3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function TopicCard({
  bookmarked,
  description,
  group,
  priority,
  progress,
  slug,
  solved,
  title,
  total,
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/dsa/${slug}`)}
      className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:-translate-y-1 hover:border-red-500/70 hover:bg-zinc-900/80"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
              <Layers3 size={13} />
              {group}
            </span>
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
              {priority}
            </span>
          </div>

          <h3 className="mt-4 text-2xl font-bold text-white">{title}</h3>
          <p className="mt-2 min-h-11 text-sm leading-6 text-zinc-400">
            {description}
          </p>
        </div>

        <ChevronRight
          size={22}
          className="mt-1 shrink-0 text-zinc-500 transition group-hover:translate-x-1 group-hover:text-red-300"
        />
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-zinc-400">{solved} / {total} solved</span>
        <span className="font-semibold text-red-300">{progress}%</span>
      </div>

      <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-zinc-500">
        <span>{total} curated problems</span>
        <span className="inline-flex items-center gap-1">
          <Bookmark size={14} />
          {bookmarked}
        </span>
      </div>
    </button>
  );
}

export default TopicCard;
