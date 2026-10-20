"""Chaos / disruption engine (production pass).

Six scenarios, all triggering legitimate downstream behavior:
  HUB_CLOSURE, VEHICLE_FAILURE, CAPACITY_REDUCTION, ROUTE_DISRUPTION,
  SHIPMENT_DELAY, DESTINATION_UNAVAILABLE

Critical correctness rule: a shipment whose DESTINATION becomes unavailable
is DISRUPTED (never DELIVERED). It stays recoverable: when the hub reopens,
or via reroute candidates that ship it to a nearby ACTIVE hub.
"""
from __future__ import annotations

import logging
from datetime import timedelta
from typing import Dict, List, Optional

from . import config
from .detect import nearest_active_hub
from .models import (
    AssignmentStatus,
    ChaosScenarioType,
    EventSeverity,
    GeoPoint,
    HubStatus,
    RecoveryEvent,
    ShipmentStatus,
    VehicleStatus,
    utcnow,
)
from .state import World

log = logging.getLogger("piggyback.chaos")


def _impacted_by_hub(world: World, hub_id: str) -> List:
    out = []
    for s in world.shipments.values():
        if s.status not in (ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_HUB, ShipmentStatus.DELAYED):
            continue
        route = world.routes.get(s.planned_route_id)
        on_planned = route is not None and hub_id in route.hub_sequence
        carrier = world.vehicles.get(s.assigned_vehicle_id) if s.assigned_vehicle_id else None
        on_carrier = carrier is not None and hub_id in carrier.route_hub_sequence
        if on_planned or on_carrier or s.destination_hub_id == hub_id:
            out.append(s)
    return out


def _flag(world: World, shipment, reason: str, severity: EventSeverity, now, target_status: ShipmentStatus) -> RecoveryEvent:
    """Move a shipment to a problem state with a validated transition + audit
    event (plain_reason included for the UI)."""
    shipment.set_status(target_status)
    pickup = nearest_active_hub(world, shipment.current_location.lat, shipment.current_location.lng)
    shipment.recovery_pickup_hub_id = pickup.id if pickup else None
    plain = f"{pickup.name} closed, so this package needs a new plan." if (
        "closed" in reason or "unavailable" in reason) else reason
    ev = RecoveryEvent(
        id=f"E-{shipment.id}-CHAOS-{int(now.timestamp() * 1000)}-{len(world.events)}",
        shipment_id=shipment.id,
        detected_at=now,
        detection_reason=reason,
        plain_reason=plain,
        severity=severity,
    )
    world.add_event(ev)
    log.info("chaos flag", extra={"entity_id": shipment.id, "reason": reason})
    return ev


def close_hub(world: World, hub_id: Optional[str] = None, respect_cap: bool = True) -> Dict:
    """Close a hub (or the most-disruptive ACTIVE one) and re-flag shipments.

    Destination-hub shipments -> DISRUPTED (never DELIVERED) with reason
    'Destination hub {name} closed'; transit routes through the hub -> MISPLACED.
    """
    now = utcnow()
    hub = None
    if hub_id:
        hub = world.hubs.get(hub_id)
        if hub is None:
            raise KeyError(f"unknown hub {hub_id}")
        if hub.status == HubStatus.CLOSED:
            raise ValueError(f"hub {hub_id} already closed")
    else:
        best_n = -1
        for h in world.hubs.values():
            if h.status != HubStatus.ACTIVE:
                continue
            n = len(_impacted_by_hub(world, h.id))
            if n > best_n:
                best_n, hub = n, h
    if hub is None:
        raise ValueError("no ACTIVE hub available to close")

    hub.status = HubStatus.CLOSED
    impacted = _impacted_by_hub(world, hub.id)
    newly_flagged: List[str] = []
    budget = config.MAX_CONCURRENT_MISPLACED if respect_cap else 10_000

    for s in impacted:
        if s.destination_hub_id == hub.id:
            _flag(world, s, f"Destination hub {hub.name} closed", EventSeverity.HIGH, now, ShipmentStatus.DISRUPTED)
            newly_flagged.append(s.id)
        elif len(newly_flagged) < budget:
            _flag(world, s, f"Hub {hub.name} closed", EventSeverity.HIGH, now, ShipmentStatus.MISPLACED)
            newly_flagged.append(s.id)

    message = f"{hub.name} closed. Re-planning {len(newly_flagged)} packages..."
    log.info("chaos hub closure", extra={"entity_id": hub.id, "impacted": len(newly_flagged)})
    return {"scenario": ChaosScenarioType.HUB_CLOSURE.value, "closed_hub": hub.id,
            "newly_flagged": newly_flagged, "message": message}


