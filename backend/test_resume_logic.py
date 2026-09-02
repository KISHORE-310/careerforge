import unittest

from intelligence.ats_score import ATSScoreEngine
from intelligence.recommendation_engine import RecommendationEngine
from intelligence.resume_score import ResumeScoreEngine
from intelligence.skill_gap_engine import SkillGapEngine
from models.resume_profile import PersonalInfo, Project, ResumeProfile


class ResumeLogicTests(unittest.TestCase):
    def setUp(self):
        self.profile = ResumeProfile(
            personal_info=PersonalInfo(
                full_name="Test Candidate",
                email="candidate@example.com",
                phone="555-0100",
                github="https://github.com/candidate",
            ),
            projects=[
                Project(
                    title="API platform",
                    description="Built an API",
                    technologies=["Python", "FastAPI"],
                )
            ],
            technical_skills=["Python", "SQL", "Docker", "Git"],
            summary="Backend engineer building reliable services.",
        )

    def test_resume_score_is_derived_from_profile(self):
        result = ResumeScoreEngine().calculate_score(self.profile)
        self.assertGreater(result["resume_score"], 0)
        self.assertEqual(result["resume_score"], sum(result["breakdown"].values()))

    def test_known_role_scores_real_profile_skills(self):
        ats = ATSScoreEngine().calculate_score(self.profile, "Backend Developer")
        gap = SkillGapEngine().analyze(self.profile, "Backend Developer")
        self.assertEqual(ats["ats_score"], round(len(ats["matched_keywords"]) / 9 * 100))
        self.assertEqual(gap["readiness"], int(len(gap["matched_skills"]) / 10 * 100))
        self.assertIn("Spring Boot", ats["missing_keywords"])

    def test_recommendations_reflect_missing_profile_data(self):
        result = RecommendationEngine().generate(self.profile)
        titles = {item["title"] for item in result}
        self.assertIn("Add LinkedIn Profile", titles)
        self.assertNotIn("Add GitHub Profile", titles)


if __name__ == "__main__":
    unittest.main()