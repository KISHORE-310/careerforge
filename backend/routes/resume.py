from bson import ObjectId
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
import fitz

from ai.parsers.resume_parser import ResumeParser
from services.resume_service import ResumeService

from intelligence.resume_score import ResumeScoreEngine
from intelligence.ats_score import ATSScoreEngine
from intelligence.recommendation_engine import RecommendationEngine
from intelligence.skill_gap_engine import SkillGapEngine
from ai.roadmap.roadmap_engine import RoadmapEngine
from auth.dependencies import get_current_user_email
from config.settings import MAX_RESUME_SIZE_MB
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    target_role: str = Form(...),
    user_email: str = Depends(get_current_user_email),
):

    try:
        if not target_role.strip():
            raise HTTPException(
                status_code=400,
                detail="Choose a target role before uploading.",
            )

        # ------------------------------------
        # Read PDF
        # ------------------------------------

        if file.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Please upload a PDF resume.")

        pdf_bytes = await file.read()
        if not pdf_bytes:
            raise HTTPException(status_code=400, detail="The uploaded PDF is empty.")
        if len(pdf_bytes) > MAX_RESUME_SIZE_MB * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail=f"Resume files must be smaller than {MAX_RESUME_SIZE_MB} MB.",
            )

        try:
            with fitz.open(stream=pdf_bytes, filetype="pdf") as document:
                extracted_text = "\n".join(page.get_text() for page in document).strip()
        except fitz.FileDataError as exc:
            raise HTTPException(status_code=400, detail="The uploaded file is not a valid PDF.") from exc
        if not extracted_text:
            raise HTTPException(
                status_code=422,
                detail="No readable text was found in this PDF.",
            )

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
            user_email=user_email,
            profile=profile,
            target_role=target_role,
            original_filename=file.filename,
            analysis={
                "resume_score": resume_score,
                "ats_score": ats_score,
                "recommendations": recommendations,
                "skill_gap": skill_gap,
                "roadmap": roadmap,
            },
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
        if isinstance(e, HTTPException):
            raise
        logger.exception("Resume analysis failed for user %s", user_email)
        raise HTTPException(
            status_code=422,
            detail="Resume analysis failed. Please try another PDF or try again later.",
        ) from e


def serialize_resume(document: dict | None):
    if not document:
        return None
    analysis = document.get("analysis", {})
    return {
        "success": True,
        "resume_id": str(document["_id"]) if isinstance(document.get("_id"), ObjectId) else document.get("_id"),
        "created_at": document.get("created_at").isoformat()
        if hasattr(document.get("created_at"), "isoformat")
        else document.get("created_at"),
        "original_filename": document.get("original_filename"),
        "target_role": document.get("target_role"),
        "profile": document.get("resume", {}),
        **analysis,
    }


@router.get("/resume/latest")
def get_latest_resume(user_email: str = Depends(get_current_user_email)):
    document = ResumeService().get_latest_user_resume(user_email)
    return serialize_resume(document) or {
        "success": True,
        "resume": None,
    }


@router.delete("/resume/{resume_id}")
def delete_resume(
    resume_id: str,
    user_email: str = Depends(get_current_user_email),
):
    try:
        object_id = ObjectId(resume_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid resume id.") from exc

    result = ResumeService().collection.delete_one(
        {"_id": object_id, "user_email": user_email}
    )
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return {"success": True, "message": "Resume deleted."}