"""Explicit Pydantic v2 domain models + state-transition validation.

Production hardening:
- Extended lifecycle enums (CREATED/AT_HUB/DELAYED/DISRUPTED/CANCELLED ...)
- SHIPMENT_TRANSITIONS / ASSIGNMENT_TRANSITIONS maps; illegal moves raise
  InvalidTransition (no impossible states)
- Field constraints (non-negative capacity/cost, valid geo ranges)
"""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class DomainError(Exception):
    """Base class for domain-rule violations."""


class InvalidTransition(DomainError):
    def __init__(self, entity: str, entity_id: str, frm: str, to: str) -> None:
        self.entity, self.entity_id, self.frm, self.to = entity, entity_id, frm, to
        super().__init__(f"Invalid {entity} transition {entity_id}: {frm} -> {to}")


# ---------------------------------------------------------------- enums

class HubStatus(str, Enum):
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"


class VehicleType(str, Enum):
    TRUCK = "TRUCK"
    VAN = "VAN"
    RAIL = "RAIL"
    AIR = "AIR"


class VehicleStatus(str, Enum):
    IN_TRANSIT = "IN_TRANSIT"
    AT_HUB = "AT_HUB"
    COMPLETED = "COMPLETED"


class AssignmentStatus(str, Enum):
    PENDING = "PENDING"
    IN_TRANSIT = "IN_TRANSIT"
    COMPLETED = "COMPLETED"
    MISSED = "MISSED"
    CANCELLED = "CANCELLED"
    REPLACED = "REPLACED"


# CHUNK2

class EventSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class Priority(str, Enum):
    PLATINUM = "PLATINUM"
    GOLD = "GOLD"
    SILVER = "SILVER"
    STANDARD = "STANDARD"


class ChaosScenarioType(str, Enum):
    HUB_CLOSURE = "HUB_CLOSURE"
    VEHICLE_FAILURE = "VEHICLE_FAILURE"
    CAPACITY_REDUCTION = "CAPACITY_REDUCTION"
    ROUTE_DISRUPTION = "ROUTE_DISRUPTION"
    SHIPMENT_DELAY = "SHIPMENT_DELAY"
    DESTINATION_UNAVAILABLE = "DESTINATION_UNAVAILABLE"


class ShipmentStatus(str, Enum):
    CREATED = "CREATED"
    IN_TRANSIT = "IN_TRANSIT"
    AT_HUB = "AT_HUB"
    DELAYED = "DELAYED"
    MISPLACED = "MISPLACED"
    DISRUPTED = "DISRUPTED"
    RECOVERING = "RECOVERING"
    RECOVERED = "RECOVERED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


# Legal shipment lifecycle edges. Everything else is rejected at runtime.
SHIPMENT_TRANSITIONS: Dict[ShipmentStatus, set] = {
    ShipmentStatus.CREATED: {ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELLED},
    ShipmentStatus.IN_TRANSIT: {
        ShipmentStatus.AT_HUB, ShipmentStatus.MISPLACED, ShipmentStatus.DELAYED,
        ShipmentStatus.DISRUPTED, ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED,
    },
    ShipmentStatus.AT_HUB: {
        ShipmentStatus.IN_TRANSIT, ShipmentStatus.MISPLACED, ShipmentStatus.DELAYED,
        ShipmentStatus.DISRUPTED, ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED,
    },
    ShipmentStatus.DELAYED: {
        ShipmentStatus.IN_TRANSIT, ShipmentStatus.MISPLACED, ShipmentStatus.DISRUPTED,
        ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED,
    },
    ShipmentStatus.MISPLACED: {
        ShipmentStatus.RECOVERING, ShipmentStatus.CANCELLED, ShipmentStatus.DISRUPTED,
    },
    ShipmentStatus.DISRUPTED: {
        ShipmentStatus.RECOVERING, ShipmentStatus.MISPLACED, ShipmentStatus.CANCELLED,
        ShipmentStatus.DELIVERED,  # reopen-hub: rerouted plan resumes legitimate delivery
    },
    ShipmentStatus.RECOVERING: {
        ShipmentStatus.RECOVERED, ShipmentStatus.MISPLACED,
    },
    ShipmentStatus.RECOVERED: set(),          # terminal
    ShipmentStatus.DELIVERED: set(),          # terminal
    ShipmentStatus.CANCELLED: set(),          # terminal
}

ASSIGNMENT_TRANSITIONS: Dict[AssignmentStatus, set] = {
    AssignmentStatus.PENDING: {
        AssignmentStatus.IN_TRANSIT, AssignmentStatus.CANCELLED, AssignmentStatus.REPLACED,
    },
    AssignmentStatus.IN_TRANSIT: {
        AssignmentStatus.COMPLETED, AssignmentStatus.MISSED,
        AssignmentStatus.CANCELLED, AssignmentStatus.REPLACED,
    },
    AssignmentStatus.COMPLETED: set(),        # terminal
    AssignmentStatus.MISSED: set(),           # terminal
    AssignmentStatus.CANCELLED: set(),        # terminal
    AssignmentStatus.REPLACED: set(),         # terminal
}


