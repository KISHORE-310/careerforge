import json

from ai.providers.gemini import GeminiProvider
from ai.prompts.resume_prompt import RESUME_PARSE_PROMPT
from ai.normalizers.resume_normalizer import ResumeNormalizer

from models.resume_profile import ResumeProfile


class ResumeParser:

    def __init__(self):

        self.provider = GeminiProvider()
        self.normalizer = ResumeNormalizer()

    def parse_resume(self, resume_text: str) -> ResumeProfile:

        prompt = RESUME_PARSE_PROMPT.replace(
            "{resume_text}",
            resume_text
        )

        response = self.provider.generate(prompt)

        if not response.success:
            raise Exception(response.error)

        data = json.loads(response.content)

        # Normalize Gemini output
        data = self.normalizer.normalize(data)

        # Validate using Pydantic
        profile = ResumeProfile.model_validate(data)

        return profile