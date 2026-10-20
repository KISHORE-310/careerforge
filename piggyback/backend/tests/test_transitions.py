"""State-transition validation tests (hardening spec §4)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from datetime import timedelta

import pytest

from app.models import (
    AssignmentStatus,
    GeoPoint,
    InvalidTransition,
    Shipment,
    ShipmentStatus,
    utcnow,
)


def mk(status: ShipmentStatus) -> Shipment:
    now = utcnow()
    return Shipment(
        id="T", origin_hub_id="H1", destination_hub_id="H2",
        current_location=GeoPoint(lat=0.0, lng=0.0), planned_route_id="R",
        deadline=now + timedelta(hours=10), priority="GOLD",
        weight_kg=50, value_usd=600, status=status, last_scan_event_at=now,
    )


class TestShipmentTransitions:
    def test_full_recovery_lifecycle_allowed(self):
        s = mk(ShipmentStatus.IN_TRANSIT)
        s.set_status(ShipmentStatus.MISPLACED)
        s.set_status(ShipmentStatus.RECOVERING)
        s.set_status(ShipmentStatus.RECOVERED)
        assert s.status is ShipmentStatus.RECOVERED

    def test_misplaced_to_delivered_is_illegal(self):
        s = mk(ShipmentStatus.MISPLACED)
        with pytest.raises(InvalidTransition):
            s.set_status(ShipmentStatus.DELIVERED)

    def test_recovered_is_terminal(self):
        s = mk(ShipmentStatus.RECOVERED)
        for target in (ShipmentStatus.IN_TRANSIT, ShipmentStatus.RECOVERING,
                       ShipmentStatus.MISPLACED, ShipmentStatus.DELIVERED):
            with pytest.raises(InvalidTransition):
                s.set_status(target)

    def test_delivered_is_terminal(self):
        s = mk(ShipmentStatus.DELIVERED)
        with pytest.raises(InvalidTransition):
            s.set_status(ShipmentStatus.IN_TRANSIT)

    def test_destination_closure_goes_disrupted_not_delivered(self):
        """§6: closing a destination hub must NEVER produce DELIVERED."""
        s = mk(ShipmentStatus.IN_TRANSIT)
        s.set_status(ShipmentStatus.DISRUPTED)
        assert s.status is ShipmentStatus.DISRUPTED
        # reopen-hub path: DISRUPTED -> MISPLACED -> RECOVERING -> RECOVERED
        s.set_status(ShipmentStatus.MISPLACED)
        s.set_status(ShipmentStatus.RECOVERING)
        s.set_status(ShipmentStatus.RECOVERED)

    def test_delayed_can_return_to_transit_or_escalate(self):
        s = mk(ShipmentStatus.DELAYED)
        s.set_status(ShipmentStatus.IN_TRANSIT)
        s.set_status(ShipmentStatus.DELAYED)
        s.set_status(ShipmentStatus.MISPLACED)
        assert s.status is ShipmentStatus.MISPLACED

    def test_same_status_is_a_no_op(self):
        s = mk(ShipmentStatus.IN_TRANSIT)
        s.set_status(ShipmentStatus.IN_TRANSIT)  # idempotent, no raise
        assert s.status is ShipmentStatus.IN_TRANSIT


class TestAssignmentTransitions:
    def test_assignment_replace_is_legal(self):
        from app.models import ShipmentAssignment

        now = utcnow()
        a = ShipmentAssignment(
            id="A1", shipment_id="T", vehicle_id="V1", leg_index=0,
            from_hub_id="H1", to_hub_id="H2",
            scheduled_departure=now, scheduled_arrival=now + timedelta(hours=2),
            status=AssignmentStatus.IN_TRANSIT,
        )
        a.set_status(AssignmentStatus.REPLACED)
        with pytest.raises(InvalidTransition):
            a.set_status(AssignmentStatus.CANCELLED)  # REPLACED is terminal
        assert a.status is AssignmentStatus.REPLACED

    def test_completed_assignment_is_terminal(self):
        from app.models import ShipmentAssignment

        now = utcnow()
        a = ShipmentAssignment(
            id="A2", shipment_id="T", vehicle_id="V1", leg_index=0,
            from_hub_id="H1", to_hub_id="H2",
            scheduled_departure=now, scheduled_arrival=now + timedelta(hours=2),
            status=AssignmentStatus.COMPLETED,
        )
        with pytest.raises(InvalidTransition):
            a.set_status(AssignmentStatus.IN_TRANSIT)
