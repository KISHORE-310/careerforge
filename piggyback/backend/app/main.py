"""SH-205 API — production hardening pass.

- /api/v1/* versioned endpoints (legacy /api/* aliases preserved)
- structured error envelope {success, error:{code,message,request_id}}
- per-request X-Request-Id, structured request logging
- recovery idempotency + per-shipment asyncio locks
- WebSocket envelopes with event_id/timestamp/seq + heartbeat
- chaos endpoints delegate to app.chaos (six scenarios)
"""
from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Set

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator

from . import config
from .chaos import (
    close_hub,
    delay_shipment,
    destination_unavailable,
    disrupt_route,
    fail_vehicle,
    reduce_capacity,
    reopen_hub,
)
from .generator import generate_world
from .matching import match_shipment
from .models import (
    DomainError,
    HubStatus,
    InvalidTransition,
    RecoveryEventStatus,
    ShipmentStatus,
    VehicleStatus,
    utcnow,
)
from .search import search_available_vehicles
from .simulation import simulation_loop
from .state import WORLD

logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
log = logging.getLogger("piggyback.api")


# ---------------------------------------------------------------- errors

class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message


def error_response(status_code: int, code: str, message: str, request_id: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {"code": code, "message": message, "request_id": request_id},
        },
    )


# CHUNK2

# ---------------------------------------------------------------- serializers

def hub_out(h) -> dict:
    return {"id": h.id, "name": h.name, "lat": h.lat, "lng": h.lng,
            "status": h.status.value,
            "transfer_time_hours": h.transfer_time_hours,
            "handling_cost_per_kg": h.handling_cost_per_kg}


def vehicle_out(v) -> dict:
    return {"id": v.id, "type": v.type.value, "route_hub_sequence": v.route_hub_sequence,
            "current_position": {"lat": v.current_position.lat, "lng": v.current_position.lng},
            "current_leg_index": v.current_leg_index, "progress_on_leg_km": round(v.progress_on_leg_km, 2),
            "total_capacity_kg": round(v.total_capacity_kg, 1), "used_capacity_kg": round(v.used_capacity_kg, 1),
            "cost_per_km": round(v.cost_per_km, 3), "speed_kmh": v.speed_kmh, "status": v.status.value}


def shipment_out(s) -> dict:
    deadline_h = (s.deadline - utcnow()).total_seconds() / 3600.0
    return {"id": s.id, "origin_hub_id": s.origin_hub_id, "destination_hub_id": s.destination_hub_id,
            "current_location": {"lat": round(s.current_location.lat, 6), "lng": round(s.current_location.lng, 6)},
            "planned_route_id": s.planned_route_id, "deadline": s.deadline.isoformat(),
            "priority": s.priority.value, "weight_kg": round(s.weight_kg, 1), "value_usd": round(s.value_usd, 2),
            "status": s.status.value, "last_scan_event_at": s.last_scan_event_at.isoformat(),
            "assigned_vehicle_id": s.assigned_vehicle_id, "current_leg_index": s.current_leg_index,
            "recovery_pickup_hub_id": s.recovery_pickup_hub_id,
            "hours_to_deadline": round(deadline_h, 2)}


def event_out(e) -> dict:
    return {"id": e.id, "shipment_id": e.shipment_id, "detected_at": e.detected_at.isoformat(),
            "detection_reason": e.detection_reason, "plain_reason": e.plain_reason,
            "severity": e.severity.value,
            "candidates_evaluated": e.candidates_evaluated,
            "chosen_option": e.chosen_option.model_dump() if e.chosen_option else None,
            "status": e.status.value}