def transition(entity: str, entity_id: str, current, target, transitions: Dict) -> None:
    """Validate and return; raise InvalidTransition on illegal moves.
    Same-state is a no-op (idempotent)."""
    if current == target:
        return
    allowed = transitions.get(current, set())
    if target not in allowed:
        raise InvalidTransition(entity, entity_id, current.value, target.value)


# CHUNK3

class GeoPoint(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class Hub(BaseModel):
    id: str
    name: str
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    status: HubStatus = HubStatus.ACTIVE
    transfer_time_hours: float = Field(ge=0)
    handling_cost_per_kg: float = Field(ge=0)


class RouteLeg(BaseModel):
    from_hub_id: str
    to_hub_id: str
    distance_km: float = Field(ge=0)


class Route(BaseModel):
    id: str
    hub_sequence: List[str]
    legs: List[RouteLeg]


# CHUNK4

class Vehicle(BaseModel):
    id: str
    type: VehicleType
    route_hub_sequence: List[str]
    current_position: GeoPoint
    current_leg_index: int = Field(ge=0)
    progress_on_leg_km: float = Field(ge=0)
    total_capacity_kg: float = Field(gt=0)
    used_capacity_kg: float = Field(ge=0)
    cost_per_km: float = Field(ge=0)
    speed_kmh: float = Field(gt=0)
    status: VehicleStatus = VehicleStatus.IN_TRANSIT

    @field_validator("used_capacity_kg")
    @classmethod
    def _capacity_sane(cls, v, info):
        total = info.data.get("total_capacity_kg")
        if total is not None and v > total:
            raise ValueError("used_capacity_kg cannot exceed total_capacity_kg")
        return v

    @property
    def spare_kg(self) -> float:
        return self.total_capacity_kg - self.used_capacity_kg


class ShipmentAssignment(BaseModel):
    id: str
    shipment_id: str
    vehicle_id: str
    leg_index: int = Field(ge=0)
    from_hub_id: str
    to_hub_id: str
    scheduled_departure: datetime
    scheduled_arrival: datetime
    actual_arrival: Optional[datetime] = None
    status: AssignmentStatus = AssignmentStatus.PENDING
    is_recovery_leg: bool = False

    def set_status(self, target: AssignmentStatus) -> None:
        transition("assignment", self.id, self.status, target, ASSIGNMENT_TRANSITIONS)
        self.status = target


# CHUNK5

class Shipment(BaseModel):
    id: str
    origin_hub_id: str
    destination_hub_id: str
    current_location: GeoPoint
    planned_route_id: str
    deadline: datetime
    priority: Priority
    weight_kg: float = Field(gt=0)
    value_usd: float = Field(ge=0)
    status: ShipmentStatus = ShipmentStatus.CREATED
    last_scan_event_at: datetime
    assigned_vehicle_id: Optional[str] = None
    current_leg_index: Optional[int] = None
    recovery_pickup_hub_id: Optional[str] = None

    def set_status(self, target: ShipmentStatus) -> None:
        transition("shipment", self.id, self.status, target, SHIPMENT_TRANSITIONS)
        self.status = target


class RecoveryOption(BaseModel):
    shipment_id: str
    rank: int
    strategy_label: str
    vehicle_ids: List[str]
    transfer_hub_ids: List[str]
    estimated_cost_usd: float = Field(ge=0)
    dedicated_cost_usd: float = Field(ge=0)
    cost_saved_usd: float
    estimated_delay_hours: float  # negative = early
    co2_saved_kg: float
    utilization_gain: float = Field(default=0.0, ge=0, le=1)
    score: float
    score_breakdown: Dict[str, float]
    explanation: str
    risk_score: float = Field(default=0.0, ge=0, le=1)


class RecoveryEventStatus(str, Enum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"
    EXPIRED = "EXPIRED"


class RecoveryEvent(BaseModel):
    id: str
    shipment_id: str
    detected_at: datetime = Field(default_factory=utcnow)
    detection_reason: str
    plain_reason: str = ""  # plain-English version shown in the UI (PS §25)
    severity: EventSeverity
    candidates_evaluated: int = 0
    chosen_option: Optional[RecoveryOption] = None
    status: RecoveryEventStatus = RecoveryEventStatus.PENDING


class OperationalEvent(BaseModel):
    """WebSocket envelope: every pushed event carries id/timestamp/seq."""
    event_id: str
    timestamp: datetime = Field(default_factory=utcnow)
    seq: int = 0
    type: str
    entity_id: Optional[str] = None
    payload: Dict = Field(default_factory=dict)

