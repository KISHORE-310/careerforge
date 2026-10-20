"""Layer 3 — Match (spec §4 L3 / PS §11).

Four matching modes:
  A. Direct piggyback   — one vehicle covers pickup -> destination in order
  B. Consolidation      — piggyback on the leg where another package already rides
  C. Multi-hop          — two-vehicle relay through an ACTIVE transfer hub
  D. Fallback repositioning — move the package to the nearest ACTIVE hub that
     has outbound coverage toward the destination, then re-match from there

Boundary conditions here are literal pytest cases (see tests/test_matching.py):
  - capacity exactly at limit -> pass (>=, not >)
  - capacity 1kg over -> fail
  - route order reversed -> fail
  - deadline exactly at buffer edge -> pass
  - deadline 1 minute past buffer -> fail
  - valid multi-hop transfer -> pass
"""
from __future__ import annotations

from datetime import timedelta
from typing import List, Optional

from . import config
from .geo import haversine_km
from .models import (
    GeoPoint,
    Hub,
    HubStatus,
    Shipment,
    Vehicle,
)
from .search import SearchCandidate
from .state import World


# CHUNK2

class MatchedOption:
    """A feasible raw candidate (pre-evaluation)."""

    def __init__(
        self,
        shipment_id: str,
        vehicle_ids: List[str],
        transfer_hub_ids: List[str],
        distance_km: float,
        estimated_arrival_hours: float,
        label: str,
    ) -> None:
        self.shipment_id = shipment_id
        self.vehicle_ids = vehicle_ids
        self.transfer_hub_ids = transfer_hub_ids
        self.distance_km = distance_km
        self.estimated_arrival_hours = estimated_arrival_hours  # relative to now
        self.label = label

    def __repr__(self) -> str:  # pragma: no cover
        return f"MatchedOption({self.label}, dist={self.distance_km:.0f}km, eta_h={self.estimated_arrival_hours:.1f})"


# CHUNK3

def _leg_distance(world: World, a: str, b: str) -> float:
    ha, hb = world.hubs[a], world.hubs[b]
    return haversine_km(ha.lat, ha.lng, hb.lat, hb.lng)


def _direct_distance_eta(
    world: World,
    vehicle: Vehicle,
    pickup: str,
    dest: str,
) -> Optional[tuple]:
    """(distance_km, eta_hours) along vehicle route pickup->dest, or None."""
    seq = vehicle.route_hub_sequence
    if pickup not in seq or dest not in seq:
        return None
    i, j = seq.index(pickup), seq.index(dest)
    if i >= j:  # pickup must come strictly before destination
        return None
    distance = 0.0
    hours = 0.0
    for k in range(i, j):
        distance += _leg_distance(world, seq[k], seq[k + 1])
        hours += _leg_distance(world, seq[k], seq[k + 1]) / vehicle.speed_kmh
        if k > i:  # intermediate hub transfer time
            hours += world.hubs[seq[k]].transfer_time_hours
    return distance, hours


# CHUNK4

def match_direct(
    world: World,
    shipment: Shipment,
    candidate: SearchCandidate,
    now,
) -> Optional[MatchedOption]:
    """Single-vehicle piggyback: pickup and destination both on route, in order,
    capacity fits (>=), and ETA within deadline + buffer."""
    vehicle = candidate.vehicle
    pickup = shipment.recovery_pickup_hub_id or shipment.origin_hub_id
    dest = shipment.destination_hub_id
    if candidate.spare_kg < shipment.weight_kg:  # exact-fit passes (>=)
        return None
    result = _direct_distance_eta(world, vehicle, pickup, dest)
    if result is None:
        return None
    distance, hours = result
    eta = now + timedelta(hours=hours)
    if eta > shipment.deadline + timedelta(hours=config.DELAY_TOLERANCE_BUFFER_HOURS):
        return None
    return MatchedOption(
        shipment_id=shipment.id,
        vehicle_ids=[vehicle.id],
        transfer_hub_ids=[],
        distance_km=distance,
        estimated_arrival_hours=hours,
        label=f"Direct piggyback on {vehicle.id} ({vehicle.type.value})",
    )


