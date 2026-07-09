from models.resume_profile import ResumeProfile


class ResumeScoreEngine:

    def calculate_score(self, profile: ResumeProfile):

        score = 0
        breakdown = {}

        strengths = []
        weaknesses = []

        # -----------------------
        # Personal Information
        # -----------------------

        personal = profile.personal_info

        personal_score = 0

        if personal.full_name:
            personal_score += 3
        else:
            weaknesses.append("Add your full name")

        if personal.email:
            personal_score += 3
        else:
            weaknesses.append("Add your email")

        if personal.phone:
            personal_score += 3
        else:
            weaknesses.append("Add your phone number")

        if personal.linkedin:
            personal_score += 3
            strengths.append("LinkedIn profile added")
        else:
            weaknesses.append("Add your LinkedIn profile")

        if personal.github:
            personal_score += 4
            strengths.append("GitHub profile added")
        else:
            weaknesses.append("Add your GitHub profile")

        score += personal_score
        breakdown["personal_information"] = personal_score

        # -----------------------
        # Summary
        # -----------------------

        summary_score = 0

        if profile.summary:

            words = len(profile.summary.split())

            if words >= 40:
                summary_score = 10
                strengths.append("Excellent professional summary")

            elif words >= 20:
                summary_score = 7
                strengths.append("Good professional summary")

            else:
                summary_score = 4
                weaknesses.append("Expand your professional summary")

        else:
            weaknesses.append("Add a professional summary")

        score += summary_score
        breakdown["summary"] = summary_score

        # -----------------------
        # Education
        # -----------------------

        education_score = min(len(profile.education) * 5, 10)

        if education_score > 0:
            strengths.append("Education section present")
        else:
            weaknesses.append("Add your education details")

        score += education_score
        breakdown["education"] = education_score

        # -----------------------
        # Experience
        # -----------------------

        experience_score = min(len(profile.experience) * 10, 20)

        if experience_score >= 10:
            strengths.append("Strong work experience")
        else:
            weaknesses.append("Add work experience or internships")

        score += experience_score
        breakdown["experience"] = experience_score

        # -----------------------
        # Projects
        # -----------------------

        project_score = min(len(profile.projects) * 5, 20)

        if project_score > 0:
            strengths.append(f"{len(profile.projects)} project(s) listed")
        else:
            weaknesses.append("Add personal or academic projects")

        score += project_score
        breakdown["projects"] = project_score

        # -----------------------
        # Technical Skills
        # -----------------------

        skill_score = min(len(profile.technical_skills), 15)

        if skill_score >= 10:
            strengths.append("Strong technical skill set")
        else:
            weaknesses.append("Add more technical skills")

        score += skill_score
        breakdown["technical_skills"] = skill_score

        # -----------------------
        # Certifications
        # -----------------------

        certification_score = min(
            len(profile.certifications) * 2,
            5
        )

        if certification_score > 0:
            strengths.append("Certifications added")

        score += certification_score
        breakdown["certifications"] = certification_score

        # -----------------------
        # Grade
        # -----------------------

        if score >= 90:
            grade = "Excellent"

        elif score >= 75:
            grade = "Good"

        elif score >= 60:
            grade = "Needs Improvement"

        else:
            grade = "Poor"

        return {
            "resume_score": score,
            "grade": grade,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "breakdown": breakdown
        }