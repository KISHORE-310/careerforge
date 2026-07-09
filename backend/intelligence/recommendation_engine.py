from models.resume_profile import ResumeProfile


class RecommendationEngine:

    def generate(self, profile: ResumeProfile):

        recommendations = []

        personal = profile.personal_info

        # -----------------------
        # Personal Information
        # -----------------------

        if not personal.linkedin:
            recommendations.append({
                "priority": "High",
                "title": "Add LinkedIn Profile",
                "description": "Recruiters often check LinkedIn profiles. Add your LinkedIn URL to improve credibility."
            })

        if not personal.github:
            recommendations.append({
                "priority": "High",
                "title": "Add GitHub Profile",
                "description": "Showcase your coding projects by adding your GitHub profile."
            })

        if not profile.projects:
            recommendations.append({
                "priority": "High",
                "title": "Add Personal Projects",
                "description": "Include at least 2 strong projects that demonstrate your technical skills."
            })

        if len(profile.technical_skills) < 10:
            recommendations.append({
                "priority": "Medium",
                "title": "Expand Technical Skills",
                "description": "Add more relevant technical skills for your target role."
            })

        if len(profile.certifications) == 0:
            recommendations.append({
                "priority": "Low",
                "title": "Earn Certifications",
                "description": "Relevant certifications can strengthen your resume."
            })

        if not profile.summary:
            recommendations.append({
                "priority": "Medium",
                "title": "Improve Professional Summary",
                "description": "Write a concise summary highlighting your experience, skills, and career goals."
            })

        return recommendations