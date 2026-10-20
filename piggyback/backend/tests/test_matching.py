"""Layer 3 matching boundary cases (spec §4 L3)."""
from __future__ import annotations

from datetime import timedelta

from app.geo import haversine_km
from app.matching import match_shipment, match_direct, match_multihop
from app.models import ShipmentStatus
from app.search import SearchCandidate, search_available_vehicles
from tests.conftest import mk_shipment, mk_vehicle


def _wire_route(world, vehicle):
    rid = f"R-{vehicle.id}"
    legs = []
    seq = vehicle.route_hub_sequence
    for i in range(len(seq) - 1):
        a, b = world.hubs[seq[i]], world.hubs[seq[i + 1]]
        legs.append(
            __import__("app.models", fromlist=["RouteLeg"]).RouteLeg(
                from_hub_id=seq[i], to_hub_id=seq[i + 1],
                distance_km=haversine_km(a.lat, a.lng, b.lat, b.lng),
            )
        )
    from app.models import Route
    world.routes[rid] = Route(id=rid, hub_sequence=list(seq), legs=legs)
    return rid


# ---------------------------------------------------------------- direct cases

def test_capacity_exactly_at_limit_passes(world, now):
    """spare == weight passes (>= not >)."""
    v = mk_vehicle("V1", ["H1", "H2"], capacity=100.0, used=40.0)  # spare 60 == weight
    world.vehicles[v.id] = v
    _wire_route(world, v)
    s = mk_shipment("S1", "H1", "H2", weight=60.0, deadline_h=10, world_hubs=world.hubs)
    s.recovery_pickup_hub_id = "H1"
    cands = [SearchCandidate(v, v.spare_kg)]
    out = match_shipment(world, s, cands, now)
    assert any(m.vehicle_ids == ["V1"] for m in out)


def test_capacity_1kg_over_fails(world, now):
    v = mk_vehicle("V1", ["H1", "H2"], capacity=100.0, used=41.0)  # spare 59 < 60
    world.vehicles[v.id] = v
    _wire_route(world, v)
    s = mk_shipment("S1", "H1", "H2", weight=60.0, deadline_h=10, world_hubs=world.hubs)
    s.recovery_pickup_hub_id = "H1"
    cands = [SearchCandidate(v, v.spare_kg)]
    out = match_shipment(world, s, cands, now)
    assert out == []


def test_route_order_reversed_fails(world, now):
    """Vehicle runs H2->H1 only; pickup H1 -> dest H2 is backwards."""
    v = mk_vehicle("V1", ["H2", "H1"], capacity=1000.0)
    world.vehicles[v.id] = v
    _wire_route(world, v)
    s = mk_shipment("S1", "H1", "H2", weight=50.0, deadline_h=10, world_hubs=world.hubs)
    s.recovery_pickup_hub_id = "H1"
    cands = [SearchCandidate(v, v.spare_kg)]
    out = match_shipment(world, s, cands, now)
    assert out == []


def test_deadline_exactly_at_buffer_edge_passes(world, now):
    """ETA == deadline exactly -> pass (<=)."""
    v = mk_vehicle("V1", ["H1", "H2"], capacity=1000.0, speed=60.0)
    world.vehicles[v.id] = v
    _wire_route(world, v)
    s = mk_shipment("S1", "H1", "H2", weight=10.0, deadline_h=0, world_hubs=world.hubs)
    leg_km = haversine_km(0, 0, 0, 1)
    eta_h = leg_km / 60.0
    s.deadline = now + timedelta(hours=eta_h)  # exactly the arrival time
    s.recovery_pickup_hub_id = "H1"
    cands = [SearchCandidate(v, v.spare_kg)]
    out = match_shipment(world, s, cands, now)
    assert len(out) == 1


