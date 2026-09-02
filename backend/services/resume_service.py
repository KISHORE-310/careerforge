from datetime import datetime

from database.mongodb import db
from models.resume_profile import ResumeProfile


class ResumeService:

    def __init__(self):
        self.collection = db["resumes"]

    def save_resume(
        self,
        user_email: str,
        profile: ResumeProfile,
        target_role: str | None = None,
        analysis: dict | None = None,
        original_filename: str | None = None,
    ) -> str:

        document = {
            "user_email": user_email,
            "created_at": datetime.utcnow(),
            "resume": profile.model_dump(),
            "target_role": target_role,
            "original_filename": original_filename,
            "analysis": analysis or {},
        }

        result = self.collection.insert_one(document)

        return str(result.inserted_id)

    def get_resume(self, resume_id: str, user_email: str | None = None):

        from bson import ObjectId

        query = {"_id": ObjectId(resume_id)}
        if user_email:
            query["user_email"] = user_email
        return self.collection.find_one(query)

    def get_user_resumes(self, user_email: str):

        return list(
            self.collection.find(
                {"user_email": user_email}
            )
        )

    def get_latest_user_resume(self, user_email: str):
        return self.collection.find_one(
            {"user_email": user_email},
            sort=[("created_at", -1)],
        )

    def delete_resume(self, resume_id: str, user_email: str | None = None):

        from bson import ObjectId

        query = {"_id": ObjectId(resume_id)}
        if user_email:
            query["user_email"] = user_email
        return self.collection.delete_one(query)