"""Optional LLM-powered operational explanations with deterministic fallback.

Design (hardening spec §9):
- The optimizer's decision is ALWAYS the source of truth; the LLM only turns
  its machine-readable ``score_breakdown`` into operator-friendly prose.
- Enabled only when AI_PROVIDER + AI_API_KEY are set in the environment.
- Without credentials, or on any LLM failure/timeout, we serve the
  deterministic template explainer so the demo never breaks.
- We never send secrets or PII; payloads are operational numbers only.
- The AI NEVER bypasses hard constraints: it produces TEXT, never actions.
"""
from __future__ import annotations

import json
import logging
import urllib.request
import urllib.error
from typing import Dict, List, Optional

from .. import config
from .risk_engine import RiskAssessment, risk_level

log = logging.getLogger("sh205.ai")


# ---------------------------------------------------------------- deterministic

def _fmt_hours(h: float) -> str:
    if h <= -0.05:
        return f"{abs(h):.1f}h early"
    if h >= 0.05:
        return f"{h:.1f}h late"
    return "on time"


def explain_recovery_decision(
    option: Dict,
    shipment: Dict,
    all_options: Optional[List[Dict]] = None,
    world_state: Optional[Dict[str, Dict]] = None,
) -> str:
    """Deterministic, template-based explanation from real computed numbers.

    ``option`` is a RecoveryOption-shaped dict (chosen or candidate);
    ``shipment`` is a Shipment-shaped dict; ``world_state`` optionally maps
    {"hubs": {id: {"name": ...}}, "vehicles": {id: {"type": ...}}} so names
    can be rendered in plain English (PS §16). Falls back to raw ids.
    """
    hubs = (world_state or {}).get("hubs", {})
    vehicles = (world_state or {}).get("vehicles", {})

    def hub_name(hid: str) -> str:
        return hubs.get(hid, {}).get("name", hid)

    def veh_label(vid: str) -> str:
        v = vehicles.get(vid, {})
        kind = {"TRUCK": "Truck", "VAN": "Van", "RAIL": "Train", "AIR": "Plane"}.get(
            v.get("type", ""), v.get("type", ""))
        return f"{kind} {vid}".strip()

    veh_ids = option.get("vehicle_ids", [])
    pickup = shipment.get("recovery_pickup_hub_id") or shipment.get("origin_hub_id", "?")
    dest = shipment.get("destination_hub_id", "?")
    transfers = list(option.get("transfer_hub_ids", []))
    cost_saved = option.get("cost_saved_usd", 0.0)
    co2_saved = option.get("co2_saved_kg", 0.0)
    delay = option.get("estimated_delay_hours", 0.0)
    util = option.get("utilization_gain", 0.0)
    rank = option.get("rank", 1)

    # --- plain-English body (PS §16) ---
    if len(veh_ids) > 1:
        intro = (f"{veh_label(veh_ids[0])} picks the package up and hands it to "
                 f"{veh_label(veh_ids[1])} at {hub_name(transfers[0]) if transfers else 'a transfer stop'}.")
    else:
        intro = f"{veh_label(veh_ids[0]) if veh_ids else 'A vehicle'} takes the package straight to {hub_name(dest)}."
    if delay <= 0:
        arrive_txt = f"It arrives {abs(delay):.1f} hours early."
    else:
        arrive_txt = f"It arrives {delay:.1f} hours late."
    lines = [
        intro,
        arrive_txt,
        f"You save ${cost_saved:,.0f} compared to sending a dedicated vehicle.",
        f"You use {round(util * 100)}% of the empty space.",
        f"You save {co2_saved:,.1f}kg of CO2.",
    ]

    # --- technical traceability appended (score + breakdown) ---
    breakdown = option.get("score_breakdown", {})
    lines.append(
        f"[{option.get('strategy_label', 'Plan')} | score {option.get('score', 0):.3f} | "
        + " ".join(f"{k}={v:.2f}" for k, v in breakdown.items()
                   if isinstance(v, (int, float)) and (k.endswith("_score") or k == "priority_weight"))
        + "]"
    )

    if all_options:
        better = [o for o in all_options if o.get("rank", 99) < rank]
        if better:
            b = better[0]
            lines.append(
                f"Ranked below plan {b.get('rank')}: cost delta "
                f"${option.get('estimated_cost_usd', 0) - b.get('estimated_cost_usd', 0):,.0f}, "
                f"delay delta {option.get('estimated_delay_hours', 0) - b.get('estimated_delay_hours', 0):+.1f}h."
            )
    return "\n".join(lines)


