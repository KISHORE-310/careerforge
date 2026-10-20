"""Layer 2 — Search (spec §4 L2).

Return all vehicles that are IN_TRANSIT or AT_HUB (about to depart) with
spare capacity, excluding vehicles whose route uses a CLOSED hub.
"""
from __future__ import annotations

from typing import List

from .models import HubStatus, Vehicle, VehicleStatus
from .state import World


class SearchCandidate:
    def __init__(self, vehicle: Vehicle, spare_kg: float) -> None:
        self.vehicle = vehicle
        self.spare_kg = spare_kg


def search_available_vehicles(world: World) -> List[SearchCandidate]:
    out: List[SearchCandidate] = []
    for v in world.vehicles.values():
        if v.status not in (VehicleStatus.IN_TRANSIT, VehicleStatus.AT_HUB):
            continue
        spare = v.total_capacity_kg - v.used_capacity_kg
        if spare <= 0:
            continue
        uses_closed = any(
            world.hubs[h].status == HubStatus.CLOSED
            for h in v.route_hub_sequence
            if h in world.hubs
        )
        if uses_closed:
            continue
        out.append(SearchCandidate(vehicle=v, spare_kg=spare))
    return out
