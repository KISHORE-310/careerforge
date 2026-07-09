import time

from google import genai
from google.genai import types

from config.settings import (
    GEMINI_API_KEY,
    GEMINI_MODEL
)

from models.ai_response import AIResponse


class GeminiProvider:

    def __init__(self):
        self.client = genai.Client(
            api_key=GEMINI_API_KEY
        )
        self.model = GEMINI_MODEL

    def generate(self, prompt: str) -> AIResponse:

        start = time.time()

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3
                )
            )

            latency = (time.time() - start) * 1000

            return AIResponse(
                content=response.text,
                model=self.model,
                success=True,
                latency_ms=latency
            )

        except Exception as e:

            return AIResponse(
                content="",
                model=self.model,
                success=False,
                error=str(e)
            )