import type { RecoveryEvent } from "../types";

const SEV_STYLE: Record<string, { icon: string; color: string }> = {
  HIGH: { icon: "⚠️", color: "#f87171" },
  MEDIUM: { icon: "📦", color: "#fbbf24" },
  LOW: { icon: "ℹ️", color: "#60a5fa" },
};

/**
 * Live event feed in plain English (PS §28). Rows come straight from backend
 * RecoveryEvents: lost reasons use plain_reason, rescues show the chosen plan.
 */
export default function EventFeed({ events }: { events: RecoveryEvent[] }) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Live rescue event feed"
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        width: 430,
        maxHeight: 240,
        overflowY: "auto",
        background: "rgba(15,23,42,.94)",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: 12,
        color: "#e2e8f0",
        zIndex: 1000,
        fontSize: 12,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, color: "#94a3b8", fontSize: 11, letterSpacing: 1 }}>
        WHAT'S HAPPENING
      </div>
      {events.length === 0 && <div style={{ color: "#475569" }}>Waiting for events…</div>}
      {events.map((e) => {
        const sev = SEV_STYLE[e.severity] ?? SEV_STYLE.LOW;
        const time = new Date(e.detected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const text = e.plain_reason || e.detection_reason;
        return (
          <div key={e.id} style={{ padding: "5px 0", borderBottom: "1px solid #1e293b", lineHeight: 1.45 }}>
            <span style={{ color: "#64748b" }}>{time}</span>{" "}
            {e.status === "RESOLVED" && e.chosen_option ? (
              <span style={{ color: "#4ade80" }}>
                ✅ Package <b>{e.shipment_id}</b> rescued — plan: {e.chosen_option.strategy_label}
              </span>
            ) : (
              <>
                <span aria-hidden>{sev.icon}</span> Package <b>{e.shipment_id}</b> needs help. {text}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
