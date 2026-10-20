import { useCallback, useEffect, useRef, useState } from "react";
import MapView from "./components/MapView";
import MetricsBar from "./components/MetricsBar";
import RecoveryPanel from "./components/RecoveryPanel";
import EventFeed from "./components/EventFeed";
import MisplacedQueue from "./components/MisplacedQueue";
import { fetchChaos, fetchSimControl, useLiveState } from "./api";
import type { Toast, WorldState } from "./types";

const panelBtn: React.CSSProperties = {
  background: "#1e293b", color: "#e2e8f0", border: "1px solid #334155",
  borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 12,
};

const TOUR_STEPS = [
  "1 · Click a RED package (or one in the Lost Packages list) to see rescue options.",
  "2 · Compare the three rescue plans — money saved, arrival time, space used, pollution.",
  "3 · Choose a plan and watch the package turn blue, then green, and the scoreboard update.",
];

export default function App() {
  const { state, setState, connected, error } = useLiveState(
    useCallback((m: string) => pushToastRef.current?.(m), []),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [chaosBusy, setChaosBusy] = useState(false);
  const [simBusy, setSimBusy] = useState(false);
  const [chaosBanner, setChaosBanner] = useState<string | null>(null);
  const [chaosFlash, setChaosFlash] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const toastId = useRef(0);
  const pushToastRef = useRef<((m: string) => void) | null>(null);
  const touredRef = useRef(false);

  const pushToast = useCallback((message: string) => {
    const t = { id: ++toastId.current, message };
    setToasts((prev) => [...prev.slice(-3), t]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 8000);
  }, []);
  pushToastRef.current = pushToast;

  // First-load tour (PS §30): once, skippable
  useEffect(() => {
    if (state && !touredRef.current) {
      touredRef.current = true;
      if (state.shipments.some((s) => s.status === "MISPLACED" || s.status === "DISRUPTED")) {
        setTourStep(0);
      }
    }
  }, [state]);

  const selected = state?.shipments.find((s) => s.id === selectedId) ?? null;
  const selectedEvent =
    state?.events.find((e) => e.shipment_id === selectedId && e.status === "PENDING") ?? null;

  const onChaos = async () => {
    setChaosBusy(true);
    setTourStep(null);
    try {
      const r = await fetchChaos("close-hub");
      const msg = r.message || "A city closed. Re-planning…";
      pushToast(msg);
      setChaosBanner(msg);
      setChaosFlash(true);
      setTimeout(() => setChaosFlash(false), 900);
      // PS §29: after ~10s the banner shrinks to a status chip (banner clears,
      // the city stays gray on the map and in the feed)
      setTimeout(() => setChaosBanner(null), 10000);
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Chaos failed");
    } finally {
      setChaosBusy(false);
    }
  };

  const onSim = async (action: "start" | "pause" | "reset") => {
    setSimBusy(true);
    try {
      const r = await fetchSimControl(action);
      setState((prev) => (prev ? { ...prev, running: r.running } : prev));
      pushToast(action === "reset" ? `Simulation reset (seed ${r.seed})` : `Simulation ${action === "start" ? "started" : "paused"}`);
    } catch (e) {
      pushToast(e instanceof Error ? e.message : "Simulation control failed");
    } finally {
      setSimBusy(false);
    }
  };

  if (error && !state) {
    return (
      <div style={{ padding: 40, color: "#f87171", fontFamily: "system-ui" }}>
        <h2>Can't reach the simulation</h2>
        <p style={{ color: "#94a3b8" }}>{error}</p>
        <p style={{ color: "#64748b", fontSize: 13 }}>
          Start it with: <code>python -m uvicorn app.main:app --port 8000</code> inside{" "}
          <code>piggyback/backend</code>. Retrying automatically…
        </p>
      </div>
    );
  }

  if (!state) {
    return (
      <div style={{ padding: 40, color: "#94a3b8", fontFamily: "system-ui" }} role="status">
        Connecting to the simulation…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <MetricsBar state={state} onChaos={onChaos} chaosBusy={chaosBusy} connected={connected} />
      <div style={{ position: "absolute", top: 64, bottom: 0, left: 0, right: 0 }}>
        <MapView state={state} selectedId={selectedId} onSelectShipment={(id) => { setSelectedId(id); setTourStep(null); }} />
        <EventFeed events={[...state.events].reverse()} />
        <MisplacedQueue
          shipments={state.shipments}
          events={state.events}
          hubs={state.hubs}
          selectedId={selectedId}
          onSelect={(id) => { setSelectedId(id); setTourStep(null); }}
        />
        {selected && (selected.status === "MISPLACED" || selected.status === "DISRUPTED") && (
          <RecoveryPanel
            shipment={selected}
            hubs={state.hubs}
            vehicles={state.vehicles}
            detectionReason={selectedEvent?.detection_reason ?? null}
            plainReason={selectedEvent?.plain_reason || (selectedEvent?.detection_reason ?? null)}
            onClose={() => setSelectedId(null)}
            onRecovered={(saved) => {
              setSelectedId(null);
              const early = saved.hours > 0 ? ` Arrives ${saved.hours.toFixed(1)} hours early.` : "";
              pushToast(`Package rescued. $${saved.money.toFixed(0)} saved.${early}`);
            }}
          />
        )}
      </div>

      {/* Simulation controls */}
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 1500, display: "flex", gap: 8 }}>
        <button style={panelBtn} disabled={simBusy} onClick={() => onSim(state.running ? "pause" : "start")}
          aria-label={state.running ? "Pause the simulation" : "Start the simulation"}>
          {state.running ? "⏸ Pause" : "▶ Start"}
        </button>
        <button style={panelBtn} disabled={simBusy} onClick={() => onSim("reset")} aria-label="Reset the simulation to the start">
          ↺ Reset
        </button>
      </div>

      {/* Chaos banner (PS §29) + screen flash */}
      {chaosFlash && <div aria-hidden style={{ position: "fixed", inset: 0, background: "rgba(220,38,38,.18)", zIndex: 1900, pointerEvents: "none", transition: "opacity .9s" }} />}
      {chaosBanner && (
        <div role="alert" style={{
          position: "fixed", top: 76, left: "50%", transform: "translateX(-50%)",
          background: "#7f1d1d", color: "#fecaca", border: "2px solid #dc2626",
          borderRadius: 12, padding: "12px 22px", fontWeight: 800, fontSize: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,.5)", zIndex: 2000,
        }}>
          ⚠️ {chaosBanner}
        </div>
      )}

      {/* Rescue toasts with REAL values (PS §27) */}
      <div aria-live="polite" style={{ position: "fixed", bottom: 70, left: "50%", transform: "translateX(-50%)", zIndex: 2000 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: "#14532d", color: "#dcfce7", border: "1px solid #16a34a",
            borderRadius: 10, padding: "10px 16px", marginTop: 6, fontWeight: 600,
            boxShadow: "0 6px 24px rgba(0,0,0,.4)", maxWidth: 520,
          }}>
            {t.message.startsWith("Package rescued") ? `🎉 ${t.message}` : `⚡ ${t.message}`}
          </div>
        ))}
      </div>

      {/* First-load tour (PS §30), skippable */}
      {tourStep !== null && (
        <div role="dialog" aria-label="Quick tour" style={{
          position: "fixed", bottom: 130, left: "50%", transform: "translateX(-50%)",
          background: "#0f172a", border: "1px solid #3b82f6", borderRadius: 12,
          padding: "14px 18px", color: "#e2e8f0", zIndex: 2100, width: 480,
          boxShadow: "0 10px 40px rgba(0,0,0,.5)", fontSize: 13,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <b style={{ color: "#60a5fa" }}>Quick tour ({tourStep + 1}/3)</b>
            <button onClick={() => setTourStep(null)} style={{ ...panelBtn, padding: "2px 8px" }} aria-label="Skip the tour">Skip</button>
          </div>
          <div style={{ lineHeight: 1.5 }}>{TOUR_STEPS[tourStep]}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {tourStep > 0 && <button style={panelBtn} onClick={() => setTourStep(tourStep - 1)}>Back</button>}
            <button style={{ ...btnBlue }} onClick={() => (tourStep < 2 ? setTourStep(tourStep + 1) : setTourStep(null))}>
              {tourStep < 2 ? "Next" : "Got it"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnBlue: React.CSSProperties = {
  background: "#3b82f6", border: "none", color: "#fff",
  padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12,
};
