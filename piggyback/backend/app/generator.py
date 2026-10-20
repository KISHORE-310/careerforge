"""Deterministic seed generator for hubs, routes, vehicles, shipments (spec §6)."""
from __future__ import annotations

import hashlib  # noqa: F401  (kept for future content-addressed ids)
from datetime import timedelta
from typing import Dict, List, Optional, Tuple

from . import config
from .geo import haversine_km
from .models import (
    AssignmentStatus,
    GeoPoint,
    Hub,
    Priority,
    Route,
    RouteLeg,
    Shipment,
    ShipmentAssignment,
    ShipmentStatus,
    Vehicle,
    VehicleStatus,
    VehicleType,
    utcnow,
)
from .state import World



class _DetRng:
    """Small deterministic RNG (mulberry32) so seeded worlds reproduce."""

    def __init__(self, seed: int) -> None:
        self._s = seed & 0xFFFFFFFF

    def next_u32(self) -> int:
        self._s = (self._s + 0x6D2B79F5) & 0xFFFFFFFF
        t = self._s
        t = (t ^ (t >> 15)) * (t | 1) & 0xFFFFFFFF
        t = (t ^ (t + ((t ^ (t >> 7)) * (t | 61) & 0xFFFFFFFF))) & 0xFFFFFFFF
        return (t ^ (t >> 14)) & 0xFFFFFFFF

    def rand(self) -> float:
        return self.next_u32() / 0x100000000

    def uniform(self, a: float, b: float) -> float:
        return a + (b - a) * self.rand()

    def randint(self, a: int, b: int) -> int:
        return a + int(self.rand() * (b - a + 1)) % (b - a + 1)

    def choice(self, seq):
        return seq[int(self.rand() * len(seq)) % len(seq)]

    def weighted(self, weights: Dict[str, float]) -> str:
        total = sum(weights.values())
        r = self.rand() * total
        acc = 0.0
        for k, w in weights.items():
            acc += w
            if r <= acc:
                return k
        return k


# CHUNK2

def generate_hubs(world: World, rng: _DetRng) -> None:
    cities = config.HUB_CITIES
    for i in range(config.N_HUBS):
        span = config.MAP_SPAN_DEG / 2
        lat = config.MAP_CENTER_LAT + rng.uniform(-span, span)
        lng = config.MAP_CENTER_LNG + rng.uniform(-span, span)
        hub = Hub(
            id=f"H{i+1}",
            name=cities[i % len(cities)],
            lat=lat,
            lng=lng,
            transfer_time_hours=rng.uniform(*config.HUB_TRANSFER_TIME_RANGE_H),
            handling_cost_per_kg=rng.uniform(*config.HUB_HANDLING_COST_RANGE_PER_KG),
        )
        world.hubs[hub.id] = hub


def generate_vehicles(world: World, rng: _DetRng) -> None:
    hub_ids = list(world.hubs.keys())
    for i in range(config.N_VEHICLES):
        n_stops = rng.randint(config.MIN_ROUTE_HUBS, config.MAX_ROUTE_HUBS)
        seq = rng.choice(hub_ids)  # type: ignore[arg-type]
        seq = [seq]
        for _ in range(n_stops - 1):
            nxt = rng.choice(hub_ids)
            while nxt == seq[-1]:
                nxt = rng.choice(hub_ids)
            seq.append(nxt)
        vtype = VehicleType(rng.weighted(config.VEHICLE_MIX_WEIGHTS))
        cap = rng.uniform(*config.VEHICLE_CAPACITY_RANGE_KG)
        legs = [
            RouteLeg(
                from_hub_id=seq[j],
                to_hub_id=seq[j + 1],
                distance_km=haversine_km(
                    world.hubs[seq[j]].lat, world.hubs[seq[j]].lng,
                    world.hubs[seq[j + 1]].lat, world.hubs[seq[j + 1]].lng,
                ),
            )
            for j in range(len(seq) - 1)
        ]
        route = Route(id=f"R-VEH-{i+1}", hub_sequence=seq, legs=legs)
        world.routes[route.id] = route
        start_hub = world.hubs[seq[0]]
        vehicle = Vehicle(
            id=f"V{i+1}",
            type=vtype,
            route_hub_sequence=seq,
            current_position=GeoPoint(lat=start_hub.lat, lng=start_hub.lng),
            current_leg_index=0,
            progress_on_leg_km=0.0,
            total_capacity_kg=cap,
            used_capacity_kg=cap * rng.uniform(*config.VEHICLE_USED_FRACTION_RANGE),
            cost_per_km=rng.uniform(*config.VEHICLE_COST_PER_KM_RANGE),
            speed_kmh=config.VEHICLE_SPEEDS_KMH[vtype.value],
            status=VehicleStatus.IN_TRANSIT,
        )
        world.vehicles[vehicle.id] = vehicle


