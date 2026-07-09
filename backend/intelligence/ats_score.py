from models.resume_profile import ResumeProfile
from ai.skills import RoleSkillsGenerator


class ATSScoreEngine:

    ROLE_SKILLS = {
        "Backend Developer": [
            "Java",
            "Spring Boot",
            "SQL",
            "Docker",
            "Git",
            "REST API",
            "AWS",
            "MongoDB",
            "Redis"
        ],

        "Frontend Developer": [
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "Redux",
            "TypeScript",
            "Git"
        ],

        "Full Stack Developer": [
            "Java",
            "Spring Boot",
            "React",
            "SQL",
            "MongoDB",
            "Docker",
            "Git",
            "REST API"
        ]
    }

    def calculate_score(
        self,
        profile: ResumeProfile,
        target_role: str = "Backend Developer"
    ):

        required = self.ROLE_SKILLS.get(target_role)
        if required is None:
            generator = RoleSkillsGenerator()
            required = generator.generate_skills(target_role)
            # Cache the generated skills
            self.ROLE_SKILLS[target_role] = required


        resume_skills = [
            skill.lower()
            for skill in profile.technical_skills
        ]

        matched = []
        missing = []

        for skill in required:

            if skill.lower() in resume_skills:
                matched.append(skill)
            else:
                missing.append(skill)

        if len(required) == 0:
            ats_score = 0
        else:
            ats_score = round(
                (len(matched) / len(required)) * 100
            )

        return {
            "target_role": target_role,
            "ats_score": ats_score,
            "matched_keywords": matched,
            "missing_keywords": missing
        }