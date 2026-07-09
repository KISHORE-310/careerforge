import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Trophy,
} from "lucide-react";

function ProgressOverview({ stats }) {
  const cards = [
    {
      title: "Problems Solved",
      value: `${stats.solved}/${stats.total}`,
      detail: `${stats.progress}% complete`,
      icon: <Trophy size={24} />,
      color: "text-yellow-300",
    },
    {
      title: "Easy",
      value: `${stats.solvedDifficulty.Easy}/${stats.totalDifficulty.Easy}`,
      detail: "Foundation confidence",
      icon: <CheckCircle2 size={24} />,
      color: "text-green-300",
    },
    {
      title: "Medium",
      value: `${stats.solvedDifficulty.Medium}/${stats.totalDifficulty.Medium}`,
      detail: "Interview core",
      icon: <Circle size={24} />,
      color: "text-yellow-300",
    },
    {
      title: "Hard",
      value: `${stats.solvedDifficulty.Hard}/${stats.totalDifficulty.Hard}`,
      detail: "Advanced depth",
      icon: <AlertCircle size={24} />,
      color: "text-red-300",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 transition hover:border-red-500/60 hover:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-zinc-400">{card.title}</p>
              <h2 className="mt-3 text-3xl font-bold text-white">{card.value}</h2>
              <p className="mt-2 text-sm text-zinc-500">{card.detail}</p>
            </div>

            <div className={`rounded-2xl bg-black/30 p-3 ${card.color}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default ProgressOverview;
