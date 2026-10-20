"""Shared fixtures: a tiny hand-built world for pipeline unit tests."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from datetime import datetime, timedelta, timezone
from typing import Dict

import pytest

from app.models import (
    GeoPoint,
    Hub,
    Priority,
    Route,
    RouteLeg,
    Shipment,
    ShipmentStatus,
    Vehicle,
    VehicleStatus,
    VehicleType,
    utcnow,
)
from app.state import World


def mk_hub(id: str, lat: float, lng: float) -> Hub:
    return Hub(id=id, name=f"Hub {id}", lat=lat, lng=lng,
               transfer_time_hours=0.5, handling_cost_per_kg=0.1)


def mk_vehicle(id: str, seq, capacity: float = 1000.0, used: float = 0.0,
               speed: float = 60.0, cost_per_km: float = 1.0,
               vtype: VehicleType = VehicleType.TRUCK) -> Vehicle:
    return Vehicle(
        id=id, type=vtype, route_hub_sequence=list(seq),
        current_position=GeoPoint(lat=0.0, lng=0.0),
        current_leg_index=0, progress_on_leg_km=0.0,
        total_capacity_kg=capacity, used_capacity_kg=used,
        cost_per_km=cost_per_km, speed_kmh=speed,
        status=VehicleStatus.IN_TRANSIT,
    )


def mk_shipment(id: str, origin: str, dest: str, weight: float,
                deadline_h: float, world_hubs: Dict[str, Hub],
                priority: Priority = Priority.SILVER) -> Shipment:
    now = utcnow()
    return Shipment(
        id=id, origin_hub_id=origin, destination_hub_id=dest,
        current_location=GeoPoint(lat=world_hubs[origin].lat, lng=world_hubs[origin].lng),
        planned_route_id=f"R-{origin}-{dest}",
        deadline=now + timedelta(hours=deadline_h),
        priority=priority, weight_kg=weight,
        value_usd=weight * 12.0, status=ShipmentStatus.MISPLACED,
        last_scan_event_at=now,
    )


def mk_world() -> World:
    """Layout (roughly 111km per degree):

        H1 --- H2 --- H3 --- H4   (each leg ~111km)
    """
    w = World()
    coords = {"H1": (0.0, 0.0), "H2": (0.0, 1.0), "H3": (0.0, 2.0), "H4": (0.0, 3.0)}
    for hid, (lat, lng) in coords.items():
        h = mk_hub(hid, lat, lng)
        w.hubs[hid] = h
    return w


@pytest.fixture()
def world() -> World:
    return mk_world()


@pytest.fixture()
def now() -> datetime:
    return utcnow()
