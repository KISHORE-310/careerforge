const STATUS = [
  "Not Started",
  "Attempted",
  "Solved",
  "Revised",
  "Mastered",
];

const STATUS_COLORS = {
  "Not Started": "border-zinc-700 bg-zinc-800 text-zinc-300",
  Attempted: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  Solved: "border-green-500/30 bg-green-500/10 text-green-300",
  Revised: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  Mastered: "border-purple-500/30 bg-purple-500/10 text-purple-300",
};

function StatusBadge({ status, onChange }) {
  return (
    <select
      value={status}
      onChange={(event) => onChange(event.target.value)}
      className={`min-h-10 rounded-full border px-4 text-sm font-semibold outline-none transition hover:scale-[1.02] ${STATUS_COLORS[status]}`}
      aria-label="Problem status"
    >
      {STATUS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default StatusBadge;
