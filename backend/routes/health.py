from fastapi import APIRouter

from database.mongodb import client

router = APIRouter()


@router.get("/")
def home():

    return {
        "message": "CareerForge AI Running 🚀"
    }


@router.get("/db-test")
def db_test():

    try:

        client.admin.command("ping")

        return {
            "status": "MongoDB Connected ✅"
        }

    except Exception as e:

        return {
            "status": "Connection Failed ❌",
            "error": str(e)
        }