import type { Hub, RecoveryEvent, Shipment } from "../types";

/**
 * Lost-packages list (PS §22 terminology): plain-English reasons from the
 * detection engine's plain_reason field, keyboard accessible (PS §31).
 */
export default function MisplacedQueue({
  shipments,
  events,
  hubs,
  selectedId,
  onSelect,
}: {
  shipments: Shipment[];
  events: RecoveryEvent[];
  hubs: Hub[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const lost = shipments.filter((s) => s.status === "MISPLACED" || s.status === "DISRUPTED");
  const reasonFor = (id: string) =>
    events.find((e) => e.shipment_id === id && e.status === "PENDING");
  const hubName = (hid: string | null) =>
    hubs.find((h) => h.id === hid)?.name ?? hid ?? "";

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        width: 270,
        maxHeight: 320,
        overflowY: "auto",
        background: "rgba(15,23,42,.94)",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: 10,
        color: "#e2e8f0",
        zIndex: 1000,
        fontSize: 12,
      }}
      aria-label="Lost packages list"
    >
      <div style={{ fontWeight: 700, marginBottom: 6, color: "#f87171", fontSize: 11, letterSpacing: 1 }}>
        📦 LOST PACKAGES ({lost.length})
      </div>
      {lost.length === 0 && <div style={{ color: "#64748b" }}>All packages on track ✓</div>}
      {lost.map((s) => {
        const ev = reasonFor(s.id);
        const why = ev?.plain_reason || ev?.detection_reason || "…";
        return (
          <div
            key={s.id}
            role="button"
            tabIndex={0}
            aria-label={`Package ${s.id} is lost. ${why}. Open rescue plans.`}
            onClick={() => onSelect(s.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(s.id);
              }
            }}
            style={{
              padding: "6px 8px",
              marginBottom: 4,
              borderRadius: 8,
              cursor: "pointer",
              background: s.id === selectedId ? "#334155" : "#1e293b",
              border: s.id === selectedId ? "1px solid #f87171" : "1px solid #1e293b",
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#60a5fa")}
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = s.id === selectedId ? "#f87171" : "#1e293b")
            }
          >
            <div>
              <b style={{ color: "#f87171" }}>{s.id}</b>{" "}
              <span style={{ color: "#fbbf24", fontSize: 10 }}>{s.priority}</span>{" "}
              <span style={{ color: "#94a3b8" }}>{s.weight_kg.toFixed(0)}kg → {hubName(s.destination_hub_id)}</span>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>
              {why.length > 62 ? `${why.slice(0, 62)}…` : why}
            </div>
          </div>
        );
      })}
    </div>
  );
}