def test_deadline_1min_past_buffer_fails(world, now):
    v = mk_vehicle("V1", ["H1", "H2"], capacity=1000.0, speed=60.0)
    world.vehicles[v.id] = v
    _wire_route(world, v)
    s = mk_shipment("S1", "H1", "H2", weight=10.0, deadline_h=0, world_hubs=world.hubs)
    leg_km = haversine_km(0, 0, 0, 1)
    eta_h = leg_km / 60.0
    s.deadline = now + timedelta(hours=eta_h) - timedelta(minutes=1)  # 1 min too tight
    s.recovery_pickup_hub_id = "H1"
    cands = [SearchCandidate(v, v.spare_kg)]
    out = match_shipment(world, s, cands, now)
    assert out == []


# ---------------------------------------------------------------- multi-hop

def test_valid_multihop_transfer_passes(world, now):
    """A: H1->H2->H3, B: H3->H4. Transfer at H3 (ACTIVE)."""
    a = mk_vehicle("VA", ["H1", "H2", "H3"], capacity=1000.0)
    b = mk_vehicle("VB", ["H3", "H4"], capacity=1000.0)
    world.vehicles[a.id] = a
    world.vehicles[b.id] = b
    _wire_route(world, a)
    _wire_route(world, b)
    s = mk_shipment("S1", "H1", "H4", weight=50.0, deadline_h=10, world_hubs=world.hubs)
    s.recovery_pickup_hub_id = "H1"
    cands = [SearchCandidate(a, a.spare_kg), SearchCandidate(b, b.spare_kg)]
    out = match_multihop(world, s, cands, now)
    assert any(m.vehicle_ids == ["VA", "VB"] and m.transfer_hub_ids == ["H3"] for m in out)


def test_multihop_through_closed_hub_fails(world, now):
    from app.models import HubStatus
    world.hubs["H3"].status = HubStatus.CLOSED
    a = mk_vehicle("VA", ["H1", "H2", "H3"], capacity=1000.0)
    b = mk_vehicle("VB", ["H3", "H4"], capacity=1000.0)
    world.vehicles[a.id] = a
    world.vehicles[b.id] = b
    _wire_route(world, a)
    _wire_route(world, b)
    s = mk_shipment("S1", "H1", "H4", weight=50.0, deadline_h=10, world_hubs=world.hubs)
    s.recovery_pickup_hub_id = "H1"
    cands = [SearchCandidate(a, a.spare_kg), SearchCandidate(b, b.spare_kg)]
    out = match_multihop(world, s, cands, now)
    assert out == []


def test_multihop_second_vehicle_over_capacity_fails(world, now):
    a = mk_vehicle("VA", ["H1", "H2", "H3"], capacity=1000.0)
    b = mk_vehicle("VB", ["H3", "H4"], capacity=60.0, used=20.0)  # spare 40 < 50
    world.vehicles[a.id] = a
    world.vehicles[b.id] = b
    _wire_route(world, a)
    _wire_route(world, b)
    s = mk_shipment("S1", "H1", "H4", weight=50.0, deadline_h=10, world_hubs=world.hubs)
    s.recovery_pickup_hub_id = "H1"
    cands = [SearchCandidate(a, a.spare_kg), SearchCandidate(b, b.spare_kg)]
    out = match_multihop(world, s, cands, now)
    assert out == []


# ---------------------------------------------------------------- search

def test_search_excludes_closed_hub_routes(world):
    from app.models import HubStatus
    v_ok = mk_vehicle("VOK", ["H1", "H2"], capacity=1000.0)
    v_closed = mk_vehicle("VCL", ["H2", "H3"], capacity=1000.0)
    world.vehicles[v_ok.id] = v_ok
    world.vehicles[v_closed.id] = v_closed
    world.hubs["H3"].status = HubStatus.CLOSED
    out = search_available_vehicles(world)
    ids = {c.vehicle.id for c in out}
    assert "VOK" in ids and "VCL" not in ids


def test_search_excludes_zero_spare(world):
    v = mk_vehicle("VF", ["H1", "H2"], capacity=100.0, used=100.0)
    world.vehicles[v.id] = v
    out = search_available_vehicles(world)
    assert all(c.vehicle.id != "VF" for c in out)
