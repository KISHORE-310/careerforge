"""Central configuration: every tunable in one place (spec §9).

All environment-specific values come from env vars (.env supported); nothing
sensitive is hardcoded. See .env.example.
"""
import os

# --- Service ---
APP_ENV = os.environ.get("APP_ENV", "development")
API_HOST = os.environ.get("API_HOST", "127.0.0.1")
API_PORT = int(os.environ.get("API_PORT", "8000"))
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
CORS_ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]
SIMULATION_SEED = int(os.environ.get("SIMULATION_SEED", "42"))

# --- Seed sizes (§6) ---
N_HUBS = 20
N_VEHICLES = 30
N_SHIPMENTS = 100

# --- Map seed center: Delhi region (so OpenStreetMap tiles look geographically sane) ---
MAP_CENTER_LAT = 28.0
MAP_CENTER_LNG = 77.0
MAP_SPAN_DEG = 1.8  # hubs scattered within roughly ±0.9° around center

# --- Vehicle physics ---
# Calibrated to the demo map scale: hubs sit ~40-120km apart and one tick
# advances SIM_HOURS_PER_TICK, so these speeds yield multi-tick legs (visible
# movement on the map) while remaining physically plausible per vehicle type.
VEHICLE_SPEEDS_KMH = {
    "TRUCK": 25.0,
    "VAN": 20.0,
    "RAIL": 30.0,
    "AIR": 45.0,
}
VEHICLE_MIX_WEIGHTS = {"TRUCK": 0.45, "VAN": 0.25, "RAIL": 0.15, "AIR": 0.15}

# --- Simulation tick loop (§6) ---
TICK_SECONDS_REAL = 1.0          # one real second per tick
SIM_HOURS_PER_TICK = 1.0         # 1 real second = 1 simulated hour at multiplier 1.0
MISPLACEMENT_RATE_PER_TICK = 0.02 # ~2% of in-transit shipments get hit each tick
MAX_CONCURRENT_MISPLACED = 15     # keep the demo playable; recovery drains the queue
MIN_START_DELAY_HOURS = 3.0      # vehicles start staggered so map is alive immediately
MAX_ROUTE_HUBS = 5
MIN_ROUTE_HUBS = 2

# --- Layer 1 detect thresholds (§4 L1) ---
STALE_SCAN_HOURS = 8.0
ROUTE_DEVIATION_KM = 50.0
MISSED_CONNECTION_BUFFER_HOURS = 1.0

# --- Layer 3 match ---
DELAY_TOLERANCE_BUFFER_HOURS = 0.0   # deadline exactly at buffer edge passes

# --- Layer 4 evaluate constants (§4 L4; PS values) ---
DEDICATED_COST_PER_KM = 2.5
EMISSION_FACTOR = 0.05        # kg CO2 per km per kg cargo
PIGGYBACK_EMISSION_FRACTION = 0.10

# --- Layer 4 priority weights ---
PRIORITY_WEIGHTS = {
    "PLATINUM": 1.0,
    "GOLD": 0.75,
    "SILVER": 0.5,
    "STANDARD": 0.25,
}

# --- Layer 4 scoring weights (PS formula §15) ---
# score = w_cost*cost + w_time*time + w_util*util + w_priority*priority + w_co2*co2
# w_risk is kept at 0 by default: risk stays computed + reported as metadata
# (hardening pass) but does not alter the PS score unless explicitly enabled.
W_COST = 0.30
W_TIME = 0.25
W_UTIL = 0.20
W_PRIORITY = 0.15
W_CO2 = 0.10
W_RISK = 0.0  # optional 6th objective; metadata-only at 0

# --- Layer 5 decide ---
TOP_N_OPTIONS = 3

# --- Hub seed ranges (§6) ---
HUB_TRANSFER_TIME_RANGE_H = (0.3, 1.2)
HUB_HANDLING_COST_RANGE_PER_KG = (0.05, 0.25)
# --- Hub seed: real city names (plain-English UI + chaos toasts, PS §22/29) ---
HUB_CITIES = [
    "Delhi", "Jaipur", "Gurugram", "Noida", "Agra",
    "Lucknow", "Kanpur", "Varanasi", "Patna", "Bhopal",
    "Indore", "Nagpur", "Ahmedabad", "Surat", "Vadodara",
    "Pune", "Mumbai", "Amritsar", "Chandigarh", "Jodhpur",
]

# --- Vehicle seed ranges (§6) ---
VEHICLE_CAPACITY_RANGE_KG = (500, 2000)
VEHICLE_USED_FRACTION_RANGE = (0.0, 0.7)
VEHICLE_COST_PER_KM_RANGE = (0.5, 2.0)

# --- Shipment seed ranges (§6) ---
SHIPMENT_WEIGHT_RANGE_KG = (10, 200)
SHIPMENT_VALUE_PER_KG = 12.0
SHIPMENT_DEADLINE_RANGE_H = (6, 72)
PRIORITY_MIX_WEIGHTS = {"PLATINUM": 0.15, "GOLD": 0.25, "SILVER": 0.35, "STANDARD": 0.25}

# --- Default optimizer weights override-able per POST /api/optimize ---
DEFAULT_OPTIMIZE_WEIGHTS = {
    "w_cost": W_COST, "w_time": W_TIME, "w_util": W_UTIL,
    "w_priority": W_PRIORITY, "w_co2": W_CO2, "w_risk": W_RISK,
}

# --- Env overrides (optional, keeps demo flexible) ---
def _env_float(name: str, default: float) -> float:
    v = os.environ.get(name)
    return float(v) if v else default

STALE_SCAN_HOURS = _env_float("STALE_SCAN_HOURS", STALE_SCAN_HOURS)
ROUTE_DEVIATION_KM = _env_float("ROUTE_DEVIATION_KM", ROUTE_DEVIATION_KM)
DELAY_TOLERANCE_BUFFER_HOURS = _env_float("DELAY_TOLERANCE_BUFFER_HOURS", DELAY_TOLERANCE_BUFFER_HOURS)
TICK_SECONDS_REAL = _env_float("TICK_SECONDS_REAL", TICK_SECONDS_REAL)
SIM_HOURS_PER_TICK = _env_float("SIM_HOURS_PER_TICK", SIM_HOURS_PER_TICK)
MAX_CONCURRENT_MISPLACED = int(_env_float("MAX_CONCURRENT_MISPLACED", MAX_CONCURRENT_MISPLACED))

# --- AI layer (§9 of hardening spec) ---
# Deterministic risk model: expert-calibrated logistic weights. Each feature
# contributes weight * feature; sigmoid(bias-corrected sum) => [0,1].
RISK_WEIGHTS = {
    "deadline": 1.2,
    "staleness": 1.0,
    "deviation": 1.4,
    "priority": 0.6,
    "delay": 1.1,
    "bias": 1.8,  # subtracted; neutral features -> risk ~0.45 (MODERATE)
}

# Optional LLM explainer (§ AI). Empty provider => deterministic fallback.
AI_PROVIDER = os.environ.get("AI_PROVIDER", "").strip().lower()  # "openai" supported
AI_API_KEY = os.environ.get("AI_API_KEY", "")
AI_MODEL = os.environ.get("AI_MODEL", "gpt-4o-mini")
AI_TIMEOUT_S = float(os.environ.get("AI_TIMEOUT_S", "8"))