def explain_system_state(
    metrics: Dict,
    top_risks: Optional[List[RiskAssessment]] = None,
) -> str:
    """Deterministic 2-3 sentence operational summary from live metrics."""
    parts = [
        f"{metrics.get('active_shipments', 0)} shipments in motion, "
        f"{metrics.get('misplaced_count', 0)} misplaced, "
        f"{metrics.get('recovering_count', 0)} recovering, "
        f"{metrics.get('recovered_count', 0)} recovered."
    ]
    if metrics.get("total_cost_saved_usd"):
        parts.append(f"Recovery program has saved ${metrics['total_cost_saved_usd']:,.0f} "
                     f"and {metrics.get('total_co2_saved_kg', 0):,.0f} kg CO2 so far.")
    if top_risks:
        t = top_risks[0]
        parts.append(f"Highest current risk: {t.shipment_id} ({t.level}, {t.risk:.2f}).")
    return " ".join(parts)


# ---------------------------------------------------------------- LLM (optional)

def ai_status() -> Dict:
    """Report whether the LLM layer is active (never raises)."""
    enabled = bool(config.AI_PROVIDER and config.AI_API_KEY)
    return {
        "enabled": enabled,
        "provider": config.AI_PROVIDER or None,
        "model": config.AI_MODEL if enabled else None,
        "fallback": "deterministic-template",
    }


def _call_openai(prompt: str, system: str) -> Optional[str]:
    """Minimal OpenAI chat-completions call. Returns None on any failure."""
    url = "https://api.openai.com/v1/chat/completions"
    body = json.dumps({
        "model": config.AI_MODEL,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 300,
        "temperature": 0.2,
    }).encode()
    req = urllib.request.Request(
        url, data=body, method="POST",
        headers={
            "Authorization": f"Bearer {config.AI_API_KEY}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=config.AI_TIMEOUT_S) as resp:
            data = json.loads(resp.read().decode())
            return data["choices"][0]["message"]["content"].strip()
    except (urllib.error.URLError, TimeoutError, KeyError, json.JSONDecodeError, OSError) as exc:
        log.warning("LLM call failed, using deterministic fallback: %s", exc)
        return None


def llm_explain_recovery(
    option: Dict,
    shipment: Dict,
    all_options: Optional[List[Dict]] = None,
    world_state: Optional[Dict[str, Dict]] = None,
) -> Dict:
    """Try LLM prose; always return {'text': ..., 'source': 'llm'|'template'}."""
    base = explain_recovery_decision(option, shipment, all_options, world_state)
    if not (config.AI_PROVIDER == "openai" and config.AI_API_KEY):
        return {"text": base, "source": "template"}

    system = (
        "You are a logistics operations explainer for the SH-205 recovery system. "
        "Given structured optimization output, write a concise 2-4 sentence brief "
        "for a duty manager. Use ONLY the numbers provided; never invent figures. "
        "State why this option was chosen and the key trade-off."
    )
    payload = json.dumps({"chosen": option, "shipment": shipment,
                          "alternatives": (all_options or [])[:3]}, default=str)
    text = _call_openai(payload, system)
    if text is None:
        return {"text": base, "source": "template"}
    return {"text": text, "source": "llm"}