def reopen_hub(world: World, hub_id: Optional[str] = None) -> Dict:
    """Reopen a closed hub; DISRUPTED destination shipments become recoverable
    (MISPLACED with a fresh pickup hub) so the pipeline can route them again.
    Without an explicit hub_id, reopens the closed hub with the most disrupted
    shipments awaiting reroute (or any closed hub)."""
    now = utcnow()
    if hub_id:
        hub = world.hubs.get(hub_id)
        if hub is None:
            raise KeyError(f"unknown hub {hub_id}")
    else:
        closed = [h for h in world.hubs.values() if h.status == HubStatus.CLOSED]
        if not closed:
            raise ValueError("no closed hub to reopen")
        hub = max(
            closed,
            key=lambda h: sum(
                1 for s in world.shipments.values()
                if s.destination_hub_id == h.id and s.status == ShipmentStatus.DISRUPTED
            ),
        )
    if hub.status != HubStatus.CLOSED:
        raise ValueError(f"hub {hub.id} is not closed")
    hub.status = HubStatus.ACTIVE
    revived: List[str] = []
    for s in world.shipments.values():
        if s.status == ShipmentStatus.DISRUPTED and s.destination_hub_id == hub.id:
            pickup = nearest_active_hub(world, s.current_location.lat, s.current_location.lng)
            s.recovery_pickup_hub_id = pickup.id if pickup else None
            s.set_status(ShipmentStatus.MISPLACED)
            world.add_event(RecoveryEvent(
                id=f"E-{s.id}-REOPEN-{int(now.timestamp() * 1000)}-{len(world.events)}",
                shipment_id=s.id, detected_at=now,
                detection_reason=f"Hub {hub.name} reopened - rerouting",
                severity=EventSeverity.MEDIUM))
            revived.append(s.id)
    message = f"{hub.name} reopened. {len(revived)} packages re-routed."
    log.info("chaos hub reopen", extra={"entity_id": hub.id, "revived": len(revived)})
    return {"scenario": "HUB_REOPEN", "hub_id": hub.id, "revived": revived, "message": message}


# CHUNK2

def fail_vehicle(world: World, vehicle_id: Optional[str] = None) -> Dict:
    """Vehicle failure: its in-transit shipments become MISPLACED, its active
    assignments are CANCELLED, and its capacity load is zeroed (it is not moving)."""
    now = utcnow()
    if vehicle_id:
        v = world.vehicles.get(vehicle_id)
        if v is None:
            raise KeyError(f"unknown vehicle {vehicle_id}")
    else:
        # a carrier can be IN_TRANSIT or AT_HUB (dwell) while hauling;
        # what matters is whether it holds an active assignment
        busy = [
            x for x in world.vehicles.values()
            if x.status != VehicleStatus.COMPLETED
            and any(
                a.vehicle_id == x.id and a.status == AssignmentStatus.IN_TRANSIT
                for a in world.assignments.values()
            )
        ]
        if not busy:
            raise ValueError("no busy vehicle available to fail")
        v = max(busy, key=lambda x: sum(
            1 for a in world.assignments.values()
            if a.vehicle_id == x.id and a.status == AssignmentStatus.IN_TRANSIT))
    v.status = VehicleStatus.COMPLETED
    affected: List[str] = []
    for a in world.assignments.values():
        if a.vehicle_id != v.id or a.status not in (AssignmentStatus.PENDING, AssignmentStatus.IN_TRANSIT):
            continue
        if not a.is_recovery_leg:
            a.set_status(AssignmentStatus.CANCELLED)
        s = world.shipments.get(a.shipment_id)
        if s is None or s.status not in (ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_HUB, ShipmentStatus.DELAYED):
            continue
        if not a.is_recovery_leg and len(affected) < config.MAX_CONCURRENT_MISPLACED:
            _flag(world, s, f"Vehicle {v.id} failed in transit", EventSeverity.HIGH, now, ShipmentStatus.MISPLACED)
            affected.append(s.id)
    message = f"Vehicle {v.id} failed. {len(affected)} shipments impacted. Re-optimizing..."
    log.info("chaos vehicle failure", extra={"entity_id": v.id, "impacted": len(affected)})
    return {"scenario": ChaosScenarioType.VEHICLE_FAILURE.value, "vehicle_id": v.id,
            "newly_flagged": affected, "message": message}


