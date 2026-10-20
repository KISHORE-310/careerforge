"""Layer 1 — Detect (spec §4 L1).

Rule-based detection over IN_TRANSIT shipments. Individually testable:
run_detection(world, now) flags misplaced shipments and logs RecoveryEvents.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import List, Optional, Tuple

from . import config
from .geo import haversine_km, min_distance_to_polyline_km
from .models import (
    EventSeverity,
    RecoveryEvent,
    Shipment,
    ShipmentStatus,
    utcnow,
)
from .state import World


# CHUNK2

def nearest_active_hub(world: World, lat: float, lng: float) -> Optional[object]:
    """Nearest ACTIVE hub to a point (recovery pickup location)."""
    best = None
    best_d = float("inf")
    for hub in world.hubs.values():
        if hub.status.value != "ACTIVE":
            continue
        d = haversine_km(lat, lng, hub.lat, hub.lng)
        if d < best_d:
            best, best_d = hub, d
    return best


def _route_polyline(world: World, shipment: Shipment) -> List[Tuple[float, float]]:
    route = world.routes.get(shipment.planned_route_id)
    if not route:
        return []
    return [
        (world.hubs[h].lat, world.hubs[h].lng)
        for h in route.hub_sequence
        if h in world.hubs
    ]


# CHUNK3

def check_stale_scan(shipment: Shipment, now: datetime) -> Optional[Tuple[str, EventSeverity]]:
    age_h = (now - shipment.last_scan_event_at).total_seconds() / 3600.0
    if age_h > config.STALE_SCAN_HOURS:
        return (
            f"Stale scan: last scan {age_h:.1f}h ago (threshold {config.STALE_SCAN_HOURS:g}h)",
            EventSeverity.MEDIUM,
        )
    return None


def check_route_deviation(world: World, shipment: Shipment) -> Optional[Tuple[str, EventSeverity]]:
    coords = _route_polyline(world, shipment)
    if not coords:
        return None
    dist = min_distance_to_polyline_km(
        shipment.current_location.lat, shipment.current_location.lng, coords
    )
    if dist > config.ROUTE_DEVIATION_KM:
        return (
            f"Route deviation: {dist:.1f}km from planned route (threshold {config.ROUTE_DEVIATION_KM:g}km)",
            EventSeverity.HIGH,
        )
    return None


# CHUNK4

def check_missed_connection(world: World, shipment: Shipment, now: datetime) -> Optional[Tuple[str, EventSeverity]]:
    """Vehicle completed a leg but the shipment was never scanned at the next hub."""
    asg = next(
        (a for a in world.assignments.values() if a.shipment_id == shipment.id),
        None,
    )
    if asg is None or asg.status.value == "COMPLETED":
        return None
    vehicle = world.vehicles.get(asg.vehicle_id)
    if vehicle is None or vehicle.status.value != "COMPLETED":
        return None
    if asg.status.value == "MISSED":
        return None
    if now > asg.scheduled_arrival + timedelta(hours=config.MISSED_CONNECTION_BUFFER_HOURS):
        reason = (
            f"Missed connection: vehicle {vehicle.id} completed leg "
            f"{asg.from_hub_id}->{asg.to_hub_id} but shipment not scanned at {asg.to_hub_id}"
        )
        return (reason, EventSeverity.HIGH)
    return None


# CHUNK5

def _plain_reason(world: World, shipment: Shipment, reason: str) -> str:
    """Plain-English companion to the technical reason (PS §25):
    'This package went 63 km off its route. That's more than the 50 km limit.'"""
    try:
        if reason.startswith("Route deviation"):
            km = float(reason.split(":")[1].split("km")[0].strip())
            here = nearest_active_hub(world, shipment.current_location.lat, shipment.current_location.lng)
            where = f" It's now near {here.name}." if here else ""
            return (f"This package went {km:.0f} km off its route. "
                    f"That's more than the {config.ROUTE_DEVIATION_KM:g} km limit.{where}")
        if reason.startswith("Stale scan"):
            hours = float(reason.split("scan ")[1].split("h")[0])
            return (f"No one has scanned this package for {hours:.1f} hours. "
                    f"We normally hear about it every {config.STALE_SCAN_HOURS:g} hours.")
        if reason.startswith("Missed connection"):
            return ("The vehicle carrying this package finished its run without "
                    "handing it over at the next stop.")
    except Exception:
        pass
    return reason


def flag_misplaced(world: World, shipment: Shipment, reason: str, severity: EventSeverity, now: datetime) -> RecoveryEvent:
    """Mark a shipment MISPLACED (validated transition), choose a pickup hub,
    and log the audit event (technical + plain-English reasons)."""
    shipment.set_status(ShipmentStatus.MISPLACED)
    pickup = nearest_active_hub(world, shipment.current_location.lat, shipment.current_location.lng)
    shipment.recovery_pickup_hub_id = pickup.id if pickup else None
    event = RecoveryEvent(
        id=f"E-{shipment.id}-{int(now.timestamp() * 1000)}-{len(world.events)}",
        shipment_id=shipment.id,
        detected_at=now,
        detection_reason=reason,
        severity=severity,
        plain_reason=_plain_reason(world, shipment, reason),
    )
    world.add_event(event)
    return event


def run_detection(world: World, now: Optional[datetime] = None) -> List[RecoveryEvent]:
    """Run all three rules over IN_TRANSIT shipments; flag and log as needed."""
    now = now or utcnow()
    flagged: List[RecoveryEvent] = []
    for shipment in list(world.shipments.values()):
        if shipment.status not in (ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_HUB, ShipmentStatus.DELAYED):
            continue
        hit = check_stale_scan(shipment, now)
        if hit is None:
            hit = check_route_deviation(world, shipment)
        if hit is None:
            hit = check_missed_connection(world, shipment, now)
        if hit is not None:
            reason, severity = hit
            flagged.append(flag_misplaced(world, shipment, reason, severity, now))
    return flagged
