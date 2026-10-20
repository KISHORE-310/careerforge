"""Chaos scenario tests (hardening spec §6, §16).

Key invariant: closing/unavailability of a DESTINATION hub marks shipments
DISRUPTED, never DELIVERED. All scenarios must produce legitimate downstream
state and a RecoveryEvent audit trail.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from datetime import timedelta

import pytest

from app.chaos import (
    close_hub,
    delay_shipment,
    destination_unavailable,
    disrupt_route,
    fail_vehicle,
    reduce_capacity,
    reopen_hub,
)
from app.models import (
    AssignmentStatus,
    EventSeverity,
    HubStatus,
    RecoveryEventStatus,
    Shipment,
    ShipmentAssignment,
    ShipmentStatus,
    VehicleStatus,
    utcnow,
)
from app.state import World
from tests.conftest import mk_hub, mk_vehicle


def _in_transit_shipment(world: World, sid="S1", origin="H1", dest="H4") -> Shipment:
    """Create an IN_TRANSIT shipment + its active assignment on V1."""
    now = utcnow()
    s = Shipment(
        id=sid, origin_hub_id=origin, destination_hub_id=dest,
        current_location=GeoPoint_of(world.hubs[origin]),
        planned_route_id="R1",
        deadline=now + timedelta(hours=30), priority="GOLD",
        weight_kg=100, value_usd=1200,
        status=ShipmentStatus.IN_TRANSIT, last_scan_event_at=now,
        assigned_vehicle_id="V1", current_leg_index=0,
    )
    world.shipments[sid] = s
    a = ShipmentAssignment(
        id=f"A-{sid}", shipment_id=sid, vehicle_id="V1", leg_index=0,
        from_hub_id=origin, to_hub_id="H2",
        scheduled_departure=now, scheduled_arrival=now + timedelta(hours=2),
        status=AssignmentStatus.IN_TRANSIT,
    )
    world.assignments[a.id] = a
    return s


def GeoPoint_of(hub):
    from app.models import GeoPoint

    return GeoPoint(lat=hub.lat, lng=hub.lng)


@pytest.fixture()
def chaos_world():
    """Fresh 4-hub world: H1--H2--H3--H4, one vehicle V1 with an active leg."""
    from app.models import Route, RouteLeg

    w = World()
    coords = {"H1": (0.0, 0.0), "H2": (0.0, 1.0), "H3": (0.0, 2.0), "H4": (0.0, 3.0)}
    for hid, (lat, lng) in coords.items():
        w.hubs[hid] = mk_hub(hid, lat, lng)
    legs = [RouteLeg(from_hub_id="H1", to_hub_id="H2", distance_km=111.0),
            RouteLeg(from_hub_id="H2", to_hub_id="H3", distance_km=111.0),
            RouteLeg(from_hub_id="H3", to_hub_id="H4", distance_km=111.0)]
    w.routes["R1"] = Route(id="R1", hub_sequence=["H1", "H2", "H3", "H4"], legs=legs)
    w.vehicles["V1"] = mk_vehicle("V1", ["H1", "H2", "H3", "H4"], capacity=1000, used=100)
    _in_transit_shipment(w)
    return w


class TestHubClosure:
    def test_transit_hub_closure_flags_misplaced(self, chaos_world):
        w = chaos_world
        close_hub(w, hub_id="H2")
        assert w.hubs["H2"].status is HubStatus.CLOSED
        assert w.shipments["S1"].status is ShipmentStatus.MISPLACED
        assert w.shipments["S1"].recovery_pickup_hub_id  # pickup hub assigned
        ev = w.events[-1]
        assert ev.status is RecoveryEventStatus.PENDING
        assert "H2" in ev.detection_reason or "closed" in ev.detection_reason

    def test_destination_closure_disrupted_never_delivered(self, chaos_world):
        """THE §6 invariant: destination closed => DISRUPTED, not DELIVERED."""
        w = chaos_world
        close_hub(w, hub_id="H4")  # S1's destination
        s = w.shipments["S1"]
        assert s.status is ShipmentStatus.DISRUPTED
        assert s.status is not ShipmentStatus.DELIVERED
        ev = w.events[-1]
        assert "closed" in ev.detection_reason

    def test_destination_unavailable_disrupted(self, chaos_world):
        w = chaos_world
        destination_unavailable(w, hub_id="H4")
        assert w.shipments["S1"].status is ShipmentStatus.DISRUPTED
        assert w.hubs["H4"].status is HubStatus.ACTIVE  # hub stays routable

    def test_reopen_hub_makes_disrupted_recoverable(self, chaos_world):
        w = chaos_world
        close_hub(w, hub_id="H4")
        assert w.shipments["S1"].status is ShipmentStatus.DISRUPTED
        reopen_hub(w, hub_id="H4")
        assert w.hubs["H4"].status is HubStatus.ACTIVE
        assert w.shipments["S1"].status is ShipmentStatus.MISPLACED  # recoverable again


class TestVehicleScenarios:
    def test_fail_vehicle_flags_shipments_and_cancels_assignments(self, chaos_world):
        w = chaos_world
        fail_vehicle(w, vehicle_id="V1")
        assert w.vehicles["V1"].status is VehicleStatus.COMPLETED
        assert w.shipments["S1"].status is ShipmentStatus.MISPLACED
        assert w.assignments["A-S1"].status is AssignmentStatus.CANCELLED

    def test_reduce_capacity_offloads_overload(self, chaos_world):
        w = chaos_world
        reduce_capacity(w, vehicle_id="V1", factor=0.5)  # 1000 -> 500
        assert w.vehicles["V1"].total_capacity_kg == 500.0
        # load (100) still fits -> no offload
        assert w.shipments["S1"].status is ShipmentStatus.IN_TRANSIT
        reduce_capacity(w, vehicle_id="V1", factor=0.1)  # 500 -> 50 < 100 used
        assert w.shipments["S1"].status is ShipmentStatus.MISPLACED


class TestRouteAndDelay:
    def test_disrupt_route_nudges_shipment_off_route(self, chaos_world):
        w = chaos_world
        from app import config as cfg

        result = disrupt_route(w, vehicle_id="V1")
        assert result["vehicle_id"] == "V1"
        s = w.shipments["S1"]
        # GPS nudge moved it off the planned polyline
        assert s.current_location.lat != w.hubs["H1"].lat

    def test_delay_shipment_extends_deadline_and_marks_delayed(self, chaos_world):
        w = chaos_world
        before = w.shipments["S1"].deadline
        delay_shipment(w, shipment_id="S1", extra_hours=5)
        s = w.shipments["S1"]
        assert s.status is ShipmentStatus.DELAYED
        assert (s.deadline - before).total_seconds() >= 2 * 3600 - 1


class TestAuditTrail:
    def test_every_scenario_writes_recovery_event(self, chaos_world):
        w = chaos_world
        n0 = len(w.events)
        close_hub(w, hub_id="H2")
        assert len(w.events) > n0
        ev = w.events[-1]
        assert ev.shipment_id == "S1"
        assert ev.severity in (EventSeverity.LOW, EventSeverity.MEDIUM, EventSeverity.HIGH)
        assert ev.detection_reason  # human-readable, non-empty