def reduce_capacity(world: World, vehicle_id: Optional[str] = None, factor: float = 0.5) -> Dict:
    """Capacity reduction: shrink a vehicle's usable capacity; overbooked load
    (the overload portion) is offloaded and those shipments re-flagged."""
    now = utcnow()
    if vehicle_id:
        v = world.vehicles.get(vehicle_id)
        if v is None:
            raise KeyError(f"unknown vehicle {vehicle_id}")
    else:
        candidates = [x for x in world.vehicles.values()
                      if x.status != VehicleStatus.COMPLETED and x.used_capacity_kg > 0]
        if not candidates:
            raise ValueError("no loaded vehicle available")
        v = max(candidates, key=lambda x: x.used_capacity_kg)
    factor = min(max(factor, 0.1), 0.9)
    old_total = v.total_capacity_kg
    v.total_capacity_kg = round(old_total * factor, 1)
    affected: List[str] = []
    if v.used_capacity_kg > v.total_capacity_kg:
        overload = v.used_capacity_kg - v.total_capacity_kg
        # offload in insertion order until within the new capacity
        for a in world.assignments.values():
            if len(affected) >= config.MAX_CONCURRENT_MISPLACED:
                break
            if a.vehicle_id != v.id or a.status not in (AssignmentStatus.PENDING, AssignmentStatus.IN_TRANSIT):
                continue
            if a.is_recovery_leg:
                continue
            s = world.shipments.get(a.shipment_id)
            if s is None or s.status not in (ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_HUB, ShipmentStatus.DELAYED):
                continue
            if overload <= 0:
                break
            a.set_status(AssignmentStatus.CANCELLED)
            s.assigned_vehicle_id = None
            _flag(world, s, f"Vehicle {v.id} capacity reduced to {v.total_capacity_kg:.0f}kg - shipment offloaded",
                  EventSeverity.MEDIUM, now, ShipmentStatus.MISPLACED)
            affected.append(s.id)
            v.used_capacity_kg = max(0.0, v.used_capacity_kg - s.weight_kg)
            overload -= s.weight_kg
    message = f"Vehicle {v.id} capacity cut {old_total:.0f}kg -> {v.total_capacity_kg:.0f}kg. {len(affected)} shipments offloaded."
    log.info("chaos capacity reduction", extra={"entity_id": v.id, "impacted": len(affected)})
    return {"scenario": ChaosScenarioType.CAPACITY_REDUCTION.value, "vehicle_id": v.id,
            "newly_flagged": affected, "message": message}


# CHUNK3

