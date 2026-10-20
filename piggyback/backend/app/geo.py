"""Geographic helpers: haversine distance and point-to-segment distance.

All distances in km; uses a local equirectangular approximation for the
point-to-segment projection (fine at city-region scale).
"""
from __future__ import annotations

import math

EARTH_RADIUS_KM = 6371.0
_KM_PER_DEG_LAT = 110.574


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance between two (lat, lng) points in km."""
    rlat1, rlng1, rlat2, rlng2 = map(math.radians, (lat1, lng1, lat2, lng2))
    dlat = rlat2 - rlat1
    dlng = rlng2 - rlng1
    a = math.sin(dlat / 2) ** 2 + math.cos(rlat1) * math.cos(rlat2) * math.sin(dlng / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def _km_per_deg_lng(lat: float) -> float:
    return 111.320 * math.cos(math.radians(lat))


def point_to_segment_km(
    lat: float, lng: float,
    lat1: float, lng1: float,
    lat2: float, lng2: float,
) -> float:
    """Shortest distance (km) from point P to segment P1→P2.

    Local equirectangular projection; correct enough at <200km scale.
    """
    kx = _km_per_deg_lng((lat1 + lat2) / 2)
    ky = _KM_PER_DEG_LAT

    # P1 at origin; P2, P in km space
    ax, ay = 0.0, 0.0
    bx = (lng2 - lng1) * kx
    by = (lat2 - lat1) * ky
    px = (lng - lng1) * kx
    py = (lat - lat1) * ky

    # If the segment is degenerate, fall back to point distance
    seg_len2 = bx * bx + by * by
    if seg_len2 == 0.0:
        return math.hypot(px, py)

    # Projection parameter t of P onto line P1→P2, clamped to [0,1]
    t = ((px - ax) * bx + (py - ay) * by) / seg_len2
    t = max(0.0, min(1.0, t))
    cx, cy = ax + t * bx, ay + t * by
    return math.hypot(px - cx, py - cy)


def min_distance_to_polyline_km(
    lat: float, lng: float, coords: list[tuple[float, float]]
) -> float:
    """Min distance from a point to a polyline (list of (lat, lng)) in km."""
    if not coords:
        return 0.0
    if len(coords) == 1:
        return haversine_km(lat, lng, coords[0][0], coords[0][1])
    return min(
        point_to_segment_km(lat, lng, coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1])
        for i in range(len(coords) - 1)
    )
