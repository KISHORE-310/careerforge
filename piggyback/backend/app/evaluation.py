"""Layer 4 — Evaluate (spec §4 L4). Production-hardened.

- validate_weights(): weights >= 0, sum > 0; unknown keys rejected
- risk objective (operational risk from vehicle utilization + delay pressure)
- machine-readable score_breakdown incl. all normalization components
- division-by-zero-safe min-max normalization (all-equal -> 1.0)
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from . import config
from .models import Shipment
from .matching import MatchedOption
from .state import World

log = logging.getLogger("piggyback.evaluation")

WEIGHT_KEYS = ("w_cost", "w_time", "w_util", "w_priority", "w_co2", "w_risk")


def validate_weights(weights: Optional[Dict[str, float]]) -> Dict[str, float]:
    """Merge user weights over defaults; raise ValueError on bad input."""
    w = dict(config.DEFAULT_OPTIMIZE_WEIGHTS)
    w["w_risk"] = config.W_RISK
    if not weights:
        return w
    unknown = set(weights) - set(WEIGHT_KEYS)
    if unknown:
        raise ValueError(f"unknown weight keys: {sorted(unknown)}; allowed: {list(WEIGHT_KEYS)}")
    for k, v in weights.items():
        if not isinstance(v, (int, float)) or v < 0:
            raise ValueError(f"weight {k} must be a number >= 0 (got {v!r})")
    w.update(weights)
    if sum(w[k] for k in WEIGHT_KEYS) <= 0:
        raise ValueError("at least one weight must be > 0")
    return w


# CHUNK2

def _normalize(values: List[float], invert: bool = False) -> List[float]:
    """Min-max normalize to [0,1]. invert=True maps smaller-is-better.
    All-equal lists normalize to 1.0 (spec) — division-by-zero safe."""
    if not values:
        return []
    lo, hi = min(values), max(values)
    if hi == lo:
        return [1.0] * len(values)
    span = hi - lo
    if invert:
        return [1.0 - (v - lo) / span for v in values]
    return [(v - lo) / span for v in values]


def _risk_score(world: World, shipment: Shipment, m: MatchedOption, delay_h: float) -> float:
    """Deterministic operational risk in [0,1].

    Components (weighted):
      * carrier utilization (crowded vehicle = transfer/load risk)
      * multi-hop complexity (each transfer adds handling risk)
      * delay pressure (arriving close to/after deadline)
    """
    util_risk = 0.0
    for vid in m.vehicle_ids:
        v = world.vehicles[vid]
        util_risk = max(util_risk, v.used_capacity_kg / v.total_capacity_kg)
    hop_risk = min(0.3, 0.15 * len(m.transfer_hub_ids))
    hours_to_deadline = (shipment.deadline - datetime.now().astimezone()).total_seconds() / 3600.0
    if hours_to_deadline <= 0:
        pressure = 1.0
    else:
        pressure = max(0.0, min(1.0, (m.estimated_arrival_hours / hours_to_deadline) - 0.5))
    return round(min(1.0, 0.4 * util_risk + hop_risk + 0.3 * pressure), 4)


# CHUNK3

class EvaluatedOption:
    def __init__(
        self,
        matched: MatchedOption,
        estimated_cost_usd: float,
        dedicated_cost_usd: float,
        cost_saved_usd: float,
        estimated_delay_hours: float,
        co2_saved_kg: float,
        score: float,
        score_breakdown: Dict[str, float],
        risk_score: float = 0.0,
        weight_kg: float = 0.0,
        utilization_gain: float = 0.0,
    ) -> None:
        self.matched = matched
        self.estimated_cost_usd = estimated_cost_usd
        self.dedicated_cost_usd = dedicated_cost_usd
        self.cost_saved_usd = cost_saved_usd
        self.estimated_delay_hours = estimated_delay_hours
        self.co2_saved_kg = co2_saved_kg
        self.score = score
        self.score_breakdown = score_breakdown
        self.risk_score = risk_score
        self.weight_kg = weight_kg
        self.utilization_gain = utilization_gain


def evaluate_options(
    world: World,
    shipment: Shipment,
    matched: List[MatchedOption],
    weights: Optional[Dict[str, float]] = None,
    now=None,
) -> List[EvaluatedOption]:
    if not matched:
        return []
    w = validate_weights(weights)
    w_cost, w_time, w_util, w_priority, w_co2, w_risk = (
        w["w_cost"], w["w_time"], w["w_util"], w["w_priority"], w["w_co2"], w["w_risk"]
    )

    costs: List[float] = []
    dedicated_costs: List[float] = []
    delays: List[float] = []
    co2_savings: List[float] = []
    util_gains: List[float] = []
    risks: List[float] = []

    now_dt = now or datetime.now()

    for m in matched:
        # Cost: each vehicle charged for the legs it runs (half the total
        # distance each for multi-hop — legs were matched per-vehicle).
        if len(m.vehicle_ids) == 1:
            vehicle_cost = world.vehicles[m.vehicle_ids[0]].cost_per_km * m.distance_km
        else:
            vehicle_cost = (
                world.vehicles[m.vehicle_ids[0]].cost_per_km * m.distance_km / 2
                + world.vehicles[m.vehicle_ids[1]].cost_per_km * m.distance_km / 2
            )
        handling = 0.0
        if m.transfer_hub_ids:
            hub = world.hubs[m.transfer_hub_ids[0]]
            handling = hub.handling_cost_per_kg * shipment.weight_kg
        cost_usd = vehicle_cost + handling
        dedicated_cost = config.DEDICATED_COST_PER_KM * m.distance_km + handling
        delay_h = m.estimated_arrival_hours - (
            (shipment.deadline - now_dt).total_seconds() / 3600.0
        )
        delays.append(delay_h)
        # CO2 vs dedicated baseline (never a bare emissions number)
        dedicated_emissions = m.distance_km * shipment.weight_kg * config.EMISSION_FACTOR
        marginal = config.PIGGYBACK_EMISSION_FRACTION * dedicated_emissions
        co2_savings.append(dedicated_emissions - marginal)
        # Utilization gain (PS §13): fraction of the leading carrier's spare
        # space this package occupies — how much idle capacity gets used.
        lead = world.vehicles[m.vehicle_ids[0]]
        spare = max(lead.total_capacity_kg - lead.used_capacity_kg, 1e-9)
        util_gains.append(min(1.0, shipment.weight_kg / spare))
        costs.append(cost_usd)
        dedicated_costs.append(dedicated_cost)
        risks.append(_risk_score(world, shipment, m, delay_h))

    cost_scores = _normalize(costs, invert=True)
    delay_scores = _normalize([-d for d in delays], invert=False)
    co2_scores = _normalize(co2_savings, invert=False)
    util_scores = _normalize(util_gains, invert=False)  # more space used = better
    risk_scores = _normalize(risks, invert=True)  # lower risk -> higher score
    priority_w = config.PRIORITY_WEIGHTS[shipment.priority.value]

    out: List[EvaluatedOption] = []
    for i, m in enumerate(matched):
        # PS §15 formula (+ optional risk term at weight 0 by default)
        score = (
            w_cost * cost_scores[i]
            + w_time * delay_scores[i]
            + w_util * util_scores[i]
            + w_priority * priority_w
            + w_co2 * co2_scores[i]
            + w_risk * risk_scores[i]
        )
        breakdown = {
            "cost_score": round(cost_scores[i], 4),
            "delay_score": round(delay_scores[i], 4),
            "util_score": round(util_scores[i], 4),
            "co2_score": round(co2_scores[i], 4),
            "risk_score": round(risk_scores[i], 4),
            "priority_weight": priority_w,
            "w_cost": w_cost,
            "w_time": w_time,
            "w_util": w_util,
            "w_priority": w_priority,
            "w_co2": w_co2,
            "w_risk": w_risk,
            "raw_cost_usd": round(costs[i], 2),
            "raw_delay_hours": round(delays[i], 2),
            "raw_co2_saved_kg": round(co2_savings[i], 2),
            "raw_utilization_gain": round(util_gains[i], 4),
            "raw_risk": round(risks[i], 4),
        }
        out.append(
            EvaluatedOption(
                matched=m,
                estimated_cost_usd=costs[i],
                dedicated_cost_usd=dedicated_costs[i],
                cost_saved_usd=dedicated_costs[i] - costs[i],
                estimated_delay_hours=delays[i],
                co2_saved_kg=co2_savings[i],
                utilization_gain=util_gains[i],
                score=score,
                score_breakdown=breakdown,
                risk_score=risks[i],
                weight_kg=shipment.weight_kg,
            )
        )
    log.info("evaluated candidates", extra={
        "entity_id": shipment.id, "count": len(matched),
        "best_score": round(max(o.score for o in out), 4)})
    return out
