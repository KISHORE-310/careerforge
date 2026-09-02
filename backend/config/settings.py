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

SECRET_KEY = os.getenv("SECRET_KEY") or os.getenv("SESSION_SECRET")
if not SECRET_KEY:
    raise RuntimeError(
        "Set SECRET_KEY or SESSION_SECRET before starting the backend."
    )
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
MAX_RESUME_SIZE_MB = int(os.getenv("MAX_RESUME_SIZE_MB", "10"))

# =====================================
# Application
# =====================================

APP_NAME = os.getenv("APP_NAME", "CareerForge AI")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

missing_config = [
    name
    for name, value in {
        "MONGODB_URI": MONGODB_URI,
        "DATABASE_NAME": DATABASE_NAME,
        "GEMINI_API_KEY": GEMINI_API_KEY,
    }.items()
    if not value
]
if missing_config:
    raise RuntimeError(
        "Missing required backend configuration: "
        + ", ".join(missing_config)
    )