def disrupt_route(world: World, vehicle_id: Optional[str] = None) -> Dict:
    """Route disruption: nudge the carrying shipments' positions far off-route
    (real mechanics) so Layer-1 deviation detection fires on the next tick."""
    now = utcnow()
    if vehicle_id:
        v = world.vehicles.get(vehicle_id)
        if v is None:
            raise KeyError(f"unknown vehicle {vehicle_id}")
    else:
        moving = [x for x in world.vehicles.values() if x.status != VehicleStatus.COMPLETED]
        if not moving:
            raise ValueError("no in-transit vehicle to disrupt")
        v = moving[0]
    affected: List[str] = []
    off_km = config.ROUTE_DEVIATION_KM * 2.0
    for a in world.assignments.values():
        if a.vehicle_id != v.id or a.status != AssignmentStatus.IN_TRANSIT or a.is_recovery_leg:
            continue
        s = world.shipments.get(a.shipment_id)
        if s is None or s.status != ShipmentStatus.IN_TRANSIT:
            continue
        if len(affected) >= config.MAX_CONCURRENT_MISPLACED:
            break
        s.current_location = GeoPoint(lat=s.current_location.lat + off_km / 110.574,
                                      lng=s.current_location.lng)
        affected.append(s.id)
    message = f"Route disruption on {v.id}. {len(affected)} shipments diverted. Detection will flag them next tick."
    log.info("chaos route disruption", extra={"entity_id": v.id, "impacted": len(affected)})
    return {"scenario": ChaosScenarioType.ROUTE_DISRUPTION.value, "vehicle_id": v.id,
            "newly_flagged": affected, "message": message}


def delay_shipment(world: World, shipment_id: Optional[str] = None, extra_hours: float = 6.0) -> Dict:
    """Shipment delay: push last scan into the past and rewind the deadline,
    then mark DELAYED; stale-scan detection flags it MISPLACED next tick if the
    delay exceeds the stale threshold."""
    now = utcnow()
    if shipment_id:
        s = world.shipments.get(shipment_id)
        if s is None:
            raise KeyError(f"unknown shipment {shipment_id}")
    else:
        moving = [x for x in world.shipments.values() if x.status == ShipmentStatus.IN_TRANSIT]
        if not moving:
            raise ValueError("no in-transit shipment to delay")
        s = moving[0]
    s.set_status(ShipmentStatus.DELAYED)
    s.last_scan_event_at = now - timedelta(hours=config.STALE_SCAN_HOURS + max(extra_hours, 0.5))
    s.deadline = s.deadline + timedelta(hours=max(0.0, extra_hours - 2))
    message = f"Shipment {s.id} delayed by ~{extra_hours:.0f}h; monitoring for escalation."
    log.info("chaos shipment delay", extra={"entity_id": s.id})
    return {"scenario": ChaosScenarioType.SHIPMENT_DELAY.value, "shipment_id": s.id,
            "newly_flagged": [s.id], "message": message}


def destination_unavailable(world: World, hub_id: Optional[str] = None) -> Dict:
    """Destination disruption WITHOUT closing the whole hub for routing:
    only inbound deliveries to that hub are disrupted (DISRUPTED, never
    DELIVERED) while the hub itself remains usable as a transfer point."""
    now = utcnow()
    if hub_id:
        hub = world.hubs.get(hub_id)
        if hub is None:
            raise KeyError(f"unknown hub {hub_id}")
    else:
        actives = [h for h in world.hubs.values() if h.status == HubStatus.ACTIVE]
        if not actives:
            raise ValueError("no active hub")
        hub = max(actives, key=lambda h: sum(
            1 for s in world.shipments.values()
            if s.destination_hub_id == h.id and s.status == ShipmentStatus.IN_TRANSIT))
    affected: List[str] = []
    for s in world.shipments.values():
        if s.destination_hub_id != hub.id or s.status not in (ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_HUB, ShipmentStatus.DELAYED):
            continue
        if len(affected) >= config.MAX_CONCURRENT_MISPLACED:
            break
        _flag(world, s, f"Destination hub {hub.name} unavailable", EventSeverity.HIGH, now, ShipmentStatus.DISRUPTED)
        affected.append(s.id)
    message = f"{hub.name} can't receive packages right now. Re-planning {len(affected)} packages..."
    log.info("chaos destination unavailable", extra={"entity_id": hub.id, "impacted": len(affected)})
    return {"scenario": ChaosScenarioType.DESTINATION_UNAVAILABLE.value, "hub_id": hub.id,
            "newly_flagged": affected, "message": message}


SCENARIOS = {
    "close-hub": close_hub,
    "reopen-hub": reopen_hub,
    "fail-vehicle": fail_vehicle,
    "reduce-capacity": reduce_capacity,
    "disrupt-route": disrupt_route,
    "delay-shipment": delay_shipment,
    "destination-unavailable": destination_unavailable,
}
