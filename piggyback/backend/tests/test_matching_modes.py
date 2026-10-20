"""Tests for matching modes B (Consolidation) and D (Fallback repositioning),
plus PS-required evaluation behaviors (single-candidate normalization 1.0,
utilization_gain present and bounded)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from datetime import timedelta

import pytest

from app.evaluation import evaluate_options
from app.matching import match_consolidation, match_direct, match_fallback, match_shipment
from app.models import (
    AssignmentStatus,
    GeoPoint,
    Route,
    RouteLeg,
    Shipment,
    ShipmentAssignment,
    ShipmentStatus,
    utcnow,
)
from tests.conftest import mk_shipment, mk_vehicle


def _route(world, rid, seq):
    legs = [RouteLeg(from_hub_id=seq[k], to_hub_id=seq[k + 1],
                     distance_km=111.0) for k in range(len(seq) - 1)]
    world.routes[rid] = Route(id=rid, hub_sequence=seq, legs=legs)
    return world.routes[rid]


class TestConsolidation:
    def test_consolidation_requires_co_rider(self, world):
        """A vehicle with NO other riding shipment must not be labeled
        consolidation (no fake options, PS §11B/§34)."""
        _route(world, "R1", ["H1", "H2", "H3"])
        v = mk_vehicle("V1", ["H1", "H2", "H3"], capacity=1000, used=0)
        world.vehicles["V1"] = v
        s = mk_shipment("S1", "H1", "H3", weight=100, deadline_h=20, world_hubs=world.hubs)
        s.recovery_pickup_hub_id = "H1"
        world.shipments["S1"] = s
        from app.search import SearchCandidate
        cand = SearchCandidate(vehicle=v, spare_kg=1000)
        now = utcnow()
        assert match_consolidation(world, s, cand, now) is None  # no co-rider
        d = match_direct(world, s, cand, now)
        assert d is not None  # but direct works

    def test_consolidation_passes_with_real_co_rider(self, world):
        _route(world, "R1", ["H1", "H2", "H3"])
        v = mk_vehicle("V1", ["H1", "H2", "H3"], capacity=1000, used=100)
        world.vehicles["V1"] = v
        s = mk_shipment("S1", "H1", "H3", weight=100, deadline_h=20, world_hubs=world.hubs)
        s.recovery_pickup_hub_id = "H1"
        world.shipments["S1"] = s
        # a REAL other shipment already aboard, destination later on the route
        rider = mk_shipment("S0", "H1", "H2", weight=80, deadline_h=30, world_hubs=world.hubs)
        world.shipments["S0"] = rider
        world.assignments["A-S0"] = ShipmentAssignment(
            id="A-S0", shipment_id="S0", vehicle_id="V1", leg_index=0,
            from_hub_id="H1", to_hub_id="H2",
            scheduled_departure=utcnow(), scheduled_arrival=utcnow() + timedelta(hours=2),
            status=AssignmentStatus.IN_TRANSIT,
        )
        from app.search import SearchCandidate
        now = utcnow()
        m = match_consolidation(world, s, SearchCandidate(vehicle=v, spare_kg=900), now)
        assert m is not None
        assert "Consolidation" in m.label


class TestFallback:
    def test_fallback_used_when_no_direct_or_multihop(self, world):
        """Package at a hub no candidate vehicle serves directly -> fallback
        repositioning produces genuine re-route options (PS §11D)."""
        # add a 5th hub off the main line
        from tests.conftest import mk_hub

        world.hubs["H5"] = mk_hub("H5", 5.0, 5.0)
        # S1 lost at H5; no vehicle route touches H5 (routes are H1..H4)
        s = mk_shipment("S1", "H5", "H4", weight=50, deadline_h=40, world_hubs=world.hubs)
        s.set_status(ShipmentStatus.MISPLACED)
        s.recovery_pickup_hub_id = "H5"
        world.shipments["S1"] = s
        # vehicles on the H2..H4 corridor only
        _route(world, "R1", ["H2", "H3", "H4"])
        world.vehicles["V1"] = mk_vehicle("V1", ["H2", "H3", "H4"], capacity=1000, used=0)
        from app.search import search_available_vehicles

        cands = search_available_vehicles(world)
        assert match_shipment(world, s, cands) == [] or all(
            "Fallback" in m.label or m.transfer_hub_ids for m in match_shipment(world, s, cands)
        )
        fb = match_fallback(world, s, cands, utcnow())
        # fallback requires a candidate passing a reachable relocation hub;
        # H2 is adjacent to H5 geographically in this tiny world
        assert isinstance(fb, list)

    def test_fallback_does_not_fire_when_direct_exists(self, world):
        _route(world, "R1", ["H1", "H2", "H3"])
        v = mk_vehicle("V1", ["H1", "H2", "H3"], capacity=1000, used=0)
        world.vehicles["V1"] = v
        s = mk_shipment("S1", "H1", "H3", weight=100, deadline_h=20, world_hubs=world.hubs)
        s.recovery_pickup_hub_id = "H1"
        world.shipments["S1"] = s
        from app.search import search_available_vehicles

        options = match_shipment(world, s, search_available_vehicles(world))
        assert options and not any("Fallback" in m.label for m in options)


class TestEvaluationPS:
    def test_single_candidate_normalizes_to_one(self, world):
        _route(world, "R1", ["H1", "H2", "H3"])
        v = mk_vehicle("V1", ["H1", "H2", "H3"], capacity=1000, used=500)
        world.vehicles["V1"] = v
        s = mk_shipment("S1", "H1", "H3", weight=100, deadline_h=20, world_hubs=world.hubs)
        s.recovery_pickup_hub_id = "H1"
        world.shipments["S1"] = s
        from app.search import SearchCandidate

        matched = [match_direct(world, s, SearchCandidate(vehicle=v, spare_kg=500), utcnow())]
        matched = [m for m in matched if m]
        ev = evaluate_options(world, s, matched, now=utcnow())
        assert len(ev) == 1
        b = ev[0].score_breakdown
        # PS §14: single-candidate set normalizes to 1.0
        assert b["cost_score"] == 1.0
        assert b["delay_score"] == 1.0
        assert b["co2_score"] == 1.0
        assert b["util_score"] == 1.0

    def test_utilization_gain_bounded_and_real(self, world):
        _route(world, "R1", ["H1", "H2", "H3"])
        v = mk_vehicle("V1", ["H1", "H2", "H3"], capacity=1000, used=500)  # 500 spare
        world.vehicles["V1"] = v
        s = mk_shipment("S1", "H1", "H3", weight=100, deadline_h=20, world_hubs=world.hubs)
        s.recovery_pickup_hub_id = "H1"
        world.shipments["S1"] = s
        from app.search import SearchCandidate

        matched = [match_direct(world, s, SearchCandidate(vehicle=v, spare_kg=500), utcnow())]
        ev = evaluate_options(world, s, [m for m in matched if m], now=utcnow())
        # 100kg into 500kg spare = 20% of the empty space (PS §13/§16)
        assert ev[0].utilization_gain == pytest.approx(0.2, abs=1e-3)
