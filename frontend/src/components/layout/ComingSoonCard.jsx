import { Clock } from "lucide-react";

function ComingSoonCard({
  title,
  description,
}) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#18181B] to-[#111111] p-10">

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-red-500/10 p-4">

          <Clock
            size={32}
            className="text-red-400"
          />

        </div>

        <div>

          <h2 className="text-3xl font-bold text-white">
            {title}
          </h2>

          <p className="mt-2 text-zinc-400">
            {description}
          </p>

        </div>

      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-10 text-center">

        <h3 className="text-2xl font-semibold text-white">

          🚀 Coming Soon

        </h3>

        <p className="mt-4 text-zinc-400 leading-7">

          This module is currently under development.

          It will become part of CareerForge AI v2.0.

        </p>

      </div>

    </div>
  );
}

export default ComingSoonCard;