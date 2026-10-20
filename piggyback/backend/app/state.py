"""World state: typed in-memory stores, structured so a DB swap later is a
repository-level change (spec §2)."""
from __future__ import annotations

import threading
from typing import Dict, List

from .models import (
    Hub,
    RecoveryEvent,
    Route,
    Shipment,
    ShipmentAssignment,
    Vehicle,
)


class World:
    def __init__(self) -> None:
        self.sim_time_offset_hours: float = 0.0
        self.sim_running: bool = True
        self.speed_multiplier: float = 1.0
        self.tick_count: int = 0
        self.seed: int = 42
        # Coarse REENTRANT lock: the tick loop holds it while advancing the
        # world; sync FastAPI endpoints (threadpool) hold it while reading;
        # same-thread nesting is allowed (recover -> optimize both lock).
        self.lock = threading.RLock()

        self.hubs: Dict[str, Hub] = {}
        self.routes: Dict[str, Route] = {}
        self.vehicles: Dict[str, Vehicle] = {}
        self.shipments: Dict[str, Shipment] = {}
        self.assignments: Dict[str, ShipmentAssignment] = {}
        self.events: List[RecoveryEvent] = []

        # Running demo metrics (spec §5 GET /api/metrics)
        self.metrics: Dict[str, float] = {
            "total_cost_saved_usd": 0.0,
            "total_delay_hours_saved": 0.0,
            "total_co2_saved_kg": 0.0,
            "recovered_count": 0,
        }

    def add_event(self, event: RecoveryEvent) -> RecoveryEvent:
        self.events.append(event)
        return event

    def reset(self) -> None:
        self.sim_time_offset_hours = 0.0
        self.sim_running = True
        self.speed_multiplier = 1.0
        self.tick_count = 0
        # self.seed is set by generate_world, not reset
        self.hubs.clear()
        self.routes.clear()
        self.vehicles.clear()
        self.shipments.clear()
        self.assignments.clear()
        self.events.clear()
        for k in self.metrics:
            self.metrics[k] = 0.0


WORLD = World()
