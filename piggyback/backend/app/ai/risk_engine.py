"""Deterministic disruption-risk scoring.

Feature-based logistic model with FIXED, published weights (config.py). No
training data exists in a hackathon prototype, so claiming a trained model
would be a fake-AI claim. Instead this is an expert-calibrated scoring
function: every weight is documented and every output is decomposable into
its contributing factors (explainability requirement).

Features (all normalized to [0,1]):
  f_deadline : deadline pressure  (hours-to-deadline vs planning horizon)
  f_stale    : telemetry staleness (hours since last scan vs threshold)
  f_deviation: route deviation    (km off planned polyline vs threshold)
  f_priority : shipment priority   (higher priority = higher operational risk)
  f_delay    : existing accumulated delay vs deadline

risk = sigmoid(w . f)  ->  [0,1]
"""
from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List

from .. import config
from ..geo import haversine_km, min_distance_to_polyline_km
from ..models import (
    Hub,
    Route,
    Shipment,
    ShipmentStatus,
    Vehicle,
)


@dataclass
class RiskAssessment:
    shipment_id: str
    risk: float                    # [0,1]
    level: str                     # LOW / MODERATE / ELEVATED / CRITICAL
    factors: Dict[str, float]      # named feature contributions (0..1)
    explanation: str

    def to_dict(self) -> dict:
        return {
            "shipment_id": self.shipment_id,
            "risk": round(self.risk, 4),
            "level": self.level,
            "factors": {k: round(v, 4) for k, v in self.factors.items()},
            "explanation": self.explanation,
        }


RISK_LEVELS = (
    (0.25, "LOW"),
    (0.45, "MODERATE"),
    (0.65, "ELEVATED"),
    (1.01, "CRITICAL"),
)


def risk_level(risk: float) -> str:
    for upper, name in RISK_LEVELS:
        if risk < upper:
            return name
    return "CRITICAL"


def _sigmoid(x: float) -> float:
    if x >= 0:
        z = math.exp(-x)
        return 1.0 / (1.0 + z)
    z = math.exp(x)
    return z / (1.0 + z)


def assess_shipment_risk(
    shipment: Shipment,
    now: datetime,
    routes: Dict[str, Route],
    vehicles: Dict[str, Vehicle],
    hubs: Dict[str, Hub],
    horizon_hours: float = 48.0,
) -> RiskAssessment:
    """Score how at-risk a shipment is, deterministically."""
    hours_to_deadline = (shipment.deadline - now).total_seconds() / 3600.0
    stale_hours = (now - shipment.last_scan_event_at).total_seconds() / 3600.0

    # f_deadline: closer deadline (or past) => higher risk
    f_deadline = 1.0 - max(0.0, min(1.0, hours_to_deadline / horizon_hours))

    # f_stale: stale telemetry relative to threshold
    f_stale = max(0.0, min(1.0, stale_hours / max(1e-9, config.STALE_SCAN_HOURS)))

    # f_deviation: distance from planned polyline relative to threshold
    route = routes.get(shipment.planned_route_id)
    f_deviation = 0.0
    if route is not None:
        pts = [(hubs[h].lat, hubs[h].lng) for h in route.hub_sequence if h in hubs]
        if len(pts) >= 2:
            dev_km = min_distance_to_polyline_km(
                shipment.current_location.lat, shipment.current_location.lng, pts
            )
            f_deviation = max(0.0, min(1.0, dev_km / max(1e-9, config.ROUTE_DEVIATION_KM)))

    # f_priority: ordinal map
    pri_map = {"STANDARD": 0.25, "SILVER": 0.5, "GOLD": 0.75, "PLATINUM": 1.0}
    f_priority = pri_map.get(str(shipment.priority), 0.25)

    # f_delay: existing delay pressure
    f_delay = 0.0
    vehicle = vehicles.get(shipment.assigned_vehicle_id or "")
    if vehicle is not None and route is not None and route.hub_sequence:
        dest = shipment.destination_hub_id
        if dest in route.hub_sequence:
            remaining_km = 0.0
            for i in range(vehicle.current_leg_index, len(route.legs)):
                leg = route.legs[i]
                remaining_km += max(0.0, leg.distance_km - (
                    vehicle.progress_on_leg_km if i == vehicle.current_leg_index else 0.0
                ))
            eta_hours = remaining_km / max(1e-9, vehicle.speed_kmh)
            f_delay = max(0.0, min(1.0, 1.0 - (eta_hours / max(1e-9, hours_to_deadline + eta_hours))))

    weights = config.RISK_WEIGHTS
    z = (
        weights["deadline"] * f_deadline
        + weights["staleness"] * f_stale
        + weights["deviation"] * f_deviation
        + weights["priority"] * f_priority
        + weights["delay"] * f_delay
    )
    # center around 0: neutral risk when features are mid-level
    z -= weights["bias"]

    risk = _sigmoid(z)
    factors = {
        "deadline_pressure": f_deadline,
        "telemetry_staleness": f_stale,
        "route_deviation": f_deviation,
        "priority_weight": f_priority,
        "delay_pressure": f_delay,
    }

    top = sorted(factors.items(), key=lambda kv: kv[1], reverse=True)[:2]
    top_str = ", ".join(f"{k.replace('_', ' ')} ({v:.2f})" for k, v in top if v > 0.05) or "baseline"
    explanation = (
        f"Risk {risk_level(risk)} ({risk:.2f}): driven by {top_str}. "
        f"Hours to deadline {hours_to_deadline:.1f}h, last scan {stale_hours:.1f}h ago."
    )
    return RiskAssessment(
        shipment_id=shipment.id,
        risk=risk,
        level=risk_level(risk),
        factors=factors,
        explanation=explanation,
    )


def assess_fleet_risk(
    shipments: List[Shipment],
    now: datetime,
    routes: Dict[str, Route],
    vehicles: Dict[str, Vehicle],
    hubs: Dict[str, Hub],
) -> List[RiskAssessment]:
    """Assess every active shipment; sorted by risk descending."""
    active = [
        s for s in shipments
        if s.status in (ShipmentStatus.IN_TRANSIT, ShipmentStatus.AT_HUB,
                        ShipmentStatus.DELAYED, ShipmentStatus.RECOVERING)
    ]
    assessments = [
        assess_shipment_risk(s, now, routes, vehicles, hubs) for s in active
    ]
    assessments.sort(key=lambda a: a.risk, reverse=True)
    return assessments
