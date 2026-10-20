"""Simulation engine (spec §6): plain asyncio tick loop.

One tick = SIM_HOURS_PER_TICK simulated hours. Advances vehicles, scans
shipments at hubs, induces anomalies (real mechanics, not status-flag fraud),
then runs Layer-1 detection so misplacements happen "naturally".
"""
from __future__ import annotations

import asyncio
import random
from datetime import timedelta
from typing import List, Optional

from . import config
from .geo import haversine_km
from .models import (
    AssignmentStatus,
    GeoPoint,
    HubStatus,
    Shipment,
    ShipmentStatus,
    VehicleStatus,
    utcnow,
)
from .state import World


def _hub_pos(world: World, hub_id: str) -> GeoPoint:
    h = world.hubs[hub_id]
    return GeoPoint(lat=h.lat, lng=h.lng)


def advance_vehicle(world: World, vehicle_id: str, hours: float) -> None:
    """Move a vehicle along its route by `hours` simulated hours."""
    v = world.vehicles[vehicle_id]
    if v.status == VehicleStatus.COMPLETED:
        return
    # Departure scan: a vehicle sitting at a hub (route start, respawn, or
    # post-landing dwell) must board pending recovery legs at that hub before
    # departing — otherwise a transfer leg whose carrier STARTS its route at
    # the transfer hub would never activate (no arrival scan ever fires there).
    seq0 = v.route_hub_sequence
    if v.progress_on_leg_km <= 0.0 and v.current_leg_index < len(seq0) - 1:
        _scan_arrivals(world, vehicle_id, seq0[v.current_leg_index])
    remaining_h = hours
    guard = 0
    while remaining_h > 1e-9 and guard < 10:
        guard += 1
        seq = v.route_hub_sequence
        i = v.current_leg_index
        if i >= len(seq) - 1:
            v.status = VehicleStatus.COMPLETED
            return
        a, b = world.hubs[seq[i]], world.hubs[seq[i + 1]]
        leg_km = haversine_km(a.lat, a.lng, b.lat, b.lng)
        remaining_km = leg_km - v.progress_on_leg_km
        hours_needed = remaining_km / v.speed_kmh
        if remaining_h >= hours_needed:
            # leg completes this tick -> land at hub, scan there
            v.progress_on_leg_km = 0.0
            v.current_leg_index = i + 1
            v.status = VehicleStatus.AT_HUB
            v.current_position = _hub_pos(world, seq[i + 1])
            _scan_arrivals(world, vehicle_id, seq[i + 1])
            remaining_h -= hours_needed
            # final hub: respawn for continuous dispatch (prototype keeps the
            # world alive); anomaly-COMPLETED vehicles never reach here
            if v.current_leg_index >= len(seq) - 1:
                v.current_leg_index = 0
                v.progress_on_leg_km = 0.0
                v.current_position = _hub_pos(world, seq[0])
                v.status = VehicleStatus.IN_TRANSIT
                return
            # else wait for next tick to depart (AT_HUB for this tick per spec)
            return
        else:
            v.progress_on_leg_km += remaining_h * v.speed_kmh
            frac = v.progress_on_leg_km / leg_km
            v.current_position = GeoPoint(
                lat=a.lat + (b.lat - a.lat) * frac,
                lng=a.lng + (b.lng - a.lng) * frac,
            )
            # vehicle departed the hub and is moving again
            v.status = VehicleStatus.IN_TRANSIT
            remaining_h = 0.0


def _assignment_path(world: World, a) -> list:
    """Hub sequence the assignment is expected to pass through: the carrying
    vehicle's route between from_hub_id and to_hub_id (inclusive)."""
    v = world.vehicles.get(a.vehicle_id)
    if v is None:
        return []
    seq = v.route_hub_sequence
    try:
        i, j = seq.index(a.from_hub_id), seq.index(a.to_hub_id)
    except ValueError:
        return []
    if i > j:
        i, j = j, i
    return seq[i : j + 1]


def _scan_arrivals(world: World, vehicle_id: str, hub_id: str) -> None:
    """When a vehicle reaches hub_id: complete its in-transit shipment legs,
    then activate any pending recovery legs boarding at this hub."""
    now = utcnow()
    for a in world.assignments.values():
        if a.vehicle_id != vehicle_id or a.status != AssignmentStatus.IN_TRANSIT:
            continue
        # An assignment spans origin..destination across several route legs.
        # It completes only when the vehicle reaches the assignment's final
        # destination hub; intermediate hub arrivals still scan the shipment
        # (fresh GPS + scan timestamp) without completing the assignment.
        reached_destination = a.to_hub_id == hub_id
        passed_through = (
            not a.is_recovery_leg
            and hub_id in _assignment_path(world, a)
            and hub_id != a.from_hub_id
        )
        if not (reached_destination or passed_through):
            continue
        s = world.shipments.get(a.shipment_id)
        if s is None:
            continue
        # always refresh scan telemetry when the carrier passes a hub
        s.current_location = _hub_pos(world, hub_id)
        s.last_scan_event_at = now
        if s.status == ShipmentStatus.IN_TRANSIT:
            s.current_leg_index = world.vehicles[vehicle_id].current_leg_index
        if reached_destination:
            a.actual_arrival = now
            a.set_status(AssignmentStatus.COMPLETED)
            if s.status == ShipmentStatus.RECOVERING and hub_id == s.destination_hub_id:
                s.set_status(ShipmentStatus.RECOVERED)
                world.metrics["recovered_count"] += 1
    # board pending recovery legs whose pickup/transfer point is this hub
    for a in world.assignments.values():
        if (
            a.vehicle_id == vehicle_id
            and a.status == AssignmentStatus.PENDING
            and a.from_hub_id == hub_id
        ):
            a.status = AssignmentStatus.IN_TRANSIT


