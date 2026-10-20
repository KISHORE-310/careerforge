# SH-205 — API Reference (v1)

Base URL: `http://127.0.0.1:8000/api/v1` (legacy unwrapped `/api/*` aliases
are kept working). Interactive OpenAPI docs: `/docs`.

All errors use one structured shape:

```json
{
  "success": false,
  "error": {
    "code": "SHIPMENT_NOT_FOUND",
    "message": "unknown shipment NOPE",
    "request_id": "…"
  }
}
```

Every response carries an `x-request-id` header.

---

## GET /api/v1/health
Liveness + world summary.

```json
{"status": "ok", "tick": 80, "seed": 42, "hubs": 20, "vehicles": 30,
 "shipments": 100, "version": "2.0.0"}
```

## GET /api/v1/state
Full current world: `hubs`, `vehicles`, `shipments`, `events`, `metrics`,
sim clock fields. (Used as the WS fallback snapshot.)

## GET /api/v1/shipments?status=&limit=&offset=
Paginated shipment list. Query params: `status` (optional enum filter),
`limit` (1–500, default 100), `offset`. Returns `{total, limit, offset, items}`.

## GET /api/v1/vehicles?limit=&offset= · GET /api/v1/hubs
Paginated fleets / hub registry (same envelope shape).

## POST /api/v1/match
Request `{"shipment_id": "S001"}` → Layer-3 output for a misplaced shipment:
feasible candidates with vehicles, transfer hubs, distance, ETA hours.

Errors: `404 SHIPMENT_NOT_FOUND`.

## POST /api/v1/optimize
Request `{"shipment_id": "S001", "weights": {"w_cost": 0.4}}` (weights
optional; all five keys optional, each `>= 0`, sum `> 0`).

Response: shipment + `candidates_evaluated` + `matched_count` + top-3 ranked
`options`. Each option: `rank, strategy_label, vehicle_ids, transfer_hub_ids,
estimated_cost_usd, dedicated_cost_usd, cost_saved_usd, estimated_delay_hours,
co2_saved_kg, score, score_breakdown, explanation, risk_score`.

Errors: `404 SHIPMENT_NOT_FOUND`, `422 INVALID_WEIGHTS`.

## POST /api/v1/recover
Request `{"shipment_id": "S001", "option_rank": 1}`.

Applies the chosen option: original assignment → `REPLACED`, capacity freed,
recovery legs created, shipment → `RECOVERING`, metrics booked, event
resolved, WS `recovery_applied` broadcast.

- Idempotent: repeating a call for an already-RECOVERING/RECOVERED shipment
  returns `200 {"ok": true, "recovered": true, "idempotent": true, …}`.
- Errors: `404 SHIPMENT_NOT_FOUND`, `409 OPTION_NOT_AVAILABLE` (rank not in
  current top-3).

## GET /api/v1/events?limit=&offset=
Recovery audit feed, newest first, paginated.

## GET /api/v1/metrics
Live totals: `total_cost_saved_usd`, `total_delay_hours_saved`,
`total_co2_saved_kg`, `recovered_count`, `misplaced_count`,
`disrupted_count`, `recovering_count`, `active_shipments`,
`active_vehicles`, `available_capacity_kg`, `open_events`.
All values are computed from simulation state (SIMULATED data, real math).

## GET /api/v1/risk?limit=
AI risk ranking for active shipments (deterministic). Items:
`{shipment_id, risk ∈ [0,1], level, factors{…}, explanation}`.

## GET /api/v1/insights
Operational summary: `{summary, top_risks[5], ai{enabled, provider, model,
fallback}, generated_at}`.

## POST /api/v1/simulation/control
Request `{"action": "start|pause|reset", "speed_multiplier"?: >0, "seed"?: int}`.
`reset` regenerates the world (default seed from `SIMULATION_SEED`).
Returns current control state.

Errors: `422` for invalid action / out-of-range values.

## POST /api/v1/chaos
Request:

```json
{"scenario": "close-hub|reopen-hub|fail-vehicle|reduce-capacity|disrupt-route|delay-shipment|destination-unavailable",
 "hub_id"?: "H07", "vehicle_id"?: "V12", "shipment_id"?: "S004",
 "factor"?: 0.5, "extra_hours"?: 6}
```

IDs are optional: when omitted the engine picks the most-impacted entity.
Destination-hub scenarios mark affected shipments **DISRUPTED (never
DELIVERED)**; `reopen-hub` returns them to the recoverable pool. Response
includes the toast `message`, newly flagged ids, and `reoptimized_count`.

Errors: `422` unknown scenario, `409`/`400` domain errors (e.g. reopening an
already-active hub), `404` unknown ids.

## Legacy aliases (unwrapped, unchanged behavior)
`GET /api/state`, `POST /api/match`, `POST /api/optimize`, `POST /api/recover`,
`GET /api/events`, `GET /api/metrics`, `POST /api/simulation/control`,
`POST /api/chaos` and `POST /api/chaos/close-hub`, `GET /api/health`.

## WS /ws/simulation
Server → client envelopes:

```json
{"event_id": "…", "timestamp": "…", "seq": 42, "type": "state",
 "entity_id": null, "payload": {…full world state…}}
```

Types: `state` (~1/s), `chaos`, `recovery_applied`, `pong`. Client → server:
`{"type": "ping", "ts": …}`. Out-of-order `state` frames (older `seq`) are
dropped client-side; if the socket dies the dashboard polls
`GET /api/v1/state` every 2s and reconnects with backoff.
