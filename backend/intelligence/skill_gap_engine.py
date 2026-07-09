from models.resume_profile import ResumeProfile
from ai.skills import RoleSkillsGenerator


class SkillGapEngine:

    ROLE_SKILLS = {

        "Backend Developer": [

            "Java",
            "Spring Boot",
            "REST API",
            "SQL",
            "Git",
            "Docker",
            "AWS",
            "Microservices",
            "JUnit",
            "Maven"

        ],

        "Frontend Developer": [

            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "TypeScript",
            "Redux",
            "Tailwind CSS",
            "Next.js",
            "Git",
            "Responsive Design"

        ]

    }

    def analyze(
        self,
        profile: ResumeProfile,
        target_role="Backend Developer"
    ):

        required = self.ROLE_SKILLS.get(target_role)
        if required is None:
            generator = RoleSkillsGenerator()
            required = generator.generate_skills(target_role)
            # Cache the generated skills
            self.ROLE_SKILLS[target_role] = required


        user_skills = [
            skill.lower()
            for skill in profile.technical_skills
        ]

        matched = []
        missing = []

        for skill in required:

            found = False

            for user_skill in user_skills:

                if skill.lower() in user_skill:

                    found = True
                    break

            if found:
                matched.append(skill)
            else:
                missing.append(skill)

        readiness = 0

        if required:
            readiness = int(
                len(matched) / len(required) * 100
            )

        return {

            "target_role": target_role,

            "matched_skills": matched,

            "missing_skills": missing,

            "readiness": readiness

        }