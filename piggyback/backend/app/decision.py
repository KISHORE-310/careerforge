"""Layer 5 — Decide (spec §4 L5): rank, explain, and apply recovery.

Production hardening:
- apply_recovery is idempotent (double-POST /recover is a safe no-op)
- Original active assignment is REPLACED (never left simultaneously active)
- Capacity freed from the old carrier before loading the new one
- Every recovery leg carries is_recovery_leg=True (multi-leg traceability)
- Machine-readable explanation metadata on each option
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from . import config
from .evaluation import EvaluatedOption
from .models import (
    AssignmentStatus,
    InvalidTransition,
    RecoveryEventStatus,
    RecoveryOption,
    Shipment,
    ShipmentStatus,
    utcnow,
)
from .state import World

log = logging.getLogger("piggyback.decision")


def _plain_label(m, world: World) -> str:
    """Plain-English strategy label (PS §26)."""
    label = m.label
    if label.startswith("Consolidation"):
        return f"SHARES A RIDE - {m.vehicle_ids[0]}"
    if label.startswith("Multi-hop") or label.startswith("Fallback"):
        return f"TWO VEHICLES, ONE STOP - {' + '.join(m.vehicle_ids)}"
    v = world.vehicles[m.vehicle_ids[0]]
    kind = {"TRUCK": "Truck", "VAN": "Van", "RAIL": "Train", "AIR": "Plane"}.get(v.type.value, v.type.value)
    return f"SAME VEHICLE, STRAIGHT THERE - {kind} {v.id}"


def decide_top_options(
    evaluated: List[EvaluatedOption],
    shipment_id: str,
    top_n: int = config.TOP_N_OPTIONS,
    world: Optional[World] = None,
) -> List[RecoveryOption]:
    ranked = sorted(evaluated, key=lambda e: e.score, reverse=True)[:top_n]
    out: List[RecoveryOption] = []
    for i, e in enumerate(ranked, start=1):
        m = e.matched
        delay_h = e.estimated_delay_hours
        # --- plain-English explanation from ACTUAL computed numbers (PS §16)
        if world is not None:
            lead = world.vehicles[m.vehicle_ids[0]]
            kind = {"TRUCK": "Truck", "VAN": "Van", "RAIL": "Train", "AIR": "Plane"}.get(lead.type.value, lead.type.value)
            spare_kg = max(lead.total_capacity_kg - lead.used_capacity_kg, 0.0)
            dest_name = world.hubs[shipment_dest(m, shipment_id, world)].name if m.vehicle_ids else "?"
            util_pct = round(e.utilization_gain * 100)
            if delay_h <= 0:
                arrive_txt = f"It arrives {abs(delay_h):.1f} hours early."
            else:
                arrive_txt = f"It arrives {delay_h:.1f} hours late."
            if len(m.vehicle_ids) > 1:
                stop_name = world.hubs[m.transfer_hub_ids[0]].name if m.transfer_hub_ids else "a transfer stop"
                intro = (
                    f"{kind} {m.vehicle_ids[0]} picks the package up and hands it to "
                    f"{m.vehicle_ids[1]} at {stop_name}."
                )
            elif m.label.startswith("Consolidation"):
                intro = (
                    f"{kind} {m.vehicle_ids[0]} is already going to {dest_name} carrying other "
                    f"packages and has {spare_kg:.0f}kg of empty space. Your package fits."
                )
            else:
                intro = (
                    f"{kind} {m.vehicle_ids[0]} has {spare_kg:.0f}kg of empty space and is already "
                    f"going to {dest_name}. Your package fits."
                )
            explanation = (
                f"{intro}\n"
                f"{arrive_txt}\n"
                f"You save ${e.cost_saved_usd:.0f} compared to sending a dedicated vehicle.\n"
                f"You use {util_pct}% of the empty space.\n"
                f"You save {e.co2_saved_kg:.1f}kg of CO2."
            )
        else:
            if delay_h < 0:
                delay_txt = f"arrives {abs(delay_h):.1f}h before deadline"
            elif delay_h > 0:
                delay_txt = f"arrives {delay_h:.1f}h after deadline"
            else:
                delay_txt = "arrives exactly at deadline"
            vehicles_txt = " + ".join(m.vehicle_ids)
            explanation = (
                f"Chose {vehicles_txt} ({m.label}) - {delay_txt}, "
                f"saves ${e.cost_saved_usd:.0f} vs. dedicated recovery, "
                f"cuts {e.co2_saved_kg:.1f}kg CO2."
            )
        out.append(
            RecoveryOption(
                shipment_id=shipment_id,
                rank=i,
                strategy_label=_plain_label(m, world) if world is not None else m.label,
                vehicle_ids=m.vehicle_ids,
                transfer_hub_ids=m.transfer_hub_ids,
                estimated_cost_usd=round(e.estimated_cost_usd, 2),
                dedicated_cost_usd=round(e.dedicated_cost_usd, 2),
                cost_saved_usd=round(e.cost_saved_usd, 2),
                estimated_delay_hours=round(delay_h, 2),
                co2_saved_kg=round(e.co2_saved_kg, 2),
                utilization_gain=round(e.utilization_gain, 4),
                score=round(e.score, 4),
                score_breakdown={**e.score_breakdown, "risk_score": round(e.risk_score, 4)},
                explanation=explanation,
                risk_score=round(e.risk_score, 4),
            )
        )
    return out


def shipment_dest(m, shipment_id: str, world: World) -> str:
    s = world.shipments.get(shipment_id)
    return s.destination_hub_id if s else (m.transfer_hub_ids[0] if m.transfer_hub_ids else "")


def shipment_weight(e: EvaluatedOption) -> float:
    return getattr(e, "weight_kg", 0.0)


# CHUNK2

def apply_recovery(
    world: World,
    shipment_id: str,
    option: RecoveryOption,
    now: Optional[datetime] = None,
) -> Shipment:
    """Apply a chosen RecoveryOption (MISPLACED/DISRUPTED -> RECOVERING).

    Consistency guarantees:
      * Idempotent: if the shipment is already RECOVERING (or beyond) the call
        returns unchanged - no duplicate assignments, no double metrics.
      * The original active assignment is REPLACED and its capacity freed
        before the recovery legs are created.
      * Each recovery leg is marked is_recovery_leg=True and every leg gets a
        distinct, traceable id.
    """
    from .geo import haversine_km

    now = now or utcnow()
    shipment = world.shipments[shipment_id]

    # ---- idempotency guard -------------------------------------------
    if shipment.status in (
        ShipmentStatus.RECOVERING, ShipmentStatus.RECOVERED,
        ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED,
    ):
        log.info("recovery idempotent no-op", extra={"entity_id": shipment_id, "status": shipment.status.value})
        return shipment

    # ---- transition (validated) --------------------------------------
    shipment.set_status(ShipmentStatus.RECOVERING)

    old_vehicle_id = shipment.assigned_vehicle_id

    # ---- replace the original assignment -----------------------------
    for asg in world.assignments.values():
        if asg.shipment_id != shipment_id:
            continue
        if asg.status in (AssignmentStatus.PENDING, AssignmentStatus.IN_TRANSIT):
            # free capacity on the old carrier exactly once
            if not asg.is_recovery_leg and old_vehicle_id and old_vehicle_id in world.vehicles:
                ov = world.vehicles[old_vehicle_id]
                ov.used_capacity_kg = max(0.0, ov.used_capacity_kg - shipment.weight_kg)
            asg.set_status(AssignmentStatus.REPLACED)
            log.info("original assignment replaced", extra={
                "entity_id": asg.id, "shipment": shipment_id,
                "old_vehicle": old_vehicle_id})

    # ---- build the recovery leg chain --------------------------------
    chain: List[str] = list(option.vehicle_ids)
    transfer_hubs = list(option.transfer_hub_ids)
    pickup = shipment.recovery_pickup_hub_id or shipment.origin_hub_id

    path_hubs: List[str] = [pickup]
    if transfer_hubs:
        path_hubs.append(transfer_hubs[0])
    path_hubs.append(shipment.destination_hub_id)

    dedup: List[str] = []
    for h in path_hubs:
        if not dedup or dedup[-1] != h:
            dedup.append(h)

    stamp = int(now.timestamp() * 1000)
    n_segs = len(dedup) - 1
    for seg_i in range(n_segs):
        vid = chain[min(seg_i, len(chain) - 1)]
        v = world.vehicles[vid]
        from_h, to_h = dedup[seg_i], dedup[seg_i + 1]
        if seg_i == 0:
            v.used_capacity_kg = min(v.total_capacity_kg, v.used_capacity_kg + shipment.weight_kg)
        dist = haversine_km(
            world.hubs[from_h].lat, world.hubs[from_h].lng,
            world.hubs[to_h].lat, world.hubs[to_h].lng,
        )
        travel_h = dist / v.speed_kmh + world.hubs[to_h].transfer_time_hours
        from .models import ShipmentAssignment
        asg = ShipmentAssignment(
            id=f"A-{shipment_id}-REC{seg_i}-{stamp}",
            shipment_id=shipment_id,
            vehicle_id=vid,
            leg_index=seg_i,
            from_hub_id=from_h,
            to_hub_id=to_h,
            scheduled_departure=now,
            scheduled_arrival=now + timedelta(hours=travel_h),
            status=AssignmentStatus.PENDING,
            is_recovery_leg=True,
        )
        world.assignments[asg.id] = asg
        log.info("recovery leg created", extra={
            "entity_id": asg.id, "vehicle": vid,
            "leg": f"{from_h}->{to_h}", "seg": seg_i})
    shipment.assigned_vehicle_id = chain[0]
    shipment.current_leg_index = None

    # ---- close the pending recovery event ----------------------------
    pending = next(
        (
            ev
            for ev in world.events
            if ev.shipment_id == shipment_id and ev.status == RecoveryEventStatus.PENDING
        ),
        None,
    )
    if pending:
        pending.chosen_option = option
        pending.status = RecoveryEventStatus.RESOLVED
        pending.candidates_evaluated = max(pending.candidates_evaluated, 1)

    # ---- metrics (only on the real first application) -----------------
    world.metrics["total_cost_saved_usd"] += option.cost_saved_usd
    world.metrics["total_co2_saved_kg"] += option.co2_saved_kg
    if option.estimated_delay_hours < 0:
        world.metrics["total_delay_hours_saved"] += abs(option.estimated_delay_hours)
    return shipment
