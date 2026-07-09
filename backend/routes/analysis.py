from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/analyze")
def analyze(role: str = Query("")):

    if role == "Data Scientist":

        return {
            "current_skills": [
                "Python",
                "SQL"
            ],
            "missing_skills": [
                "Statistics",
                "Pandas",
                "Machine Learning"
            ],
            "readiness_score": 55,
            "roadmap": [
                "Month 1 - Statistics",
                "Month 2 - Pandas",
                "Month 3 - Machine Learning"
            ]
        }

    return {
        "current_skills": [
            "Python",
            "Java",
            "SQL"
        ],
        "missing_skills": [
            "Machine Learning",
            "Docker",
            "MLOps"
        ],
        "readiness_score": 65,
        "roadmap": [
            "Month 1 - Statistics",
            "Month 2 - Machine Learning",
            "Month 3 - Docker"
        ]
    }