from fastapi import APIRouter, UploadFile, File, Form
import fitz

from ai.parsers.resume_parser import ResumeParser
from services.resume_service import ResumeService

from intelligence.resume_score import ResumeScoreEngine
from intelligence.ats_score import ATSScoreEngine
from intelligence.recommendation_engine import RecommendationEngine
from intelligence.skill_gap_engine import SkillGapEngine
from ai.roadmap.roadmap_engine import RoadmapEngine

router = APIRouter()


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    target_role: str = Form(...)
):

    try:

        # ------------------------------------
        # Read PDF
        # ------------------------------------

        pdf_bytes = await file.read()

        document = fitz.open(
            stream=pdf_bytes,
            filetype="pdf"
        )

        extracted_text = ""

        for page in document:
            extracted_text += page.get_text()

        document.close()

        # ------------------------------------
        # Parse Resume
        # ------------------------------------

        parser = ResumeParser()

        profile = parser.parse_resume(
            extracted_text
        )

        # ------------------------------------
        # Resume Score
        # ------------------------------------

        resume_score_engine = ResumeScoreEngine()

        resume_score = resume_score_engine.calculate_score(
            profile
        )

        # ------------------------------------
        # ATS Score
        # ------------------------------------

        ats_engine = ATSScoreEngine()

        ats_score = ats_engine.calculate_score(
            profile=profile,
            target_role=target_role
        )

        # ------------------------------------
        # Recommendations
        # ------------------------------------

        recommendation_engine = RecommendationEngine()

        recommendations = recommendation_engine.generate(
            profile
        )

        # ------------------------------------
        # Skill Gap
        # ------------------------------------

        skill_gap_engine = SkillGapEngine()

        skill_gap = skill_gap_engine.analyze(
            profile=profile,
            target_role=target_role
        )

        # ------------------------------------
        # Learning Roadmap
        # ------------------------------------

        roadmap_engine = RoadmapEngine()

        roadmap = roadmap_engine.generate(
            target_role
        )

        # ------------------------------------
        # Save Resume
        # ------------------------------------

        service = ResumeService()

        resume_id = service.save_resume(
            user_email="demo@careerforge.ai",
            profile=profile
        )

        # ------------------------------------
        # Response
        # ------------------------------------

        return {

            "success": True,

            "message": "Resume uploaded successfully.",

            "resume_id": resume_id,

            "target_role": target_role,

            "profile": profile.model_dump(),

            "resume_score": resume_score,

            "ats_score": ats_score,

            "recommendations": recommendations,

            "skill_gap": skill_gap,

            "roadmap": roadmap

        }

    except Exception as e:

        return {

            "success": False,

            "message": str(e)

        }