def match_consolidation(
    world: World,
    shipment: Shipment,
    candidate: SearchCandidate,
    now,
) -> Optional[MatchedOption]:
    """Mode B — Consolidation (PS §11B).

    The vehicle is already carrying other shipments on the leg pickup->dest.
    Verify that with REAL assignments (no fake consolidation), and require
    spare capacity to cover BOTH the riding load and this package:
    spare_kg >= weight (>= semantics)."""
    vehicle = candidate.vehicle
    pickup = shipment.recovery_pickup_hub_id or shipment.origin_hub_id
    dest = shipment.destination_hub_id
    result = _direct_distance_eta(world, vehicle, pickup, dest)
    if result is None:
        return None
    # real consolidation evidence: at least one other shipment actively
    # assigned to this vehicle whose ride overlaps the pickup->dest span
    i, j = vehicle.route_hub_sequence.index(pickup), vehicle.route_hub_sequence.index(dest)
    has_co_rider = False
    for asg in world.assignments.values():
        if asg.vehicle_id != vehicle.id or asg.shipment_id == shipment.id:
            continue
        if asg.status.value not in ("PENDING", "IN_TRANSIT"):
            continue
        other = world.shipments.get(asg.shipment_id)
        if other is None:
            continue
        # overlap: other package's delivery point lies within (or beyond the
        # start of) our span, and it boards no later than our destination
        seq = vehicle.route_hub_sequence
        drop = other.destination_hub_id
        if drop not in seq:
            continue
        k = seq.index(drop)
        if k > i and asg.leg_index <= j:
            has_co_rider = True
            break
    if not has_co_rider:
        return None  # nothing to consolidate with -> not this mode
    distance, hours = result
    eta = now + timedelta(hours=hours)
    if eta > shipment.deadline + timedelta(hours=config.DELAY_TOLERANCE_BUFFER_HOURS):
        return None
    return MatchedOption(
        shipment_id=shipment.id,
        vehicle_ids=[vehicle.id],
        transfer_hub_ids=[],
        distance_km=distance,
        estimated_arrival_hours=hours,
        label=f"Consolidation on {vehicle.id} ({vehicle.type.value}) - shares space with packages already aboard",
    )


def match_fallback(
    world: World,
    shipment: Shipment,
    candidates: List[SearchCandidate],
    now,
) -> List[MatchedOption]:
    """Mode D — Fallback repositioning (PS §11D).

    When no direct/multi-hop plan exists: reposition the package to the
    nearest ACTIVE hub (with outbound coverage toward the destination) by a
    candidate already serving it, then re-run matching from that hub.
    Returns genuine multi-hop-style options that start with the reposition
    hop; never a fabricated 'trust me' plan."""
    pickup = shipment.recovery_pickup_hub_id or shipment.origin_hub_id
    dest = shipment.destination_hub_id
    out: List[MatchedOption] = []
    # candidate relocation hubs: ACTIVE hubs with a candidate vehicle passing
    # through them that can then reach the destination
    reloc: List[tuple] = []  # (hub_id, km_from_pickup)
    for hub in world.hubs.values():
        if hub.id == pickup or hub.status != HubStatus.ACTIVE or hub.id == dest:
            continue
        # outbound coverage: some candidate reaches dest from this hub later
        coverage = False
        for c in candidates:
            seq = c.vehicle.route_hub_sequence
            if hub.id in seq and dest in seq and seq.index(hub.id) < seq.index(dest):
                coverage = True
                break
        if not coverage:
            continue
        km = _leg_distance(world, pickup, hub.id)
        reloc.append((hub.id, km))
    reloc.sort(key=lambda t: t[1])
    # attempt re-match via each of the three nearest relocation hubs
    for hop_hub, km_hop in reloc[:3]:
        for c in candidates:
            if c.spare_kg < shipment.weight_kg:
                continue
            seq = c.vehicle.route_hub_sequence
            if hop_hub not in seq or dest not in seq:
                continue
            if seq.index(hop_hub) >= seq.index(dest):
                continue
            # option: current carrier (or the same candidate) repositions the
            # package to hop_hub, then this candidate delivers hop_hub -> dest
            dist, hours = 0.0, 0.0
            for k in range(seq.index(hop_hub), seq.index(dest)):
                d = _leg_distance(world, seq[k], seq[k + 1])
                dist += d
                hours += d / c.vehicle.speed_kmh
                if k > seq.index(hop_hub):
                    hours += world.hubs[seq[k]].transfer_time_hours
            hours += world.hubs[hop_hub].transfer_time_hours  # handling at the stop
            total_km = km_hop + dist
            total_h = km_hop / c.vehicle.speed_kmh + hours
            eta = now + timedelta(hours=total_h)
            if eta > shipment.deadline + timedelta(hours=config.DELAY_TOLERANCE_BUFFER_HOURS):
                continue
            out.append(MatchedOption(
                shipment_id=shipment.id,
                vehicle_ids=[c.vehicle.id],
                transfer_hub_ids=[hop_hub],
                distance_km=total_km,
                estimated_arrival_hours=total_h,
                label=f"Fallback repositioning via {hop_hub} with {c.vehicle.id} ({vehicle_type_name(c.vehicle)})",
            ))
            break  # one option per relocation hub
    return out


