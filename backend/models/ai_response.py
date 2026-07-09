from pydantic import BaseModel
from typing import Optional


class AIResponse(BaseModel):
    """
    Standard response returned by every AI provider.
    """

    content: str

    model: str

    success: bool = True

    error: Optional[str] = None

    input_tokens: Optional[int] = None

    output_tokens: Optional[int] = None

    total_tokens: Optional[int] = None

    latency_ms: Optional[float] = None