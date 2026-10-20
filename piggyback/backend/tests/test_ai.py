"""AI layer tests (hardening spec §9): deterministic risk scoring + explainer."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from datetime import timedelta

from app.ai import (
    ai_status,
    assess_shipment_risk,
    explain_recovery_decision,
    llm_explain_recovery,
)
from app.models import GeoPoint, Shipment, ShipmentStatus, utcnow
from tests.conftest import mk_hub, mk_vehicle


def _world():
    from app.models import Route, RouteLeg
    from app.state import World

    w = World()
    w.hubs["H1"] = mk_hub("H1", 0.0, 0.0)
    w.hubs["H2"] = mk_hub("H2", 0.0, 1.0)
    w.routes["R1"] = Route(
        id="R1", hub_sequence=["H1", "H2"],
        legs=[RouteLeg(from_hub_id="H1", to_hub_id="H2", distance_km=111.0)])
    w.vehicles["V1"] = mk_vehicle("V1", ["H1", "H2"])
    return w


def _shipment(w, status=ShipmentStatus.IN_TRANSIT, stale_hours=0.0, deadline_h=20.0):
    now = utcnow()
    return Shipment(
        id="S1", origin_hub_id="H1", destination_hub_id="H2",
        current_location=GeoPoint(lat=0.0, lng=0.0), planned_route_id="R1",
        deadline=now + timedelta(hours=deadline_h), priority="GOLD",
        weight_kg=50, value_usd=600, status=status,
        last_scan_event_at=now - timedelta(hours=stale_hours),
        assigned_vehicle_id="V1", current_leg_index=0,
    )


class TestRiskEngine:
    def test_risk_bounded(self):
        w = _world()
        s = _shipment(w)
        a = assess_shipment_risk(s, utcnow(), w.routes, w.vehicles, w.hubs)
        assert 0.0 <= a.risk <= 1.0
        assert a.level in ("LOW", "MODERATE", "ELEVATED", "CRITICAL")

    def test_stale_scan_raises_risk(self):
        w = _world()
        fresh = assess_shipment_risk(_shipment(w, stale_hours=0.0), utcnow(), w.routes, w.vehicles, w.hubs)
        stale = assess_shipment_risk(_shipment(w, stale_hours=48.0), utcnow(), w.routes, w.vehicles, w.hubs)
        assert stale.risk > fresh.risk

    def test_tight_deadline_raises_risk(self):
        w = _world()
        relaxed = assess_shipment_risk(_shipment(w, deadline_h=200.0), utcnow(), w.routes, w.vehicles, w.hubs)
        urgent = assess_shipment_risk(_shipment(w, deadline_h=0.5), utcnow(), w.routes, w.vehicles, w.hubs)
        assert urgent.risk > relaxed.risk

    def test_deterministic(self):
        w = _world()
        s = _shipment(w, stale_hours=3.0)
        now = utcnow()
        a1 = assess_shipment_risk(s, now, w.routes, w.vehicles, w.hubs)
        a2 = assess_shipment_risk(s, now, w.routes, w.vehicles, w.hubs)
        assert a1.risk == a2.risk  # no randomness

    def test_explanation_names_factors(self):
        w = _world()
        s = _shipment(w, stale_hours=48.0)
        a = assess_shipment_risk(s, utcnow(), w.routes, w.vehicles, w.hubs)
        assert "staleness" in a.explanation or "deadline" in a.explanation


class TestExplainer:
    def test_contains_real_numbers(self):
        option = {
            "rank": 1, "score": 0.812, "strategy_label": "Direct piggyback",
            "vehicle_ids": ["V07"], "transfer_hub_ids": [],
            "cost_saved_usd": 120.5, "co2_saved_kg": 14.2,
            "estimated_delay_hours": -2.0,
            "score_breakdown": {"cost_score": 0.7, "time_score": 0.9},
            "estimated_cost_usd": 300.0,
        }
        shipment = {"origin_hub_id": "H01", "destination_hub_id": "H12"}
        text = explain_recovery_decision(option, shipment)
        assert "120" in text  # real cost number
        assert "14" in text   # real co2 number
        assert "V07" in text  # real vehicle id

    def test_ranking_rationale_for_lower_options(self):
        chosen = {"rank": 2, "score": 0.5, "vehicle_ids": ["V2"], "transfer_hub_ids": [],
                  "cost_saved_usd": 10, "co2_saved_kg": 1, "estimated_delay_hours": 1.0,
                  "score_breakdown": {}, "estimated_cost_usd": 500}
        winner = {"rank": 1, "score": 0.9, "estimated_cost_usd": 200, "estimated_delay_hours": -3.0}
        text = explain_recovery_decision(chosen, {}, [winner, chosen])
        assert "Ranked below" in text

    def test_llm_fallback_without_credentials(self):
        option = {"rank": 1, "score": 0.8, "vehicle_ids": ["V1"], "transfer_hub_ids": [],
                  "cost_saved_usd": 50, "co2_saved_kg": 5, "estimated_delay_hours": -1,
                  "score_breakdown": {}, "estimated_cost_usd": 100}
        result = llm_explain_recovery(option, {})
        assert result["source"] == "template"  # no key configured -> deterministic
        assert result["text"]

    def test_ai_status_reports_fallback(self):
        status = ai_status()
        assert status["fallback"] == "deterministic-template"
        assert isinstance(status["enabled"], bool)
