"""API integration tests (hardening spec §10, §11, §26).

Runs the FastAPI app in-process via httpx ASGI transport. Covers happy paths,
structured errors, idempotency, validation failures, and chaos triggers.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient

from app import config
from app.main import app, WORLD


@pytest.fixture(scope="module")
def client():
    # lifespan generates the world with config.SIMULATION_SEED on startup;
    # freeze ticks for determinism within the module
    WORLD.sim_running = False
    with TestClient(app) as c:
        yield c


class TestHealthAndState:
    def test_health(self, client):
        r = client.get("/api/v1/health")
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "ok"
        assert body["seed"] == config.SIMULATION_SEED  # lifespan reseeds deterministically
        assert body["hubs"] > 0 and body["vehicles"] > 0 and body["shipments"] > 0

    def test_state_has_all_collections(self, client):
        r = client.get("/api/v1/state")
        assert r.status_code == 200
        body = r.json()
        for key in ("hubs", "vehicles", "shipments", "events", "metrics"):
            assert key in body

    def test_shipments_pagination_and_filter(self, client):
        r = client.get("/api/v1/shipments?limit=5&offset=0")
        assert r.status_code == 200
        body = r.json()
        assert body["total"] > 0
        assert len(body["items"]) <= 5
        # status filter
        r2 = client.get("/api/v1/shipments?status=IN_TRANSIT")
        assert all(s["status"] == "IN_TRANSIT" for s in r2.json()["items"])


class TestErrors:
    def test_unknown_shipment_404_structured(self, client):
        r = client.post("/api/v1/optimize", json={"shipment_id": "NOPE"})
        assert r.status_code == 404
        body = r.json()
        assert body["success"] is False
        assert body["error"]["code"] == "SHIPMENT_NOT_FOUND"
        assert "request_id" in body["error"]

    def test_invalid_weights_422(self, client):
        r = client.post("/api/v1/optimize",
                        json={"shipment_id": "S001", "weights": {"w_cost": -1.0}})
        assert r.status_code == 422
        assert r.json()["error"]["code"] == "INVALID_WEIGHTS"

    def test_validation_error_422(self, client):
        r = client.post("/api/v1/simulation/control", json={"action": "explode"})
        assert r.status_code == 422

    def test_recover_unknown_shipment_404(self, client):
        r = client.post("/api/v1/recover", json={"shipment_id": "NOPE", "option_rank": 1})
        assert r.status_code == 404


class TestOptimizeAndRecover:
    def _a_misplaced(self, client) -> str | None:
        state = client.get("/api/v1/state").json()
        for s in state["shipments"]:
            if s["status"] == "MISPLACED":
                return s["id"]
        return None

    def test_optimize_returns_ranked_options_with_explanations(self, client):
        sid = self._a_misplaced(client)
        if sid is None:
            pytest.skip("no misplaced shipment right now")
        r = client.post("/api/v1/optimize", json={"shipment_id": sid})
        assert r.status_code == 200
        body = r.json()
        assert body["shipment"]["id"] == sid
        scores = [o["score"] for o in body["options"]]
        assert scores == sorted(scores, reverse=True)  # ranked descending
        for o in body["options"]:
            assert o["explanation"]  # real explanation text
            assert o["score_breakdown"]  # machine-readable metadata

    def test_recover_idempotent_double_call(self, client):
        sid = self._a_misplaced(client)
        if sid is None:
            pytest.skip("no misplaced shipment right now")
        r1 = client.post("/api/v1/optimize", json={"shipment_id": sid})
        if not r1.json()["options"]:
            pytest.skip("no feasible options")
        r2 = client.post("/api/v1/recover", json={"shipment_id": sid, "option_rank": 1})
        assert r2.status_code == 200
        assert r2.json()["ok"] is True
        # duplicate call must be safe (idempotent), not 500 or duplicate state
        r3 = client.post("/api/v1/recover", json={"shipment_id": sid, "option_rank": 1})
        assert r3.status_code == 200
        assert r3.json().get("idempotent") is True


class TestRiskAndInsights:
    def test_risk_endpoint(self, client):
        r = client.get("/api/v1/risk?limit=5")
        assert r.status_code == 200
        body = r.json()
        assert body["total_assessed"] > 0
        for item in body["items"]:
            assert 0.0 <= item["risk"] <= 1.0
            assert item["level"] in ("LOW", "MODERATE", "ELEVATED", "CRITICAL")
            assert item["factors"]  # explainable

    def test_insights_endpoint(self, client):
        r = client.get("/api/v1/insights")
        assert r.status_code == 200
        body = r.json()
        assert body["summary"]
        assert body["ai"]["fallback"] == "deterministic-template"


class TestSimulationControl:
    def test_pause_resume_reset(self, client):
        r = client.post("/api/v1/simulation/control", json={"action": "pause"})
        assert r.json()["running"] is False
        r = client.post("/api/v1/simulation/control", json={"action": "start"})
        assert r.json()["running"] is True
        r = client.post("/api/v1/simulation/control", json={"action": "reset", "seed": 42})
        assert r.json()["seed"] == 42


class TestChaos:
    def test_close_hub_scenario(self, client):
        r = client.post("/api/v1/chaos", json={"scenario": "close-hub"})
        assert r.status_code == 200
        body = r.json()
        assert body["ok"] is True
        assert "closed_hub" in body

    def test_destination_unavailable_never_delivers(self, client):
        state = client.get("/api/v1/state").json()
        before = {s["id"] for s in state["shipments"] if s["status"] == "IN_TRANSIT"}
        r = client.post("/api/v1/chaos", json={"scenario": "destination-unavailable"})
        assert r.status_code == 200
        state2 = client.get("/api/v1/state").json()
        for s in state2["shipments"]:
            # no shipment may have been marked DELIVERED by the disruption
            if s["id"] in before and s["status"] == "DELIVERED":
                pytest.fail(f"{s['id']} was DELIVERED by a disruption (must be DISRUPTED)")

    def test_reopen_hub(self, client):
        r = client.post("/api/v1/chaos", json={"scenario": "reopen-hub"})
        assert r.status_code == 200

    def test_unknown_scenario_422(self, client):
        r = client.post("/api/v1/chaos", json={"scenario": "moon-landing"})
        assert r.status_code == 422


class TestLegacyAliases:
    def test_legacy_state_path(self, client):
        r = client.get("/api/state")
        assert r.status_code == 200
        assert "shipments" in r.json()

    def test_legacy_chaos_path(self, client):
        r = client.post("/api/chaos/close-hub", json={})
        assert r.status_code == 200
