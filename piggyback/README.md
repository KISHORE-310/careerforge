# SH-205 · Intelligent Shipment Piggybacking

A working end-to-end hackathon prototype, hardened to production-grade
engineering standards: **detects misplaced/disrupted shipments, finds vehicles
with spare capacity on overlapping routes, evaluates recovery options on cost /
time / priority / CO₂ / operational risk, and recommends the best plan on a
live map dashboard with human-in-the-loop approval.**

All six pipeline stages — **Detect → Search → Match → Evaluate → Decide → Show**
— are real, testable modules with real logic. Nothing is mocked: detection is
rule-based against simulated telemetry, matching enforces exact boundary
conditions, scoring normalizes and combines five criteria, every option card
shows the actual computed numbers, and every state change obeys an explicit,
validated state machine.

Problem statement: Smart India Hackathon **SH-205** (Procurement & Logistics).

**Docs:** [Architecture](docs/architecture.md) · [API reference](docs/api.md)
· Interactive OpenAPI at `/docs`.

---

## Quickstart (two terminals)

```bash
cp .env.example .env   # optional — all defaults work without it
```

**Backend** (Python 3.11+; developed on 3.13):

```bash
cd piggyback/backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The tick loop starts immediately — watch it in the server logs:

```
[tick 0012] misplaced_now=6 recovering=2 recovered=1 events=14
```

**Frontend** (Node 18+):

```bash
cd piggyback/frontend
npm install
npm run dev
```

Open **http://localhost:5173** — the dashboard connects over WebSocket and
starts streaming immediately (REST-polling fallback if the socket drops).
API docs with full schemas: **http://localhost:8000/docs**.

**Deterministic demo (golden path):**

```bash
cd piggyback/backend
python demo_golden_path.py --speed 40
```

walks detect → optimize → approve → recover → RECOVERED → metrics against a
seed-42 world.

**90-second demo script**

1. Watch the live feed: detections stream in with real reasons
   ("Stale scan: last scan 9.4h ago (threshold 8h)").
2. Click a shipment in **MISPLACED QUEUE** → the recovery panel opens with the
   detection reason and 3 ranked options (cost, delay, CO₂, risk, breakdown).
3. Click **Select** → review the confirmation (human-in-the-loop) →
   **Approve recovery** → shipment turns blue (RECOVERING), metrics bar jumps
   by the exact saved cost / hours / CO₂.
4. ~15–25 seconds later it reaches the destination hub → green (RECOVERED),
   recovered counter +1.
5. Hit **⚡ Chaos Mode** → a hub closes (gray on map), affected shipments
   re-flag with "Hub … closed", toast announces re-optimization.
6. Dashboard footer: **Pause / Start / Reset** the simulation any time
   (reset returns to the deterministic seed-42 world).

## Architecture

```
piggyback/
├── backend/
│   ├── app/
│   │   ├── config.py       # every tunable in one place (weights, thresholds, sim, AI)
│   │   ├── models.py       # Pydantic v2 models + validated state machines
│   │   ├── geo.py          # haversine + point-to-segment distance
│   │   ├── state.py        # in-memory world state (DB-swap-ready shape)
│   │   ├── generator.py    # deterministic seed: 20 hubs, 30 vehicles, 100 shipments
│   │   ├── detect.py       # L1 Detect: stale scan / route deviation / missed connection
│   │   ├── search.py       # L2 Search: spare capacity, excludes CLOSED-hub routes
│   │   ├── matching.py     # L3 Match: direct + multi-hop, exact boundary semantics
│   │   ├── evaluation.py   # L4 Evaluate: 5 objectives, min-max normalize, weight validation
│   │   ├── decision.py     # L5 Decide: rank, explain, transactional recovery apply
│   │   ├── simulation.py   # asyncio tick loop: movement, scans, induced anomalies
│   │   ├── chaos.py        # 6 disruption scenarios + hub reopen
│   │   ├── ai/
│   │   │   ├── risk_engine.py  # deterministic disruption-risk scoring
│   │   │   └── explainer.py    # template + optional LLM prose (fallback safe)
│   │   └── main.py         # FastAPI /api/v1 + WS envelopes + legacy aliases
│   ├── tests/              # 72 tests: transitions, recovery, chaos, API, WS, AI
│   └── demo_golden_path.py # deterministic end-to-end demo
├── docs/                   # architecture.md, api.md
└── frontend/
    └── src/
        ├── api.ts          # REST client + WS hook (seq ordering, backoff, polling fallback)
        ├── types.ts
        └── components/     # MapView, MetricsBar, RecoveryPanel, EventFeed, MisplacedQueue
