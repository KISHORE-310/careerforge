import type { WorldState } from "../types";

/**
 * Scoreboard (PS §23): five tiles, plain English, big values with icons.
 * All numbers come from the backend's actual recovery accounting.
 */
export default function MetricsBar({
  state,
  onChaos,
  chaosBusy,
  connected,
}: {
  state: WorldState;
  onChaos: () => void;
  chaosBusy: boolean;
  connected: boolean;
}) {
  const m = state.metrics;
  const lost = state.shipments.filter((s) => s.status === "MISPLACED" || s.status === "DISRUPTED").length;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "#0f172a",
        borderBottom: "1px solid #334155",
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 20px",
        color: "#e2e8f0",
        zIndex: 1200,
      }}
      role="status"
      aria-label="Scoreboard: money, time and pollution saved"
    >
      <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.2 }}>
        📦 Package Rescue
      </div>
      <Metric icon="💰" label="Money saved" value={`$${m.total_cost_saved_usd.toFixed(0)}`} color="#4ade80" />
      <Metric icon="⏱" label="Time saved" value={`${m.total_delay_hours_saved.toFixed(1)}h`} color="#60a5fa" />
      <Metric icon="📦" label="Space used" value={`${(m.total_space_used_kg ?? 0).toFixed(0)}kg`} color="#a78bfa" />
      <Metric icon="🌱" label="Less pollution" value={`${m.total_co2_saved_kg.toFixed(0)}kg`} color="#86efac" />
      <Metric icon="✅" label="Packages rescued" value={String(Math.round(m.recovered_count))} color="#fbbf24" />
      <div style={{ flex: 1 }} />
      <span aria-live="polite" style={{ fontSize: 11, color: "#64748b" }}>
        {lost > 0 ? `${lost} lost` : "all on track"} ·{" "}
        {state.running ? `×${state.speed_multiplier}` : "paused"} ·{" "}
        {connected ? "🟢 live" : "🟡 reconnecting"}
      </span>
      <button
        onClick={onChaos}
        disabled={chaosBusy}
        aria-label="Chaos Mode: close a city and watch the system re-plan"
        style={{
          background: "#dc2626",
          border: "none",
          color: "#fff",
          padding: "10px 18px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        {chaosBusy ? "Closing city…" : "⚡ Chaos Mode"}
      </button>
    </div>
  );
}

function Metric({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }} title={label}>
      <span aria-hidden style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 0.4 }}>{label}</div>
      </div>
    </div>
  );
}
