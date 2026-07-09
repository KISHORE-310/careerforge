from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException
from jose import JWTError, jwt

from database.mongodb import db
from models.dsa_progress import DSAProgressUpdate

router = APIRouter(prefix="/dsa", tags=["DSA Tracker"])

SECRET_KEY = "careerforge_secret_key_2026"
ALGORITHM = "HS256"


def get_current_user(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing authorization token."
        )

    token = authorization.replace("Bearer ", "", 1)

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid authorization token."
            )

        return email

    except JWTError as exc:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authorization token."
        ) from exc


@router.get("/progress")
def get_dsa_progress(user_email: str = Depends(get_current_user)):
    progress_collection = db["dsa_progress"]
    records = progress_collection.find({"user_email": user_email})

    progress = {}

    for record in records:
        key = f"{record['topic_slug']}:{record['problem_slug']}"
        progress[key] = {
            "status": record.get("status"),
            "bookmarked": record.get("bookmarked", False),
            "notes": record.get("notes", ""),
            "lastUpdated": record.get("updated_at")
        }

    return {
        "success": True,
        "progress": progress
    }


@router.put("/progress/{topic_slug}/{problem_slug}")
def update_dsa_progress(
    topic_slug: str,
    problem_slug: str,
    payload: DSAProgressUpdate,
    user_email: str = Depends(get_current_user)
):
    progress_collection = db["dsa_progress"]

    update_data = {
        "updated_at": datetime.utcnow().isoformat()
    }

    if payload.status is not None:
        update_data["status"] = payload.status

    if payload.bookmarked is not None:
        update_data["bookmarked"] = payload.bookmarked

    if payload.notes is not None:
        update_data["notes"] = payload.notes

    progress_collection.update_one(
        {
            "user_email": user_email,
            "topic_slug": topic_slug,
            "problem_slug": problem_slug
        },
        {
            "$set": update_data,
            "$setOnInsert": {
                "user_email": user_email,
                "topic_slug": topic_slug,
                "problem_slug": problem_slug,
                "created_at": datetime.utcnow().isoformat()
            }
        },
        upsert=True
    )

    return {
        "success": True,
        "message": "DSA progress updated."
    }


@router.delete("/progress")
def reset_dsa_progress(user_email: str = Depends(get_current_user)):
    progress_collection = db["dsa_progress"]
    progress_collection.delete_many({"user_email": user_email})

    return {
        "success": True,
        "message": "DSA progress reset."
    }