def full_state() -> dict:
    w = WORLD
    with w.lock:  # consistent snapshot against the running tick loop
        shipments = [shipment_out(s) for s in w.shipments.values()]
        counts: Dict[str, int] = {}
        for s in shipments:
            counts[s["status"]] = counts.get(s["status"], 0) + 1
        active_vehicles = sum(1 for v in w.vehicles.values() if v.status.value != "COMPLETED")
        spare = sum(max(0.0, v.total_capacity_kg - v.used_capacity_kg) for v in w.vehicles.values())
        hubs = [hub_out(h) for h in w.hubs.values()]
        vehicles = [vehicle_out(v) for v in w.vehicles.values()]
        events = [event_out(e) for e in w.events[-50:]]
        metrics = dict(w.metrics)
        clock = (w.sim_time_offset_hours, w.tick_count, w.sim_running, w.speed_multiplier, w.seed)
    return {
        "sim_time_offset_hours": clock[0],
        "tick": clock[1],
        "running": clock[2],
        "speed_multiplier": clock[3],
        "seed": clock[4],
        "hubs": hubs,
        "vehicles": vehicles,
        "shipments": shipments,
        "events": events,
        "metrics": metrics,
        "summary": {
            "total_shipments": len(shipments),
            "active_shipments": sum(1 for s in shipments if s["status"] in ("IN_TRANSIT", "AT_HUB", "DELAYED")),
            "misplaced": counts.get("MISPLACED", 0),
            "disrupted": counts.get("DISRUPTED", 0),
            "recovering": counts.get("RECOVERING", 0),
            "recovered": counts.get("RECOVERED", 0),
            "delivered": counts.get("DELIVERED", 0),
            "active_vehicles": active_vehicles,
            "total_spare_capacity_kg": round(spare, 1),
        },
    }


# CHUNK3

# ---------------------------------------------------------------- websocket hub

class ConnectionManager:
    """Broadcasts envelope-wrapped state; assigns a monotonic sequence number
    so clients can detect gaps and resync via REST."""

    def __init__(self) -> None:
        self.active: Set[WebSocket] = set()
        self._lock = asyncio.Lock()
        self.seq = 0

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self.active.add(ws)

    def disconnect(self, ws: WebSocket) -> None:
        self.active.discard(ws)

    def _envelope(self, type_: str, payload: dict, entity_id: Optional[str] = None) -> dict:
        self.seq += 1
        return {
            "event_id": str(uuid.uuid4()),
            "timestamp": utcnow().isoformat(),
            "seq": self.seq,
            "type": type_,
            "entity_id": entity_id,
            "payload": payload,
        }

    async def broadcast(self, type_: str, payload: dict, entity_id: Optional[str] = None) -> None:
        dead = []
        data = json.dumps(self._envelope(type_, payload, entity_id), default=str)
        for ws in list(self.active):
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


MANAGER = ConnectionManager()


async def _broadcast_tick() -> None:
    if MANAGER.active:
        await MANAGER.broadcast("state", full_state())


# CHUNK4

# ---------------------------------------------------------------- app + middleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    generate_world(WORLD, seed=config.SIMULATION_SEED)
    task = asyncio.create_task(simulation_loop(WORLD, broadcast_fn=_broadcast_tick))
    log.info("simulation started", extra={"seed": config.SIMULATION_SEED})
    yield
    task.cancel()


