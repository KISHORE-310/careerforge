"""Layer 4/5 evaluation + decision tests (spec §4 L4, L5)."""
from __future__ import annotations

from datetime import timedelta

from app.evaluation import evaluate_options
from app.decision import decide_top_options
from app.matching import MatchedOption
from app.models import Priority
from tests.conftest import mk_vehicle


def _wire(world):
    """Add two vehicles with different cost rates."""
    v1 = mk_vehicle("V1", ["H1", "H2"], cost_per_km=0.5)   # cheap
    v2 = mk_vehicle("V2", ["H1", "H2"], cost_per_km=2.0)   # pricey
    world.vehicles["V1"] = v1
    world.vehicles["V2"] = v2
    return v1, v2


def _shipment(world, priority=Priority.SILVER, deadline_h=20.0):
    from tests.conftest import mk_shipment
    _wire(world)
    s = mk_shipment("S1", "H1", "H2", weight=100.0, deadline_h=deadline_h, world_hubs=world.hubs, priority=priority)
    s.recovery_pickup_hub_id = "H1"
    return s


def _matched(shipment_id):
    return [
        MatchedOption(shipment_id=shipment_id, vehicle_ids=["V1"], transfer_hub_ids=[],
                      distance_km=100.0, estimated_arrival_hours=2.0, label="cheap"),
        MatchedOption(shipment_id=shipment_id, vehicle_ids=["V2"], transfer_hub_ids=[],
                      distance_km=150.0, estimated_arrival_hours=4.0, label="pricey"),
    ]


def test_cost_normalization_prefers_cheaper(world, now):
    s = _shipment(world)
    ev = evaluate_options(world, s, _matched("S1"), now=now)
    by_label = {e.matched.label: e for e in ev}
    assert by_label["cheap"].score_breakdown["cost_score"] == 1.0
    assert by_label["pricey"].score_breakdown["cost_score"] == 0.0


def test_delay_score_prefers_earlier_arrival(world, now):
    s = _shipment(world)
    ev = evaluate_options(world, s, _matched("S1"), now=now)
    by_label = {e.matched.label: e for e in ev}
    assert by_label["cheap"].score_breakdown["delay_score"] == 1.0
    assert by_label["pricey"].score_breakdown["delay_score"] == 0.0


def test_all_equal_candidates_normalize_to_one(world, now):
    s = _shipment(world)
    m = MatchedOption(shipment_id="S1", vehicle_ids=["V1"], transfer_hub_ids=[],
                      distance_km=100.0, estimated_arrival_hours=2.0, label="only")
    ev = evaluate_options(world, s, [m], now=now)
    assert ev[0].score_breakdown["cost_score"] == 1.0
    assert ev[0].score_breakdown["delay_score"] == 1.0
    assert ev[0].score_breakdown["co2_score"] == 1.0


def test_co2_saved_is_against_dedicated_baseline(world, now):
    """co2_saved must be 90% of dedicated emissions (fraction 0.10 marginal)."""
    from app import config
    s = _shipment(world)
    m = MatchedOption(shipment_id="S1", vehicle_ids=["V1"], transfer_hub_ids=[],
                      distance_km=100.0, estimated_arrival_hours=2.0, label="only")
    ev = evaluate_options(world, s, [m], now=now)
    expected = 100.0 * s.weight_kg * config.EMISSION_FACTOR * (1 - config.PIGGYBACK_EMISSION_FRACTION)
    assert abs(ev[0].co2_saved_kg - expected) < 1e-6


def test_priority_weight_shows_in_breakdown(world, now):
    s = _shipment(world, priority=Priority.PLATINUM)
    ev = evaluate_options(world, s, _matched("S1"), now=now)
    assert all(e.score_breakdown["priority_weight"] == 1.0 for e in ev)


def test_weights_override_changes_ranking(world, now):
    """With w_cost=0,w_time=1 the faster-but-pricier option can win on time."""
    s = _shipment(world)
    v1, v2 = _wire(world)
    # Make V1 slower-equivalent by giving it a longer ETA instead: swap labels
    matched = [
        MatchedOption(shipment_id="S1", vehicle_ids=["V1"], transfer_hub_ids=[],
                      distance_km=100.0, estimated_arrival_hours=6.0, label="cheap_slow"),
        MatchedOption(shipment_id="S1", vehicle_ids=["V2"], transfer_hub_ids=[],
                      distance_km=150.0, estimated_arrival_hours=1.0, label="pricey_fast"),
    ]
    ev_time = evaluate_options(world, s, matched, weights={"w_cost": 0.0, "w_time": 1.0, "w_priority": 0.0, "w_co2": 0.0}, now=now)
    opts = decide_top_options(ev_time, "S1")
    assert opts[0].strategy_label == "pricey_fast"


def test_decide_ranks_descending_and_returns_top3(world, now):
    s = _shipment(world)
    v1, v2 = _wire(world)
    matched = _matched("S1")
    matched.append(
        MatchedOption(shipment_id="S1", vehicle_ids=["V1", "V2"], transfer_hub_ids=["H2"],
                      distance_km=120.0, estimated_arrival_hours=3.0, label="multi")
    )
    ev = evaluate_options(world, s, matched, now=now)
    opts = decide_top_options(ev, "S1", top_n=3)
    scores = [o.score for o in opts]
    assert scores == sorted(scores, reverse=True)
    assert len(opts) == 3
    assert [o.rank for o in opts] == [1, 2, 3]


def test_explanation_contains_real_numbers(world, now):
    s = _shipment(world)
    v1, v2 = _wire(world)
    ev = evaluate_options(world, s, _matched("S1"), now=now)
    opts = decide_top_options(ev, "S1")
    top = opts[0]
    # real computed numbers appear in the string
    assert f"${top.cost_saved_usd:.0f}" in top.explanation
    assert "h before deadline" in top.explanation or "h after deadline" in top.explanation
    assert f"{top.co2_saved_kg:.1f}kg CO2" in top.explanation
    # and they are not placeholders
    assert "TODO" not in top.explanation and "..." not in top.explanation


def test_delay_negative_when_early(world, now):
    s = _shipment(world, deadline_h=50.0)  # plenty of slack
    v1, v2 = _wire(world)
    ev = evaluate_options(world, s, _matched("S1"), now=now)
    assert all(e.estimated_delay_hours < 0 for e in ev)
