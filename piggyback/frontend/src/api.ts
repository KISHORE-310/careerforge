import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiErrorShape, Insights, WorldState } from "./types";

// Environment-based API configuration (no hardcoded localhost in components).
// Vite injects import.meta.env.* at build time; falls back to same-origin
// (the dashboard is designed to work behind the same origin or a dev proxy).
const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

const WS_BASE: string =
  (import.meta.env.VITE_WS_URL as string | undefined)?.replace(/\/$/, "") ?? "";

function wsUrl(): string {
  if (WS_BASE) return `${WS_BASE}/ws/simulation`;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws/simulation`;
}

/** Extract a human-readable message from the structured backend error shape. */
async function toError(r: Response, fallback: string): Promise<Error> {
  try {
    const body = (await r.json()) as ApiErrorShape;
    if (body?.error?.message) return new Error(`${body.error.code}: ${body.error.message}`);
  } catch {
    /* non-JSON error body */
  }
  return new Error(`${fallback} (HTTP ${r.status})`);
}

async function req<T>(path: string, init?: RequestInit, fallback = "Request failed"): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, init);
  if (!r.ok) throw await toError(r, fallback);
  return r.json() as Promise<T>;
}

const jsonInit = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// ---------------------------------------------------------------- REST

export async function fetchState(): Promise<WorldState> {
  return req("/api/v1/state", undefined, "Failed to load state");
}

export async function fetchInsights(): Promise<Insights> {
  return req("/api/v1/insights", undefined, "Failed to load insights");
}

export async function fetchOptimize(shipmentId: string) {
  return req<{
    shipment: WorldState["shipments"][0];
    candidates_evaluated: number;
    matched_count: number;
    options: import("./types").RecoveryOption[];
  }>(`/api/v1/optimize`, jsonInit({ shipment_id: shipmentId }), "Optimization failed");
}

export async function fetchRecover(shipmentId: string, optionRank: number) {
  return req<{ ok: boolean; recovered: boolean; message?: string }>(
    `/api/v1/recover`,
    jsonInit({ shipment_id: shipmentId, option_rank: optionRank }),
    "Recovery failed",
  );
}

export async function fetchSimControl(action: "start" | "pause" | "reset", seed?: number) {
  return req<{ ok: boolean; running: boolean; speed_multiplier: number; seed: number }>(
    `/api/v1/simulation/control`,
    jsonInit({ action, ...(seed !== undefined ? { seed } : {}) }),
    "Simulation control failed",
  );
}

export async function fetchChaos(scenario: string, opts: Record<string, unknown> = {}) {
  return req<{ ok: boolean; message?: string; reoptimized_count?: number }>(
    `/api/v1/chaos`,
    jsonInit({ scenario, ...opts }),
    "Chaos scenario failed",
  );
}

// ---------------------------------------------------------------- WebSocket + polling fallback

export type WsEvent = {
  event_id: string;
  timestamp: string;
  seq: number;
  type: string;
  entity_id: string | null;
  payload: Record<string, unknown>;
};

/**
 * Live state via WebSocket (envelope format: {event_id, timestamp, seq, type,
 * payload}) with automatic reconnect + exponential backoff, and a REST
 * polling fallback so the dashboard keeps working when WS fails entirely.
 */
export function useLiveState(onToast: (m: string) => void) {
  const toastCb = useRef(onToast);
  toastCb.current = onToast;
  const [state, setState] = useState<WorldState | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSeq = useRef(0);

  // REST fallback poll — only used while the WebSocket is disconnected.
  useEffect(() => {
    if (connected) return;
    let alive = true;
    let cancelled = false;
    const poll = async () => {
      while (alive && !cancelled) {
        try {
          const s = await fetchState();
          if (!alive || cancelled) return;
          setState(s);
          setError(null);
          await new Promise((r) => setTimeout(r, 2000));
        } catch (e) {
          if (!alive || cancelled) return;
          setError(e instanceof Error ? e.message : "Connection failed");
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    };
    poll();
    return () => {
      alive = false;
      cancelled = true;
    };
  }, [connected]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let closed = false;
    let attempts = 0;

    const connect = () => {
      if (closed) return;
      try {
        ws = new WebSocket(wsUrl());
      } catch {
        retry = setTimeout(connect, 2000);
        return;
      }
      ws.onopen = () => {
        attempts = 0;
        setConnected(true);
        setError(null);
      };
      ws.onclose = () => {
        setConnected(false);
        if (closed) return;
        attempts += 1;
        const delay = Math.min(8000, 1000 * 2 ** Math.min(attempts, 3));
        retry = setTimeout(connect, delay);
      };
      ws.onerror = () => ws?.close();
      ws.onmessage = (ev) => {
        let msg: WsEvent;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        // out-of-order protection
        if (msg.type === "state" && typeof msg.seq === "number" && msg.seq < lastSeq.current) return;
        if (msg.type === "state") lastSeq.current = msg.seq;

        switch (msg.type) {
          case "state":
            setState(msg.payload as unknown as WorldState);
            break;
          case "chaos":
          case "toast": {
            const p = msg.payload as { message?: string };
            if (p?.message) toastCb.current(p.message);
            break;
          }
          case "recovery_applied": {
            const p = msg.payload as { shipment?: { id?: string } };
            if (p?.shipment?.id) toastCb.current(`Recovery applied to ${p.shipment.id}`);
            break;
          }
          default:
            break;
        }
      };
    };
    connect();

    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      ws?.close();
    };
  }, []);

  return { state, setState, connected, error };
}

/** Convenience hook kept for compatibility with existing components. */
export function useWebSocket(onState: (s: WorldState) => void, onToast: (m: string) => void) {
  const stateCb = useRef(onState);
  const toastCb = useRef(onToast);
  const stableState = useCallback((s: WorldState) => stateCb.current(s), []);
  const stableToast = useCallback((m: string) => toastCb.current(m), []);
  toastCb.current = onToast;
  const { state, connected, error } = useLiveState(stableToast);
  useEffect(() => {
    if (state) stateCb.current(state);
  }, [state]);
  void stableState;
  return connected && !error ? true : error ? false : connected;
}