app = FastAPI(
    title="Intelligent Shipment Piggybacking — SH-205",
    description=("Detect misplaced/disrupted shipments and recover them by piggybacking onto "
                 "vehicles with spare capacity on overlapping routes. Deterministic, explainable "
                 "multi-objective optimization: cost, time, priority, CO2, operational risk."),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id
    started = time.perf_counter()
    try:
        response = await call_next(request)
    except ApiError as exc:
        log.warning("api error", extra={"request_id": request_id, "path": request.url.path,
                                        "code": exc.code, "status": exc.status_code})
        return error_response(exc.status_code, exc.code, exc.message, request_id)
    except InvalidTransition as exc:
        log.warning("invalid transition", extra={"request_id": request_id, "error": str(exc)})
        return error_response(409, "INVALID_STATE_TRANSITION", str(exc), request_id)
    except DomainError as exc:
        return error_response(409, "DOMAIN_RULE_VIOLATION", str(exc), request_id)
    except ValueError as exc:
        return error_response(400, "BAD_REQUEST", str(exc), request_id)
    except KeyError as exc:
        return error_response(404, "NOT_FOUND", f"unknown entity: {exc}", request_id)
    except Exception as exc:  # never leak stack traces
        log.exception("unhandled error", extra={"request_id": request_id})
        return error_response(500, "INTERNAL_ERROR", "internal server error", request_id)
    response.headers["x-request-id"] = request_id
    duration_ms = (time.perf_counter() - started) * 1000
    if request.url.path.startswith("/api"):
        log.info("request", extra={"request_id": request_id, "method": request.method,
                                    "path": request.url.path, "status": response.status_code,
                                    "duration_ms": round(duration_ms, 2)})
    return response


# CHUNK5

# ---------------------------------------------------------------- request models

class MatchRequest(BaseModel):
    shipment_id: str = Field(min_length=1, max_length=64)


class OptimizeRequest(BaseModel):
    shipment_id: str = Field(min_length=1, max_length=64)
    weights: Optional[Dict[str, float]] = None


class RecoverRequest(BaseModel):
    shipment_id: str = Field(min_length=1, max_length=64)
    option_rank: int = Field(ge=1, le=10)


class SimControlRequest(BaseModel):
    action: str = Field(pattern="^(start|pause|reset)$")
    speed_multiplier: Optional[float] = Field(default=None, gt=0, le=100)
    seed: Optional[int] = Field(default=None, ge=0, le=2**31 - 1)


class ChaosRequest(BaseModel):
    scenario: str = Field(default="close-hub", pattern="^(close-hub|reopen-hub|fail-vehicle|reduce-capacity|disrupt-route|delay-shipment|destination-unavailable)$")
    hub_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    shipment_id: Optional[str] = None
    factor: Optional[float] = Field(default=None, gt=0, le=1)
    extra_hours: Optional[float] = Field(default=None, gt=0, le=72)


# CHUNK6

# ---------------------------------------------------------------- pipeline helper

# one lock per shipment: serializes concurrent /recover calls for the same id
_shipment_locks: Dict[str, asyncio.Lock] = {}
_locks_guard = asyncio.Lock()


async def _lock_for(shipment_id: str) -> asyncio.Lock:
    async with _locks_guard:
        if shipment_id not in _shipment_locks:
            _shipment_locks[shipment_id] = asyncio.Lock()
        return _shipment_locks[shipment_id]


def optimize_for_shipment(shipment_id: str, weights=None) -> dict:
    """Match -> Evaluate -> Decide for one shipment (world lock held while the
    pipeline runs, so it never reads a mid-tick world)."""
    from .evaluation import validate_weights
    try:
        validate_weights(weights)
    except ValueError as exc:
        raise ApiError(422, "INVALID_WEIGHTS", str(exc))
    with WORLD.lock:
        shipment = WORLD.shipments.get(shipment_id)
        if shipment is None:
            raise ApiError(404, "SHIPMENT_NOT_FOUND", f"unknown shipment {shipment_id}")
        now = utcnow()
        candidates = search_available_vehicles(WORLD)
        matched = match_shipment(WORLD, shipment, candidates, now)
        from .evaluation import evaluate_options
        evaluated = evaluate_options(WORLD, shipment, matched, weights, now)
        from .decision import decide_top_options
        options = decide_top_options(evaluated, shipment_id, world=WORLD)
        for ev in WORLD.events:
            if ev.shipment_id == shipment_id and ev.status == RecoveryEventStatus.PENDING:
                ev.candidates_evaluated = len(matched)
        shipment_dict = shipment_out(shipment)
        options_dicts = [o.model_dump() for o in options]
        result = {
            "shipment": shipment_dict,
            "candidates_evaluated": len(candidates),
            "matched_count": len(matched),
            "options": options_dicts,
        }
    from .ai import llm_explain_recovery
    world_state = {
        "hubs": {h.id: {"name": h.name} for h in WORLD.hubs.values()},
        "vehicles": {v.id: {"type": v.type.value} for v in WORLD.vehicles.values()},
    }
    for idx, (o, od) in enumerate(zip(options, options_dicts)):
        od = dict(od)
        od["utilization_gain"] = getattr(o, "utilization_gain", od.get("utilization_gain", 0.0))
        o.explanation = llm_explain_recovery(od, shipment_dict, options_dicts, world_state)["text"]
        options_dicts[idx]["explanation"] = o.explanation
        result["options"] = options_dicts
    return result


# CHUNK7

# ---------------------------------------------------------------- REST v1

API = "/api/v1"


@app.get(f"{API}/health")
def health() -> dict:
    return {"status": "ok", "tick": WORLD.tick_count, "seed": WORLD.seed,
            "hubs": len(WORLD.hubs), "vehicles": len(WORLD.vehicles),
            "shipments": len(WORLD.shipments), "version": "2.0.0"}


@app.get(f"{API}/state")
def get_state() -> dict:
    return full_state()


@app.get(f"{API}/shipments")
def list_shipments(status: Optional[str] = None, limit: int = 100, offset: int = 0) -> dict:
    """Paginated shipment list with optional status filter."""
    items = [shipment_out(s) for s in WORLD.shipments.values()]
    if status:
        items = [s for s in items if s["status"] == status.upper()]
    total = len(items)
    limit = max(1, min(limit, 500))
    return {"total": total, "limit": limit, "offset": offset,
            "items": items[offset : offset + limit]}


@app.get(f"{API}/vehicles")
def list_vehicles(limit: int = 100, offset: int = 0) -> dict:
    items = [vehicle_out(v) for v in WORLD.vehicles.values()]
    total = len(items)
    limit = max(1, min(limit, 500))
    return {"total": total, "limit": limit, "offset": offset,
            "items": items[offset : offset + limit]}


@app.get(f"{API}/hubs")
def list_hubs() -> dict:
    return {"items": [hub_out(h) for h in WORLD.hubs.values()]}


# CHUNK8

@app.post(f"{API}/match")
def post_match(req: MatchRequest) -> dict:
    """Layer 3 output: feasible candidates for a misplaced shipment."""
    shipment = WORLD.shipments.get(req.shipment_id)
    if shipment is None:
        raise ApiError(404, "SHIPMENT_NOT_FOUND", f"unknown shipment {req.shipment_id}")
    now = utcnow()
    candidates = search_available_vehicles(WORLD)
    matched = match_shipment(WORLD, shipment, candidates, now)
    return {
        "shipment": shipment_out(shipment),
        "candidates_evaluated": len(candidates),
        "matched": [
            {"vehicle_ids": m.vehicle_ids, "transfer_hub_ids": m.transfer_hub_ids,
             "distance_km": round(m.distance_km, 1),
             "estimated_arrival_hours": round(m.estimated_arrival_hours, 2),
             "label": m.label}
            for m in matched
        ],
    }


@app.post(f"{API}/optimize")
def post_optimize(req: OptimizeRequest) -> dict:
    """Match->Evaluate->Decide with optional (validated) weight overrides."""
    return optimize_for_shipment(req.shipment_id, req.weights)


@app.post(f"{API}/recover")
async def post_recover(req: RecoverRequest) -> dict:
    """Apply the chosen option. Idempotent + concurrency-safe: a duplicate call
    for an already-recovering shipment returns the current state unchanged
    (200 with recovered=true)."""
    lock = await _lock_for(req.shipment_id)
    async with lock:
        with WORLD.lock:
            shipment = WORLD.shipments.get(req.shipment_id)
            if shipment is None:
                raise ApiError(404, "SHIPMENT_NOT_FOUND", f"unknown shipment {req.shipment_id}")
            if shipment.status in (ShipmentStatus.RECOVERING, ShipmentStatus.RECOVERED,
                                   ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED):
                return {"ok": True, "recovered": True, "idempotent": True,
                        "shipment": shipment_out(shipment),
                        "message": f"shipment already {shipment.status.value}"}
            result = optimize_for_shipment(req.shipment_id)
            options = result["options"]
            chosen = next((o for o in options if o["rank"] == req.option_rank), None)
            if chosen is None:
                raise ApiError(409, "OPTION_NOT_AVAILABLE",
                               f"option rank {req.option_rank} not available; "
                               f"available ranks: {[o['rank'] for o in options]}")
            from .models import RecoveryOption
            from .decision import apply_recovery
            opt = RecoveryOption(**chosen)
            apply_recovery(WORLD, req.shipment_id, opt)
            applied_state = shipment_out(shipment)
        await MANAGER.broadcast("recovery_applied", {"shipment": applied_state,
                                                      "option": chosen}, entity_id=req.shipment_id)
        return {"ok": True, "recovered": False, "shipment": applied_state, "applied_option": chosen}


# CHUNK9

@app.get(f"{API}/events")
def get_events(limit: int = 100, offset: int = 0) -> dict:
    total = len(WORLD.events)
    limit = max(1, min(limit, 500))
    # newest first
    items = [event_out(e) for e in reversed(WORLD.events)][offset : offset + limit]
    return {"total": total, "limit": limit, "offset": offset, "items": items}


def world_assignments_iter(world):
    return world.assignments.values()


def a_weight_kg(world, a):
    s = world.shipments.get(a.shipment_id)
    return s.weight_kg if s else 0.0


@app.get(f"{API}/metrics")
def get_metrics() -> dict:
    m = dict(WORLD.metrics)
    m["open_events"] = sum(1 for e in WORLD.events if e.status == RecoveryEventStatus.PENDING)
    m["misplaced_count"] = sum(1 for s in WORLD.shipments.values() if s.status == ShipmentStatus.MISPLACED)
    m["disrupted_count"] = sum(1 for s in WORLD.shipments.values() if s.status == ShipmentStatus.DISRUPTED)
    m["recovering_count"] = sum(1 for s in WORLD.shipments.values() if s.status == ShipmentStatus.RECOVERING)
    m["recovered_count"] = sum(1 for s in WORLD.shipments.values() if s.status == ShipmentStatus.RECOVERED)
    # scoreboard "space used" (PS §23): kg loaded onto spare capacity by rescues
    m["total_space_used_kg"] = round(sum(
        a_weight_kg(WORLD, a) for a in world_assignments_iter(WORLD) if a.is_recovery_leg
        and a.status.value in ("PENDING", "IN_TRANSIT", "COMPLETED")
    ), 1)
    m["active_shipments"] = sum(1 for s in WORLD.shipments.values() if s.status in (
        ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_HUB, ShipmentStatus.DELAYED, ShipmentStatus.RECOVERING))
    m["active_vehicles"] = sum(1 for v in WORLD.vehicles.values() if v.status != VehicleStatus.COMPLETED)
    m["available_capacity_kg"] = round(sum(
        max(0.0, v.total_capacity_kg - v.used_capacity_kg)
        for v in WORLD.vehicles.values() if v.status != VehicleStatus.COMPLETED), 1)
    return m


@app.get(f"{API}/risk")
def get_risk(limit: int = 20) -> dict:
    """AI risk layer: deterministic disruption-risk ranking for active shipments."""
    from .ai import assess_fleet_risk
    now = utcnow()
    assessments = assess_fleet_risk(list(WORLD.shipments.values()), now,
                                    WORLD.routes, WORLD.vehicles, WORLD.hubs)
    limit = max(1, min(limit, 100))
    return {"generated_at": now.isoformat(), "total_assessed": len(assessments),
            "items": [a.to_dict() for a in assessments[:limit]]}


@app.get(f"{API}/insights")
def get_insights() -> dict:
    """AI operational insight: system summary + top risks + LLM status."""
    from .ai import assess_fleet_risk, explain_system_state, ai_status
    now = utcnow()
    m = get_metrics()
    risks = assess_fleet_risk(list(WORLD.shipments.values()), now,
                              WORLD.routes, WORLD.vehicles, WORLD.hubs)
    return {
        "summary": explain_system_state(m, risks),
        "top_risks": [r.to_dict() for r in risks[:5]],
        "ai": ai_status(),
        "generated_at": now.isoformat(),
    }


@app.post(f"{API}/simulation/control")
def sim_control(req: SimControlRequest) -> dict:
    if req.action == "start":
        WORLD.sim_running = True
    elif req.action == "pause":
        WORLD.sim_running = False
    elif req.action == "reset":
        seed = req.seed if req.seed is not None else config.SIMULATION_SEED
        generate_world(WORLD, seed=seed)
        _shipment_locks.clear()
    if req.speed_multiplier is not None:
        WORLD.speed_multiplier = req.speed_multiplier
    return {"ok": True, "running": WORLD.sim_running,
            "speed_multiplier": WORLD.speed_multiplier, "seed": WORLD.seed}


# CHUNK10

@app.post(f"{API}/chaos")
async def chaos_endpoint(req: ChaosRequest) -> dict:
    """Chaos Mode: trigger any of the six disruption scenarios (or hub reopen).
    Broadcasts the toast + re-optimized state over WebSocket."""
    kwargs: dict = {}
    if req.hub_id is not None:
        kwargs["hub_id"] = req.hub_id
    if req.vehicle_id is not None:
        kwargs["vehicle_id"] = req.vehicle_id
    if req.shipment_id is not None:
        kwargs["shipment_id"] = req.shipment_id
    if req.factor is not None:
        kwargs["factor"] = req.factor
    if req.extra_hours is not None:
        kwargs["extra_hours"] = req.extra_hours
    fn = {
        "close-hub": close_hub,
        "reopen-hub": reopen_hub,
        "fail-vehicle": fail_vehicle,
        "reduce-capacity": reduce_capacity,
        "disrupt-route": disrupt_route,
        "delay-shipment": delay_shipment,
        "destination-unavailable": destination_unavailable,
    }[req.scenario]
    result = fn(WORLD, **kwargs)
    # re-run the pipeline for every currently-misplaced/disrupted shipment
    all_flagged = [s.id for s in WORLD.shipments.values()
                   if s.status in (ShipmentStatus.MISPLACED, ShipmentStatus.DISRUPTED)]
    reopt: Dict[str, dict] = {}
    for sid in all_flagged:
        try:
            reopt[sid] = optimize_for_shipment(sid)
        except ApiError:
            reopt[sid] = {"options": []}
    await MANAGER.broadcast("chaos", {**result, "reoptimized_count": len(all_flagged)})
    await _broadcast_tick()
    return {"ok": True, **result, "reoptimized_count": len(all_flagged)}


# CHUNK11

@app.websocket("/ws/simulation")
async def ws_simulation(ws: WebSocket) -> None:
    await MANAGER.connect(ws)
    try:
        await ws.send_text(json.dumps(
            MANAGER._envelope("state", full_state()), default=str))
        while True:
            # client heartbeat / pings; reply with ack so clients can measure RTT
            raw = await ws.receive_text()
            try:
                msg = json.loads(raw)
            except Exception:
                continue
            if msg.get("type") == "ping":
                await ws.send_text(json.dumps(
                    MANAGER._envelope("pong", {"client_ts": msg.get("ts")}), default=str))
    except WebSocketDisconnect:
        pass
    except Exception:
        log.exception("ws error")
    finally:
        MANAGER.disconnect(ws)


# ---------------------------------------------------------------- legacy aliases (v1 unwrapped)
# The original prototype used /api/... paths; keep them working so older
# clients and bookmarks do not break. They share the same handlers.

app.add_api_route("/api/state", get_state, methods=["GET"])
app.add_api_route("/api/match", post_match, methods=["POST"])
app.add_api_route("/api/optimize", post_optimize, methods=["POST"])
app.add_api_route("/api/recover", post_recover, methods=["POST"])
app.add_api_route("/api/events", get_events, methods=["GET"])
app.add_api_route("/api/metrics", get_metrics, methods=["GET"])
app.add_api_route("/api/simulation/control", sim_control, methods=["POST"])
app.add_api_route("/api/chaos/close-hub", chaos_endpoint, methods=["POST"],
                  include_in_schema=False)
app.add_api_route("/api/chaos", chaos_endpoint, methods=["POST"], include_in_schema=False)
app.add_api_route("/api/health", health, methods=["GET"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=config.API_PORT)
