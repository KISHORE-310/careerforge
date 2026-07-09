from fastapi import APIRouter

from database.mongodb import db
from models.user import User
from models.login import LoginUser

from jose import jwt
from datetime import datetime, timedelta

import bcrypt

router = APIRouter()

SECRET_KEY = "careerforge_secret_key_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


@router.post("/signup")
def signup(user: User):

    users_collection = db["users"]

    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        return {
            "success": False,
            "message": "Email already exists."
        }

    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    )

    users_collection.insert_one({
        "full_name": user.full_name,
        "email": user.email,
        "password": hashed_password.decode("utf-8")
    })

    return {
        "success": True,
        "message": "Account created successfully!"
    }


@router.post("/login")
def login(user: LoginUser):

    users_collection = db["users"]

    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if not existing_user:
        return {
            "success": False,
            "message": "Invalid email or password."
        }

    if not bcrypt.checkpw(
        user.password.encode("utf-8"),
        existing_user["password"].encode("utf-8")
    ):
        return {
            "success": False,
            "message": "Invalid email or password."
        }

    access_token = create_access_token(
        {
            "sub": existing_user["email"]
        }
    )

    return {
        "success": True,
        "message": "Login successful!",
        "access_token": access_token,
        "token_type": "bearer"
    }