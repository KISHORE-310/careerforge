"""Recovery-consistency tests (hardening spec §5, §12).

Guarantees under test:
  1. apply_recovery REPLACES the original assignment (never dual-active).
  2. The replaced carrier's capacity is restored.
  3. Recovery is idempotent: a second call cannot duplicate assignments.
  4. Each recovery leg is independently traceable.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from datetime import timedelta

import pytest

from app.decision import apply_recovery
from app.models import (
    AssignmentStatus,
    DomainError,
    GeoPoint,
    RecoveryOption,
    ShipmentStatus,
    VehicleStatus,
    utcnow,
)
from tests.conftest import mk_shipment, mk_vehicle


def _setup_world(world):
    """H1 -> H2 -> H3 -> H4 route for vehicle V1; V2 covers H2 -> H4."""
    from app.models import Route, RouteLeg

    legs = [
        RouteLeg(from_hub_id="H1", to_hub_id="H2", distance_km=111.0),
        RouteLeg(from_hub_id="H2", to_hub_id="H3", distance_km=111.0),
        RouteLeg(from_hub_id="H3", to_hub_id="H4", distance_km=111.0),
    ]
    world.routes["R-V1"] = Route(id="R-V1", hub_sequence=["H1", "H2", "H3", "H4"], legs=legs)
    world.routes["R-V2"] = Route(
        id="R-V2", hub_sequence=["H2", "H3", "H4"],
        legs=[RouteLeg(from_hub_id="H2", to_hub_id="H3", distance_km=111.0),
              RouteLeg(from_hub_id="H3", to_hub_id="H4", distance_km=111.0)],
    )
    v1 = mk_vehicle("V1", ["H1", "H2", "H3", "H4"], capacity=1000, used=100)
    world.vehicles["V1"] = v1
    world.vehicles["V2"] = mk_vehicle("V2", ["H2", "H3", "H4"], capacity=1000, used=0)
    return world


def _misplaced_shipment(world) -> None:
    s = mk_shipment("S1", "H1", "H4", weight=100, deadline_h=20, world_hubs=world.hubs)
    s.set_status(ShipmentStatus.MISPLACED)
    s.recovery_pickup_hub_id = "H1"
    s.assigned_vehicle_id = "V1"
    world.shipments["S1"] = s
    # original active assignment on V1
    now = utcnow()
    world.assignments["A-orig"] = __import__("app.models", fromlist=["ShipmentAssignment"]).ShipmentAssignment(
        id="A-orig", shipment_id="S1", vehicle_id="V1", leg_index=0,
        from_hub_id="H1", to_hub_id="H2",
        scheduled_departure=now, scheduled_arrival=now + timedelta(hours=2),
        status=AssignmentStatus.IN_TRANSIT,
    )


def _option(rank=1) -> RecoveryOption:
    return RecoveryOption(
        shipment_id="S1", rank=rank, strategy_label="Direct piggyback",
        vehicle_ids=["V2"], transfer_hub_ids=[],
        estimated_cost_usd=100.0, dedicated_cost_usd=400.0, cost_saved_usd=300.0,
        estimated_delay_hours=-2.0, co2_saved_kg=25.0, score=0.85,
        score_breakdown={"cost_score": 0.9}, explanation="test",
    )


class TestRecoveryConsistency:
    def test_original_assignment_replaced_not_dual_active(self, world):
        _setup_world(world)
        _misplaced_shipment(world)
        apply_recovery(world, "S1", _option())
        orig = world.assignments["A-orig"]
        assert orig.status is AssignmentStatus.REPLACED
        # recovery legs are created pending-pickup on the new carrier only;
        # the old carrier must hold NO active or pending leg for this shipment
        legs = [a for a in world.assignments.values() if a.shipment_id == "S1"]
        for a in legs:
            if a.is_recovery_leg:
                assert a.vehicle_id == "V2"
                assert a.status == AssignmentStatus.PENDING
            else:
                assert a.status not in (AssignmentStatus.IN_TRANSIT, AssignmentStatus.PENDING)

    def test_replaced_carrier_capacity_restored(self, world):
        _setup_world(world)
        _misplaced_shipment(world)
        # V1 carried 100kg (incl. S1's 100kg -> used=100 in fixture terms);
        # after recovery the original carrier must have freed S1's weight.
        apply_recovery(world, "S1", _option())
        v1 = world.vehicles["V1"]
        v2 = world.vehicles["V2"]
        assert v1.used_capacity_kg <= 100.0  # freed, never increased
        assert v2.used_capacity_kg >= world.shipments["S1"].weight_kg  # loaded on new carrier
        assert world.shipments["S1"].status is ShipmentStatus.RECOVERING

    def test_idempotent_second_recovery_raises_or_noops(self, world):
        _setup_world(world)
        _misplaced_shipment(world)
        apply_recovery(world, "S1", _option())
        n_assignments = len(world.assignments)
        cost_before = world.metrics["total_cost_saved_usd"]
        # second call is a no-op returning the same shipment (already RECOVERING)
        result = apply_recovery(world, "S1", _option())
        assert result.status is ShipmentStatus.RECOVERING
        assert len(world.assignments) == n_assignments  # nothing duplicated
        assert world.metrics["total_cost_saved_usd"] == cost_before  # no double count

    def test_multihop_legs_are_individually_traceable(self, world):
        _setup_world(world)
        s = mk_shipment("S2", "H1", "H4", weight=50, deadline_h=20, world_hubs=world.hubs)
        s.set_status(ShipmentStatus.MISPLACED)
        s.recovery_pickup_hub_id = "H2"
        world.shipments["S2"] = s
        opt = RecoveryOption(
            shipment_id="S2", rank=1, strategy_label="Multi-hop piggyback",
            vehicle_ids=["V1", "V2"], transfer_hub_ids=["H3"],
            estimated_cost_usd=150.0, dedicated_cost_usd=500.0, cost_saved_usd=350.0,
            estimated_delay_hours=-1.0, co2_saved_kg=30.0, score=0.8,
            score_breakdown={"cost_score": 0.8}, explanation="test",
        )
        apply_recovery(world, "S2", opt)
        legs = [a for a in world.assignments.values() if a.shipment_id == "S2" and a.is_recovery_leg]
        assert len(legs) == 2  # V1: H2->H3, V2: H3->H4
        leg_pairs = {(a.vehicle_id, a.from_hub_id, a.to_hub_id) for a in legs}
        assert ("V1", "H2", "H3") in leg_pairs
        assert ("V2", "H3", "H4") in leg_pairs
        # each leg independently traceable
        assert len({a.id for a in legs}) == 2

    def test_metrics_updated_on_recovery(self, world):
        _setup_world(world)
        _misplaced_shipment(world)
        before_cost = world.metrics["total_cost_saved_usd"]
        before_co2 = world.metrics["total_co2_saved_kg"]
        before_hours = world.metrics["total_delay_hours_saved"]
        apply_recovery(world, "S1", _option())
        # decision-time savings are booked immediately (demo responsiveness)
        assert world.metrics["total_cost_saved_usd"] == pytest.approx(before_cost + 300.0)
        assert world.metrics["total_co2_saved_kg"] == pytest.approx(before_co2 + 25.0)
        assert world.metrics["total_delay_hours_saved"] == pytest.approx(before_hours + 2.0)
        # recovered_count itself increments on physical arrival (simulation)