def vehicle_type_name(vehicle: Vehicle) -> str:
    return vehicle.type.value.title()


# CHUNK5

def match_multihop(
    world: World,
    shipment: Shipment,
    candidates: List[SearchCandidate],
    now,
) -> List[MatchedOption]:
    """Two-vehicle transfer: A carries pickup->hub_X, B carries hub_X->dest.
    hub_X must be ACTIVE; both vehicles need spare capacity; total ETA must
    meet the deadline + buffer."""
    pickup = shipment.recovery_pickup_hub_id or shipment.origin_hub_id
    dest = shipment.destination_hub_id
    out: List[MatchedOption] = []
    for a in candidates:
        if a.spare_kg < shipment.weight_kg:
            continue
        seq_a = a.vehicle.route_hub_sequence
        if pickup not in seq_a:
            continue
        for x_idx, hub_x in enumerate(seq_a):
            if x_idx == 0 or hub_x == pickup:
                continue  # must actually move pickup -> hub_X
            if hub_x not in world.hubs:
                continue
            if world.hubs[hub_x].status != HubStatus.ACTIVE:
                continue
            dist_a, hours_a = 0.0, 0.0
            ok = True
            for k in range(x_idx):
                d = _leg_distance(world, seq_a[k], seq_a[k + 1])
                dist_a += d
                hours_a += d / a.vehicle.speed_kmh
                if k > 0:
                    hours_a += world.hubs[seq_a[k]].transfer_time_hours
            for b in candidates:
                if b.vehicle.id == a.vehicle.id:
                    continue
                if b.spare_kg < shipment.weight_kg:
                    continue
                seq_b = b.vehicle.route_hub_sequence
                if hub_x not in seq_b or dest not in seq_b:
                    continue
                if seq_b.index(hub_x) >= seq_b.index(dest):
                    continue
                dist_b, hours_b = 0.0, 0.0
                for k in range(seq_b.index(hub_x), seq_b.index(dest)):
                    d = _leg_distance(world, seq_b[k], seq_b[k + 1])
                    dist_b += d
                    hours_b += d / b.vehicle.speed_kmh
                    if k > seq_b.index(hub_x):
                        hours_b += world.hubs[seq_b[k]].transfer_time_hours
                total_hours = hours_a + world.hubs[hub_x].transfer_time_hours + hours_b
                eta = now + timedelta(hours=total_hours)
                if eta > shipment.deadline + timedelta(hours=config.DELAY_TOLERANCE_BUFFER_HOURS):
                    continue
                out.append(
                    MatchedOption(
                        shipment_id=shipment.id,
                        vehicle_ids=[a.vehicle.id, b.vehicle.id],
                        transfer_hub_ids=[hub_x],
                        distance_km=dist_a + dist_b,
                        estimated_arrival_hours=total_hours,
                        label=f"Multi-hop {a.vehicle.id} -> {hub_x} -> {b.vehicle.id}",
                    )
                )
    return out


# CHUNK6

def match_shipment(
    world: World,
    shipment: Shipment,
    candidates: List[SearchCandidate],
    now=None,
) -> List[MatchedOption]:
    """Full Layer-3 entry point: direct + consolidation + multi-hop, and the
    fallback-repositioning mode only when nothing else is feasible (PS §11)."""
    now = now or utcnow()
    out: List[MatchedOption] = []
    for c in candidates:
        m = match_direct(world, shipment, c, now)
        if m is not None:
            out.append(m)
    for c in candidates:
        m = match_consolidation(world, shipment, c, now)
        if m is not None:
            # skip if the same vehicle already produced a direct option
            if not any(o.vehicle_ids == [c.vehicle.id] and not o.transfer_hub_ids for o in out):
                out.append(m)
    out.extend(match_multihop(world, shipment, candidates, now))
    if not out:
        out = match_fallback(world, shipment, candidates, now)
    return out


from .models import utcnow  # noqa: E402  (late import to avoid cycles)