```

See **[docs/architecture.md](docs/architecture.md)** for the full component
diagrams, state machines, recovery workflow sequence, AI architecture, failure
handling table, and security model.

## What's simulated vs. real

**Simulated:** vehicle GPS movement (haversine legs at type-based speeds), scan
events, anomaly injection (2%/tick, capped), deadlines (seeded 6–72h out).
**Real logic:** all six pipeline stages, scoring, multi-hop feasibility,
dedicated-trip CO₂ baseline comparison, recovery state transitions
(MISPLACED → RECOVERING → RECOVERED), metrics accounting, chaos re-optimization.

## How to tune weights

All tuning lives in **`backend/app/config.py`**:

| Knob | Default | Effect |
|---|---|---|
| `W_COST / W_TIME / W_PRIORITY / W_CO2` | 0.3 / 0.3 / 0.2 / 0.2 | scoring mix; must sum to 1.0 |
| `PRIORITY_WEIGHTS` | PLATINUM 1.0 … STANDARD 0.25 | priority contribution to score |
| `STALE_SCAN_HOURS` | 8.0 | L1 stale-scan threshold |
| `ROUTE_DEVIATION_KM` | 50.0 | L1 off-route threshold |
| `DELAY_TOLERANCE_BUFFER_HOURS` | 0.0 | how late a recovery may arrive and still match |
| `DEDICATED_COST_PER_KM` | 3.0 | baseline cost the piggyback saves against |
| `EMISSION_FACTOR` / `PIGGYBACK_EMISSION_FRACTION` | 0.05 / 0.10 | CO₂ model: dedicated emissions and marginal piggyback share |
| `MISPLACEMENT_RATE_PER_TICK` / `MAX_CONCURRENT_MISPLACED` | 0.02 / 15 | chaos volume |
| `SIM_HOURS_PER_TICK` / `TICK_SECONDS_REAL` | 1.0 / 1.0 | simulation clock speed |

You can also override scoring weights per request without touching config:

```json
POST /api/optimize
{"shipment_id": "S003", "weights": {"w_cost": 0.1, "w_time": 0.6, "w_priority": 0.2, "w_co2": 0.1}}
```

Thresholds are also env-overridable (`STALE_SCAN_HOURS`, `ROUTE_DEVIATION_KM`,
`DELAY_TOLERANCE_BUFFER_HOURS`, `TICK_SECONDS_REAL`, `MAX_CONCURRENT_MISPLACED`).

## Testing

```bash
cd piggyback/backend
python -m pytest tests/ -v
```

**72 tests** across seven suites:

- **test_matching / test_evaluation** — the spec-mandated boundary cases:
  capacity exactly at limit (pass) · 1kg over (fail) · route order reversed
  (fail) · deadline exactly at buffer edge (pass) · 1 minute past buffer
  (fail) · valid multi-hop (pass) · multi-hop through a CLOSED hub (fail) ·
  CO₂ exactly 90% of dedicated baseline · explanation strings contain the
  actual computed numbers
- **test_transitions** — legal recovery lifecycle, `MISPLACED → DELIVERED`
  rejected, terminal states frozen, destination-closure never DELIVERED
- **test_recovery_consistency** — original assignment REPLACED (never
  dual-active), capacity freed exactly once, idempotent double-recovery,
  traceable multi-hop legs, metrics booked once
- **test_chaos** — all six scenarios + reopen, destination closure →
  DISRUPTED (never DELIVERED), audit trail on every scenario
- **test_api** — every v1 endpoint, structured 404/422/409 errors,
  pagination, idempotent recover over HTTP, legacy aliases
- **test_ws** — envelope format, seq monotonicity, ping/pong
- **test_ai** — risk bounds/determinism/monotonicity, explanation numbers,
  LLM fallback without credentials

CI (`.github/workflows/ci.yml`) runs backend tests + frontend typecheck and
production build on every push/PR.

## Performance

Search → Match → Evaluate → Decide runs in **single-digit milliseconds** at
demo scale (30 vehicles × 100 shipments; measured well under the 1s budget).
At production scale this design would need: spatial indexing (R-tree / H3
hexes) for candidate pruning, precomputed hub-graph shortest paths instead of
per-pair haversine walks, async I/O against a real store, and a persistent
event queue.

## Deliberately cut for this prototype (v2 directions, not omissions)

- **Real carrier integrations** — telemetry is simulated by the tick engine
- **Authentication / authorization** — open endpoints for demo
- **A real database** — typed in-memory stores shaped for a Postgres swap
- **Docker** — two-terminal local run
- **OR-Tools / MILP solvers** — custom weighted scoring; a solver would find
  globally optimal multi-shipment assignments (next step)
- **ML-based anomaly detection** — rule-based L1 by design (explainable); the
  AI risk model uses fixed, published weights rather than a trained model so
  no unverified accuracy claims are made
- **Pareto / multi-objective libraries** — scalarization via normalized weights
- **Mobile responsiveness** — tuned for one laptop screen during the pitch
- **SimPy** — plain asyncio per spec