def induce_anomalies(world: World, rng: random.Random) -> List[str]:
    """~2% of in-transit shipments get a real mechanical anomaly each tick:
    skipped scan, GPS nudge off-route, or vehicle marked COMPLETED without
    scanning. Layer 1 then detects these naturally on the next tick."""
    affected: List[str] = []
    in_transit = [
        s for s in world.shipments.values() if s.status == ShipmentStatus.IN_TRANSIT
    ]
    # keep the demo playable: cap how many shipments can sit MISPLACED at once
    already_misplaced = sum(
        1 for s in world.shipments.values() if s.status == ShipmentStatus.MISPLACED
    )
    budget = max(0, config.MAX_CONCURRENT_MISPLACED - already_misplaced)
    if budget == 0:
        return affected
    n_hits = min(
        budget,
        int(len(in_transit) * config.MISPLACEMENT_RATE_PER_TICK + rng.random()),
    )
    if n_hits == 0:
        return affected
    for s in rng.sample(in_transit, min(n_hits, len(in_transit))):
        mode = rng.choice(["skip_scan", "nudge", "vanish"])
        if mode == "skip_scan":
            # rewind its last scan so it goes stale
            s.last_scan_event_at = utcnow() - timedelta(hours=config.STALE_SCAN_HOURS + rng.uniform(0.5, 6))
            affected.append(s.id)
        elif mode == "nudge":
            # push the GPS location well off the planned route (>50km)
            off_km = config.ROUTE_DEVIATION_KM * rng.uniform(1.2, 2.0)
            dlat = (off_km / 110.574) * rng.choice([-1, 1])
            dlng = (off_km / (111.32 * 0.85)) * rng.choice([-1, 1])
            s.current_location = GeoPoint(
                lat=s.current_location.lat + dlat,
                lng=s.current_location.lng + dlng,
            )
            affected.append(s.id)
        else:  # vanish: vehicle completes leg without scanning the shipment
            asg = next(
                (a for a in world.assignments.values()
                 if a.shipment_id == s.id and a.status == AssignmentStatus.IN_TRANSIT),
                None,
            )
            if asg is None:
                continue
            v = world.vehicles.get(asg.vehicle_id)
            if v is None:
                continue
            # vehicle reported the leg complete without delivering/scanning:
            # pull its scheduled arrival into the past so detection fires
            asg.scheduled_arrival = utcnow() - timedelta(hours=config.MISSED_CONNECTION_BUFFER_HOURS + 0.5)
            v.status = VehicleStatus.COMPLETED
            affected.append(s.id)
    return affected


def run_tick(world: World, tick_rng: random.Random) -> dict:
    """One simulation tick: move, scan, induce anomalies, detect.

    Runs under the world lock so sync API readers (threadpool) never see a
    half-advanced world."""
    from .detect import run_detection

    with world.lock:
        hours = config.SIM_HOURS_PER_TICK
        for vid in list(world.vehicles.keys()):
            advance_vehicle(world, vid, hours)
        induced = induce_anomalies(world, tick_rng)
        new_events = run_detection(world)
        world.tick_count += 1
        return {
            "tick": world.tick_count,
            "induced": induced,
            "new_events": [e.shipment_id for e in new_events],
        }


async def simulation_loop(world: World, broadcast_fn=None, stop_event: Optional[asyncio.Event] = None) -> None:
    """Background asyncio task: tick, log, and broadcast ~once per second."""
    rng = random.Random(1234)
    while not (stop_event and stop_event.is_set()):
        await asyncio.sleep(max(0.05, config.TICK_SECONDS_REAL / max(world.speed_multiplier, 0.05)))
        if not world.sim_running:
            continue
        result = run_tick(world, rng)
        if result["new_events"] or result["tick"] % 10 == 0:
            print(
                f"[tick {result['tick']:04d}] "
                f"misplaced_now={sum(1 for s in world.shipments.values() if s.status == ShipmentStatus.MISPLACED)} "
                f"recovering={sum(1 for s in world.shipments.values() if s.status == ShipmentStatus.RECOVERING)} "
                f"recovered={world.metrics['recovered_count']:.0f} "
                f"events={len(world.events)}",
                flush=True,
        )
        if broadcast_fn:
            try:
                await broadcast_fn()
            except Exception as exc:  # pragma: no cover
                print(f"broadcast error: {exc}", flush=True)
