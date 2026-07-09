import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# =====================================
# MongoDB
# =====================================

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# =====================================
# JWT
# =====================================

SECRET_KEY = os.getenv("SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

# =====================================
# Gemini AI
# =====================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-2.5-flash"
)
print("Loaded Gemini Model:", GEMINI_MODEL)

# =====================================
# Application
# =====================================

APP_NAME = os.getenv("APP_NAME", "CareerForge AI")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"