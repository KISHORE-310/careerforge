import { ArrowUpRight } from "lucide-react";

function StatCard({
  title,
  value,
  subtitle = "",
  color = "text-white",
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#18181B] to-[#111111] p-6 transition-all duration-500 hover:-translate-y-2 hover:border-red-500/50 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]">

      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-red-500/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100"></div>

      <div className="relative z-10">

        {/* Title */}

        <div className="flex items-center justify-between">

          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            {title}
          </p>

          <ArrowUpRight
            size={18}
            className="text-zinc-600 transition group-hover:text-red-400"
          />

        </div>

        {/* Value */}

        <h2 className={`mt-6 text-5xl font-black ${color}`}>
          {value}
        </h2>

        {/* Subtitle */}

        <p className="mt-5 text-sm leading-6 text-zinc-400">
          {subtitle}
        </p>

      </div>

    </div>
  );
}

export default StatCard;