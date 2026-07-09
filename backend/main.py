from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.health import router as health_router
from routes.analysis import router as analysis_router
from routes.auth import router as auth_router
from routes.dsa import router as dsa_router
from routes.resume import router as resume_router

app = FastAPI(
    title="CareerForge AI",
    version="1.0.0"
)

# =====================================
# CORS
# =====================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================
# Routers
# =====================================

app.include_router(health_router)
app.include_router(analysis_router)
app.include_router(auth_router)
app.include_router(dsa_router)
app.include_router(resume_router)
