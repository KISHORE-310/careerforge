"""AI layer for SH-205.

The optimizer stays deterministic and rule-based (correctness first). This
package adds *credible* AI capabilities on top:

- ``risk_engine``  : deterministic disruption-risk scoring for shipments
                     (feature-based logistic model, weights fixed in config;
                     no randomness, fully explainable)
- ``explainer``    : optional LLM-powered natural-language operational
                     summaries. Enabled only when ``AI_PROVIDER`` and
                     ``AI_API_KEY`` are configured; falls back to the
                     deterministic template explainer otherwise.

The AI NEVER bypasses hard logistics constraints: the optimizer's ranked
candidates are the only actionable decisions; AI output is advisory text.
"""

from .risk_engine import assess_shipment_risk, assess_fleet_risk, RISK_LEVELS
from .explainer import (
    ai_status,
    explain_recovery_decision,
    explain_system_state,
    llm_explain_recovery,
)

__all__ = [
    "assess_shipment_risk",
    "assess_fleet_risk",
    "RISK_LEVELS",
    "explain_recovery_decision",
    "explain_system_state",
    "llm_explain_recovery",
    "ai_status",
]
