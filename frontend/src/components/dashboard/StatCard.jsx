import { ArrowUpRight } from "lucide-react";

function StatCard({
  title,
  value,
  subtitle = "",
  color = "text-[#d4af37]",
}) {
  return (
    <div className="rounded-xl border border-stone-800 bg-[#0e0e0e] p-4 transition-all duration-200 hover:border-[#d4af37]/30 hover:bg-[#121212] flex flex-col justify-between space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-stone-500 font-light">
          {title}
        </span>
        <ArrowUpRight size={14} className="text-stone-600" />
      </div>

      {/* Value */}
      <div>
        <p className={`text-2xl font-light tracking-tight ${color}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-[11px] text-stone-400 mt-0.5 font-light truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;