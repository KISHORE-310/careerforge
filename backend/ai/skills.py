import json
import re
from ai.providers.gemini import GeminiProvider

class RoleSkillsGenerator:
    def __init__(self):
        self.provider = GeminiProvider()

    def generate_skills(self, target_role: str) -> list:
        if not target_role:
            return []
            
        prompt = f"""
        You are a technical recruiting expert. Given the target role '{target_role}', generate a list of the 8-12 most important technical skills, tools, programming languages, or concepts that are highly relevant to this role.
        Return ONLY a raw JSON array of strings (e.g., ["Python", "SQL", "Pandas"]). No markdown code blocks, no other text, just the raw JSON.
        """
        response = self.provider.generate(prompt)
        if not response.success:
            raise RuntimeError(response.error or "AI skill generation failed.")
        
        try:
            content = response.content.strip()
            # Remove markdown blocks if present
            if content.startswith("```"):
                content = re.sub(r"^```(?:json)?\n", "", content)
                content = re.sub(r"\n```$", "", content)
            
            parsed = json.loads(content.strip())
            if isinstance(parsed, list):
                return [str(item) for item in parsed]
            return []
        except Exception as exc:
            raise RuntimeError("AI returned invalid skill data.") from exc


class RoleRoadmapGenerator:
    def __init__(self):
        self.provider = GeminiProvider()

    def generate_roadmap(self, target_role: str) -> list:
        if not target_role:
            return []
            
        prompt = f"""
        You are a career development assistant. Create a structured 6-week learning roadmap to master the target role '{target_role}'.
        Format the output exactly as a JSON array of objects, where each object has:
        - "week": integer (1 to 6)
        - "title": short title for the week (e.g., "SQL & Databases")
        - "description": brief summary of what to learn and build that week
        
        Example structure:
        [
          {{"week": 1, "title": "Skill A", "description": "Learn A"}},
          ...
        ]
        
        Return ONLY the raw JSON array. No markdown code blocks, no other text.
        """
        response = self.provider.generate(prompt)
        if not response.success:
            raise RuntimeError(response.error or "AI roadmap generation failed.")
        
        try:
            content = response.content.strip()
            if content.startswith("```"):
                content = re.sub(r"^```(?:json)?\n", "", content)
                content = re.sub(r"\n```$", "", content)
            
            parsed = json.loads(content.strip())
            if isinstance(parsed, list):
                return parsed
            return []
        except Exception as exc:
            raise RuntimeError("AI returned invalid roadmap data.") from exc
