from datetime import datetime

from database.mongodb import db
from models.resume_profile import ResumeProfile


class ResumeService:

    def __init__(self):
        self.collection = db["resumes"]

    def save_resume(
        self,
        user_email: str,
        profile: ResumeProfile
    ) -> str:

        document = {
            "user_email": user_email,
            "created_at": datetime.utcnow(),

            "resume": profile.model_dump(),

            "ats_score": None,
            "resume_score": None,

            "roadmap": [],

            "interview_history": []
        }

        result = self.collection.insert_one(document)

        return str(result.inserted_id)

    def get_resume(self, resume_id: str):

        from bson import ObjectId

        return self.collection.find_one(
            {"_id": ObjectId(resume_id)}
        )

    def get_user_resumes(self, user_email: str):

        return list(
            self.collection.find(
                {"user_email": user_email}
            )
        )

    def delete_resume(self, resume_id: str):

        from bson import ObjectId

        return self.collection.delete_one(
            {"_id": ObjectId(resume_id)}
        )