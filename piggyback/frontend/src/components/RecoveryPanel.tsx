import { useEffect, useState } from "react";
import { fetchOptimize, fetchRecover } from "../api";
import type { Hub, RecoveryOption, Shipment, Vehicle } from "../types";

interface Props {
  shipment: Shipment;
  hubs: Hub[];
  vehicles: Vehicle[];
  detectionReason: string | null;
  plainReason: string | null;
  onClose: () => void;
  onRecovered: (saved: { money: number; hours: number; co2: number }) => void;
}

const kindName: Record<string, string> = {
  TRUCK: "Truck", VAN: "Van", RAIL: "Train", AIR: "Plane",
};

/**
 * Package Inspector + Three Rescue Plans (PS §25-§27).
 * Everything shown comes from the backend's real computed numbers.
 */
export default function RecoveryPanel({
  shipment, hubs, vehicles, detectionReason, plainReason, onClose, onRecovered,
}: Props) {
  const [options, setOptions] = useState<RecoveryOption[]>([]);
  const [candidates, setCandidates] = useState(0);
  const [matched, setMatched] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmRank, setConfirmRank] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    setOptions([]);
    setError(null);
    setLoading(true);
    setConfirmRank(null);
    fetchOptimize(shipment.id)
      .then((r) => {
        if (!alive) return;
        setOptions(r.options ?? []);
        setCandidates(r.candidates_evaluated ?? 0);
        setMatched(r.matched_count ?? 0);
        if (!r.options?.length) setError("No rescue options right now — checking again as vehicles move.");
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Could not compute plans"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [shipment.id]);

  const hubName = (hid: string | null) => hubs.find((h) => h.id === hid)?.name ?? hid ?? "";
  const planTitle = (o: RecoveryOption) => {
    const l = o.strategy_label;
    if (l.startsWith("SHARES A RIDE")) return "SHARES A RIDE";
    if (l.startsWith("TWO VEHICLES") || l.startsWith("Fallback")) return "TWO VEHICLES, ONE STOP";
    return "SAME VEHICLE, STRAIGHT THERE";
  };

  const choose = async (rank: number) => {
    setBusy(`opt-${rank}`);
    setError(null);
    try {
      const res = await fetchRecover(shipment.id, rank);
      if (res.ok) {
        const chosen = options.find((o) => o.rank === rank);
        onRecovered({
          money: chosen?.cost_saved_usd ?? 0,
          hours: Math.max(0, -(chosen?.estimated_delay_hours ?? 0)),
          co2: chosen?.co2_saved_kg ?? 0,
        });
      } else setError("Rescue failed — the plan may have changed. Reopen this package.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rescue failed");
    } finally {
      setBusy(null);
      setConfirmRank(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-label={`Rescue plans for package ${shipment.id}`}
      style={{
        position: "absolute", top: 84, right: 16, width: 440,
        maxHeight: "calc(100% - 140px)", overflowY: "auto",
        background: "#0f172a", border: "1px solid #334155", borderRadius: 12,
        padding: 16, color: "#e2e8f0", zIndex: 1000,
        boxShadow: "0 10px 40px rgba(0,0,0,.5)",
      }}
    >
      {/* ---- Inspector header (PS §25) ---- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ margin: 0 }}>📦 Package {shipment.id}</h3>
        <button onClick={onClose} style={btnGhost} aria-label="Close inspector">✕</button>
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
        {shipment.priority} priority · {shipment.weight_kg.toFixed(0)}kg ·
        from <b style={{ color: "#cbd5e1" }}>{hubName(shipment.origin_hub_id)}</b> to{" "}
        <b style={{ color: "#cbd5e1" }}>{hubName(shipment.destination_hub_id)}</b> ·
        must arrive by {new Date(shipment.deadline).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>

      {plainReason && (
        <div style={{
          marginTop: 10, padding: "10px 12px", background: "#450a0a",
          border: "1px solid #7f1d1d", borderRadius: 8, fontSize: 12.5, color: "#fecaca", lineHeight: 1.5,
        }} aria-live="polite">
          ⚠️ {plainReason}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, color: "#64748b" }}>
        🔍 Looked at {candidates} vehicles · found {options.length || matched} way{(options.length || matched) === 1 ? "" : "s"} to rescue it
      </div>

      {loading && <div style={{ marginTop: 14, color: "#94a3b8", fontSize: 13 }}>Finding trucks going that way…</div>}
      {error && !loading && <div style={{ marginTop: 8, color: "#f87171", fontSize: 13 }}>{error}</div>}

      {/* ---- Three rescue plans (PS §26) ---- */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
        {options.map((o) => {
          const isConfirming = confirmRank === o.rank;
          const lateH = o.estimated_delay_hours;
          const utilPct = Math.round((o.utilization_gain ?? 0) * 100);
          return (
            <div key={o.rank} style={{
              border: `1px solid ${isConfirming ? "#3b82f6" : "#334155"}`,
              borderRadius: 10, padding: 12, background: "#1e293b",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b style={{ color: "#fbbf24", fontSize: 13 }}>PLAN {o.rank} · {planTitle(o)}</b>
                <span style={{ color: "#94a3b8", fontSize: 11 }}>best match {Math.round(o.score * 100)}%</span>
              </div>
              <div style={{ display: "flex", gap: 13, marginTop: 8, fontSize: 13, flexWrap: "wrap" }}>
                <span title="Money saved">💰 <b style={{ color: "#4ade80" }}>${o.cost_saved_usd.toFixed(0)} saved</b></span>
                <span title="Arrives at">
                  ⏱ {lateH <= 0
                    ? <b style={{ color: "#60a5fa" }}>{Math.abs(lateH).toFixed(1)}h early</b>
                    : <b style={{ color: "#fb923c" }}>{lateH.toFixed(1)}h late</b>}
                </span>
                <span title="Space used">📦 {utilPct}% of space</span>
                <span title="Less pollution">🌱 <b style={{ color: "#86efac" }}>{o.co2_saved_kg.toFixed(1)}kg less CO₂</b></span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8", whiteSpace: "pre-line", lineHeight: 1.5 }}>
                {o.explanation.split("\n").slice(0, 5).join("\n")}
              </div>

              {isConfirming ? (
                <div style={{ marginTop: 10, background: "#1e3a5f", border: "1px solid #3b82f6", borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 12, color: "#bfdbfe" }}>
                    Send this package with {o.vehicle_ids.join(" + ")}?
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => choose(o.rank)} disabled={busy !== null} style={{ ...btnPrimary, marginTop: 0 }}>
                      {busy === `opt-${o.rank}` ? "Rescuing…" : "✓ Yes, rescue it"}
                    </button>
                    <button onClick={() => setConfirmRank(null)} disabled={busy !== null} style={btnGhost}>Back</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmRank(o.rank)}
                  disabled={busy !== null || loading}
                  aria-label={`Choose plan ${o.rank}: ${planTitle(o)}, saves $${o.cost_saved_usd.toFixed(0)}`}
                  style={{ ...btnPrimary, marginTop: 10, opacity: busy && busy !== `opt-${o.rank}` ? 0.5 : 1 }}
                >
                  {busy === `opt-${o.rank}` ? "Rescuing…" : "CHOOSE THIS PLAN"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  background: "#3b82f6", border: "none", color: "#fff",
  padding: "9px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 700,
};

const btnGhost: React.CSSProperties = {
  background: "transparent", border: "none", color: "#94a3b8",
  cursor: "pointer", fontSize: 16,
};
