"""WebSocket tests (hardening spec §14): envelope format, connect, ping/pong."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient

from app.main import WORLD, app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def _parse_envelope(raw: str) -> dict:
    import json

    msg = json.loads(raw)
    for key in ("event_id", "timestamp", "seq", "type", "payload"):
        assert key in msg, f"envelope missing {key}"
    assert msg["seq"] >= 0
    return msg


class TestWebSocket:
    def test_connect_receives_full_state_envelope(self, client):
        with client.websocket_connect("/ws/simulation") as ws:
            msg = _parse_envelope(ws.receive_text())
            assert msg["type"] == "state"
            state = msg["payload"]
            for key in ("hubs", "vehicles", "shipments", "events", "metrics"):
                assert key in state

    def test_ping_pong(self, client):
        import json

        with client.websocket_connect("/ws/simulation") as ws:
            first = json.loads(ws.receive_text())  # initial state
            ws.send_text(json.dumps({"type": "ping", "ts": 123}))
            pong = json.loads(ws.receive_text())
            assert pong["type"] == "pong"
            assert pong["payload"]["client_ts"] == 123

    def test_sequence_numbers_monotonic(self, client):
        import json

        with client.websocket_connect("/ws/simulation") as ws:
            first = json.loads(ws.receive_text())
            ws.send_text(json.dumps({"type": "ping", "ts": 1}))
            second = json.loads(ws.receive_text())
            assert second["seq"] > first["seq"]