# CHUNK3

def _planned_route_id(world: World, origin: str, dest: str) -> str:
    """Shipments reference a logical planned route id; simplest deterministic
    scheme: a synthetic route id per (origin, dest) pair."""
    return f"R-PLAN-{origin}-{dest}"


def _ensure_planned_route(world: World, origin: str, dest: str) -> str:
    rid = _planned_route_id(world, origin, dest)
    if rid not in world.routes:
        legs = [
            RouteLeg(
                from_hub_id=origin,
                to_hub_id=dest,
                distance_km=haversine_km(
                    world.hubs[origin].lat, world.hubs[origin].lng,
                    world.hubs[dest].lat, world.hubs[dest].lng,
                ),
            )
        ]
        world.routes[rid] = Route(id=rid, hub_sequence=[origin, dest], legs=legs)
    return rid


def generate_shipments(world: World, rng: _DetRng) -> None:
    hub_ids = list(world.hubs.keys())
    now = utcnow()
    for i in range(config.N_SHIPMENTS):
        origin = rng.choice(hub_ids)
        dest = rng.choice(hub_ids)
        while dest == origin:
            dest = rng.choice(hub_ids)
        weight = rng.uniform(*config.SHIPMENT_WEIGHT_RANGE_KG)
        deadline_h = rng.uniform(*config.SHIPMENT_DEADLINE_RANGE_H)
        planned_route_id = _ensure_planned_route(world, origin, dest)
        # First vehicle whose route covers origin→dest carries the shipment.
        carrier: Optional[Vehicle] = None
        for v in world.vehicles.values():
            if origin in v.route_hub_sequence and dest in v.route_hub_sequence:
                if v.route_hub_sequence.index(origin) < v.route_hub_sequence.index(dest):
                    carrier = v
                    break
        shipment = Shipment(
            id=f"S{i+1:03d}",
            origin_hub_id=origin,
            destination_hub_id=dest,
            current_location=GeoPoint(lat=world.hubs[origin].lat, lng=world.hubs[origin].lng),
            planned_route_id=planned_route_id,
            deadline=now + timedelta(hours=deadline_h),
            priority=Priority(rng.weighted(config.PRIORITY_MIX_WEIGHTS)),
            weight_kg=weight,
            value_usd=weight * config.SHIPMENT_VALUE_PER_KG,
            status=ShipmentStatus.IN_TRANSIT,
            last_scan_event_at=now,
            assigned_vehicle_id=carrier.id if carrier else None,
            current_leg_index=0 if carrier else None,
        )
        world.shipments[shipment.id] = shipment
        if carrier is not None:
            # The assignment spans every leg from origin to destination so the
            # scan logic (which completes per-leg at each hub) stays consistent:
            # leg_index = origin's position; to_hub_id = final destination.
            seq = carrier.route_hub_sequence
            leg_idx = seq.index(origin)
            o, d = world.hubs[origin], world.hubs[dest]
            travel_h = 0.0
            for k in range(leg_idx, seq.index(dest)):
                hk1, hk2 = world.hubs[seq[k]], world.hubs[seq[k + 1]]
                travel_h += haversine_km(hk1.lat, hk1.lng, hk2.lat, hk2.lng) / carrier.speed_kmh
                if k > leg_idx:
                    travel_h += world.hubs[seq[k]].transfer_time_hours
            asg = ShipmentAssignment(
                id=f"A-{shipment.id}",
                shipment_id=shipment.id,
                vehicle_id=carrier.id,
                leg_index=leg_idx,
                from_hub_id=origin,
                to_hub_id=dest,
                scheduled_departure=now,
                scheduled_arrival=now + timedelta(hours=travel_h),
                status=AssignmentStatus.IN_TRANSIT,
            )
            world.assignments[asg.id] = asg
            carrier.used_capacity_kg = min(
                carrier.total_capacity_kg,
                carrier.used_capacity_kg + weight,
            )


def generate_world(world: World, seed: int = 42) -> None:
    """Populate a fresh world. Deterministic for a given seed."""
    world.reset()
    world.seed = seed
    rng = _DetRng(seed)
    generate_hubs(world, rng)
    generate_vehicles(world, rng)
    generate_shipments(world, rng)
